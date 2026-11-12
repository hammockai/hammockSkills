/** Ventana ya avisada: kind → sello de la ventana (hora de resetsAt); `_at` = último pedido de cierre (ms). */
export type Fired = Record<string, string>

/** Una ventana de límite tal como la guardamos (5 h, semana). */
export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

/** Lo último que midió esta sesión. */
export type Snapshot = { limits: Limit[]; ctx?: number; usd?: number }

/**
 * La ficha que cada pestaña escribe sobre sí misma en ~/.claude/hammock-usage/.
 * Solo números y nombres: nunca texto de la conversación.
 */
export type Ficha = {
  v: 1
  /** Id de la sesión dueña de la ficha. */
  id: string
  /** Nombre corto: el handoff (p. ej. plan) o la carpeta. */
  label: string
  /** Hay un turno del hilo principal en curso. */
  busy: boolean
  /** Contexto usado, %. */
  ctx?: number
  /** Costo acumulado de la sesión en USD (lo que costaría por API). */
  usd?: number
  /** Subagentes corriendo ahora. */
  subs: number
  /** Último latido, ms. */
  at: number
  /** La pestaña se cerró. */
  ended?: boolean
}

/** Ficha de otra pestaña, con su señal. */
export type Peer = Ficha & { silent: boolean }

/** Un subagente de esta sesión, para la tabla. */
export type AgentRow = {
  id: string
  type: string
  task: string
  status: string
  model?: string
  inTok: number
  outTok: number
  doing?: string
  /** Inicio de su primer turno y fin del último (ms), para el tiempo que lleva. */
  since?: number
  until?: number
}

/** Tokens por subagente al terminar cada turno suyo: entrada = nueva + escritura de caché (sin lecturas de caché); salida aparte. */
export type Tokens = Record<string, { model?: string; inTok: number; outTok: number; since?: number; until?: number }>

declare module 'claude-code' {
  interface PluginState {
    'hammock-guards': {
      /** Handoff de esta sesión, relativo a la raíz (p. ej. prompts/handoff/plan.md); null = sin identificar. */
      handoff: string | null
      /** Último empujón de la guardia del resumen, en ms (o el inicio de la sesión). */
      lastNudgeAt: number
      /** Ventanas que ya mostraron el aviso del 80 %. */
      warned: Fired
      /** Ventanas que ya pidieron el cierre ordenado del 90 %. */
      closed: Fired
      /** Nombre del archivo de ficha de esta pestaña (p. ej. <id>.json). */
      slot: string | null
      /** Turno del hilo principal en curso. */
      busy: boolean
      /** Última medición de esta sesión. */
      snap: Snapshot
      /** Tokens por subagente. */
      tokens: Tokens
      /** Subagentes de esta sesión (última lectura). */
      agents: AgentRow[]
      /** Otras pestañas (última lectura de fichas). */
      peers: Peer[]
      /** Ya se avisó que hay más de 2 trabajando (se rearma al bajar). */
      crowdWarned: boolean
      /** Última escritura de la ficha, ms. */
      wroteAt: number
      /** Qué hace ahora cada subagente: herramienta y nombre de archivo (sin ruta). */
      activity: Record<string, string>
      /** Modelo de la última respuesta del hilo principal. */
      mainModel: string
      // El modo grabación vive en $.store ('recording'): una sola fuente para todas las pestañas.
    }
  }
}
