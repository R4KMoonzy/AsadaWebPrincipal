/* ASADA Bijagua - app.js
   La autenticación se valida en Firebase Auth (servidor), nunca en este archivo. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { Client, Storage, ID } from "https://cdn.jsdelivr.net/npm/appwrite@16.0.2/+esm";

/* Appwrite solo permite subir archivos desde www.asadabijagua.com.
   Si alguien entra por el dominio sin www, lo llevamos al dominio canonical
   para que el panel pueda subir logos, fotos y documentos. */
if (location.hostname === "asadabijagua.com") {
  location.replace("https://www.asadabijagua.com" + location.pathname + location.search + location.hash);
}

/* ---------- CONFIGURACION (plantilla) ---------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBJgoW1gFTgnoKFSuVvkGOKaNrVSROhvj4",
  authDomain: "asadawebprincipal.firebaseapp.com",
  projectId: "asadawebprincipal",
  storageBucket: "asadawebprincipal.firebasestorage.app",
  messagingSenderId: "590204785431",
  appId: "1:590204785431:web:e5aa4ddd449a1eaf2a1d52",
  measurementId: "G-MXVQRLNKDE"
};
const APPWRITE_CONFIG = {
  endpoint: "https://nyc.cloud.appwrite.io/v1",
  projectId: "6af477840009bd198145",
  bucketId: "6af477980014e69c5286"
};
const SITE = { nombre: "ASADA Bijagua", subtitulo: "Asociación Administradora del Acueducto, Upala", telefono: "+506 2466 8671", correo: "asadabijagua@gmail.com", emergencia: "+506 2466 8671", horario: "Consulte el horario por teléfono al 2466-86-71", direccion: "Frente a Tienda Nidia, Bijagua centro, Upala, Alajuela" };
let SITE_CFG = {};
const DEFAULT_PAGE_TEXT = {
  "Servicios - título": "Nuestros servicios",
  "Servicios - descripción": "Nuestro trabajo va desde la fuente hasta el grifo. Protegemos las nacientes y cuidamos 101,6 km de red; limpiamos y desinfectamos tanques, reparamos fugas y mantenemos los hidrantes. También hacemos control diario de cloro y atención a los abonados.",
  "Tarifas - título": "Tarifas",
  "Tarifas - descripción": "Cuotas vigentes del servicio.",
  "Tarifas - nota": "Tarifas aprobadas por la Intendencia de Agua de ARESEP, vigentes del 1 de enero al 31 de diciembre de 2026. El cargo fijo de ₡ 2 800 mensuales aplica a todas las categorías del Servicio de Acueducto. La Tarifa de Protección del Recurso Hídrico se cobra por metro cúbico consumido. «Tarifa anterior» es la que estaba vigente antes del 1 de enero de 2026.",
  "Calidad del agua - título": "Calidad del agua",
  "Calidad del agua - descripción": "Control y vigilancia del agua de consumo.",
  "Calidad del agua - contenido": "La ASADA realiza controles periodicos de la calidad del agua. Publique aqui los resultados mas recientes y enlace los informes en Transparencia.\n\nConsultar informes: /documentos",
  "Trámites - título": "Trámites",
  "Trámites - descripción": "Realice sus solicitudes de agua potable y alcantarillado sanitario en Bijagua y comunidades atendidas. Aquí encontrará los formularios vigentes, una guía general de requisitos y el proceso de atención. Si necesita orientación, llame al +506 2466 8671 o escriba a asadabijagua@gmail.com.",
  "Trámites - requisitos": "Cada formulario indica los requisitos, condiciones y plazos aplicables a su trámite. Descargue el que corresponda, complételo y preséntelo en la oficina de la ASADA, frente a Tienda Nidia, Bijagua centro, de lunes a viernes de 8:00 a.m. a 4:00 p.m. También puede consultar la lista actualizada al correo asadabijagua@gmail.com o al teléfono +506 2466 8671.",
  "Trámites - proceso": "1. Descargue y complete el formulario según lo que desea solicitar.\n\n2. Preséntelo en la oficina de la ASADA con la documentación que indique el formulario.\n\n3. La Junta Directiva revisa la solicitud y resuelve según la disponibilidad del servicio en el sector y la normativa vigente.\n\n4. Para consultar el estado de su trámite, comuníquese al +506 2466 8671 o escriba a asadabijagua@gmail.com.",
  "Trámites - formularios": "Seleccione el formulario según el trámite que desea realizar. Cada descarga incluye sus requisitos y condiciones. Si no sabe cuál necesita, consulte en la oficina o llame al +506 2466 8671."
};
/* Ejemplos que se muestran debajo de cada campo del panel (no se guardan ni se usan como valor). */
const FIELD_EXAMPLES = {
  // Identidad y contacto
  "Nombre de la ASADA": "ASADA Bijagua",
  "Subtítulo del encabezado": "Asociación Administradora del Acueducto, Upala",
  "Teléfono": "+506 2478 1234",
  "Teléfono emergencias": "+506 8812 3456 (atención de fugas 24 horas)",
  "Correo": "nombre@ejemplo.cr",
  "Dirección/ubicación": "Bijagua, Upala, Alajuela",
  "Horario de oficina": "Lunes a viernes, 8:00 a.m. – 4:00 p.m.",
  // Inicio: portada
  "Inicio - etiqueta": "Calidad, Servicio y Desarrollo",
  "Inicio - título": "El agua que cuida<br>nuestro pueblo",
  "Inicio - subtítulo": "Gestionamos y protegemos el agua potable de Bijagua con transparencia y compromiso comunal.",
  "Inicio - nota (etiqueta)": "Nuestra prioridad",
  "Inicio - nota (texto)": "Cuidar cada gota es cuidar la salud de todas las familias.",
  "Inicio - dato 1": "101,6 km", "Inicio - dato 1 detalle": "de red instalada en los sistemas",
  "Inicio - dato 2": "4", "Inicio - dato 2 detalle": "fuentes de abastecimiento protegidas",
  "Inicio - dato 3": "23", "Inicio - dato 3 detalle": "hidrantes instalados en la comunidad",
  // Inicio: botones y accesos
  "Inicio - botón 1 texto": "Conocer nuestros servicios", "Inicio - botón 1 enlace": "/servicios",
  "Inicio - botón 2 texto": "Realizar un trámite", "Inicio - botón 2 enlace": "/afiliacion",
  "Inicio - botón 3 texto": "Reportar una avería", "Inicio - botón 3 enlace": "/contacto",
  "Acceso 1 - título": "Tarifas", "Acceso 1 - descripción": "Consulte las cuotas vigentes del servicio.", "Acceso 1 - enlace": "/tarifas",
  "Acceso 2 - título": "Calidad del agua", "Acceso 2 - descripción": "Informes y controles de calidad del agua.", "Acceso 2 - enlace": "/calidad-agua",
  "Acceso 3 - título": "Transparencia", "Acceso 3 - descripción": "Documentos, reglamentos e informes públicos.", "Acceso 3 - enlace": "/documentos",
  "Acceso 4 - título": "Programa ambiental", "Acceso 4 - descripción": "Creciendo por la vida: educación ambiental.", "Acceso 4 - enlace": "/programa",
  // Inicio: secciones
  "Sobre nosotros - título": "Sobre nosotros", "Sobre nosotros - texto": "Somos una asociación comunal sin fines de lucro encargada de administrar el acueducto de Bijagua.",
  "Historia - título": "Nuestra historia", "Historia - texto": "Desde 1998 trabajamos por llevar agua potable a cada hogar de la comunidad.",
  "Tecnología - título": "Tecnología al servicio del agua", "Tecnología - texto": "Monitoreo de la red, mantenimiento preventivo y lectura digital de medidores.",
  "Servicios - título inicio": "Nuestros servicios", "Servicios - descripción inicio": "Captamos y distribuimos agua potable en Bijagua y comunidades integradas. Mantenemos la red, los tanques y los hidrantes; controlamos la calidad del agua y atendemos los reportes y trámites de los abonados.",
  "Avisos - título inicio": "Avisos para la comunidad", "Avisos - descripción inicio": "Cortes programados, mantenimientos y noticias importantes.",
  "Noticias - título inicio": "Últimas actividades",
  "Beneficiarios - título": "Beneficiarios del servicio", "Beneficiarios - texto": "El servicio atiende a 2.379 abonados en 20 sectores. Entre los beneficiarios hay zonas turísticas, domicilios, escuelas, colegios, comercios e instituciones.",
  // Mapa y cobertura
  "Cobertura - título": "Zonas de cobertura", "Cobertura - texto": "Nuestra red llega a Bijagua y comunidades vecinas del cantón de Upala.",
  "Mapa - etiqueta lateral": "Estamos aquí", "Mapa - título lateral": "Nuestra ubicación", "Mapa - texto lateral": "Visítenos en la oficina de la ASADA, en el centro de Bijagua.",
  "Mapa - etiqueta ubicación": "Estamos ubicados en:", "Mapa - valor ubicación": "Bijagua, Upala",
  "Mapa - etiqueta cobertura": "Brindamos Servicio en:", "Mapa - valor cobertura": "Bijagua y comunidades vecinas",
  "Mapa - coordenadas": "10.7167, -85.0667", "Mapa (URL para insertar)": "https://www.google.com/maps?q=Bijagua,Upala&output=embed",
  // Páginas interiores
  "Servicios - título": "Nuestros servicios", "Servicios - descripción": "Nuestro trabajo va desde la fuente hasta el grifo. Protegemos las nacientes y cuidamos la red; limpiamos tanques, reparamos fugas y controlamos la calidad del agua.",
  "Tarifas - título": "Tarifas", "Tarifas - descripción": "Cuotas aprobadas por ARESEP, vigentes del 1 de enero al 31 de diciembre de 2026.",
  "Tarifas - nota": "Tarifas aprobadas por la Intendencia de Agua de ARESEP, vigentes del 1 de enero al 31 de diciembre de 2026. El cargo fijo de ₡ 2 800 mensuales aplica a todas las categorías del Servicio de Acueducto. La Tarifa de Protección del Recurso Hídrico se cobra por metro cúbico consumido. «Tarifa anterior» es la que estaba vigente antes del 1 de enero de 2026.",
  "Calidad del agua - título": "Calidad del agua", "Calidad del agua - descripción": "Control y vigilancia del agua de consumo.",
  "Calidad del agua - contenido": "Publicamos aquí los resultados de los análisis periódicos del agua.",
  "Trámites - título": "Trámites", "Trámites - descripción": "Ejemplo: Realice sus solicitudes en Bijagua. Aquí encontrará los formularios vigentes, requisitos y el proceso de atención. Llame al +506 2466 8671 si necesita orientación.",
  "Trámites - requisitos": "Ejemplo: Cada formulario indica los requisitos, condiciones y plazos aplicables. Preséntelo en la oficina de la ASADA, frente a Tienda Nidia, Bijagua centro, de lunes a viernes de 8:00 a.m. a 4:00 p.m.",
  "Trámites - proceso": "Ejemplo: 1. Descargue y complete el formulario. 2. Preséntelo en la oficina con la documentación indicada. 3. La Junta Directiva revisa y resuelve según disponibilidad. 4. Consulte el estado al +506 2466 8671.",
  "Trámites - formularios": "Ejemplo: Seleccione el formulario según su trámite. Cada descarga incluye requisitos y condiciones. Si no sabe cuál necesita, llame al +506 2466 8671.",
  // Quienes somos
  "Nosotros - título": "Quienes somos", "Nosotros - descripción": "La ASADA Bijagua es una asociación comunal que gestiona el agua potable del distrito.",
  "Nosotros - historia": "Desde 1965, los vecinos construyeron la primera captación. En 2010 se constituyó la ASADA Bijagua.",
  "Nosotros - misión": "Gestionar y proteger el sistema de agua potable con transparencia y participación comunal.",
  "Nosotros - visión": "Ser un acueducto comunal sostenible, con agua segura para todas las familias de Bijagua.",
  "Nosotros - junta descripción": "Integrantes y cargos vigentes de la Junta Directiva.",
  "Nosotros - colaboradores descripción": "Personas que trabajan y apoyan la labor de la ASADA.",
  // Encabezados de otras páginas
  "Noticias - descripción página": "Comunicados, avances y novedades de la ASADA Bijagua.",
  "Avisos - descripción página": "Cortes de agua programados y trabajos de mantenimiento.",
  "Proyectos - descripción página": "Obras y mejoras del acueducto comunal.",
  "Transparencia - descripción página": "Reglamentos, formularios e informes públicos.",
  "Preguntas frecuentes - descripción página": "Respuestas a las consultas más comunes sobre el servicio.",
  "Contacto - descripción página": "Estamos para atender reportes y consultas de la comunidad.",
  "Contacto - lema": "BIJAGUA · Calidad, Servicio y Desarrollo",
  "Contacto - servicio al cliente": "8365 1396 (número de atención al abonado)",
  "Contacto - WhatsApp": "50683651396 (solo números, con código de país 506; sin espacios ni guiones)",
  "Contacto - números de fontanería": "8436 5091 / 8541 0371 / 8641 0227 / 8892 6900 / 8651 2902 / 8792 1030 (uno por línea, sin nombres)",
  "Contacto - aviso de respuesta": "La respuesta al formulario o al soporte puede verse perjudicada según la disponibilidad del personal para revisar el buzón de mensajes. Se recomienda hacer siempre una llamada telefónica al número directo de la ASADA.",
  // Campos usuales del resto de formularios
  "titulo": "Mantenimiento de la red en La Florida",
  "descripcion": "Una explicación breve y clara para la comunidad.",
  "contenido": "Escriba el texto principal; puede usar saltos de línea.",
  "resumen": "Trabajos programados del 25 al 27 de noviembre.",
  "etiqueta": "Tarifas 2026",
  "destino": "/contacto, #sec-voluntariado o https://ejemplo.cr",
  "clave": "convenios", "slug": "convenios",
  "pagina": "Sección en: Inicio", "vista": "Sección en: Inicio del programa",
  "ubicacion": "Menú principal", "orden": "1 (los números menores aparecen primero)", "visible": "Sí (elija No para ocultarlo temporalmente)",
  "nombre": "Juan Pérez", "cargo": "Presidente", "pregunta": "¿Cómo reporto una fuga de agua?",
  "respuesta": "Llame al teléfono de emergencias o escribanos por WhatsApp.",
  "categoria": "Informe", "cuota": "₡3.500 por mes", "observaciones": "Incluye mantenimiento de la red.",
  "anio": "1998 (o también: Hoy)", "km": "12", "prefijo": "Más de", "numero": "1.200",
  "chips": "Atención 24 horas / Facturación en línea / Informes",
  "sector": "La Florida", "fecha": "2026-11-25", "horario": "8:00 a.m. – 12:00 p.m.",
  "motivo": "Reparación de una fuga en la tubería principal.", "estado": "Programado",
  "icono": "drop (gota de agua)", "imagenId": "Seleccione una foto horizontal de la comunidad.",
  "logoId": "Seleccione el logo en PNG con fondo transparente.", "fotoId": "Seleccione una foto de la persona.",
  "archivoId": "Seleccione el documento PDF desde su equipo.", "texto": "Escriba aquí el texto que desea mostrar.",
  // Ejemplos según la sección (cuando el mismo campo significa cosas distintas)
  "sitio_tarifa.servicio": "Acueducto (o: Protección del Recurso Hídrico)",
  "sitio_tarifa.categoria": "Residencial",
  "sitio_tarifa.bloque": "0–15 m³ (o: Cargo fijo mensual)",
  "sitio_tarifa.cuota": "₡ 277",
  "sitio_tarifa.vigente": "₡ 264",
  "sitio_tarifa.variacion": "+₡ 13 / +4,80%",
  "lf_zona.nombre": "Naciente El Roble (o: Total de sectores)",
  "lf_zona.km": "1.514 (o: 41.5 km de tubería)",
  "lf_zona.descripcion": "abonados abastecidos por la naciente El Roble",
  "lf_cifra.numero": "23 (también: 2.379 o Vigente)",
  "lf_cifra.etiqueta": "hidrantes instalados (o: abonados atendidos en la red / una de las únicas ASADAs a nivel nacional con programa ambiental consolidado)",
  "lf_beneficio.numero": "2.379 abonados (o: Zonas turísticas)",
  "lf_beneficio.etiqueta": "total del servicio en la red (o: hoteles, alojamientos y restaurantes de la zona)",
  "sitio_fondo.clave": "Fondo Inicio (hero)",
  "prog_fondo.clave": "Fondo Inicio del programa (hero)",
  "prog_texto.clave": "Misión (también: Historia, Valores, Objetivo principal…)",
  "sitio_logo.logoId": "Logo oficial de la ASADA, en PNG con fondo transparente",
  "prog_logo.logoId": "Logo del programa Creciendo por la vida",
  "documento.archivoId": "Reglamento de tarifas 2026.pdf",
  "documento.descripcion": "**Procedimiento:** trámite y código del formulario.\n\n**Requisitos del usuario:**\n* Completar el formulario.\n* Presentar identificación.\n\n**Consideraciones adicionales:** plazos y condiciones."
};
// La etiqueta del hero se fija de inmediato para que no se vea un texto anterior
// mientras se cargan los valores guardados desde Firestore.
{
  const pill = document.getElementById("lf-hero-pill");
  if (pill) pill.textContent = DEFAULT_PAGE_TEXT["Inicio - etiqueta"];
}
const exampleFor = (key, label = "", type = "text", k = "") => {
  const exact = (k && FIELD_EXAMPLES[k + "." + key]) || FIELD_EXAMPLES[key];
  let ex = exact;
  if (!ex) {
    const l = String(label || key || "").toLowerCase();
    if (type === "select") ex = "Elija una de las opciones de la lista";
    else if (type === "file") ex = "Seleccione el archivo desde su equipo (imagen o PDF, según el campo)";
    else if (type === "number") ex = "1 (los números menores aparecen primero)";
    else if (type === "date") ex = "2026-11-25";
    else if (/correo|email/.test(l)) ex = FIELD_EXAMPLES["Correo"];
    else if (/tel[eé]fono/.test(l)) ex = FIELD_EXAMPLES["Teléfono"];
    else if (/enlace|destino|url|iframe/.test(l)) ex = FIELD_EXAMPLES["destino"];
    else if (/t[ií]tulo/.test(l)) ex = "Un título claro y breve para la comunidad";
    else if (/descripci[oó]n|texto|contenido|motivo/.test(l)) ex = "Explique de forma breve y clara de qué se trata";
    else ex = "Escriba aquí el valor que desea mostrar en el sitio";
  }
  return String(ex).replace(/^ej:\s*/i, "");
};
const DEFAULT_SERVICIOS = [
  { titulo:"Abastecimiento", descripcion:"Captamos el agua en nuestras fuentes y la distribuimos en Bijagua y comunidades integradas. La red instalada suma 101,6 km.", chips:"Captación y conducción\nRed de distribución\n101,6 km instalados", icono:"drop", orden:1, visible:"Sí" },
  { titulo:"Mantenimiento", descripcion:"Limpiamos y desinfectamos las fuentes y los 10 tanques de almacenamiento, con 755 m³ de capacidad total. Reparamos fugas, mejoramos la red y damos mantenimiento a los 23 hidrantes instalados.", chips:"Limpieza y desinfección\nReparación de fugas\n23 hidrantes\n10 tanques · 755 m³", icono:"tool", orden:2, visible:"Sí" },
  { titulo:"Atención al abonado", descripcion:"Recibimos reportes de averías y consultas. También tomamos lecturas de medidores y gestionamos los trámites del servicio.", chips:"Reportes de averías\nLectura de medidores\nTrámites", icono:"bolt", orden:3, visible:"Sí" },
  { titulo:"Control de calidad", descripcion:"Probamos el cloro libre en la red todos los días y realizamos análisis trimestrales con el AyA y el Laboratorio Nacional de Aguas.", chips:"Cloro diario\nAnálisis trimestrales\nSello de Calidad Sanitaria", icono:"shield", orden:4, visible:"Sí" }
];
const DEFAULT_TARIFAS = [
  { servicio: "Acueducto", categoria: "Residencial", bloque: "Cargo fijo mensual", cuota: "₡ 2 800", vigente: "₡ 2 800", variacion: "0,00%", orden: 1, visible: "Sí" },
  { servicio: "Acueducto", categoria: "Residencial", bloque: "0–15 m³", cuota: "₡ 277", vigente: "₡ 264", variacion: "+₡ 13 / +4,80%", orden: 2, visible: "Sí" },
  { servicio: "Protección del Recurso Hídrico", categoria: "Residencial", bloque: "0–15 m³", cuota: "₡ 24,88", vigente: "₡ 28,67", variacion: "-₡ 3,79 / -13,22%", orden: 3, visible: "Sí" }
];
const loadSiteConfig = async () => {
  try {
    const rows = await listDocs("sitio_config", "creadoEn", "desc", 200);
    const map = {};
    rows.forEach(r => { if (r.clave && !(r.clave in map)) map[r.clave] = r; });
    SITE_CFG = map;
    // Cualquier texto del HTML marcado con data-cfg se edita desde el panel.
    $$("[data-cfg]").forEach(el => {
      const v = map[el.dataset.cfg]?.valor;
      if (v == null) return;
      if (el.dataset.cfgHtml === "1") el.innerHTML = paras(String(v));
      else el.textContent = v;
    });
    // La burbuja de WhatsApp toma el número desde el panel administrativo.
    const waNumero = String(map["Contacto - WhatsApp"]?.valor || "").replace(/\D/g, "");
    if (waNumero) $$("#wa-bubble, #wa-inline").forEach(a => { a.href = "https://wa.me/" + waNumero; });
    const val = k => map[k]?.valor;
    if (val("Nombre de la ASADA")) SITE.nombre = val("Nombre de la ASADA");
    if (val("Subtítulo del encabezado")) SITE.subtitulo = val("Subtítulo del encabezado");
    if (val("Teléfono")) SITE.telefono = val("Teléfono");
    if (val("Correo")) SITE.correo = val("Correo");
    if (val("Teléfono emergencias")) SITE.emergencia = val("Teléfono emergencias");
    if (val("Horario de oficina")) SITE.horario = val("Horario de oficina");
    if (val("Dirección/ubicación")) SITE.direccion = val("Dirección/ubicación");
    const root = document.documentElement;
    const heroBg = map["Mapeo de acueductos (foto principal)"]?.imagenId || map["Fondo Inicio (hero)"]?.imagenId;
    if (heroBg) root.style.setProperty("--site-hero-bg", `url("${fileView(heroBg)}")`);
    const heroBg2 = map["Foto del inicio 2"]?.imagenId || map["Fondo Inicio (hero) 2"]?.imagenId;
    if (heroBg2) root.style.setProperty("--site-hero-bg2", `url("${fileView(heroBg2)}")`);
    const heroBg3 = map["Foto del inicio 3"]?.imagenId || map["Fondo Inicio (hero) 3"]?.imagenId;
    if (heroBg3) root.style.setProperty("--site-hero-bg3", `url("${fileView(heroBg3)}")`);
    const headBg = map["Fondo encabezados de páginas"]?.imagenId; if (headBg) root.style.setProperty("--site-head-bg", `url("${fileView(headBg)}")`);
  } catch (e) { }
  $$(".site-name").forEach(el => el.textContent = SITE.nombre);
  // Permite saltos de línea con <br> sin dejar HTML arbitrario.
  const subtitleHTML = String(SITE.subtitulo || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  $$(".site-subtitle").forEach(el => el.innerHTML = subtitleHTML);
  $$(".site-tel").forEach(el => el.textContent = SITE.telefono);
  $$(".site-mail").forEach(el => el.textContent = SITE.correo);
  $$(".site-emerg").forEach(el => el.textContent = SITE.emergencia);
  $$(".site-horario").forEach(el => el.textContent = SITE.horario);
  $$(".site-dir").forEach(el => el.textContent = SITE.direccion);
  applySiteLogo();
  return SITE_CFG;
};
const PROG = {
  t: {
    "Resumen": "El programa nació en 2017 como plan piloto de su fundadora, Pamela Valerio Muñoz, para que la ASADA fuera más allá del abastecimiento de agua y promoviera la cultura del agua junto a la comunidad. Hoy destaca a nivel nacional por su ejecución continua, la ciencia ciudadana y el monitoreo constante.",
    "Historia": "El programa \"Creciendo por la vida\" nació en el año 2017 como un plan piloto impulsado por su fundadora, Pamela Valerio Muñoz. Surgió a raíz de un proyecto universitario cuya propuesta demostró a la Junta Directiva la necesidad de que la ASADA se proyectara hacia la comunidad, yendo más allá del abastecimiento de agua para enfocarse en promover la cultura del agua, sensibilizar a la población y trabajar de la mano con las personas.\nLas primeras acciones consistieron en impartir charlas en escuelas y colegios de la zona. Año con año, la iniciativa sumó nuevos grupos meta y aliados estratégicos, logrando un crecimiento tan notorio que la Junta Directiva decidió asignar un presupuesto específico exclusivo para educación ambiental. Actualmente, gracias a la implementación de la tarifa de protección del recurso hídrico, el programa cuenta con un mayor presupuesto para ejecutar y expandir sus proyectos. Hoy en día, el programa destaca a nivel nacional por su ejecución continua y se apoya en la ciencia ciudadana, el monitoreo constante y la participación comunitaria.",
    "Misión": "Promover la educación ambiental en la comunidad mediante procesos formativos, participativos e inclusivos, orientados a fortalecer la cultura del uso responsable del recurso hídrico, la conservación de las fuentes de agua y el cuidado del entorno, contribuyendo así a la sostenibilidad del servicio.",
    "Visión": "Ser un programa de educación ambiental reconocido por su impacto positivo en la conciencia y las prácticas ambientales de la comunidad, consolidándose como un referente en la gestión responsable del recurso hídrico, la protección de las fuentes de abastecimiento y la participación ciudadana en la conservación del agua y los ecosistemas asociados.",
    "Objetivo principal": "Promover la conciencia ambiental y el compromiso ciudadano frente a los problemas ecológicos actuales, incentivando cambios de conducta sostenibles que contribuyan al cuidado del medio ambiente y al desarrollo de una comunidad más responsable con su entorno natural, especialmente en la comunidad de Bijagua de Upala.",
    "Filosofía": "La gestión comunitaria para la protección del recurso hídrico se refiere a la participación activa de la comunidad en la toma de decisiones, el control y la administración del uso y manejo del agua en su localidad.\nPara lograr esta gestión es necesario trabajar bajo los siguientes valores:",
    "Valores": "Responsabilidad compartida (corresponsabilidad).\nSolidaridad.\nParticipación y empoderamiento de los miembros de la comunidad en la protección del recurso hídrico, facilitando así el cumplimiento del derecho humano al agua.",
    "Ejes temáticos": "Recurso hídrico\nIncendios forestales\nDeportes\nBuenas prácticas ambientales\nGestión de residuos\nMonitoreo\nLiderazgo\nSalud ocupacional\nCambio climático",
    "Grupos meta": "Niños\nJóvenes\nAdultos y Adultos Mayores\nGrupos de Hombres y Mujeres\nSector Turismo y Comercio"
  },
  cifras: [["alrededor de", 950, "personas capacitadas en un solo año"], ["hasta", 2000, "árboles sembrados en un año"], ["alrededor de", 20, "especies de fauna registradas con cámaras trampa"]],
  proyectos: [
    ["Capacitación continua", "Capacitamos a alrededor de 950 personas en un solo año a través de actividades mensuales. Cada evento se documenta y se publica el mismo día en nuestra página de Facebook para mantener la transparencia y conexión con la comunidad."],
    ["Reforestación", "Hemos logrado sembrar hasta 2,000 árboles en un año, involucrando a diferentes grupos meta en la labor."],
    ["Santuario de la Danta", "Este espacio, ubicado donde se encuentra la naciente de Bijagua, funciona como un aula abierta. Gracias a la colaboración del ICT, que donó la rotulación del lugar, recibimos a estudiantes universitarios y miembros de la comunidad para explorar el funcionamiento del agua desde su captación."],
    ["Monitoreo de vida silvestre", "En el Santuario de la Danta ejecutamos un proyecto de ciencia ciudadana con cámaras trampa, mediante el cual hemos logrado identificar y registrar alrededor de 20 especies de fauna."]
  ],
  aliados: ["SINAC","Banco Nacional de Costa Rica ","Grupo Colono","Instituto Costarricense de Turismo","Casitas","Agua y Sol","Verdulera Taltu","Tapir Valley","Agathos","Semilla","Asada H","Canalet","SJ Upala","Las Flores","M y F","Rio Celeste Dreams","Nessi Nails","CIEM","Color Pastel","Kal","Terraza","Elena Nails","Centro de Belleza Calipso","Floristería Kal","Lago Tortuga","Villa Tucán","Cataratas Bijagua","Asada Zapote","Renacer","Grupo de Guías Scouts Tenorio","Coopeguanacaste","Gobierno Municipal de Upala","Ministerio de Salud","Amaneo","Instituto Costarricense de Electricidad","Restaurante Barrigón","Hidromedición","Benemerito Cuerpo de Bomberos de Costa Rica","Benemerita Cruz Roja Costarricense","Instituto Nacional de Aprendizaje","Planta Nueva Vida","Finca de Té","Asada Guatuso","Tapir Vet","Green Hill","Heliconia","Aves Tierras Altas","Transportes Pincho"]
};
/* Colecciones: noticias, cortes, documentos, faqs, junta, proyectos, contactos */

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
// La sesión se conserva entre recargas; Firebase valida el token en el servidor.
setPersistence(auth, browserLocalPersistence).catch(() => { });
const storage = new Storage(new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId));

