import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://odhxxcjkaqfnnnfiyqac.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaHh4Y2prYXFmbm5uZml5cWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzgxOTUsImV4cCI6MjA4ODA1NDE5NX0.JnKTzwbUKc70EtS_q3ZkVuSSeMa-QppS8HGI-w7YJx4";

const api = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json", Prefer: opts.prefer || "return=representation", ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
const db = {
  get: (t, q = "") => api(`${t}?${q}`),
  post: (t, b) => api(t, { method: "POST", body: JSON.stringify(b) }),
  patch: (t, q, b) => api(`${t}?${q}`, { method: "PATCH", body: JSON.stringify(b) }),
  del: (t, q) => api(`${t}?${q}`, { method: "DELETE", prefer: "return=minimal" }),
};

const RUBRICS = [
  { id: 1,  activity: "Attend Non-Mandatory Course (Half Day)", points: 10, icon: "📚" },
  { id: 2,  activity: "Attend Non-Mandatory Course (Full Day)", points: 20, icon: "📚" },
  { id: 3,  activity: "Complete Online e-Learning Module",       points: 5,  icon: "💻" },
  { id: 4,  activity: "Lead a Knowledge Sharing Session",        points: 25, icon: "🎤" },
  { id: 5,  activity: "Participate in Community Service",        points: 15, icon: "🤝" },
  { id: 6,  activity: "Complete a Fitness Challenge",            points: 10, icon: "🏃" },
  { id: 7,  activity: "Mentor a Junior Officer",                 points: 20, icon: "🌱" },
  { id: 8,  activity: "Submit Innovation Idea",                  points: 15, icon: "💡" },
  { id: 9,  activity: "Achieve a Professional Certification",    points: 50, icon: "🏅" },
  { id: 10, activity: "Volunteer for Extra Assignment",          points: 10, icon: "⭐" },
];

const CATALOGUE = [
  { id: "v1", cat: "Vouchers",    name: "NTUC FairPrice $10",   desc: "$10 grocery voucher",                 cost: 40,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v2", cat: "Vouchers",    name: "Grab $10",             desc: "$10 ride / food credits",             cost: 40,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v3", cat: "Vouchers",    name: "NTUC FairPrice $25",   desc: "$25 grocery voucher",                 cost: 90,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v4", cat: "Vouchers",    name: "Grab $25",             desc: "$25 ride / food credits",             cost: 90,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v5", cat: "Vouchers",    name: "Shopping Voucher $50", desc: "Capitaland / Lazada",                 cost: 180, icon: "🛍️", color: "#a855f7", tba: false },
  { id: "l1", cat: "Leave",       name: "Half-Day Off-in-Lieu", desc: "Take half a day off",                 cost: 60,  icon: "🌅", color: "#06b6d4", tba: false },
  { id: "l2", cat: "Leave",       name: "Full-Day Off-in-Lieu", desc: "Take a full day off",                 cost: 110, icon: "🏖️", color: "#06b6d4", tba: false },
  { id: "p1", cat: "Coming Soon", name: "Mystery Prize A",      desc: "To be announced",                     cost: 50,  icon: "🎁", color: "#ec4899", tba: true },
  { id: "p2", cat: "Coming Soon", name: "Mystery Prize B",      desc: "To be announced",                     cost: 120, icon: "🎁", color: "#ec4899", tba: true },
  { id: "p3", cat: "Coming Soon", name: "Mystery Prize C",      desc: "To be announced",                     cost: 200, icon: "🎁", color: "#ec4899", tba: true },
];

const CAMPAIGN_END = new Date("2026-12-31");
const getCountdown = () => {
  const d = CAMPAIGN_END - new Date();
  if (d <= 0) return { days: 0, hours: 0, mins: 0 };
  return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), mins: Math.floor((d % 3600000) / 60000) };
};

const initials = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const DARK = {
  bg: "#080c1a", surface: "rgba(255,255,255,0.045)", border: "rgba(255,255,255,0.09)",
  borderA: "rgba(99,102,241,0.45)", text: "#f1f5f9", sub: "rgba(255,255,255,0.48)",
  muted: "rgba(255,255,255,0.26)", nav: "rgba(8,12,26,0.94)", accent: "#6366f1",
  accentL: "#a5b4fc", chip: "rgba(255,255,255,0.045)", chipSel: "rgba(99,102,241,0.2)",
  inputBg: "rgba(255,255,255,0.055)", inputBdr: "rgba(255,255,255,0.11)",
  div: "rgba(255,255,255,0.07)", blank: "rgba(255,255,255,0.07)",
  infoBg: "rgba(99,102,241,0.08)", infoBdr: "rgba(99,102,241,0.22)",
  shadow: "rgba(0,0,0,0.55)", gold: "rgba(255,215,0,0.22)",
};
const LITE = {
  bg: "#eef0f7", surface: "rgba(255,255,255,0.92)", border: "rgba(0,0,0,0.09)",
  borderA: "rgba(99,102,241,0.5)", text: "#0f172a", sub: "rgba(15,23,42,0.54)",
  muted: "rgba(15,23,42,0.34)", nav: "rgba(238,240,247,0.96)", accent: "#4f46e5",
  accentL: "#4f46e5", chip: "rgba(255,255,255,0.75)", chipSel: "rgba(99,102,241,0.13)",
  inputBg: "rgba(255,255,255,0.95)", inputBdr: "rgba(0,0,0,0.13)",
  div: "rgba(0,0,0,0.07)", blank: "rgba(0,0,0,0.06)",
  infoBg: "rgba(99,102,241,0.06)", infoBdr: "rgba(99,102,241,0.2)",
  shadow: "rgba(0,0,0,0.1)", gold: "rgba(180,130,0,0.26)",
};

