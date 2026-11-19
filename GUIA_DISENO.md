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

- **Textos del sitio:** portada (etiqueta, título, subtítulo y los tres datos: 101,6 km de red, 4 fuentes, 23 hidrantes), nota, accesos, *Sobre nosotros*, *Historia*, *Tecnología*, *Servicios*, *Beneficiarios*, *Cobertura*, ubicación del mapa, nota de tarifas y contenido de *Calidad del agua*.
- **Fichas nuevas:** 5 miembros de junta, 8 colaboradores, 3 tarjetas de tecnología, 5 cifras del inicio, 8 beneficiarios, 4 proyectos, 1 noticia del Sello y 4 noticias de educación ambiental. Las zonas de cobertura y los beneficiarios se actualizaron con los datos de noviembre de 2026 que se detallan abajo.
- Se conservaron el correo, la dirección y el subtítulo del encabezado que ya estaban guardados. El teléfono se completó con el número del informe (2466-86-71). No se inventaron horarios, montos de tarifas ni documentos PDF que el informe no indica.

## Sectores y abastecimiento (datos confirmados por la ASADA, 19/11/2026)

- La sección **Cobertura** muestra ahora 8 fichas: **20 sectores**, **2.379 abonados**, **Naciente Bijagua (1.514 abonados)**, **Naciente El Roble (579)**, **Naciente Altamira (174)** y las tres líneas de tubería que se conservaron: **Sistema Bijagua 41,5 km**, **Sistema El Roble 46,3 km** y **Sistema Altamira 13,8 km** (101,6 km en total).
- Se eliminaron las fichas antiguas que no correspondían a infraestructura: *San Miguel 100*, *Altamira 200* y *Buena Vista y Cuatro Cruces 900*. Las cifras del inicio se mantuvieron, salvo la actualización de infraestructura que se indica abajo.
- El texto de **Cobertura** y el bloque «Brindamos Servicio en:» del mapa también indican el total de 20 sectores.
- Los tres conteos de nacientes suman 2.267 abonados, mientras que el total informado es 2.379. La diferencia (112) no se inventó ni se atribuyó a ninguna fuente: si la ASADA confirma otro origen, se puede agregar como una ficha nueva desde el panel.

## Redacción de servicios

- Se reemplazó la lista con comas pegadas («Abastecimiento de agua potable, mantenimiento de red e hidrantes, control de calidad y atención al abonado») por frases completas. El texto del inicio dice ahora: *«Captamos y distribuimos agua potable en Bijagua y comunidades integradas. Mantenemos la red, los tanques y los hidrantes; controlamos la calidad del agua y atendemos los reportes y trámites de los abonados.»*
- La descripción de la página **Nuestros servicios** quedó como: *«Nuestro trabajo va desde la fuente hasta el grifo. Protegemos las nacientes y cuidamos 101,6 km de red; limpiamos y desinfectamos tanques, reparamos fugas y mantenemos los hidrantes. También hacemos control diario de cloro y atención a los abonados.»*
- Las fichas pasaron de 3 a **4**: Abastecimiento, Mantenimiento, Atención al abonado y **Control de calidad** (prueba diaria de cloro y análisis trimestrales con el AyA y el Laboratorio Nacional de Aguas). En «Atención al abonado» se cambió «trámites de nuevas conexiones» por «trámites del servicio».
- Cada ficha tiene destacados e icono, y se edita en **Panel → Servicios (Nuestros servicios)**. Los textos de encabezado se editan en *Página: Servicios* e *Información y textos*.

## Infraestructura: hidrantes y tanques (datos confirmados, 19/11/2026)

- Se pasó de **21 a 23 hidrantes**. El dato aparece en la portada (*Inicio - dato 3*), en la cifra «hidrantes instalados» y en la ficha **Mantenimiento**.
- Se agregó la cifra **10 tanques de almacenamiento · 755 m³ en total** en *Cifras del inicio*. La ficha **Mantenimiento** también quedó con ese dato y con los 23 hidrantes.
- Estos valores se pueden corregir desde **Panel → Cifras del inicio**, **Panel → Servicios (Nuestros servicios)** e **Información y textos → dato 3 de la portada**.

## Cifras nuevas de *Sobre nosotros* (19/11/2026)

