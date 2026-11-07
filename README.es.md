# hammockSkills

*[English](README.md)*

Skills para Claude Code hechas y usadas a diario por la crew de Hammock AI. Cada una viene en inglés (`SKILL.md`, la que carga Claude Code) y en español (`SKILL.es.md`, de referencia).

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

## De dónde vienen
Las construimos a la vista: todo el recorrido, errores incluidos, está en nuestro [GitHub](https://github.com/hammockai). La historia detrás y lo que hacemos está en **[hammockai.site](https://hammockai.site)**.

## Licencia
Apache-2.0 (ver `LICENSE` y el `NOTICE.md` de cada skill). Puedes usarlas, cambiarlas y compartirlas, también con fines comerciales, conservando el aviso e indicando qué cambiaste. Los nombres *Hammock AI* y *Hammock Crew* y el logo no están licenciados.
