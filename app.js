/* ASADA Bijagua - app.js
   Plantilla: completar FIREBASE_CONFIG, APPWRITE_CONFIG y ADMIN_PIN. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Client, Storage, ID } from "https://cdn.jsdelivr.net/npm/appwrite@16.0.2/+esm";

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
const ADMIN_PIN = "admin123";
const SITE = { nombre: "ASADA Bijagua", telefono: "+506 0000-0000", correo: "info@asadabijagua.cr", emergencia: "+506 0000-0000", horario: "Complete aquí", direccion: "Bijagua, Upala, Alajuela" };
let SITE_CFG = {};
const DEFAULT_PAGE_TEXT = {
  "Servicios - título": "Nuestros servicios",
  "Servicios - descripción": "Lo que la ASADA ofrece a sus asociados.",
  "Tarifas - título": "Tarifas",
  "Tarifas - descripción": "Cuotas vigentes del servicio.",
  "Tarifas - nota": "Valores de referencia: reemplazar por las tarifas aprobadas.",
  "Calidad del agua - título": "Calidad del agua",
  "Calidad del agua - descripción": "Control y vigilancia del agua de consumo.",
  "Calidad del agua - contenido": "La ASADA realiza controles periodicos de la calidad del agua. Publique aqui los resultados mas recientes y enlace los informes en Transparencia.\n\nConsultar informes: documentos.html",
  "Nueva conexión - título": "Nueva conexión",
  "Nueva conexión - descripción": "Cómo solicitar el servicio de agua.",
  "Nueva conexión - requisitos": "Complete aquí los requisitos: identificación, plano catastrado, solicitud formal y otros documentos.",
  "Nueva conexión - proceso": "La solicitud se presenta a la Junta Directiva y se resuelve según la disponibilidad del servicio."
};
const DEFAULT_SERVICIOS = [
  { titulo: "Abastecimiento", descripcion: "Captacion, conduccion y distribucion de agua potable.", orden: 1, visible: "Sí" },
  { titulo: "Mantenimiento", descripcion: "Reparacion de fugas y mejora de la red.", orden: 2, visible: "Sí" },
  { titulo: "Atencion al asociado", descripcion: "Reportes, consultas y tramites.", orden: 3, visible: "Sí" }
];
const DEFAULT_TARIFAS = [
  { categoria: "Residencial", cuota: "Completar", observaciones: "Según consumo", orden: 1, visible: "Sí" },
  { categoria: "Comercial", cuota: "Completar", observaciones: "Según consumo", orden: 2, visible: "Sí" },
  { categoria: "Institucional", cuota: "Completar", observaciones: "Según consumo", orden: 3, visible: "Sí" }
];
const loadSiteConfig = async () => {
  try {
    const rows = await listDocs("sitio_config", "creadoEn", "desc", 200);
    const map = {};
    rows.forEach(r => { if (r.clave && !(r.clave in map)) map[r.clave] = r; });
    SITE_CFG = map;
    const val = k => map[k]?.valor;
    if (val("Nombre de la ASADA")) SITE.nombre = val("Nombre de la ASADA");
    if (val("Teléfono")) SITE.telefono = val("Teléfono");
    if (val("Correo")) SITE.correo = val("Correo");
    if (val("Teléfono emergencias")) SITE.emergencia = val("Teléfono emergencias");
    if (val("Horario de oficina")) SITE.horario = val("Horario de oficina");
    if (val("Dirección/ubicación")) SITE.direccion = val("Dirección/ubicación");
    const root = document.documentElement;
    const heroBg = map["Fondo Inicio (hero)"]?.imagenId; if (heroBg) root.style.setProperty("--site-hero-bg", `url("${fileView(heroBg)}")`);
    const headBg = map["Fondo encabezados de páginas"]?.imagenId; if (headBg) root.style.setProperty("--site-head-bg", `url("${fileView(headBg)}")`);
  } catch (e) { }
  // aplicar en layout si ya existe
  const tb = $("#site-header .topbar span"); if (tb && document.body.dataset.theme !== "programa") tb.textContent = "Emergencias y fugas: " + SITE.emergencia;
  $$(".site-tel").forEach(el => el.textContent = SITE.telefono);
  $$(".site-mail").forEach(el => el.textContent = SITE.correo);
  $$(".site-emerg").forEach(el => el.textContent = SITE.emergencia);
  $$(".site-horario").forEach(el => el.textContent = SITE.horario);
  $$(".site-dir").forEach(el => el.textContent = SITE.direccion);
  const f = $("#site-footer"); if (f && document.body.dataset.theme !== "programa") {
    const loc = f.querySelector(".c4:nth-child(2) p");
    if (loc) loc.innerHTML = `${esc(SITE.direccion)}<br>${esc(SITE.telefono)}<br>${esc(SITE.correo)}`;
  }
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

const db = getFirestore(initializeApp(FIREBASE_CONFIG));
const storage = new Storage(new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId));

/* ---------- UTILIDADES ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toDate = v => v?.toDate ? v.toDate() : (v ? new Date(String(v).length === 10 ? v + "T00:00:00" : v) : null);
const fmt = v => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" }) : ""; };
const fileView = id => id ? String(storage.getFileView(APPWRITE_CONFIG.bucketId, id)) : "";
const fileDown = id => id ? String(storage.getFileDownload(APPWRITE_CONFIG.bucketId, id)) : "";
const isAdmin = () => sessionStorage.getItem("asada_admin") === "1";
const paras = t => String(t ?? "").split(/\n{2,}|\n/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
const empty = (el, msg) => { el.innerHTML = `<p class="empty">${msg}</p>`; };
const fail = el => { el.innerHTML = `<p class="notice err">No se pudo cargar la informacion. Verifique la configuracion de Firebase y Appwrite en app.js.</p>`; };

/* ---------- CRUD (Firestore + Appwrite) ---------- */
const listDocs = async (c, o = "creadoEn", dir = "desc", n = 100) => {
  const s = await getDocs(query(collection(db, c), orderBy(o, dir), limit(n)));
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
};
const getOne = async (c, id) => { const s = await getDoc(doc(db, c, id)); return s.exists() ? { id: s.id, ...s.data() } : null; };
const createDoc = (c, data) => addDoc(collection(db, c), { ...data, creadoEn: serverTimestamp() });
const updateOne = (c, id, data) => updateDoc(doc(db, c, id), { ...data, actualizadoEn: serverTimestamp() });
const removeDoc = async (c, item) => {
  await deleteDoc(doc(db, c, item.id));
  for (const [k, v] of Object.entries(item)) if (/Id$/.test(k) && typeof v === "string" && k !== "id") { try { await storage.deleteFile(APPWRITE_CONFIG.bucketId, v); } catch (e) { } }
};
const uploadFile = async file => (await storage.createFile(APPWRITE_CONFIG.bucketId, ID.unique(), file)).$id;

