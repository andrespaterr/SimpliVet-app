import React, { useState, useEffect, useCallback, useMemo } from "react";

/* ================================================================
   SimpliVet — Sistema Completo de Gestión Veterinaria
   Módulos: Clientes, Mascotas, Historial Médico, Servicios,
            Ingresos, Egresos, Reportes, Inventario, Dashboard
   ================================================================ */

// ── ICONOS SVG ──────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor", ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" {...rest}>
      {typeof d === "string" ? <path d={d} /> : d}
    </svg>
  );
}

const I = {
  home: <Icon d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>} />,
  users: <Icon d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>} />,
  pet: <Icon d={<><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 015 5v3.5a3.5 3.5 0 01-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 015.5 10Z"/></>} />,
  clip: <Icon d={<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>} />,
  dollar: <Icon d={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>} />,
  down: <Icon d={<><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></>} />,
  chart: <Icon d={<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>} />,
  pkg: <Icon d={<><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>} />,
  search: <Icon d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} size={16} />,
  plus: <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} size={16} />,
  edit: <Icon d={<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>} size={15} />,
  trash: <Icon d={<><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>} size={15} />,
  x: <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} size={20} />,
  chevR: <Icon d={<polyline points="9,18 15,12 9,6"/>} />,
  chevL: <Icon d={<polyline points="15,18 9,12 15,6"/>} size={16} />,
  cal: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} size={16} />,
  menu: <Icon d={<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>} size={22} />,
  check: <Icon d={<polyline points="20,6 9,17 4,12"/>} size={16} />,
  arUp: <Icon d={<><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/></>} />,
  arDn: <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19,12 12,19 5,12"/></>} />,
};

// ── UTILIDADES ──────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
const fmt = (n) => {
  try { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n || 0); }
  catch { return "$" + (n || 0).toLocaleString(); }
};
const fmtDate = (d) => {
  if (!d) return "";
  try { return new Date(d + "T12:00:00").toLocaleDateString("es-CO"); }
  catch { return d; }
};
const today = () => new Date().toISOString().split("T")[0];

// ── CONSTANTES ──────────────────────────────────────────────────
const SPECIES = ["Perro", "Gato", "Ave", "Conejo", "Hamster", "Tortuga", "Pez", "Otro"];
const DOG_BREEDS = ["Mestizo", "Labrador", "Golden Retriever", "Pastor Aleman", "Bulldog", "Poodle", "Chihuahua", "Husky", "Rottweiler", "Beagle", "Yorkshire", "Schnauzer", "Pug", "Boxer", "Dalmata", "Pitbull", "French Bulldog", "Cocker Spaniel", "Shih Tzu", "Otro"];
const CAT_BREEDS = ["Mestizo", "Siames", "Persa", "Maine Coon", "Angora", "Bengali", "Ragdoll", "Sphynx", "British Shorthair", "Otro"];
const SERVICE_TYPES = ["Bano", "Corte de pelo", "Consulta veterinaria", "Vacunacion", "Desparasitacion", "Toma de muestra", "Corte de unas", "Limpieza dental", "Cirugia", "Hospitalizacion", "Examen de laboratorio", "Imagen diagnostica", "Peluqueria y spa", "Guarderia", "Otro"];
const MEDICAL_CATS = ["Consulta", "Vacunacion", "Desparasitacion", "Hospitalizacion", "Cirugia", "Examen de laboratorio", "Imagen diagnostica", "Peluqueria y spa", "Guarderia", "Seguimiento medico", "Otro"];
const EXPENSE_CATS = ["Medicamentos", "Accesorios", "Insumos", "Gastos operativos", "Alquiler", "Servicios publicos", "Salarios", "Otro"];
const INV_CATS = ["Medicamentos", "Accesorios", "Alimentos", "Insumos medicos", "Productos de aseo", "Otro"];

// ── STORAGE (localStorage) ──────────────────────────────────────
const SKEY = "simplivet_db";
function loadDB() {
  try {
    var raw = localStorage.getItem(SKEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveDB(d) {
  try { localStorage.setItem(SKEY, JSON.stringify(d)); } catch (e) { /* ignore */ }
}
function emptyDB() {
  return { clients: [], pets: [], services: [], incomes: [], expenses: [], inventory: [], medRecords: [], cycles: [] };
}

// ── COLORES Y ESTILOS ───────────────────────────────────────────
var CL = {
  bg: "#F7F5F0", card: "#FFFFFF", pri: "#2D6A4F", priL: "#40916C", priLL: "#D8F3DC",
  acc: "#E76F51", accL: "#F4A261", txt: "#1B1B1B", mut: "#6B7280", brd: "#E5E2DB",
  red: "#DC2626", redBg: "#FEF2F2", grn: "#059669", grnBg: "#ECFDF5",
  yel: "#D97706", yelBg: "#FFFBEB", bluBg: "#EFF6FF",
};

var sCard = { background: CL.card, borderRadius: 14, border: "1px solid " + CL.brd, padding: 20, marginBottom: 12 };
var sInput = { width: "100%", padding: "10px 14px", border: "1.5px solid " + CL.brd, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" };
var sSelect = Object.assign({}, sInput);
var sLabel = { fontSize: 13, fontWeight: 600, color: CL.mut, marginBottom: 4, display: "block" };

function sBtn(bg, color) {
  return { border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", background: bg || CL.pri, color: color || "#fff" };
}
var sBtnSec = { border: "1.5px solid " + CL.brd, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", background: "transparent", color: CL.txt };

// ── COMPONENTES REUTILIZABLES ───────────────────────────────────
function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 800 : 600, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }} onClick={function(e){e.stopPropagation();}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid " + CL.brd }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>{I.x}</button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Fld({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={sLabel}>{label}</label>{children}</div>;
}
function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function Badge({ children, color, bg }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: color || CL.pri, background: bg || CL.priLL }}>{children}</span>;
}
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>{I.search}</div>
      <input value={value} onChange={function(e){onChange(e.target.value);}} placeholder={placeholder || "Buscar..."} style={Object.assign({}, sInput, { paddingLeft: 40 })} />
    </div>
  );
}
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 16, padding: 18 })}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg || CL.priLL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, color: CL.mut, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}
function Empty({ icon, msg, actionLabel, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: CL.mut }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, margin: "0 0 16px" }}>{msg}</p>
      {actionLabel && <button style={sBtn()} onClick={onAction}>{I.plus} {actionLabel}</button>}
    </div>
  );
}
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: CL.bg, borderRadius: 12, padding: 4, marginBottom: 16, overflowX: "auto" }}>
      {tabs.map(function(t) {
        var a = active === t.k;
        return <button key={t.k} onClick={function(){onChange(t.k);}} style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", background: a ? "#fff" : "transparent", color: a ? CL.pri : CL.mut, boxShadow: a ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{t.l}</button>;
      })}
    </div>
  );
}
function BarChart({ data, height }) {
  var h = height || 160;
  var mx = Math.max.apply(null, data.map(function(d){return d.v;})) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h, padding: "0 4px" }}>
      {data.map(function(d, i) {
        var bh = Math.max((d.v / mx) * (h - 40), 4);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: CL.mut, fontWeight: 600 }}>{fmt(d.v)}</div>
            <div style={{ width: "100%", maxWidth: 48, borderRadius: 6, background: d.c || CL.pri, height: bh }} />
            <div style={{ fontSize: 10, color: CL.mut, fontWeight: 500 }}>{d.l}</div>
          </div>
        );
      })}
    </div>
  );
}
function Confirm({ open, onClose, onOk, msg }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 400, padding: 24, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }} onClick={function(e){e.stopPropagation();}}>
        <p style={{ fontSize: 15, margin: "0 0 20px" }}>{msg}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={sBtnSec} onClick={onClose}>Cancelar</button>
          <button style={sBtn(CL.red)} onClick={onOk}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── FILTRO POR PERIODO ──────────────────────────────────────────
