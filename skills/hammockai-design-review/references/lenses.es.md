<!-- Parte de hammockai-design-review v0.2 (2026-11-20). Basada en Impeccable de Paul Bakaus (Apache-2.0), tag skill-v4.10.0,
guías critique-rubric, critique, audit, polish, typeset, animate y layout; reescrita, condensada y modificada por Hammock AI
(ver la lista de cambios en SKILL.es.md y NOTICE.md). Lee la sección que la revisión necesita, no el archivo entero. -->

# Lentes de revisión

Cada respuesta necesita evidencia (archivo y selector, valor medido o lo que muestra la captura), nunca un "sí" pelado. Lo que no se pudo revisar va NO VERIFICADO.

## A · Crítica de diseño

### A1 · Carga cognitiva (lista de 8)
Fallas: 0-1 baja (bien) · 2-3 moderada (arreglar pronto) · 4+ alta (crítico).
1. Un foco claro: la tarea principal de la página se distingue.
2. Grupos de 4 elementos o menos.
3. Lo relacionado, agrupado a la vista.
4. Jerarquía visual clara.
5. Una decisión a la vez.
6. 4 opciones visibles o menos en cada punto de decisión (marca cualquier punto con más).
7. No hay que recordar algo de otra pantalla.
8. La complejidad aparece solo cuando hace falta.

Por qué 4: la gente sostiene unos 4 elementos a la vez en la memoria de trabajo (Cowan, 2001, según la fuente). Con 5-7, agrupa o revela de a poco; con 8 o más, la gente se salta cosas, hace clic donde no es o se va.
En sitios de pequeños negocios: una acción principal, una o dos secundarias y el resto en el menú; menú superior de 5 elementos o menos; los artículos largos mantienen un solo camino de lectura, con los enlaces relacionados al final.
Fallas comunes y arreglos: una muralla de opciones (agrupar, recomendar una); navegación escondida (estado activo en el menú, título de página claro); jerga (palabras simples, una definición corta en el lugar); todo con el mismo peso (un elemento principal, dos o tres secundarios, el resto en calma); un dato que hay que traer de otra página (repetirlo donde se usa, p. ej. la dirección junto al botón de reservar).

### A2 · Las 10 heurísticas de Nielsen (0-4 cada una)
0 ausente o falla · 1 pobre · 2 parcial con vacíos grandes · 3 bien con vacíos menores · 4 excelente en todo.
| # | Heurística | Qué revisar en un sitio | 0 es | 4 es |
|---|---|---|---|---|
| 1 | Visibilidad del estado | formulario enviado / error a la vista, página actual marcada en el menú, carga de lo que demora | la visita adivina | cada acción se confirma |
| 2 | Coincidencia con el mundo real | las palabras del rubro, como las dice la visita; orden lógico | jerga | el idioma de la visita en todo |
| 3 | Control y libertad | volver, cerrar, cancelar; menús y diálogos se cierran con Esc | la visita queda atrapada | salidas en todas partes |
| 4 | Coherencia y estándares | mismo término y estilo para la misma acción en todas las páginas | piezas cosidas | un sistema predecible |
| 5 | Prevención de errores | etiquetas claras, tipos de campo correctos, valores por defecto sensatos, confirmar antes de lo irreversible | sin barandas | casi imposible equivocarse |
| 6 | Reconocer antes que recordar | opciones a la vista, íconos con texto | hay que memorizar | nada que memorizar |
| 7 | Flexibilidad y eficiencia | caminos directos (llamar, WhatsApp, mapa) para quien ya sabe lo que quiere | un solo camino rígido | atajos sin complicar el camino básico |
| 8 | Diseño estético y mínimo | cada elemento se gana su lugar; color con propósito | todo compite | nada sobra |
| 9 | Recuperarse de errores | mensaje simple junto al campo, dice qué pasó y cómo arreglarlo, guarda lo escrito | críptico o nada | señalado, con arreglo sugerido y lo escrito a salvo |
| 10 | Ayuda y documentación | contacto y preguntas frecuentes fáciles de encontrar, cortas y en contexto | sin ayuda | ayuda en el momento justo |
Las heurísticas 7 y 10 pueden ir n/a en páginas de Persuadir (con su razón en una línea).

### A3 · Recorrido emocional
Aplica la regla del pico y el final: la gente recuerda el momento más fuerte y el último. Busca los valles (un callejón sin salida, un formulario que pide demasiado, un precio sin contexto) y revisa que haya tranquilidad en los momentos de más peso: antes de reservar, llamar, pagar o entregar datos personales (qué pasa después, cuánto demora, quién responde). En salud, dar tranquilidad es el trabajo principal: horario claro, cómo llegar, qué llevar y aviso de urgencias cuando aplique.

