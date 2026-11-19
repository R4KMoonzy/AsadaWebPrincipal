# Diseño visual: estilo AyA adaptado a ASADA Bijagua

El sitio conserva **todas** sus páginas, secciones, contenidos y funcionalidades anteriores (noticias, avisos, transparencia, tarifas, afiliación, calidad del agua, programa ambiental, accesibilidad y panel administrativo). Solo cambia la **estética**, inspirada en `https://www.aya.go.cr/inicio` y adaptada a la estructura de la ASADA.

> No se incluyó ningún módulo de facturación, pagos ni consulta de recibos.

## Rasgos visuales

- **Tipografía:** `Montserrat` en todo el sitio.
- **Paleta:** azul marino `#192952`, azul `#0b5fa5`, celeste `#39a7ce`, dorado `#f4c430`, verde `#15803d`, blanco y gris claro `#f5f6fa`.
- **Encabezado:** franja azul marino, logo a la izquierda, navegación blanca con subrayado dorado animado, desplegables blancos y buscador.
- **Hero:** carrusel de 3 fotos a ancho completo con flechas circulares, indicadores, título azul marino, botones con onda y los datos «Bijagua / Gestión comunal / Bosque y agua» **en flujo normal** (ya no se cortan ni se superponen).
- **Franja azul de accesos:** 4 tarjetas claras (avisos, tarifas, trámites y transparencia).
- **Noticias:** carrusel con tarjetas que muestran su foto cuando se sube desde el panel.
- **Pie:** footer azul marino con franja multicolor, teléfonos y acceso administrativo.

## Carga y logotipo

- Al entrar al sitio se muestra una **pantalla de carga breve** (máximo ~2.3 s) con una ola que sube y “rompe”, y una línea de color al llegar al borde; luego el contenido entra con un desvanecimiento suave.
- El logotipo aparece con una **entrada suave** (desvanecimiento y ligero desplazamiento) y se precarga en todas las páginas. El isotipo local es `logo.svg`, así que nunca queda un cuadro blanco; sigue siendo reemplazable desde *Administración → Logo de la ASADA*.
- Si un logo subido falla al cargar, se vuelve automáticamente al isotipo local sin dejar espacios vacíos.

## Todo es editable desde `admin` (panel administrativo)

Con el PIN, menú **ASADA (Sitio)**:

| Menú del panel | Qué controla |
| --- | --- |
| **Logo de la ASADA** | Logo oficial del encabezado, pie de página y favicon en **todas** las páginas (colección `sitio_logo`). |
| **Fondos e imágenes** | «Mapeo de acueductos (foto principal)», «Foto del inicio 2», «Foto del inicio 3», fondo de encabezados, imagen del mapa e imagen de tecnología. |
| Información y textos | Editor por **espacios/pestañas**: Identidad y contacto (nombre, **subtítulo del encabezado**, teléfonos, correo, dirección y horario), Inicio (portada, botones, secciones, mapa) y una pestaña por página interior (72 campos con buscador). Solo se guarda lo que se cambió y se refleja al recargar el sitio. **Cada campo muestra un ejemplo** (también como texto de ayuda dentro del cuadro) y hay un interruptor «Mostrar ejemplos en los campos» para ocultarlos; el buscador también encuentra campos por el texto del ejemplo. |
| Servicios → Nuestros servicios | Cada servicio admite **imagen opcional**, icono y destacados. |
| Diseño del inicio → Línea de tiempo | Cada hito admite **imagen**, año, título, descripción, orden y visibilidad. |
| Diseño del inicio → Zonas de cobertura | Sectores, cifras e **imagen** de cada zona. |
| Diseño del inicio → Cifras / Beneficiarios | Números y etiquetas. |
| Noticias / Cortes / Documentos / Proyectos | Cada noticia y proyecto admite **imagen principal**. |
| Junta directiva / Colaboradores | **Fotografía** de cada persona. |
| Páginas y secciones | Bloques de título, texto, imagen, botón, enlace y logo. |

## Mapa y ubicación

- Coordenadas de Bijagua: **10°43′50.40″ N, 85°03′21.46″ O** (**10.730667° N, -85.055961°**). El mapa OpenStreetMap se centra ahí por defecto (`marker=10.730667,-85.055961`).
- En el lateral del mapa se muestran los bloques **«Estamos ubicados en: Bijagua»** y **«Brindamos Servicio en: Bijagua»**, ambos editables en *Información y textos* (`Mapa - etiqueta/valor ubicación` y `Mapa - etiqueta/valor cobertura`).
- Las coordenadas visibles se editan con `Mapa - coordenadas`.
- Para usar el **mapeo de acueductos** como foto principal: *Fondos e imágenes → Mapeo de acueductos (foto principal)*.
- Si sube una imagen en *Mapa de cobertura (imagen)*, reemplaza al mapa interactivo y se amplía con *Ampliar mapa*.

