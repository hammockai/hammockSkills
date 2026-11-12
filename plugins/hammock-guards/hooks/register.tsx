import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow, Ficha, Fired, Limit, Peer, Snapshot, Tokens } from '../types'

// Guardias de Hammock AI (2026-11).
// 1. Resumen: si hubo trabajo en el turno y el handoff de la sesión lleva más
//    de 20 min sin cambios, pide una vez anotar (una línea por hecho).
// 2. Límites y contexto: toast al 80 %; al 90 % pide anotar y pausar (una vez por ventana).
//    El cierre ordenado lo pide el contexto al 60 % (una vez por sesión): un bloque de 5 h
//    se renueva, la ventana de contexto no.
// 3. Monitor de uso: status line (5 h, semana, contexto, cuántos trabajan),
//    panel /uso con las pestañas y los subagentes, y aviso cuando trabajan más
//    de 2 a la vez. Las otras pestañas se ven por su ficha en ~/.claude/hammock-usage/
//    (la plataforma no entrega el uso de otras sesiones).

const STALE_MS = 20 * 60 * 1000
const WARN_AT = 80
const CLOSE_AT = 90
const WORK_TOOLS = new Set(['Edit', 'Write', 'Bash', 'NotebookEdit'])
const CLOSE_GAP_MS = 30 * 60 * 1000 // tope: un pedido de cierre o pausa cada 30 min
const CTX_CLOSE_AT = 60 // una sesión se cierra por su ventana de contexto, no por el bloque de 5 h
// Nombre corto y suelto: nada de "x/prompts/handoff/AAAA…" pegado en una URL.
const HANDOFF_RE = /(?:^|[\s"'`(/\\:])prompts\/handoff\/([\w-]{1,40}\.md)(?![\w.-])/i
const TYPED = new Set(['composer', 'bridge', 'sdk']) // lo que escribe la persona
const BRIDGE = 'prompts/handoff/bridge.md'
const LABEL: Record<string, string> = { five_hour: '5 h', seven_day: 'semana' }

// Monitor
const HEARTBEAT_MS = 60 * 1000 // latido de la ficha
const WRITE_GAP_MS = 20 * 1000 // tope de escrituras por mediciones
// Viva = latido en los últimos 2½ min (el latido es cada 60 s). Cerrar una pestaña de VS Code no avisa
// (session.end no llega), así que una ficha más vieja es de una pestaña cerrada: no se muestra.
const ALIVE_MS = 150 * 1000
const GONE_MS = 30 * 60 * 1000 // sin latido: ya no se muestra y su archivo se puede reusar
const MAX_WORKING = 2 // recomendado: máx. 2 trabajando a la vez
const MAX_FILES = 24 // fichas leídas como máximo
const ACTIVE = new Set(['pending', 'running', 'waiting'])
const PANE = 'hammock-uso'

const handoffRef = { plugin: 'hammock-guards', key: 'handoff' } as const
const titleRef = { plugin: 'hammock-guards', key: 'title' } as const
// Evidencia: qué recibió el plugin del título (va en la ficha como titleSrc).
const titleEvtRef = { plugin: 'hammock-guards', key: 'titleEvt' } as const
const nudgeRef = { plugin: 'hammock-guards', key: 'lastNudgeAt' } as const
const warnedRef = { plugin: 'hammock-guards', key: 'warned' } as const
const closedRef = { plugin: 'hammock-guards', key: 'closed' } as const
const ctxClosedRef = { plugin: 'hammock-guards', key: 'ctxClosed' } as const
const slotRef = { plugin: 'hammock-guards', key: 'slot' } as const
const busyRef = { plugin: 'hammock-guards', key: 'busy' } as const
const snapRef = { plugin: 'hammock-guards', key: 'snap' } as const
const tokensRef = { plugin: 'hammock-guards', key: 'tokens' } as const
const agentsRef = { plugin: 'hammock-guards', key: 'agents' } as const
const peersRef = { plugin: 'hammock-guards', key: 'peers' } as const
const crowdRef = { plugin: 'hammock-guards', key: 'crowdWarned' } as const
const wroteRef = { plugin: 'hammock-guards', key: 'wroteAt' } as const
const activityRef = { plugin: 'hammock-guards', key: 'activity' } as const
const mainModelRef = { plugin: 'hammock-guards', key: 'mainModel' } as const
/** Modo grabación: una sola fuente, $.store (vale para todas las pestañas y sesiones). */
async function isRecording($: EngineInterface): Promise<boolean> {
  return (await $.store.get('recording')) === true
}

/** Con carpeta prompts/handoff (flujo de hammockai-daily-plan) los pedidos usan handoff y skill de cierre. */
async function hasHandoffs($: EngineInterface): Promise<boolean> {
  return (await findBase($, slash(await $.session.root()))) !== null
}

/** Cuánto hace que se tocó el handoff más nuevo de `base/prompts/handoff` (ms); Infinity si no hay. */
async function newestHandoffAge($: EngineInterface, base: string, now: number): Promise<number> {
  try {
    const entries = await $.fs.list(`${base}/prompts/handoff`)
    const times = entries
      .filter(f => f.kind === 'file' && !f.isLink && /\.md$/i.test(f.name) && !/^aviso\.md$/i.test(f.name))
      .map(f => f.mtimeMs)
      .filter(t => t <= now) // una hora futura no cuenta como reciente
    return times.length ? now - Math.max(...times) : Infinity
  } catch {
    return Infinity
  }
}

/** Pedido de cierre ordenado: el contexto llegó a ~60 %. */
function closeText(head: string, handoffs: boolean): string {
  return (
    head +
    'Cierre ordenado, sin empezar trabajo nuevo: ' +
    (handoffs
      ? '1) actualiza ahora el handoff de esta sesión (estado, siguiente acción, archivos; ≤ 300 palabras); ' +
        '2) guarda en la memoria del proyecto cualquier decisión nueva de la persona; ' +
        '3) avísale en una línea que corra /hammockai-session-close.'
      : '1) resume en el chat el estado, la siguiente acción y los archivos tocados (≤ 150 palabras); ' +
        '2) avísale a la persona en una línea que conviene seguir en una conversación nueva.')
  )
}

/** Pedido de pausa: el límite se acaba pero el contexto alcanza; la sesión se retoma al renovarse. */
function pauseText(head: string, handoffs: boolean, ctx: number | undefined, left: string): string {
  const room = ctx === undefined ? '' : ` (el contexto va en ${ctx} %; se cierra a ~${CTX_CLOSE_AT} %)`
  return (
    head +
    `Pausa ordenada, NO cierre${room}: ` +
    (handoffs
      ? '1) actualiza ahora el handoff de esta sesión (estado, siguiente acción, archivos; ≤ 300 palabras); ' +
        '2) guarda en la memoria del proyecto cualquier decisión nueva de la persona; ' +
        '3) no empieces trabajo largo; '
      : '1) resume en el chat el estado y la siguiente acción (≤ 150 palabras); 2) no empieces trabajo largo; ') +
    `avísale en una línea que la sesión queda en pausa${left ? ` (el límite se renueva en ${left})` : ''} ` +
    'y que se retoma aquí mismo, sin cerrarla.'
  )
}

/** Ruta relativa del handoff si `text` nombra uno (nunca AVISO.md). */
function handoffIn(text: string): string | null {
  const name = text.replace(/\\/g, '/').match(HANDOFF_RE)?.[1]
  if (!name || /^aviso\.md$/i.test(name)) return null
  return `prompts/handoff/${name}`
}

function slash(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/, '')
}

/** La carpeta más cercana (la raíz o una de arriba, máx. 8 niveles) que tiene prompts/handoff. */
async function findBase($: EngineInterface, root: string): Promise<string | null> {
  let dir = root
  for (let i = 0; i < 8; i++) {
    if (await $.fs.exists(`${dir}/prompts/handoff`)) return dir
    const parent = dir.replace(/\/[^/]+$/, '')
    if (parent === dir || parent === '' || /^[A-Za-z]:$/.test(dir)) return null
    dir = parent
  }
  return null
}

/** Envía un prompt propio sin dejar un rechazo suelto. */
function send($: EngineInterface, input: { text: string }): void {
  $.prompt.submit(input).catch(() => undefined)
}

function label(kind: string): string {
  return LABEL[kind] ?? kind
}

function untilReset(resetsAt: string | undefined, now: number): string {
  if (!resetsAt) return ''
  const mins = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60000))
  if (Number.isNaN(mins)) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h >= 24) return `${Math.floor(h / 24)} d ${h % 24} h`
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

