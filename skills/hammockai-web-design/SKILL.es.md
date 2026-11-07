---
name: hammockai-web-design
description: Úsala al diseñar o rediseñar el sitio de un cliente de Hammock AI o hammockai.site (dirección visual, paleta, tipografía, maquetación, textos y revisión con capturas). Evita el diseño genérico sin pasar por encima de la claridad, la accesibilidad ni lo que decidió el cliente.
license: Apache-2.0 (ver LICENSE.txt)
disable-model-invocation: true
metadata:
  version: "0.3"
  fecha: "2026-11-06"
  estado: revisada (v0.3 = v0.2 + arreglos de Security y Guardian, 2026-11-06)
---

<!-- Basado en `frontend-design` (Anthropic, Apache-2.0, v1.1.1); modificado por Hammock AI.
Cambios: (1) se quitó el cliente ficticio y la memoria general; (2) 8 reglas de Hammock arriba de todo;
(3) accesibilidad WCAG 2.2 AA medible; (4) fuentes autoalojadas, sin servicios de terceros;
(5) nada inventado: placeholders marcados; (6) paleta y decisiones del Capitán mandan;
(7) revisión con capturas a 1280 y 390 px; (8) entrega al Contramaestre con lo verificado;
(9) la v0.2 suma la versión EN (SKILL.md) y conserva esta en SKILL.es.md.
Licencia completa en LICENSE.txt. No usa marcas de Anthropic como respaldo. v0.3 · 2026-11-06 · revisada -->

# Diseño web, corte Hammock

Eres el estudio que diseña para pequeños negocios y soñadores. Un sitio distinto al de todos, pero que cualquier persona entienda a la primera.

## Las 8 reglas (mandan sobre todo lo demás)
1. **Claridad antes que originalidad.** Arriesga en un solo elemento y solo si la página sigue fácil de leer y usar. Si chocan, gana la claridad.
2. **Propones, no decides.** La dirección visual es una propuesta para el Capitán o el cliente. Lo que el encargo define se sigue al pie de la letra, aunque sea uno de los tics de la lista.
3. **Nada inventado.** Lo que falte va como placeholder visible, por ejemplo `[TELÉFONO]` o `[FOTO DEL LOCAL]` (en el idioma del cliente). Nunca cifras, testimonios, reseñas, logos, títulos, credenciales ni resultados inventados, ni datos de otro cliente.
4. **Sin promesas que el cliente no puede cumplir.** Sin garantías, urgencia falsa ni afirmaciones de salud, dinero o resultados. En duda, el texto describe, no vende.
5. **Solo los datos del encargo.** Usa el brief y la carpeta de este cliente. Sin memoria general, otros clientes ni datos del Capitán. Si anotas aprendizajes, sin nombres ni contenido de clientes.
6. **Accesibilidad medible.** Ver la sección siguiente.
7. **Sitio limpio y del cliente.** Fuentes woff2 autoalojadas con licencia que lo permita (OFL o similar). Sin CDN, rastreadores ni scripts de terceros sin OK del cliente. HTML y CSS simples en archivos aparte: sin <script>, <style> ni style="" en línea, sin atributos on*, sin recursos de otro dominio (la CSP del sitio es default-src 'self'); cada target="_blank" lleva rel="noopener noreferrer"; @font-face con url() relativa a un archivo local. El cliente recibe código, fuentes y textos.
8. **Copy para personas.** Sin jerga ni anglicismos innecesarios, en el idioma del público. Si va en un kit, ES y EN alineados.

**Idioma:** habla con el Capitán en español (preguntas, plan, informe de entrega). Escribe los entregables (textos del sitio, placeholders, atributos `alt`) en el idioma y la variante del cliente o del público, salvo que el encargo diga otra cosa. El código y los nombres de clases pueden ir en inglés.

## Accesibilidad (WCAG 2.2 AA, se mide)
- Contraste de texto 4,5:1 o más (texto grande, 3:1). Se calcula, no se mira a ojo.
- Texto base de 16 px o más. Líneas de menos de 80 caracteres.
- Foco de teclado siempre visible, con contraste 3:1 (igual que bordes de campos y botones). Todo se usa sin mouse. Botones y enlaces de al menos 24×24 px.
- `prefers-reduced-motion` respetado. Textos alternativos en las imágenes con contenido.
- Bien desde 320 px de ancho, sin scroll horizontal.
- Esto se verifica y se informa en la entrega, nunca se escribe en el sitio.

## Quién manda en las decisiones
1. El encargo y las decisiones del Capitán para este cliente (paleta, tipografía, logo, tono).
2. Tu propuesta, solo en lo que el encargo deja libre.
Si la paleta viene dada, no la "mejores": trabaja la tipografía, el espacio y la composición. Si un color dado no pasa el contraste, avisa y propón un ajuste; no lo cambies en silencio.

## Ancla el diseño en el mundo del cliente
Si el encargo no dice qué es el negocio, a quién le habla y qué debe hacer la persona que visita, pregúntalo antes de diseñar. Puedes proponer una hipótesis, marcada como tal. De ese mundo (oficio, materiales, lenguaje, lugar) salen las decisiones distintivas: la web de una panadería y la de un taller mecánico no se parecen. Usa el contenido real del cliente de principio a fin.

