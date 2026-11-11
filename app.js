/* ASADA Bijagua - app.js
   Plantilla: completar FIREBASE_CONFIG, APPWRITE_CONFIG y ADMIN_PIN. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
const SITE = { nombre: "ASADA Bijagua", telefono: "+506 0000-0000", correo: "info@asadabijagua.cr", emergencia: "+506 0000-0000" };
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
const removeDoc = async (c, item) => {
  await deleteDoc(doc(db, c, item.id));
  for (const [k, v] of Object.entries(item)) if (/Id$/.test(k) && typeof v === "string" && k !== "id") { try { await storage.deleteFile(APPWRITE_CONFIG.bucketId, v); } catch (e) { } }
};
const uploadFile = async file => (await storage.createFile(APPWRITE_CONFIG.bucketId, ID.unique(), file)).$id;

/* ---------- LAYOUT COMPARTIDO ---------- */
const NAV = [
  ["index.html", "Inicio"], ["noticias.html", "Noticias"], ["cortes.html", "Avisos de servicio"],
  ["Institucion", [["nosotros.html", "Quienes somos"], ["proyectos.html", "Proyectos"], ["documentos.html", "Transparencia"]]],
  ["Servicios", [["servicios.html", "Nuestros servicios"], ["tarifas.html", "Tarifas"], ["calidad-agua.html", "Calidad del agua"], ["afiliacion.html", "Nueva conexion"]]],
  ["faq.html", "Preguntas frecuentes"], ["contacto.html", "Contacto"]
];
const here = location.pathname.split("/").pop() || "index.html";
const navHtml = NAV.map(([a, b]) => Array.isArray(b)
  ? `<div class="dd"><button type="button" aria-haspopup="true">${a}</button><div class="dd-menu">${b.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></div>`
  : `<a href="${a}" class="${a === here ? "on" : ""}">${b}</a>`).join("");

const mountLayout = () => {
  $("#site-header").innerHTML = `
  <div class="topbar"><div class="wrap"><span>Emergencias y fugas: ${SITE.emergencia}</span><div class="tools"><button type="button" id="fs-m" aria-label="Reducir texto">A-</button><button type="button" id="fs-p" aria-label="Aumentar texto">A+</button><button type="button" id="hc" aria-label="Alto contraste">Contraste</button><button type="button" id="open-admin">Acceso Administrativo</button></div></div></div>
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
    <div class="c4"><h4>Enlaces</h4><a href="noticias.html">Noticias</a><a href="cortes.html">Avisos de servicio</a><a href="documentos.html">Transparencia</a><a href="contacto.html">Reportar una averia</a></div>
  </div><div class="legal"><span>&copy; ${new Date().getFullYear()} ASADA Bijagua. Todos los derechos reservados.</span><a href="admin.html" style="display:inline">Panel administrativo</a></div></div></footer>`;

  $("#burger").onclick = () => $("#nav").classList.toggle("open");
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
  const setFs = d => { fs = Math.min(1.3, Math.max(.9, +(fs + d).toFixed(2))); root.style.setProperty("--fs", fs); try { localStorage.setItem("asada_fs", fs); } catch (e) { } };
  $("#fs-m").onclick = () => setFs(-.1); $("#fs-p").onclick = () => setFs(.1);
  $("#hc").onclick = () => { const on = root.classList.toggle("hc"); try { localStorage.setItem("asada_hc", on ? "1" : "0"); } catch (e) { } };
};