function filterByPeriod(items, period) {
  if (period === "all") return items;
  var now = new Date();
  var td = today();
  return items.filter(function(i) {
    if (period === "today") return i.date === td;
    var d = new Date(i.date);
    if (period === "week") { var w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
}

// ================================================================
// APP PRINCIPAL
// ================================================================
export default function App() {
  var _db = loadDB() || emptyDB();
  var _st = useState;

  var [db, setDb] = _st(_db);
  var [page, setPage] = _st("dashboard");
  var [sidebar, setSidebar] = _st(false);
  var [search, setSearch] = _st("");
  var [searchOpen, setSearchOpen] = _st(false);
  var [selClient, setSelClient] = _st(null);
  var [selPet, setSelPet] = _st(null);
  var [mobile, setMobile] = _st(window.innerWidth < 768);

  useEffect(function() {
    function h() { setMobile(window.innerWidth < 768); }
    window.addEventListener("resize", h);
    return function() { window.removeEventListener("resize", h); };
  }, []);

  function save(newDb) { setDb(newDb); saveDB(newDb); }
  function upd(field, val) {
    var n = Object.assign({}, db);
    n[field] = val;
    save(n);
  }

  function goTo(p, opts) {
    setPage(p);
    setSidebar(false);
    if (opts && opts.client !== undefined) setSelClient(opts.client);
    if (opts && opts.pet !== undefined) setSelPet(opts.pet);
  }

  // Busqueda global
  var sResults = [];
  if (search.trim()) {
    var q = search.toLowerCase();
    db.clients.forEach(function(c) {
      if (c.name.toLowerCase().indexOf(q) >= 0 || (c.phone && c.phone.indexOf(q) >= 0))
        sResults.push({ type: "Cliente", name: c.name, go: function() { setSelClient(c.id); setPage("clients"); } });
    });
    db.pets.forEach(function(p) {
      if (p.name.toLowerCase().indexOf(q) >= 0)
        sResults.push({ type: "Mascota", name: p.name, go: function() { setSelPet(p.id); setPage("pets"); } });
    });
    db.services.forEach(function(s) {
      if ((s.type && s.type.toLowerCase().indexOf(q) >= 0) || (s.description && s.description.toLowerCase().indexOf(q) >= 0))
        sResults.push({ type: "Servicio", name: s.type + " - " + (s.description || "").slice(0, 30) });
    });
    sResults = sResults.slice(0, 8);
  }

  var NAV = [
    { k: "dashboard", l: "Inicio", i: I.home },
    { k: "clients", l: "Clientes", i: I.users },
    { k: "pets", l: "Mascotas", i: I.pet },
    { k: "services", l: "Servicios", i: I.clip },
    { k: "income", l: "Ingresos", i: I.dollar },
    { k: "expenses", l: "Egresos", i: I.down },
    { k: "reports", l: "Reportes", i: I.chart },
    { k: "inventory", l: "Inventario", i: I.pkg },
  ];

  var pp = { db: db, save: save, upd: upd, goTo: goTo, selClient: selClient, setSelClient: setSelClient, selPet: selPet, setSelPet: setSelPet };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", background: CL.bg, minHeight: "100vh", color: CL.txt, display: "flex" }}>

      {sidebar && mobile && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 899 }} onClick={function(){setSidebar(false);}} />}

      <aside style={{ width: 240, background: "#fff", borderRight: "1px solid " + CL.brd, display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 900, transition: "transform 0.25s", transform: (mobile && !sidebar) ? "translateX(-100%)" : "translateX(0)" }}>
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🐾</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: CL.pri }}>SimpliVet</div>
            <div style={{ fontSize: 11, color: CL.mut }}>Gestion Veterinaria</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
          {NAV.map(function(n) {
            var act = page === n.k;
            return (
              <button key={n.k} onClick={function(){goTo(n.k);}} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: act ? CL.priLL : "transparent", color: act ? CL.pri : CL.mut, fontWeight: act ? 700 : 500, fontSize: 14, marginBottom: 2, fontFamily: "inherit", textAlign: "left" }}>
                {n.i} {n.l}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid " + CL.brd, fontSize: 11, color: CL.mut }}>SimpliVet v1.0</div>
      </aside>

      <main style={{ flex: 1, marginLeft: mobile ? 0 : 240, minHeight: "100vh" }}>
        <header style={{ position: "sticky", top: 0, background: "rgba(247,245,240,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid " + CL.brd, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, zIndex: 100 }}>
          {mobile && <button onClick={function(){setSidebar(true);}} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>{I.menu}</button>}
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>{I.search}</div>
            <input value={search} onChange={function(e){setSearch(e.target.value); setSearchOpen(true);}} onFocus={function(){setSearchOpen(true);}} onBlur={function(){setTimeout(function(){setSearchOpen(false);},200);}} placeholder="Buscar clientes, mascotas, servicios..." style={Object.assign({}, sInput, { paddingLeft: 36, maxWidth: 440, background: "#fff", fontSize: 13 })} />
            {searchOpen && sResults.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, maxWidth: 440, background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid " + CL.brd, marginTop: 4, zIndex: 200, overflow: "hidden" }}>
                {sResults.map(function(r, i) {
                  return <button key={i} onMouseDown={function(){if(r.go)r.go(); setSearch("");}} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, textAlign: "left", borderBottom: i < sResults.length - 1 ? "1px solid " + CL.brd : "none" }}><Badge>{r.type}</Badge> <span style={{ fontWeight: 600 }}>{r.name}</span></button>;
                })}
              </div>
            )}
          </div>
        </header>

        <div style={{ padding: "clamp(12px,3vw,24px)", maxWidth: 1200, margin: "0 auto" }}>
          {page === "dashboard" && <PageDash {...pp} />}
          {page === "clients" && <PageClients {...pp} />}
          {page === "pets" && <PagePets {...pp} />}
          {page === "services" && <PageServices {...pp} />}
          {page === "income" && <PageIncome {...pp} />}
          {page === "expenses" && <PageExpenses {...pp} />}
          {page === "reports" && <PageReports {...pp} />}
          {page === "inventory" && <PageInventory {...pp} />}
        </div>
      </main>
    </div>
  );
}