// ---------- Monitor: ayudas ----------

/** Texto limpio para mostrar: sin caracteres de control, invisibles ni de orden bidi; corto. */
// Control C0/C1, ancho cero y marcas bidi (U+200B–200F, 2028–202E, 2060–206F, FEFF), por código.
const HIDDEN = new RegExp(
  '[' +
    [[0x00, 0x1f], [0x7f, 0x9f], [0x200b, 0x200f], [0x2028, 0x202e], [0x2060, 0x206f], [0xfeff, 0xfeff]]
      .map(([a, b]) => `${String.fromCharCode(a!)}-${String.fromCharCode(b!)}`)
      .join('') +
    ']',
  'g',
)

function clean(s: unknown, max = 40): string {
  return typeof s === 'string' ? s.replace(HIDDEN, '').slice(0, max) : ''
}

/** Etiqueta de otra pestaña: solo letras, dígitos, espacio, _ . - (nada que parezca una instrucción). */
function safeLabel(s: unknown): string {
  return clean(s, 24).replace(/[^\p{L}\p{N} _.-]/gu, '').trim() || '?'
}

function num(n: unknown): number | undefined {
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined
}

function usd(n: number | undefined): string {
  return n === undefined ? '— USD' : `${n.toFixed(2)} USD`
}