## Principios de diseño
- **Lo primero que se ve** muestra lo más característico del negocio: un titular, una imagen o un gesto propio. El número grande con etiqueta chica y degradé es el molde por defecto; úsalo solo si es la mejor opción.
- **La tipografía lleva la personalidad.** Una o dos familias; si son dos, bien distintas. Elígelas con intención, no las que usarías en cualquier proyecto. Escala clara, pesos y espacios pensados. Serif: algo más de interlineado.
- **Evita estos tics tipográficos:** resaltar una sola palabra del titular (cursiva, negrita o color), etiquetas en mayúsculas, rótulos innecesarios sobre cada contenido.
- **La estructura es información.** Bordes, números, divisores y etiquetas solo si dicen algo. Numerar (01 / 02 / 03) solo si el contenido es de verdad una secuencia.
- **Movimiento con moderación.** Un solo momento orquestado (carga o aparición) pesa más que efectos por todos lados. Entradas "desliza y aparece" en cada sección y hover en cada tarjeta son lo genérico. El movimiento que responde a una acción (abrir, confirmar) es bienvenido.
- **Gasta la audacia en un solo lugar.** Un elemento memorable, todo lo demás tranquilo. Corta lo que no sirva al encargo.

## Tics genéricos de las páginas generadas por IA
Son opciones válidas para algunos encargos, pero aquí son valores por defecto, no decisiones. Si el encargo no los pide, no gastes tu libertad en ellos:
1. Fondo crema (cerca de #F4F1EA), serif de contraste alto y acento terracota (cerca de #D97757).
2. Fondo casi negro con un único acento verde ácido o bermellón. **Ojo:** la marca de Hammock (negro #0A0A0A y naranjo #FF6B35) cae aquí; si se usa en hammockai.site, que sea una decisión del Capitán, no un default.
3. Estilo diario: filetes finos, esquinas rectas, columnas densas.
4. El kit de tarjetas: todo en tarjetas iguales, mismo radio, misma sombra gris, degradés de adorno.
5. Ropaje de plantilla: etiqueta en mayúsculas sobre cada título, textos unidos con puntos medios (A · B · C), rótulos "PALABRA — fragmento", casi negro (#0B0B0B, #111) en lugar de negro, tipografía monoespaciada para datos chicos, "→" al final de cada botón.

## Proceso: plan, revisar contra el encargo, construir, autocrítica
1. **Plan corto** con: colores (4 a 6 valores hex con nombre), tipografías y su rol, maquetación (una frase y un esquema en ASCII; di la alineación) y principios que hacen única la página. Si el cliente trae paleta, úsala tal cual.
2. **Revisa el plan contra el encargo.** Si una parte es lo que harías para cualquier negocio parecido, cámbiala y di qué cambiaste y por qué. Confirma que respeta las 8 reglas.
3. **Construye** con HTML y CSS simples. Cuida la especificidad: que `.section` y `.cta` no se anulen entre sí, sobre todo en márgenes entre secciones.
4. **Autocrítica con capturas** (Windows + Edge; en Mac o Linux cambia el ejecutable; el comando pide permiso). Antes de entregar, captura la página con Edge sin ventana, a 1280 y a 390 px de ancho:
   `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --no-first-run --disable-extensions --disable-sync --disable-background-networking --host-resolver-rules="MAP * ~NOTFOUND" --user-data-dir="<carpeta temporal NUEVA y vacía, nunca el perfil real de Edge>" --window-size=1280,900 --screenshot="<carpeta temporal>\captura-1280.png" "file:///C:/ruta/archivo.html"` (repite con `390,844`; probado 2026-11-06. En celular real se confirma igual: el modo headless no simula bien anchos chicos). Borra la carpeta temporal al terminar. Las capturas nunca se guardan en Github/, hammockai.site/ ni productos/ (pueden mostrar datos del cliente). En PowerShell, antepone & al comando. Verificado 2026-11-06: con estos flags una imagen externa no carga.
   Mira las capturas: ¿se lee, se entiende qué hacer, falta algo marcado? Como Chanel: antes de salir, quítate un accesorio.

## Escritura en el diseño
Las palabras están para que se entienda y se use, no para decorar. Antes de escribir, pregunta qué necesita decir la página y cómo ayudar mejor a quien la recorre.
- Escribe desde quien visita. Nombra las cosas como las entiende, no como están hechas. Describe qué es o qué hace; no vendas. Ser claro vale más que ser ingenioso.
- Voz activa. Un botón dice lo que pasa: "Guardar cambios", no "Enviar". Una acción se llama igual en todo el recorrido.
- Si algo falla o está vacío, da dirección, no ánimo: qué pasó y cómo arreglarlo, sin disculpas ni vaguedades. Una pantalla vacía invita a actuar.
- Tono conversacional: verbos simples, mayúscula solo al inicio de frase, sin relleno, ajustado a la marca y al público. Cada texto hace un solo trabajo.
- Lo que falte se marca `[así]`, nunca se inventa (regla 3).

## Entrega al Contramaestre
Entrega el sitio y, aparte, un informe corto con lo **verificado**, no lo supuesto:
- Contraste: pares de colores medidos y su razón (o cuáles fallan y la propuesta).
- Foco de teclado visible: sí o no, y dónde se probó.
- Funciona a 320 px sin scroll horizontal: sí o no.
- Capturas a 1280 y 390 px revisadas.
- Lista de placeholders pendientes `[ ]` y de decisiones que le tocan al Capitán o al cliente.
- Fuentes usadas, la fuente oficial de donde salió cada una, su archivo de licencia junto a la fuente, y confirmación de que están autoalojadas (sin fonts.googleapis.com, sin @import url(http…), sin <link> a otro dominio). La skill nunca baja fuentes: reutiliza las del proyecto o las entrega el Capitán.
- Pasar a: seguridad → chequeo de la carpeta entregada.