// ================================================================
// DASHBOARD
// ================================================================
function PageDash({ db, goTo }) {
  var tInc = 0; db.incomes.forEach(function(i){ tInc += Number(i.amount) || 0; });
  var tExp = 0; db.expenses.forEach(function(e){ tExp += Number(e.amount) || 0; });
  var bal = tInc - tExp;

  // Services by type
  var stMap = {};
  db.services.forEach(function(s) { stMap[s.type] = (stMap[s.type] || 0) + 1; });
  var stArr = Object.keys(stMap).map(function(k){return [k, stMap[k]];}).sort(function(a,b){return b[1]-a[1];}).slice(0,6);

  // Last 7 days
  var days7 = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setDate(d.getDate() - i);
    var key = d.toISOString().split("T")[0];
    var lbl = d.toLocaleDateString("es-CO", { weekday: "short" });
    var val = 0;
    db.incomes.forEach(function(inc) { if (inc.date === key) val += Number(inc.amount) || 0; });
    days7.push({ l: lbl, v: val, c: CL.pri });
  }

  var recent = db.services.slice(-5).reverse();

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Panel Principal</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={I.dollar} label="Ingresos" value={fmt(tInc)} color={CL.grn} bg={CL.grnBg} />
        <StatCard icon={I.down} label="Egresos" value={fmt(tExp)} color={CL.red} bg={CL.redBg} />
        <StatCard icon={I.chart} label="Balance" value={fmt(bal)} color={bal >= 0 ? CL.grn : CL.red} bg={bal >= 0 ? CL.grnBg : CL.redBg} />
        <StatCard icon={I.users} label="Clientes" value={db.clients.length} />
        <StatCard icon={I.pet} label="Mascotas" value={db.pets.length} />
        <StatCard icon={I.clip} label="Servicios" value={db.services.length} color={CL.acc} bg="#FEF3E8" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 24 }}>
        <div style={sCard}><h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Ingresos ultimos 7 dias</h4><BarChart data={days7} /></div>
        <div style={sCard}>
          <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Servicios por tipo</h4>
          {stArr.length === 0 ? <p style={{ color: CL.mut, fontSize: 13 }}>Sin servicios</p> :
            stArr.map(function(st, idx) {
              return <div key={st[0]} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{st[0]}</div>
                <div style={{ width: 100, height: 8, borderRadius: 4, background: CL.brd, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: idx === 0 ? CL.pri : idx === 1 ? CL.acc : CL.priL, width: (st[1] / stArr[0][1] * 100) + "%" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, minWidth: 24 }}>{st[1]}</div>
              </div>;
            })
          }
        </div>
      </div>

      <div style={Object.assign({}, sCard, { marginBottom: 24 })}>
        <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Acciones Rapidas</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={sBtn()} onClick={function(){goTo("clients");}}>{I.plus} Nuevo Cliente</button>
          <button style={sBtn(CL.acc)} onClick={function(){goTo("services");}}>{I.plus} Nuevo Servicio</button>
          <button style={sBtn(CL.yel)} onClick={function(){goTo("expenses");}}>{I.plus} Nuevo Egreso</button>
        </div>
      </div>

      <div style={sCard}>
        <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Servicios Recientes</h4>
        {recent.length === 0 ? <p style={{ color: CL.mut, fontSize: 13 }}>No hay servicios</p> :
          recent.map(function(s) {
            var pet = db.pets.find(function(p){return p.id===s.petId;});
            var cli = db.clients.find(function(c){return c.id===s.clientId;});
            return <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + CL.brd, flexWrap: "wrap" }}>
              <Badge color={CL.acc} bg="#FEF3E8">{s.type}</Badge>
              <div style={{ flex: 1, minWidth: 100 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{pet ? pet.name : "?"} — {cli ? cli.name : "?"}</div></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: CL.grn }}>{fmt(s.price)}</div>
              <div style={{ fontSize: 12, color: CL.mut }}>{fmtDate(s.date)}</div>
            </div>;
          })
        }
      </div>
    </div>
  );
}

// ================================================================
// CLIENTES
// ================================================================
function PageClients({ db, upd, goTo, selClient, setSelClient }) {
  var [srch, setSrch] = useState("");
  var [modal, setModal] = useState(false);
  var [editId, setEditId] = useState(null);
  var [f, setF] = useState({});
  var [delId, setDelId] = useState(null);

  var list = db.clients;
  if (srch.trim()) { var q = srch.toLowerCase(); list = list.filter(function(c){return c.name.toLowerCase().indexOf(q)>=0||(c.phone&&c.phone.indexOf(q)>=0)||(c.email&&c.email.toLowerCase().indexOf(q)>=0);}); }

  function openNew() { setF({ name: "", phone: "", address: "", whatsapp: "", email: "", document: "" }); setEditId(null); setModal(true); }
  function openEdit(c) { setF(Object.assign({}, c)); setEditId(c.id); setModal(true); }
  function doSave() {
    if (!f.name || !f.name.trim()) return;
    if (editId) { upd("clients", db.clients.map(function(c){return c.id===editId?Object.assign({},c,f):c;})); }
    else { upd("clients", db.clients.concat([Object.assign({}, f, { id: uid(), createdAt: today() })])); }
    setModal(false);
  }
  function doDelete(id) { upd("clients", db.clients.filter(function(c){return c.id!==id;})); setDelId(null); if(selClient===id)setSelClient(null); }

  // Detail view
  var det = selClient ? db.clients.find(function(c){return c.id===selClient;}) : null;
  if (det) {
    var cPets = db.pets.filter(function(p){return p.clientId===det.id;});
    var cSvcs = db.services.filter(function(s){return s.clientId===det.id;});
    return (
      <div>
        <button style={sBtnSec} onClick={function(){setSelClient(null);}}>{I.chevL} Volver</button>
        <div style={Object.assign({}, sCard, { marginTop: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{det.name}</h2><div style={{ fontSize: 13, color: CL.mut, marginTop: 4 }}>Cliente desde {fmtDate(det.createdAt)}</div></div>
            <button style={sBtnSec} onClick={function(){openEdit(det);}}>{I.edit} Editar</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 16 }}>
            {det.phone && <div><div style={sLabel}>Telefono</div><div>{det.phone}</div></div>}
            {det.whatsapp && <div><div style={sLabel}>WhatsApp</div><div>{det.whatsapp}</div></div>}
            {det.email && <div><div style={sLabel}>Email</div><div>{det.email}</div></div>}
            {det.address && <div><div style={sLabel}>Direccion</div><div>{det.address}</div></div>}
            {det.document && <div><div style={sLabel}>Documento</div><div>{det.document}</div></div>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Mascotas ({cPets.length})</h3>
          <button style={sBtn()} onClick={function(){goTo("pets",{client:det.id});}}>{I.plus} Nueva Mascota</button>
        </div>
        {cPets.length === 0 ? <p style={{ color: CL.mut, fontSize: 13 }}>Sin mascotas registradas.</p> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {cPets.map(function(pet) {
              return <div key={pet.id} style={Object.assign({}, sCard, { cursor: "pointer" })} onClick={function(){goTo("pets",{pet:pet.id});}}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: CL.priLL, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.pet}</div>
                  <div><div style={{ fontSize: 15, fontWeight: 700 }}>{pet.name}</div><div style={{ fontSize: 12, color: CL.mut }}>{pet.species} — {pet.breed}</div></div>
                </div>
              </div>;
            })}
          </div>
        }
        {cSvcs.length > 0 && <div>
          <h3 style={{ margin: "20px 0 12px", fontSize: 17, fontWeight: 700 }}>Servicios Recientes</h3>
          {cSvcs.slice(-5).reverse().map(function(s) {
            var pet = db.pets.find(function(p){return p.id===s.petId;});
            return <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + CL.brd }}>
              <Badge>{s.type}</Badge><div style={{ flex: 1, fontSize: 13 }}>{pet?pet.name:""} — {s.description}</div>
              <div style={{ fontWeight: 700, color: CL.grn }}>{fmt(s.price)}</div><div style={{ fontSize: 12, color: CL.mut }}>{fmtDate(s.date)}</div>
            </div>;
          })}
        </div>}
        <Modal open={modal} onClose={function(){setModal(false);}} title={editId?"Editar Cliente":"Nuevo Cliente"}>
          <ClientForm f={f} setF={setF} onSave={doSave} />
        </Modal>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Clientes</h2>
        <button style={sBtn()} onClick={openNew}>{I.plus} Nuevo Cliente</button>
      </div>
      <SearchInput value={srch} onChange={setSrch} placeholder="Buscar por nombre, telefono o email..." />
      {list.length === 0 ? <Empty icon={I.users} msg="No hay clientes registrados" actionLabel="Agregar Cliente" onAction={openNew} /> :
        list.map(function(c) {
          var pc = db.pets.filter(function(p){return p.clientId===c.id;}).length;
          return <div key={c.id} style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 14, cursor: "pointer" })} onClick={function(){setSelClient(c.id);}}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: CL.priLL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, fontWeight: 800, color: CL.pri }}>{c.name[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: CL.mut }}>{c.phone||""} {c.email?("· "+c.email):""}</div>
            </div>
            <Badge>{pc} mascota{pc!==1?"s":""}</Badge>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(e){e.stopPropagation();openEdit(c);}}>{I.edit}</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(e){e.stopPropagation();setDelId(c.id);}}>{I.trash}</button>
            {I.chevR}
          </div>;
        })
      }
      <Modal open={modal} onClose={function(){setModal(false);}} title={editId?"Editar Cliente":"Nuevo Cliente"}>
        <ClientForm f={f} setF={setF} onSave={doSave} />
      </Modal>
      <Confirm open={!!delId} onClose={function(){setDelId(null);}} onOk={function(){doDelete(delId);}} msg="Eliminar este cliente y sus datos?" />
    </div>
  );
}