/* ---------- UTILIDADES ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtReq = t => String(t ?? "").split("\n").map(line => {
  const strong = esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return strong.replace(/^(\s*)\*\s+/, "$1• ").replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
}).join("\n");
const toDate = v => v?.toDate ? v.toDate() : (v ? new Date(String(v).length === 10 ? v + "T00:00:00" : v) : null);
const fmt = v => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" }) : ""; };
const fileView = id => id ? String(storage.getFileView(APPWRITE_CONFIG.bucketId, id)) : "";
const fileDown = id => id ? String(storage.getFileDownload(APPWRITE_CONFIG.bucketId, id)) : "";
/* isAdmin() solo refleja la sesión que Firebase validó en el servidor.
   Cualquier bandera en sessionStorage/localStorage es falsificable y ya no se usa. */
let authUser = null;
const isAdmin = () => !!authUser;
const authReady = new Promise(resolve => {
  onAuthStateChanged(auth, user => { authUser = user || null; resolve(authUser); });
});
const paras = t => String(t ?? "").split(/\n{2,}|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
const empty = (el, msg) => { el.innerHTML = `<p class="empty">${msg}</p>`; };
const fail = el => { el.innerHTML = `<p class="notice err">No se pudo cargar la informacion. Verifique la configuracion de Firebase y Appwrite en app.js.</p>`; };

/* ---------- CRUD (Firestore + Appwrite) ---------- */
const listDocs = async (c, o = "creadoEn", dir = "desc", n = 100) => {
  const s = await getDocs(query(collection(db, c), orderBy(o, dir), limit(n)));
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
};
const getOne = async (c, id) => { const s = await getDoc(doc(db, c, id)); return s.exists() ? { id: s.id, ...s.data() } : null; };
const createDoc = async (c, data) => { try { return await addDoc(collection(db, c), { ...data, creadoEn: serverTimestamp() }); } catch (e) { e.paso = "firestore"; throw e; } };
const updateOne = async (c, id, data) => { try { return await updateDoc(doc(db, c, id), { ...data, actualizadoEn: serverTimestamp() }); } catch (e) { e.paso = "firestore"; throw e; } };
const removeDoc = async (c, item) => {
  await deleteDoc(doc(db, c, item.id));
  for (const [k, v] of Object.entries(item)) if (/Id$/.test(k) && typeof v === "string" && k !== "id") { try { await storage.deleteFile(APPWRITE_CONFIG.bucketId, v); } catch (e) { } }
};
// Las fotos de teléfono suelen ser demasiado grandes para el bucket: se reducen antes de subir.
const prepareImage = async file => {
  if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.82));
    if (!blob) return file;
    const name = String(file.name || "imagen").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch (e) { return file; /* si el navegador no la decodifica, se intenta subir tal cual */ }
};
const uploadFile = async file => {
  const listo = await prepareImage(file);
  try { return (await storage.createFile(APPWRITE_CONFIG.bucketId, ID.unique(), listo)).$id; }
  catch (e) { e.paso = "archivo"; throw e; }
};

