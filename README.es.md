# hammockSkills

*[English](README.md)*

Skills y plugins para Claude Code hechos y usados a diario por la crew de Hammock AI. Cada skill viene en inglés (`SKILL.md`, la que carga Claude Code) y en español (`SKILL.es.md`, de referencia).

La idea de Hammock AI es simple: ayudar a la gente a recuperar su tiempo, todo desde una hamaca. Estas skills las usamos primero en nuestro propio trabajo. Cuando una funciona, la compartimos aquí.

| Skill | Qué hace |
|---|---|
| `hammockai-daily-plan` | Abre la sesión coordinadora del día ("The Bridge"): lee tu tablero y las notas que dejó cada sesión, te pregunta qué ya hiciste y te propone 3 tareas para hoy, primero tus pendientes. |
| `hammockai-session-close` | Cierra una sesión de trabajo desde las notas escritas durante ella (no de memoria), te hace una pregunta, revisa que lo marcado como hecho exista de verdad y deja el tablero y una bitácora corta listos para mañana. |
| `hammockai-skill-builder` | Convierte una tarea que repites en una skill: te entrevista, escribe un borrador, lo prueba y lo revisa contigo. Basada en `skill-creator` de Anthropic (Apache-2.0). |
| `hammockai-web-design` | Diseña o rediseña el sitio de un negocio chico: dirección visual, paleta con contraste medido, tipografía, estructura y accesibilidad. Basada en `frontend-design` de Anthropic (Apache-2.0). |

## Cómo usarlas
1. Copia la carpeta de la skill (por ejemplo `skills/hammockai-daily-plan/`) en `.claude/skills/` de tu proyecto.
2. En Claude Code, escribe `/hammockai-daily-plan` (cada skill corre solo cuando la llamas).
3. Adáptalas. Están escritas para nuestra crew: "el Capitán" eres tú, y algunos pasos llaman a nuestros agentes (Security, Guardian, The Professor) y carpetas: un tablero en `prompts/tablero.md`, notas de sesión en `prompts/handoff/`, bitácoras en `bitacora/sesiones/`, un cuaderno en `cuaderno/` y borradores en `crew-borradores/`. Cambia esas rutas por las tuyas o quita los pasos que no necesites.

**Qué toca cada una**
- `hammockai-daily-plan` lee; solo escribe la nota del día (`prompts/handoff/bridge.md`) y marca en el tablero lo que confirmes como hecho.
- `hammockai-session-close` **escribe** el tablero, la bitácora, `cuaderno/` y la carpeta de memoria de Claude Code (`~/.claude/projects/…/memory/`, fuera de tu proyecto). También les pide un estado corto a tus otras sesiones abiertas de Claude Code (SendMessage); si no tienes sesiones en paralelo, se salta ese paso. Lee cada paso antes de aprobar una escritura.
- `hammockai-skill-builder` asume `crew-borradores/` y `docs-oficiales/`.
- `hammockai-web-design` toma capturas con Edge en Windows; en Mac o Linux cambia el ejecutable. El comando pide tu permiso.

Cada skill trae nuestras reglas de fábrica: nada inventado (lo que no se sabe se marca), ningún dato personal donde no corresponde, sin sorpresas (no envía, no publica ni gasta sin preguntar) y la persona siempre decide.

## Plugins
| Plugin | Qué hace |
|---|---|
| `hammock-guards` | Un **panel de uso** al lado del chat ("USO - HAMMOCK AI"): cuánto llevas de tus límites de 5 horas y de la semana, qué tan llena va la conversación, qué está haciendo cada pestaña abierta de Claude Code y cada agente ayudante, y un aviso cuando trabajan más de 2 a la vez. Al 90 % de un límite pide anotar el estado y hacer una pausa hasta que se renueve, sin cerrar la sesión. El cierre ordenado lo pide cuando la conversación llega al 60 % de su ventana de contexto. Si tu proyecto tiene una carpeta `prompts/handoff/`, como la que arma `hammockai-daily-plan`, además le recuerda a Claude mantener al día ahí las notas de sesión y te pide correr `/hammockai-session-close` (incluida en este repo). |

**Instalar** (Claude Code 2.1.275 o más nuevo):
```
/plugin install hammock-guards --marketplace hammockai/hammockSkills
```
En la extensión de VS Code, donde `/plugin` no está disponible, córrelo desde una terminal:
```
claude plugin marketplace add hammockai/hammockSkills
claude plugin install hammock-guards@hammock-skills
```

**Bueno saber**
- El panel y sus mensajes están en español.
- Todas las cifras salen del propio Claude Code (`/usage`, `/context`, `/cost`); nada es estimado. El monto en dólares es lo que costaría la sesión por la API, no lo que pagas con una suscripción.
- Para ver tus otras pestañas, cada una escribe un archivo chico sobre sí misma en `~/.claude/hammock-usage/` (o `$CLAUDE_CONFIG_DIR/hammock-usage/`): el id de la sesión, el título de la pestaña (el que le pones con /rename, o el automático que Claude Code resume de tu conversación, que puede nombrar a un cliente o proyecto), cifras de uso y una marca técnica de dónde salió el título; nunca el texto de tu conversación. Los archivos se reusan y no se borran solos. Solo aparecen las pestañas que tienen el plugin.
- Para la fila "Al mando" (quién lleva la pestaña) lee solo el primer título de tu agente principal (`.claude/agents/<agente>.md`, el que nombran tus settings) o de tu `CLAUDE.md`. Nada sale de tu computador.
- Antes de grabar tu pantalla, escribe `/uso grabar`: se ocultan los nombres de pestañas, carpetas, tareas, archivos y conectores. `/uso normal` lo apaga.
- Usa los hooks de plugins de Claude Code, una función en acceso anticipado que puede cambiar entre versiones.
- La idea de la lista de agentes y del conteo de tokens viene de [mod-roadmap-monitor](https://github.com/jlefernandez/mod-roadmap-monitor), de jlefernandez. Nuestro código está escrito desde cero; no copia nada del suyo.

## De dónde vienen
Las construimos a la vista: todo el recorrido, errores incluidos, está en nuestro [GitHub](https://github.com/hammockai). La historia detrás y lo que hacemos está en **[hammockai.site](https://hammockai.site)**.

## Licencia
Apache-2.0 (ver `LICENSE` y el `NOTICE.md` de cada skill). Puedes usarlas, cambiarlas y compartirlas, también con fines comerciales, conservando el aviso e indicando qué cambiaste. Los nombres *Hammock AI* y *Hammock Crew* y el logo no están licenciados.