function ClientForm({ f, setF, onSave }) {
  function u(k,v){setF(Object.assign({},f,{[k]:v}));}
  return <div>
    <Fld label="Nombre Completo *"><input style={sInput} value={f.name||""} onChange={function(e){u("name",e.target.value);}} autoFocus /></Fld>
    <Row2><Fld label="Telefono"><input style={sInput} value={f.phone||""} onChange={function(e){u("phone",e.target.value);}} /></Fld><Fld label="WhatsApp"><input style={sInput} value={f.whatsapp||""} onChange={function(e){u("whatsapp",e.target.value);}} /></Fld></Row2>
    <Fld label="Direccion"><input style={sInput} value={f.address||""} onChange={function(e){u("address",e.target.value);}} /></Fld>
    <Row2><Fld label="Email (opcional)"><input style={sInput} type="email" value={f.email||""} onChange={function(e){u("email",e.target.value);}} /></Fld><Fld label="Documento (opcional)"><input style={sInput} value={f.document||""} onChange={function(e){u("document",e.target.value);}} /></Fld></Row2>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}><button style={sBtn()} onClick={onSave}>{I.check} Guardar</button></div>
  </div>;
}

// ================================================================
// MASCOTAS
// ================================================================
function PagePets({ db, upd, goTo, selPet, setSelPet, selClient, setSelClient }) {
  var [srch, setSrch] = useState("");
  var [modal, setModal] = useState(false);
  var [editId, setEditId] = useState(null);
  var [f, setF] = useState({});
  var [medModal, setMedModal] = useState(false);
  var [mf, setMf] = useState({});
  var [medTab, setMedTab] = useState("all");
  var [delId, setDelId] = useState(null);

  var list = db.pets;
  if (srch.trim()) { var q = srch.toLowerCase(); list = list.filter(function(p){return p.name.toLowerCase().indexOf(q)>=0||(p.species&&p.species.toLowerCase().indexOf(q)>=0);}); }

  function openNew() { setF({ name: "", species: "Perro", breed: "", weight: "", sex: "Macho", neutered: "No", color: "", food: "", markings: "", vaccinated: "", lastVaccDate: "", age: "", clientId: selClient || "" }); setEditId(null); setModal(true); }
  function openEdit(p) { setF(Object.assign({}, p)); setEditId(p.id); setModal(true); }
  function doSave() {
    if (!f.name||!f.name.trim()||!f.clientId) return;
    if (editId) { upd("pets", db.pets.map(function(p){return p.id===editId?Object.assign({},p,f):p;})); }
    else { upd("pets", db.pets.concat([Object.assign({}, f, { id: uid(), createdAt: today() })])); }
    setModal(false); if(selClient)setSelClient(null);
  }
  function doDelete(id) { upd("pets", db.pets.filter(function(p){return p.id!==id;})); setDelId(null); if(selPet===id)setSelPet(null); }

  function openMed() { setMf({ category: "Consulta", date: today(), description: "", attendedBy: "" }); setMedModal(true); }
  function saveMed() {
    if (!mf.description||!mf.description.trim()) return;
    upd("medRecords", db.medRecords.concat([Object.assign({}, mf, { id: uid(), petId: selPet })]));
    setMedModal(false);
  }

  var det = selPet ? db.pets.find(function(p){return p.id===selPet;}) : null;
  if (det) {
    var owner = db.clients.find(function(c){return c.id===det.clientId;});
    var recs = db.medRecords.filter(function(r){return r.petId===det.id;});
    var svcs = db.services.filter(function(s){return s.petId===det.id;});
    var fRecs = medTab === "all" ? recs : recs.filter(function(r){return r.category===medTab;});
    fRecs.sort(function(a,b){return (b.date||"").localeCompare(a.date||"");});

    return <div>
      <button style={sBtnSec} onClick={function(){setSelPet(null);}}>{I.chevL} Volver</button>
      <div style={Object.assign({}, sCard, { marginTop: 16 })}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: CL.priLL, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.pet}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{det.name}</h2>
              <div style={{ fontSize: 13, color: CL.mut }}>{det.species} — {det.breed} {det.age?("· "+det.age):""}</div>
              {owner && <div style={{ fontSize: 13, color: CL.pri, fontWeight: 600, marginTop: 2, cursor: "pointer" }} onClick={function(){goTo("clients",{client:owner.id});}}>Propietario: {owner.name}</div>}
            </div>
          </div>
          <button style={sBtnSec} onClick={function(){openEdit(det);}}>{I.edit} Editar</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
          {det.weight && <div><div style={sLabel}>Peso</div><div style={{ fontWeight: 600 }}>{det.weight} kg</div></div>}
          <div><div style={sLabel}>Sexo</div><div>{det.sex}</div></div>
          <div><div style={sLabel}>Esterilizado</div><div>{det.neutered}</div></div>
          {det.color && <div><div style={sLabel}>Color</div><div>{det.color}</div></div>}
          {det.food && <div><div style={sLabel}>Alimento</div><div>{det.food}</div></div>}
          {det.vaccinated && <div><div style={sLabel}>Vacunacion</div><div>{det.vaccinated}</div></div>}
          {det.lastVaccDate && <div><div style={sLabel}>Ultima Vacuna</div><div>{fmtDate(det.lastVaccDate)}</div></div>}
        </div>
        {det.markings && <div style={{ marginTop: 12 }}><div style={sLabel}>Senales particulares</div><div>{det.markings}</div></div>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Historial Medico</h3>
        <button style={sBtn()} onClick={openMed}>{I.plus} Nuevo Registro</button>
      </div>
      <Tabs tabs={[{k:"all",l:"Todos"}].concat(MEDICAL_CATS.map(function(c){return{k:c,l:c};}))} active={medTab} onChange={setMedTab} />
      {fRecs.length === 0 ? <div style={Object.assign({}, sCard, { textAlign: "center", color: CL.mut, padding: 32 })}>No hay registros</div> :
        fRecs.map(function(r) {
          return <div key={r.id} style={Object.assign({}, sCard, { marginBottom: 8 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <Badge color={CL.acc} bg="#FEF3E8">{r.category}</Badge>
              <span style={{ fontSize: 12, color: CL.mut }}>{fmtDate(r.date)}</span>
              {r.attendedBy && <span style={{ fontSize: 12, color: CL.mut }}>· {r.attendedBy}</span>}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{r.description}</p>
          </div>;
        })
      }
      {svcs.length > 0 && <div>
        <h3 style={{ margin: "20px 0 12px", fontSize: 17, fontWeight: 700 }}>Servicios</h3>
        {svcs.slice(-10).reverse().map(function(s) {
          return <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + CL.brd, flexWrap: "wrap" }}>
            <Badge>{s.type}</Badge><div style={{ flex: 1, fontSize: 13 }}>{s.description}</div>
            <div style={{ fontWeight: 700, color: CL.grn }}>{fmt(s.price)}</div><div style={{ fontSize: 12, color: CL.mut }}>{fmtDate(s.date)}</div>
          </div>;
        })}
      </div>}

      <Modal open={medModal} onClose={function(){setMedModal(false);}} title="Nuevo Registro Medico">
        <Fld label="Categoria"><select style={sSelect} value={mf.category||""} onChange={function(e){setMf(Object.assign({},mf,{category:e.target.value}));}}>{MEDICAL_CATS.map(function(c){return <option key={c}>{c}</option>;})}</select></Fld>
        <Row2><Fld label="Fecha"><input style={sInput} type="date" value={mf.date||""} onChange={function(e){setMf(Object.assign({},mf,{date:e.target.value}));}} /></Fld><Fld label="Encargado"><input style={sInput} value={mf.attendedBy||""} onChange={function(e){setMf(Object.assign({},mf,{attendedBy:e.target.value}));}} /></Fld></Row2>
        <Fld label="Descripcion *"><textarea style={Object.assign({}, sInput, { minHeight: 100, resize: "vertical" })} value={mf.description||""} onChange={function(e){setMf(Object.assign({},mf,{description:e.target.value}));}} /></Fld>
        <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn()} onClick={saveMed}>{I.check} Guardar</button></div>
      </Modal>
      <Modal open={modal} onClose={function(){setModal(false);}} title="Editar Mascota"><PetForm f={f} setF={setF} onSave={doSave} clients={db.clients} /></Modal>
    </div>;
  }

  // List
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Mascotas</h2>
      <button style={sBtn()} onClick={openNew}>{I.plus} Nueva Mascota</button>
    </div>
    <SearchInput value={srch} onChange={setSrch} placeholder="Buscar por nombre, especie..." />
    {list.length === 0 ? <Empty icon={I.pet} msg="No hay mascotas" actionLabel="Agregar Mascota" onAction={openNew} /> :
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {list.map(function(p) {
          var cli = db.clients.find(function(c){return c.id===p.clientId;});
          return <div key={p.id} style={Object.assign({}, sCard, { cursor: "pointer" })} onClick={function(){setSelPet(p.id);}}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: CL.priLL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.pet}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: CL.mut }}>{p.species} — {p.breed} {p.age?("· "+p.age):""}</div>
                {cli && <div style={{ fontSize: 12, color: CL.pri, fontWeight: 500 }}>{cli.name}</div>}
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(e){e.stopPropagation();openEdit(p);}}>{I.edit}</button>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(e){e.stopPropagation();setDelId(p.id);}}>{I.trash}</button>
            </div>
          </div>;
        })}
      </div>
    }
    <Modal open={modal} onClose={function(){setModal(false);}} title={editId?"Editar Mascota":"Nueva Mascota"}><PetForm f={f} setF={setF} onSave={doSave} clients={db.clients} /></Modal>
    <Confirm open={!!delId} onClose={function(){setDelId(null);}} onOk={function(){doDelete(delId);}} msg="Eliminar esta mascota y su historial?" />
  </div>;
}