function kTok(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)} k` : String(n)
}

/** claude-sonnet-4-5-20250929 → sonnet-4-5 */
function shortModel(m: string | undefined): string {
  if (!m) return ''
  return m.replace(/^claude-/, '').replace(/-\d{8}$/, '').replace(/\[.*\]$/, '')
}

function ago(ms: number): string {
  const m = Math.round(ms / 60000)
  return m < 60 ? `hace ${m} min` : `hace ${Math.round(m / 60)} h`
}

/** Carpeta de fichas: $CLAUDE_CONFIG_DIR o ~/.claude, más hammock-usage. */
async function fichaDir($: EngineInterface): Promise<string | null> {
  const config = await $.env.get('CLAUDE_CONFIG_DIR')
  if (config) return `${slash(config)}/hammock-usage`
  const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
  return home ? `${slash(home)}/.claude/hammock-usage` : null
}

/** Lee una ficha; null si no es una ficha válida. */
async function readFicha($: EngineInterface, path: string): Promise<Ficha | null> {
  try {
    const raw = JSON.parse(await $.fs.read(path)) as Record<string, unknown>
    const at = num(raw.at)
    if (raw.v !== 1 || typeof raw.id !== 'string' || at === undefined) return null
    return {
      v: 1,
      id: clean(raw.id, 80),
      label: safeLabel(raw.label),
      busy: raw.busy === true,
      ctx: num(raw.ctx),
      usd: num(raw.usd),
      subs: Math.max(0, Math.min(50, Math.round(num(raw.subs) ?? 0))),
      at,
      ended: raw.ended === true,
    }
  } catch {
    return null
  }
}

/** Nombre corto de esta pestaña: el handoff (p. ej. plan) o la carpeta. */
async function ownLabel($: EngineInterface): Promise<string> {
  // 1.º el título de la pestaña (el de /rename o el automático), igual al que muestra VS Code.
  const { value: title } = await $.state.get(titleRef)
  const shown = title ? safeLabel(title) : '?'
  if (shown !== '?') return shown
  const { value: named = null } = await $.state.get(handoffRef)
  if (named) return named.replace(/^.*\//, '').replace(/\.md$/, '')
  const root = slash(await $.session.root())
  return root.replace(/^.*\//, '') || root
}


/** Guarda la lista de subagentes solo si cambió (cada turno de subagente la refresca). */
async function setAgents($: EngineInterface, next: AgentRow[]): Promise<void> {
  const { value: prev = [] as AgentRow[] } = await $.state.get(agentsRef)
  if (JSON.stringify(prev) !== JSON.stringify(next)) await $.state.set(agentsRef, next)
}
/** Subagentes de esta sesión con sus tokens. */
async function readAgents($: EngineInterface): Promise<AgentRow[]> {
  const list = await $.agent.list()
  const { value: tokens = {} as Tokens } = await $.state.get(tokensRef)
  const { value: activity = {} as Record<string, string> } = await $.state.get(activityRef)
  return list.slice(-12).map(a => ({
    doing: ACTIVE.has(a.status) ? activity[a.id] : undefined,
    id: a.id,
    type: a.type,
    task: a.description,
    status: a.status,
    model: tokens[a.id]?.model,
    inTok: tokens[a.id]?.inTok ?? 0,
    outTok: tokens[a.id]?.outTok ?? 0,
    since: tokens[a.id]?.since,
    until: tokens[a.id]?.until,
  }))
}

/**
 * Escribe la ficha de esta pestaña y lee las de las demás. Reusa el archivo de
 * una pestaña cerrada (los mods no pueden borrar archivos: así la carpeta no crece).
 */
let beating = false // un latido a la vez (variable del módulo)

async function heartbeat($: EngineInterface, ended = false): Promise<void> {
  if (beating && !ended) return
  beating = true
  try {
    await beat($, ended)
  } finally {
    beating = false
  }
}

/**
 * La status line se pone al día al tiro con lo ya leído; la ficha se escribe y
 * las demás se leen como máximo cada 20 s (en turnos y mediciones).
 */
async function pulse($: EngineInterface): Promise<void> {
  const now = await $.clock.now()
  const { value: busy = false } = await $.state.get(busyRef)
  const { value: peers = [] as Peer[] } = await $.state.get(peersRef)
  const { value: agents = [] as AgentRow[] } = await $.state.get(agentsRef)
  const mine: Ficha = { v: 1, id: '', label: '', busy, subs: agents.filter(a => ACTIVE.has(a.status)).length, at: now }
  await showStatus($, mine, peers)
  const { value: wroteAt = 0 } = await $.state.get(wroteRef)
  if (now - wroteAt >= WRITE_GAP_MS) heartbeat($).catch(() => undefined)
}

async function beat($: EngineInterface, ended: boolean): Promise<void> {
  // Sin carpeta de fichas (sin HOME): igual se muestra lo de esta sesión.
  const dir = await fichaDir($)
  const now = await $.clock.now()
  const id = await $.session.id()
  const mine = id.replace(/[^\w-]/g, '').slice(0, 80) || 'sesion'

  const entries = dir !== null && (await $.fs.exists(dir)) ? await $.fs.list(dir) : []
  const files = entries
    // Solo archivos comunes, chicos y con nombre de ficha: nada de enlaces ni .json grandes.
    .filter(f => f.kind === 'file' && !f.isLink && f.size <= 4096 && /^[\w-]{1,80}\.json$/.test(f.name))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, MAX_FILES)

  const peers: Peer[] = []
  let free: string | null = null
  let own: string | null = null
  const { value: held = null } = await $.state.get(slotRef)
  let slot = held
  for (const f of files) {
    const ficha = await readFicha($, `${dir}/${f.name}`)
    if (f.name === slot) {
      // Otra pestaña viva tomó mi archivo (arrancaron a la vez): busco otro.
      if (ficha && ficha.id !== id && !ficha.ended && now - ficha.at < GONE_MS) slot = null
      continue
    }
    // Ilegible (a medio escribir, o ajena): no se toca ni se reusa.
    if (!ficha) continue
    if (ficha.ended || now - ficha.at >= GONE_MS) {
      free ??= f.name
      continue
    }
    if (ficha.at > now + 5 * 60 * 1000) continue // hora futura: no queda viva para siempre
    if (ficha.id === id) {
      own ??= f.name // mi ficha de antes (sesión reanudada): la vuelvo a usar, no abro otra
      continue
    }
    if (now - ficha.at >= ALIVE_MS) continue // cerrada o colgada: no cuenta ni se muestra
    if (peers.some(p => p.id === ficha.id)) continue // una pestaña, una fila
    peers.push({ ...ficha, silent: false })
  }
  // El nombre del archivo no es el id: los archivos de pestañas cerradas se reusan (un mod no puede borrarlos).
  if (slot === null) slot = own ?? free ?? `${mine}.json`
  if (slot !== held) await $.state.set(slotRef, slot)

  // Cifras del motor, sin estimar: session.usage() (sin desglose, la llamada es gratis).
  const usage = await $.session.usage().catch(() => undefined)
  const { value: prev = { limits: [] } as Snapshot } = await $.state.get(snapRef)
  const fresh: Limit[] = (usage?.rateLimits ?? [])
    .filter(l => l.kind in LABEL)
    .map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt }))
  const snap: Snapshot = {
    limits: fresh.length ? fresh : prev.limits,
    ctx: usage?.context.percent ?? prev.ctx,
    usd: usage?.cost?.usd ?? prev.usd,
  }
  await $.state.set(snapRef, snap)

  const { value: busy = false } = await $.state.get(busyRef)
  const agents = await readAgents($)
  const ficha: Ficha = {
    v: 1,
    id,
    label: await ownLabel($),
    busy: busy && !ended,
    ctx: snap.ctx,
    usd: snap.usd,
    subs: ended ? 0 : agents.filter(a => ACTIVE.has(a.status)).length,
    at: now,
    ended,
    titleSrc: (await $.state.get(titleEvtRef)).value ?? 'sin-evento',
  }
  if (dir !== null) await $.fs.write(`${dir}/${slot}`, JSON.stringify(ficha))
  await $.state.set(wroteRef, now)
  await $.state.set(peersRef, peers)
  await $.state.set(agentsRef, agents)
  if (!ended) await showStatus($, ficha, peers)
}

/** Cuántos trabajan ahora: turnos en curso + subagentes corriendo, en todas las pestañas con señal. */
function working(mine: Ficha, peers: Peer[]): number {
  return [mine, ...peers.filter(p => !p.silent)].reduce((n, f) => n + (f.busy ? 1 : 0) + f.subs, 0)
}

/**
 * El mismo conteo, separado como lo muestra la lista: pestañas trabajando y agentes corriendo
 * (un agente puede seguir corriendo en una pestaña "en espera"). Ej.: "1 pestaña trabajando · 1 agente".
 */
function workingText(mine: Ficha, peers: Peer[]): string {
  const all = [mine, ...peers.filter(p => !p.silent)]
  const tabs = all.filter(f => f.busy).length
  const subs = all.reduce((n, f) => n + f.subs, 0)
  return (
    `${tabs} pestaña${tabs === 1 ? '' : 's'} trabajando` +
    (subs ? ` · ${subs} agente${subs === 1 ? '' : 's'}` : '')
  )
}

/** Orden de la lista: por nombre (el motor no entrega el orden de las pestañas). */
function byLabel(a: Ficha, b: Ficha): number {
  return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
}

function limitsText(limits: Limit[], now: number): string {
  return limits
    .map(l => {
      const left = untilReset(l.resetsAt, now)
      return `${label(l.kind)} ${l.percentUsed} %${left ? ` (renueva en ${left})` : ''}`
    })
    .join(' · ')
}

/** Status line + aviso de más de 2 trabajando. */
async function showStatus($: EngineInterface, mine: Ficha, peers: Peer[]): Promise<void> {
  const now = await $.clock.now()
  const { value: snap = { limits: [] } as Snapshot } = await $.state.get(snapRef)
  const n = working(mine, peers)
  const parts = [
    limitsText(snap.limits, now),
    snap.ctx === undefined ? '' : `contexto ${snap.ctx} %`,
    workingText(mine, peers),
  ].filter(Boolean)
  $.ui.status(`⏳ ${parts.join(' · ')}`)

  const { value: warned = false } = await $.state.get(crowdRef)
  if (n > MAX_WORKING && !warned) {
    await $.state.set(crowdRef, true)
    $.ui.toast(`⚠️ ${n} trabajando a la vez (recomendado: máx. ${MAX_WORKING}). Mira /uso.`, { timeoutMs: 8000 })
  } else if (n <= MAX_WORKING && warned) {
    await $.state.set(crowdRef, false)
  }
}

/** Lo que muestran el panel y /uso, ya enmascarado si se está grabando. */
type View = {
  now: number
  snap: Snapshot
  mine: Ficha
  peers: Peer[]
  agents: AgentRow[]
  /** El hilo principal: su nombre (título del CLAUDE.md) y el modelo de su última respuesta. */
  main: { name: string; model?: string }
  n: number
  rec: boolean
}

let mainNameCache: string | null = null // variable del módulo: una recarga lo vuelve a leer

/** Primer título "# …" de un texto, cortado antes de " — ", " - " o ":"; null si no hay. */
function headingName(text: string): string | null {
  const heading = text.match(/^#\s+(.+)$/m)?.[1] ?? ''
  const cut = safeLabel(heading.split(/\s[—–-]\s|:/)[0])
  return cut === '?' ? null : cut
}

/**
 * Nombre del hilo principal, en este orden:
 * 1. el agente de los settings (`"agent": "contramaestre"`) → título de `.claude/agents/<agente>.md`
 *    (del proyecto o del usuario) o, sin archivo, el nombre del agente;
 * 2. el primer título del CLAUDE.md más cercano;
 * 3. "Claude".
 * Ej.: "# Contramaestre — agente de Claude Code" → "Contramaestre".
 */
async function mainName($: EngineInterface): Promise<string> {
  if (mainNameCache !== null) return mainNameCache
  let name: string | null = null
  try {
    const agent = await $.settings.read({ key: 'agent' })
    // Solo un nombre de archivo simple: nada de rutas.
    if (typeof agent === 'string' && /^[\w-]{1,64}$/.test(agent)) {
      const root = slash(await $.session.root())
      const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
      const config = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? (home ? `${slash(home)}/.claude` : null)
      const files = [`${root}/.claude/agents/${agent}.md`, ...(config ? [`${slash(config)}/agents/${agent}.md`] : [])]
      for (const file of files) {
        if (!(await $.fs.exists(file))) continue
        const stat = await $.fs.stat(file, { resolve: true })
        if (stat.isLink || stat.size > 256 * 1024) continue
        // Donde de verdad cae el archivo (enlaces resueltos) debe seguir en su carpeta .../agents/<agente>.md.
        const real = stat.realPath ? slash(stat.realPath).toLowerCase() : ''
        if (!real.endsWith(`/agents/${agent}.md`.toLowerCase())) continue
        name = headingName(await $.fs.read(file))
        if (name) break
      }
      name ??= safeLabel(agent.charAt(0).toUpperCase() + agent.slice(1))
    }
  } catch {
    // settings o archivo ilegibles: sigue con el respaldo
  }
  if (!name) {
    try {
      const found = await $.fs.ancestors({ names: ['CLAUDE.md'] })
      name = headingName(found[found.length - 1]?.content ?? '')
    } catch {
      // sin CLAUDE.md legible
    }
  }
  mainNameCache = name ?? 'Claude'
  return mainNameCache
}

async function usageView($: EngineInterface): Promise<View> {
  const now = await $.clock.now()
  const { value: snap = { limits: [] } as Snapshot } = await $.state.get(snapRef)
  const { value: busy = false } = await $.state.get(busyRef)
  const { value: peers = [] as Peer[] } = await $.state.get(peersRef)
  const { value: raw = [] as AgentRow[] } = await $.state.get(agentsRef)
  const rec = await isRecording($)
  const subs = raw.filter(a => ACTIVE.has(a.status)).length
  const mine: Ficha = { v: 1, id: '', label: rec ? 'esta pestaña' : await ownLabel($), busy, ctx: snap.ctx, usd: snap.usd, subs, at: now }
  // Grabando: nombres genéricos (pestaña 1, 2…), sin tareas ni archivos.
  const shown = rec ? peers.map((p, i) => ({ ...p, label: `pestaña ${i + 1}` })) : peers
  // Actividad en vivo (cada llamada de herramienta la escribe), no la del último latido.
  const { value: activity = {} as Record<string, string> } = await $.state.get(activityRef)
  const agents = raw.map(a => {
    const live = ACTIVE.has(a.status) ? (activity[a.id] ?? a.doing) : undefined
    return {
      ...a,
      task: rec ? '' : clean(a.task, 50),
      // Grabando: solo el nombre de la herramienta, y "mcp" para un conector (no deja ver cuáles tienes).
      doing: live ? (rec ? (live.startsWith('mcp__') ? 'mcp' : live.replace(/ .*$/, '')) : live) : undefined,
    }
  })
  const { value: mainModel } = await $.state.get(mainModelRef)
  // Grabando: el nombre del CLAUDE.md podría ser el de un cliente → "principal".
  const main = { name: rec ? 'principal' : await mainName($), model: mainModel }
  return { now, snap, mine, peers: shown, agents, main, n: working(mine, peers), rec }
}

function duration(ms: number | undefined): string {
  if (ms === undefined || ms < 0) return ''
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}

/** La tabla de /uso en líneas de texto (la respuesta de /uso y el panel en la terminal). */
async function usageLines($: EngineInterface): Promise<string[]> {
  const { now, snap, mine, peers, agents, main, n, rec } = await usageView($)

  const fichaLine = (f: Ficha, silent: boolean) =>
    silent
      ? `${f.label} · sin señal (${ago(now - f.at)})`
      : [
          f.label,
          f.busy ? 'trabajando' : 'en espera',
          f.ctx === undefined ? '' : `contexto ${f.ctx} %`,
          usd(f.usd),
          f.subs ? `${f.subs} subagente${f.subs > 1 ? 's' : ''}` : '',
        ]
          .filter(Boolean)
          .join(' · ')

  return [
    `Ventanas: ${limitsText(snap.limits, now) || 'sin lectura todavía'}`,
    `Esta sesión: ${fichaLine(mine, false)}`,
    'Otras pestañas:',
    ...(peers.length ? peers.map(p => `  ${fichaLine(p, p.silent)}`) : ['  ninguna con el plugin']),
    `Al mando: ${main.name} · ${mine.busy ? 'trabajando' : 'esperando tu mensaje'}${main.model ? ` · ${shortModel(main.model)}` : ''}`,
    'Subagentes de esta sesión:',
    ...(agents.length
      ? agents.map(a =>
          [
            `  ${a.type}`,
            a.task,
            ACTIVE.has(a.status) ? `corriendo${a.doing ? ` (${a.doing})` : ''}` : a.status,
            a.inTok || a.outTok ? `${shortModel(a.model)} · entrada ${kTok(a.inTok)} / salida ${kTok(a.outTok)}` : '',
          ]
            .filter(Boolean)
            .join(' · '),
        )
      : ['  ninguno']),
    `Trabajando ahora: ${workingText(mine, peers)}${n > MAX_WORKING ? ` ⚠️ (recomendado: máx. ${MAX_WORKING} a la vez)` : ''}`,
    'USD = lo que costaría por API (en suscripción no se cobra); sirve para comparar sesiones.',
    'Tokens: entrada sin lecturas de caché; se suman al terminar cada turno del subagente.',
    ...(rec ? ['🎥 Modo grabación: nombres y rutas ocultos (/uso normal para volver).'] : []),
  ]
}

// ---------- Dibujos del panel (SVG: se ven como imagen en VS Code y en la app) ----------

const ORANGE = '#e8935a'
const GREY = '#8a919c'
const AGENT_COLORS = ['#d7b65a', '#c86fa8', '#6cc58a', '#6aa8e0', '#b48ef0', '#e07a6a']

function colorOf(type: string): string {
  let h = 0
  for (const c of type) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AGENT_COLORS[h % AGENT_COLORS.length] ?? GREY
}

/** Robot de 24×24 (pixel art), en el color dado. */
function robot(color: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">` +
    `<rect x="11" y="1" width="2" height="4" fill="${color}"/>` +
    `<rect x="4" y="5" width="16" height="12" rx="2" fill="${color}"/>` +
    `<rect x="7" y="9" width="3" height="3" fill="#1d2128"/><rect x="14" y="9" width="3" height="3" fill="#1d2128"/>` +
    `<rect x="6" y="18" width="4" height="4" fill="${color}"/><rect x="14" y="18" width="4" height="4" fill="${color}"/>` +
    `</svg>`
  )
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Las tarjetas en dos bloques de tamaño FIJO (230 px de ancho): [5 h, semana] y [contexto, costo].
 * Con el ancho fijo el texto no crece en un panel ancho; si cabe, los bloques van lado a lado.
 */