/* ---------- CMS helpers ---------- */
const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "seccion";
const destAny = d => {
  let v = String(d || "#").trim();
  v = v.replace(/\.html(?=[?#]|$)/i, ""); // compatibilidad: limpia .html antiguo
  if (/^index(?=[?#]|$)/i.test(v)) v = "/" + v.slice(5);
  if (v === "" || v === "/") return "/";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return v;
  if (!/^[a-z0-9-]+$/i.test(v.split(/[?#]/)[0])) return "#" + slugify(v);
  return "/" + v; // nombre de página suelto => ruta limpia
};
/* En local (file:// o servidor simple) las rutas limpias no existen:
   las convertimos a archivos .html para que todo enlace funcione. */
const IS_LOCAL = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/i.test(location.hostname);
const toHref = h => {
  if (!IS_LOCAL || typeof h !== "string" || h.charAt(0) !== "/") return h;
  const m = h.match(/^(\/[^#?]*)([#?].*)?$/); if (!m) return h;
  const name = m[1].replace(/^\/+|\/+$/g, "") || "index";
  if (/\.[a-z0-9]+$/i.test(name)) return name + (m[2] || "");
  return name + ".html" + (m[2] || "");
};
const fixLinks = (root = document) => {
  if (!IS_LOCAL || !root.querySelectorAll) return;
  root.querySelectorAll('a[href^="/"]').forEach(a => { const v = a.getAttribute("href"), n = toHref(v); if (n !== v) a.setAttribute("href", n); });
};

/* ---------- ICONOS DE BOTONES SEGÚN SU DESTINO ---------- */
const btnIco = paths => `<svg class="btn-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const BTN_ICONS = {
  leaf: btnIco('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z"/><path d="M5 19c2-5 5-8 10-10"/>'),
  drop: btnIco('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>'),
  wrench: btnIco('<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-3 3-3-3 3-3Z"/>'),
  help: btnIco('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.7.3-.9.8-.9 1.7"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/>'),
  doc: btnIco('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>'),
  news: btnIco('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h6M7 13h6M16 9h2M16 13h2"/>'),
  users: btnIco('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M18 20c0-2.2-.8-3.6-2-4.5"/>'),
  mail: btnIco('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  home: btnIco('<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>'),
  download: btnIco('<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>'),
  check: btnIco('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
  x: btnIco('<path d="m6 6 12 12M18 6 6 18"/>'),
  pencil: btnIco('<path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 6 3 3"/>'),
  trash: btnIco('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'),
  plus: btnIco('<path d="M12 5v14M5 12h14"/>'),
  search: btnIco('<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>'),
  lock: btnIco('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  arrow: btnIco('<path d="M5 12h14m0 0-5-5m5 5-5 5"/>'),
  back: btnIco('<path d="M19 12H5m0 0 5-5m-5 5 5 5"/>'),
  up: btnIco('<path d="M12 19V5m0 0-5 5m5-5 5 5"/>'),
  down: btnIco('<path d="M12 5v14m0 0 5-5m-5 5-5-5"/>'),
  map: btnIco('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>'),
  card: btnIco('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>')
};
const BTN_RULES = [
  { i: "leaf", t: "green", r: /programa|ambient|creciendo/i },
  { i: "wrench", t: "amber", r: /reportar|aver[ií]a|fuga|reporte/i },
  { i: "help", t: "teal", r: /faq|pregunta|frecuente/i },
  { i: "doc", t: "gold", r: /document|formulario|descargar|transparencia/i },
  { i: "news", t: "blue", r: /noticia|ver m[aá]s|leer m[aá]s/i },
  { i: "users", t: "purple", r: /junta|directiva|equipo|nosotros/i },
  { i: "mail", t: "teal", r: /contacto|escrib|whatsapp/i },
  { i: "drop", t: "blue", r: /servicio|abastecimiento/i },
  { i: "map", t: "teal", r: /cobertura|mapa|zona/i },
  { i: "card", t: "gold", r: /tarifa|cuota/i },
  { i: "check", t: "green", r: /guardar|publicar|verificar|ingresar c[oó]digo/i },
  { i: "trash", t: "red", r: /eliminar|quitar|borrar/i },
  { i: "x", t: "gray", r: /cancelar|descartar/i },
  { i: "pencil", t: "blue", r: /editar/i },
  { i: "plus", t: "green", r: /agregar|a[nñ]adir|crear/i },
  { i: "search", t: "teal", r: /buscar/i },
  { i: "lock", t: "navy", r: /admin|acceso administrativo/i },
  { i: "home", t: "navy", r: /volver|inicio|atr[aá]s/i },
  { i: "up", t: "gray", r: /↑|subir|arriba/i },
  { i: "down", t: "gray", r: /↓|bajar|abajo/i }
];
const decorateButtons = (root = document) => {
  if (!root || !root.querySelectorAll) return;
  const nodes = [];
  if (root.matches?.(".btn,.top-admin")) nodes.push(root);
  nodes.push(...root.querySelectorAll(".btn,.top-admin"));
  nodes.forEach(btn => {
    if (btn.dataset.iconReady === "1") return;
    const texto = (btn.textContent || "").trim();
    const href = btn.getAttribute("href") || "";
    const id = btn.id || "";
    const fuente = `${texto} ${href} ${id}`;
    const regla = BTN_RULES.find(x => x.r.test(fuente)) || { i: "arrow", t: "blue" };
    btn.dataset.iconReady = "1";
    btn.dataset.icon = regla.i;
    btn.dataset.tone = regla.t;
    if (!btn.querySelector(".btn-ico")) btn.insertAdjacentHTML("afterbegin", BTN_ICONS[regla.i]);
    btn.querySelectorAll(':scope > i[aria-hidden="true"]').forEach(i => i.remove());
  });
};
const renderBlocks = (blocks, fallback = null) => {
  if (Array.isArray(blocks) && blocks.length) {
    const logos = [], out = [];
    const flushLogos = () => { if (!logos.length) return; out.push(`<div class="cms-logos">${logos.splice(0).map(l => `${l.url ? `<a class="cms-logo" href="${esc(destAny(l.url))}" ${/^https?:/.test(l.url||"") ? 'target="_blank" rel="noopener"' : ""}>` : `<div class="cms-logo">`}${l.imagenId ? `<img src="${fileView(l.imagenId)}" alt="${esc(l.etiqueta || "Logo")}" loading="lazy">` : ""}${l.etiqueta ? `<span>${esc(l.etiqueta)}</span>` : ""}${l.url ? `</a>` : `</div>`}`).join("")}</div>`); };
    blocks.forEach(b => {
      if (!b || typeof b !== "object") return;
      if (b.tipo === "logo") { logos.push(b); return; } else flushLogos();
      if (b.tipo === "titulo") out.push(`<h2 class="cms-h2">${esc(b.texto || "")}</h2>`);
      else if (b.tipo === "subtitulo") out.push(`<h3 class="cms-h3">${esc(b.texto || "")}</h3>`);
      else if (b.tipo === "texto") out.push(`<div class="prose">${paras(b.texto || "")}</div>`);
      else if (b.tipo === "imagen" && b.imagenId) out.push(`<figure class="cms-fig">${b.url ? `<a href="${esc(destAny(b.url))}">` : ""}<img class="custom-img" src="${fileView(b.imagenId)}" alt="${esc(b.alt || b.texto || "")}" loading="lazy">${b.url ? `</a>` : ""}${b.texto ? `<figcaption class="meta">${esc(b.texto)}</figcaption>` : ""}</figure>`);
      else if (b.tipo === "boton") out.push(`<p class="more"><a class="btn ${b.estilo === "secundario" ? "ghost" : "dark"}" href="${esc(destAny(b.url || "#"))}" ${/^https?:/.test(b.url||"") ? 'target="_blank" rel="noopener"' : ""}>${esc(b.etiqueta || "Abrir")}</a></p>`);
      else if (b.tipo === "enlace") out.push(`<p><a class="link" href="${esc(destAny(b.url || "#"))}" ${/^https?:/.test(b.url||"") ? 'target="_blank" rel="noopener"' : ""}>${esc(b.etiqueta || b.url || "Enlace")}</a></p>`);
    });
    flushLogos();
    return out.join("");
  }
  if (fallback) {
    const img = fallback.imagenId ? `<img class="custom-img" src="${fileView(fallback.imagenId)}" alt="${esc(fallback.titulo || "")}" loading="lazy">` : "";
    const btn = fallback.botonTexto ? `<p class="more"><a class="btn dark" href="${esc(destAny(fallback.botonDestino))}">${esc(fallback.botonTexto)}</a></p>` : "";
    return `<div class="two custom-two"><div class="prose">${paras(fallback.contenido || "")}${btn}</div>${img ? `<div>${img}</div>` : ""}</div>`;
  }
  return "";
};
const renderSitePageSections = async (pagina) => {
  const host = $("#site-custom-sections"); if (!host) return;
  try {
    const norm = p => String(p || "").replace(/^Sección en:\s*/i, "");
    const secs = (await listDocs("sitio_secciones", "orden", "asc", 200)).filter(s => norm(s.pagina) === pagina && s.pagina !== "Página nueva (individual)" && s.visible !== "No" && s.visible !== false);
    if (!secs.length) { host.innerHTML = ""; host.hidden = true; return; }
    host.hidden = false;
    host.innerHTML = secs.map(s => {
      const body = (Array.isArray(s.bloques) && s.bloques.length) ? `<div class="cms-body">${renderBlocks(s.bloques)}</div>` : renderBlocks(null, s);
      return `<section class="section site-custom-sec"><div class="wrap"><div class="sec-head"><h2>${esc(s.titulo || "")}</h2></div>${body}</div></section>`;
    }).join("");
  } catch (e) { host.hidden = true; }
};

/* ---------- DISEÑO INSPIRADO EN ASADA LA FORTUNA (secciones editables) ---------- */
const LF_ICONS = {
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 3 3 6 3 6s3-3 3-6c0-1.657-1.343-3-3-3z"/></svg>',
  tool:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.128-2.012 1.995-3.708 4.266-3.708 2.764 0 5.302 2.538 5.302 5.013 0 1.708-1.102 3.167-2.73 4.277-.483.262-.99.493-1.517.742C14.33 12.473 13.255 13 12 13c-1.255 0-2.33-.527-3.646-1.702a19.48 19.48 0 01-1.517-.742C5.22 10.483 4.118 8.708 4.118 7c0-2.475 2.538-5.013 5.302-5.013 2.271 0 4.138 1.696 4.266 3.708M12 13v7m0 0l-2-2m2 2l2-2"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3c0 7 4 12 14 14 0-9-5-14-14-14zm0 14c2 2 5 3 8 4"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/></svg>',
  school:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zm0 0v15m6-12v15"/></svg>'
};
const LF_TECH_SVG = `<svg viewBox="0 0 640 480" role="img" aria-label="Ilustración del sistema de agua" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0f2fe"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient></defs><rect width="640" height="480" fill="url(#s)"/><circle cx="530" cy="90" r="58" fill="#fff" opacity=".35"/><circle cx="90" cy="400" r="90" fill="#0284c7" opacity=".08"/><path d="M120 330c70-60 120-20 180-80s130-40 220-110" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".7"/><path d="M170 350h300a24 24 0 0 1 24 24v56H146v-56a24 24 0 0 1 24-24z" fill="#0284c7"/><rect x="230" y="120" width="180" height="200" rx="26" fill="#fff" opacity=".92"/><path d="M250 250c30-25 50 15 80-10s50 15 80-10" fill="none" stroke="#38bdf8" stroke-width="16" stroke-linecap="round"/><circle cx="300" cy="180" r="18" fill="#0ea5e9"/><circle cx="355" cy="195" r="12" fill="#7dd3fc"/><path d="M320 60c-12 20-22 32-22 46a22 22 0 0 0 44 0c0-14-10-26-22-46z" fill="#fff" opacity=".85"/><path d="M430 90c-9 15-17 24-17 34a17 17 0 0 0 34 0c0-10-8-19-17-34z" fill="#fff" opacity=".7"/></svg>`;
const DEFAULT_LF = {
  aboutTitle: "Comprometidos con el futuro del agua",
  aboutText: "La ASADA Bijagua es una organización comunitaria sin fines de lucro dedicada a la administración, mantenimiento y protección del sistema de acueducto del distrito. Trabajamos con transparencia para llevar agua potable a cada familia.",
  hitos: [
    { anio:"1998", titulo:"Primeros pasos", descripcion:"La comunidad de Bijagua se organizó para construir y administrar su propio acueducto comunal." },
    { anio:"2005", titulo:"Ampliación de la red", descripcion:"Se extendió la conducción de agua hacia nuevos sectores del distrito y se mejoraron las captaciones." },
    { anio:"2012", titulo:"Fortalecimiento institucional", descripcion:"Se consolidó la Junta Directiva y los procesos de administración y transparencia del servicio." },
    { anio:"2017", titulo:"Creciendo por la vida", descripcion:"Nació el Programa de Educación Ambiental para promover la cultura del agua y la protección de las fuentes." },
    { anio:"Hoy", titulo:"Presente y futuro", descripcion:"Seguimos creciendo con el compromiso de brindar un servicio sostenible a Bijagua, Upala." }
  ],
  servicios: [
    { titulo:"Abastecimiento", descripcion:"Captamos el agua en nuestras fuentes y la distribuimos en Bijagua y comunidades integradas. La red instalada suma 101,6 km.", chips:["Captación y conducción","Red de distribución","101,6 km instalados"], icono:"drop" },
    { titulo:"Mantenimiento", descripcion:"Limpiamos y desinfectamos las fuentes y los 10 tanques de almacenamiento, con 755 m³ de capacidad total. Reparamos fugas, mejoramos la red y damos mantenimiento a los 23 hidrantes instalados.", chips:["Limpieza y desinfección","Reparación de fugas","23 hidrantes","10 tanques · 755 m³"], icono:"tool" },
    { titulo:"Atención al abonado", descripcion:"Recibimos reportes de averías y consultas. También tomamos lecturas de medidores y gestionamos los trámites del servicio.", chips:["Reportes de averías","Lectura de medidores","Trámites"], icono:"bolt" },
    { titulo:"Control de calidad", descripcion:"Probamos el cloro libre en la red todos los días y realizamos análisis trimestrales con el AyA y el Laboratorio Nacional de Aguas.", chips:["Cloro diario","Análisis trimestrales","Sello de Calidad Sanitaria"], icono:"shield" }
  ],
  tecnologias: [
    { titulo:"Control de calidad", descripcion:"Seguimiento periódico para que el agua que llega a su hogar cumpla con los estándares de consumo.", icono:"shield" },
    { titulo:"Medición y monitoreo", descripcion:"Herramientas de medición que nos ayudan a detectar fugas y a usar mejor el recurso hídrico.", icono:"chart" },
    { titulo:"Gestión digital", descripcion:"Información y avisos publicados en línea para mantener a la comunidad al tanto del servicio.", icono:"bolt" }
  ],
  zonas: [
    { nombre:"Bijagua centro", km:"—", descripcion:"Núcleo del distrito" },
    { nombre:"Sector norte", km:"—", descripcion:"Zona residencial" },
    { nombre:"Sector sur", km:"—", descripcion:"Zona residencial y comercial" },
    { nombre:"Comunidades vecinas", km:"—", descripcion:"Áreas atendidas por la red" }
  ],
  cifras: [
    { prefijo:"", numero:"101.6 km", etiqueta:"de red instalada" },
    { prefijo:"", numero:"4", etiqueta:"fuentes de abastecimiento" },
    { prefijo:"", numero:"23", etiqueta:"hidrantes instalados" },
    { prefijo:"", numero:"1.700", etiqueta:"árboles sembrados en 2025" },
    { prefijo:"", numero:"100%", etiqueta:"de micromedición" },
    { prefijo:"", numero:"10", etiqueta:"tanques de almacenamiento · 755 m³ en total" },
    { prefijo:"", numero:"2.379", etiqueta:"abonados atendidos en la red" },
    { prefijo:"", numero:"Vigente", etiqueta:"una de las únicas ASADAs a nivel nacional con programa ambiental consolidado" }
  ],
  benef: [
    { numero:"2.379 abonados", etiqueta:"total del servicio en la red", icono:"users" },
    { numero:"20 sectores", etiqueta:"atendidos en Bijagua y comunidades integradas", icono:"map" },
    { numero:"Zonas turísticas", etiqueta:"hoteles, alojamientos y restaurantes de la zona", icono:"map" },
    { numero:"Domicilios", etiqueta:"hogares de Bijagua y comunidades atendidas", icono:"users" },
    { numero:"Escuelas", etiqueta:"centros educativos de la comunidad", icono:"school" },
    { numero:"Colegios", etiqueta:"educación secundaria y técnica", icono:"school" },
    { numero:"Comercios", etiqueta:"negocios y servicios locales", icono:"chart" },
    { numero:"Instituciones", etiqueta:"oficinas públicas y centros de salud", icono:"shield" }
  ]
};
const LF_IMPORT = {
  lf_hito: DEFAULT_LF.hitos.map(x => ({ ...x, visible:"Sí" })),
  lf_tecnologia: DEFAULT_LF.tecnologias.map(x => ({ ...x, visible:"Sí" })),
  lf_zona: DEFAULT_LF.zonas.map(x => ({ ...x, visible:"Sí" })),
  lf_cifra: DEFAULT_LF.cifras.map(x => ({ ...x, visible:"Sí" })),
  lf_beneficio: DEFAULT_LF.benef.map(x => ({ ...x, visible:"Sí" }))
};
const lfCfg = k => SITE_CFG[k]?.valor;
const lfImg = k => SITE_CFG[k]?.imagenId ? fileView(SITE_CFG[k].imagenId) : "";
const lfList = async (c, fallback, n = 100) => {
  try { const rows = (await listDocs(c, "orden", "asc", n)).filter(x => x.visible !== "No" && x.visible !== false); return rows.length ? rows : fallback; }
  catch (e) { return fallback; }
};
const lfIcon = (name, cls = "") => `<div class="lf-iconbox ${cls}">${LF_ICONS[name] || LF_ICONS.drop}</div>`;
const lfLightboxHTML = `<div class="lf-lightbox" id="lf-lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada"><button type="button" id="lf-lightbox-x" aria-label="Cerrar">✕</button><img id="lf-lightbox-img" src="" alt=""></div>`;

const lfRenderHome = async () => {
  const setTxt = (sel, v) => { const el = $(sel); if (el && v) el.innerHTML = v; };
  const EDITABLE_TEXT = {
    "#lf-hero-pill": "Inicio - etiqueta",
    "#lf-hero-title": "Inicio - título",
    "#lf-hero-sub": "Inicio - subtítulo",
    "#lf-hero-note-label": "Inicio - nota (etiqueta)",
    "#lf-hero-note-text": "Inicio - nota (texto)",
    "#lf-fact1-t": "Inicio - dato 1", "#lf-fact1-s": "Inicio - dato 1 detalle",
    "#lf-fact2-t": "Inicio - dato 2", "#lf-fact2-s": "Inicio - dato 2 detalle",
    "#lf-fact3-t": "Inicio - dato 3", "#lf-fact3-s": "Inicio - dato 3 detalle",
    "#lf-about-title": "Sobre nosotros - título",
    "#lf-about-text": "Sobre nosotros - texto",
    "#lf-historia-title": "Historia - título", "#lf-historia-text": "Historia - texto",
    "#lf-tec-title": "Tecnología - título", "#lf-tec-text": "Tecnología - texto",
    "#lf-cob-title": "Cobertura - título", "#lf-cob-text": "Cobertura - texto",
    "#lf-map-side-label": "Mapa - etiqueta lateral", "#lf-map-side-title": "Mapa - título lateral",
    "#lf-map-side-text": "Mapa - texto lateral", "#lf-map-coords": "Mapa - coordenadas",
    "#lf-map-loc-label": "Mapa - etiqueta ubicación", "#lf-map-loc-value": "Mapa - valor ubicación",
    "#lf-map-serve-label": "Mapa - etiqueta cobertura", "#lf-map-serve-value": "Mapa - valor cobertura",
    "#lf-hero-btn1-txt": "Inicio - botón 1 texto", "#lf-hero-btn2-txt": "Inicio - botón 2 texto",
    "#lf-hero-btn3-txt": "Inicio - botón 3 texto",
    "#lf-tile1-t": "Acceso 1 - título", "#lf-tile1-d": "Acceso 1 - descripción",
    "#lf-tile2-t": "Acceso 2 - título", "#lf-tile2-d": "Acceso 2 - descripción",
    "#lf-tile3-t": "Acceso 3 - título", "#lf-tile3-d": "Acceso 3 - descripción",
    "#lf-tile4-t": "Acceso 4 - título", "#lf-tile4-d": "Acceso 4 - descripción",
    "#lf-serv-title": "Servicios - título inicio", "#lf-serv-text": "Servicios - descripción inicio",
    "#lf-aviso-title": "Avisos - título inicio", "#lf-aviso-text": "Avisos - descripción inicio",
    "#lf-news-title": "Noticias - título inicio",
    "#lf-ben-title": "Beneficiarios - título", "#lf-ben-text": "Beneficiarios - texto"
  };
  Object.entries(EDITABLE_TEXT).forEach(([sel, key]) => setTxt(sel, lfCfg(key)));
  const setHref = (sel, key) => { const el = $(sel), v = lfCfg(key); if (el && v) el.href = v; };
  setHref("#lf-hero-btn1", "Inicio - botón 1 enlace");
  setHref("#lf-hero-btn2", "Inicio - botón 2 enlace");
  setHref("#lf-hero-btn3", "Inicio - botón 3 enlace");
  for (let i = 1; i <= 4; i++) setHref(`#lf-tile${i}-a`, `Acceso ${i} - enlace`);

  // Sobre nosotros: junta directiva y colaboradores (colecciones existentes)
  const eq = $("#lf-equipo");
  if (eq) {
    let j = [], c = [];
    try { j = await listDocs("junta", "orden", "asc", 4); } catch (e) { }
    try { c = await listDocs("colaboradores", "orden", "asc", 4); } catch (e) { }
    const card = (m, title, sub, cls) => `<article class="lf-about-card"><div class="lf-about-head">${lfIcon("users", cls)}<div><h3>${esc(m.nombre || title)}</h3><p>${esc(m.cargo || sub)}</p></div></div>
      <div class="lf-about-img">${m.fotoId ? `<img src="${fileView(m.fotoId)}" alt="${esc(m.nombre || title)}" loading="lazy">` : LF_TECH_SVG}</div>
      <p>${esc(m.descripcion || "Parte del equipo que hace posible el servicio de agua en Bijagua.")}</p></article>`;
    const fallback = [
      { nombre:"Junta Directiva", cargo:"Liderazgo y compromiso", descripcion:"Nuestra junta trabaja para garantizar la correcta administración del recurso hídrico y el bienestar de la comunidad." },
      { nombre:"Colaboradores", cargo:"Equipo humano de excelencia", descripcion:"Contamos con un equipo comprometido y capacitado que hace posible un servicio de calidad para todos." }
    ];
    eq.innerHTML = [
      card(j[0] || fallback[0], "Junta Directiva", "Liderazgo y compromiso", ""),
      card(c[0] || fallback[1], "Colaboradores", "Equipo humano de excelencia", "green")
    ].join("");
  }
  const st = $("#lf-stats");
  if (st) {
    const rows = await lfList("sitio_cifras", DEFAULT_LF.cifras);
    st.innerHTML = rows.map(x => `<div class="lf-stat"><b>${esc(x.prefijo || "")}${esc(x.numero || "")}</b><span>${esc(x.etiqueta || "")}</span></div>`).join("");
  }

  // Línea de tiempo
  const hl = $("#lf-hitos");
  if (hl) {
    const rows = await lfList("sitio_historia", DEFAULT_LF.hitos);
    hl.innerHTML = rows.map(x => `<div class="lf-tl-item lf-reveal"><span class="lf-tl-dot"></span>
      <div class="lf-tl-card">${x.imagenId ? `<img class="lf-tl-img" src="${fileView(x.imagenId)}" alt="${esc(x.titulo || "")}" loading="lazy">` : ""}<span class="anio">${esc(x.anio || "")}</span><h3>${esc(x.titulo || "")}</h3><p>${esc(x.descripcion || "")}</p></div></div>`).join("");
  }

  // Servicios destacados (usa la colección "servicios" del panel, con campos nuevos opcionales)
  const sv = $("#lf-servicios");
  if (sv) {
    const rows = await lfList("servicios", DEFAULT_LF.servicios);
    sv.innerHTML = rows.map((x, i) => {
      const d = DEFAULT_LF.servicios[i] || {};
      const chips = String(x.chips || d.chips || "").split("\n").map(s => s.trim()).filter(Boolean);
      return `<div class="lf-svc-row lf-reveal">
        <div class="lf-svc-art">${x.imagenId ? `<img class="lf-svc-img" src="${fileView(x.imagenId)}" alt="${esc(x.titulo || "")}" loading="lazy">` : `<span class="lf-svc-num">${String(i + 1).padStart(2, "0")}</span>${lfIcon(x.icono || d.icono || "drop", i === 1 ? "green" : i === 2 ? "amber" : "")}`}</div>
        <div class="lf-svc-body"><span class="lf-svc-kicker">Servicio</span><h3>${esc(x.titulo || "")}</h3><p>${esc(x.descripcion || "")}</p>
        ${chips.length ? `<div class="lf-chips">${chips.map(t => `<span class="lf-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${esc(t)}</span>`).join("")}</div>` : ""}</div></div>`;
    }).join("");
  }

  // Tecnología
  const tc = $("#lf-tecnologias"), ti = $("#lf-tec-img");
  if (tc) {
    const rows = await lfList("sitio_tecnologia", DEFAULT_LF.tecnologias);
    tc.innerHTML = rows.map(x => `<div class="lf-tech-card">${lfIcon(x.icono || "chart")}<div><h4>${esc(x.titulo || "")}</h4><p>${esc(x.descripcion || "")}</p></div></div>`).join("");
  }
  if (ti) {
    const img = lfImg("Imagen de tecnología (opcional)");
    ti.innerHTML = img ? `<img src="${img}" alt="Tecnología utilizada por la ASADA Bijagua" loading="lazy">` : LF_TECH_SVG;
  }

  // Mapa y zonas
  const map = $("#lf-map");
  if (map) {
    const img = lfImg("Mapa de cobertura (imagen)");
    const url = lfCfg("Mapa (URL para insertar)") || "https://www.openstreetmap.org/export/embed.html?bbox=-85.1160%2C10.6907%2C-84.9960%2C10.7707&layer=mapnik&marker=10.730667%2C-85.055961";
    map.insertAdjacentHTML("afterbegin", img ? `<img src="${img}" alt="Mapa de la zona de cobertura de ASADA Bijagua">` : `<iframe src="${esc(url)}" title="Mapa de Bijagua, Upala" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`);
    const badge = $("#lf-map-badge");
    if (badge) {
      const openMap = () => {
        if (img) { const lb = $("#lf-lightbox"); if (lb) { $("#lf-lightbox-img").src = img; lb.classList.add("open"); } }
        else window.open(url, "_blank", "noopener");
      };
      badge.onclick = openMap;
      badge.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMap(); } };
    }
  }
  const zo = $("#lf-zonas");
  if (zo) {
    const rows = await lfList("sitio_cobertura", DEFAULT_LF.zonas);
    zo.innerHTML = rows.map(x => `<div class="lf-zone"><div class="lf-zone-img">${x.imagenId ? `<img src="${fileView(x.imagenId)}" alt="${esc(x.nombre || "")}" loading="lazy">` : LF_ICONS.map}</div><b>${esc(x.km || "—")}</b><small>${esc(x.descripcion || "km de red")}</small><strong>${esc(x.nombre || "")}</strong></div>`).join("");
  }

  // Beneficiarios
  const bf = $("#lf-benef");
  if (bf) {
    const rows = await lfList("sitio_beneficiarios", DEFAULT_LF.benef);
    bf.innerHTML = rows.map(x => `<div class="lf-benef-card"><div class="lf-benef-ico">${LF_ICONS[x.icono] || LF_ICONS.users}</div><b>${esc(x.numero || "")}</b><span>${esc(x.etiqueta || "")}</span></div>`).join("");
  }

  lfInitAnimations();
};

const lfInitAnimations = () => {
  if (!window.IntersectionObserver) { $$(".lf-reveal,.lf-reveal-left,.lf-reveal-right,.lf-scale,.lf-stagger").forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".lf-reveal,.lf-reveal-left,.lf-reveal-right,.lf-scale,.lf-stagger").forEach(el => io.observe(el));
  setTimeout(() => $$(".lf-reveal,.lf-reveal-left,.lf-reveal-right,.lf-scale,.lf-stagger").forEach(el => el.classList.add("in")), 900);
};

const lfAvisosHTML = items => {
  if (!items.length) return `<div class="empty">No hay avisos ni mantenimientos activos o próximos.</div>`;
  const slide = c => `<div class="lf-slide"><a class="lf-aviso-card" href="/cortes"><span class="lf-aviso-accent"></span>
      <div class="lf-aviso-side"><span class="lf-aviso-kicker">${esc(c.tipo || "Aviso")}</span>
        <b>${esc(c.estado || "Programado")}</b><small>Lugar: ${esc(c.sector || "Bijagua")}</small></div>
      <div class="lf-aviso-main"><h3>${esc(c.sector || "")}</h3><p>${esc(c.motivo || "")}</p>
        <p class="meta">${fmt(c.fecha)} ${esc(c.horario || "")}</p></div></a></div>`;
  return `<div class="lf-carousel"><button type="button" class="lf-carousel-btn prev" aria-label="Aviso anterior">‹</button>
    <div class="lf-track" id="lf-track">${items.map(slide).join("")}</div>
    <button type="button" class="lf-carousel-btn next" aria-label="Aviso siguiente">›</button></div>
    <div class="lf-dots">${items.map((_, i) => `<button type="button" class="lf-dot ${i === 0 ? "active" : ""}" data-i="${i}" aria-label="Ir al aviso ${i + 1}"></button>`).join("")}</div>`;
};
const lfInitCarousel = () => {
  const track = $("#lf-track"); if (!track) return;
  const slides = $$(".lf-slide", track), dots = $$(".lf-dot");
  let i = 0;
  const go = n => { i = (n + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" }); dots.forEach((d, k) => d.classList.toggle("active", k === i)); };
  $(".lf-carousel-btn.prev")?.addEventListener("click", () => go(i - 1));
  $(".lf-carousel-btn.next")?.addEventListener("click", () => go(i + 1));
  dots.forEach(d => d.onclick = () => go(Number(d.dataset.i)));
};

const lfNewsHTML = items => {
  if (!items.length) return `<div class="empty">Aún no hay noticias publicadas.</div>`;
  const card = n => `<a class="aya-news-card" href="/noticia-detalle?id=${n.id}">
    ${n.imagenId ? `<span class="aya-news-img"><img src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}" loading="lazy"></span>` : ""}
    <span class="aya-news-date">${fmt(n.creadoEn)}</span>
    <h3>${esc(n.titulo)}</h3>
    <p>${esc(n.resumen || "")}</p>
    <span class="aya-news-more">Leer noticia completa <i aria-hidden="true">→</i></span></a>`;
  return `<div class="aya-news-carousel"><button type="button" class="aya-news-arrow prev" aria-label="Noticia anterior">‹</button>
    <div class="aya-news-track" id="aya-news-track">${items.map(card).join("")}</div>
    <button type="button" class="aya-news-arrow next" aria-label="Noticia siguiente">›</button></div>
    <div class="lf-dots">${items.map((_, i) => `<button type="button" class="lf-dot ${i === 0 ? "active" : ""}" data-n="${i}" aria-label="Ir a la noticia ${i + 1}"></button>`).join("")}</div>`;
};
const lfInitNewsCarousel = () => {
  const track = $("#aya-news-track"); if (!track) return;
  const cards = $$(".aya-news-card", track), dots = $$(".lf-dot[data-n]");
  if (cards.length < 2) { $(".aya-news-carousel")?.classList.add("single"); return; }
  let i = 0;
  const go = n => {
    i = (n + cards.length) % cards.length;
    track.scrollLeft = Math.max(0, cards[i].offsetLeft - track.offsetLeft - 12);
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
  };
  $(".aya-news-arrow.prev")?.addEventListener("click", () => go(i - 1));
  $(".aya-news-arrow.next")?.addEventListener("click", () => go(i + 1));
  dots.forEach(d => d.addEventListener("click", () => go(Number(d.dataset.n))));
};

/* Interacciones visuales inspiradas en AyA: carrusel, búsqueda y ondas de botón */
const initAyaUI = () => {
  if (window.__ayaUIReady) return;
  window.__ayaUIReady = true;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Carrusel principal
  const hero = $("#hero-carousel");
  if (hero) {
    const slides = $$(".aya-slide", hero), dots = $$(".aya-dot");
    let i = 0, timer = null;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("active", k === i));
      dots.forEach((d, k) => d.classList.toggle("active", k === i));
    };
    const play = () => { if (!reduce && slides.length > 1) timer = setInterval(() => go(i + 1), 6500); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    $(".aya-carousel-arrow.prev")?.addEventListener("click", () => { stop(); go(i - 1); play(); });
    $(".aya-carousel-arrow.next")?.addEventListener("click", () => { stop(); go(i + 1); play(); });
    dots.forEach(d => d.addEventListener("click", () => { stop(); go(Number(d.dataset.s)); play(); }));
    hero.addEventListener("mouseenter", stop); hero.addEventListener("mouseleave", play);
    play();
  }

  // Submenús: hover en escritorio y clic en móvil
  $$(".dd>button").forEach(b => b.addEventListener("click", e => {
    e.preventDefault(); b.parentElement.classList.toggle("open");
  }));

  // Búsqueda rápida del encabezado
  const sBtn = $("#header-search"), sPanel = $("#header-search-panel"), sInput = $("#site-search"), sRes = $("#site-search-results");
  if (sBtn && sPanel && sInput && sRes) {
    const links = [
      ["Inicio", "/"], ["Nuestros servicios", "/servicios"], ["Quienes somos", "/nosotros"],
      ["Nuestra historia y cobertura", "/#historia"], ["Avisos de servicio", "/cortes"],
      ["Noticias", "/noticias"], ["Tarifas", "/tarifas"], ["Calidad del agua", "/calidad-agua"],
      ["Trámites", "/afiliacion"], ["Transparencia", "/documentos"],
      ["Programa de Educación Ambiental", "/programa"], ["Preguntas frecuentes", "/faq"], ["Contacto", "/contacto"]
    ];
    const draw = () => {
      const q = sInput.value.trim().toLowerCase();
      const found = (q ? links.filter(([t]) => t.toLowerCase().includes(q)) : links.slice(0, 6)).slice(0, 8);
      sRes.innerHTML = found.length ? found.map(([t, h]) => `<a href="${h}">${t}<span>→</span></a>`).join("") : `<p class="meta">No se encontraron resultados. Pruebe con “tarifas” o “avisos”.</p>`;
    };
    const close = () => { sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false"); };
    sBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = sPanel.hidden;
      sPanel.hidden = !open; sBtn.setAttribute("aria-expanded", String(open));
      if (open) { draw(); sInput.focus(); }
    });
    sPanel.addEventListener("click", e => e.stopPropagation());
    sInput.addEventListener("input", draw);
    sInput.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); sRes.querySelector("a")?.click(); }
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".header-search-panel") && !e.target.closest("#header-search")) close();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  // Onda animada en botones y tarjetas interactivas (delegación para contenido dinámico)
  document.addEventListener("pointerdown", e => {
    if (reduce) return;
    const el = e.target.closest(".btn,.top-admin,.aya-carousel-arrow,.aya-news-arrow,.lf-carousel-btn,.tile,.aya-news-card,.lf-aviso-card");
    if (!el) return;
    const r = el.getBoundingClientRect(), w = Math.max(r.width, r.height);
    const wave = document.createElement("span");
    wave.className = "ripple-wave";
    wave.style.cssText = `left:${e.clientX - r.left - w / 2}px;top:${e.clientY - r.top - w / 2}px;width:${w}px;height:${w}px`;
    el.appendChild(wave);
    wave.addEventListener("animationend", () => wave.remove());
  });
};
const lfNewsSideHTML = items => items.map(n => `<a href="/noticia-detalle?id=${n.id}"><span class="lf-aviso-kicker">Comunidad · ${fmt(n.creadoEn)}</span><h4>${esc(n.titulo)}</h4><p>${esc(n.resumen || "")}</p></a>`).join("") +
  `<a href="/noticias" class="link" style="margin-top:18px;display:flex;justify-content:space-between">Explorar todas las noticias <span>→</span></a>`;

/* ---------- LAYOUT COMPARTIDO ---------- */
const NAV = [
  ["/", "Inicio"], ["/programa", "Programa Educación Ambiental"], ["/noticias", "Noticias"], ["/cortes", "Avisos de servicio"],
  ["Institución", [["/nosotros", "Quiénes somos"], ["/#historia", "Nuestra historia"], ["/#cobertura", "Cobertura"], ["/proyectos", "Proyectos"], ["/documentos", "Transparencia"]]],
  ["Servicios", [["/servicios", "Nuestros servicios"], ["/tarifas", "Tarifas"], ["/calidad-agua", "Calidad del agua"], ["/afiliacion", "Trámites"]]],
  ["/faq", "Preguntas frecuentes"], ["/contacto", "Contacto"]
];
const herePath = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/\/$/, "") || "/";
const navHtml = NAV.map(([a, b]) => Array.isArray(b)
  ? `<div class="dd"><button type="button" aria-haspopup="true">${a}<span class="caret" aria-hidden="true">▾</span></button><div class="dd-menu">${b.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></div>`
  : `<a href="${a}" class="${herePath === a ? "on" : ""}${a === "/programa" ? " nav-prog" : ""}">${b}</a>`).join("");

const initWaterDrops = () => {
  if (document.body.dataset.theme === "programa") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  $$(".hero, .page-head").forEach(el => {
    if (el.querySelector(".water-drops")) return;
    const box = document.createElement("div");
    box.className = "water-drops";
    box.setAttribute("aria-hidden", "true");
    const colors = ["#bae6fd", "#7dd3fc", "#93c5fd", "#67e8f9", "#e0f2fe"];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      const size = 8 + Math.random() * 12;
      s.style.cssText = `--x:${Math.random() * 100}%;--s:${size}px;--c:${colors[i % colors.length]};--t:${9 + Math.random() * 11}s;--dl:${-Math.random() * 20}s;--dx:${(Math.random() - .5) * 120}px;--o:${0.45 + Math.random() * 0.35}`;
      box.append(s);
    }
    el.insertBefore(box, el.firstChild);
  });
};

const mountLayout = () => {
  $("#site-header").innerHTML = `
  <header class="header">
    <div class="header-main"><div class="wrap header-wrap">
      <a class="brand" href="/"><img src="logo.png" alt="Logotipo ASADA Bijagua" width="52" height="52" fetchpriority="high" decoding="async" onerror="this.style.display='none'"><span><span class="site-name">ASADA Bijagua</span><small class="site-subtitle">Asociación Administradora del Acueducto, Upala</small></span></a>
      <nav class="nav" id="nav" aria-label="Principal">${navHtml}</nav>
      <div class="header-tools"><button class="header-search-btn" type="button" id="header-search" aria-label="Buscar en el sitio" aria-expanded="false" aria-controls="header-search-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M20 20l-4-4"/></svg></button></div>
      <button class="burger" type="button" id="burger" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    </div></div>
    <div class="header-search-panel" id="header-search-panel" hidden><div class="wrap">
      <label for="site-search">Buscar información</label>
      <input id="site-search" type="search" placeholder="Escriba un tema: tarifas, avisos, cobertura…" autocomplete="off">
      <div id="site-search-results" class="site-search-results"></div>
    </div></div>
  </header>
  <div class="modal" id="pin-modal" role="dialog" aria-modal="true" aria-labelledby="pin-t"><div class="modal-box">
    <h3 id="pin-t">Acceso administrativo</h3><p class="meta">Ingrese con su cuenta de administrador.</p>
    <div class="field"><label for="pin-in">Correo electrónico</label><input id="pin-in" type="email" autocomplete="username"></div>
    <div class="field"><label for="pin-pass">Contraseña</label><input id="pin-pass" type="password" autocomplete="current-password"></div>
    <p class="notice err" id="pin-err" hidden>Correo o contraseña incorrectos.</p>
    <div class="modal-actions"><button class="btn dark" type="button" id="pin-ok">Ingresar</button><button class="btn" type="button" id="pin-x" style="background:none;color:var(--ink);border-color:var(--line)">Cancelar</button></div>
  </div></div>`;
  $("#site-footer").innerHTML = `
  <footer class="footer aya-footer"><div class="aya-footer-wave" aria-hidden="true"></div><div class="wrap">
    <div class="aya-footer-grid">
      <div class="aya-footer-brand"><img src="logo.png" alt="ASADA Bijagua" width="62" height="62" loading="lazy" decoding="async" onerror="this.style.display='none'"><h4 class="site-name">ASADA Bijagua</h4><p>Administramos y protegemos el servicio de agua potable de la comunidad de Bijagua, Upala.</p>
        <div class="lf-social-links"><a href="/contacto" aria-label="Escríbanos" title="Escríbanos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a><a href="/programa" aria-label="Programa ambiental" title="Programa ambiental"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3c0 7 4 12 14 14 0-9-5-14-14-14zm0 14c2 2 5 3 8 4"/></svg></a><a href="/#cobertura" aria-label="Ver cobertura" title="Ver cobertura"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zm0 0v15m6-12v15"/></svg></a></div></div>
      <div class="aya-footer-contact"><h4>Información de contacto</h4><ul class="list-footer">
        <li><span>Dirección</span><span class="site-dir">${SITE.direccion}</span></li>
        <li><span>Teléfono</span><span class="site-tel">${SITE.telefono}</span></li>
        <li><span>Emergencias y fugas</span><span class="site-emerg">${SITE.emergencia}</span></li>
        <li><span>Correo electrónico</span><span class="site-mail">${SITE.correo}</span></li>
        <li><span>Horario de atención</span><span class="site-horario">${SITE.horario}</span></li>
      </ul></div>
      <div><h4>Enlaces de interés</h4><ul class="list-footer">
        <li><a href="/noticias">Noticias</a></li><li><a href="/cortes">Avisos de servicio</a></li>
        <li><a href="/#historia">Nuestra historia</a></li><li><a href="/#cobertura">Cobertura</a></li>
        <li><a href="/documentos">Transparencia</a></li><li><a href="/contacto">Reportar una avería</a></li>
        <li><a href="/programa">Programa Educación Ambiental</a></li><li><a href="/faq">Preguntas frecuentes</a></li>
      </ul></div>
    </div>
    <div class="legal"><span>&copy; ${new Date().getFullYear()} ASADA Bijagua. Todos los derechos reservados.</span>
      <button type="button" id="open-admin" class="top-admin footer-admin">Acceso Administrativo</button></div>
  </div></footer>`;

  if (document.body.dataset.theme === "programa") {
    $(".brand").setAttribute("href", "/programa");
    $(".brand").innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#a9dc76"/><path d="M20 33V17" stroke="#0f3d2e" stroke-width="3" stroke-linecap="round"/><path d="M20 22C12 22 9 17 9 12c7 0 11 3 11 10Z" fill="#2f8f4e"/><path d="M20 18c0-6 4-9 11-9 0 6-4 9-11 9Z" fill="#0f3d2e"/><circle cx="20" cy="9" r="3" fill="#f4c430"/></svg><span>Creciendo por la vida<small>Programa de Educación Ambiental</small></span>`;
    $("#nav").innerHTML = `<a href="#informacion">El programa</a><a href="#noticias">Noticias</a><a href="#galeria">Galería</a><a href="#aliados">Aliados</a><a class="back" href="/">Ir a la ASADA</a>`;
    $("#nav").onclick = e => e.target.closest("a") && $("#nav").classList.remove("open");
    $("#site-footer").innerHTML = `<footer class="footer aya-footer"><div class="aya-footer-wave" aria-hidden="true"></div><div class="wrap"><div class="aya-footer-grid">
      <div class="aya-footer-brand"><h4>Creciendo por la vida</h4><p>Programa de Educación Ambiental de la ASADA Bijagua. Cuidamos el agua y el bosque con la comunidad de Bijagua de Upala.</p></div>
      <div><h4>Explorar</h4><ul class="list-footer"><li><a href="#informacion">El programa completo</a></li><li><a href="#noticias">Noticias</a></li><li><a href="#aliados">Aliados</a></li></ul></div>
      <div><h4>ASADA Bijagua</h4><ul class="list-footer"><li><a href="/">Volver al sitio de la ASADA</a></li><li><a href="/contacto">Contacto</a></li></ul></div>
      </div><div class="legal"><span>&copy; ${new Date().getFullYear()} ASADA Bijagua</span><button type="button" id="open-admin" class="top-admin footer-admin">Acceso Administrativo</button></div></div></footer>`;
  }

  const mainEl = $("main");
  if (mainEl && !mainEl.id) mainEl.id = "contenido-principal";
  document.body.insertAdjacentHTML("afterbegin", `<a class="skip-link" href="#contenido-principal">Saltar al contenido principal</a>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div id="accesibilidad-flotante" class="acc-float">
      <button type="button" class="acc-bubble" id="acc-bubble" aria-label="Abrir opciones de accesibilidad" aria-expanded="false" aria-controls="acc-panel" title="Accesibilidad">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="4" r="1.8" stroke="currentColor" stroke-width="1.8"/>
          <path d="M4.5 8.6c2.4 1.2 4.8 1.8 7.5 1.8s5.1-.6 7.5-1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M12 10.4V15m0 0-4.2 6m4.2-6 4.2 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="acc-panel" id="acc-panel" role="group" aria-label="Ajustes de accesibilidad" hidden>
        <p class="acc-title">Accesibilidad</p>
        <div class="acc-row">
          <span>Tamaño de texto</span>
          <div class="acc-btns">
            <button type="button" id="acc-fs-menos" aria-label="Reducir tamaño de letra">A-</button>
            <button type="button" id="acc-fs-reset" aria-label="Restablecer tamaño de letra">A</button>
            <button type="button" id="acc-fs-mas" aria-label="Aumentar tamaño de letra">A+</button>
          </div>
        </div>
        <div class="acc-row">
          <span class="acc-row-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>Modo oscuro</span>
          <button type="button" class="acc-switch" id="acc-oscuro" role="switch" aria-checked="false" aria-label="Alternar modo oscuro"><span></span></button>
        </div>
        <p class="acc-hint">Toque la burbuja para abrir o cerrar.</p>
      </div>
    </div>
  `);

  if (document.body.dataset.theme !== "programa") {
    const waSVG = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.5 2 2 6.5 2 12.04c0 1.77.46 3.5 1.34 5.02L2 22l5.08-1.33A10 10 0 1 0 12.04 2Zm0 18.16a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.02.79.81-2.94-.2-.3a8.3 8.3 0 1 1 6.94 3.79Zm4.55-6.2c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.37-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.49c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.04 2.63c.13.17 1.79 2.73 4.34 3.83.61.26 1.08.42 1.45.54.61.19 1.16.17 1.6.1.49-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3Z"/></svg>`;
    const floating = document.body.dataset.page === "contacto"
      ? `<a class="lf-wa-bubble" id="wa-bubble" href="https://wa.me/50683651396" target="_blank" rel="noopener" aria-label="Enviar mensaje por WhatsApp" title="Escribinos por WhatsApp">${waSVG}</a>`
      : `<a class="lf-float-contact" href="/contacto" aria-label="Contactar con la ASADA" title="Contacto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8V7a2 2 0 00-2-2h-1M7 3H6a2 2 0 00-2 2v1m0 10v1a2 2 0 002 2h1m10 0h1a2 2 0 002-2v-1M3 8l9 6 9-6"/></svg></a>`;
    document.body.insertAdjacentHTML("beforeend", floating + lfLightboxHTML);
    $("#lf-lightbox-x")?.addEventListener("click", () => $("#lf-lightbox")?.classList.remove("open"));
    $("#lf-lightbox")?.addEventListener("click", e => { if (e.target.id === "lf-lightbox") e.currentTarget.classList.remove("open"); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") $("#lf-lightbox")?.classList.remove("open"); });
  }

  $("#burger").onclick = () => $("#nav").classList.toggle("open");
  fixLinks(document);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    fixLinks(n);
    decorateButtons(n);
  }))).observe(document.body, { childList: true, subtree: true });
  markLogos();
  document.body.classList.add("site-ready");
  if (document.body.dataset.theme !== "programa") { loadSiteConfig(); initWaterDrops(); }
  initAyaUI();
  const modal = $("#pin-modal");
  const open = () => { modal?.classList.add("open"); if ($("#pin-in")) $("#pin-in").value = ""; if ($("#pin-pass")) $("#pin-pass").value = ""; if ($("#pin-err")) $("#pin-err").hidden = true; $("#pin-in")?.focus(); };
  const check = async () => {
    const email = $("#pin-in")?.value.trim(), pass = $("#pin-pass")?.value, err = $("#pin-err");
    if (!email || !pass || !err) { if (err) { err.textContent = "Ingrese su correo y contraseña."; err.hidden = false; } return; }
    err.hidden = true;
    const btn = $("#pin-ok"); btn.disabled = true; btn.textContent = "Ingresando…";
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      modal.classList.remove("open");
      location.href = toHref("/admin");
    } catch (e) {
      err.textContent = "Correo o contraseña incorrectos, o la cuenta no está autorizada.";
      err.hidden = false;
    } finally { btn.disabled = false; btn.textContent = "Ingresar"; }
  };
  $("#open-admin")?.addEventListener("click", () => isAdmin() ? (location.href = toHref("/admin")) : open());
  if ($("#pin-ok")) $("#pin-ok").onclick = check;
  $("#pin-x")?.addEventListener("click", () => modal?.classList.remove("open"));
  $("#pin-in")?.addEventListener("keydown", e => { if (e.key === "Enter") $("#pin-pass")?.focus(); if (e.key === "Escape") modal?.classList.remove("open"); });
  $("#pin-pass")?.addEventListener("keydown", e => { if (e.key === "Enter") check(); if (e.key === "Escape") modal?.classList.remove("open"); });
  window.openPin = open;
  const root = document.documentElement; let fs = 1;
  try {
    fs = Number(localStorage.getItem("asada_fs")) || 1;
    // Se respeta el valor anterior de alto contraste para no perder la preferencia del visitante.
    const modoOscuro = localStorage.getItem("asada_dark") ?? localStorage.getItem("asada_hc");
    if (modoOscuro === "1") root.classList.add("dark");
  } catch (e) { }
  root.style.setProperty("--fs", fs);
  const aplicarFs = () => {
    root.style.setProperty("--fs", fs);
    try { localStorage.setItem("asada_fs", fs); } catch (e) { }
  };
  const accBubble = $("#acc-bubble"), accPanel = $("#acc-panel"), accSwitch = $("#acc-oscuro");
  const setAccAbierto = a => { if (accPanel) accPanel.hidden = !a; accBubble?.setAttribute("aria-expanded", String(!!a)); };
  accBubble?.addEventListener("click", e => { e.stopPropagation(); setAccAbierto(accPanel?.hidden); });
  document.addEventListener("click", e => { if (!e.target.closest("#accesibilidad-flotante")) setAccAbierto(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setAccAbierto(false); });
  $("#acc-fs-menos")?.addEventListener("click", () => { fs = Math.max(0.9, +(fs - 0.1).toFixed(2)); aplicarFs(); });
  $("#acc-fs-mas")?.addEventListener("click", () => { fs = Math.min(1.3, +(fs + 0.1).toFixed(2)); aplicarFs(); });
  $("#acc-fs-reset")?.addEventListener("click", () => { fs = 1; aplicarFs(); });
  const actualizarSwitch = () => accSwitch?.setAttribute("aria-checked", String(root.classList.contains("dark")));
  accSwitch?.addEventListener("click", () => {
    const on = root.classList.toggle("dark");
    try { localStorage.setItem("asada_dark", on ? "1" : "0"); } catch (e) { }
    actualizarSwitch();
  });
  actualizarSwitch();
  decorateButtons(document);
};

/* ---------- TARJETAS ---------- */
const newsCard = n => `<article class="card"><a class="card-img" href="/noticia-detalle?id=${n.id}">${n.imagenId ? `<img src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}" loading="lazy">` : ""}</a>
  <div class="card-body"><time>${fmt(n.creadoEn)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.resumen || "")}</p><a class="link" href="/noticia-detalle?id=${n.id}" style="align-self:flex-start">Leer mas</a></div></article>`;
const cutRow = c => {
  const on = !/final|cancel/i.test(c.estado || "");
  return `<div class="row"><div><strong>${fmt(c.fecha)}</strong><span class="meta">${esc(c.horario || "")}</span></div>
  <div><span class="meta">${esc(c.tipo || "Aviso")}</span><h3>${esc(c.sector)}</h3><p>${esc(c.motivo || "")}</p></div><span class="tag ${on ? "on" : "off"}">${esc(c.estado || "Programado")}</span></div>`;
};

/* ---------- LOGO DE LA ASADA (editable desde el panel) ---------- */
const LOGO_SEL = ".brand img, .aya-footer-brand img, .site-logo";
// El logo oficial ya está incluido como logo.png; si el panel sigue teniendo ese mismo
// archivo, no hay que reemplazar las imágenes (evita un cambio innecesario al cargar).
const BUNDLED_LOGO_ID = "6aff14750019b250a8b9";
const markLogos = () => $$(LOGO_SEL).forEach(img => {
  if (img.dataset.logoBound) return; img.dataset.logoBound = "1";
  const show = () => img.classList.add("loaded");
  img.addEventListener("load", show);
  img.addEventListener("error", () => {
    // Si falla un logo subido, volvemos al isotipo local en lugar de dejar un cuadro vacío.
    if (!img.src.endsWith("/logo.png")) img.src = "/logo.png";
    show();
  });
  if (img.complete && img.naturalWidth > 0) show();
  setTimeout(show, 450);
});
const applySiteLogo = async () => {
  if (window.__asadaLogoLoaded) return;
  window.__asadaLogoLoaded = true;
  try {
    const [l] = await listDocs("sitio_logo", "creadoEn", "desc", 1);
    if (!l?.logoId) return;
    const src = fileView(l.logoId);
    if (l.logoId !== BUNDLED_LOGO_ID) {
      $$(LOGO_SEL).forEach(img => {
        img.classList.remove("loaded"); img.style.display = ""; img.src = src;
        if (img.complete && img.naturalWidth > 0) img.classList.add("loaded");
      });
      const fav = $('link[rel="icon"]'); if (fav) fav.href = src;
      const side = $(".aya-footer-brand");
      if (side && !side.querySelector("img")) {
        side.insertAdjacentHTML("afterbegin", `<img class="site-logo" src="${src}" alt="ASADA Bijagua">`);
        markLogos();
      }
    }
  } catch (e) { }
};

/* ---------- LOGO DEL PROGRAMA (editable desde el panel) ---------- */
const applyProgLogo = async () => {
  try {
    const [l] = await listDocs("programa_logo", "creadoEn", "desc", 1);
    if (!l?.logoId) return;
    const src = fileView(l.logoId);
    const b = $(".brand svg");
    if (b) b.replaceWith(Object.assign(document.createElement("img"), { src, alt: "Logo del programa Creciendo por la vida" }));
    const pill = $(".hero-txt .pill");
    if (pill) pill.insertAdjacentHTML("beforebegin", `<img class="hero-logo" src="${src}" alt="">`);
  } catch (e) { }
};

/* ---------- PAGINAS ---------- */
const pages = {
  async index() {
    await loadSiteConfig();
    const cb = $("#home-cortes"), nb = $("#home-news");
    if (cb) try { const c = (await listDocs("cortes", "fecha", "desc", 20)).filter(x => !/final|cancel/i.test(x.estado || "")).slice(0, 4);
      cb.innerHTML = lfAvisosHTML(c); lfInitCarousel(); } catch (e) { console.error(e); fail(cb); }
    const hp = $("#home-prog");
    if (hp) listDocs("programa_noticias", "creadoEn", "desc", 3).then(n => { if (n.length) hp.innerHTML = n.map(x => `<a href="/programa#noticia-${x.id}"><time>${fmt(x.creadoEn)}</time><strong>${esc(x.titulo)}</strong></a>`).join(""); }).catch(() => { });
    if (nb) try { const n = await listDocs("noticias", "creadoEn", "desc", 6);
      const side = $("#lf-news-side"), grid = nb.closest(".lf-news-grid") || $(".lf-news-grid");
      if (n.length) {
        nb.innerHTML = lfNewsHTML(n); lfInitNewsCarousel();
      } else empty(nb, "Aún no hay noticias publicadas.");
      // Todas las noticias van en un solo carrusel: nada de tarjetas estrechas apiladas a la derecha.
      if (side) { side.innerHTML = ""; side.hidden = true; }
      if (grid) grid.classList.add("single");
    } catch (e) { console.error(e); fail(nb); }
    // botones/accesos personalizados (ASADA)
    try {
      const btns = (await listDocs("sitio_botones", "orden", "asc", 100)).filter(b => b.visible !== "No" && b.visible !== false);
      const quick = btns.filter(b => b.ubicacion === "Accesos rápidos Inicio");
      const hero = btns.filter(b => b.ubicacion === "Botones destacados Inicio");
      if (quick.length && $(".tiles, .grid .tile")?.closest(".grid")) { /* opcional: no romper layout */ }
      if (hero.length && $(".hero .rise:last-child, .hero .acts, .hero .wrap > div.rise")) {
        const cont = $(".hero .wrap > div.rise") || $(".hero .acts");
        if (cont) cont.insertAdjacentHTML("beforeend", hero.map(b => `<a class="btn ghost" href="${esc(destAny(b.destino))}">${esc(b.etiqueta)}</a>`).join(""));
      }
      // accesos rápidos como tarjetas extra si hay contenedor
      if (quick.length) {
        const grid = document.querySelector('a.tile')?.closest('.grid');
        if (grid) grid.insertAdjacentHTML("beforeend", quick.map(b => `<a class="tile c3" href="${esc(destAny(b.destino))}"><h3>${esc(b.etiqueta)}</h3><p>Acceso rápido</p></a>`).join(""));
      }
      if (btns.some(b => b.ubicacion === "Sección Contacto")) {
        const cc = document.querySelector("#contacto-custom-btns") || document.querySelector(".c5");
        // handled in contacto
      }
    } catch (e) { }
    await lfRenderHome();
    await renderSitePageSections("Inicio");
  },
  async noticias() {
    const box = $("#feed");
    try { const n = await listDocs("noticias"); n.length ? box.innerHTML = n.map(newsCard).join("") : empty(box, "Aun no hay noticias publicadas."); } catch (e) { console.error(e); fail(box); }
    if (isAdmin()) $("#admin-link").hidden = false;
  },
  async detalle() {
    const box = $("#article"), id = new URLSearchParams(location.search).get("id");
    if (!id) return empty(box, "No se indico la noticia.");
    try { const n = await getOne("noticias", id); if (!n) return empty(box, "La noticia no existe o fue retirada.");
      document.title = n.titulo + " | ASADA Bijagua";
      box.innerHTML = `<time>${fmt(n.creadoEn)}</time><h1>${esc(n.titulo)}</h1>${n.imagenId ? `<img class="hero-img" src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}">` : ""}${paras(n.descripcion)}`;
    } catch (e) { console.error(e); fail(box); }
  },
  async cortes() {
    const box = $("#cortes-list");
    try { const c = await listDocs("cortes", "fecha", "desc"); c.length ? box.innerHTML = `<div class="rows">${c.map(cutRow).join("")}</div>` : empty(box, "No hay avisos registrados."); } catch (e) { console.error(e); fail(box); }
    if (isAdmin()) $("#admin-link").hidden = false;
  },
  async programa() {
    let tx = { ...PROG.t }, al = PROG.aliados.map(nombre => ({ nombre: nombre.trim() })), news = [], shown = 0;
    let customSecs = [], customBtns = [];
    applyProgLogo();
    try { const pc = await listDocs("programa_config", "creadoEn", "desc", 20); const bg = pc.find(r => r.clave === "Fondo Inicio del programa (hero)" && r.imagenId); if (bg) document.documentElement.style.setProperty("--prog-hero-bg", `url("${fileView(bg.imagenId)}")`); } catch (e) { }
    try { (await listDocs("programa_textos")).reverse().forEach(d => { if (d.clave && d.contenido) tx[d.clave] = d.contenido; }); } catch (e) { }
    try { const key = s => String(s || "").trim().toLowerCase();
      const docs = (await listDocs("programa_aliados", "creadoEn", "asc")).filter(x => x.visible !== "No" && x.visible !== false && x.nombre);
      docs.forEach(d => {
        const dk = key(d.nombre);
        // Coincidencia exacta; si el aliado fue renombrado (ej. "Casitas" ->
        // "Casitas Tenorio B&B and Farm"), reemplaza la entrada fija anterior.
        let i = al.findIndex(x => key(x.nombre) === dk);
        if (i < 0) i = al.findIndex(x => dk.startsWith(key(x.nombre) + " "));
        const registro = { ...d, nombre: String(d.nombre).trim() };
        if (i >= 0) al[i] = registro; else al.push(registro);
      }); } catch (e) { }
    try { customSecs = (await listDocs("programa_secciones", "orden", "asc", 200)).filter(x => x.visible !== "No" && x.visible !== false); } catch (e) { }
    try { customBtns = (await listDocs("programa_botones", "orden", "asc", 200)).filter(x => x.visible !== "No" && x.visible !== false); } catch (e) { }
    const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "seccion";
    const secId = s => "sec-" + (s.slug ? slugify(s.slug) : (s.id || Math.random().toString(36).slice(2)));
    const dest = d => { const v = String(d || "#inicio").trim(); return /^(https?:|mailto:|tel:|#|\/)/.test(v) ? v : "#" + slugify(v); };
    const renderBlocks = (blocks, fallback = null) => {
      if (Array.isArray(blocks) && blocks.length) {
        const logos = [], out = [];
        const flushLogos = () => { if (!logos.length) return; out.push(`<div class="cms-logos">${logos.splice(0).map(l => `${l.url ? `<a class="cms-logo" href="${esc(dest(l.url))}" ${/^https?:/.test(l.url||"") ? 'target="_blank" rel="noopener"' : ""}>` : `<div class="cms-logo">`}${l.imagenId ? `<img src="${fileView(l.imagenId)}" alt="${esc(l.etiqueta || "Logo")}" loading="lazy">` : ""}${l.etiqueta ? `<span>${esc(l.etiqueta)}</span>` : ""}${l.url ? `</a>` : `</div>`}`).join("")}</div>`); };
        blocks.forEach(b => {
          if (!b || typeof b !== "object") return;
          if (b.tipo === "logo") { logos.push(b); return; } else flushLogos();
          if (b.tipo === "titulo") out.push(`<h2 class="cms-h2">${esc(b.texto || "")}</h2>`);
          else if (b.tipo === "subtitulo") out.push(`<h3 class="cms-h3">${esc(b.texto || "")}</h3>`);
          else if (b.tipo === "texto") out.push(`<div class="prose">${paras(b.texto || "")}</div>`);
          else if (b.tipo === "imagen" && b.imagenId) out.push(`<figure class="cms-fig">${b.url ? `<a href="${esc(dest(b.url))}">` : ""}<img class="custom-img" src="${fileView(b.imagenId)}" alt="${esc(b.alt || b.texto || "")}" loading="lazy">${b.url ? `</a>` : ""}${b.texto ? `<figcaption class="meta">${esc(b.texto)}</figcaption>` : ""}</figure>`);
          else if (b.tipo === "boton") out.push(`<p class="more"><a class="btn ${b.estilo === "secundario" ? "ghost" : "sun"}" href="${esc(dest(b.url || "#"))}" ${/^https?:/.test(b.url||"") ? 'target="_blank" rel="noopener"' : ""}>${esc(b.etiqueta || "Abrir")}</a></p>`);
          else if (b.tipo === "enlace") out.push(`<p><a class="link" href="${esc(dest(b.url || "#"))}" ${/^https?:/.test(b.url||"") ? 'target="_blank" rel="noopener"' : ""}>${esc(b.etiqueta || b.url || "Enlace")}</a></p>`);
        });
        flushLogos();
        return out.join("");
      }
      if (fallback) {
        const img = fallback.imagenId ? `<img class="custom-img" src="${fileView(fallback.imagenId)}" alt="${esc(fallback.titulo || "")}" loading="lazy">` : "";
        const btn = fallback.botonTexto ? `<p class="more"><a class="btn sun" href="${esc(dest(fallback.botonDestino))}">${esc(fallback.botonTexto)}</a></p>` : "";
        return `<div class="two custom-two"><div class="prose">${paras(fallback.contenido || "")}${btn}</div>${img ? `<div>${img}</div>` : ""}</div>`;
      }
      return "";
    };
    const secHtml = s => {
      const id = secId(s);
      const body = (Array.isArray(s.bloques) && s.bloques.length) ? `<div class="cms-body">${renderBlocks(s.bloques)}</div>` : renderBlocks(null, s);
      return `<section class="sec custom-sec" id="${esc(id)}" data-slug="${esc(slugify(s.slug || s.titulo || ""))}"><div class="wrap"><div class="head"><h2>${esc(s.titulo || "Nueva sección")}</h2></div>${body}</div></section>`;
    };
    const isHome = v => v === "Inicio" || v === "Sección en: Inicio del programa";
    const isInfo = v => v === "Información del programa" || v === "Sección en: Información del programa";
    const isPage = v => v === "Página independiente" || v === "Página nueva (individual)";
    const homeSecs = customSecs.filter(s => isHome(s.vista)), infoSecs = customSecs.filter(s => isInfo(s.vista)), pageSecs = customSecs.filter(s => isPage(s.vista));
    const ln = t => String(t).split("\n").map(x => x.trim()).filter(Boolean), set = (id, h) => { const el = $(id); if (el) el.innerHTML = h; };
    set("#p-resumen", paras(tx["Resumen"])); set("#i-historia-t", paras(tx["Historia"]));
    if ($("#i-m")) $("#i-m").textContent = tx["Misión"]; if ($("#i-v")) $("#i-v").textContent = tx["Visión"]; if ($("#i-o")) $("#i-o").textContent = tx["Objetivo principal"];
    set("#i-f", paras(tx["Filosofía"])); set("#i-vals", ln(tx["Valores"]).map(v => `<li>${esc(v)}</li>`).join(""));
    set("#i-ejes-l", ln(tx["Ejes temáticos"]).map(v => `<li>${esc(v)}</li>`).join("")); set("#i-grupos", ln(tx["Grupos meta"]).map(v => `<li>${esc(v)}</li>`).join(""));
    set("#i-proj", PROG.proyectos.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join(""));
    set("#p-cifras", PROG.cifras.concat([["más de", al.length, "aliados que hacen posible el programa"]]).slice(0, 3).map(([p, n, l]) => `<div class="stat"><small>${p}</small><b data-n="${n}">0</b><span>${l}</span></div>`).join(""));
    const chip = a => `<li class="ally"><i>${a.logoId ? `<img src="${fileView(a.logoId)}" alt="">` : esc((a.nombre || "").trim()[0] || "")}</i>${esc(a.nombre)}</li>`;
    const mq = al.map(chip).join(""); set("#p-marq", mq + mq); set("#i-al", mq);
    if ($("#al-q")) $("#al-q").oninput = e => { const q = e.target.value.toLowerCase(); $$("#i-al li").forEach((li, i) => li.hidden = !al[i].nombre.toLowerCase().includes(q)); };
    $$("#p-marq li").forEach((li, i) => i >= al.length && li.setAttribute("aria-hidden", "true"));
    const count = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; count.unobserve(e.target); const n = +e.target.dataset.n, t0 = performance.now();
      const f = t => { const k = Math.min(1, (t - t0) / 1400); e.target.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))).toLocaleString("es-CR"); k < 1 && requestAnimationFrame(f); }; f(t0); }));
    $$("[data-n]").forEach(el => count.observe(el));
    const lv = $("#leaves"); if (lv) for (let i = 0; i < 9; i++) { const e = document.createElement("span"); e.style.cssText = `--x:${Math.random() * 95}%;--s:${12 + Math.random() * 16}px;--c:${["#a9dc76", "#2f8f4e", "#f4c430"][i % 3]};--t:${14 + Math.random() * 12}s;--dl:${-Math.random() * 20}s;--dx:${(Math.random() - .5) * 200}px`; lv.append(e); }
    addEventListener("scroll", () => document.documentElement.style.setProperty("--g", scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)), { passive: true });
    const card = n => `<button class="card" type="button" data-id="${n.id}"><span class="im">${n.imagenId ? `<img src="${fileView(n.imagenId)}" alt="" loading="lazy">` : ""}</span><span class="bd"><time>${fmt(n.creadoEn)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.resumen || "")}</p></span></button>`;
    const drawNews = () => { const box = $("#p-news"); if (!box) return; if (!news.length) return empty(box, "Pronto compartiremos aquí las actividades del programa.");
      shown = Math.min(news.length, shown + 3); box.innerHTML = news.slice(0, shown).map(card).join(""); if ($("#p-more")) $("#p-more").hidden = shown >= news.length; };
    try { news = await listDocs("programa_noticias", "creadoEn", "desc", 60); } catch (e) { console.error(e); }
    drawNews(); if ($("#p-more-b")) $("#p-more-b").onclick = drawNews;
    if ($("#p-news")) $("#p-news").onclick = e => { const c = e.target.closest("[data-id]"); if (c) location.hash = "noticia-" + c.dataset.id; };
    try { const g = await listDocs("programa_galeria", "creadoEn", "desc", 30); if (g.length) { if ($("#galeria")) $("#galeria").hidden = false;
      set("#p-gal", g.map(x => `<a href="${fileView(x.imagenId)}" target="_blank" rel="noopener"><img src="${fileView(x.imagenId)}" alt="${esc(x.titulo || "Foto del programa")}" loading="lazy"></a>`).join("")); } } catch (e) { }

    // Secciones personalizadas
    if ($("#p-custom-home")) $("#p-custom-home").innerHTML = homeSecs.map(secHtml).join("");
    if ($("#p-custom-info")) $("#p-custom-info").innerHTML = infoSecs.map(secHtml).join("");
    // Botones/menú personalizados
    const navBtns = customBtns.filter(b => b.ubicacion === "Menú principal");
    const subBtns = customBtns.filter(b => b.ubicacion === "Submenú información");
    const heroBtns = customBtns.filter(b => b.ubicacion === "Botón destacado inicio");
    if (navBtns.length) $("#nav").insertAdjacentHTML("beforeend", navBtns.map(b => `<a href="${esc(dest(b.destino))}" data-custom="1">${esc(b.etiqueta)}</a>`).join(""));
    if (subBtns.length && $("#sub")) $("#sub").insertAdjacentHTML("beforeend", subBtns.map(b => `<a href="${esc(dest(b.destino))}" data-custom="1">${esc(b.etiqueta)}</a>`).join(""));
    if (heroBtns.length && $(".acts")) $(".acts").insertAdjacentHTML("beforeend", heroBtns.map(b => `<a class="btn ghost" href="${esc(dest(b.destino))}">${esc(b.etiqueta)}</a>`).join(""));
    $("#nav").onclick = e => e.target.closest("a") && $("#nav").classList.remove("open");

    if (isAdmin()) { const d = document.createElement("div"); d.className = "adm"; d.innerHTML = `Modo administrador <a href="${toHref("/admin#prog_seccion")}">Secciones/Páginas</a><a href="${toHref("/admin#prog_boton")}">Botones/Menú</a><a href="${toHref("/admin#prog_noticia")}">Noticias</a>`; document.body.append(d); }
    const dlg = $("#reader");
    dlg.onclick = e => { if (e.target === dlg || e.target.id === "reader-x") dlg.close(); };
    dlg.onclose = () => { if (location.hash.startsWith("#noticia-")) location.hash = "noticias"; };
    const customByHash = h => pageSecs.find(s => ("sec-" + slugify(s.slug || s.titulo || "")) === h || slugify(s.slug || "") === h);
    const route = async () => {
      const h = location.hash.slice(1);
      const page = customByHash(h);
      const info = h === "informacion" || h.startsWith("i-") || (infoSecs.some(s => secId(s) === h));
      if (page) {
        $("#view-home").hidden = true; $("#view-info").hidden = true; $("#p-custom-page").hidden = false;
        const pageBody = (Array.isArray(page.bloques) && page.bloques.length) ? `<div class="cms-body">${renderBlocks(page.bloques)}</div>` : `<div class="prose">${page.imagenId ? `<img class="custom-img hero-img" src="${fileView(page.imagenId)}" alt="${esc(page.titulo || "")}">` : ""}${paras(page.contenido || "")}${page.botonTexto ? `<p class="more"><a class="btn sun" href="${esc(dest(page.botonDestino))}">${esc(page.botonTexto)}</a></p>` : ""}</div>`;
        $("#p-custom-page").innerHTML = `<section class="page-head"><div class="wrap"><a class="back-l" href="#inicio">← Volver al inicio</a><h1>${esc(page.titulo || "Página")}</h1></div></section><section class="sec"><div class="wrap narrow">${pageBody}</div></section>`;
        $$('#nav a').forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + h)); scrollTo(0, 0); return;
      }
      $("#p-custom-page").hidden = true;
      $("#view-home").hidden = info; $("#view-info").hidden = !info; $$('#nav a[href="#informacion"]').forEach(a => a.classList.toggle("on", info));
      if (h.startsWith("noticia-")) { const id = h.slice(8); let n = news.find(x => x.id === id); try { n = n || await getOne("programa_noticias", id); } catch (e) { }
        if (n) { set("#reader-b", `<time>${fmt(n.creadoEn)}</time><h1>${esc(n.titulo)}</h1>${n.imagenId ? `<img class="hero-img" src="${fileView(n.imagenId)}" alt="">` : ""}${paras(n.descripcion)}`); if (!dlg.open) dlg.showModal(); } return; }
      if (dlg.open) dlg.close();
      const el = h && document.getElementById(h); if (el && h !== "informacion") el.scrollIntoView(); else scrollTo(0, 0);
    };
    addEventListener("hashchange", route); route();
    const subs = $$("#sub a"), spy = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && subs.forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id))), { rootMargin: "-30% 0px -60% 0px" });
    subs.forEach(a => { const t = $(a.hash); if (t) spy.observe(t); });
  },
  async nosotros() {
    await loadSiteConfig();
    const box = $("#junta");
    if (box) try { const j = await listDocs("junta", "orden", "asc"); j.length ? box.innerHTML = j.map(m => `<div class="c3 team"><div class="card-img">${m.fotoId ? `<img src="${fileView(m.fotoId)}" alt="${esc(m.nombre)}" loading="lazy">` : ""}</div><h3>${esc(m.nombre)}</h3><p>${esc(m.cargo)}</p></div>`).join("") : empty(box, "La Junta Directiva se mostrara aqui.");
    } catch (e) { console.error(e); fail(box); }
    const cbox = $("#colaboradores");
    if (cbox) try { const c = await listDocs("colaboradores", "orden", "asc"); c.length ? cbox.innerHTML = c.map(m => `<div class="c3 team"><div class="card-img">${m.fotoId ? `<img src="${fileView(m.fotoId)}" alt="${esc(m.nombre)}" loading="lazy">` : ""}</div><h3>${esc(m.nombre)}</h3><p>${esc(m.cargo)}</p></div>`).join("") : empty(cbox, "Aún no hay colaboradores registrados.");
    } catch (e) { console.error(e); fail(cbox); }
    await renderSitePageSections("Nosotros");
  },
  async proyectos() {
    await loadSiteConfig();
    const box = $("#proyectos-list");
    if (box) try { const p = await listDocs("proyectos"); p.length ? box.innerHTML = p.map(x => `<article class="card"><div class="card-img">${x.imagenId ? `<img src="${fileView(x.imagenId)}" alt="${esc(x.titulo)}" loading="lazy">` : ""}</div><div class="card-body"><span class="tag" style="align-self:flex-start">${esc(x.estado || "")}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion || "")}</p></div></article>`).join("") : empty(box, "No hay proyectos registrados.");
    } catch (e) { console.error(e); fail(box); }
    await renderSitePageSections("Proyectos");
  },
  async documentos() {
    await loadSiteConfig();
    const box = $("#docs-list"), q = $("#doc-q"), cat = $("#doc-cat");
    let all = [];
    const draw = () => { if (!box) return; const t = q ? q.value.toLowerCase() : "", c = cat ? cat.value : "";
      const r = all.filter(d => (!c || d.categoria === c) && (!t || (d.titulo + " " + (d.descripcion || "")).toLowerCase().includes(t)));
      r.length ? box.innerHTML = `<div class="rows">${r.map(d => `<div class="row"><div><span class="tag">${esc(d.categoria || "Documento")}</span></div><div><h3>${esc(d.titulo)}</h3><p>${fmtReq(d.descripcion || "")}</p><span class="meta">${fmt(d.creadoEn)}</span></div><a class="btn sm dark" href="${fileDown(d.archivoId)}" target="_blank" rel="noopener">Descargar</a></div>`).join("")}</div>` : empty(box, "No se encontraron documentos."); };
    try { all = await listDocs("documentos"); draw(); } catch (e) { console.error(e); if (box) fail(box); }
    if (q) q.oninput = draw; if (cat) cat.onchange = draw;
    await renderSitePageSections("Transparencia/Documentos");
  },
  async faq() {
    await loadSiteConfig();
    const box = $("#faq-list");
    let items = [
      ["Como puedo reportar una fuga o averia?", "Use el formulario de la pagina de contacto o llame al numero de emergencias publicado en el pie de pagina."],
      ["Como se informan los cortes de agua?", "Los cortes programados y mantenimientos se publican en la seccion Avisos de servicio."],
      ["Que tramites puedo realizar?", "Consulte los requisitos y formularios en la pagina de Tramites y presente la documentacion ante la Junta Directiva."],
      ["Donde puedo ver las tarifas vigentes?", "En la pagina Tarifas y en los documentos de Transparencia."],
      ["Como se vigila la calidad del agua?", "La ASADA realiza controles periodicos. Los resultados se resumen en Calidad del agua."],
      ["Que hago si el agua llega turbia?", "Deje correr el agua unos minutos y, si persiste, reporte el caso indicando su sector."],
      ["Donde encuentro reglamentos y formularios?", "En Transparencia, con busqueda y descarga directa."]
    ].map(([pregunta, respuesta]) => ({ pregunta, respuesta }));
    try { const r = await listDocs("faqs", "orden", "asc"); if (r.length) items = r; } catch (e) { }
    if (box) {
      box.innerHTML = items.map(i => `<div class="acc-item"><button class="acc-q" type="button" aria-expanded="false">${esc(i.pregunta)}</button><div class="acc-a"><div>${esc(i.respuesta)}</div></div></div>`).join("");
      $$(".acc-item", box).forEach(it => $(".acc-q", it).onclick = () => {
        const o = it.classList.toggle("open"), a = $(".acc-a", it);
        a.style.maxHeight = o ? a.scrollHeight + "px" : 0; $(".acc-q", it).setAttribute("aria-expanded", o);
      });
    }
    await renderSitePageSections("Preguntas frecuentes");
  },
  async contacto() {
    await loadSiteConfig();
    const f = $("#report-form"), m = $("#report-msg");
    if (f) f.onsubmit = async e => { e.preventDefault(); const b = $("button", f); b.disabled = true;
      try { await createDoc("contactos", { ...Object.fromEntries(new FormData(f)), estado: "Nuevo" }); f.reset(); m.className = "notice"; m.textContent = "Reporte enviado. La ASADA lo atendera a la brevedad."; }
      catch (er) { m.className = "notice err"; m.textContent = "No se pudo enviar el reporte. Intente de nuevo o llame al numero de emergencias."; }
      m.hidden = false; b.disabled = false; };
    try {
      const btns = (await listDocs("sitio_botones", "orden", "asc", 100)).filter(b => b.ubicacion === "Sección Contacto" && b.visible !== "No" && b.visible !== false);
      if (btns.length) {
        const host = $("#contacto-custom-btns");
        if (host) host.innerHTML = btns.map(b => `<p style="margin-top:10px"><a class="btn sm dark" href="${esc(destAny(b.destino))}">${esc(b.etiqueta)}</a></p>`).join("");
      }
    } catch (e) { }
    await renderSitePageSections("Contacto");
  },
  async static() {
    await loadSiteConfig();
    const path = location.pathname.replace(/\/$/, "") || "/";
    const file = (path.split("/").pop() || "index").toLowerCase().replace(/\.html$/, "");
    const pageNames = { "servicios":"Servicios", "tarifas":"Tarifas", "calidad-agua":"Calidad del agua", "afiliacion":"Trámites" };
    const cfg = (k) => SITE_CFG[k]?.valor;
    const setHead = (titleKey, descKey, fallbackTitle, fallbackDesc) => {
      const t = cfg(titleKey) || fallbackTitle, d = cfg(descKey) || fallbackDesc;
      if ($("#page-title")) $("#page-title").textContent = t;
      if ($("#page-crumb")) $("#page-crumb").textContent = t;
      if ($("#page-desc")) $("#page-desc").textContent = d;
      if (t) document.title = `${t} | ${SITE.nombre || "ASADA Bijagua"}`;
    };

    if (file === "servicios") {
      setHead("Servicios - título", "Servicios - descripción", "Nuestros servicios", "Nuestro trabajo va desde la fuente hasta el grifo. Protegemos las nacientes y cuidamos 101,6 km de red; limpiamos y desinfectamos tanques, reparamos fugas y mantenemos los hidrantes. También hacemos control diario de cloro y atención a los abonados.");
      const box = $("#servicios-list");
      if (box) try {
        const items = (await listDocs("servicios", "orden", "asc", 100)).filter(x => x.visible !== "No" && x.visible !== false);
        if (items.length) box.innerHTML = items.map(x => `<div class="c4"><h3>${esc(x.titulo || "")}</h3><p style="margin-top:10px">${esc(x.descripcion || "")}</p></div>`).join("");
      } catch (e) { }
    } else if (file === "tarifas") {
      setHead("Tarifas - título", "Tarifas - descripción", "Tarifas", "Tarifas vigentes 2026 del servicio de agua y de la protección del recurso hídrico.");
      const wrap = $("#tarifas-wrap");
      if (wrap) try {
        const rows = (await listDocs("tarifas", "orden", "asc", 200)).filter(x => x.visible !== "No" && x.visible !== false);
        if (rows.length) {
          const canon = c => ({
            "Grandes Consumidores Residenciales": "Grandes Consumidores",
            "Grandes Consumidores Residenciales Bien Social": "Grandes Consumidores de Bien Social",
            "Grandes Consumidores Residenciales de Bien Social": "Grandes Consumidores de Bien Social"
          }[c] || c);
          const preferidas = ["Residencial", "Comercio y Servicios", "Industria", "Preferencial", "Grandes Consumidores", "Residencial Pobreza Básica", "Residencial Pobreza Extrema", "Grandes Consumidores de Bien Social"];
          const servicios = [
            { key: "Acueducto", nombre: "Servicio de Acueducto", nota: "Asadas con Sello de Calidad · más de 1 001 abonados. Cargo fijo mensual de ₡ 2 800.", tag: "Acueducto" },
            { key: "Protección del Recurso Hídrico", nombre: "Servicio de Protección del Recurso Hídrico", nota: "Cobro por metro cúbico consumido en la ASADA Bijagua.", tag: "TPRH" }
          ];
          const cats = [...new Set(rows.map(r => canon(String(r.categoria || "Otros"))))];
          cats.sort((a, b) => (preferidas.indexOf(a) < 0 ? 999 : preferidas.indexOf(a)) - (preferidas.indexOf(b) < 0 ? 999 : preferidas.indexOf(b)) || a.localeCompare(b, "es"));
          wrap.innerHTML = `<p class="meta tarifas-help">Seleccione su categoría para ver juntas las tarifas de acueducto y de protección del recurso hídrico.</p>` + cats.map((cat, idx) => {
            const rs = rows.filter(r => canon(String(r.categoria || "Otros")) === cat);
            const tabs = servicios.map(s => {
              const sr = rs.filter(r => String(r.servicio || "Acueducto") === s.key);
              if (!sr.length) return "";
              return `<div class="tarifa-serv"><h3>${esc(s.nombre)}</h3><p class="meta">${esc(s.nota)}</p><table class="table tarifas-table"><thead><tr><th>Bloque de consumo</th><th>Tarifa 2026</th><th>Tarifa anterior</th><th>Variación</th></tr></thead><tbody>${sr.map(r => `<tr><td>${esc(r.bloque || "")}</td><td><strong>${esc(r.cuota || "")}</strong></td><td>${esc(r.vigente || "")}</td><td>${esc(r.variacion || "")}</td></tr>`).join("")}</tbody></table></div>`;
            }).join("");
            const tags = servicios.filter(s => rs.some(r => String(r.servicio || "Acueducto") === s.key)).map(s => s.tag).join(" + ");
            return `<details class="tarifa-cat"${idx === 0 ? " open" : ""}><summary><span class="tarifa-cat-name">${esc(cat)}</span><span class="tarifa-cat-tag">${esc(tags)} · ${rs.length} tarifas</span></summary><div class="tarifa-cat-body">${tabs}</div></details>`;
          }).join("");
        }
      } catch (e) { console.error(e); }
      const nota = cfg("Tarifas - nota"); if (nota && $("#tarifas-nota")) $("#tarifas-nota").textContent = nota;
    } else if (file === "calidad-agua") {
      setHead("Calidad del agua - título", "Calidad del agua - descripción", "Calidad del agua", "Control y vigilancia del agua de consumo.");
      const cont = cfg("Calidad del agua - contenido");
      if (cont) { const box = $("#calidad-texto") || $("#calidad-content"); if (box) box.innerHTML = paras(cont); }
    } else if (file === "afiliacion") {
      setHead("Trámites - título", "Trámites - descripción", "Trámites", "Realice sus solicitudes de agua potable y alcantarillado sanitario en Bijagua y comunidades atendidas. Aquí encontrará los formularios vigentes, una guía general de requisitos y el proceso de atención. Si necesita orientación, llame al +506 2466 8671 o escriba a asadabijagua@gmail.com.");
      const req = cfg("Trámites - requisitos"), proc = cfg("Trámites - proceso"), forms = cfg("Trámites - formularios");
      if (req && $("#afiliacion-req")) $("#afiliacion-req").innerHTML = `<h3>Requisitos</h3><div class="prose">${paras(req)}</div>`;
      if (proc && $("#afiliacion-proc")) $("#afiliacion-proc").innerHTML = `<h3>Proceso</h3><div class="prose">${paras(proc)}</div>`;
      if (forms && $("#afiliacion-forms-text")) $("#afiliacion-forms-text").innerHTML = paras(forms);
      const box = $("#afiliacion-forms");
      if (box) try {
        const items = (await listDocs("documentos")).filter(d => d.categoria === "Formulario" && d.archivoId);
        if (items.length) {
          items.sort((a, b) => String(a.titulo || "").localeCompare(String(b.titulo || ""), "es"));
          box.innerHTML = items.map(d => `<div class="row"><div><span class="tag">Formulario</span></div><div><h3>${esc(d.titulo)}</h3><p>${fmtReq(d.descripcion || "")}</p></div><a class="btn sm dark" href="${fileDown(d.archivoId)}" target="_blank" rel="noopener">Descargar</a></div>`).join("");
        }
      } catch (e) { console.error(e); }
    }

    await renderSitePageSections(pageNames[file] || "");
  },
  async pagina() {
    await loadSiteConfig();
    const main = $("main");
    const raw = new URLSearchParams(location.search).get("slug") || location.hash.slice(1).replace(/^sec-/, "");
    const want = slugify(raw || "");
    try {
      const secs = await listDocs("sitio_secciones", "orden", "asc", 200);
      const page = secs.find(s => s.pagina === "Página nueva (individual)" && slugify(s.slug || s.titulo || "") === want && s.visible !== "No" && s.visible !== false)
        || secs.find(s => s.pagina === "Página nueva (individual)" && slugify(s.slug || s.titulo || "") === want);
      if (!page) {
        document.title = "Página no encontrada | " + (SITE.nombre || "ASADA Bijagua");
        if (main) main.innerHTML = `<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Inicio</a> / Página</div><h1>Página no encontrada</h1></div></section><section class="section"><div class="wrap"><p class="empty">La página solicitada no existe o no está disponible.</p><p style="margin-top:12px"><a class="btn sm dark" href="/">Volver al inicio</a></p></div></section>`;
        initWaterDrops();
        return;
      }
      const title = page.titulo || "Página";
      document.title = `${title} | ${SITE.nombre || "ASADA Bijagua"}`;
      const body = (Array.isArray(page.bloques) && page.bloques.length) ? `<div class="cms-body">${renderBlocks(page.bloques)}</div>` : renderBlocks(null, page);
      if (main) main.innerHTML = `<section class="page-head"><div class="wrap"><div class="crumbs"><a href="/">Inicio</a> / ${esc(title)}</div><h1>${esc(title)}</h1></div></section><section class="section"><div class="wrap narrow">${body || `<p class="empty">Esta página aún no tiene contenido.</p>`}</div></section><div id="site-custom-sections"></div>`;
      initWaterDrops();
      await renderSitePageSections("");
    } catch (e) { console.error(e); if (main) main.innerHTML = `<section class="section"><div class="wrap">${`<p class="notice err">No se pudo cargar la página.</p>`}</div></section>`; initWaterDrops(); }
  },
  admin() {
    const gate = $("#admin-gate"), panel = $("#admin-panel");
    if (!isAdmin()) { gate.hidden = false; $("#gate-btn").onclick = () => window.openPin(); return; }
    panel.hidden = false;
    const estados = ["Programado", "En curso", "Finalizado", "Cancelado"];
    // Cada página/área del sitio tiene su propio espacio (sin listas largas).
    const SITE_INFO_GROUPS = [
      { id: "contacto", l: "Identidad y contacto", page: "General", d: "Nombre y subtítulo del encabezado, datos del pie de página y de contacto.", fields: [
        ["Nombre de la ASADA", "Nombre de la ASADA", "text"],
        ["Subtítulo del encabezado", "Subtítulo del encabezado (use <br> para salto de línea)", "text"],
        ["Teléfono", "Teléfono principal", "text"],
        ["Teléfono emergencias", "Teléfono de emergencias y fugas", "text"],
        ["Correo", "Correo electrónico", "text"],
        ["Dirección/ubicación", "Dirección / ubicación", "text"],
        ["Horario de oficina", "Horario de atención", "text"]
      ]},
      { id: "inicio_portada", l: "Inicio: portada", page: "index.html", d: "Etiqueta, título, subtítulo, nota y los tres datos de la portada principal.", fields: [
        ["Inicio - etiqueta", "Etiqueta superior", "text"],
        ["Inicio - título", "Título principal (use <br> para salto de línea)", "text"],
        ["Inicio - subtítulo", "Subtítulo / descripción", "area"],
        ["Inicio - nota (etiqueta)", "Nota destacada: etiqueta", "text"],
        ["Inicio - nota (texto)", "Nota destacada: texto", "text"],
        ["Inicio - dato 1", "Dato 1: título", "text"],
        ["Inicio - dato 1 detalle", "Dato 1: detalle", "text"],
        ["Inicio - dato 2", "Dato 2: título", "text"],
        ["Inicio - dato 2 detalle", "Dato 2: detalle", "text"],
        ["Inicio - dato 3", "Dato 3: título", "text"],
        ["Inicio - dato 3 detalle", "Dato 3: detalle", "text"]
      ]},
      { id: "inicio_botones", l: "Inicio: botones y accesos", page: "index.html", d: "Textos y enlaces de los botones principales y las tarjetas de accesos rápidos.", fields: [
        ["Inicio - botón 1 texto", "Botón 1: texto", "text"],
        ["Inicio - botón 1 enlace", "Botón 1: enlace", "text"],
        ["Inicio - botón 2 texto", "Botón 2: texto", "text"],
        ["Inicio - botón 2 enlace", "Botón 2: enlace", "text"],
        ["Inicio - botón 3 texto", "Botón 3: texto", "text"],
        ["Inicio - botón 3 enlace", "Botón 3: enlace", "text"],
        ["Acceso 1 - título", "Acceso rápido 1: título", "text"],
        ["Acceso 1 - descripción", "Acceso rápido 1: descripción", "text"],
        ["Acceso 1 - enlace", "Acceso rápido 1: enlace", "text"],
        ["Acceso 2 - título", "Acceso rápido 2: título", "text"],
        ["Acceso 2 - descripción", "Acceso rápido 2: descripción", "text"],
        ["Acceso 2 - enlace", "Acceso rápido 2: enlace", "text"],
        ["Acceso 3 - título", "Acceso rápido 3: título", "text"],
        ["Acceso 3 - descripción", "Acceso rápido 3: descripción", "text"],
        ["Acceso 3 - enlace", "Acceso rápido 3: enlace", "text"],
        ["Acceso 4 - título", "Acceso rápido 4: título", "text"],
        ["Acceso 4 - descripción", "Acceso rápido 4: descripción", "text"],
        ["Acceso 4 - enlace", "Acceso rápido 4: enlace", "text"]
      ]},
      { id: "inicio_secciones", l: "Inicio: secciones", page: "index.html", d: "Textos de las secciones Sobre nosotros, Historia, Tecnología, Servicios, Avisos, Noticias y Beneficiarios del inicio.", fields: [
        ["Sobre nosotros - título", "Sobre nosotros: título", "text"],
        ["Sobre nosotros - texto", "Sobre nosotros: texto", "area"],
        ["Historia - título", "Historia: título", "text"],
        ["Historia - texto", "Historia: texto", "area"],
        ["Tecnología - título", "Tecnología: título", "text"],
        ["Tecnología - texto", "Tecnología: texto", "area"],
        ["Servicios - título inicio", "Servicios (en inicio): título", "text"],
        ["Servicios - descripción inicio", "Servicios (en inicio): descripción", "area"],
        ["Avisos - título inicio", "Avisos (en inicio): título", "text"],
        ["Avisos - descripción inicio", "Avisos (en inicio): descripción", "area"],
        ["Noticias - título inicio", "Noticias (en inicio): título", "text"],
        ["Beneficiarios - título", "Beneficiarios: título", "text"],
        ["Beneficiarios - texto", "Beneficiarios: texto", "area"]
      ]},
      { id: "mapa", l: "Mapa y cobertura", page: "index.html", d: "Textos laterales del mapa, ubicación, coordenadas y URL del mapa.", fields: [
        ["Cobertura - título", "Cobertura: título", "text"],
        ["Cobertura - texto", "Cobertura: texto", "area"],
        ["Mapa - etiqueta lateral", "Mapa: etiqueta lateral", "text"],
        ["Mapa - título lateral", "Mapa: título lateral", "text"],
        ["Mapa - texto lateral", "Mapa: texto lateral", "area"],
        ["Mapa - etiqueta ubicación", "Mapa: etiqueta «Estamos ubicados en»", "text"],
        ["Mapa - valor ubicación", "Mapa: valor ubicación", "text"],
        ["Mapa - etiqueta cobertura", "Mapa: etiqueta «Brindamos servicio en»", "text"],
        ["Mapa - valor cobertura", "Mapa: valor cobertura", "text"],
        ["Mapa - coordenadas", "Mapa: coordenadas visibles", "text"],
        ["Mapa (URL para insertar)", "Mapa: URL para insertar (iframe)", "text"]
      ]},
      { id: "pag_servicios", l: "Página: Servicios", page: "servicios.html", d: "Encabezado y descripción de la página Nuestros servicios.", fields: [
        ["Servicios - título", "Título de la página", "text"],
        ["Servicios - descripción", "Descripción de la página", "area"]
      ]},
      { id: "pag_tarifas", l: "Página: Tarifas", page: "tarifas.html", d: "Encabezado, descripción y nota de la página de tarifas.", fields: [
        ["Tarifas - título", "Título de la página", "text"],
        ["Tarifas - descripción", "Descripción de la página", "area"],
        ["Tarifas - nota", "Nota al pie", "area"]
      ]},
      { id: "pag_calidad", l: "Página: Calidad del agua", page: "calidad-agua.html", d: "Encabezado y contenido de la página de calidad del agua.", fields: [
        ["Calidad del agua - título", "Título de la página", "text"],
        ["Calidad del agua - descripción", "Descripción de la página", "area"],
        ["Calidad del agua - contenido", "Contenido principal", "area"]
      ]},
      { id: "pag_afiliacion", l: "Página: Trámites", page: "afiliacion.html", d: "Encabezado, requisitos, proceso y texto de la sección de formularios de la página de trámites.", fields: [
        ["Trámites - título", "Título de la página", "text"],
        ["Trámites - descripción", "Descripción de la página", "area"],
        ["Trámites - requisitos", "Requisitos", "area"],
        ["Trámites - proceso", "Proceso", "area"],
        ["Trámites - formularios", "Texto de la sección de formularios", "area"]
      ]},
      { id: "pag_nosotros", l: "Página: Quienes somos", page: "nosotros.html", d: "Encabezado, historia, misión, visión y textos de Junta Directiva y colaboradores.", fields: [
        ["Nosotros - título", "Título de la página", "text"],
        ["Nosotros - descripción", "Descripción de la página", "area"],
        ["Nosotros - historia", "Historia de la ASADA", "area"],
        ["Nosotros - misión", "Misión", "area"],
        ["Nosotros - visión", "Visión", "area"],
        ["Nosotros - junta descripción", "Texto de la sección Junta Directiva", "text"],
        ["Nosotros - colaboradores descripción", "Texto de la sección Colaboradores", "text"]
      ]},
      { id: "pag_encabezados", l: "Páginas: otros encabezados", page: "Varias páginas", d: "Textos de presentación de Noticias, Avisos, Proyectos, Transparencia y Preguntas frecuentes.", fields: [
        ["Noticias - descripción página", "Noticias: descripción", "area"],
        ["Avisos - descripción página", "Avisos de servicio: descripción", "area"],
        ["Proyectos - descripción página", "Proyectos: descripción", "area"],
        ["Transparencia - descripción página", "Transparencia: descripción", "area"],
        ["Preguntas frecuentes - descripción página", "Preguntas frecuentes: descripción", "area"]
      ]},
      { id: "pag_contacto", l: "Página: Contacto", page: "contacto.html", d: "Lema, servicio al cliente, números de fontanería, WhatsApp y aviso sobre la respuesta a los formularios.", fields: [
        ["Contacto - descripción página", "Descripción de la página", "area"],
        ["Contacto - lema", "Lema de la página", "text"],
        ["Contacto - servicio al cliente", "Número de servicio al cliente", "text"],
        ["Contacto - WhatsApp", "Número de WhatsApp (con código de país)", "text"],
        ["Contacto - números de fontanería", "Números de fontanería (uno por línea, sin nombres)", "area"],
        ["Contacto - aviso de respuesta", "Aviso sobre la respuesta a formularios", "area"]
      ]}
    ];
    const SITE_INFO_KEYS = SITE_INFO_GROUPS.flatMap(g => g.fields.map(f => f[0]));
    const T = {
      sitio_info: { t: "Información y textos del sitio", c: "sitio_config", o: ["creadoEn", "desc"], editable: 1, custom: "site-info", f: [["clave", "Dato a editar", "select", SITE_INFO_KEYS], ["valor", "Valor / texto (se mostrará en el sitio)", "area"]] },
      sitio_logo: { t: "Logo de la ASADA", c: "sitio_logo", o: ["creadoEn", "desc"], editable: 1, f: [["logoId", "Logo de la ASADA (header, footer y favicon)", "file", "image/*"]], tipExtra: "Suba el logo oficial. Se aplica automáticamente en el encabezado, el pie de página y el ícono del sitio en todas las páginas." },
      sitio_fondo: { t: "Fondos e imágenes (ASADA)", c: "sitio_config", o: ["creadoEn", "desc"], editable: 1, f: [["clave", "Área del fondo", "select", ["Mapeo de acueductos (foto principal)", "Fondo Inicio (hero)", "Foto del inicio 2", "Foto del inicio 3", "Fondo encabezados de páginas", "Mapa de cobertura (imagen)", "Imagen de tecnología (opcional)"]], ["imagenId", "Imagen (se mostrará en el área elegida)", "file", "image/*"]], tipExtra: "La foto principal del inicio es el mapeo de acueductos. Las fotos 2 y 3 se usan en el carrusel. Suba una nueva para reemplazar la anterior." },
      sitio_seccion: { t: "Páginas y secciones (ASADA)", c: "sitio_secciones", o: ["orden", "asc"], editable: 1, blocks: 1, f: [["titulo", "Título de la sección/página", "text"], ["slug", "Identificador/slug (para página nueva, ej: convenios). Enlace: /pagina?slug=convenios", "text", "", 1], ["pagina", "¿Dónde se mostrará?", "select", ["Sección en: Inicio", "Sección en: Contacto", "Sección en: Nosotros", "Sección en: Servicios", "Sección en: Tarifas", "Sección en: Calidad del agua", "Sección en: Trámites", "Sección en: Transparencia/Documentos", "Sección en: Proyectos", "Sección en: Preguntas frecuentes", "Página nueva (individual)"]], ["orden", "Orden (número, menor primero)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_boton: { t: "Botones y accesos (ASADA)", c: "sitio_botones", o: ["orden", "asc"], editable: 1, f: [["etiqueta", "Texto del botón/enlace", "text"], ["destino", "Destino (ej: /contacto, #id, https://...)", "text"], ["ubicacion", "Dónde mostrarlo", "select", ["Accesos rápidos Inicio", "Botones destacados Inicio", "Sección Contacto"]], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_servicio: { t: "Servicios (Nuestros servicios)", c: "servicios", o: ["orden", "asc"], editable: 1, f: [["titulo", "Nombre del servicio", "text"], ["descripcion", "Descripción", "area"], ["chips", "Destacados del servicio (uno por línea)", "area", "", 1], ["imagenId", "Imagen del servicio", "file", "image/*", 1], ["icono", "Icono", "select", ["drop", "tool", "bolt", "leaf", "shield", "chart"], "", 1], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_tarifa: { t: "Tarifas (tabla)", c: "tarifas", o: ["orden", "asc"], editable: 1, f: [["servicio", "Servicio", "select", ["Acueducto", "Protección del Recurso Hídrico"]], ["categoria", "Categoría", "text"], ["bloque", "Bloque de consumo", "text"], ["cuota", "Tarifa 2026", "text"], ["vigente", "Tarifa anterior", "text"], ["variacion", "Variación", "text"], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      lf_hito: { t: "Línea de tiempo (historia)", c: "sitio_historia", o: ["orden", "asc"], editable: 1, f: [["anio", "Año o período (ej: 1998, Hoy)", "text"], ["titulo", "Título del hito", "text"], ["descripcion", "Descripción", "area"], ["imagenId", "Imagen", "file", "image/*", 1], ["orden", "Orden (número, menor primero)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      lf_tecnologia: { t: "Tecnología y procesos", c: "sitio_tecnologia", o: ["orden", "asc"], editable: 1, f: [["titulo", "Título", "text"], ["descripcion", "Descripción", "area"], ["icono", "Icono", "select", ["shield", "chart", "bolt", "drop", "tool", "leaf"]], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      lf_zona: { t: "Zonas de cobertura", c: "sitio_cobertura", o: ["orden", "asc"], editable: 1, f: [["nombre", "Nombre de la zona", "text"], ["km", "Cifra o distancia (ej: 12, 8.5)", "text"], ["descripcion", "Descripción corta", "text"], ["imagenId", "Imagen", "file", "image/*", 1], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      lf_cifra: { t: "Cifras del inicio", c: "sitio_cifras", o: ["orden", "asc"], editable: 1, f: [["prefijo", "Prefijo (ej: Más de)", "text", "", 1], ["numero", "Número o texto destacado", "text"], ["etiqueta", "Etiqueta", "text"], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      lf_beneficio: { t: "Beneficiarios", c: "sitio_beneficiarios", o: ["orden", "asc"], editable: 1, f: [["numero", "Cifra o título destacado", "text"], ["etiqueta", "Descripción", "text"], ["icono", "Icono", "select", ["users", "school", "clock", "drop", "team", "shield", "map", "chart"]], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      noticia: { t: "Noticias del sitio", c: "noticias", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["resumen", "Resumen breve", "text"], ["descripcion", "Contenido completo", "area"], ["imagenId", "Imagen principal", "file", "image/*"]] },
      corte: { t: "Cortes de agua", c: "cortes", o: ["fecha", "desc"], editable: 1, fix: { tipo: "Corte de agua" }, f: [["sector", "Sector afectado", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Motivo", "area"], ["estado", "Estado", "select", estados]] },
      mantenimiento: { t: "Mantenimientos", c: "cortes", o: ["fecha", "desc"], editable: 1, fix: { tipo: "Mantenimiento" }, f: [["sector", "Sector o infraestructura", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Descripcion de los trabajos", "area"], ["estado", "Estado", "select", estados]] },
      documento: { t: "Documentos y transparencia", c: "documentos", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["categoria", "Categoria", "select", ["Reglamento", "Formulario", "Informe"]], ["descripcion", "Descripcion", "area"], ["archivoId", "Archivo PDF", "file", "application/pdf"]] },
      proyecto: { t: "Proyectos", c: "proyectos", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["estado", "Estado", "select", ["Planificado", "En ejecucion", "Concluido"]], ["descripcion", "Descripcion", "area"], ["imagenId", "Imagen", "file", "image/*"]] },
      faq: { t: "Preguntas frecuentes", c: "faqs", o: ["orden", "asc"], editable: 1, f: [["pregunta", "Pregunta", "text"], ["respuesta", "Respuesta", "area"], ["orden", "Orden de aparicion", "number"]] },
      junta: { t: "Junta directiva", c: "junta", o: ["orden", "asc"], editable: 1, f: [["nombre", "Nombre completo", "text"], ["cargo", "Cargo", "text"], ["orden", "Orden jerarquico", "number"], ["fotoId", "Fotografia", "file", "image/*"]] },
      colaborador: { t: "Colaboradores", c: "colaboradores", o: ["orden", "asc"], editable: 1, f: [["nombre", "Nombre completo", "text"], ["cargo", "Puesto o función", "text"], ["orden", "Orden de aparición", "number"], ["fotoId", "Fotografía", "file", "image/*", 1]] },
      reporte: { t: "Reportes recibidos", c: "contactos", o: ["creadoEn", "desc"], f: [] },
      prog_seccion: { t: "Páginas y secciones (Programa)", c: "programa_secciones", o: ["orden", "asc"], editable: 1, blocks: 1, f: [["titulo", "Título de la sección/página", "text"], ["slug", "Identificador/slug (ej: voluntariado). Define el enlace #sec-voluntariado o #slug", "text", "", 1], ["vista", "¿Dónde se mostrará?", "select", ["Sección en: Inicio del programa", "Sección en: Información del programa", "Página nueva (individual)"]], ["orden", "Orden (número, menor primero)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      prog_boton: { t: "Menús y botones (Programa)", c: "programa_botones", o: ["orden", "asc"], editable: 1, f: [["etiqueta", "Texto del botón/enlace", "text"], ["destino", "Destino (ej: #inicio, #informacion, #noticias, #sec-slug, https://...)", "text"], ["ubicacion", "Ubicación", "select", ["Menú principal", "Submenú información", "Botón destacado inicio"]], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      prog_noticia: { t: "Noticias del programa", c: "programa_noticias", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["resumen", "Resumen breve", "text"], ["descripcion", "Contenido completo", "area"], ["imagenId", "Imagen principal", "file", "image/*", 1]] },
      prog_galeria: { t: "Galería del programa", c: "programa_galeria", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Descripción corta", "text", "", 1], ["imagenId", "Fotografia", "file", "image/*"]] },
      prog_texto: { t: "Textos base del programa", c: "programa_textos", o: ["creadoEn", "desc"], editable: 1, f: [["clave", "Seccion a editar", "select", ["Resumen", "Historia", "Misión", "Visión", "Objetivo principal", "Filosofía", "Valores", "Ejes temáticos", "Grupos meta"]], ["contenido", "Nuevo texto (en Valores, Ejes y Grupos escriba un elemento por linea)", "area"]] },
      prog_aliado: { t: "Aliados", c: "programa_aliados", o: ["creadoEn", "asc"], editable: 1, f: [["nombre", "Nombre del aliado", "text"], ["logoId", "Logo", "file", "image/*", 1]] },
      prog_aliado_logo: { t: "Logo a aliado", c: "programa_aliados", o: ["creadoEn", "asc"], editable: 1, f: [["nombre", "Aliado", "select", PROG.aliados.map(n => n.trim())], ["logoId", "Logo del aliado", "file", "image/*"]] },
      prog_logo: { t: "Logo del programa", c: "programa_logo", o: ["creadoEn", "desc"], editable: 1, f: [["logoId", "Logo del programa", "file", "image/*"]] },
      prog_fondo: { t: "Fondo del programa", c: "programa_config", o: ["creadoEn", "desc"], editable: 1, f: [["clave", "Área del fondo", "select", ["Fondo Inicio del programa (hero)"]], ["imagenId", "Imagen de fondo (se combina con los colores del programa)", "file", "image/*"]] }
    };
    const ico = {
      page:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13H7z" stroke="currentColor" stroke-width="1.7"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.7"/></svg>',
      menu:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h10M5 17h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      news:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 9h8M8 13h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      img:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><path d="M20 16l-4-4-3 3-2-2-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      text:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 7h12M6 12h12M6 17h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      users:'<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16 11a2.5 2.5 0 1 0 0-5" stroke="currentColor" stroke-width="1.7"/><path d="M17 14c2.2.4 3.8 2.2 4 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      alert:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 3 19h18L12 4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10v4M12 16.5h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      tool:'<svg viewBox="0 0 24 24" fill="none"><path d="M14 7a4 4 0 0 0-5.4 5.4L4 17v3h3l4.6-4.6A4 4 0 0 0 14 7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
      doc:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="currentColor" stroke-width="1.7"/><path d="M9 13h6M9 16h6M9 10h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      faq:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2 1-1.2 1.8v.5M12 16.5h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      proj:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 15v-3M12 15V9M16 15v-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      inbox:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.7"/><path d="M4 14h5l2 2h2l2-2h5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
      star:'<svg viewBox="0 0 24 24" fill="none"><path d="m12 4 2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 16l-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
      logo:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M8 14c2-4 6-4 8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
      info:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 10.5v5M12 8h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
    };
    const MENU = [
      { dom: "asada", label: "ASADA (Sitio)", groups: [
        { g: "General y páginas", items: [
          { k: "sitio_info", l: "Información y textos", d: "Edite textos por espacios: cada página y sección tiene su propio apartado.", i: "info", tip: "Elija el espacio (página o área) en el panel y edite solo los campos de esa parte. Los cambios se reflejan al guardar." },
          { k: "sitio_logo", l: "Logo de la ASADA", d: "Suba el logo oficial que aparece en el encabezado, el pie y el favicon.", i: "logo", tip: "Suba una sola vez el logo de la ASADA; se aplica en todas las páginas." },
          { k: "sitio_fondo", l: "Fondos e imágenes", d: "Suba fotos de fondo para el inicio y encabezados, manteniendo los colores del sitio.", i: "img", tip: "La imagen se muestra con transparencia sobre los colores originales para un estilo elegante. Suba una nueva para reemplazar." },
          { k: "sitio_seccion", l: "Páginas y secciones", d: "Cree una sección dentro de una página existente o una página nueva individual del sitio.", i: "page", tip: "En '¿Dónde se mostrará?' elija una página existente para agregar una sección ahí, o 'Página nueva (individual)' (defina un slug). Enlace de página nueva: /pagina?slug=su-slug." },
          { k: "sitio_boton", l: "Botones y accesos", d: "Cree botones y enlaces rápidos para el sitio de la ASADA.", i: "menu" },
        ]},
        { g: "Servicios (páginas)", items: [
          { k: "sitio_servicio", l: "Nuestros servicios", d: "Edite los servicios que se muestran en la página Servicios y en el inicio.", i: "page" },
          { k: "sitio_tarifa", l: "Tarifas", d: "Edite las filas de las tablas de Acueducto y Protección del Recurso Hídrico.", i: "doc", tip: "Cada registro es una fila: servicio, categoría, bloque de consumo, tarifa 2026, tarifa anterior y variación. El orden agrupa las filas por servicio." },
        ]},
        { g: "Diseño del inicio (editable)", items: [
          { k: "lf_hito", l: "Línea de tiempo", d: "Agregue, edite u ordene los hitos de la historia del acueducto.", i: "page", tip: "Use el botón 'Cargar contenido de ejemplo' para empezar y luego edite o elimine cada hito." },
          { k: "lf_tecnologia", l: "Tecnología y procesos", d: "Tarjetas de la sección de tecnología del inicio.", i: "info" },
          { k: "lf_zona", l: "Zonas de cobertura", d: "Sectores y cifras de la red mostrados bajo el mapa.", i: "proj" },
          { k: "lf_cifra", l: "Cifras del inicio", d: "Números destacados de la sección Sobre nosotros.", i: "text" },
          { k: "lf_beneficio", l: "Beneficiarios", d: "Cifras y etiquetas de la sección Beneficiarios.", i: "users" },
        ]},
        { g: "Publicaciones y gestión", items: [
          { k: "noticia", l: "Noticias", d: "Noticias generales de la ASADA.", i: "news" },
          { k: "corte", l: "Cortes de agua", d: "Avisos de cortes programados o en curso.", i: "alert" },
          { k: "mantenimiento", l: "Mantenimientos", d: "Avisos de trabajos y mantenimientos.", i: "tool" },
          { k: "documento", l: "Documentos", d: "Reglamentos, formularios e informes (PDF).", i: "doc" },
          { k: "proyecto", l: "Proyectos", d: "Proyectos institucionales.", i: "proj" },
          { k: "faq", l: "Preguntas frecuentes", d: "Respuestas a consultas comunes.", i: "faq" },
          { k: "junta", l: "Junta directiva", d: "Integrantes de la junta.", i: "users" },
          { k: "colaborador", l: "Colaboradores", d: "Personas que trabajan y sus puestos en la ASADA.", i: "users" },
          { k: "reporte", l: "Reportes recibidos", d: "Consulta de averías enviadas por usuarios.", i: "inbox" },
        ]}
      ]},
      { dom: "prog", label: "Programa ambiental", groups: [
        { g: "Constructor", items: [
          { k: "prog_seccion", l: "Páginas y secciones", d: "Cree secciones dentro de páginas existentes o páginas nuevas individuales del programa, con bloques editables.", i: "page", tip: "Elija si será una sección en una página existente o una Página nueva (individual). Para páginas nuevas defina un slug y luego cree un botón/menú con destino #sec-slug." },
          { k: "prog_boton", l: "Menús y botones", d: "Botones y enlaces del programa (menú, submenú o destacados).", i: "menu" },
        ]},
        { g: "Contenido y diseño", items: [
          { k: "prog_noticia", l: "Noticias", d: "Actividades y novedades del programa.", i: "news" },
          { k: "prog_galeria", l: "Galería", d: "Fotografías del programa.", i: "img" },
          { k: "prog_texto", l: "Textos base", d: "Misión, visión, historia y textos principales.", i: "text" },
          { k: "prog_fondo", l: "Fondo del programa", d: "Suba una foto de fondo para el inicio del programa, combinada con sus colores.", i: "img", tip: "La imagen se muestra con transparencia sobre los colores originales del programa." },
          { k: "prog_aliado", l: "Aliados", d: "Agregue aliados y sus logos.", i: "star" },
          { k: "prog_aliado_logo", l: "Logo a aliado", d: "Asigne logo a un aliado ya listado.", i: "star" },
          { k: "prog_logo", l: "Logo del programa", d: "Logo principal del programa.", i: "logo" },
        ]}
      ]}
    ];
    const byKey = {}; MENU.forEach(d => d.groups.forEach(g => g.items.forEach(it => byKey[it.k] = { ...it, g: g.g, dom: d.dom, domLabel: d.label })));
    const sel = $("#tipo"), form = $("#admin-form"), lst = $("#admin-list"), msg = $("#admin-msg"), formTitle = $("#admin-form-title");
    const bc = $("#admin-bc"), title = $("#admin-title"), desc = $("#admin-desc"), tip = $("#admin-tip"), mode = $("#admin-mode"), count = $("#admin-count"), menu = $("#admin-menu");
    let editing = null, cache = [], current = "sitio_info";
    sel.innerHTML = Object.keys(T).map(k => `<option value="${k}">${T[k].t}</option>`).join("");
    menu.innerHTML = MENU.map(d => `<div class="admin-domain dom-${d.dom}"><div class="admin-domain-title">${esc(d.label)}</div>${d.groups.map(g => `<details class="admin-group"><summary class="admin-group-title">${esc(g.g)}</summary>${g.items.map(it => `<button type="button" class="admin-nav-item" data-k="${it.k}"><span class="admin-ico">${ico[it.i] || ico.page}</span><span class="admin-nav-txt"><strong>${esc(it.l)}</strong><small>${esc(it.d)}</small></span></button>`).join("")}</details>`).join("")}</div>`).join("");
    const setCurrent = k => { if (!T[k]) k = "sitio_info"; current = k; sel.value = k;
      $$(".admin-nav-item", menu).forEach(b => b.classList.toggle("on", b.dataset.k === k));
      $$(".admin-group", menu).forEach(g => { g.open = !!$(".admin-nav-item.on", g); });
      const m = byKey[k] || { l: T[k].t, g: "Panel", dom: "asada", domLabel: "Panel", d: "", tip: "" };
      panel.classList.toggle("dom-asada", m.dom === "asada"); panel.classList.toggle("dom-prog", m.dom === "prog");
      if (bc) bc.textContent = m.domLabel + " / " + m.l; if (title) title.textContent = m.l;
      if (desc) desc.textContent = m.d || "Gestione este contenido.";
      if (tip) { tip.textContent = m.tip || ""; tip.hidden = !m.tip; }
      panel.classList.remove("menu-open"); show(k); };
    $$(".admin-nav-item", menu).forEach(b => b.onclick = () => setCurrent(b.dataset.k));
    const tog = $("#admin-menu-toggle"); if (tog) tog.onclick = () => panel.classList.toggle("menu-open");

    const input = ([n, l, t, o, opt], k) => {
      const isDest = n === "destino";
      const listAttr = isDest ? ` list="dest-list"` : "";
      const ex = exampleFor(n, l, t, k);
      const ph = (t === "text" || t === "area") ? ` placeholder="${esc(ex)}"` : "";
      return `<div class="field"><label for="f-${n}">${l}${opt ? ' <span class="meta">(opcional)</span>' : ""}</label>${
      t === "area" ? `<textarea id="f-${n}" name="${n}" ${ph} ${opt?"":"required"}></textarea>` :
      t === "select" ? `<select id="f-${n}" name="${n}">${o.map(x => `<option>${x}</option>`).join("")}</select>` :
      t === "file" ? `<input id="f-${n}" name="${n}" type="file" accept="${o}" ${opt?"":"required"}><small class="meta" data-cur="${n}" hidden>Archivo actual conservado (suba uno nuevo para reemplazar).</small>` :
      `<input id="f-${n}" name="${n}" type="${t}" ${ph} ${listAttr} ${opt?"":"required"}>`}${isDest ? `<small class="meta">Puede escribir una ruta/URL o seleccionar una página existente de la lista.</small><datalist id="dest-list"></datalist>` : ""}<small class="meta field-example">Ej: ${esc(ex)}</small></div>`;
    };
    const blockTpl = (b = {}) => {
      const t = b.tipo || "texto";
      const selOpt = (v, l) => `<option value="${v}" ${t===v?"selected":""}>${l}</option>`;
      const hasImg = b.imagenId ? `<div class="meta" data-bcur>Imagen actual conservada (suba otra para reemplazar).</div>` : "";
      return `<div class="b-item" data-btype="${esc(t)}">
        <div class="b-head"><select class="b-type">${selOpt("titulo","Título")}${selOpt("subtitulo","Subtítulo")}${selOpt("texto","Texto/parrafos")}${selOpt("imagen","Imagen")}${selOpt("boton","Botón")}${selOpt("enlace","Enlace")}${selOpt("logo","Logo (con enlace opcional)")}</select>
        <div class="b-acts"><button type="button" class="btn sm b-up">↑</button><button type="button" class="btn sm b-down">↓</button><button type="button" class="btn sm danger b-del">Quitar</button></div></div>
        <div class="b-fields">
          <div class="field b-f b-f-texto b-f-titulo b-f-subtitulo"><label>Texto</label><textarea class="b-texto">${esc(b.texto || "")}</textarea></div>
          <div class="field b-f b-f-imagen b-f-logo"><label>Imagen</label>${hasImg}<input type="file" class="b-file" accept="image/*"><input type="hidden" class="b-imagenId" value="${esc(b.imagenId || "")}"></div>
          <div class="field b-f b-f-imagen"><label>Texto alternativo / pie (opcional)</label><input class="b-alt" value="${esc(b.alt || (b.tipo==="imagen" ? b.texto : "") || "")}"></div>
          <div class="field b-f b-f-boton b-f-enlace b-f-logo b-f-imagen"><label>Enlace/destino (opcional, ej: #sec-slug o https://...)</label><input class="b-url" value="${esc(b.url || "")}"></div>
          <div class="field b-f b-f-boton b-f-enlace b-f-logo"><label>Etiqueta/texto del botón o logo</label><input class="b-etiqueta" value="${esc(b.etiqueta || "")}"></div>
          <div class="field b-f b-f-boton"><label>Estilo</label><select class="b-estilo"><option value="principal" ${b.estilo!=="secundario"?"selected":""}>Principal</option><option value="secundario" ${b.estilo==="secundario"?"selected":""}>Secundario</option></select></div>
        </div></div>`;
    };
    const syncBlockFields = it => { const t = $(".b-type", it).value; it.dataset.btype = t; $$(".b-f", it).forEach(f => { f.hidden = !f.classList.contains("b-f-" + t); }); };
    const initBlocksUI = (blocks = []) => {
      const wrap = $("#blocks-wrap"); if (!wrap) return;
      wrap.innerHTML = blocks.length ? blocks.map(blockTpl).join("") : `<p class="meta" id="blocks-empty">Aún no hay bloques. Agregue títulos, subtítulos, texto, imágenes, botones, enlaces o logos.</p>`;
      const bind = it => { syncBlockFields(it); $(".b-type", it).onchange = () => syncBlockFields(it);
        $(".b-del", it).onclick = () => { it.remove(); if (!$("#blocks-wrap .b-item")) $("#blocks-wrap").innerHTML = `<p class="meta" id="blocks-empty">Aún no hay bloques. Agregue títulos, subtítulos, texto, imágenes, botones, enlaces o logos.</p>`; };
        $(".b-up", it).onclick = () => { if (it.previousElementSibling) it.parentNode.insertBefore(it, it.previousElementSibling); };
        $(".b-down", it).onclick = () => { if (it.nextElementSibling) it.parentNode.insertBefore(it.nextElementSibling, it); }; };
      $$(".b-item", wrap).forEach(bind);
      $$("#add-block-bar button[data-b]").forEach(btn => btn.onclick = () => { const empty = $("#blocks-empty"); if (empty) empty.remove(); const d = document.createElement("div"); d.innerHTML = blockTpl({ tipo: btn.dataset.b }); const it = d.firstElementChild; wrap.append(it); bind(it); it.scrollIntoView({ behavior:"smooth", block:"center" }); });
    };
    const collectBlocks = async () => {
      const items = $$("#blocks-wrap .b-item"), blocks = [];
      for (const it of items) {
        const tipo = $(".b-type", it).value, b = { tipo };
        const texto = $(".b-texto", it)?.value || "", url = $(".b-url", it)?.value || "", etiqueta = $(".b-etiqueta", it)?.value || "", alt = $(".b-alt", it)?.value || "", estilo = $(".b-estilo", it)?.value || "principal";
        let imagenId = $(".b-imagenId", it)?.value || ""; const file = $(".b-file", it)?.files?.[0]; if (file) imagenId = await uploadFile(file);
        if (tipo === "titulo" || tipo === "subtitulo" || tipo === "texto") { if (texto.trim()) b.texto = texto; }
        else if (tipo === "imagen") { if (imagenId) { b.imagenId = imagenId; if (alt) b.alt = alt; b.texto = alt || ""; if (url) b.url = url; } }
        else if (tipo === "boton") { if (etiqueta.trim() || url.trim()) { b.etiqueta = etiqueta; b.url = url; b.estilo = estilo; } }
        else if (tipo === "enlace") { if (etiqueta.trim() || url.trim()) { b.etiqueta = etiqueta; b.url = url; } }
        else if (tipo === "logo") { if (imagenId || etiqueta.trim()) { b.imagenId = imagenId; b.etiqueta = etiqueta; b.url = url; } }
        if (Object.keys(b).length > 1) blocks.push(b);
      }
      return blocks;
    };
    const setMode = (m) => { if (mode) mode.textContent = m; };
    const resetEdit = () => { editing = null; if (formTitle) formTitle.textContent = "Nuevo registro"; setMode("Crear"); const b = $("button[type=submit]", form); if (b) b.textContent = "Publicar"; const c = $("#cancel-edit"); if (c) c.hidden = true; form.reset(); $$("[data-cur]", form).forEach(s => s.hidden = true); if ($("#blocks-wrap")) initBlocksUI([]); };
    const fillDestOptions = async (k) => {
      const dl = $("#dest-list", form); if (!dl) return;
      const opts = new Map();
      const add = (v, label) => { if (!v) return; const val = String(v).trim(); if (!val) return; if (!opts.has(val)) opts.set(val, label || val); };
      const pageFile = { "Inicio":"/","Contacto":"/contacto","Nosotros":"/nosotros","Servicios":"/servicios","Tarifas":"/tarifas","Calidad del agua":"/calidad-agua","Trámites":"/afiliacion","Transparencia/Documentos":"/documentos","Proyectos":"/proyectos","Preguntas frecuentes":"/faq" };
      if (k === "prog_boton") {
        [["#inicio","Inicio del programa"],["#informacion","Información del programa"],["#noticias","Noticias"],["#galeria","Galería"],["#aliados","Aliados"],["/index","Sitio ASADA (inicio)"],["/contacto","Contacto"],["/programa","Página del programa"]].forEach(([v,l])=>add(v,l));
        try { (await listDocs("programa_secciones", "orden", "asc", 200)).forEach(s => { const sl = slugify(s.slug || s.titulo || ""); if (!sl) return; const pv = s.vista; if (pv === "Página independiente" || pv === "Página nueva (individual)") { add("#" + sl, `Página nueva: ${s.titulo || sl}`); add("#sec-" + sl, `Página nueva: ${s.titulo || sl}`); } else add("#sec-" + sl, `Sección: ${s.titulo || sl}`); }); } catch (e) { }
      } else if (k === "sitio_boton") {
        Object.entries(pageFile).concat([["Programa ambiental","/programa"]]).forEach(([l,v]) => add(v || l, l));
        try { (await listDocs("sitio_secciones", "orden", "asc", 200)).forEach(s => { const p = String(s.pagina || ""); if (p === "Página nueva (individual)") { const sl = slugify(s.slug || s.titulo || ""); if (sl) add("/pagina?slug=" + sl, `Página nueva: ${s.titulo || sl}`); } else { const base = p.replace(/^Sección en:\s*/i, ""); if (pageFile[base]) add(pageFile[base], `Sección en ${base}: ${s.titulo || ""}`); } }); } catch (e) { }
      }
      dl.innerHTML = [...opts.entries()].map(([v,l]) => `<option value="${esc(v)}" label="${esc(l)}">${esc(l)}</option>`).join("");
    };
    const fillAliadoOptions = () => {
      const selAliado = form.elements["nombre"];
      if (current !== "prog_aliado_logo" || !selAliado || selAliado.tagName !== "SELECT") return;
      const nombres = new Map();
      const add = v => { const n = String(v || "").trim(); if (n) nombres.set(n.toLowerCase(), n); };
      (cache.length ? cache.map(x => x?.nombre) : PROG.aliados).forEach(add);
      const anterior = selAliado.value;
      selAliado.innerHTML = [...nombres.values()].map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
      if (nombres.has(String(anterior || "").toLowerCase())) selAliado.value = nombres.get(String(anterior).toLowerCase());
    };
    const prefillByClave = (k) => {
      const claveEl = form.elements["clave"]; if (!claveEl) return;
      const valEl = form.elements["valor"] || form.elements["contenido"];
      const getDefault = (clave) => {
        if (k === "sitio_info") {
          if (DEFAULT_PAGE_TEXT[clave]) return DEFAULT_PAGE_TEXT[clave];
          if (clave === "Nombre de la ASADA") return SITE.nombre;
          if (clave === "Subtítulo del encabezado") return SITE.subtitulo;
          if (clave === "Teléfono") return SITE.telefono;
          if (clave === "Correo") return SITE.correo;
          if (clave === "Teléfono emergencias") return SITE.emergencia;
          if (clave === "Horario de oficina") return SITE.horario;
          if (clave === "Dirección/ubicación") return SITE.direccion;
        }
        if (k === "prog_texto" && typeof PROG !== "undefined" && PROG.t && PROG.t[clave]) return PROG.t[clave];
        return "";
      };
      const apply = () => {
        if (editing) return; // no sobreescribir al editar registro existente
        const clave = claveEl.value;
        const existing = cache.find(r => r.clave === clave);
        if (valEl) valEl.value = (existing && (existing.valor ?? existing.contenido)) || getDefault(clave) || "";
      };
      claveEl.onchange = apply;
      apply();
    };

    /* --- Editor por espacios: contacto, inicio, botones, mapa y páginas --- */
    const infoDefault = clave => {
      if (DEFAULT_PAGE_TEXT[clave]) return DEFAULT_PAGE_TEXT[clave];
      return ({
        "Nombre de la ASADA": SITE.nombre, "Subtítulo del encabezado": SITE.subtitulo,
        "Teléfono": SITE.telefono, "Correo": SITE.correo,
        "Teléfono emergencias": SITE.emergencia, "Horario de oficina": SITE.horario,
        "Dirección/ubicación": SITE.direccion
      })[clave] || "";
    };
    const examplesToggleHTML = () => `<label class="admin-examples-toggle"><input type="checkbox" id="admin-examples-toggle" checked> Mostrar ejemplos en los campos</label>`;
    const bindExamplesToggle = () => {
      const t = $("#admin-examples-toggle", form); if (!t) return;
      form.classList.toggle("hide-examples", !t.checked);
      t.onchange = () => form.classList.toggle("hide-examples", !t.checked);
    };
    const siteInfoHTML = () => {
      let n = 0;
      const field = ([clave, etiqueta, tipo]) => {
        const id = "si-" + (n++);
        const ex = exampleFor(clave, etiqueta, tipo, "sitio_info");
        return `<div class="field" data-clave="${esc(clave)}" data-label="${esc(etiqueta)}" data-example="${esc(ex)}">
          <label for="${id}">${esc(etiqueta)}</label>
          ${tipo === "area" ? `<textarea id="${id}" rows="3" placeholder="${esc(ex)}"></textarea>` : `<input id="${id}" type="text" placeholder="${esc(ex)}">`}
          <small class="meta field-example">Ej: ${esc(ex)}</small>
          <small class="meta si-saved" hidden></small>
        </div>`;
      };
      const nav = SITE_INFO_GROUPS.map((g, i) => `<button type="button" class="site-space ${i ? "" : "on"}" data-tab="${g.id}" role="tab" aria-selected="${i ? "false" : "true"}">
        <span class="site-space-page">${esc(g.page || "")}</span>
        <strong>${esc(g.l)}</strong>
        <small>${g.fields.length} campo${g.fields.length === 1 ? "" : "s"}</small>
      </button>`).join("");
      const panels = SITE_INFO_GROUPS.map((g, i) => `<div class="admin-tab-panel" data-panel="${g.id}" role="tabpanel" ${i ? "hidden" : ""}>
        <div class="site-space-head"><span class="site-space-badge">${esc(g.page || "Sitio")}</span><h4>${esc(g.l)}</h4><p class="meta panel-desc">${esc(g.d)}</p></div>
        ${g.fields.map(field).join("")}
      </div>`).join("");
      return `<div class="site-info-help"><strong>Edite por espacios.</strong> Cada página o área tiene su propio apartado: elija uno a la izquierda, complete sus campos y presione <em>Guardar cambios</em>. Lo que edite se refleja en el sitio. Cada campo incluye un ejemplo; puede ocultarlos con el interruptor.</div>
        ${examplesToggleHTML()}
        <div class="admin-text-search-wrap"><label for="admin-text-search">Buscar un texto o campo</label><input id="admin-text-search" type="search" placeholder="Ej: teléfono, tarifas, botón 2, cobertura…" autocomplete="off"></div>
        <div class="site-info-layout">
          <nav class="site-info-nav" role="tablist" aria-label="Espacios de información">${nav}</nav>
          <div class="site-info-panels">${panels}</div>
        </div>`;
    };
    const fillSiteInfo = () => {
      if (current !== "sitio_info") return;
      $$("[data-clave]", form).forEach(el => {
        const inputEl = $("input,textarea", el); if (!inputEl) return;
        const rec = cache.find(r => r.clave === el.dataset.clave);
        const value = rec ? (rec.valor ?? "") : infoDefault(el.dataset.clave);
        inputEl.value = value || ""; inputEl.dataset.original = value || "";
        const hint = $(".si-saved", el);
        if (hint) { hint.hidden = false; hint.textContent = rec ? "Guardado en el sitio" : "Valor inicial: se guardará al editarlo."; }
      });
    };
    const bindSiteInfo = () => {
      bindExamplesToggle();
      const activate = b => {
        $$(".site-space", form).forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        $$(".admin-tab-panel", form).forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; });
        if (window.matchMedia("(max-width:760px)").matches) $(".site-info-panels", form)?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      $$(".site-space", form).forEach(b => { b.onclick = () => activate(b); });
      const search = $("#admin-text-search", form);
      if (search) search.oninput = () => {
        const q = search.value.trim().toLowerCase();
        $$(".admin-tab-panel", form).forEach(p => {
          let shown = 0;
          $$("[data-clave]", p).forEach(f => {
            const visible = !q || (f.dataset.clave + " " + f.dataset.label + " " + (f.dataset.example || "")).toLowerCase().includes(q);
            f.hidden = !visible; if (visible) shown++;
          });
          const btn = $(`.site-space[data-tab="${p.dataset.panel}"]`, form);
          if (btn) { btn.hidden = !!q && !shown; const badge = $(".site-space small", btn); if (badge) badge.textContent = q && shown ? `${shown} coincidencia${shown===1?"":"s"}` : `${$$("[data-clave]", p).length} campos`; }
        });
        const first = $(".site-space:not([hidden])", form); if (first) activate(first);
      };
      $("#si-restore")?.addEventListener("click", () => { fillSiteInfo(); msg.hidden = true; });
    };
    const saveSiteInfo = async () => {
      const changes = [];
      $$("[data-clave]", form).forEach(el => {
        const inputEl = $("input,textarea", el); if (!inputEl) return;
        if ((inputEl.value || "") !== (inputEl.dataset.original || "")) changes.push({ clave: el.dataset.clave, valor: inputEl.value || "" });
      });
      if (!changes.length) { msg.className = "notice"; msg.textContent = "No hay cambios para guardar."; msg.hidden = false; return; }
      try {
        for (const c of changes) {
          const rec = cache.find(r => r.clave === c.clave);
          if (rec) await updateOne("sitio_config", rec.id, { valor: c.valor });
          else await createDoc("sitio_config", { clave: c.clave, valor: c.valor });
        }
        msg.className = "notice"; msg.textContent = changes.length + " texto(s) guardado(s). Se reflejan al recargar el sitio."; msg.hidden = false;
        await refresh(); fillSiteInfo();
      } catch (e) { console.error(e); msg.className = "notice err"; msg.textContent = "No se pudo guardar. Revise la conexión con Firestore."; msg.hidden = false; }
    };
    const show = (k) => { const c = T[k]; msg.hidden = true; editing = null; setMode("Crear");
      $(".admin-work")?.classList.toggle("text-mode", c.custom === "site-info");
      if (c.custom === "site-info") {
        if (formTitle) formTitle.textContent = "Textos del sitio";
        setMode("Editar");
        form.innerHTML = siteInfoHTML() + `<div class="admin-form-actions"><button class="btn dark" type="submit">Guardar cambios</button><button type="button" class="btn sm" id="si-restore">Descartar cambios</button></div>`;
        bindSiteInfo(); refresh().then(fillSiteInfo);
        return;
      }
      if (formTitle) formTitle.textContent = "Nuevo registro";
      const base = c.f.length ? c.f.map(f => input(f, k)).join("") : `<p class="notice">Esta sección es de solo consulta (no permite crear registros desde aquí).</p>`;
      const blocksUI = c.blocks ? `<div class="cms-editor"><h4 style="margin:4px 0 4px">Contenido de la página/sección</h4><p class="meta" style="margin-bottom:10px">Construya la página agregando bloques. Puede combinarlos y ordenarlos como quiera.</p><div id="blocks-wrap"></div><div id="add-block-bar" class="b-addbar"><span class="meta">Agregar bloque:</span><button type="button" class="btn sm" data-b="titulo">Título</button><button type="button" class="btn sm" data-b="subtitulo">Subtítulo</button><button type="button" class="btn sm" data-b="texto">Texto</button><button type="button" class="btn sm" data-b="imagen">Imagen</button><button type="button" class="btn sm" data-b="boton">Botón</button><button type="button" class="btn sm" data-b="enlace">Enlace</button><button type="button" class="btn sm" data-b="logo">Logo</button></div></div>` : "";
      const importBtn = (k === "sitio_servicio" || k === "sitio_tarifa" || LF_IMPORT[k]) ? `<button type="button" class="btn sm" id="import-defaults">${LF_IMPORT[k] ? "Cargar contenido de ejemplo para editar" : "Cargar contenido actual para editar"}</button>` : "";
      form.innerHTML = c.f.length ? examplesToggleHTML() + base + blocksUI + `<div class="admin-form-actions"><button class="btn dark" type="submit">Publicar</button><button class="btn sm" type="button" id="cancel-edit" hidden>Cancelar edición</button>${importBtn}</div>` : base;
      bindExamplesToggle();
      if (c.blocks) initBlocksUI([]);
      const ce = $("#cancel-edit"); if (ce) ce.onclick = resetEdit;
      const imp = $("#import-defaults"); if (imp) imp.onclick = async () => {
        const defs = LF_IMPORT[k] || (k === "sitio_servicio" ? DEFAULT_SERVICIOS : DEFAULT_TARIFAS);
        if (!defs) return;
        if (!confirm("Se cargarán los elementos actuales como registros editables. ¿Continuar?")) return;
        imp.disabled = true; msg.hidden = true;
        try {
          const existing = await listDocs(c.c, c.o[0], c.o[1], 200);
          if (existing.length) { msg.className = "notice"; msg.textContent = "Ya hay registros. Edítelos en la lista o elimine los que no desee antes de importar."; msg.hidden = false; imp.disabled = false; return; }
          for (const d of defs) await createDoc(c.c, { ...d });
          msg.className = "notice"; msg.textContent = "Contenido actual cargado. Ahora puede editar cada elemento en la lista."; msg.hidden = false; refresh();
        } catch (e) { console.error(e); msg.className = "notice err"; msg.textContent = "No se pudo importar. Revise permisos de Firestore."; msg.hidden = false; }
        imp.disabled = false;
      };
      if (k === "prog_boton" || k === "sitio_boton") fillDestOptions(k);
      refresh().then(() => { if (k === "sitio_info" || k === "prog_texto" || k === "sitio_fondo" || k === "prog_fondo") prefillByClave(k); if (k === "prog_aliado_logo") fillAliadoOptions(); }); };
    const refresh = async () => { const k = sel.value, c = T[k]; lst.innerHTML = `<p class="empty">Cargando...</p>`;
      try { cache = await listDocs(c.c, c.o[0], c.o[1]); if (count) count.textContent = cache.length + " registro" + (cache.length === 1 ? "" : "s"); lst.innerHTML = cache.length ? cache.map(it => `<div class="admin-item"><div><strong>${esc(it.titulo || it.sector || it.pregunta || it.nombre || it.clave || it.etiqueta || (it.logoId ? "Logo del programa" : "Registro"))}</strong><span class="meta" style="display:block">${esc([it.vista, it.ubicacion, it.slug ? "#" + it.slug : "", it.destino, Array.isArray(it.bloques) ? it.bloques.length + " bloques" : "", it.visible === "No" ? "Oculto" : "", it.tipo, it.abonado ? "Abonado " + it.abonado : "", it.sector && it.titulo ? it.sector : "", fmt(it.fecha || it.creadoEn)].filter(Boolean).join(" · "))}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap">${c.editable ? `<button class="btn sm" data-edit="${it.id}" type="button">Editar</button>` : ""}<button class="btn sm danger" data-id="${it.id}" type="button">Eliminar</button></div></div>`).join("") : `<p class="empty">Sin registros aún. Cree el primero desde el formulario.</p>`;
        $$("button[data-edit]", lst).forEach(b => b.onclick = () => { const it = cache.find(x => x.id === b.dataset.edit); if (!it) return; editing = it.id; if (formTitle) formTitle.textContent = "Editar registro"; setMode("Editando"); const sb = $("button[type=submit]", form); if (sb) sb.textContent = "Guardar cambios"; const ce = $("#cancel-edit"); if (ce) ce.hidden = false; msg.hidden = true;
          for (const [n, , t] of c.f) { const el = form.elements[n]; if (!el) continue; if (t === "file") { el.required = false; const hint = $(`[data-cur="${n}"]`, form); if (hint) hint.hidden = !it[n]; } else { el.value = it[n] ?? (t === "number" ? 0 : ""); } }
          if (c.blocks) {
            let blocks = Array.isArray(it.bloques) ? it.bloques : [];
            if (!blocks.length && (it.contenido || it.imagenId || it.botonTexto)) {
              if (it.contenido) blocks.push({ tipo: "texto", texto: it.contenido });
              if (it.imagenId) blocks.push({ tipo: "imagen", imagenId: it.imagenId, texto: "", url: "" });
              if (it.botonTexto) blocks.push({ tipo: "boton", etiqueta: it.botonTexto, url: it.botonDestino || "#", estilo: "principal" });
            }
            initBlocksUI(blocks);
          }
          form.scrollIntoView({ behavior: "smooth", block: "start" }); });
        $$("button[data-id]", lst).forEach(b => b.onclick = async () => { if (!confirm("Eliminar este registro de forma permanente?")) return; await removeDoc(c.c, cache.find(x => x.id === b.dataset.id)); if (editing === b.dataset.id) resetEdit(); refresh(); });
      } catch (e) { console.error(e); fail(lst); } };
    sel.onchange = () => show(sel.value);
    form.onsubmit = async e => {
      e.preventDefault();
      if (current === "sitio_info") { const b = $("button[type=submit]", form); if (b) { b.disabled = true; await saveSiteInfo(); b.disabled = false; } return; }
      const k = sel.value, c = T[k], btn = $("button[type=submit]", form); if (!btn) return; btn.disabled = true; btn.textContent = editing ? "Guardando..." : "Publicando...";
      try { const data = { ...(c.fix || {}) }, cur = editing ? cache.find(x => x.id === editing) : null;
        for (const [n, , t, , opt] of c.f) { const el = form.elements[n]; if (!el) continue;
          if (t === "file") { if (el.files[0]) data[n] = await uploadFile(el.files[0]); else if (editing && cur && cur[n]) data[n] = cur[n]; else if (!opt && !editing) throw new Error("falta archivo"); }
          else data[n] = t === "number" ? Number(el.value || 0) : el.value; }
        if (c.blocks) data.bloques = await collectBlocks();
        if (editing) { await updateOne(c.c, editing, data); msg.textContent = "Cambios guardados correctamente."; }
        else if (k === "prog_aliado_logo") {
          const exist = cache.find(x => String(x?.nombre || "").trim().toLowerCase() === String(data.nombre || "").trim().toLowerCase());
          if (exist) { await updateOne(c.c, exist.id, { nombre: data.nombre, logoId: data.logoId }); msg.textContent = "Logo del aliado actualizado correctamente."; }
          else { await createDoc(c.c, data); msg.textContent = "Logo del aliado publicado correctamente."; }
        }
        else { await createDoc(c.c, data); msg.textContent = "Publicado correctamente."; }
        form.reset(); resetEdit(); msg.className = "notice"; refresh();
      } catch (er) { console.error(er); msg.className = "notice err"; const raw = String(er?.message || er?.response || "revise la conexión y los permisos");
        const sinConexion = er?.paso === "archivo" && /failed to fetch|networkerror|network request failed/i.test(raw);
        const detalle = /quota|resource_exhausted|429/i.test(raw) ? "Se agotó la cuota de Firestore. Espere a que se renueve (se reinicia cada día) o mejore el plan de Firebase." : raw;
        msg.textContent = sinConexion ? "No se pudo conectar para subir el archivo. Use https://www.asadabijagua.com y revise su conexión."
          : (er?.paso === "archivo" ? "No se pudo subir el archivo a Appwrite: " : er?.paso === "firestore" ? "No se pudo guardar el registro en Firestore: " : "No se pudo guardar: ") + detalle; }
      msg.hidden = false; btn.disabled = false; btn.textContent = editing ? "Guardar cambios" : "Publicar"; };
    $("#logout").onclick = async () => { try { await firebaseSignOut(auth); } catch (e) { } location.href = "/"; };
    const k0 = location.hash.slice(1);
    setCurrent(T[k0] ? k0 : "sitio_info");
  }
};

mountLayout();
const p = document.body.dataset.page;
// Las vistas que muestran controles de administración esperan a que Firebase
// resuelva la sesión; así no parpadea el enlace ni se muestra el panel a un extraño.
authReady.then(() => { if (pages[p]) pages[p](); });