function PetForm({ f, setF, onSave, clients }) {
  function u(k,v){setF(Object.assign({},f,{[k]:v}));}
  var breeds = f.species==="Perro"?DOG_BREEDS:f.species==="Gato"?CAT_BREEDS:["Otro"];
  return <div>
    <Fld label="Propietario *"><select style={sSelect} value={f.clientId||""} onChange={function(e){u("clientId",e.target.value);}}><option value="">Seleccionar</option>{clients.map(function(c){return <option key={c.id} value={c.id}>{c.name}</option>;})}</select></Fld>
    <Row2><Fld label="Nombre *"><input style={sInput} value={f.name||""} onChange={function(e){u("name",e.target.value);}} autoFocus /></Fld><Fld label="Edad"><input style={sInput} value={f.age||""} onChange={function(e){u("age",e.target.value);}} placeholder="Ej: 3 anos" /></Fld></Row2>
    <Row2><Fld label="Especie"><select style={sSelect} value={f.species||"Perro"} onChange={function(e){u("species",e.target.value);}}>{SPECIES.map(function(s){return <option key={s}>{s}</option>;})}</select></Fld><Fld label="Raza"><select style={sSelect} value={f.breed||""} onChange={function(e){u("breed",e.target.value);}}><option value="">Seleccionar</option>{breeds.map(function(b){return <option key={b}>{b}</option>;})}</select></Fld></Row2>
    <Row2><Fld label="Peso (kg)"><input style={sInput} type="number" value={f.weight||""} onChange={function(e){u("weight",e.target.value);}} /></Fld><Fld label="Color"><input style={sInput} value={f.color||""} onChange={function(e){u("color",e.target.value);}} /></Fld></Row2>
    <Row2><Fld label="Sexo"><select style={sSelect} value={f.sex||"Macho"} onChange={function(e){u("sex",e.target.value);}}><option>Macho</option><option>Hembra</option></select></Fld><Fld label="Esterilizado"><select style={sSelect} value={f.neutered||"No"} onChange={function(e){u("neutered",e.target.value);}}><option>Si</option><option>No</option></select></Fld></Row2>
    <Fld label="Tipo de Alimento"><input style={sInput} value={f.food||""} onChange={function(e){u("food",e.target.value);}} /></Fld>
    <Fld label="Senales o caracteristicas"><textarea style={Object.assign({}, sInput, { minHeight: 60, resize: "vertical" })} value={f.markings||""} onChange={function(e){u("markings",e.target.value);}} /></Fld>
    <Row2><Fld label="Vacunacion"><select style={sSelect} value={f.vaccinated||""} onChange={function(e){u("vaccinated",e.target.value);}}><option value="">Seleccionar</option><option>Al dia</option><option>Pendiente</option><option>Incompleta</option><option>No vacunado</option></select></Fld><Fld label="Fecha ultima vacuna"><input style={sInput} type="date" value={f.lastVaccDate||""} onChange={function(e){u("lastVaccDate",e.target.value);}} /></Fld></Row2>
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}><button style={sBtn()} onClick={onSave}>{I.check} Guardar</button></div>
  </div>;
}