export default function App() {
  const [dark, setDark] = useState(true);
  const c = dark ? DARK : LITE;

  const [branches, setBranches]     = useState([]);
  const [officers, setOfficers]     = useState([]);
  const [subs, setSubs]             = useState([]);
  const [redems, setRedems]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [dbErr, setDbErr]           = useState(null);
  const [adminPwd, setAdminPwd]     = useState("admin1234");

  const [screen, setScreen]         = useState("landing");
  const [user, setUser]             = useState(null);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [tab, setTab]               = useState("leaderboard");
  const [cd, setCd]                 = useState(getCountdown());
  const [toast, setToast]           = useState(null);
  const [confirm, setConfirm]       = useState(null);

  const [selBranch, setSelBranch]   = useState("");
  const [selName, setSelName]       = useState("");
  const [adminBox, setAdminBox]     = useState(false);
  const [adminIn, setAdminIn]       = useState("");
  const [pwErr, setPwErr]           = useState(false);

  const [form, setForm]             = useState({ rubricId: "", date: "", desc: "" });
  const [catF, setCatF]             = useState("All");

  const [newName, setNewName]       = useState("");
  const [newBr, setNewBr]           = useState("");
  const [newBrName, setNewBrName]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [sLoading, setSLoading]     = useState(false);
  const [editOf, setEditOf]         = useState(null);
  const [editN, setEditN]           = useState("");
  const [editB, setEditB]           = useState("");

  const load = useCallback(async () => {
    try {
      setDbErr(null);
      const [br, of, su, re, cfg] = await Promise.all([
        db.get("branches", "order=name.asc"),
        db.get("officers", "order=total_points.desc&select=*,branches(name)"),
        db.get("submissions", "order=created_at.desc"),
        db.get("redemptions", "order=created_at.desc"),
        db.get("config", "key=eq.admin_password"),
      ]);
      setBranches(br || []);
      setOfficers((of || []).map(o => ({ ...o, unit: o.branches?.name || "" })));
      setSubs(su || []);
      setRedems(re || []);
      if (cfg?.[0]) setAdminPwd(cfg[0].value);
    } catch (e) { setDbErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setCd(getCountdown()), 30000); return () => clearInterval(id); }, []);

  const msg = (text, type = "ok") => { setToast({ text, type }); setTimeout(() => setToast(null), 3200); };

  const sorted     = [...officers].sort((a, b) => b.total_points - a.total_points);
  const unitScores = branches.map(br => {
    const ofs = officers.filter(o => o.unit === br.name);
    const total = ofs.reduce((s, o) => s + o.total_points, 0);
    return { unit: br.name, total, count: ofs.length, avg: ofs.length ? Math.round(total / ofs.length) : 0 };
  }).sort((a, b) => b.avg - a.avg);
  const byBranch   = branches.reduce((a, br) => { a[br.name] = officers.filter(o => o.unit === br.name); return a; }, {});
  const pending    = subs.filter(s => s.status === "pending");
  const pendingR   = redems.filter(r => r.status === "pending");
  const myOf       = user ? officers.find(o => o.id === user.id) : null;
  const mySpent    = user ? redems.filter(r => r.officer_id === user.id && r.status !== "rejected").reduce((s, r) => s + r.cost, 0) : 0;
  const myAvail    = myOf ? myOf.total_points - mySpent : 0;
  const myRank     = user ? sorted.findIndex(o => o.id === user.id) + 1 : null;
  const mySubs     = user ? subs.filter(s => s.officer_id === user.id) : [];
  const cats       = ["All", ...Array.from(new Set(CATALOGUE.map(p => p.cat)))];
  const catItems   = catF === "All" ? CATALOGUE : CATALOGUE.filter(p => p.cat === catF);

  const enterOfficer = () => {
    const o = officers.find(o => o.name === selName && o.unit === selBranch);
    if (!o) return;
    setUser(o); setIsAdmin(false); setTab("submit"); setScreen("portal");
  };
  const enterAdmin = () => {
    if (adminIn === adminPwd) { setIsAdmin(true); setUser(null); setTab("approvals"); setScreen("portal"); setPwErr(false); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 2000); }
  };

  const submitAct = async () => {
    if (!form.rubricId || !form.date || !form.desc.trim()) return;
    const r = RUBRICS.find(r => r.id === parseInt(form.rubricId));
    try {
      await db.post("submissions", { officer_id: user.id, officer_name: user.name, unit: user.unit, activity: r.activity, icon: r.icon, points: r.points, date: form.date, description: form.desc, status: "pending" });
      setForm({ rubricId: "", date: "", desc: "" });
      msg("Activity submitted! Awaiting approval 🎯"); await load(); setTab("mylog");
    } catch (e) { msg(e.message, "err"); }
  };
  const approve = async (id) => {
    const s = subs.find(s => s.id === id);
    try {
      await db.patch("submissions", `id=eq.${id}`, { status: "approved" });
      await db.patch("officers", `id=eq.${s.officer_id}`, { total_points: (officers.find(o => o.id === s.officer_id)?.total_points || 0) + s.points });
      msg(`✅ +${s.points} pts → ${s.officer_name}`); await load();
    } catch (e) { msg(e.message, "err"); }
  };
  const reject    = async (id) => { try { await db.patch("submissions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected."); await load(); } catch (e) { msg(e.message, "err"); } };
  const redeemP   = async (p) => {
    try {
      await db.post("redemptions", { officer_id: user.id, officer_name: user.name, unit: user.unit, prize_name: p.name, prize_icon: p.icon, cost: p.cost, status: "pending" });
      setConfirm(null); msg("🎁 Redemption submitted!"); await load();
    } catch (e) { msg(e.message, "err"); }
  };
  const fulfilR  = async (id, name) => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "fulfilled" }); msg(`🎁 Fulfilled for ${name}`); await load(); } catch (e) { msg(e.message, "err"); } };
  const rejectR  = async (id) => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected.", "err"); await load(); } catch (e) { msg(e.message, "err"); } };

  const addOfficer    = async () => { if (!newName.trim() || !newBr) return; setSLoading(true); try { const br = branches.find(b => b.name === newBr); await db.post("officers", { name: newName.trim(), branch_id: br.id, total_points: 0 }); setNewName(""); setNewBr(""); msg(`✅ ${newName} added`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeOfficer = async (id, name) => { if (!window.confirm(`Remove ${name}? Their activity history will also be deleted.`)) return; setSLoading(true); try { await db.del("submissions", `officer_id=eq.${id}`); await db.del("redemptions", `officer_id=eq.${id}`); await db.del("officers", `id=eq.${id}`); msg(`${name} removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const startEdit     = (o) => { setEditOf(o); setEditN(o.name); setEditB(o.unit); };
  const cancelEdit    = () => { setEditOf(null); setEditN(""); setEditB(""); };
  const saveEdit      = async () => { if (!editN.trim() || !editB) return; setSLoading(true); try { const br = branches.find(b => b.name === editB); await db.patch("officers", `id=eq.${editOf.id}`, { name: editN.trim(), branch_id: br.id }); if (editN !== editOf.name) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); } if (editB !== editOf.unit) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { unit: editB }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { unit: editB }); } msg(`✅ ${editN} updated`); cancelEdit(); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const addBranch     = async () => { if (!newBrName.trim()) return; setSLoading(true); try { await db.post("branches", { name: newBrName.trim() }); setNewBrName(""); msg("✅ Branch added"); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeBranch  = async (id, name) => { if (!window.confirm(`Remove "${name}"? All officers in this branch will be deleted too.`)) return; setSLoading(true); try { for (const o of (byBranch[name] || [])) { await db.del("submissions", `officer_id=eq.${o.id}`); await db.del("redemptions", `officer_id=eq.${o.id}`); await db.del("officers", `id=eq.${o.id}`); } await db.del("branches", `id=eq.${id}`); msg(`Branch "${name}" removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const changePw      = async () => { if (newPw.length < 6) { msg("Min 6 characters.", "err"); return; } setSLoading(true); try { await db.patch("config", "key=eq.admin_password", { value: newPw.trim() }); setAdminPwd(newPw.trim()); setNewPw(""); msg("✅ Password updated."); } catch (e) { msg(e.message, "err"); } setSLoading(false); };

  // Shared atoms
  const card = { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 13 };
  const inp  = { width: "100%", padding: "10px 12px", background: c.inputBg, border: `1px solid ${c.inputBdr}`, borderRadius: 8, color: c.text, fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };

  const Btn = ({ ch, onClick, v = "primary", sz = "md", disabled = false }) => {
    const p = { sm: "5px 10px", md: "9px 15px", lg: "12px 20px" };
    const s = { primary: { bg: `linear-gradient(135deg,${c.accent},#4338ca)`, col: "#fff", bdr: "none" }, success: { bg: "rgba(34,197,94,0.13)", col: "#4ade80", bdr: "1px solid rgba(34,197,94,0.28)" }, danger: { bg: "rgba(239,68,68,0.1)", col: "#f87171", bdr: "1px solid rgba(239,68,68,0.26)" }, ghost: { bg: c.blank, col: c.sub, bdr: `1px solid ${c.border}` } }[v] || {};
    return <button onClick={onClick} disabled={disabled} style={{ padding: p[sz], background: disabled ? c.blank : s.bg, color: disabled ? c.muted : s.col, border: s.bdr, borderRadius: 7, cursor: disabled ? "default" : "pointer", fontWeight: 600, fontSize: sz === "sm" ? 11 : 13, fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "opacity 0.15s" }}>{ch}</button>;
  };

  const Toggle = () => (
    <button onClick={() => setDark(d => !d)} style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: dark ? "rgba(99,102,241,0.35)" : "rgba(0,0,0,0.13)", position: "relative", padding: 0, flexShrink: 0 }}>
      <span style={{ width: 14, height: 14, borderRadius: "50%", background: dark ? "#a5b4fc" : "#4f46e5", position: "absolute", top: 3, left: dark ? 3 : 19, transition: "left 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>{dark ? "🌙" : "☀️"}</span>
    </button>
  );

  const Pill = ({ status, label }) => {
    const map = { approved: ["rgba(34,197,94,0.12)", "#4ade80"], pending: ["rgba(234,179,8,0.12)", "#fbbf24"], rejected: ["rgba(239,68,68,0.12)", "#f87171"] };
    const [bg, col] = map[status] || map.pending;
    return <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: bg, color: col, whiteSpace: "nowrap" }}>{(label || status).toUpperCase()}</span>;
  };

  const CSS = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: ${c.bg}; min-height: 100vh; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.13)"}; border-radius: 4px; }
      input:focus, select:focus, textarea:focus { outline: none !important; border-color: ${c.accent} !important; box-shadow: 0 0 0 3px ${dark ? "rgba(99,102,241,0.12)" : "rgba(79,70,229,0.09)"} !important; }
      input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1) opacity(0.45)" : "opacity(0.45)"}; cursor: pointer; }
      select option { background: ${dark ? "#141828" : "#fff"}; color: ${c.text}; }
      @keyframes toastIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pop { 0%{transform:scale(0.88);opacity:0} 65%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
      @keyframes spin { to{transform:rotate(360deg)} }
      @keyframes up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      .up { animation: up 0.25s ease both; }
    `}</style>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <div style={{ width: 32, height: 32, border: `3px solid ${c.border}`, borderTop: `3px solid ${c.accent}`, borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
      <p style={{ color: c.sub, fontSize: 13 }}>Connecting…</p>
    </div>
  );

  if (dbErr) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
      <CSS />
      <div style={{ fontSize: 38 }}>⚠️</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, color: c.text }}>Database Connection Error</h2>
      <p style={{ color: c.sub, fontSize: 13, maxWidth: 360, lineHeight: 1.65 }}>{dbErr}</p>
      <p style={{ color: c.muted, fontSize: 11, maxWidth: 320 }}>Ensure Supabase tables exist and RLS is disabled on all tables.</p>
      <Btn ch="Retry" onClick={load} v="primary" sz="md" />
    </div>
  );

  // ── Rubrics ───────────────────────────────────────────────────────────────
  if (screen === "rubrics") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <MiniNav c={c} dark={dark} Toggle={Toggle} onBack={() => setScreen("landing")} />
      <div className="up" style={{ maxWidth: 680, margin: "0 auto", padding: "32px 18px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, marginBottom: 5, color: c.text }}>Points Rubrics</h2>
        <p style={{ color: c.sub, fontSize: 13, marginBottom: 24 }}>All eligible activities and their point values.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {RUBRICS.map(r => (
            <div key={r.id} style={{ ...card, padding: "13px 16px", display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: c.text }}>{r.activity}</span>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{r.points}</div>
                <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1 }}>PTS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Catalogue ─────────────────────────────────────────────────────────────
  if (screen === "catalogue") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <MiniNav c={c} dark={dark} Toggle={Toggle} onBack={() => setScreen("landing")} />
      <div className="up" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 18px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, marginBottom: 5, color: c.text }}>Prize Catalogue</h2>
        <p style={{ color: c.sub, fontSize: 13, marginBottom: 22 }}>Earn points, spend them on any prize.</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {cats.map(ct => <button key={ct} onClick={() => setCatF(ct)} style={{ padding: "5px 13px", borderRadius: 6, border: `1px solid ${catF === ct ? c.accent : c.border}`, background: catF === ct ? c.chipSel : c.chip, color: catF === ct ? c.accentL : c.sub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{ct}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 11, marginBottom: 24 }}>
          {catItems.map(p => <StaticPrizeCard key={p.id} p={p} c={c} card={card} />)}
        </div>
        <SpecialSection c={c} dark={dark} card={card} />
      </div>
    </div>
  );

  // ── Landing ───────────────────────────────────────────────────────────────
  if (screen === "landing") {
    const top3 = sorted.slice(0, 3);
    const pod  = [top3[1], top3[0], top3[2]];
    const podP = [2, 1, 3];
    const podM = ["🥈", "🥇", "🥉"];
    const podG = ["linear-gradient(135deg,#b0b8c8,#8a9ab0)", "linear-gradient(135deg,#FFD700,#d97706)", "linear-gradient(135deg,#cd7f32,#92400e)"];
    const podC = ["#9ca3af", "#d4a017", "#b87333"];

    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
        <CSS />
        {dark && <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 90% 50% at 50% -8%, rgba(99,102,241,0.1) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />}

        {/* Top bar */}
        <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", height: 50, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 17 }}>🏆</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: c.text }}>TRACOM Nova</span>
            </div>
            <Toggle />
          </div>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 18px 80px", position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div className="up" style={{ textAlign: "center", padding: "44px 0 32px" }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 11 }}>🏆</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: -0.3, marginBottom: 7, color: c.text }}>TRACOM Nova</h1>
            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 20 }}>CAMPAIGN LEADERBOARD & TRACKER</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12 }}>
              {[["DAYS", cd.days], ["HRS", cd.hours], ["MINS", cd.mins]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 9, color: c.muted, letterSpacing: 2, marginTop: 3 }}>{l} LEFT</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: c.muted }}>Ends 31 Dec 2026 · Top 3 Officers + Top Branch win special prizes ★</p>
          </div>

          {/* Login */}
          <div className="up" style={{ ...card, padding: "22px 20px", marginBottom: 10, boxShadow: `0 5px 28px ${c.shadow}` }}>
            {!adminBox ? (
              <>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, textAlign: "center", marginBottom: 18 }}>SELECT YOUR DETAILS TO ENTER</p>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 8 }}>YOUR BRANCH</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
                  {branches.map(b => (
                    <div key={b.id} onClick={() => { setSelBranch(b.name); setSelName(""); }}
                      style={{ padding: "9px 10px", borderRadius: 8, fontSize: 12, fontWeight: selBranch === b.name ? 600 : 400, lineHeight: 1.3, textAlign: "center", cursor: "pointer", background: selBranch === b.name ? c.chipSel : c.chip, border: `1px solid ${selBranch === b.name ? c.accent : c.border}`, color: selBranch === b.name ? (dark ? "#e0e7ff" : c.accent) : c.sub, transition: "all 0.13s" }}>
                      {b.name}
                    </div>
                  ))}
                </div>
                {selBranch && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 8 }}>YOUR NAME</p>
                    {(byBranch[selBranch] || []).length === 0
                      ? <p style={{ fontSize: 12, color: c.muted }}>No officers in this branch yet.</p>
                      : (byBranch[selBranch] || []).map(o => {
                          const sel = selName === o.name;
                          return (
                            <div key={o.id} onClick={() => setSelName(o.name)}
                              style={{ marginBottom: 5, padding: "8px 13px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, background: sel ? c.chipSel : c.chip, border: `1px solid ${sel ? c.accent : c.border}`, color: sel ? (dark ? "#e0e7ff" : c.accent) : c.sub, transition: "all 0.13s" }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: sel ? c.accent : c.blank, color: sel ? "#fff" : c.sub, flexShrink: 0 }}>{initials(o.name)}</div>
                              <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{o.name}</span>
                              {sel && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
                            </div>
                          );
                        })}
                  </div>
                )}
                <button onClick={enterOfficer} disabled={!selBranch || !selName}
                  style={{ width: "100%", padding: "12px 0", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "none", cursor: selBranch && selName ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", background: selBranch && selName ? `linear-gradient(135deg,${c.accent},#4338ca)` : c.blank, color: selBranch && selName ? "#fff" : c.muted, boxShadow: selBranch && selName ? `0 5px 20px ${dark ? "rgba(99,102,241,0.3)" : "rgba(79,70,229,0.18)"}` : "none", transition: "all 0.18s" }}>
                  {selName ? `Enter as ${selName.split(" ")[0]} →` : "Select your name to continue"}
                </button>
                <button onClick={() => setAdminBox(true)} style={{ width: "100%", marginTop: 9, padding: "6px 0", background: "transparent", border: "none", color: c.muted, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Admin / Reporting Officer →
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setAdminBox(false); setAdminIn(""); setPwErr(false); }} style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 12, marginBottom: 14, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>← Back</button>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 9 }}>ADMIN / REPORTING OFFICER</p>
                <input type="password" placeholder="Enter admin password" value={adminIn}
                  onChange={e => { setAdminIn(e.target.value); setPwErr(false); }}
                  onKeyDown={e => e.key === "Enter" && enterAdmin()}
                  style={{ ...inp, marginBottom: 5, borderColor: pwErr ? "rgba(239,68,68,0.5)" : c.inputBdr }} />
                {pwErr && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 7 }}>Incorrect password.</p>}
                <button onClick={enterAdmin} style={{ width: "100%", padding: "12px 0", marginTop: 7, background: `linear-gradient(135deg,${c.accent},#4338ca)`, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Enter as Admin
                </button>
                <p style={{ textAlign: "center", marginTop: 9, fontSize: 11, color: c.muted }}>Contact your admin for the password</p>
              </>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 48 }}>
            {[["📌 How to Earn Points", "rubrics"], ["🎁 Prize Catalogue", "catalogue"]].map(([lbl, sc]) => (
              <button key={sc} onClick={() => setScreen(sc)}
                style={{ padding: "11px 10px", borderRadius: 8, border: `1px solid ${c.border}`, background: c.surface, color: c.sub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                {lbl}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${c.div},transparent)`, marginBottom: 44 }} />

          {/* Standings */}
          <div className="up">
            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, textAlign: "center", marginBottom: 4 }}>LIVE STANDINGS</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, textAlign: "center", marginBottom: 24, color: c.text }}>Current Top 3</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 9, marginBottom: 24 }}>
              {pod.map((o, i) => !o ? <div key={i} /> : (
                <div key={o.id} style={{ ...card, padding: podP[i] === 1 ? "20px 12px" : "14px 10px", textAlign: "center", border: podP[i] === 1 ? `1px solid ${c.gold}` : `1px solid ${c.border}`, background: podP[i] === 1 ? (dark ? "rgba(255,215,0,0.022)" : "rgba(255,248,210,0.4)") : c.surface }}>
                  <div style={{ fontSize: podP[i] === 1 ? 28 : 20, marginBottom: 6 }}>{podM[i]}</div>
                  <div style={{ width: podP[i] === 1 ? 44 : 36, height: podP[i] === 1 ? 44 : 36, borderRadius: "50%", background: podG[i], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 11, fontWeight: 700, color: "#000" }}>{initials(o.name)}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: c.text, lineHeight: 1.2, marginBottom: 2 }}>{o.name}</div>
                  <div style={{ fontSize: 9, color: c.sub, marginBottom: 8, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: podP[i] === 1 ? 24 : 18, fontWeight: 800, color: podC[i] }}>{o.total_points}</div>
                  <div style={{ fontSize: 9, color: c.muted, marginBottom: 5 }}>pts</div>
                  <div style={{ fontSize: 9, color: "#d4a017" }}>★ Special Prize</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 4 }}>BRANCH STANDINGS</p>
            <p style={{ fontSize: 11, color: c.muted, marginBottom: 11 }}>Ranked by average points per officer — all branches compete equally.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {unitScores.map((u, i) => (
                <div key={u.unit} style={{ ...card, padding: "11px 15px", display: "flex", alignItems: "center", gap: 9, border: i === 0 ? `1px solid ${c.gold}` : `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 15 }}>{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣"][i]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? "#d4a017" : c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.unit}</div>
                    <div style={{ fontSize: 9, color: c.muted }}>{u.count} officers · {u.total} total pts</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: i === 0 ? "#d4a017" : c.accent }}>{u.avg}</div>
                    <div style={{ fontSize: 9, color: c.muted }}>avg pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Portal ────────────────────────────────────────────────────────────────
  const OTABS = [
    { id: "submit",      label: "📝 Log Activity" },
    { id: "leaderboard", label: "📊 Leaderboard" },
    { id: "mylog",       label: `📋 My Log${mySubs.length ? ` (${mySubs.length})` : ""}` },
    { id: "prizes",      label: "🎁 Prizes" },
  ];
  const ATABS = [
    { id: "leaderboard", label: "📊 Leaderboard" },
    { id: "approvals",   label: `✅ Approvals${pending.length ? ` (${pending.length})` : ""}` },
    { id: "redemptions", label: `🎁 Redemptions${pendingR.length ? ` (${pendingR.length})` : ""}` },
    { id: "settings",    label: "⚙️ Settings" },
  ];
  const TABS = isAdmin ? ATABS : OTABS;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />

      {toast && <div style={{ position: "fixed", top: 14, right: 14, zIndex: 9999, padding: "10px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, background: toast.type === "err" ? "#dc2626" : "#15803d", color: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.28)", animation: "toastIn 0.22s ease", maxWidth: 280 }}>{toast.text}</div>}

      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(8px)", padding: 18 }}>
          <div style={{ ...card, width: "100%", maxWidth: 320, padding: 26, textAlign: "center", border: `1px solid ${confirm.color}55`, animation: "pop 0.3s ease", boxShadow: `0 14px 44px ${c.shadow}` }}>
            <div style={{ fontSize: 48, marginBottom: 11 }}>{confirm.icon}</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, color: confirm.color, marginBottom: 4 }}>{confirm.name}</h3>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 4 }}>{confirm.desc}</p>
            <p style={{ color: c.muted, fontSize: 11, lineHeight: 1.65, marginBottom: 20 }}>Costs <strong style={{ color: confirm.color }}>{confirm.cost} pts</strong>. You'll have <strong style={{ color: c.text }}>{myAvail - confirm.cost} pts</strong> left. Collect from admin once approved.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => redeemP(confirm)} style={{ flex: 1, padding: "11px 0", background: confirm.color, color: "#000", fontWeight: 700, fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Confirm</button>
              <button onClick={() => setConfirm(null)} style={{ padding: "11px 14px", background: c.blank, border: `1px solid ${c.border}`, color: c.sub, fontSize: 13, borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 14px", display: "flex", alignItems: "center", gap: 6, height: 50 }}>
          <button onClick={() => setScreen("landing")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 0 }}>
            <span style={{ fontSize: 17 }}>🏆</span>
          </button>
          <div style={{ display: "flex", gap: 1, flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ padding: "5px 11px", borderRadius: 6, border: `1px solid ${tab === tb.id ? c.borderA : "transparent"}`, background: tab === tb.id ? c.chipSel : "transparent", color: tab === tb.id ? c.accentL : c.sub, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif", transition: "all 0.13s" }}>
                {tb.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            {!isAdmin && myOf && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, color: c.accent, fontWeight: 800, lineHeight: 1 }}>{myAvail} <span style={{ fontSize: 8, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: c.muted }}>PTS</span></div>
                <div style={{ fontSize: 9, color: c.muted }}>#{myRank}</div>
              </div>
            )}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isAdmin ? "linear-gradient(135deg,#f59e0b,#d97706)" : `linear-gradient(135deg,${c.accent},#4338ca)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {isAdmin ? "AD" : (user ? initials(user.name) : "?")}
            </div>
            <button onClick={() => { setScreen("landing"); setSelBranch(""); setSelName(""); setAdminIn(""); setAdminBox(false); }}
              style={{ padding: "3px 9px", background: c.blank, border: `1px solid ${c.border}`, borderRadius: 5, color: c.sub, cursor: "pointer", fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}>
              Switch
            </button>
            <Toggle />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "22px 14px 60px" }}>

        {/* Log Activity */}
        {tab === "submit" && !isAdmin && (
          <div className="up" style={{ maxWidth: 540 }}>
            <div style={{ ...card, padding: "13px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 11, border: `1px solid ${c.infoBdr}`, background: c.infoBg }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${c.accent},#4338ca)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user ? initials(user.name) : "?"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: c.text }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: c.sub }}>{user?.unit}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, color: c.accent, fontWeight: 800, lineHeight: 1 }}>{myAvail}</div>
                <div style={{ fontSize: 9, color: c.muted }}>available pts</div>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 4, color: c.text }}>Log an Activity</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 18, lineHeight: 1.6 }}>Select what you did — points are awarded once your Reporting Officer approves.</p>

            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 9 }}>SELECT ACTIVITY *</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {RUBRICS.map(r => {
                const sel = form.rubricId === String(r.id);
                return (
                  <div key={r.id} onClick={() => setForm(p => ({ ...p, rubricId: String(r.id) }))}
                    style={{ padding: "10px 11px", borderRadius: 8, cursor: "pointer", border: `1px solid ${sel ? c.accent : c.border}`, background: sel ? c.chipSel : c.chip, display: "flex", alignItems: "center", gap: 7, transition: "all 0.12s" }}>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: sel ? (dark ? "#e0e7ff" : c.accent) : c.text, lineHeight: 1.3 }}>{r.activity}</span>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 800, color: sel ? c.accent : c.muted, flexShrink: 0 }}>+{r.points}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ ...card, padding: 18 }}>
              <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 6 }}>DATE *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ ...inp, marginBottom: 14 }} />
              <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 6 }}>DESCRIPTION / EVIDENCE *</label>
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder='e.g. Attended "Leadership in Action" workshop, full day.' rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.6, marginBottom: 14 }} />
              {form.rubricId && (
                <div style={{ padding: "10px 13px", background: c.infoBg, border: `1px solid ${c.infoBdr}`, borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: c.sub }}>Points upon approval</span>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: c.accent }}>+{RUBRICS.find(r => r.id === parseInt(form.rubricId))?.points}</span>
                </div>
              )}
              <button onClick={submitAct} disabled={!form.rubricId || !form.date || !form.desc.trim()}
                style={{ width: "100%", padding: "12px 0", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "none", cursor: form.rubricId && form.date && form.desc.trim() ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", background: form.rubricId && form.date && form.desc.trim() ? `linear-gradient(135deg,${c.accent},#4338ca)` : c.blank, color: form.rubricId && form.date && form.desc.trim() ? "#fff" : c.muted, transition: "all 0.17s" }}>
                Submit for Approval →
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {tab === "leaderboard" && (
          <div className="up">
            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 14 }}>TOP 3 OFFICERS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 9, maxWidth: 520, marginBottom: 24 }}>
              {[sorted[1], sorted[0], sorted[2]].map((o, i) => {
                if (!o) return <div key={i} />;
                const pos = [2, 1, 3][i];
                const grd = ["linear-gradient(135deg,#b0b8c8,#8a9ab0)", "linear-gradient(135deg,#FFD700,#d97706)", "linear-gradient(135deg,#cd7f32,#92400e)"][i];
                const col = ["#9ca3af", "#d4a017", "#b87333"][i];
                const isMe = user && o.id === user.id;
                return (
                  <div key={o.id} style={{ ...card, padding: pos === 1 ? "18px 11px" : "13px 9px", textAlign: "center", border: isMe ? `1px solid ${c.accent}` : pos === 1 ? `1px solid ${c.gold}` : `1px solid ${c.border}`, background: pos === 1 ? (dark ? "rgba(255,215,0,0.022)" : "rgba(255,248,210,0.38)") : c.surface }}>
                    <div style={{ fontSize: pos === 1 ? 28 : 20, marginBottom: 6 }}>{["🥈","🥇","🥉"][i]}</div>
                    <div style={{ width: pos === 1 ? 42 : 34, height: pos === 1 ? 42 : 34, borderRadius: "50%", background: grd, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 10, fontWeight: 700, color: "#000" }}>{initials(o.name)}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>{o.name}</div>
                    <div style={{ fontSize: 9, color: c.sub, margin: "3px 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: pos === 1 ? 22 : 17, fontWeight: 800, color: col }}>{o.total_points}</div>
                    <div style={{ fontSize: 9, color: c.muted, marginBottom: 4 }}>pts</div>
                    <div style={{ fontSize: 9, color: "#d4a017" }}>★ Special Prize</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr min(260px,38%)", gap: 18 }}>
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 11 }}>ALL OFFICERS</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {sorted.slice(3).map((o, i) => {
                    const isMe = user && o.id === user.id;
                    return (
                      <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderBottom: `1px solid ${c.border}`, background: isMe ? c.infoBg : "transparent" }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, color: c.muted, width: 22, flexShrink: 0 }}>#{i + 4}</span>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: c.blank, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c.sub, flexShrink: 0 }}>{initials(o.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "flex", alignItems: "center", gap: 5 }}>
                            {o.name}
                            {isMe && <span style={{ fontSize: 9, color: c.accent, background: c.infoBg, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: 9, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                        </div>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: c.accent }}>{o.total_points}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 4 }}>BRANCH STANDINGS</p>
                <p style={{ fontSize: 9, color: c.muted, marginBottom: 10 }}>Avg pts per officer</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {unitScores.map((u, i) => (
                    <div key={u.unit} style={{ ...card, padding: "10px 12px", display: "flex", alignItems: "center", gap: 7, border: i === 0 ? `1px solid ${c.gold}` : `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 13 }}>{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣"][i]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? "#d4a017" : c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.unit}</div>
                        <div style={{ fontSize: 8, color: c.muted }}>{u.count} officers</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: i === 0 ? "#d4a017" : c.accent }}>{u.avg}</div>
                        <div style={{ fontSize: 8, color: c.muted }}>avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Log */}
        {tab === "mylog" && !isAdmin && (
          <div className="up" style={{ maxWidth: 600 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 4, color: c.text }}>My Activity Log</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 20 }}>Track your submitted activities and approval status.</p>
            {mySubs.length === 0 ? (
              <div style={{ ...card, padding: 44, textAlign: "center" }}>
                <div style={{ fontSize: 34, marginBottom: 9 }}>📭</div>
                <div style={{ color: c.sub, fontSize: 13, marginBottom: 14 }}>No activities logged yet.</div>
                <Btn ch="Log your first activity →" onClick={() => setTab("submit")} v="ghost" sz="sm" />
              </div>
            ) : mySubs.map(s => (
              <div key={s.id} style={{ ...card, padding: "13px 16px", display: "flex", alignItems: "center", gap: 11, marginBottom: 7 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                  <div style={{ fontSize: 10, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                </div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, color: c.accent, flexShrink: 0, marginRight: 5 }}>+{s.points}</span>
                <Pill status={s.status} />
              </div>
            ))}
          </div>
        )}

        {/* Prizes */}
        {tab === "prizes" && !isAdmin && (
          <div className="up">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 3, color: c.text }}>Prize Catalogue</h2>
                <p style={{ color: c.sub, fontSize: 12 }}>Spend your points — your choice.</p>
              </div>
              <div style={{ ...card, padding: "11px 16px", textAlign: "center", border: `1px solid ${c.borderA}` }}>
                <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1.5, marginBottom: 2 }}>AVAILABLE POINTS</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{myAvail}</div>
                <div style={{ fontSize: 9, color: c.muted, marginTop: 2 }}>{myOf?.total_points} earned · {mySpent} spent</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {cats.map(ct => <button key={ct} onClick={() => setCatF(ct)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${catF === ct ? c.accent : c.border}`, background: catF === ct ? c.chipSel : c.surface, color: catF === ct ? c.accentL : c.sub, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{ct}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 10, marginBottom: 22 }}>
              {catItems.map(p => {
                const can = myAvail >= p.cost;
                return (
                  <div key={p.id} onClick={() => can && !p.tba && setConfirm(p)}
                    style={{ ...card, padding: "15px 14px", position: "relative", opacity: can ? 1 : 0.44, cursor: can && !p.tba ? "pointer" : "default" }}>
                    {p.tba && <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 6px", borderRadius: 5, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)", fontSize: 9, color: "#ec4899", fontWeight: 700 }}>TBA</div>}
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
                    <div style={{ fontSize: 9, color: p.color, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{p.cat.toUpperCase()}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: c.sub, marginBottom: 12, lineHeight: 1.5 }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: can ? p.color : c.muted }}>{p.cost} <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 400 }}>pts</span></div>
                      {can && !p.tba ? <div style={{ padding: "3px 9px", borderRadius: 5, background: `${p.color}1a`, border: `1px solid ${p.color}40`, color: p.color, fontSize: 10, fontWeight: 700 }}>REDEEM</div>
                        : !can ? <div style={{ fontSize: 9, color: c.muted }}>{p.cost - myAvail} more</div>
                          : <div style={{ fontSize: 9, color: c.muted }}>Soon</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <SpecialSection c={c} dark={dark} card={card} />
          </div>
        )}

        {/* Admin: Approvals */}
        {tab === "approvals" && isAdmin && (
          <div className="up" style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 4, color: c.text }}>Activity Approvals</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 20 }}>Approve or reject officer activity submissions.</p>
            {pending.length === 0 ? <EmptyBox icon="✨" msg="All caught up — no pending submissions." c={c} card={card} /> : pending.map(s => (
              <div key={s.id} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, color: c.accentL, fontWeight: 700 }}>{s.officer_name}</span>
                    <span style={{ fontSize: 9, color: c.muted }}>·</span>
                    <span style={{ fontSize: 11, color: c.sub }}>{s.unit}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                  <div style={{ fontSize: 10, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                </div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, color: "#d4a017", flexShrink: 0 }}>+{s.points}</span>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <Btn ch="✓ Approve" v="success" sz="sm" onClick={() => approve(s.id)} />
                  <Btn ch="✗" v="danger" sz="sm" onClick={() => reject(s.id)} />
                </div>
              </div>
            ))}
            {subs.filter(s => s.status !== "pending").length > 0 && (
              <div style={{ marginTop: 22 }}>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 9 }}>HISTORY</p>
                {subs.filter(s => s.status !== "pending").map(s => (
                  <div key={s.id} style={{ ...card, padding: "10px 14px", display: "flex", alignItems: "center", gap: 9, opacity: 0.58, marginBottom: 5 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{s.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {s.activity}</span></div>
                    </div>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, color: c.accent, flexShrink: 0 }}>+{s.points}</span>
                    <Pill status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin: Redemptions */}
        {tab === "redemptions" && isAdmin && (
          <div className="up" style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 4, color: c.text }}>Prize Redemptions</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 20 }}>Fulfil or reject officer prize redemption requests.</p>
            {pendingR.length === 0 ? <EmptyBox icon="🎁" msg="No pending redemptions." c={c} card={card} /> : pendingR.map(r => (
              <div key={r.id} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{r.prize_icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, color: c.accentL, fontWeight: 700 }}>{r.officer_name}</span>
                    <span style={{ fontSize: 9, color: c.muted }}>·</span>
                    <span style={{ fontSize: 11, color: c.sub }}>{r.unit}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{r.prize_name}</div>
                </div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, color: "#f59e0b", flexShrink: 0 }}>{r.cost} pts</span>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <Btn ch="✓ Fulfil" v="success" sz="sm" onClick={() => fulfilR(r.id, r.officer_name)} />
                  <Btn ch="✗" v="danger" sz="sm" onClick={() => rejectR(r.id)} />
                </div>
              </div>
            ))}
            {redems.filter(r => r.status !== "pending").length > 0 && (
              <div style={{ marginTop: 22 }}>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 9 }}>HISTORY</p>
                {redems.filter(r => r.status !== "pending").map(r => (
                  <div key={r.id} style={{ ...card, padding: "10px 14px", display: "flex", alignItems: "center", gap: 9, opacity: 0.58, marginBottom: 5 }}>
                    <span style={{ fontSize: 16 }}>{r.prize_icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{r.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {r.prize_name}</span></div>
                    </div>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, color: "#f59e0b", flexShrink: 0 }}>{r.cost} pts</span>
                    <Pill status={r.status === "fulfilled" ? "approved" : "rejected"} label={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin: Settings */}
        {tab === "settings" && isAdmin && (
          <div className="up" style={{ maxWidth: 580 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, marginBottom: 4, color: c.text }}>Settings</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 26 }}>Manage officers, branches, and admin password.</p>

            <Sec label="ADD NEW OFFICER" c={c}>
              <div style={{ ...card, padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 11 }}>
                  <div>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5 }}>Full Name</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Tan" style={{ ...inp }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5 }}>Branch</label>
                    <select value={newBr} onChange={e => setNewBr(e.target.value)} style={{ ...inp }}>
                      <option value="">Select branch…</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <Btn ch={sLoading ? "Adding…" : "Add Officer"} v="primary" onClick={addOfficer} disabled={!newName.trim() || !newBr || sLoading} />
              </div>
            </Sec>

            <Sec label={`ALL OFFICERS (${officers.length})`} c={c}>
              <div style={{ ...card, overflow: "hidden" }}>
                {branches.map(br => {
                  const bOfs = byBranch[br.name] || [];
                  if (!bOfs.length) return null;
                  return (
                    <div key={br.id}>
                      <div style={{ padding: "7px 14px", background: dark ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.025)", borderBottom: `1px solid ${c.border}` }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, color: c.muted, letterSpacing: 1.5 }}>{br.name.toUpperCase()}</span>
                      </div>
                      {bOfs.map(o => (
                        <div key={o.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                          {editOf?.id === o.id ? (
                            <div style={{ padding: "13px 14px", background: c.infoBg }}>
                              <p style={{ fontSize: 10, color: c.accentL, fontWeight: 600, marginBottom: 9 }}>Editing: {editOf.name}</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 9 }}>
                                <div>
                                  <label style={{ fontSize: 9, color: c.muted, display: "block", marginBottom: 4 }}>FULL NAME</label>
                                  <input value={editN} onChange={e => setEditN(e.target.value)} style={{ ...inp, padding: "8px 10px", fontSize: 12 }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 9, color: c.muted, display: "block", marginBottom: 4 }}>BRANCH</label>
                                  <select value={editB} onChange={e => setEditB(e.target.value)} style={{ ...inp, padding: "8px 10px", fontSize: 12 }}>
                                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Btn ch={sLoading ? "Saving…" : "Save Changes"} v="primary" sz="sm" onClick={saveEdit} disabled={!editN.trim() || sLoading} />
                                <Btn ch="Cancel" v="ghost" sz="sm" onClick={cancelEdit} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px" }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: c.blank, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c.sub, flexShrink: 0 }}>{initials(o.name)}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{o.name}</div>
                                <div style={{ fontSize: 9, color: c.muted }}>{o.total_points} pts</div>
                              </div>
                              <Btn ch="✏️ Edit" v="ghost" sz="sm" onClick={() => startEdit(o)} disabled={sLoading} />
                              <Btn ch="Remove" v="danger" sz="sm" onClick={() => removeOfficer(o.id, o.name)} disabled={sLoading} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Sec>

            <Sec label="MANAGE BRANCHES" c={c}>
              <div style={{ ...card, padding: 16, marginBottom: 9 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5 }}>New Branch Name</label>
                    <input value={newBrName} onChange={e => setNewBrName(e.target.value)} placeholder="e.g. Operations" style={{ ...inp }} />
                  </div>
                  <Btn ch="Add" v="primary" onClick={addBranch} disabled={!newBrName.trim() || sLoading} />
                </div>
              </div>
              <div style={{ ...card, overflow: "hidden" }}>
                {branches.map(br => (
                  <div key={br.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{br.name}</div>
                      <div style={{ fontSize: 9, color: c.muted }}>{(byBranch[br.name] || []).length} officers</div>
                    </div>
                    <Btn ch="Remove" v="danger" sz="sm" onClick={() => removeBranch(br.id, br.name)} disabled={sLoading} />
                  </div>
                ))}
              </div>
            </Sec>

            <Sec label="CHANGE ADMIN PASSWORD" c={c}>
              <div style={{ ...card, padding: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5 }}>New Password (min 6 characters)</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" style={{ ...inp }} />
                  </div>
                  <Btn ch="Update" v="primary" onClick={changePw} disabled={newPw.length < 6 || sLoading} />
                </div>
              </div>
            </Sec>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function MiniNav({ c, Toggle, onBack }) {
  return (
    <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", height: 50, justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 17 }}>🏆</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: c.text }}>TRACOM Nova</span>
          </div>
        </div>
        <Toggle />
      </div>
    </div>
  );
}

function Sec({ label, children, c }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, color: c.muted, letterSpacing: 2, marginBottom: 10 }}>{label}</p>
      {children}
    </div>
  );
}

function StaticPrizeCard({ p, c, card }) {
  return (
    <div style={{ ...card, padding: "15px 14px", position: "relative" }}>
      {p.tba && <div style={{ position: "absolute", top: 8, right: 8, padding: "2px 6px", borderRadius: 5, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)", fontSize: 9, color: "#ec4899", fontWeight: 700 }}>TBA</div>}
      <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
      <div style={{ fontSize: 9, color: p.color, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{p.cat.toUpperCase()}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 3 }}>{p.name}</div>
      <div style={{ fontSize: 11, color: c.sub, marginBottom: 11, lineHeight: 1.5 }}>{p.desc}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: p.color }}>{p.cost} <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: c.muted }}>pts</span></div>
    </div>
  );
}

function SpecialSection({ c, dark, card }) {
  return (
    <div style={{ ...card, padding: 18, border: `1px solid ${dark ? "rgba(255,215,0,0.15)" : "rgba(180,130,0,0.2)"}` }}>
      <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, color: "#d4a017", letterSpacing: 2, marginBottom: 13 }}>★ SPECIAL PRIZES — MINI-RETREAT CEREMONY</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {[{ icon: "🥇🥈🥉", title: "Top 3 Officers", desc: "Exclusive prize + public recognition at Mini-Retreat" }, { icon: "🏢", title: "Top Branch", desc: "Branch trophy + special mention at Mini-Retreat" }].map(item => (
          <div key={item.title} style={{ padding: "13px 14px", background: dark ? "rgba(255,215,0,0.028)" : "rgba(255,248,200,0.28)", border: `1px solid ${dark ? "rgba(255,215,0,0.08)" : "rgba(180,130,0,0.12)"}`, borderRadius: 9 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyBox({ icon, msg, c, card }) {
  return (
    <div style={{ ...card, padding: 44, textAlign: "center", marginBottom: 22 }}>
      <div style={{ fontSize: 34, marginBottom: 9 }}>{icon}</div>
      <div style={{ color: c.sub, fontSize: 13 }}>{msg}</div>
    </div>
  );
}