/* ---------- TARJETAS ---------- */
const newsCard = n => `<article class="card"><a class="card-img" href="noticia-detalle.html?id=${n.id}">${n.imagenId ? `<img src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}" loading="lazy">` : ""}</a>
  <div class="card-body"><time>${fmt(n.creadoEn)}</time><h3>${esc(n.titulo)}</h3><p>${esc(n.resumen || "")}</p><a class="link" href="noticia-detalle.html?id=${n.id}" style="align-self:flex-start">Leer mas</a></div></article>`;
const cutRow = c => {
  const on = !/final|cancel/i.test(c.estado || "");
  return `<div class="row"><div><strong>${fmt(c.fecha)}</strong><span class="meta">${esc(c.horario || "")}</span></div>
  <div><span class="meta">${esc(c.tipo || "Aviso")}</span><h3>${esc(c.sector)}</h3><p>${esc(c.motivo || "")}</p></div><span class="tag ${on ? "on" : "off"}">${esc(c.estado || "Programado")}</span></div>`;
};

/* ---------- PAGINAS ---------- */
const pages = {
  async index() {
    const cb = $("#home-cortes"), nb = $("#home-news");
    try { const c = (await listDocs("cortes", "fecha", "desc", 20)).filter(x => !/final|cancel/i.test(x.estado || "")).slice(0, 3);
      c.length ? cb.innerHTML = `<div class="rows">${c.map(cutRow).join("")}</div>` : empty(cb, "No hay cortes ni mantenimientos activos o proximos."); } catch (e) { fail(cb); }
    try { const n = await listDocs("noticias", "creadoEn", "desc", 3); n.length ? nb.innerHTML = n.map(newsCard).join("") : empty(nb, "Aun no hay noticias publicadas."); } catch (e) { fail(nb); }
  },
  async noticias() {
    const box = $("#feed");
    try { const n = await listDocs("noticias"); n.length ? box.innerHTML = n.map(newsCard).join("") : empty(box, "Aun no hay noticias publicadas."); } catch (e) { fail(box); }
    if (isAdmin()) $("#admin-link").hidden = false;
  },
  async detalle() {
    const box = $("#article"), id = new URLSearchParams(location.search).get("id");
    if (!id) return empty(box, "No se indico la noticia.");
    try { const n = await getOne("noticias", id); if (!n) return empty(box, "La noticia no existe o fue retirada.");
      document.title = n.titulo + " | ASADA Bijagua";
      box.innerHTML = `<time>${fmt(n.creadoEn)}</time><h1>${esc(n.titulo)}</h1>${n.imagenId ? `<img class="hero-img" src="${fileView(n.imagenId)}" alt="${esc(n.titulo)}">` : ""}${paras(n.descripcion)}`;
    } catch (e) { fail(box); }
  },
  async cortes() {
    const box = $("#cortes-list");
    try { const c = await listDocs("cortes", "fecha", "desc"); c.length ? box.innerHTML = `<div class="rows">${c.map(cutRow).join("")}</div>` : empty(box, "No hay avisos registrados."); } catch (e) { fail(box); }
    if (isAdmin()) $("#admin-link").hidden = false;
  },
  async nosotros() {
    const box = $("#junta");
    try { const j = await listDocs("junta", "orden", "asc"); j.length ? box.innerHTML = j.map(m => `<div class="c3 team"><div class="card-img">${m.fotoId ? `<img src="${fileView(m.fotoId)}" alt="${esc(m.nombre)}" loading="lazy">` : ""}</div><h3>${esc(m.nombre)}</h3><p>${esc(m.cargo)}</p></div>`).join("") : empty(box, "La Junta Directiva se mostrara aqui.");
    } catch (e) { fail(box); }
  },
  async proyectos() {
    const box = $("#proyectos-list");
    try { const p = await listDocs("proyectos"); p.length ? box.innerHTML = p.map(x => `<article class="card"><div class="card-img">${x.imagenId ? `<img src="${fileView(x.imagenId)}" alt="${esc(x.titulo)}" loading="lazy">` : ""}</div><div class="card-body"><span class="tag" style="align-self:flex-start">${esc(x.estado || "")}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion || "")}</p></div></article>`).join("") : empty(box, "No hay proyectos registrados.");
    } catch (e) { fail(box); }
  },
  async documentos() {
    const box = $("#docs-list"), q = $("#doc-q"), cat = $("#doc-cat");
    let all = [];
    const draw = () => { const t = q.value.toLowerCase(), c = cat.value;
      const r = all.filter(d => (!c || d.categoria === c) && (!t || (d.titulo + " " + (d.descripcion || "")).toLowerCase().includes(t)));
      r.length ? box.innerHTML = `<div class="rows">${r.map(d => `<div class="row"><div><span class="tag">${esc(d.categoria || "Documento")}</span></div><div><h3>${esc(d.titulo)}</h3><p>${esc(d.descripcion || "")}</p><span class="meta">${fmt(d.creadoEn)}</span></div><a class="btn sm dark" href="${fileDown(d.archivoId)}" target="_blank" rel="noopener">Descargar</a></div>`).join("")}</div>` : empty(box, "No se encontraron documentos."); };
    try { all = await listDocs("documentos"); draw(); } catch (e) { fail(box); }
    q.oninput = draw; cat.onchange = draw;
  },
  async faq() {
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
    box.innerHTML = items.map(i => `<div class="acc-item"><button class="acc-q" type="button" aria-expanded="false">${esc(i.pregunta)}</button><div class="acc-a"><div>${esc(i.respuesta)}</div></div></div>`).join("");
    $$(".acc-item", box).forEach(it => $(".acc-q", it).onclick = () => {
      const o = it.classList.toggle("open"), a = $(".acc-a", it);
      a.style.maxHeight = o ? a.scrollHeight + "px" : 0; $(".acc-q", it).setAttribute("aria-expanded", o);
    });
  },
  contacto() {
    const f = $("#report-form"), m = $("#report-msg");
    f.onsubmit = async e => { e.preventDefault(); const b = $("button", f); b.disabled = true;
      try { await createDoc("contactos", { ...Object.fromEntries(new FormData(f)), estado: "Nuevo" }); f.reset(); m.className = "notice"; m.textContent = "Reporte enviado. La ASADA lo atendera a la brevedad."; }
      catch (er) { m.className = "notice err"; m.textContent = "No se pudo enviar el reporte. Intente de nuevo o llame al numero de emergencias."; }
      m.hidden = false; b.disabled = false; };
  },
  admin() {
    const gate = $("#admin-gate"), panel = $("#admin-panel");
    if (!isAdmin()) { gate.hidden = false; $("#gate-btn").onclick = () => window.openPin(); return; }
    panel.hidden = false;
    const estados = ["Programado", "En curso", "Finalizado", "Cancelado"];
    const T = {
      noticia: { t: "Noticia del blog", c: "noticias", o: ["creadoEn", "desc"], f: [["titulo", "Titulo", "text"], ["resumen", "Resumen breve", "text"], ["descripcion", "Contenido completo", "area"], ["imagenId", "Imagen principal", "file", "image/*"]] },
      corte: { t: "Aviso de corte de agua", c: "cortes", o: ["fecha", "desc"], fix: { tipo: "Corte de agua" }, f: [["sector", "Sector afectado", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Motivo", "area"], ["estado", "Estado", "select", estados]] },
      mantenimiento: { t: "Aviso de mantenimiento", c: "cortes", o: ["fecha", "desc"], fix: { tipo: "Mantenimiento" }, f: [["sector", "Sector o infraestructura", "text"], ["fecha", "Fecha", "date"], ["horario", "Horario", "text"], ["motivo", "Descripcion de los trabajos", "area"], ["estado", "Estado", "select", estados]] },
      documento: { t: "Documento o reglamento (PDF)", c: "documentos", o: ["creadoEn", "desc"], f: [["titulo", "Titulo", "text"], ["categoria", "Categoria", "select", ["Reglamento", "Formulario", "Informe", "Acta"]], ["descripcion", "Descripcion", "text"], ["archivoId", "Archivo PDF", "file", "application/pdf"]] },
      proyecto: { t: "Proyecto", c: "proyectos", o: ["creadoEn", "desc"], f: [["titulo", "Titulo", "text"], ["estado", "Estado", "select", ["Planificado", "En ejecucion", "Concluido"]], ["descripcion", "Descripcion", "area"], ["imagenId", "Imagen", "file", "image/*"]] },
      faq: { t: "Pregunta frecuente", c: "faqs", o: ["orden", "asc"], f: [["pregunta", "Pregunta", "text"], ["respuesta", "Respuesta", "area"], ["orden", "Orden de aparicion", "number"]] },
      junta: { t: "Miembro de la Junta Directiva", c: "junta", o: ["orden", "asc"], f: [["nombre", "Nombre completo", "text"], ["cargo", "Cargo", "text"], ["orden", "Orden jerarquico", "number"], ["fotoId", "Fotografia", "file", "image/*"]] },
      reporte: { t: "Reportes de averias recibidos (solo lectura)", c: "contactos", o: ["creadoEn", "desc"], f: [] }
    };
    const sel = $("#tipo"), form = $("#admin-form"), lst = $("#admin-list"), msg = $("#admin-msg");
    sel.innerHTML = Object.entries(T).map(([k, v]) => `<option value="${k}">${v.t}</option>`).join("");
    const input = ([n, l, t, o]) => `<div class="field"><label for="f-${n}">${l}</label>${
      t === "area" ? `<textarea id="f-${n}" name="${n}" required></textarea>` :
      t === "select" ? `<select id="f-${n}" name="${n}">${o.map(x => `<option>${x}</option>`).join("")}</select>` :
      t === "file" ? `<input id="f-${n}" name="${n}" type="file" accept="${o}" required>` :
      `<input id="f-${n}" name="${n}" type="${t}" required>`}</div>`;
    const show = (k) => { const c = T[k]; msg.hidden = true;
      form.innerHTML = c.f.length ? c.f.map(input).join("") + `<div><button class="btn dark" type="submit">Publicar</button></div>` : `<p class="notice">Esta categoria solo permite consultar y eliminar registros.</p>`;
      refresh(); };
    const refresh = async () => { const c = T[sel.value]; lst.innerHTML = `<p class="empty">Cargando...</p>`;
      try { const r = await listDocs(c.c, c.o[0], c.o[1]); lst.innerHTML = r.length ? r.map(it => `<div class="admin-item"><div><strong>${esc(it.titulo || it.sector || it.pregunta || it.nombre)}</strong><span class="meta" style="display:block">${esc([it.tipo, it.sector && it.titulo ? it.sector : "", it.descripcion && !it.titulo ? it.descripcion : "", fmt(it.fecha || it.creadoEn)].filter(Boolean).join(" - "))}</span></div><button class="btn sm danger" data-id="${it.id}" type="button">Eliminar</button></div>`).join("") : `<p class="empty">Sin registros.</p>`;
        $$("button[data-id]", lst).forEach(b => b.onclick = async () => { if (!confirm("Eliminar este registro de forma permanente?")) return; await removeDoc(c.c, r.find(x => x.id === b.dataset.id)); refresh(); });
      } catch (e) { fail(lst); } };
    sel.onchange = () => show(sel.value);
    form.onsubmit = async e => { e.preventDefault(); const c = T[sel.value], btn = $("button", form); btn.disabled = true; btn.textContent = "Publicando...";
      try { const data = { ...(c.fix || {}) };
        for (const [n, , t] of c.f) { const el = form.elements[n];
          data[n] = t === "file" ? await uploadFile(el.files[0]) : t === "number" ? Number(el.value) : el.value; }
        await createDoc(c.c, data); form.reset(); msg.className = "notice"; msg.textContent = "Publicado correctamente."; refresh();
      } catch (er) { msg.className = "notice err"; msg.textContent = "No se pudo publicar. Revise la configuracion y los permisos de Firestore y Appwrite."; }
      msg.hidden = false; btn.disabled = false; btn.textContent = "Publicar"; };
    $("#logout").onclick = () => { sessionStorage.removeItem("asada_admin"); location.href = "index.html"; };
    show("noticia");
  }
};

mountLayout();
const p = document.body.dataset.page;
if (pages[p]) pages[p]();