// ================================================================
// SERVICIOS (genera ingreso automaticamente)
// ================================================================
function PageServices({ db, save, goTo }) {
  var [srch, setSrch] = useState("");
  var [modal, setModal] = useState(false);
  var [f, setF] = useState({});

  var list = db.services;
  if (srch.trim()) { var q = srch.toLowerCase(); list = list.filter(function(s){return (s.type&&s.type.toLowerCase().indexOf(q)>=0)||(s.description&&s.description.toLowerCase().indexOf(q)>=0);}); }

  function openNew() { setF({ clientId: "", petId: "", type: SERVICE_TYPES[0], description: "", price: "", date: today(), attendedBy: "" }); setModal(true); }

  function doSave() {
    if (!f.clientId || !f.petId || !f.type) return;
    var svc = Object.assign({}, f, { id: uid(), price: Number(f.price) || 0 });
    var newInc = db.incomes.slice();
    if (svc.price > 0) {
      var pet = db.pets.find(function(p){return p.id===svc.petId;});
      newInc.push({ id: uid(), type: "Servicio", description: svc.type + " — " + (pet?pet.name:""), amount: svc.price, date: svc.date, source: "servicio", serviceId: svc.id });
    }
    var mCat = MEDICAL_CATS.find(function(c){return svc.type.toLowerCase().indexOf(c.toLowerCase())>=0;}) || "Consulta";
    var newMed = db.medRecords.concat([{ id: uid(), petId: svc.petId, category: mCat, date: svc.date, description: svc.type + ": " + (svc.description||"Sin descripcion") + " — Precio: " + fmt(svc.price), attendedBy: svc.attendedBy }]);
    save(Object.assign({}, db, { services: db.services.concat([svc]), incomes: newInc, medRecords: newMed }));
    setModal(false);
  }

  var cPets = f.clientId ? db.pets.filter(function(p){return p.clientId===f.clientId;}) : [];

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Servicios</h2>
      <button style={sBtn(CL.acc)} onClick={openNew}>{I.plus} Nuevo Servicio</button>
    </div>
    <SearchInput value={srch} onChange={setSrch} placeholder="Buscar servicios..." />
    <div style={Object.assign({}, sCard, { background: CL.bluBg, border: "1px solid #BFDBFE", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, padding: 14 })}>
      {I.dollar}<span style={{ fontSize: 13, color: "#1E40AF" }}>Cada servicio genera automaticamente un ingreso financiero.</span>
    </div>
    {list.length === 0 ? <Empty icon={I.clip} msg="No hay servicios" actionLabel="Registrar Servicio" onAction={openNew} /> :
      list.slice().reverse().map(function(s) {
        var pet = db.pets.find(function(p){return p.id===s.petId;});
        var cli = db.clients.find(function(c){return c.id===s.clientId;});
        return <div key={s.id} style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" })}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.clip}</div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Badge color={CL.acc} bg="#FEF3E8">{s.type}</Badge>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{pet?pet.name:""}</span>
              <span style={{ fontSize: 12, color: CL.mut }}>({cli?cli.name:""})</span>
            </div>
            {s.description && <div style={{ fontSize: 12, color: CL.mut, marginTop: 2 }}>{s.description}</div>}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: CL.grn }}>{fmt(s.price)}</div>
            <div style={{ fontSize: 11, color: CL.mut }}>{fmtDate(s.date)}</div>
          </div>
        </div>;
      })
    }
    <Modal open={modal} onClose={function(){setModal(false);}} title="Nuevo Servicio" wide>
      <div style={{ background: CL.grnBg, border: "1px solid #A7F3D0", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: CL.grn, fontWeight: 500 }}>El ingreso se registrara automaticamente.</div>
      <Row2>
        <Fld label="Cliente *"><select style={sSelect} value={f.clientId||""} onChange={function(e){setF(Object.assign({},f,{clientId:e.target.value,petId:""}));}}><option value="">Seleccionar</option>{db.clients.map(function(c){return <option key={c.id} value={c.id}>{c.name}</option>;})}</select></Fld>
        <Fld label="Mascota *"><select style={sSelect} value={f.petId||""} onChange={function(e){setF(Object.assign({},f,{petId:e.target.value}));}}><option value="">Seleccionar</option>{cPets.map(function(p){return <option key={p.id} value={p.id}>{p.name} ({p.species})</option>;})}</select></Fld>
      </Row2>
      <Row2>
        <Fld label="Tipo *"><select style={sSelect} value={f.type||""} onChange={function(e){setF(Object.assign({},f,{type:e.target.value}));}}>{SERVICE_TYPES.map(function(s){return <option key={s}>{s}</option>;})}</select></Fld>
        <Fld label="Precio *"><input style={sInput} type="number" value={f.price||""} onChange={function(e){setF(Object.assign({},f,{price:e.target.value}));}} placeholder="50000" /></Fld>
      </Row2>
      <Row2>
        <Fld label="Fecha"><input style={sInput} type="date" value={f.date||""} onChange={function(e){setF(Object.assign({},f,{date:e.target.value}));}} /></Fld>
        <Fld label="Encargado"><input style={sInput} value={f.attendedBy||""} onChange={function(e){setF(Object.assign({},f,{attendedBy:e.target.value}));}} /></Fld>
      </Row2>
      <Fld label="Descripcion"><textarea style={Object.assign({}, sInput, { minHeight: 80, resize: "vertical" })} value={f.description||""} onChange={function(e){setF(Object.assign({},f,{description:e.target.value}));}} /></Fld>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn(CL.acc)} onClick={doSave}>{I.check} Guardar Servicio</button></div>
    </Modal>
  </div>;
}

// ================================================================
// INGRESOS
// ================================================================
function PageIncome({ db, upd }) {
  var [modal, setModal] = useState(false);
  var [f, setF] = useState({});
  var [period, setPeriod] = useState("all");

  var list = filterByPeriod(db.incomes, period);
  var total = 0; list.forEach(function(i){total+=Number(i.amount)||0;});

  function openNew() { setF({ type: "Manual", description: "", amount: "", date: today(), source: "manual" }); setModal(true); }
  function doSave() { if(!f.amount) return; upd("incomes", db.incomes.concat([Object.assign({},f,{id:uid(),amount:Number(f.amount)})])); setModal(false); }

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Ingresos</h2>
      <button style={sBtn(CL.grn)} onClick={openNew}>{I.plus} Ingreso Manual</button>
    </div>
    <Tabs tabs={[{k:"all",l:"Todos"},{k:"today",l:"Hoy"},{k:"week",l:"Semana"},{k:"month",l:"Mes"}]} active={period} onChange={setPeriod} />
    <div style={Object.assign({}, sCard, { background: CL.grnBg, border: "1px solid #A7F3D0", marginBottom: 16, textAlign: "center" })}>
      <div style={{ fontSize: 13, color: CL.grn, fontWeight: 600 }}>Total Ingresos</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: CL.grn }}>{fmt(total)}</div>
    </div>
    {list.length===0 ? <Empty icon={I.dollar} msg="No hay ingresos" /> :
      list.slice().reverse().map(function(i) {
        return <div key={i.id} style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" })}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: CL.grnBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.arUp}</div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{i.description||i.type}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <Badge color={i.source==="servicio"?CL.acc:CL.pri} bg={i.source==="servicio"?"#FEF3E8":CL.priLL}>{i.source==="servicio"?"Servicio":"Manual"}</Badge>
              <span style={{ fontSize: 12, color: CL.mut }}>{fmtDate(i.date)}</span>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: CL.grn }}>{fmt(i.amount)}</div>
        </div>;
      })
    }
    <Modal open={modal} onClose={function(){setModal(false);}} title="Ingreso Manual">
      <Fld label="Descripcion"><input style={sInput} value={f.description||""} onChange={function(e){setF(Object.assign({},f,{description:e.target.value}));}} placeholder="Ej: Venta de producto" /></Fld>
      <Row2><Fld label="Monto *"><input style={sInput} type="number" value={f.amount||""} onChange={function(e){setF(Object.assign({},f,{amount:e.target.value}));}} /></Fld><Fld label="Fecha"><input style={sInput} type="date" value={f.date||""} onChange={function(e){setF(Object.assign({},f,{date:e.target.value}));}} /></Fld></Row2>
      <Fld label="Tipo"><input style={sInput} value={f.type||""} onChange={function(e){setF(Object.assign({},f,{type:e.target.value}));}} /></Fld>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn(CL.grn)} onClick={doSave}>{I.check} Guardar</button></div>
    </Modal>
  </div>;
}