- La sección quedó con **8 tarjetas** (dos filas de cuatro): 101,6 km de red, 4 fuentes, 23 hidrantes, 1.700 árboles sembrados en 2025, 100% de micromedición, 10 tanques · 755 m³, **2.379 abonados atendidos en la red** y **Vigente — una de las únicas ASADAs a nivel nacional con programa ambiental consolidado**.
- La redacción nacional es la indicada por el usuario; el informe del Sello respalda el programa vigente (cámaras trampa, monitoreo de ríos, reforestación «Sembrando Futuro») y la alianza con Bandera Azul Ecológica.
- Se editan en **Panel → Cifras del inicio** (`sitio_cifras`, órdenes 7 y 8). Los mismos ocho valores quedaron como respaldo en `app.js` para que la sección nunca quede vacía si Firestore no responde.

## Beneficiarios del servicio (datos confirmados, 19/11/2026)

- Se eliminaron las fichas antiguas por agrupación de proyecto: *900 habitantes en Buena Vista y Cuatro Cruces*, *100 nuevos abonados de San Miguel* y *200 servicios incorporados de Altamira*.
- En su lugar hay **8 fichas**: **2.379 abonados** (total del servicio), **20 sectores**, **Zonas turísticas**, **Domicilios**, **Escuelas**, **Colegios**, **Comercios** e **Instituciones** (oficinas públicas y centros de salud).
- El texto de la sección dice ahora: *«El servicio atiende a 2.379 abonados en 20 sectores de Bijagua y comunidades integradas. Entre los beneficiarios hay zonas turísticas, domicilios, escuelas, colegios, comercios e instituciones.»*
- Se edita en **Panel → Beneficiarios** y en *Información y textos → Beneficiarios - texto*.

## Textos que faltaban en páginas interiores

- Se corrigió un error en `app.js`: las rutas se comparaban como `/servicios` cuando la variable ya venía como `servicios` (sin barra y sin `.html`). Por eso los textos guardados no se aplicaban en **Servicios, Tarifas, Calidad del agua y Trámites**. Ahora sí se muestran.
- **Quienes somos** ya no tiene texto de plantilla: la historia (1965 → 2025), la misión, la visión y los textos de *Junta Directiva* y *Colaboradores* se editan desde el panel.
- Se agregaron tres espacios nuevos en **Información y textos del sitio**: *Página: Quienes somos*, *Páginas: otros encabezados* y *Página: Contacto*. El panel pasó de 72 a **90 campos**, todos con ejemplo.
- Cualquier elemento con `data-cfg="Nombre del campo"` toma automáticamente el valor guardado, así que no hace falta tocar el HTML para cambiarlo.
- Se cargaron 4 servicios editables y 4 preguntas frecuentes con respuestas tomadas del informe.
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
- El recuadro «Nuestra prioridad» está en flujo normal, alineado a la derecha y debajo de los tres datos del hero, así que no tapa «101.6 km» ni corta «23 hidrantes instalados».
- El subtítulo del hero lleva un fondo blanco translúcido y texto azul oscuro para leerse sobre la fotografía.
- El botón «Preguntas frecuentes» del cierre es blanco con borde blanco sobre el azul marino, también en estado normal.
- El menú «Institución» lleva tilde. «Nueva conexión» pasó a llamarse **Trámites** en menús, página, panel y textos guardados.
- Se usa **abonado/abonados** en lugar de «asociado/asociados» cuando se habla de las personas atendidas (se conservó «Asociación» en el nombre legal y «ecosistemas asociados» en el programa).
- En Transparencia se quitó la categoría **Acta**: solo quedan *Reglamento*, *Formulario* e *Informe*.

## Menú y botones del inicio

- El enlace **Programa Educación Ambiental** del menú ya no se pone verde ni oscuro al pasar el cursor: usa el mismo hover que los demás enlaces (fondo blanco translúcido y texto blanco), así que las letras se leen igual.
- Los tres accesos del hero —**Conocer servicios**, **Reportar una avería** y **Programa Educación Ambiental**— quedan en **una sola fila**. Se ajustó el separador y el tamaño de los botones para que quepan juntos, y se quitó el margen extra que bajaba al tercero. En pantallas menores a 640 px vuelven a envolverse para no salirse de la pantalla.
- La etiqueta superior del inicio dice ahora **«Calidad, Servicio y Desarrollo»** en lugar de «Bijagua, Upala · Sello de Calidad Sanitaria 2026». Se edita en *Información y textos → Inicio - etiqueta* (`Inicio - etiqueta`).