const TILE_W = 230
function tiles(v: View, part: 0 | 1): string {
  const lim = (kind: string) => v.snap.limits.find(l => l.kind === kind)
  const five = lim('five_hour')
  const week = lim('seven_day')
  const cards = [
    { k: '5 h', sub: five ? `renueva ${untilReset(five.resetsAt, v.now)}` : 'sin lectura', val: five ? `${five.percentUsed} %` : '—', pct: five?.percentUsed },
    { k: 'Semana', sub: week ? `renueva ${untilReset(week.resetsAt, v.now)}` : 'sin lectura', val: week ? `${week.percentUsed} %` : '—', pct: week?.percentUsed },
    { k: 'Contexto', sub: 'de esta pestaña', val: v.snap.ctx === undefined ? '—' : `${v.snap.ctx} %`, pct: v.snap.ctx },
    { k: 'Costo sesión', sub: '≈ API', val: v.snap.usd === undefined ? '—' : `$${v.snap.usd.toFixed(2)}`, pct: undefined },
  ].slice(part * 2, part * 2 + 2)
  // Cada tarjeta: nombre y "renueva…" a la izquierda, el valor grande a la derecha, la barra abajo.
  const W = TILE_W - 2
  const H = 50
  const GAP = 6
  const body = cards
    .map((c, i) => {
      const y = i * (H + GAP) + 1
      const pct = c.pct === undefined ? 0 : Math.max(0, Math.min(100, c.pct))
      const hot = pct >= 80 ? '#e2685f' : ORANGE
      return (
        `<rect x="1" y="${y}" width="${W}" height="${H}" rx="5" fill="none" stroke="${GREY}" stroke-opacity=".35"/>` +
        `<text x="11" y="${y + 19}" font-size="12" fill="${GREY}">${esc(c.k)}</text>` +
        `<text x="11" y="${y + 33}" font-size="10" fill="${GREY}">${esc(c.sub)}</text>` +
        `<text x="${W - 9}" y="${y + 30}" font-size="18" font-weight="600" text-anchor="end" fill="${hot}">${esc(c.val)}</text>` +
        (c.pct === undefined
          ? ''
          : `<rect x="11" y="${y + 40}" width="${W - 20}" height="4" rx="2" fill="${GREY}" fill-opacity=".3"/>` +
            `<rect x="11" y="${y + 40}" width="${((W - 20) * pct) / 100}" height="4" rx="2" fill="${hot}"/>`)
      )
    })
    .join('')
  const total = cards.length * (H + GAP) - GAP + 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + 2} ${total}" width="${W + 2}" height="${total}" ` +
    `font-family="Segoe UI, system-ui, sans-serif">${body}</svg>`
  )
}