// ================================================================
// EGRESOS
// ================================================================
function PageExpenses({ db, upd }) {
  var [modal, setModal] = useState(false);
  var [f, setF] = useState({});
  var [period, setPeriod] = useState("all");

  var list = filterByPeriod(db.expenses, period);
  var total = 0; list.forEach(function(e){total+=Number(e.amount)||0;});

  function openNew() { setF({ description: "", amount: "", date: today(), category: EXPENSE_CATS[0] }); setModal(true); }
  function doSave() { if(!f.amount) return; upd("expenses", db.expenses.concat([Object.assign({},f,{id:uid(),amount:Number(f.amount)})])); setModal(false); }

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Egresos</h2>
      <button style={sBtn(CL.yel)} onClick={openNew}>{I.plus} Nuevo Egreso</button>
    </div>
    <Tabs tabs={[{k:"all",l:"Todos"},{k:"today",l:"Hoy"},{k:"week",l:"Semana"},{k:"month",l:"Mes"}]} active={period} onChange={setPeriod} />
    <div style={Object.assign({}, sCard, { background: CL.redBg, border: "1px solid #FECACA", marginBottom: 16, textAlign: "center" })}>
      <div style={{ fontSize: 13, color: CL.red, fontWeight: 600 }}>Total Egresos</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: CL.red }}>{fmt(total)}</div>
    </div>
    {list.length===0 ? <Empty icon={I.down} msg="No hay egresos" /> :
      list.slice().reverse().map(function(e) {
        return <div key={e.id} style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" })}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: CL.redBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.arDn}</div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{e.description}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <Badge color={CL.yel} bg={CL.yelBg}>{e.category}</Badge>
              <span style={{ fontSize: 12, color: CL.mut }}>{fmtDate(e.date)}</span>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: CL.red }}>-{fmt(e.amount)}</div>
        </div>;
      })
    }
    <Modal open={modal} onClose={function(){setModal(false);}} title="Nuevo Egreso">
      <Fld label="Descripcion *"><input style={sInput} value={f.description||""} onChange={function(e){setF(Object.assign({},f,{description:e.target.value}));}} autoFocus /></Fld>
      <Row2><Fld label="Monto *"><input style={sInput} type="number" value={f.amount||""} onChange={function(e){setF(Object.assign({},f,{amount:e.target.value}));}} /></Fld><Fld label="Fecha"><input style={sInput} type="date" value={f.date||""} onChange={function(e){setF(Object.assign({},f,{date:e.target.value}));}} /></Fld></Row2>
      <Fld label="Categoria"><select style={sSelect} value={f.category||""} onChange={function(e){setF(Object.assign({},f,{category:e.target.value}));}}>{EXPENSE_CATS.map(function(c){return <option key={c}>{c}</option>;})}</select></Fld>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn(CL.yel)} onClick={doSave}>{I.check} Guardar</button></div>
    </Modal>
  </div>;
}

// ================================================================
// REPORTES
// ================================================================
function PageReports({ db, save }) {
  var [period, setPeriod] = useState("month");
  var [cyModal, setCyModal] = useState(false);
  var [cyF, setCyF] = useState({ type: "Mensual", startDate: "", endDate: "" });

  var incF = filterByPeriod(db.incomes, period);
  var expF = filterByPeriod(db.expenses, period);
  var tInc = 0; incF.forEach(function(i){tInc+=Number(i.amount)||0;});
  var tExp = 0; expF.forEach(function(e){tExp+=Number(e.amount)||0;});
  var bal = tInc - tExp;

  var iByType = {}; incF.forEach(function(i){var t=i.source==="servicio"?"Servicios":(i.type||"Otro"); iByType[t]=(iByType[t]||0)+(Number(i.amount)||0);});
  var iChart = Object.keys(iByType).map(function(k){return {l:k,v:iByType[k],c:CL.grn};});
  var eByType = {}; expF.forEach(function(e){var t=e.category||"Otro"; eByType[t]=(eByType[t]||0)+(Number(e.amount)||0);});
  var eChart = Object.keys(eByType).map(function(k){return {l:k,v:eByType[k],c:CL.red};});

  function saveCycle() {
    save(Object.assign({}, db, { cycles: db.cycles.concat([Object.assign({}, cyF, { id: uid(), totalIncome: tInc, totalExpense: tExp, balance: bal, closedAt: today() })]) }));
    setCyModal(false);
  }

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Reportes Financieros</h2>
      <button style={sBtn()} onClick={function(){setCyModal(true);}}>{I.cal} Cerrar Ciclo</button>
    </div>
    <Tabs tabs={[{k:"day",l:"Dia"},{k:"week",l:"Semana"},{k:"month",l:"Mes"},{k:"all",l:"Total"}]} active={period} onChange={setPeriod} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
      <div style={Object.assign({}, sCard, { textAlign: "center", background: CL.grnBg, border: "1px solid #A7F3D0" })}><div style={{ fontSize: 12, fontWeight: 600, color: CL.grn, textTransform: "uppercase" }}>Ingresos</div><div style={{ fontSize: 24, fontWeight: 800, color: CL.grn, marginTop: 4 }}>{fmt(tInc)}</div></div>
      <div style={Object.assign({}, sCard, { textAlign: "center", background: CL.redBg, border: "1px solid #FECACA" })}><div style={{ fontSize: 12, fontWeight: 600, color: CL.red, textTransform: "uppercase" }}>Egresos</div><div style={{ fontSize: 24, fontWeight: 800, color: CL.red, marginTop: 4 }}>{fmt(tExp)}</div></div>
      <div style={Object.assign({}, sCard, { textAlign: "center", background: bal>=0?CL.grnBg:CL.redBg, border: "1px solid "+(bal>=0?"#A7F3D0":"#FECACA") })}><div style={{ fontSize: 12, fontWeight: 600, color: bal>=0?CL.grn:CL.red, textTransform: "uppercase" }}>Balance</div><div style={{ fontSize: 24, fontWeight: 800, color: bal>=0?CL.grn:CL.red, marginTop: 4 }}>{fmt(bal)}</div></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 24 }}>
      <div style={sCard}><h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Ingresos por Tipo</h4>{iChart.length===0?<p style={{color:CL.mut,fontSize:13}}>Sin datos</p>:<BarChart data={iChart} />}</div>
      <div style={sCard}><h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Egresos por Categoria</h4>{eChart.length===0?<p style={{color:CL.mut,fontSize:13}}>Sin datos</p>:<BarChart data={eChart} />}</div>
    </div>
    {db.cycles.length > 0 && <div style={sCard}>
      <h4 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Ciclos Financieros</h4>
      {db.cycles.map(function(c) {
        return <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + CL.brd, flexWrap: "wrap" }}>
          <Badge>{c.type}</Badge>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{c.startDate?fmtDate(c.startDate)+" — "+fmtDate(c.endDate):"Cerrado "+fmtDate(c.closedAt)}</div></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12 }}>Ingresos: <strong style={{color:CL.grn}}>{fmt(c.totalIncome)}</strong></div>
            <div style={{ fontSize: 12 }}>Egresos: <strong style={{color:CL.red}}>{fmt(c.totalExpense)}</strong></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.balance>=0?CL.grn:CL.red }}>Balance: {fmt(c.balance)}</div>
          </div>
        </div>;
      })}
    </div>}
    <Modal open={cyModal} onClose={function(){setCyModal(false);}} title="Cerrar Ciclo Financiero">
      <div style={Object.assign({}, sCard, { background: CL.bluBg, border: "1px solid #BFDBFE", marginBottom: 16 })}><p style={{ margin: 0, fontSize: 13, color: "#1E40AF" }}>Al cerrar se guarda un resumen. El balance sirve como saldo inicial del siguiente periodo.</p></div>
      <Fld label="Tipo"><select style={sSelect} value={cyF.type} onChange={function(e){setCyF(Object.assign({},cyF,{type:e.target.value}));}}><option>Semanal</option><option>Mensual</option></select></Fld>
      <Row2><Fld label="Fecha Inicio"><input style={sInput} type="date" value={cyF.startDate} onChange={function(e){setCyF(Object.assign({},cyF,{startDate:e.target.value}));}} /></Fld><Fld label="Fecha Fin"><input style={sInput} type="date" value={cyF.endDate} onChange={function(e){setCyF(Object.assign({},cyF,{endDate:e.target.value}));}} /></Fld></Row2>
      <div style={Object.assign({}, sCard, { marginTop: 16, background: CL.bg })}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
          <div><div style={{fontSize:11,color:CL.mut}}>Ingresos</div><div style={{fontSize:18,fontWeight:800,color:CL.grn}}>{fmt(tInc)}</div></div>
          <div><div style={{fontSize:11,color:CL.mut}}>Egresos</div><div style={{fontSize:18,fontWeight:800,color:CL.red}}>{fmt(tExp)}</div></div>
          <div><div style={{fontSize:11,color:CL.mut}}>Balance</div><div style={{fontSize:18,fontWeight:800,color:bal>=0?CL.grn:CL.red}}>{fmt(bal)}</div></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button style={sBtn()} onClick={saveCycle}>{I.check} Cerrar Ciclo</button></div>
    </Modal>
  </div>;
}