### Iconos y color por botón

- Todos los botones del sitio llevan un **icono lineal minimalista** (16 px, trazo de 1.9) que representa su destino. El icono se elige por el texto, el enlace o el `id` del botón, así que también aparece en los botones que se generan desde Firestore y en los del panel administrativo.
- El **color del botón es el color de su icono**: azul para servicios y noticias, verde para el programa ambiental y acciones de guardar, ámbar para reportes de averías, turquesa para preguntas y contacto, dorado para documentos y tarifas, morado para la junta directiva, rojo para eliminar y gris para cancelar.
- El botón **Programa Educación Ambiental** dejó de ser blanco: ahora es **verde** con el icono de una hoja, tanto en el hero como en el bloque «Creciendo por la vida» y en el menú del panel.
- Los botones delineados (`ghost`) usan el mismo tono en el borde y en el texto; al pasar el cursor se rellenan con ese color y el texto pasa a blanco.
- Los tres botones del hero siguen en **una sola fila** y el icono no rompe el ajuste: en pantallas menores a 640 px se envuelven como antes.
- Las reglas viven en `buttons.css` (carga después de `styles.css` y antes de `dark.css`); la asignación de iconos está en `app.js` (`BTN_ICONS`, `BTN_RULES` y `decorateButtons`).

### Sin textos incorrectos durante la carga

- El HTML estático de la portada ya contiene los **mismos valores guardados en Firestore** (títulos, subtítulos, los tres datos del hero, mapa, avisos, beneficiarios y pie de página). Por eso no aparecen durante milisegundos textos viejos como «Gestión comunal / Sin fines de lucro», «Bosque y agua / Una sola fuente» ni los teléfonos `0000-0000`.
- Los tres datos del hero son ahora **101.6 km**, **4** y **23**, con sus detalles actualizados. La tarjeta «Avisos de servicio» dejó de mostrar una descripción de tarifas: se corrigió el valor guardado en `Acceso 1 - descripción`.
- El pie de página de **las 16 páginas** muestra ya la dirección, los teléfonos `+506 2466 8671` y el correo `asadabijagua@gmail.com`, en lugar de los marcadores de ejemplo.
- El bloque «Últimas actividades» del inicio dice «Cargando actividades…» mientras llegan los datos, en vez de «Pronto compartiremos aquí las novedades…», que era engañoso.
- Si en el futuro se cambia un texto desde el panel, conviene actualizar también el respaldo estático correspondiente para mantener este comportamiento.

### Fotos que aparecen detrás del texto del inicio

- Se suben en **Panel → ASADA (Sitio) → General y páginas → Fondos e imágenes** (`sitio_fondo`).
- Hay **tres espacios** para el carrusel: *Mapeo de acueductos (foto principal)* (foto 1), *Foto del inicio 2* y *Foto del inicio 3*. Cada espacio admite una imagen; si sube otra en el mismo espacio, reemplaza a la anterior.
- Las fotos se ven con transparencia sobre los colores del sitio para que el texto siga siendo legible. Si algún espacio está vacío, el carrusel reutiliza la foto principal.
- Actualmente solo hay una foto cargada (la principal), así que los tres slides muestran esa misma imagen hasta que se suban la 2 y la 3.
- Las fotos se reducen automáticamente antes de subirse (máximo 1800 px y JPEG al 82 %) para evitar el error «No se pudo guardar…» con fotografías grandes de teléfono. Los PDF no se modifican.
- Si todavía falla, el aviso del panel indica el paso exacto: **Appwrite** (subida del archivo) o **Firestore** (guardado del registro), en lugar de un mensaje genérico.
- Si Firestore responde `429 RESOURCE_EXHAUSTED`, se agotó la **cuota del plan** (lecturas/escrituras). No es un problema de permisos ni de la foto: se reinicia diariamente o requiere mejorar el plan de Firebase. Mientras tanto, el sitio puede seguir mostrando la última información cargada, pero no se podrán guardar cambios nuevos.
- Para reducir el consumo, conviene cerrar otras pestañas o la consola de Firebase que mantengan escuchas activas (`Listen/channel`) sobre el mismo proyecto.