// Latido de la ficha (variable del módulo: una recarga la reinicia y el latido vuelve a partir).
let stopTick: (() => void) | null = null

/** El latido parte en session.start, o en la primera medición si el mod se activó a mitad de sesión. */
function ensureTick($: EngineInterface): void {
  if (stopTick) return
  const timer = $.clock.every(HEARTBEAT_MS, () => {
    heartbeat($).catch(() => undefined)
  })
  stopTick = () => timer.cancel()
}

export const register: Register = on => {
  // Del turno en curso (se reinician en cada prompt; una recarga los borra, sin daño).
  let worked = false
  let ownTurn = false

  on('session.start', async ($, e, next) => {
    const held = await $.state.get(nudgeRef)
    if (held.version === 0) await $.state.set(nudgeRef, await $.clock.now())
    await $.command.register({
      name: 'uso',
      description: 'Uso de esta sesión, las otras pestañas y los subagentes',
      argumentHint: '[grabar | normal]',
    })
    ensureTick($)
    heartbeat($).catch(() => undefined)
    // Siempre visible: el panel se abre solo al lado del chat (si se cierra, /uso lo vuelve a abrir).
    $.ui.open({ id: PANE, title: 'USO - HAMMOCK AI' }).catch(() => undefined)
    return next(e)
  }).catch(($, e, next) => next(e))

  // Título de la pestaña (/rename o automático): llega al iniciar o reanudar y con cada mensaje.
  on('classic.SessionStart', async ($, e, next) => {
    const has = typeof e.session_title === 'string' && e.session_title !== ''
    await $.state.set(titleEvtRef, has ? 'titulo' : 'evento-sin-titulo')
    if (has) await $.state.set(titleRef, String(e.session_title).slice(0, 80))
    return next(e)
  }).catch(($, e, next) => next(e))

  on('classic.UserPromptSubmit', async ($, e, next) => {
    const has = typeof e.session_title === 'string' && e.session_title !== ''
    const { value: evt } = await $.state.get(titleEvtRef)
    if (evt !== 'titulo') await $.state.set(titleEvtRef, has ? 'titulo' : 'evento-sin-titulo')
    if (typeof e.session_title === 'string' && e.session_title) {
      const { value: was } = await $.state.get(titleRef)
      if (was !== e.session_title) {
        await $.state.set(titleRef, e.session_title.slice(0, 80))
        heartbeat($).catch(() => undefined) // el nombre nuevo llega a las otras pestañas al tiro
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.end', async ($, e, next) => {
    stopTick?.()
    stopTick = null
    await heartbeat($, true).catch(() => undefined)
    return next(e)
  }).catch(($, e, next) => next(e))

  // ---------- Guardia del resumen ----------

  on('prompt.submit', async ($, e, next) => {
    // Un prompt que llega dentro de un turno en curso no abre turno nuevo.
    if (e.turnId === undefined) {
      worked = false
      ownTurn = e.origin?.kind === 'plugin' && e.origin.name === $.plugin.name
    }
    // Solo lo que escribe la persona nombra el handoff (no peers, avisos ni plugins).
    if (!ownTurn && TYPED.has(e.origin?.kind ?? '')) {
      const named = handoffIn(e.text) ?? (/hammockai-daily-plan/.test(e.text) ? BRIDGE : null)
      if (named) await $.state.set(handoffRef, named)
    }
    return next(e)
  }).catch(($, e, next) => next(e)) // solo observa: si falla, el prompt sigue igual

  on('tool.call', async ($, e, next) => {
    // Monitor: qué hace cada subagente (herramienta + nombre de archivo, nunca la ruta ni el comando).
    if (e.agentId !== undefined) {
      const id = e.agentId
      const file = 'file_path' in e && typeof e.file_path === 'string' ? e.file_path.replace(/^.*[\\/]/, '') : ''
      const doing = `${e.tool}${file ? ` ${clean(file, 30)}` : ''}`
      const { value: activity = {} as Record<string, string> } = await $.state.get(activityRef)
      if (activity[id] !== doing) await $.state.set(activityRef, { ...activity, [id]: doing })
    }
    if (e.agentId === undefined && WORK_TOOLS.has(e.tool)) {
      worked = true
      if ((e.tool === 'Edit' || e.tool === 'Write') && typeof e.file_path === 'string') {
        const named = handoffIn(e.file_path)
        if (named) await $.state.set(handoffRef, named)
      }
    }
    return next(e)
  }).catch(($, e, next) => next(e)) // solo observa: si falla, la llamada sigue igual

  on('turn.start', async ($, e, next) => {
    const started = await next(e)
    if (e.agentId === undefined) {
      await $.state.set(busyRef, true)
      ensureTick($)
      await pulse($)
    } else {
      // Reloj del subagente: desde su primer turno; corre de nuevo si vuelve a trabajar.
      const id = e.agentId
      const now = await $.clock.now()
      const { value: tokens = {} as Tokens } = await $.state.get(tokensRef)
      const was = tokens[id] ?? { inTok: 0, outTok: 0 }
      await $.state.set(tokensRef, { ...tokens, [id]: { ...was, since: was.since ?? now, until: undefined } })
      // Al partir un subagente, la lista se pone al día al tiro (no espera el latido).
      await setAgents($, await readAgents($))
      await pulse($)
    }
    return started
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)

    // Monitor: tokens del subagente, o fin del turno principal.
    if (e.agentId !== undefined) {
      const u = done.usage ?? e.usage
      const id = e.agentId
      const now = await $.clock.now()
      const { value: tokens = {} as Tokens } = await $.state.get(tokensRef)
      const was = tokens[id] ?? { inTok: 0, outTok: 0 }
      await $.state.set(tokensRef, {
        ...tokens,
        [id]: {
          ...was,
          model: u?.model ?? was.model,
          inTok: was.inTok + (u ? u.input_tokens + u.cache_creation_input_tokens : 0), // sin lecturas de caché
          outTok: was.outTok + (u?.output_tokens ?? 0),
          until: now,
        },
      })
      await setAgents($, await readAgents($))
      await pulse($)
      return done
    }
    await $.state.set(busyRef, false)
    const mainUsage = done.usage ?? e.usage
    if (mainUsage?.model) await $.state.set(mainModelRef, mainUsage.model) // modelo del hilo principal
    await pulse($)

    if (e.isAborted || ownTurn || !worked) return done

    const now = await $.clock.now()
    // Sin marca (mod activado a mitad de sesión): la reloj parte ahora.
    const held = await $.state.get(nudgeRef)
    if (held.version === 0 || held.value === undefined) {
      await $.state.set(nudgeRef, now)
      return done
    }
    if (now - held.value < STALE_MS) return done

    // Sin carpeta prompts/handoff en la raíz ni más arriba: no es un workspace con handoffs.
    const root = slash(await $.session.root())
    const base = await findBase($, root)
    if (base === null) return done

    // Solo un handoff que existe de verdad entra al texto; si no, el genérico.
    const { value: named = null } = await $.state.get(handoffRef)
    let handoff: string | null = null
    if (named !== null) {
      const path = `${base}/${named}`
      if (await $.fs.exists(path)) {
        const stat = await $.fs.stat(path)
        if (now - stat.mtimeMs < STALE_MS) return done
        handoff = base === root ? named : path // fuera de la raíz, la ruta completa
      }
    }
    // Handoff desconocido (p. ej. sesión retomada): si algún handoff se anotó hace poco, no empuja.
    if (handoff === null && (await newestHandoffAge($, base, now)) < STALE_MS) return done

    await $.state.set(nudgeRef, now)
    // Grabando: ni ruta ni nombre del handoff en el chat.
    const target = (await isRecording($))
      ? 'el handoff de esta sesión'
      : (handoff ?? `el handoff de esta sesión (${base === root ? '' : `${base}/`}prompts/handoff/<frente>.md)`)
    send($, {
      text:
        `[guardia del resumen] ${target} lleva más de 20 min sin anotaciones y hubo trabajo. ` +
        'Agrega ahora una línea por cada hecho, decisión o aviso de la persona desde la última anotación ' +
        '(el archivo completo ≤ 300 palabras). Solo eso, y responde en una línea.',
    })
    return done
  }).catch(($, e, next) => next(e))

  // ---------- Guardia de límites + medición ----------

  on('session.measure', async ($, e, next) => {
    const done = await next(e)
    const limits: Limit[] = e.rateLimits
      .filter(l => l.kind in LABEL)
      .map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt }))
    const now = await $.clock.now()

    const { value: prev = { limits: [] } as Snapshot } = await $.state.get(snapRef)
    await $.state.set(snapRef, {
      limits: limits.length ? limits : prev.limits,
      ctx: e.context.percent ?? prev.ctx,
      usd: e.cost?.usd ?? prev.usd,
    })
    ensureTick($)
    await pulse($)

    // Una sesión se cierra por su ventana de contexto (~60 %), no por el bloque de 5 h que se renueva.
    const ctx = e.context.percent ?? prev.ctx
    const full = ctx !== undefined && ctx >= CTX_CLOSE_AT
    const { value: ctxClosed = false } = await $.state.get(ctxClosedRef)
    // Tras /compact o /clear el contexto baja: se rearma para avisar de nuevo al volver a cruzar.
    if (ctx !== undefined && !full && ctxClosed) await $.state.set(ctxClosedRef, false)
    if (full && !ctxClosed) {
      await $.state.set(ctxClosedRef, true)
      $.ui.toast(`⛔ Contexto al ${ctx} %: toca cerrar esta sesión.`, { timeoutMs: 10000 })
      send($, { text: closeText(`[guardia de contexto] La conversación va en ${ctx} % de su ventana. `, await hasHandoffs($)) })
    }
    if (limits.length === 0) return done

    const { value: warned = {} as Fired } = await $.state.get(warnedRef)
    const { value: closed = {} as Fired } = await $.state.get(closedRef)
    let nextWarned = warned
    let nextClosed = closed

    for (const l of limits) {
      // Sello por ventana, redondeado a la hora: un resetsAt que se mueve unos segundos es la misma ventana.
      const stamp = l.resetsAt ? String(Math.round(Date.parse(l.resetsAt) / 3600000)) : 'sin-fecha'
      const left = untilReset(l.resetsAt, now)
      const lastClose = Number(nextClosed['_at'] ?? 0)
      if (l.percentUsed >= CLOSE_AT && closed[l.kind] !== stamp && now - lastClose >= CLOSE_GAP_MS) {
        nextClosed = { ...nextClosed, [l.kind]: stamp, _at: String(now) }
        nextWarned = { ...nextWarned, [l.kind]: stamp }
        const head =
          `[guardia de límites] El límite de ${label(l.kind)} va en ${l.percentUsed} %` +
          `${left ? ` (se renueva en ${left})` : ''}. `
        const handoffs = await hasHandoffs($)
        if (full && !ctxClosed) {
          // La guardia de contexto ya pidió el cierre en esta misma medición: solo el aviso.
          $.ui.toast(`⛔ Límite de ${label(l.kind)} al ${l.percentUsed} %.`, { timeoutMs: 10000 })
        } else if (full) {
          $.ui.toast(`⛔ Límite de ${label(l.kind)} al ${l.percentUsed} % y contexto al ${ctx} %: cierre ordenado.`, { timeoutMs: 10000 })
          send($, { text: closeText(head, handoffs) })
        } else {
          // Contexto bajo 60 %: la sesión sigue sirviendo; se pausa hasta que el límite se renueve.
          $.ui.toast(
            `⏸️ Límite de ${label(l.kind)} al ${l.percentUsed} %: pausa${left ? ` hasta que se renueve (${left})` : ''}. ` +
              'No cierres la sesión.',
            { timeoutMs: 10000 },
          )
          send($, { text: pauseText(head, handoffs, ctx, left) })
        }
      } else if (l.percentUsed >= WARN_AT && warned[l.kind] !== stamp) {
        nextWarned = { ...nextWarned, [l.kind]: stamp }
        $.ui.toast(
          `⚠️ Límite de ${label(l.kind)} al ${l.percentUsed} %${left ? `, se renueva en ${left}` : ''}. ` +
            'Al 90 % pido anotar y pausar.',
          { timeoutMs: 8000 },
        )
      }
    }

    if (nextWarned !== warned) await $.state.set(warnedRef, nextWarned)
    if (nextClosed !== closed) await $.state.set(closedRef, nextClosed)
    return done
  }).catch(($, e, next) => next(e))

  // ---------- Panel /uso ----------

  on('command.run', { command: 'uso' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'grabar' || arg === 'normal') {
      const isOn = arg === 'grabar'
      await $.store.set('recording', isOn)
      $.ui.invalidate('ui.render')
      return {
        text: isOn
          ? '🎥 Modo grabación activado: el panel oculta nombres de pestañas, carpetas, tareas y archivos. Queda guardado; /uso normal lo apaga.'
          : 'Modo grabación apagado.',
      }
    }
    await heartbeat($).catch(() => undefined)
    const { isPlaced } = await $.ui.open({ id: PANE, title: 'USO - HAMMOCK AI' })
    // Si la superficie no muestra paneles (p. ej. VS Code), la tabla va en texto.
    return { text: isPlaced ? 'Panel de uso abierto.' : (await usageLines($)).join('\n') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Text } = els

    // La terminal no dibuja SVG: ahí va la tabla en texto.
    if (!('Svg' in els)) {
      const lines = await usageLines($)
      // El título ya lo pone el panel ("USO - HAMMOCK AI"): no se repite adentro.
      return (
        <Box flexDirection="column">
          {lines.map(line => (
            <Text dimColor={line.startsWith('USD =')}>{line}</Text>
          ))}
        </Box>
      )
    }

    const { Svg } = els
    const v = await usageView($)
    const row = (r: {
      key: string
      color: string
      name: string
      tag?: string
      state: string
      tone: 'claude' | 'inactive' | 'error'
      num: string
      detail: string
      dim?: boolean
    }) => (
      <Box key={r.key} flexDirection="row" alignItems="center" gap={1}>
        <Svg source={robot(r.color)} alt={`${r.name}: ${r.state}`} width={24} height={24} />
        <Box flexDirection="column" flexGrow={1}>
          <Box flexDirection="row" gap={1}>
            <Text weight="medium" dimColor={r.dim}>{r.name}</Text>
            {r.tag ? <Text dimColor size="footnote">{r.tag}</Text> : null}
          </Box>
          <Text color={r.tone} size="footnote">{r.state}</Text>
        </Box>
        <Box flexDirection="column" alignItems="flex-end">
          <Text mono tabular weight="semibold" dimColor={r.dim}>{r.num}</Text>
          <Text dimColor size="footnote">{r.detail}</Text>
        </Box>
      </Box>
    )

    const tab = (f: Ficha, key: string, tag?: string, silent = false) =>
      row({
        key,
        color: silent || !f.busy ? GREY : ORANGE,
        name: f.label,
        tag,
        state: silent ? `sin señal · ${ago(v.now - f.at)}` : f.busy ? 'trabajando…' : 'en espera',
        tone: silent ? 'error' : f.busy ? 'claude' : 'inactive',
        num: f.ctx === undefined ? '—' : `${f.ctx} %`,
        detail: usd(f.usd) + (f.subs ? ` · ${f.subs} agente${f.subs > 1 ? 's' : ''}` : ''),
        dim: silent,
      })

    const SLEEP: Record<string, string> = {
      completed: 'durmiendo · terminó',
      idle: 'durmiendo · esperando',
      failed: 'falló',
      killed: 'detenido',
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text dimColor size="footnote">pestaña: {v.mine.label}</Text>
        {/* Tamaño fijo: en panel angosto, uno bajo otro; en panel ancho, lado a lado. */}
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          <Svg source={tiles(v, 0)} alt={`Límites: ${limitsText(v.snap.limits, v.now) || 'sin lectura'}`} width={TILE_W} height={108} />
          <Svg source={tiles(v, 1)} alt={`Contexto ${v.snap.ctx ?? '—'} %, costo ${usd(v.snap.usd)}`} width={TILE_W} height={108} />
        </Box>
        {v.n > MAX_WORKING ? (
          <Box borderStyle="round" borderColor="warning" paddingX={1}>
            <Text color="warning">⚠ {v.n} trabajando a la vez · recomendado: máximo {MAX_WORKING}</Text>
          </Box>
        ) : null}
        <Box flexDirection="column">
          <Text dimColor size="caption">PESTAÑAS</Text>
          {/* Todas por nombre, esta incluida y marcada "esta"; arriba, el conteo igual al de la status line. */}
          <Text dimColor size="footnote">{workingText(v.mine, v.peers)}</Text>
          {[{ f: v.mine as Ficha, key: 'mine', isMine: true }, ...v.peers.map((p, i) => ({ f: p as Ficha, key: `p${i}`, isMine: false }))]
            .sort((a, b) => byLabel(a.f, b.f))
            .map(t => tab(t.f, t.key, t.isMine ? 'esta' : undefined))}
        </Box>
        <Box flexDirection="column">
          <Text dimColor size="caption">AGENTES DE ESTA PESTAÑA</Text>
          {row({
            key: 'main',
            color: v.mine.busy ? ORANGE : GREY,
            name: `Al mando: ${v.main.name}`,
            tag: 'principal',
            state: v.mine.busy ? 'trabajando…' : 'esperando tu mensaje',
            tone: v.mine.busy ? 'claude' : 'inactive',
            num: v.snap.ctx === undefined ? '—' : `${v.snap.ctx} %`,
            detail: shortModel(v.main.model) || 'contexto',
          })}
          {v.agents.length === 0 ? <Text dimColor size="footnote">Sin subagentes por ahora.</Text> : null}
          {v.agents.map(a => {
            const active = ACTIVE.has(a.status)
            const ms = a.since === undefined ? undefined : (active ? v.now : (a.until ?? v.now)) - a.since
            return row({
              key: a.id,
              color: active ? colorOf(a.type) : GREY,
              name: a.task || a.type,
              tag: a.task ? a.type : undefined,
              state: active ? `trabajando…${a.doing ? ` ${a.doing}` : ''}` : (SLEEP[a.status] ?? a.status),
              tone: active ? 'claude' : a.status === 'failed' ? 'error' : 'inactive',
              num: a.inTok || a.outTok ? kTok(a.inTok + a.outTok) : '—',
              detail: [shortModel(a.model), duration(ms)].filter(Boolean).join(' · '),
              dim: !active,
            })
          })}
        </Box>
        <Text dimColor size="footnote">
          USD ≈ lo que costaría por API (en suscripción no se cobra). Tokens sin lecturas de caché, sumados al terminar cada turno.
          {v.rec ? ' 🎥 Modo grabación: nombres y rutas ocultos (/uso normal).' : ''}
        </Text>
      </Box>
    )
  })
}