// ================================================================
// INVENTARIO
// ================================================================
function PageInventory({ db, upd }) {
  var [srch, setSrch] = useState("");
  var [modal, setModal] = useState(false);
  var [editId, setEditId] = useState(null);
  var [f, setF] = useState({});
  var [adjId, setAdjId] = useState(null);
  var [adjQty, setAdjQty] = useState(0);

  var list = db.inventory;
  if (srch.trim()) { var q = srch.toLowerCase(); list = list.filter(function(i){return i.name.toLowerCase().indexOf(q)>=0||(i.category&&i.category.toLowerCase().indexOf(q)>=0);}); }

  function openNew() { setF({ name: "", category: INV_CATS[0], quantity: "", price: "", description: "" }); setEditId(null); setModal(true); }
  function openEdit(it) { setF(Object.assign({}, it)); setEditId(it.id); setModal(true); }
  function doSave() {
    if (!f.name||!f.name.trim()) return;
    if (editId) { upd("inventory", db.inventory.map(function(i){return i.id===editId?Object.assign({},i,f,{quantity:Number(f.quantity)||0,price:Number(f.price)||0}):i;})); }
    else { upd("inventory", db.inventory.concat([Object.assign({},f,{id:uid(),quantity:Number(f.quantity)||0,price:Number(f.price)||0})])); }
    setModal(false);
  }
  function doAdj() { upd("inventory", db.inventory.map(function(i){return i.id===adjId?Object.assign({},i,{quantity:Math.max(0,i.quantity+Number(adjQty))}):i;})); setAdjId(null); setAdjQty(0); }
  function doDel(id) { upd("inventory", db.inventory.filter(function(i){return i.id!==id;})); }

  var tVal = 0; db.inventory.forEach(function(i){tVal+=i.quantity*i.price;});
  var lowS = db.inventory.filter(function(i){return i.quantity<=3&&i.quantity>0;}).length;
  var outS = db.inventory.filter(function(i){return i.quantity===0;}).length;

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Inventario</h2>
      <button style={sBtn()} onClick={openNew}>{I.plus} Nuevo Producto</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
      <StatCard icon={I.pkg} label="Productos" value={db.inventory.length} />
      <StatCard icon={I.dollar} label="Valor Total" value={fmt(tVal)} color={CL.grn} bg={CL.grnBg} />
      {lowS>0 && <StatCard icon={I.pkg} label="Stock Bajo" value={lowS} color={CL.yel} bg={CL.yelBg} />}
      {outS>0 && <StatCard icon={I.pkg} label="Agotados" value={outS} color={CL.red} bg={CL.redBg} />}
    </div>
    <SearchInput value={srch} onChange={setSrch} placeholder="Buscar productos..." />
    {list.length===0 ? <Empty icon={I.pkg} msg="No hay productos" actionLabel="Agregar Producto" onAction={openNew} /> :
      list.map(function(it) {
        return <div key={it.id} style={Object.assign({}, sCard, { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" })}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: it.quantity===0?CL.redBg:it.quantity<=3?CL.yelBg:CL.priLL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.pkg}</div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{it.name}</div>
            <Badge>{it.category}</Badge>
          </div>
          <div style={{ textAlign: "center", minWidth: 50 }}><div style={{ fontSize: 20, fontWeight: 800, color: it.quantity===0?CL.red:CL.txt }}>{it.quantity}</div><div style={{ fontSize: 10, color: CL.mut }}>uds</div></div>
          <div style={{ textAlign: "right", minWidth: 70 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(it.price)}</div><div style={{ fontSize: 10, color: CL.mut }}>c/u</div></div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button style={Object.assign({}, sBtnSec, { padding: "6px 10px", fontSize: 12 })} onClick={function(){setAdjId(it.id);setAdjQty(0);}}>Ajustar</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(){openEdit(it);}}>{I.edit}</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} onClick={function(){doDel(it.id);}}>{I.trash}</button>
          </div>
        </div>;
      })
    }
    <Modal open={modal} onClose={function(){setModal(false);}} title={editId?"Editar Producto":"Nuevo Producto"}>
      <Fld label="Nombre *"><input style={sInput} value={f.name||""} onChange={function(e){setF(Object.assign({},f,{name:e.target.value}));}} autoFocus /></Fld>
      <Row2><Fld label="Categoria"><select style={sSelect} value={f.category||""} onChange={function(e){setF(Object.assign({},f,{category:e.target.value}));}}>{INV_CATS.map(function(c){return <option key={c}>{c}</option>;})}</select></Fld><Fld label="Precio"><input style={sInput} type="number" value={f.price||""} onChange={function(e){setF(Object.assign({},f,{price:e.target.value}));}} /></Fld></Row2>
      <Fld label="Cantidad"><input style={sInput} type="number" value={f.quantity||""} onChange={function(e){setF(Object.assign({},f,{quantity:e.target.value}));}} /></Fld>
      <Fld label="Descripcion"><input style={sInput} value={f.description||""} onChange={function(e){setF(Object.assign({},f,{description:e.target.value}));}} /></Fld>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn()} onClick={doSave}>{I.check} Guardar</button></div>
    </Modal>
    <Modal open={!!adjId} onClose={function(){setAdjId(null);}} title="Ajustar Inventario">
      {adjId && (function() {
        var it = db.inventory.find(function(i){return i.id===adjId;});
        if (!it) return null;
        return <div>
          <p style={{ fontSize: 14, margin: "0 0 16px" }}><strong>{it.name}</strong> — Stock actual: <strong>{it.quantity}</strong></p>
          <Fld label="Cantidad a agregar (+) o restar (-)"><input style={sInput} type="number" value={adjQty} onChange={function(e){setAdjQty(Number(e.target.value));}} autoFocus /></Fld>
          <p style={{ fontSize: 13, color: CL.mut }}>Nuevo stock: <strong>{Math.max(0,it.quantity+Number(adjQty))}</strong></p>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={sBtn()} onClick={doAdj}>{I.check} Actualizar</button></div>
        </div>;
      })()}
    </Modal>
  </div>;
}