## Contacto: números y WhatsApp

- La página de contacto muestra el lema **«BIJAGUA · Calidad, Servicio y Desarrollo»**, el número de **servicio al cliente 8365 1396** (enlace `tel:`) y los **6 números de fontanería** sin nombres personales: 8436 5091, 8541 0371, 8641 0227, 8892 6900, 8651 2902 y 8792 1030.
- Hay un aviso visible: la respuesta al formulario o al soporte depende de la disponibilidad del personal para revisar el buzón, y se recomienda llamar siempre al número directo de la ASADA.
- En esa página aparece una **burbuja circular de WhatsApp** fija abajo a la derecha y un botón «Escribir por WhatsApp» en la columna de contacto. Ambos abren `https://wa.me/` con el número configurado; en el resto del sitio se mantiene el botón verde que lleva a Contacto.
- El número de WhatsApp se edita en **Página: Contacto → Número de WhatsApp** (solo dígitos, con código de país 506). Al guardarlo, los dos enlaces se actualizan solos.
- Los 6 campos de este espacio (lema, descripción, servicio al cliente, WhatsApp, números de fontanería y aviso) llevan ejemplo en el panel.

## Animaciones y accesibilidad

- Botones con onda al presionar, flechas con escalado, indicadores con pulso, tarjetas que se elevan y entradas de sección con `IntersectionObserver`.
- Respeta `prefers-reduced-motion`.
- La burbuja de accesibilidad conserva **Tamaño de texto**, pero el interruptor de «Alto contraste» fue reemplazado por **Modo oscuro**.
- El modo oscuro cubre encabezado, menú, tarjetas, tablas de tarifas, panel administrativo, cargador, pie de página y la página del Programa de Educación Ambiental; no invierte fotografías ni logos.
- La paleta es **azul marino** en lugar de blanco (`--bg:#0a2540`, superficies `#103257` / `#071d33`) y **todo el texto va en blanco**, incluidos títulos, párrafos, enlaces, etiquetas y botones. Se ajustaron las reglas con `!important` más específicas del subtítulo del hero y del bloque «Creciendo por la vida» para que ningún texto quedara oscuro sobre el fondo azul.
- Cada botón conserva su color propio en modo oscuro (más oscuro para mantener el contraste) y sus letras siguen siendo blancas.
- La preferencia se guarda en `localStorage.asada_dark` y se aplica con un script diminuto antes de cargar los estilos, así que no hay destello de la versión clara. Si no hay preferencia guardada, sigue la preferencia del sistema (`prefers-color-scheme: dark`). Las visitas que tenían guardado el antiguo alto contraste conservan el modo oscuro automáticamente.
- Para probarlo: abra la burbuja azul inferior derecha → **Modo oscuro**. Para volver a la versión clara, repita la acción.
- **Barrido completo de superficies:** ya no queda ningún cuadro blanco. Se cambiaron a azul marino el velo del hero (`.aya-hero-shade`), las gotas del cargador, las filas alternas y celdas de las tablas de tarifas, las secciones «Sobre nosotros / historia / tecnología / avisos», el fondo detrás del mapa y las imágenes de tecnología, los fondos de las diapositivas del carrusel, los iconos de los servicios, los puntos de navegación, el menú móvil, las líneas decorativas de la historia y del programa, y las fechas y tarjetas de noticias.
- Las tarjetas de junta y colaboradores (p. ej. Melvin Rojas) usan ahora un degradado azul marino en el espacio de la foto cuando no hay imagen, en vez del azul claro `#cfe3f5` del diseño original.
- Siguen como acentos de marca, por ser pequeños e intencionales: el botón dorado de búsqueda, los puntos activos del carrusel, la etiqueta «Programa de Educación Ambiental», las hojas decorativas, el botón verde de WhatsApp, las rayas del menú hamburguesa y el control deslizante de accesibilidad.

## Prueba local

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173`.

## Publicación en Vercel (URLs sin `.html`)

Se incluye `vercel.json` con `cleanUrls` y `trailingSlash: false`. Los enlaces del sitio usan rutas limpias (`/contacto`, `/noticias`, `/` etc.), por lo que en Vercel la barra de estado mostrará esas rutas en lugar de terminar en `.html`. (El mensaje de destino al pasar el cursor es propio del navegador y no se puede ocultar desde la web.)