### A4 · Personas (2-3 por revisión)
Recorre la acción principal de la página como cada una y nombra el elemento exacto que le falla, no una preocupación general. Usa el público real del cliente según el brief; nunca inventes datos del público. Si el brief no dice nada, usa estas:
- **La que llega por primera vez:** necesita guía y se va si se traba. ¿La primera acción se entiende en 5 segundos? ¿Íconos con texto, términos explicados, una forma de volver, una confirmación después de enviar?
- **La que usa teclado o lector de pantalla, quizás con baja visión y zoom al 200 %:** ¿completa la acción principal solo con el teclado? ¿Foco visible, texto alternativo, contraste AA, nada que se entienda solo por el color, campos con etiqueta, cambios de estado anunciados?
- **La distraída en el celular:** un pulgar, interrupciones, conexión lenta. ¿Acción principal al alcance del pulgar, objetivos táctiles de 24×24 px como mínimo (piso AA) y de unos 44×44 en las acciones principales (cifra de la fuente para celular), imágenes livianas, nada se pierde si vuelve más tarde?
- **La que prueba los bordes:** nombres largos, estados vacíos o con error, recargar a mitad de un formulario, caracteres raros. ¿Fallas silenciosas, errores técnicos a la vista, estados vacíos inútiles?
- **(Salud) el paciente mayor o el preocupado:** texto más grande, diseño en calma, teléfono y dirección a la vista, sin presión, sin tono de publicidad.
Según el tipo de página: Persuadir → primera vez, bordes, celular · Leer → primera vez, teclado/baja visión, celular · Operar → primera vez, teclado/baja visión, celular · Salud: incluye siempre al paciente mayor o preocupado.

## B · Auditoría técnica (5 dimensiones, 0-4 cada una)
| Dimensión | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| 1 · Accesibilidad (WCAG 2.2 AA, medida: contraste 4,5:1 texto / 3:1 texto grande, foco y bordes; teclado; objetivos de 24×24; menos movimiento; alt; etiquetas; HTML semántico) | falla el nivel A | vacíos grandes (sin camino por teclado, pocas etiquetas) | algo de esfuerzo, vacíos importantes | casi toda AA, vacíos menores | AA completa, cerca de AAA |
| 2 · Rendimiento (tamaño y formato de imágenes, carga diferida bajo el pliegue, solo los pesos de fuente que se usan, sin animar propiedades de layout, `will-change` solo mientras anima) | grave (archivos enormes, recálculos de layout en cadena) | mayor (sin carga diferida, animaciones caras) | parcial | casi optimizado | liviano y rápido |
| 3 · Tokens y coherencia (colores, espacios y tipografía desde propiedades CSS; valores repetidos sin escribir a mano) | todo escrito a mano | pocos tokens | tokens usados a medias | tokens con excepciones menores | un sistema de tokens completo y coherente |
| 4 · Responsive (desde 320 px sin desplazamiento horizontal, anchos fijos, zoom de texto, objetivos táctiles, cortes que reordenan por prioridad) | solo escritorio | muchas fallas | funciona en celular con asperezas | detalles menores de objetivos o desbordes | fluido en todo ancho |
| 5 · Sitio limpio (regla 7 de hammockai-web-design: sin script ni style en línea, sin atributos on*, nada de otro dominio, fuentes woff2 locales con url() relativa, rel="noopener noreferrer" en target="_blank"; más la lista de clichés de esa skill) | fallas sistémicas | fallas repetidas | varios problemas verificados | problemas menores aislados | coherente e intencional |
El rendimiento visto solo en el código es una estimación: Lighthouse, peso de la página y LCP/CLS van NO VERIFICADO salvo que The Builder los haya medido.
Cada hallazgo lleva: nombre, ubicación (archivo y selector o línea), categoría, impacto en la visita, la norma que rompe (p. ej. WCAG 2.4.7), arreglo y quién lo arregla.

## C · Lente de pulido (todo el recorrido, en este orden)
Pulir afina lo que existe; si el concepto mismo está mal, dilo y recomienda un rediseño con hammockai-web-design en vez de disfrazarlo de pulido. Conserva el contenido, el comportamiento y todo lo que está fuera del alcance.
1. Tareas rotas, estados engañosos, caminos inaccesibles.
2. Estados que faltan: cargando, vacío, error, éxito, deshabilitado (formularios, botones, el camino de contacto).
3. Flujo y jerarquía: la tarea principal es obvia; los mismos términos que las páginas vecinas; desvíos respecto de los tokens y componentes del propio sitio (clasifícalos: falta un token, valor suelto, choque de concepto o defecto local, y arréglalo en el nivel correcto más acotado).
4. Inconsistencias visuales y de movimiento: contraste en cada estado (hover, foco, activo, deshabilitado), una sola familia de íconos, nada se corre cuando cargan imágenes o fuentes.
5. Limpieza: código muerto, restos de depuración, valores que deberían ser tokens.
Un arreglo nunca cambia texto factual (precios, horarios, títulos, afirmaciones) sin el OK del cliente: infórmalo como decisión.
Recorre todo el camino con mouse, teclado y toque, a 1280 y 390 px; lo que no pudiste probar va NO VERIFICADO.