/* ---------- CMS helpers ---------- */
const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "seccion";
const destAny = d => { const v = String(d || "#").trim(); return /^(https?:|mailto:|tel:|#|\/|.*\.html)/i.test(v) ? v : "#" + slugify(v); };
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

/* ---------- LAYOUT COMPARTIDO ---------- */
const NAV = [
  ["index.html", "Inicio"], ["programa.html", "Programa Educación Ambiental"], ["noticias.html", "Noticias"], ["cortes.html", "Avisos de servicio"],
  ["Institucion", [["nosotros.html", "Quienes somos"], ["proyectos.html", "Proyectos"], ["documentos.html", "Transparencia"]]],
  ["Servicios", [["servicios.html", "Nuestros servicios"], ["tarifas.html", "Tarifas"], ["calidad-agua.html", "Calidad del agua"], ["afiliacion.html", "Nueva conexion"]]],
  ["faq.html", "Preguntas frecuentes"], ["contacto.html", "Contacto"]
];
const here = location.pathname.split("/").pop() || "index.html";
const navHtml = NAV.map(([a, b]) => Array.isArray(b)
  ? `<div class="dd"><button type="button" aria-haspopup="true">${a}</button><div class="dd-menu">${b.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></div>`
  : `<a href="${a}" class="${a === here ? "on" : ""}${a === "programa.html" ? " nav-prog" : ""}">${b}</a>`).join("");

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
  <div class="topbar"><div class="wrap"><span>Emergencias y fugas: ${SITE.emergencia}</span><button type="button" id="open-admin" class="top-admin">Acceso Administrativo</button></div></div>
  <header class="header"><div class="wrap">
    <a class="brand" href="index.html"><img src="logo1.jpg" alt="Logotipo ASADA Bijagua"><span>ASADA Bijagua<small>Asociacion Administradora del Acueducto, Upala</small></span></a>
    <button class="burger" type="button" id="burger" aria-label="Abrir menu">Menu</button>
    <nav class="nav" id="nav" aria-label="Principal">${navHtml}</nav>
  </div></header>
  <div class="modal" id="pin-modal" role="dialog" aria-modal="true" aria-labelledby="pin-t"><div class="modal-box">
    <h3 id="pin-t">Acceso administrativo</h3><p class="meta">Ingrese el codigo de verificacion.</p>
    <div class="field"><label for="pin-in">Codigo</label><input id="pin-in" type="password" autocomplete="off"></div>
    <p class="notice err" id="pin-err" hidden>El codigo no es correcto.</p>
    <div class="modal-actions"><button class="btn dark" type="button" id="pin-ok">Verificar</button><button class="btn" type="button" id="pin-x" style="background:none;color:var(--ink);border-color:var(--line)">Cancelar</button></div>
  </div></div>`;
  $("#site-footer").innerHTML = `
  <footer class="footer"><div class="wrap"><div class="grid">
    <div class="c4"><h4>ASADA Bijagua</h4><p>Administramos y protegemos el servicio de agua potable de la comunidad de Bijagua, Upala.</p></div>
    <div class="c4"><h4>Ubicacion</h4><p>Bijagua, Upala<br>Alajuela, Costa Rica<br>${SITE.telefono}<br>${SITE.correo}</p></div>
    <div class="c4"><h4>Enlaces</h4><a href="noticias.html">Noticias</a><a href="cortes.html">Avisos de servicio</a><a href="documentos.html">Transparencia</a><a href="contacto.html">Reportar una averia</a><a href="programa.html">Programa Educación Ambiental</a></div>
  </div><div class="legal"><span>&copy; ${new Date().getFullYear()} ASADA Bijagua. Todos los derechos reservados.</span><a href="admin.html" style="display:inline">Panel administrativo</a></div></div></footer>`;

  if (document.body.dataset.theme === "programa") {
    $(".topbar span").textContent = "Programa de Educación Ambiental de la ASADA Bijagua";
    $(".brand").setAttribute("href", "programa.html");
    $(".brand").innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#a9dc76"/><path d="M20 33V17" stroke="#0f3d2e" stroke-width="3" stroke-linecap="round"/><path d="M20 22C12 22 9 17 9 12c7 0 11 3 11 10Z" fill="#2f8f4e"/><path d="M20 18c0-6 4-9 11-9 0 6-4 9-11 9Z" fill="#0f3d2e"/><circle cx="20" cy="9" r="3" fill="#f4c430"/></svg><span>Creciendo por la vida<small>Programa de Educación Ambiental</small></span>`;
    $("#nav").innerHTML = `<a href="#informacion">El programa</a><a href="#noticias">Noticias</a><a href="#galeria">Galería</a><a href="#aliados">Aliados</a><a class="back" href="index.html">Ir a la ASADA</a>`;
    $("#nav").onclick = e => e.target.closest("a") && $("#nav").classList.remove("open");
    $("#site-footer").innerHTML = `<footer class="footer"><div class="wrap"><div class="grid"><div><h4>Creciendo por la vida</h4><p>Programa de Educación Ambiental de la ASADA Bijagua. Cuidamos el agua y el bosque con la comunidad de Bijagua de Upala.</p></div><div><h4>Explorar</h4><a href="#informacion">El programa completo</a><a href="#noticias">Noticias</a><a href="#aliados">Aliados</a></div><div><h4>ASADA Bijagua</h4><a href="index.html">Volver al sitio de la ASADA</a><a href="contacto.html">Contacto</a><a href="admin.html">Panel administrativo</a></div></div><div class="legal"><span>&copy; ${new Date().getFullYear()} ASADA Bijagua</span></div></div></footer>`;
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
          <span>Alto contraste</span>
          <button type="button" class="acc-switch" id="acc-contraste" role="switch" aria-checked="false" aria-label="Alternar alto contraste"><span></span></button>
        </div>
        <p class="acc-hint">Toque la burbuja para abrir o cerrar.</p>
      </div>
    </div>
  `);

  $("#burger").onclick = () => $("#nav").classList.toggle("open");
  if (document.body.dataset.theme !== "programa") { loadSiteConfig(); initWaterDrops(); }
  const modal = $("#pin-modal");
  const open = () => { modal.classList.add("open"); $("#pin-in").value = ""; $("#pin-err").hidden = true; $("#pin-in").focus(); };
  const check = () => {
    if ($("#pin-in").value === ADMIN_PIN) { sessionStorage.setItem("asada_admin", "1"); modal.classList.remove("open"); location.href = "admin.html"; }
    else $("#pin-err").hidden = false;
  };
  $("#open-admin").onclick = () => isAdmin() ? (location.href = "admin.html") : open();
  $("#pin-ok").onclick = check; $("#pin-x").onclick = () => modal.classList.remove("open");
  $("#pin-in").onkeydown = e => { if (e.key === "Enter") check(); if (e.key === "Escape") modal.classList.remove("open"); };
  window.openPin = open;
  const root = document.documentElement; let fs = 1;
  try { fs = Number(localStorage.getItem("asada_fs")) || 1; if (localStorage.getItem("asada_hc") === "1") root.classList.add("hc"); } catch (e) { }
  root.style.setProperty("--fs", fs);
  const aplicarFs = () => {
    root.style.setProperty("--fs", fs);
    try { localStorage.setItem("asada_fs", fs); } catch (e) { }
  };
  const accBubble = $("#acc-bubble"), accPanel = $("#acc-panel"), accSwitch = $("#acc-contraste");
  const setAccAbierto = a => { if (accPanel) accPanel.hidden = !a; accBubble?.setAttribute("aria-expanded", String(!!a)); };
  accBubble?.addEventListener("click", e => { e.stopPropagation(); setAccAbierto(accPanel?.hidden); });
  document.addEventListener("click", e => { if (!e.target.closest("#accesibilidad-flotante")) setAccAbierto(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setAccAbierto(false); });
  $("#acc-fs-menos")?.addEventListener("click", () => { fs = Math.max(0.9, +(fs - 0.1).toFixed(2)); aplicarFs(); });
  $("#acc-fs-mas")?.addEventListener("click", () => { fs = Math.min(1.3, +(fs + 0.1).toFixed(2)); aplicarFs(); });
  $("#acc-fs-reset")?.addEventListener("click", () => { fs = 1; aplicarFs(); });
  const actualizarSwitch = () => accSwitch?.setAttribute("aria-checked", String(root.classList.contains("hc")));
  accSwitch?.addEventListener("click", () => {
    const on = root.classList.toggle("hc");
    try { localStorage.setItem("asada_hc", on ? "1" : "0"); } catch (e) { }
    actualizarSwitch();
  });
  actualizarSwitch();
};

/* ---------- TARJETAS ---------- */
const newsCard = n => `<article class="card"><a class="card-img" href="noticia-detalle.html?id=${n.id}">${n.imagenId ? `<img src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}" loading="lazy">` : ""}</a>
  <div class="card-body"><time>${fmt(n.creadoEn)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.resumen || "")}</p><a class="link" href="noticia-detalle.html?id=${n.id}" style="align-self:flex-start">Leer mas</a></div></article>`;
const cutRow = c => {
  const on = !/final|cancel/i.test(c.estado || "");
  return `<div class="row"><div><strong>${fmt(c.fecha)}</strong><span class="meta">${esc(c.horario || "")}</span></div>
  <div><span class="meta">${esc(c.tipo || "Aviso")}</span><h3>${esc(c.sector)}</h3><p>${esc(c.motivo || "")}</p></div><span class="tag ${on ? "on" : "off"}">${esc(c.estado || "Programado")}</span></div>`;
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
    if (cb) try { const c = (await listDocs("cortes", "fecha", "desc", 20)).filter(x => !/final|cancel/i.test(x.estado || "")).slice(0, 3);
      c.length ? cb.innerHTML = `<div class="rows">${c.map(cutRow).join("")}</div>` : empty(cb, "No hay cortes ni mantenimientos activos o proximos."); } catch (e) { console.error(e); fail(cb); }
    const hp = $("#home-prog");
    if (hp) listDocs("programa_noticias", "creadoEn", "desc", 3).then(n => { if (n.length) hp.innerHTML = n.map(x => `<a href="programa.html#noticia-${x.id}"><time>${fmt(x.creadoEn)}</time><strong>${esc(x.titulo)}</strong></a>`).join(""); }).catch(() => { });
    if (nb) try { const n = await listDocs("noticias", "creadoEn", "desc", 3); n.length ? nb.innerHTML = n.map(newsCard).join("") : empty(nb, "Aun no hay noticias publicadas."); } catch (e) { console.error(e); fail(nb); }
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
      (await listDocs("programa_aliados", "creadoEn", "asc")).forEach(d => {
        const i = al.findIndex(x => key(x.nombre) === key(d.nombre));
        if (i >= 0) { if (d.logoId) al[i] = { ...al[i], logoId: d.logoId }; }
        else if (d.nombre) al.push({ ...d, nombre: d.nombre.trim() });
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

    if (isAdmin()) { const d = document.createElement("div"); d.className = "adm"; d.innerHTML = `Modo administrador <a href="admin.html#prog_seccion">Secciones/Páginas</a><a href="admin.html#prog_boton">Botones/Menú</a><a href="admin.html#prog_noticia">Noticias</a>`; document.body.append(d); }
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
      r.length ? box.innerHTML = `<div class="rows">${r.map(d => `<div class="row"><div><span class="tag">${esc(d.categoria || "Documento")}</span></div><div><h3>${esc(d.titulo)}</h3><p>${esc(d.descripcion || "")}</p><span class="meta">${fmt(d.creadoEn)}</span></div><a class="btn sm dark" href="${fileDown(d.archivoId)}" target="_blank" rel="noopener">Descargar</a></div>`).join("")}</div>` : empty(box, "No se encontraron documentos."); };
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
      ["Como solicito una nueva conexion?", "Consulte los requisitos en Nueva conexion y presente la documentacion ante la Junta Directiva."],
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
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    const pageNames = { "servicios.html":"Servicios", "tarifas.html":"Tarifas", "calidad-agua.html":"Calidad del agua", "afiliacion.html":"Nueva conexión" };
    const cfg = (k) => SITE_CFG[k]?.valor;
    const setHead = (titleKey, descKey, fallbackTitle, fallbackDesc) => {
      const t = cfg(titleKey) || fallbackTitle, d = cfg(descKey) || fallbackDesc;
      if ($("#page-title")) $("#page-title").textContent = t;
      if ($("#page-crumb")) $("#page-crumb").textContent = t;
      if ($("#page-desc")) $("#page-desc").textContent = d;
      if (t) document.title = `${t} | ${SITE.nombre || "ASADA Bijagua"}`;
    };

    if (file === "servicios.html") {
      setHead("Servicios - título", "Servicios - descripción", "Nuestros servicios", "Lo que la ASADA ofrece a sus asociados.");
      const box = $("#servicios-list");
      if (box) try {
        const items = (await listDocs("servicios", "orden", "asc", 100)).filter(x => x.visible !== "No" && x.visible !== false);
        if (items.length) box.innerHTML = items.map(x => `<div class="c4"><h3>${esc(x.titulo || "")}</h3><p style="margin-top:10px">${esc(x.descripcion || "")}</p></div>`).join("");
      } catch (e) { }
    } else if (file === "tarifas.html") {
      setHead("Tarifas - título", "Tarifas - descripción", "Tarifas", "Cuotas vigentes del servicio.");
      const body = $("#tarifas-body");
      if (body) try {
        const rows = (await listDocs("tarifas", "orden", "asc", 100)).filter(x => x.visible !== "No" && x.visible !== false);
        if (rows.length) body.innerHTML = rows.map(r => `<tr><td>${esc(r.categoria || "")}</td><td>${esc(r.cuota || "")}</td><td>${esc(r.observaciones || "")}</td></tr>`).join("");
      } catch (e) { }
      const nota = cfg("Tarifas - nota"); if (nota && $("#tarifas-nota")) $("#tarifas-nota").textContent = nota;
    } else if (file === "calidad-agua.html") {
      setHead("Calidad del agua - título", "Calidad del agua - descripción", "Calidad del agua", "Control y vigilancia del agua de consumo.");
      const cont = cfg("Calidad del agua - contenido");
      if (cont && $("#calidad-content")) $("#calidad-content").innerHTML = `<div class="prose">${paras(cont)}</div>`;
    } else if (file === "afiliacion.html") {
      setHead("Nueva conexión - título", "Nueva conexión - descripción", "Nueva conexión", "Cómo solicitar el servicio de agua.");
      const req = cfg("Nueva conexión - requisitos"), proc = cfg("Nueva conexión - proceso");
      if (req && $("#afiliacion-req")) $("#afiliacion-req").innerHTML = `<h3>Requisitos</h3><div class="prose">${paras(req)}</div>`;
      if (proc && $("#afiliacion-proc")) $("#afiliacion-proc").innerHTML = `<h3>Proceso</h3><div class="prose">${paras(proc)}</div>`;
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
        if (main) main.innerHTML = `<section class="page-head"><div class="wrap"><div class="crumbs"><a href="index.html">Inicio</a> / Página</div><h1>Página no encontrada</h1></div></section><section class="section"><div class="wrap"><p class="empty">La página solicitada no existe o no está disponible.</p><p style="margin-top:12px"><a class="btn sm dark" href="index.html">Volver al inicio</a></p></div></section>`;
        initWaterDrops();
        return;
      }
      const title = page.titulo || "Página";
      document.title = `${title} | ${SITE.nombre || "ASADA Bijagua"}`;
      const body = (Array.isArray(page.bloques) && page.bloques.length) ? `<div class="cms-body">${renderBlocks(page.bloques)}</div>` : renderBlocks(null, page);
      if (main) main.innerHTML = `<section class="page-head"><div class="wrap"><div class="crumbs"><a href="index.html">Inicio</a> / ${esc(title)}</div><h1>${esc(title)}</h1></div></section><section class="section"><div class="wrap narrow">${body || `<p class="empty">Esta página aún no tiene contenido.</p>`}</div></section><div id="site-custom-sections"></div>`;
      initWaterDrops();
      await renderSitePageSections("");
    } catch (e) { console.error(e); if (main) main.innerHTML = `<section class="section"><div class="wrap">${`<p class="notice err">No se pudo cargar la página.</p>`}</div></section>`; initWaterDrops(); }
  },
  admin() {
    const gate = $("#admin-gate"), panel = $("#admin-panel");
    if (!isAdmin()) { gate.hidden = false; $("#gate-btn").onclick = () => window.openPin(); return; }
    panel.hidden = false;
    const estados = ["Programado", "En curso", "Finalizado", "Cancelado"];
    const T = {
      sitio_info: { t: "Información y textos del sitio", c: "sitio_config", o: ["creadoEn", "desc"], editable: 1, f: [["clave", "Dato a editar", "select", ["Teléfono", "Correo", "Teléfono emergencias", "Horario de oficina", "Dirección/ubicación", "Nombre de la ASADA", "Servicios - título", "Servicios - descripción", "Tarifas - título", "Tarifas - descripción", "Tarifas - nota", "Calidad del agua - título", "Calidad del agua - descripción", "Calidad del agua - contenido", "Nueva conexión - título", "Nueva conexión - descripción", "Nueva conexión - requisitos", "Nueva conexión - proceso"]], ["valor", "Valor / texto (se mostrará en el sitio)", "area"]] },
      sitio_fondo: { t: "Fondos e imágenes (ASADA)", c: "sitio_config", o: ["creadoEn", "desc"], editable: 1, f: [["clave", "Área del fondo", "select", ["Fondo Inicio (hero)", "Fondo encabezados de páginas"]], ["imagenId", "Imagen de fondo (se mostrará detrás del color/gradiente del sitio)", "file", "image/*"]], tipExtra: "La imagen se combina con los colores originales para un efecto elegante. Suba una nueva para reemplazar." },
      sitio_seccion: { t: "Páginas y secciones (ASADA)", c: "sitio_secciones", o: ["orden", "asc"], editable: 1, blocks: 1, f: [["titulo", "Título de la sección/página", "text"], ["slug", "Identificador/slug (para página nueva, ej: convenios). Enlace: pagina.html?slug=convenios", "text", "", 1], ["pagina", "¿Dónde se mostrará?", "select", ["Sección en: Inicio", "Sección en: Contacto", "Sección en: Nosotros", "Sección en: Servicios", "Sección en: Tarifas", "Sección en: Calidad del agua", "Sección en: Nueva conexión", "Sección en: Transparencia/Documentos", "Sección en: Proyectos", "Sección en: Preguntas frecuentes", "Página nueva (individual)"]], ["orden", "Orden (número, menor primero)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_boton: { t: "Botones y accesos (ASADA)", c: "sitio_botones", o: ["orden", "asc"], editable: 1, f: [["etiqueta", "Texto del botón/enlace", "text"], ["destino", "Destino (ej: contacto.html, #id, https://...)", "text"], ["ubicacion", "Dónde mostrarlo", "select", ["Accesos rápidos Inicio", "Botones destacados Inicio", "Sección Contacto"]], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_servicio: { t: "Servicios (Nuestros servicios)", c: "servicios", o: ["orden", "asc"], editable: 1, f: [["titulo", "Nombre del servicio", "text"], ["descripcion", "Descripción", "area"], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      sitio_tarifa: { t: "Tarifas (tabla)", c: "tarifas", o: ["orden", "asc"], editable: 1, f: [["categoria", "Categoría", "text"], ["cuota", "Cuota base", "text"], ["observaciones", "Observaciones", "text"], ["orden", "Orden (número)", "number"], ["visible", "Visible", "select", ["Sí", "No"]]] },
      noticia: { t: "Noticias del sitio", c: "noticias", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["resumen", "Resumen breve", "text"], ["descripcion", "Contenido completo", "area"], ["imagenId", "Imagen principal", "file", "image/*"]] },
      corte: { t: "Cortes de agua", c: "cortes", o: ["fecha", "desc"], editable: 1, fix: { tipo: "Corte de agua" }, f: [["sector", "Sector afectado", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Motivo", "area"], ["estado", "Estado", "select", estados]] },
      mantenimiento: { t: "Mantenimientos", c: "cortes", o: ["fecha", "desc"], editable: 1, fix: { tipo: "Mantenimiento" }, f: [["sector", "Sector o infraestructura", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Descripcion de los trabajos", "area"], ["estado", "Estado", "select", estados]] },
      documento: { t: "Documentos y transparencia", c: "documentos", o: ["creadoEn", "desc"], editable: 1, f: [["titulo", "Titulo", "text"], ["categoria", "Categoria", "select", ["Reglamento", "Formulario", "Informe", "Acta"]], ["descripcion", "Descripcion", "text"], ["archivoId", "Archivo PDF", "file", "application/pdf"]] },
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
      prog_aliado: { t: "Aliados", c: "programa_aliados", o: ["creadoEn", "asc"], editable: 1, f: [["nombre", "Nombre del aliado", "text"], ["logoId", "Logo (opcional)", "file", "image/*", 1]] },
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
          { k: "sitio_info", l: "Información y textos", d: "Teléfonos, contacto y textos de páginas (Servicios, Tarifas, Calidad del agua, Nueva conexión).", i: "info", tip: "Edite datos de contacto y los textos/títulos de las páginas de la categoría Servicios. Se reflejan automáticamente en el sitio." },
          { k: "sitio_fondo", l: "Fondos e imágenes", d: "Suba fotos de fondo para el inicio y encabezados, manteniendo los colores del sitio.", i: "img", tip: "La imagen se muestra con transparencia sobre los colores originales para un estilo elegante. Suba una nueva para reemplazar." },
          { k: "sitio_seccion", l: "Páginas y secciones", d: "Cree una sección dentro de una página existente o una página nueva individual del sitio.", i: "page", tip: "En '¿Dónde se mostrará?' elija una página existente para agregar una sección ahí, o 'Página nueva (individual)' (defina un slug). Enlace de página nueva: pagina.html?slug=su-slug." },
          { k: "sitio_boton", l: "Botones y accesos", d: "Cree botones y enlaces rápidos para el sitio de la ASADA.", i: "menu" },
        ]},
        { g: "Servicios (páginas)", items: [
          { k: "sitio_servicio", l: "Nuestros servicios", d: "Edite los servicios que se muestran en la página Servicios.", i: "page" },
          { k: "sitio_tarifa", l: "Tarifas", d: "Edite las filas de la tabla de tarifas vigentes.", i: "doc", tip: "Cada registro es una fila (categoría, cuota base y observaciones)." },
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
    menu.innerHTML = MENU.map(d => `<div class="admin-domain dom-${d.dom}"><div class="admin-domain-title">${esc(d.label)}</div>${d.groups.map(g => `<div class="admin-group"><div class="admin-group-title">${esc(g.g)}</div>${g.items.map(it => `<button type="button" class="admin-nav-item" data-k="${it.k}"><span class="admin-ico">${ico[it.i] || ico.page}</span><span class="admin-nav-txt"><strong>${esc(it.l)}</strong><small>${esc(it.d)}</small></span></button>`).join("")}</div>`).join("")}</div>`).join("");
    const setCurrent = k => { if (!T[k]) k = "sitio_info"; current = k; sel.value = k; $$(".admin-nav-item", menu).forEach(b => b.classList.toggle("on", b.dataset.k === k)); const m = byKey[k] || { l: T[k].t, g: "Panel", dom: "asada", domLabel: "Panel", d: "", tip: "" }; panel.classList.toggle("dom-asada", m.dom === "asada"); panel.classList.toggle("dom-prog", m.dom === "prog"); if (bc) bc.textContent = m.domLabel + " / " + m.l; if (title) title.textContent = m.l; if (desc) desc.textContent = m.d || "Gestione este contenido."; if (tip) { tip.textContent = m.tip || ""; tip.hidden = !m.tip; } panel.classList.remove("menu-open"); show(k); };
    $$(".admin-nav-item", menu).forEach(b => b.onclick = () => setCurrent(b.dataset.k));
    const tog = $("#admin-menu-toggle"); if (tog) tog.onclick = () => panel.classList.toggle("menu-open");

    const input = ([n, l, t, o, opt], k) => {
      const isDest = n === "destino";
      const listAttr = isDest ? ` list="dest-list"` : "";
      return `<div class="field"><label for="f-${n}">${l}${opt ? ' <span class="meta">(opcional)</span>' : ""}</label>${
      t === "area" ? `<textarea id="f-${n}" name="${n}" ${opt?"":"required"}></textarea>` :
      t === "select" ? `<select id="f-${n}" name="${n}">${o.map(x => `<option>${x}</option>`).join("")}</select>` :
      t === "file" ? `<input id="f-${n}" name="${n}" type="file" accept="${o}" ${opt?"":"required"}><small class="meta" data-cur="${n}" hidden>Archivo actual conservado (suba uno nuevo para reemplazar).</small>` :
      `<input id="f-${n}" name="${n}" type="${t}" ${listAttr} ${opt?"":"required"}>`}${isDest ? `<small class="meta">Puede escribir una ruta/URL o seleccionar una página existente de la lista.</small><datalist id="dest-list"></datalist>` : ""}</div>`;
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
      const pageFile = { "Inicio":"index.html","Contacto":"contacto.html","Nosotros":"nosotros.html","Servicios":"servicios.html","Tarifas":"tarifas.html","Calidad del agua":"calidad-agua.html","Nueva conexión":"afiliacion.html","Transparencia/Documentos":"documentos.html","Proyectos":"proyectos.html","Preguntas frecuentes":"faq.html" };
      if (k === "prog_boton") {
        [["#inicio","Inicio del programa"],["#informacion","Información del programa"],["#noticias","Noticias"],["#galeria","Galería"],["#aliados","Aliados"],["index.html","Sitio ASADA (inicio)"],["contacto.html","Contacto"],["programa.html","Página del programa"]].forEach(([v,l])=>add(v,l));
        try { (await listDocs("programa_secciones", "orden", "asc", 200)).forEach(s => { const sl = slugify(s.slug || s.titulo || ""); if (!sl) return; const pv = s.vista; if (pv === "Página independiente" || pv === "Página nueva (individual)") { add("#" + sl, `Página nueva: ${s.titulo || sl}`); add("#sec-" + sl, `Página nueva: ${s.titulo || sl}`); } else add("#sec-" + sl, `Sección: ${s.titulo || sl}`); }); } catch (e) { }
      } else if (k === "sitio_boton") {
        Object.entries(pageFile).concat([["Programa ambiental","programa.html"]]).forEach(([l,v]) => add(v || l, l));
        try { (await listDocs("sitio_secciones", "orden", "asc", 200)).forEach(s => { const p = String(s.pagina || ""); if (p === "Página nueva (individual)") { const sl = slugify(s.slug || s.titulo || ""); if (sl) add("pagina.html?slug=" + sl, `Página nueva: ${s.titulo || sl}`); } else { const base = p.replace(/^Sección en:\s*/i, ""); if (pageFile[base]) add(pageFile[base], `Sección en ${base}: ${s.titulo || ""}`); } }); } catch (e) { }
      }
      dl.innerHTML = [...opts.entries()].map(([v,l]) => `<option value="${esc(v)}" label="${esc(l)}">${esc(l)}</option>`).join("");
    };
    const prefillByClave = (k) => {
      const claveEl = form.elements["clave"]; if (!claveEl) return;
      const valEl = form.elements["valor"] || form.elements["contenido"];
      const getDefault = (clave) => {
        if (k === "sitio_info") {
          if (DEFAULT_PAGE_TEXT[clave]) return DEFAULT_PAGE_TEXT[clave];
          if (clave === "Nombre de la ASADA") return SITE.nombre;
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
    const show = (k) => { const c = T[k]; msg.hidden = true; editing = null; setMode("Crear");
      if (formTitle) formTitle.textContent = "Nuevo registro";
      const base = c.f.length ? c.f.map(f => input(f, k)).join("") : `<p class="notice">Esta sección es de solo consulta (no permite crear registros desde aquí).</p>`;
      const blocksUI = c.blocks ? `<div class="cms-editor"><h4 style="margin:4px 0 4px">Contenido de la página/sección</h4><p class="meta" style="margin-bottom:10px">Construya la página agregando bloques. Puede combinarlos y ordenarlos como quiera.</p><div id="blocks-wrap"></div><div id="add-block-bar" class="b-addbar"><span class="meta">Agregar bloque:</span><button type="button" class="btn sm" data-b="titulo">Título</button><button type="button" class="btn sm" data-b="subtitulo">Subtítulo</button><button type="button" class="btn sm" data-b="texto">Texto</button><button type="button" class="btn sm" data-b="imagen">Imagen</button><button type="button" class="btn sm" data-b="boton">Botón</button><button type="button" class="btn sm" data-b="enlace">Enlace</button><button type="button" class="btn sm" data-b="logo">Logo</button></div></div>` : "";
      const importBtn = (k === "sitio_servicio" || k === "sitio_tarifa") ? `<button type="button" class="btn sm" id="import-defaults">Cargar contenido actual para editar</button>` : "";
      form.innerHTML = c.f.length ? base + blocksUI + `<div class="admin-form-actions"><button class="btn dark" type="submit">Publicar</button><button class="btn sm" type="button" id="cancel-edit" hidden>Cancelar edición</button>${importBtn}</div>` : base;
      if (c.blocks) initBlocksUI([]);
      const ce = $("#cancel-edit"); if (ce) ce.onclick = resetEdit;
      const imp = $("#import-defaults"); if (imp) imp.onclick = async () => {
        const defs = k === "sitio_servicio" ? DEFAULT_SERVICIOS : DEFAULT_TARIFAS;
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
      refresh().then(() => { if (k === "sitio_info" || k === "prog_texto" || k === "sitio_fondo" || k === "prog_fondo") prefillByClave(k); }); };
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
    form.onsubmit = async e => { e.preventDefault(); const k = sel.value, c = T[k], btn = $("button[type=submit]", form); if (!btn) return; btn.disabled = true; btn.textContent = editing ? "Guardando..." : "Publicando...";
      try { const data = { ...(c.fix || {}) }, cur = editing ? cache.find(x => x.id === editing) : null;
        for (const [n, , t, , opt] of c.f) { const el = form.elements[n]; if (!el) continue;
          if (t === "file") { if (el.files[0]) data[n] = await uploadFile(el.files[0]); else if (editing && cur && cur[n]) data[n] = cur[n]; else if (!opt && !editing) throw new Error("falta archivo"); }
          else data[n] = t === "number" ? Number(el.value || 0) : el.value; }
        if (c.blocks) data.bloques = await collectBlocks();
        if (editing) { await updateOne(c.c, editing, data); msg.textContent = "Cambios guardados correctamente."; }
        else { await createDoc(c.c, data); msg.textContent = "Publicado correctamente."; }
        form.reset(); resetEdit(); msg.className = "notice"; refresh();
      } catch (er) { console.error(er); msg.className = "notice err"; msg.textContent = "No se pudo guardar. Revise la configuracion y los permisos de Firestore y Appwrite."; }
      msg.hidden = false; btn.disabled = false; btn.textContent = editing ? "Guardar cambios" : "Publicar"; };
    $("#logout").onclick = () => { sessionStorage.removeItem("asada_admin"); location.href = "index.html"; };
    const k0 = location.hash.slice(1);
    setCurrent(T[k0] ? k0 : "sitio_info");
  }
};

mountLayout();
const p = document.body.dataset.page;
if (pages[p]) pages[p]();