## Correcciones visuales finales

- El carrusel de noticias queda siempre dentro de su columna: ya no ensancha la página ni deja un espacio en blanco debajo; las tarjetas tienen altura fija y texto recortado con elegancia.
- El bloque **Programa de Educación Ambiental** usa textos azul marino/gris sobre fondo claro (ya no letras blancas ilegibles) y elimina el verde del menú y del botón del hero.
- La página del programa cargaba solo `programa.css`, así que falta el loader y el pie inyectado quedaba apilado; ahora tiene su propia pantalla de carga con ola, el pie de 3 columnas en escritorio (1 en móvil) y el encabezado no baja de línea.
- El subtítulo del encabezado (editable en *Identidad y contacto*) se reparte automáticamente en dos líneas para que no se vea como una frase larguísima; el encabezado ocupa menos espacio y el menú respira mejor.
- El botón **Acceso Administrativo** del pie y los enlaces **Publicar desde el panel** abren `admin.html` también en local (Live Server), sin caer en una ruta `/admin` inexistente.

## Contenido cargado del Informe de Sello de Calidad Sanitaria 2026

Se tomó del documento `INFORME_SELLO_2026_ASADA_BIJAGUA.docx` (enero 2026):

- **Textos del sitio:** portada (etiqueta, título, subtítulo y los tres datos: 101,6 km de red, 4 fuentes, 21 hidrantes), nota, accesos, *Sobre nosotros*, *Historia*, *Tecnología*, *Servicios*, *Beneficiarios*, *Cobertura*, ubicación del mapa, nota de tarifas y contenido de *Calidad del agua*.
- **Fichas nuevas:** 5 miembros de junta, 8 colaboradores, 3 tarjetas de tecnología, 6 zonas de cobertura, 5 cifras del inicio, 3 beneficiarios, 4 proyectos, 1 noticia del Sello y 4 noticias de educación ambiental.
- Se conservaron el correo, la dirección y el subtítulo del encabezado que ya estaban guardados. El teléfono se completó con el número del informe (2466-86-71). No se inventaron horarios, montos de tarifas ni documentos PDF que el informe no indica.

## Textos que faltaban en páginas interiores

- Se corrigió un error en `app.js`: las rutas se comparaban como `/servicios` cuando la variable ya venía como `servicios` (sin barra y sin `.html`). Por eso los textos guardados no se aplicaban en **Servicios, Tarifas, Calidad del agua y Trámites**. Ahora sí se muestran.
- **Quienes somos** ya no tiene texto de plantilla: la historia (1965 → 2025), la misión, la visión y los textos de *Junta Directiva* y *Colaboradores* se editan desde el panel.
- Se agregaron tres espacios nuevos en **Información y textos del sitio**: *Página: Quienes somos*, *Páginas: otros encabezados* y *Página: Contacto*. El panel pasó de 72 a **90 campos**, todos con ejemplo.
- Cualquier elemento con `data-cfg="Nombre del campo"` toma automáticamente el valor guardado, así que no hace falta tocar el HTML para cambiarlo.
- Se cargaron 3 servicios editables y 4 preguntas frecuentes con respuestas tomadas del informe.
- Se subieron dos resoluciones de ARESEP a **Transparencia**, con descripción propia: **RE-0012-IA-2025** (Informe; fija la TPRH de Bijagua para 2025-2029 y financia la protección de nacientes y zonas de recarga) y **RE-034-IA-2024** (Reglamento; publicación en La Gaceta del 17/12/2024 que actualiza las tarifas de las ASADAS con Sello Regulatorio de Calidad desde el 01/02/2025). Ambos PDF quedaron en el bucket de Appwrite y se descargan desde el panel.
- Donde el informe no da el dato, se dejó una referencia honesta: el horario indica que se consulte por teléfono al 2466-86-71. La misión y la visión de la ASADA se redactaron a partir de los objetivos del informe y se pueden reemplazar desde el panel.
- El lugar de «Consultar en oficina» lo tomaron las **tarifas 2026** que se indican abajo.

## Tarifas 2026