## D · Lente de tipografía
Mejora dentro de la identidad existente; cambiar las tipografías es una decisión de diseño (hammockai-web-design y el Capitán o el cliente).
- Los roles se distinguen de un vistazo (título, cuerpo, etiqueta, metadatos) y no hay tamaños ni pesos demasiado cercanos; una escala de roles fija que se repite en todas las páginas.
- Cuerpo de 16 px (1rem) o más; largo de línea de 45-75 caracteres (hammockai-web-design lo limita a menos de 80); las líneas más anchas necesitan más interlínea.
- Interlínea ajustada a la fuente y al ancho, no una proporción fija; las serif, un poco más.
- Texto claro sobre fondo oscuro: un poco más de interlínea, un poco más de espaciado entre letras y a veces un paso más de peso.
- Títulos con `text-wrap: balance` y cuerpo con `text-wrap: pretty` (mejora progresiva; soporte NO VERIFICADO hasta que The Builder lo revise). Saltos de línea manuales en un título solo entre frases, revisados en todo ancho: un corte a media línea en el celular es peor que el corte por defecto.
- Cifras tabulares para precios, horarios y datos.
- Solo se cargan las fuentes y pesos que se usan; fuentes de respaldo con métricas parecidas para que el texto no salte cuando llega la fuente; el texto nunca queda invisible mientras carga.
- Ritmo entre párrafos con espacio o con sangría de primera línea, no ambos. Una segunda familia solo si cumple un rol que la primera no puede.
- Respeta el zoom del navegador y la configuración de letra de la persona.

## E · Lente de movimiento
El movimiento explica un estado, una relación o una jerarquía, o es el único momento deliberado de la página (hammockai-web-design). Movimiento sin trabajo es un costo: recomienda quitarlo.
- Duraciones: 100-150 ms respuesta inmediata · 150-300 ms cambios de estado · 300-500 ms capas o transiciones de vista · 500-800 ms una entrada pensada. Las salidas, más rápidas que las entradas. Una respuesta lenta se siente como retraso.
- Curva que frena, p. ej. `cubic-bezier(0.16, 1, 0.3, 1)`; sin rebote ni elástico por defecto.
- Anima `transform` y `opacity`; no ancho, alto, top, left ni márgenes.
- Hover: el elemento bajo el cursor se queda quieto y se mueve un hijo (si no, se desliza bajo el puntero y parpadea); los vecinos no se mueven; los efectos de hover van dentro de `@media (hover: hover)` para que no se queden pegados en el celular. El retraso va solo al entrar, no al salir.
- Contenido visible por defecto: si falla un script, la página se sigue leyendo.
- Sin revelado escalonado en cada sección; escalona solo listas reales, con un retraso total acotado.
- `will-change` solo durante una animación conocida; los bucles se pausan fuera de pantalla.
- Toda animación tiene un camino `prefers-reduced-motion`: menos desplazamiento, pero los cambios de estado y las confirmaciones siguen visibles.
- Revísalo en los dos modos, normal y con menos movimiento, nunca con una captura de un elemento; si no se pudo observar el movimiento, di NO VERIFICADO.
- En salud: movimiento solo como respuesta a una acción; sin entradas de espectáculo.

## F · Lente de layout
El layout convierte la prioridad en orden de lectura, agrupación y ritmo. Diagnostica antes de mover nada; conserva la identidad.
- Prueba del desenfoque: con los detalles borrosos, ¿se ven el elemento principal, el secundario y los grupos grandes, en ese orden?
- Agrupa por significado: cercanía antes que cajas y bordes ("agrupa cerca, separa lejos"); más espacio sobre un título que debajo.
- Ritmo: contraste deliberado entre espacios ajustados y generosos, no un mismo valor repetido hasta que todo pesa igual; una sola escala de espacios (una escala de base 4 da pasos intermedios que la de solo 8 no tiene).
- La estructura calza con el contenido: tarjetas o columnas repetidas solo si los elementos de verdad son equivalentes.
- La densidad calza con el tipo de página: Leer y Operar prefieren una estructura predecible; Persuadir admite una composición asimétrica o menos predecible solo donde el brief y las 8 reglas lo permiten, y nunca en sitios de salud.
- El responsive es estructural: lo que se reordena, se pliega o salta de línea en anchos chicos sigue la prioridad. El orden del DOM y el del foco coinciden con el orden visual.
- Extremos: texto largo, estados vacíos, encabezados fijos, capas y objetivos chicos no rompen la estructura.
- Profundidad (sombras, capas) solo para aclarar estado o jerarquía; una sombra con desplazamiento y desenfoque, no un brillo.