- La página **Tarifas** está dividida en **8 acordeones por categoría**: Residencial, Comercio y Servicios, Industria, Preferencial, Grandes Consumidores, Residencial Pobreza Básica, Residencial Pobreza Extrema y Grandes Consumidores de Bien Social. El primero aparece abierto y cada encabezado indica si incluye Acueducto, TPRH o ambos, además del número de tarifas.
- Dentro de cada categoría se muestran juntas las tablas de **Servicio de Acueducto** (33 filas en total, ASADAS con Sello de Calidad y más de 1 001 abonados) y **Servicio de Protección del Recurso Hídrico** (17 filas en total, ASADA Bijagua).
- Columnas de cada tabla: **Bloque de consumo · Tarifa 2026 · Tarifa anterior · Variación**. «Tarifa anterior» es la que estaba vigente antes del 1 de enero de 2026.
- El cargo fijo mensual de **₡ 2 800** aplica a todas las categorías del servicio de Acueducto; la TPRH se cobra por metro cúbico consumido. Vigencia: **01/01/2026 – 31/12/2026**.
- Fuente de los valores: Intendencia de Agua de ARESEP. Se eliminaron las 3 filas de plantilla («Completar») y se cargaron las 50 filas oficiales en Firestore.
- En el panel, **Tarifas (tabla)** tiene los campos *Servicio, Categoría, Bloque de consumo, Tarifa 2026, Tarifa anterior, Variación, Orden y Visible*, cada uno con su ejemplo. El orden agrupa las filas por servicio.
- Los tres botones del cierre (**Enviar reporte**, **Preguntas frecuentes** y **Conocer la Junta Directiva**) se ven con contrastes dorado, blanco y outlined sobre el azul marino.
- La lupa del encabezado abre el panel, filtra resultados con la tecla **Enter** y se cierra al hacer clic fuera o con **Esc**.
- Las flechas del carrusel de noticias desplazan el contenido de inmediato en todos los navegadores.
- El bloque «Creciendo por la vida» usa contraste alto (títulos azul marino, fechas gris oscuro) y la hoja amarilla decorativa queda completamente dentro del contenedor.
- Todas las noticias se muestran en un solo carrusel: se eliminaron las dos tarjetas estrechas apiladas que aparecían a la derecha.
- El recuadro «Nuestra prioridad» está en flujo normal, alineado a la derecha y debajo de los tres datos del hero, así que no tapa «Bijagua» ni corta «Bosque y agua».
- El subtítulo del hero lleva un fondo blanco translúcido y texto azul oscuro para leerse sobre la fotografía.
- El botón «Preguntas frecuentes» del cierre es blanco con borde blanco sobre el azul marino, también en estado normal.
- El menú «Institución» lleva tilde. «Nueva conexión» pasó a llamarse **Trámites** en menús, página, panel y textos guardados.
- Se usa **abonado/abonados** en lugar de «asociado/asociados» cuando se habla de las personas atendidas (se conservó «Asociación» en el nombre legal y «ecosistemas asociados» en el programa).
- En Transparencia se quitó la categoría **Acta**: solo quedan *Reglamento*, *Formulario* e *Informe*.

## Contacto: números y WhatsApp

- La página de contacto muestra el lema **«BIJAGUA · Calidad, Servicio y Desarrollo»**, el número de **servicio al cliente 8365 1396** (enlace `tel:`) y los **6 números de fontanería** sin nombres personales: 8436 5091, 8541 0371, 8641 0227, 8892 6900, 8651 2902 y 8792 1030.
- Hay un aviso visible: la respuesta al formulario o al soporte depende de la disponibilidad del personal para revisar el buzón, y se recomienda llamar siempre al número directo de la ASADA.
- En esa página aparece una **burbuja circular de WhatsApp** fija abajo a la derecha y un botón «Escribir por WhatsApp» en la columna de contacto. Ambos abren `https://wa.me/` con el número configurado; en el resto del sitio se mantiene el botón verde que lleva a Contacto.
- El número de WhatsApp se edita en **Página: Contacto → Número de WhatsApp** (solo dígitos, con código de país 506). Al guardarlo, los dos enlaces se actualizan solos.
- Los 6 campos de este espacio (lema, descripción, servicio al cliente, WhatsApp, números de fontanería y aviso) llevan ejemplo en el panel.

## Animaciones y accesibilidad

- Botones con onda al presionar, flechas con escalado, indicadores con pulso, tarjetas que se elevan y entradas de sección con `IntersectionObserver`.
- Respeta `prefers-reduced-motion` y el modo de alto contraste.

## Prueba local

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173`.

## Publicación en Vercel (URLs sin `.html`)

Se incluye `vercel.json` con `cleanUrls` y `trailingSlash: false`. Los enlaces del sitio usan rutas limpias (`/contacto`, `/noticias`, `/` etc.), por lo que en Vercel la barra de estado mostrará esas rutas en lugar de terminar en `.html`. (El mensaje de destino al pasar el cursor es propio del navegador y no se puede ocultar desde la web.)
