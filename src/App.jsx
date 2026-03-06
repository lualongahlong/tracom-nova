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
  { id: "v1", cat: "Vouchers",    name: "NTUC FairPrice $10",   desc: "$10 grocery voucher",      cost: 40,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v2", cat: "Vouchers",    name: "Grab $10",             desc: "$10 ride / food credits",  cost: 40,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v3", cat: "Vouchers",    name: "NTUC FairPrice $25",   desc: "$25 grocery voucher",      cost: 90,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v4", cat: "Vouchers",    name: "Grab $25",             desc: "$25 ride / food credits",  cost: 90,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v5", cat: "Vouchers",    name: "Shopping Voucher $50", desc: "Capitaland / Lazada",      cost: 180, icon: "🛍️", color: "#a855f7", tba: false },
  { id: "l1", cat: "Leave",       name: "Half-Day Off-in-Lieu", desc: "Take half a day off",      cost: 60,  icon: "🌅", color: "#06b6d4", tba: false },
  { id: "l2", cat: "Leave",       name: "Full-Day Off-in-Lieu", desc: "Take a full day off",      cost: 110, icon: "🏖️", color: "#06b6d4", tba: false },
  { id: "p1", cat: "Coming Soon", name: "Mystery Prize A",      desc: "To be announced",          cost: 50,  icon: "🎁", color: "#ec4899", tba: true },
  { id: "p2", cat: "Coming Soon", name: "Mystery Prize B",      desc: "To be announced",          cost: 120, icon: "🎁", color: "#ec4899", tba: true },
  { id: "p3", cat: "Coming Soon", name: "Mystery Prize C",      desc: "To be announced",          cost: 200, icon: "🎁", color: "#ec4899", tba: true },
];

const CAMPAIGN_END = new Date("2026-12-31");
const getCountdown = () => {
  const d = CAMPAIGN_END - new Date();
  if (d <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days:  Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    mins:  Math.floor((d % 3600000) / 60000),
    secs:  Math.floor((d % 60000) / 1000),
  };
};

const initials = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

// ── Themes ────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0a0a0a",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderA: "rgba(255,255,255,0.18)",
  text: "#f0f0f0",
  sub: "rgba(255,255,255,0.42)",
  muted: "rgba(255,255,255,0.2)",
  nav: "rgba(10,10,10,0.93)",
  accent: "#e8e8e8",
  accentL: "#ffffff",
  chip: "rgba(255,255,255,0.04)",
  chipSel: "rgba(255,255,255,0.09)",
  inputBg: "rgba(255,255,255,0.05)",
  inputBdr: "rgba(255,255,255,0.09)",
  div: "rgba(255,255,255,0.06)",
  blank: "rgba(255,255,255,0.05)",
  infoBg: "rgba(255,255,255,0.03)",
  infoBdr: "rgba(255,255,255,0.09)",
  shadow: "rgba(0,0,0,0.5)",
  gold: "rgba(255,200,60,0.18)",
  goldText: "#d4a017",
};
const LITE = {
  bg: "#f5f5f5",
  surface: "#ffffff",
  surfaceHover: "#fafafa",
  border: "rgba(0,0,0,0.07)",
  borderA: "rgba(0,0,0,0.16)",
  text: "#111111",
  sub: "rgba(0,0,0,0.42)",
  muted: "rgba(0,0,0,0.26)",
  nav: "rgba(245,245,245,0.96)",
  accent: "#1a1a1a",
  accentL: "#111111",
  chip: "rgba(0,0,0,0.04)",
  chipSel: "rgba(0,0,0,0.07)",
  inputBg: "#ffffff",
  inputBdr: "rgba(0,0,0,0.09)",
  div: "rgba(0,0,0,0.06)",
  blank: "rgba(0,0,0,0.04)",
  infoBg: "rgba(0,0,0,0.02)",
  infoBdr: "rgba(0,0,0,0.07)",
  shadow: "rgba(0,0,0,0.07)",
  gold: "rgba(160,120,0,0.12)",
  goldText: "#a07000",
};

export default function App() {
  const [dark, setDark] = useState(true);
  const c = dark ? DARK : LITE;

  const [branches, setBranches] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [subs, setSubs]         = useState([]);
  const [redems, setRedems]     = useState([]);
  const [snaps, setSnaps]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dbErr, setDbErr]       = useState(null);
  const [adminPwd, setAdminPwd] = useState("admin1234");

  const [screen, setScreen]   = useState("landing");
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab]         = useState("leaderboard");
  const [cd, setCd]           = useState(getCountdown());
  const [toast, setToast]     = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [selBranch, setSelBranch] = useState("");
  const [selName, setSelName]     = useState("");
  const [adminBox, setAdminBox]   = useState(false);
  const [adminIn, setAdminIn]     = useState("");
  const [pwErr, setPwErr]         = useState(false);

  const [form, setForm]         = useState({ rubricId: "", date: "", desc: "" });
  const [catF, setCatF]         = useState("All");
  const [top3Mode, setTop3Mode] = useState("individual");

  const [newName, setNewName]     = useState("");
  const [newBr, setNewBr]         = useState("");
  const [newBrName, setNewBrName] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [sLoading, setSLoading]   = useState(false);
  const [editOf, setEditOf]       = useState(null);
  const [editN, setEditN]         = useState("");
  const [editB, setEditB]         = useState("");

  const takeSnapshotIfNeeded = useCallback(async (officerList) => {
    if (!officerList.length) return;
    if (new Date().getDay() !== 1) return;
    const monday = new Date(); monday.setHours(0,0,0,0);
    const weekStr = monday.toISOString().split("T")[0];
    try {
      const existing = await db.get("leaderboard_snapshots", `week_start=eq.${weekStr}&limit=1`);
      if (existing?.length) return;
      const sorted = [...officerList].sort((a,b) => b.total_points - a.total_points);
      for (const [i, o] of sorted.entries()) {
        await db.post("leaderboard_snapshots", { officer_id: o.id, officer_name: o.name, unit: o.unit, total_points: o.total_points, rank: i + 1, week_start: weekStr });
      }
    } catch(e) { console.warn("Snapshot failed", e.message); }
  }, []);

  const load = useCallback(async () => {
    try {
      setDbErr(null);
      const [br, of, su, re, cfg, snp] = await Promise.all([
        db.get("branches", "order=name.asc"),
        db.get("officers", "order=total_points.desc&select=*,branches(name)"),
        db.get("submissions", "order=created_at.desc"),
        db.get("redemptions", "order=created_at.desc"),
        db.get("config", "key=eq.admin_password"),
        db.get("leaderboard_snapshots", "order=week_start.desc"),
      ]);
      const officersMapped = (of || []).map(o => ({ ...o, unit: o.branches?.name || "" }));
      setBranches(br || []);
      setOfficers(officersMapped);
      setSubs(su || []);
      setRedems(re || []);
      setSnaps(snp || []);
      if (cfg?.[0]) setAdminPwd(cfg[0].value);
      await takeSnapshotIfNeeded(officersMapped);
    } catch (e) { setDbErr(e.message); }
    finally { setLoading(false); }
  }, [takeSnapshotIfNeeded]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setCd(getCountdown()), 1000); return () => clearInterval(id); }, []);

  const msg = (text, type = "ok") => { setToast({ text, type }); setTimeout(() => setToast(null), 3200); };

  const sorted     = [...officers].sort((a, b) => b.total_points - a.total_points);
  const unitScores = branches.map(br => {
    const ofs = officers.filter(o => o.unit === br.name);
    const total = ofs.reduce((s, o) => s + o.total_points, 0);
    return { unit: br.name, total, count: ofs.length, avg: ofs.length ? Math.round(total / ofs.length) : 0 };
  }).sort((a, b) => b.avg - a.avg);
  const byBranch  = branches.reduce((a, br) => { a[br.name] = officers.filter(o => o.unit === br.name); return a; }, {});
  const pending   = subs.filter(s => s.status === "pending");
  const pendingR  = redems.filter(r => r.status === "pending");
  const myOf      = user ? officers.find(o => o.id === user.id) : null;
  const mySpent   = user ? redems.filter(r => r.officer_id === user.id && r.status !== "rejected").reduce((s, r) => s + r.cost, 0) : 0;
  const myAvail   = myOf ? myOf.total_points - mySpent : 0;
  const myRank    = user ? sorted.findIndex(o => o.id === user.id) + 1 : null;
  const mySubs    = user ? subs.filter(s => s.officer_id === user.id) : [];
  const cats      = ["All", ...Array.from(new Set(CATALOGUE.map(p => p.cat)))];
  const catItems  = catF === "All" ? CATALOGUE : CATALOGUE.filter(p => p.cat === catF);

  const getMovement = (officerId, currentRank) => {
    const weeks = [...new Set(snaps.map(s => s.week_start))].sort().reverse();
    if (!weeks.length) return null;
    const lastWeek = snaps.filter(s => s.week_start === weeks[0]);
    const prev = lastWeek.find(s => s.officer_id === officerId);
    if (!prev) return null;
    const rankDiff = prev.rank - currentRank;
    const ptsDiff  = (officers.find(o => o.id === officerId)?.total_points || 0) - prev.total_points;
    return { rankDiff, ptsDiff };
  };

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
  const reject   = async (id) => { try { await db.patch("submissions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected."); await load(); } catch (e) { msg(e.message, "err"); } };
  const redeemP  = async (p) => {
    try {
      await db.post("redemptions", { officer_id: user.id, officer_name: user.name, unit: user.unit, prize_name: p.name, prize_icon: p.icon, cost: p.cost, status: "pending" });
      setConfirm(null); msg("🎁 Redemption submitted!"); await load();
    } catch (e) { msg(e.message, "err"); }
  };
  const fulfilR  = async (id, name) => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "fulfilled" }); msg(`🎁 Fulfilled for ${name}`); await load(); } catch (e) { msg(e.message, "err"); } };
  const rejectR  = async (id) => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected.", "err"); await load(); } catch (e) { msg(e.message, "err"); } };

  const addOfficer    = async () => { if (!newName.trim() || !newBr) return; setSLoading(true); try { const br = branches.find(b => b.name === newBr); await db.post("officers", { name: newName.trim(), branch_id: br.id, total_points: 0 }); setNewName(""); setNewBr(""); msg(`✅ ${newName} added`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeOfficer = async (id, name) => { if (!window.confirm(`Remove ${name}?`)) return; setSLoading(true); try { await db.del("submissions", `officer_id=eq.${id}`); await db.del("redemptions", `officer_id=eq.${id}`); await db.del("officers", `id=eq.${id}`); msg(`${name} removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const startEdit     = (o) => { setEditOf(o); setEditN(o.name); setEditB(o.unit); };
  const cancelEdit    = () => { setEditOf(null); setEditN(""); setEditB(""); };
  const saveEdit      = async () => { if (!editN.trim() || !editB) return; setSLoading(true); try { const br = branches.find(b => b.name === editB); await db.patch("officers", `id=eq.${editOf.id}`, { name: editN.trim(), branch_id: br.id }); if (editN !== editOf.name) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); } if (editB !== editOf.unit) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { unit: editB }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { unit: editB }); } msg(`✅ ${editN} updated`); cancelEdit(); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const addBranch     = async () => { if (!newBrName.trim()) return; setSLoading(true); try { await db.post("branches", { name: newBrName.trim() }); setNewBrName(""); msg("✅ Branch added"); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeBranch  = async (id, name) => { if (!window.confirm(`Remove "${name}"?`)) return; setSLoading(true); try { for (const o of (byBranch[name] || [])) { await db.del("submissions", `officer_id=eq.${o.id}`); await db.del("redemptions", `officer_id=eq.${o.id}`); await db.del("officers", `id=eq.${o.id}`); } await db.del("branches", `id=eq.${id}`); msg(`Branch "${name}" removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const changePw      = async () => { if (newPw.length < 6) { msg("Min 6 characters.", "err"); return; } setSLoading(true); try { await db.patch("config", "key=eq.admin_password", { value: newPw.trim() }); setAdminPwd(newPw.trim()); setNewPw(""); msg("✅ Password updated."); } catch (e) { msg(e.message, "err"); } setSLoading(false); };

  // ── Shared atoms ──────────────────────────────────────────────────────────
  const card = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
  };
  const inp = {
    width: "100%", padding: "10px 12px",
    background: c.inputBg, border: `1px solid ${c.inputBdr}`,
    borderRadius: 7, color: c.text, fontSize: 13,
    fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
  };

  const Btn = ({ ch, onClick, v = "primary", sz = "md", disabled = false }) => {
    const p = { sm: "5px 10px", md: "9px 16px", lg: "12px 22px" };
    const s = {
      primary: { bg: c.text,        col: dark ? "#0a0a0a" : "#ffffff", bdr: "none" },
      success: { bg: "transparent", col: "#4ade80", bdr: "1px solid rgba(74,222,128,0.22)" },
      danger:  { bg: "transparent", col: "#f87171", bdr: "1px solid rgba(248,113,113,0.22)" },
      ghost:   { bg: "transparent", col: c.sub,     bdr: `1px solid ${c.border}` },
    }[v] || {};
    return (
      <button onClick={onClick} disabled={disabled}
        style={{ padding: p[sz], background: disabled ? c.blank : s.bg, color: disabled ? c.muted : s.col, border: s.bdr, borderRadius: 6, cursor: disabled ? "default" : "pointer", fontWeight: 600, fontSize: sz === "sm" ? 11 : 13, fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1 }}>
        {ch}
      </button>
    );
  };

  const Toggle = () => (
    <button onClick={() => setDark(d => !d)}
      style={{ width: 34, height: 19, borderRadius: 10, border: `1px solid ${c.border}`, cursor: "pointer", background: "transparent", position: "relative", padding: 0, flexShrink: 0 }}>
      <span style={{ width: 13, height: 13, borderRadius: "50%", background: c.text, position: "absolute", top: 2, left: dark ? 2 : 17, transition: "left 0.18s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7 }}>
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );

  const Pill = ({ status, label }) => {
    const map = {
      approved: ["rgba(74,222,128,0.08)",  "#4ade80"],
      pending:  ["rgba(250,204,21,0.08)",  "#fbbf24"],
      rejected: ["rgba(248,113,113,0.08)", "#f87171"],
    };
    const [bg, col] = map[status] || map.pending;
    return (
      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: bg, color: col, whiteSpace: "nowrap", letterSpacing: 0.3 }}>
        {(label || status).toUpperCase()}
      </span>
    );
  };

  const CSS = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: ${c.bg}; min-height: 100vh; font-size: 16px; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
      input:focus, select:focus, textarea:focus { outline: none !important; border-color: ${c.borderA} !important; box-shadow: none !important; }
      input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1) opacity(0.3)" : "opacity(0.35)"}; cursor: pointer; }
      select option { background: ${dark ? "#111" : "#fff"}; color: ${c.text}; }
      @keyframes toastIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pop { 0%{transform:scale(0.93);opacity:0} 65%{transform:scale(1.01)} 100%{transform:scale(1);opacity:1} }
      @keyframes spin { to{transform:rotate(360deg)} }
      @keyframes up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      .up { animation: up 0.2s ease both; }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; padding: 52px 0 40px; }
      @media (max-width: 780px) { .two-col { grid-template-columns: 1fr !important; gap: 28px; padding: 28px 0 32px; } }
      .row-hover:hover { background: ${c.surfaceHover} !important; }
    `}</style>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <div style={{ width: 28, height: 28, border: `2px solid ${c.border}`, borderTop: `2px solid ${c.text}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <p style={{ color: c.muted, fontSize: 12 }}>Connecting…</p>
    </div>
  );

  if (dbErr) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
      <CSS />
      <div style={{ fontSize: 32 }}>⚠️</div>
      <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: c.text, fontWeight: 700 }}>Database Connection Error</h2>
      <p style={{ color: c.sub, fontSize: 13, maxWidth: 360, lineHeight: 1.65 }}>{dbErr}</p>
      <Btn ch="Retry" onClick={load} v="primary" />
    </div>
  );

  // ── Top Nav (Landing) ─────────────────────────────────────────────────────
  const LandingNav = () => (
    <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 52, justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, padding: "4px 12px", border: `1px solid ${c.border}`, borderRadius: 7, background: c.chip }}>
          <span style={{ fontSize: 14 }}>🏆</span>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: c.text, letterSpacing: 0.1 }}>GEAR Up</span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[["📌 How to Earn", "rubrics"], ["🎁 Prizes", "catalogue"]].map(([lbl, sc]) => (
            <button key={sc} onClick={() => setScreen(sc)}
              style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${c.border}`, background: "transparent", color: c.sub, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "all 0.12s" }}>
              {lbl}
            </button>
          ))}
        </div>
        <Toggle />
      </div>
    </div>
  );

  // ── Rubrics screen ────────────────────────────────────────────────────────
  if (screen === "rubrics") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <MiniNav c={c} Toggle={Toggle} onBack={() => setScreen("landing")} />
      <div className="up" style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px" }}>
        <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Points Guide</p>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: c.text }}>How to Earn Points</h2>
        <p style={{ color: c.sub, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>All eligible activities and their point values.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, ...card, overflow: "hidden" }}>
          {RUBRICS.map((r, i) => (
            <div key={r.id} style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 13, borderBottom: i < RUBRICS.length - 1 ? `1px solid ${c.border}` : "none" }}>
              <span style={{ fontSize: 18, flexShrink: 0, width: 28, textAlign: "center" }}>{r.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 400, lineHeight: 1.45, color: c.text }}>{r.activity}</span>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, color: c.text, lineHeight: 1 }}>{r.points}</div>
                <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1.5, marginTop: 2 }}>PTS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Catalogue screen ──────────────────────────────────────────────────────
  if (screen === "catalogue") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />
      <MiniNav c={c} Toggle={Toggle} onBack={() => setScreen("landing")} />
      <div className="up" style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px" }}>
        <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Rewards</p>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: c.text }}>Prize Catalogue</h2>
        <p style={{ color: c.sub, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Earn points, spend them on any prize below.</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 22 }}>
          {cats.map(ct => (
            <button key={ct} onClick={() => setCatF(ct)}
              style={{ padding: "5px 12px", borderRadius: 5, border: `1px solid ${catF === ct ? c.borderA : c.border}`, background: catF === ct ? c.chipSel : "transparent", color: catF === ct ? c.text : c.sub, fontSize: 12, fontWeight: catF === ct ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.12s" }}>
              {ct}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10, marginBottom: 28 }}>
          {catItems.map(p => <StaticPrizeCard key={p.id} p={p} c={c} card={card} />)}
        </div>
        <SpecialSection c={c} dark={dark} card={card} />
      </div>
    </div>
  );

  // ── Landing ───────────────────────────────────────────────────────────────
  if (screen === "landing") {
    const podOrder = [sorted[1], sorted[0], sorted[2]];
    const podPos   = [2, 1, 3];
    const podMedal = ["🥈", "🥇", "🥉"];
    const podColor = ["#9ca3af", "#c9a227", "#b87333"];

    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
        <CSS />
        <LandingNav />

        <div style={{ maxWidth: 1160, width: "100%", margin: "0 auto", padding: "0 24px 80px" }}>
          <div className="two-col">

            {/* ── LEFT COLUMN ── */}
            <div className="up">
              {/* Title */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2.5, marginBottom: 12, textTransform: "uppercase" }}>Campaign 2026</p>
                <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.08, color: c.text, marginBottom: 14 }}>
                  GEAR Up<br />Challenge
                </h1>
                <p style={{ fontSize: 13, color: c.sub, lineHeight: 1.7, marginBottom: 6 }}>
                  Growth · Expertise · Autonomy · Readiness
                </p>
                <p style={{ fontSize: 12, color: c.muted, lineHeight: 1.6 }}>
                  Top 3 Officers &amp; Top Branch win special prizes at the Mini-Retreat ★
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: c.div, marginBottom: 32 }} />

              {/* Top 3 */}
              {sorted.length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, textTransform: "uppercase" }}>Current Top 3</p>
                    <div style={{ display: "flex", gap: 1, background: c.chip, border: `1px solid ${c.border}`, borderRadius: 6, padding: 3 }}>
                      {[["Individual", "individual"], ["Work Unit", "unit"]].map(([lbl, val]) => (
                        <button key={val} onClick={() => setTop3Mode(val)}
                          style={{ padding: "4px 11px", borderRadius: 4, border: "none", background: top3Mode === val ? c.surface : "transparent", color: top3Mode === val ? c.text : c.muted, fontSize: 11, fontWeight: top3Mode === val ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.12s", boxShadow: top3Mode === val ? `0 1px 3px ${c.shadow}` : "none" }}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  {top3Mode === "individual" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 8 }}>
                      {podOrder.map((o, i) => {
                        if (!o) return <div key={i} />;
                        const isFirst = podPos[i] === 1;
                        return (
                          <div key={o.id} style={{ ...card, padding: isFirst ? "22px 14px" : "16px 12px", textAlign: "center", border: isFirst ? `1px solid ${c.gold}` : `1px solid ${c.border}`, background: isFirst ? (dark ? "rgba(201,162,39,0.05)" : "rgba(255,248,210,0.5)") : c.surface }}>
                            <div style={{ fontSize: isFirst ? 28 : 22, marginBottom: 10 }}>{podMedal[i]}</div>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: isFirst ? 13 : 12, fontWeight: 700, color: c.text, lineHeight: 1.3, marginBottom: 3 }}>{o.name}</div>
                            <div style={{ fontSize: 10, color: c.sub, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: isFirst ? 22 : 17, fontWeight: 800, color: podColor[i], lineHeight: 1 }}>{o.total_points}</div>
                            <div style={{ fontSize: 9, color: c.muted, marginTop: 3 }}>pts</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {top3Mode === "unit" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 8 }}>
                      {[unitScores[1], unitScores[0], unitScores[2]].map((u, i) => {
                        if (!u) return <div key={i} />;
                        const isFirst = i === 1;
                        const uColor = ["#9ca3af", "#c9a227", "#b87333"][i];
                        const uMedal = ["🥈", "🥇", "🥉"][i];
                        return (
                          <div key={u.unit} style={{ ...card, padding: isFirst ? "22px 14px" : "16px 12px", textAlign: "center", border: isFirst ? `1px solid ${c.gold}` : `1px solid ${c.border}`, background: isFirst ? (dark ? "rgba(201,162,39,0.05)" : "rgba(255,248,210,0.5)") : c.surface }}>
                            <div style={{ fontSize: isFirst ? 28 : 22, marginBottom: 10 }}>{uMedal}</div>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: isFirst ? 13 : 12, fontWeight: 700, color: c.text, lineHeight: 1.3, marginBottom: 3 }}>{u.unit}</div>
                            <div style={{ fontSize: 10, color: c.sub, marginBottom: 6 }}>{u.count} officers</div>
                            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: isFirst ? 22 : 17, fontWeight: 800, color: uColor, lineHeight: 1 }}>{u.avg}</div>
                            <div style={{ fontSize: 9, color: c.muted, marginTop: 3 }}>avg pts</div>
                            <div style={{ fontSize: 9, color: c.muted, marginTop: 2 }}>{u.total} total</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="up" style={{ animationDelay: "0.06s" }}>

              {/* Countdown */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>Time Remaining</p>
                <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
                  {[["DAYS", cd.days], ["HRS", cd.hours], ["MINS", cd.mins], ["SECS", cd.secs]].map(([l, v], i) => (
                    <div key={l} style={{ display: "flex", alignItems: "flex-start" }}>
                      <div style={{ textAlign: "center", minWidth: "clamp(52px,8vw,68px)" }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(32px, 6vw, 50px)", fontWeight: 800, color: c.text, lineHeight: 1, letterSpacing: -1 }}>
                          {String(v).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1.5, marginTop: 5, textTransform: "uppercase" }}>{l}</div>
                      </div>
                      {i < 3 && <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px,4vw,38px)", fontWeight: 300, color: c.muted, lineHeight: 1, paddingTop: 2, marginLeft: 2, marginRight: 2 }}>:</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: c.div, marginBottom: 24 }} />

              {/* Login card */}
              <div style={{ ...card, padding: "24px 22px" }}>
                {!adminBox ? (
                  <>
                    <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" }}>Sign In</p>

                    <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Branch</label>
                    <select value={selBranch} onChange={e => { setSelBranch(e.target.value); setSelName(""); }}
                      style={{ ...inp, marginBottom: 16 }}>
                      <option value="">Select your branch…</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>

                    {selBranch && (
                      <>
                        <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Name</label>
                        {(byBranch[selBranch] || []).length === 0
                          ? <p style={{ fontSize: 12, color: c.muted, marginBottom: 16 }}>No officers in this branch yet.</p>
                          : <select value={selName} onChange={e => setSelName(e.target.value)} style={{ ...inp, marginBottom: 16 }}>
                              <option value="">Select your name…</option>
                              {(byBranch[selBranch] || []).map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                            </select>
                        }
                      </>
                    )}

                    <button onClick={enterOfficer} disabled={!selBranch || !selName}
                      style={{ width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 600, borderRadius: 7, border: `1px solid ${selBranch && selName ? c.borderA : c.border}`, cursor: selBranch && selName ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", background: selBranch && selName ? c.text : "transparent", color: selBranch && selName ? (dark ? "#0a0a0a" : "#ffffff") : c.muted, transition: "all 0.16s" }}>
                      {selName ? `Enter as ${selName} →` : "Select your name to continue"}
                    </button>

                    <div style={{ height: 1, background: c.div, margin: "16px 0" }} />

                    <button onClick={() => setAdminBox(true)}
                      style={{ width: "100%", padding: "7px 0", background: "transparent", border: "none", color: c.muted, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "center" }}>
                      Admin / Reporting Officer →
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setAdminBox(false); setAdminIn(""); setPwErr(false); }}
                      style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 12, marginBottom: 18, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>
                      ← Back
                    </button>
                    <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>Admin Access</p>
                    <input type="password" placeholder="Enter admin password" value={adminIn}
                      onChange={e => { setAdminIn(e.target.value); setPwErr(false); }}
                      onKeyDown={e => e.key === "Enter" && enterAdmin()}
                      style={{ ...inp, marginBottom: 6, borderColor: pwErr ? "rgba(248,113,113,0.5)" : c.inputBdr }} />
                    {pwErr && <p style={{ color: "#f87171", fontSize: 11, marginBottom: 10 }}>Incorrect password.</p>}
                    <button onClick={enterAdmin}
                      style={{ width: "100%", padding: "11px 0", marginTop: 8, background: c.text, color: dark ? "#0a0a0a" : "#ffffff", fontSize: 13, fontWeight: 600, borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      Enter as Admin
                    </button>
                    <p style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: c.muted }}>Contact your admin for the password</p>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Portal ────────────────────────────────────────────────────────────────
  const OTABS = [
    { id: "submit",      label: "Log Activity" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "mylog",       label: `My Log${mySubs.length ? ` (${mySubs.length})` : ""}` },
    { id: "prizes",      label: "Prizes" },
  ];
  const ATABS = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "approvals",   label: `Approvals${pending.length ? ` (${pending.length})` : ""}` },
    { id: "redemptions", label: `Redemptions${pendingR.length ? ` (${pendingR.length})` : ""}` },
    { id: "settings",    label: "Settings" },
  ];
  const TABS = isAdmin ? ATABS : OTABS;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif" }}>
      <CSS />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: toast.type === "err" ? "#dc2626" : (dark ? "#1a1a1a" : "#111"), color: "#fff", border: `1px solid ${toast.type === "err" ? "rgba(220,38,38,0.3)" : c.border}`, boxShadow: `0 4px 20px ${c.shadow}`, animation: "toastIn 0.2s ease", maxWidth: 280 }}>
          {toast.text}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(10px)", padding: 20 }}>
          <div style={{ ...card, width: "100%", maxWidth: 300, padding: 28, textAlign: "center", animation: "pop 0.25s ease", boxShadow: `0 20px 60px ${c.shadow}` }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{confirm.icon}</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{confirm.name}</h3>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 6, lineHeight: 1.5 }}>{confirm.desc}</p>
            <p style={{ color: c.muted, fontSize: 11, lineHeight: 1.7, marginBottom: 22 }}>
              Costs <strong style={{ color: c.text }}>{confirm.cost} pts</strong>. You'll have <strong style={{ color: c.text }}>{myAvail - confirm.cost} pts</strong> remaining.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => redeemP(confirm)} style={{ flex: 1, padding: "10px 0", background: c.text, color: dark ? "#0a0a0a" : "#fff", fontWeight: 600, fontSize: 13, borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Confirm</button>
              <button onClick={() => setConfirm(null)} style={{ padding: "10px 14px", background: "transparent", border: `1px solid ${c.border}`, color: c.sub, fontSize: 13, borderRadius: 7, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Portal nav */}
      <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "flex", alignItems: "center", gap: 8, height: 52 }}>
          <button onClick={() => setScreen("landing")}
            style={{ display: "flex", alignItems: "center", gap: 7, background: c.chip, border: `1px solid ${c.border}`, borderRadius: 7, cursor: "pointer", flexShrink: 0, padding: "4px 11px" }}>
            <span style={{ fontSize: 13 }}>🏆</span>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: c.text }}>GEAR Up</span>
          </button>
          <div style={{ width: 1, height: 16, background: c.border, flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 1, flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: tab === tb.id ? c.chipSel : "transparent", color: tab === tb.id ? c.text : c.sub, fontSize: 12, fontWeight: tab === tb.id ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif", transition: "all 0.12s" }}>
                {tb.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!isAdmin && myOf && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: c.text, fontWeight: 700, lineHeight: 1 }}>{myAvail} <span style={{ fontSize: 9, fontWeight: 400, color: c.muted }}>PTS</span></div>
                <div style={{ fontSize: 9, color: c.muted }}>Rank #{myRank}</div>
              </div>
            )}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.chipSel, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c.text, flexShrink: 0 }}>
              {isAdmin ? "AD" : (user ? initials(user.name) : "?")}
            </div>
            <button onClick={() => { setScreen("landing"); setSelBranch(""); setSelName(""); setAdminIn(""); setAdminBox(false); }}
              style={{ padding: "3px 9px", background: "transparent", border: `1px solid ${c.border}`, borderRadius: 5, color: c.sub, cursor: "pointer", fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}>
              Exit
            </button>
            <Toggle />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 18px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Log Activity ── */}
        {tab === "submit" && !isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 540 }}>
            {/* User card */}
            <div style={{ ...card, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.chipSel, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: c.text, flexShrink: 0 }}>{user ? initials(user.name) : "?"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, color: c.text }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: c.sub }}>{user?.unit}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, color: c.text, fontWeight: 800, lineHeight: 1 }}>{myAvail}</div>
                <div style={{ fontSize: 9, color: c.muted }}>available pts</div>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Log an Activity</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 20, lineHeight: 1.65 }}>Select what you did — points are awarded once your Reporting Officer approves.</p>

            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Select Activity *</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, ...card, overflow: "hidden", marginBottom: 18 }}>
              {RUBRICS.map((r, idx) => {
                const sel = form.rubricId === String(r.id);
                return (
                  <div key={r.id} onClick={() => setForm(p => ({ ...p, rubricId: String(r.id) }))}
                    className="row-hover"
                    style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: idx < RUBRICS.length - 1 ? `1px solid ${c.border}` : "none", background: sel ? c.chipSel : "transparent", transition: "background 0.1s" }}>
                    <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{r.icon}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: sel ? 600 : 400, color: c.text, lineHeight: 1.4 }}>{r.activity}</span>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, color: sel ? c.text : c.muted, flexShrink: 0 }}>+{r.points}</span>
                    {sel && <span style={{ fontSize: 11, color: c.text, flexShrink: 0 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ ...card, padding: 20 }}>
              <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ ...inp, marginBottom: 16 }} />
              <label style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Description / Evidence *</label>
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder='e.g. Attended "Leadership in Action" workshop, full day.' rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.6, marginBottom: 16 }} />
              {form.rubricId && (
                <div style={{ padding: "10px 14px", background: c.infoBg, border: `1px solid ${c.infoBdr}`, borderRadius: 7, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: c.sub }}>Points upon approval</span>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 800, color: c.text }}>+{RUBRICS.find(r => r.id === parseInt(form.rubricId))?.points}</span>
                </div>
              )}
              <button onClick={submitAct} disabled={!form.rubricId || !form.date || !form.desc.trim()}
                style={{ width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 600, borderRadius: 7, border: `1px solid ${form.rubricId && form.date && form.desc.trim() ? c.borderA : c.border}`, cursor: form.rubricId && form.date && form.desc.trim() ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", background: form.rubricId && form.date && form.desc.trim() ? c.text : "transparent", color: form.rubricId && form.date && form.desc.trim() ? (dark ? "#0a0a0a" : "#fff") : c.muted, transition: "all 0.16s" }}>
                Submit for Approval →
              </button>
            </div>
          </div>
        )}

        {/* ── Leaderboard ── */}
        {tab === "leaderboard" && (
          <div className="up" style={{ width: "100%" }}>
            <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>Top 3 Officers</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 8, maxWidth: 500, marginBottom: 32 }}>
              {[sorted[1], sorted[0], sorted[2]].map((o, i) => {
                if (!o) return <div key={i} />;
                const pos   = [2, 1, 3][i];
                const col   = ["#9ca3af", "#c9a227", "#b87333"][i];
                const isMe  = user && o.id === user.id;
                const mv    = getMovement(o.id, pos);
                return (
                  <div key={o.id} style={{ ...card, padding: pos === 1 ? "20px 12px" : "14px 10px", textAlign: "center", border: isMe ? `1px solid ${c.borderA}` : pos === 1 ? `1px solid ${c.gold}` : `1px solid ${c.border}`, background: pos === 1 ? (dark ? "rgba(201,162,39,0.05)" : "rgba(255,248,210,0.5)") : c.surface }}>
                    <div style={{ fontSize: pos === 1 ? 28 : 22, marginBottom: 9 }}>{["🥈","🥇","🥉"][i]}</div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 700, color: c.text, lineHeight: 1.3, marginBottom: 2 }}>{o.name}</div>
                    <div style={{ fontSize: 9, color: c.sub, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: pos === 1 ? 22 : 17, fontWeight: 800, color: col, lineHeight: 1 }}>{o.total_points}</div>
                    <div style={{ fontSize: 9, color: c.muted, marginBottom: 4 }}>pts</div>
                    {mv && (
                      <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                        {mv.rankDiff !== 0 && <span style={{ fontSize: 9, fontWeight: 700, color: mv.rankDiff > 0 ? "#4ade80" : "#f87171" }}>{mv.rankDiff > 0 ? `▲${mv.rankDiff}` : `▼${Math.abs(mv.rankDiff)}`}</span>}
                        {mv.ptsDiff > 0 && <span style={{ fontSize: 9, color: c.muted }}>+{mv.ptsDiff}pts</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 9, color: c.goldText, marginTop: 4 }}>★ Special Prize</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr min(260px,38%)", gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>All Officers</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {sorted.slice(3).map((o, i) => {
                    const isMe = user && o.id === user.id;
                    const mv   = getMovement(o.id, i + 4);
                    return (
                      <div key={o.id} className="row-hover"
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${c.border}`, background: isMe ? c.infoBg : "transparent" }}>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: c.muted, width: 24, flexShrink: 0 }}>#{i + 4}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "flex", alignItems: "center", gap: 5 }}>
                            {o.name}
                            {isMe && <span style={{ fontSize: 9, color: c.sub, background: c.chipSel, padding: "1px 5px", borderRadius: 3, fontWeight: 600, border: `1px solid ${c.border}` }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: 9, color: c.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.unit}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, color: c.text }}>{o.total_points}</div>
                          {mv && (
                            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", marginTop: 1 }}>
                              {mv.rankDiff !== 0 && <span style={{ fontSize: 9, fontWeight: 700, color: mv.rankDiff > 0 ? "#4ade80" : "#f87171" }}>{mv.rankDiff > 0 ? `▲${mv.rankDiff}` : `▼${Math.abs(mv.rankDiff)}`}</span>}
                              {mv.ptsDiff > 0 && <span style={{ fontSize: 9, color: c.muted }}>+{mv.ptsDiff}pts</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>Branch Standings</p>
                <p style={{ fontSize: 9, color: c.muted, marginBottom: 12, lineHeight: 1.5 }}>Avg pts per officer</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {unitScores.map((u, i) => (
                    <div key={u.unit} style={{ padding: "11px 13px", display: "flex", alignItems: "center", gap: 8, borderBottom: i < unitScores.length - 1 ? `1px solid ${c.border}` : "none", background: i === 0 ? (dark ? "rgba(201,162,39,0.04)" : "rgba(255,248,210,0.4)") : "transparent" }}>
                      <span style={{ fontSize: 12 }}>{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣"][i]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? c.goldText : c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.unit}</div>
                        <div style={{ fontSize: 9, color: c.muted }}>{u.count} officers</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: i === 0 ? c.goldText : c.text }}>{u.avg}</div>
                        <div style={{ fontSize: 8, color: c.muted }}>avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── My Log ── */}
        {tab === "mylog" && !isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 600 }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>My Activity Log</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 22, lineHeight: 1.6 }}>Your submitted activities and their approval status.</p>
            {mySubs.length === 0 ? (
              <div style={{ ...card, padding: 44, textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>📭</div>
                <div style={{ color: c.sub, fontSize: 13, marginBottom: 16 }}>No activities logged yet.</div>
                <Btn ch="Log your first activity →" onClick={() => setTab("submit")} v="ghost" sz="sm" />
              </div>
            ) : (
              <div style={{ ...card, overflow: "hidden" }}>
                {mySubs.map((s, i) => (
                  <div key={s.id} style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < mySubs.length - 1 ? `1px solid ${c.border}` : "none" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                      <div style={{ fontSize: 10, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                    </div>
                    <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: c.text, flexShrink: 0, marginRight: 6, fontWeight: 700 }}>+{s.points}</span>
                    <Pill status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Prizes ── */}
        {tab === "prizes" && !isAdmin && (
          <div className="up" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 3, color: c.text }}>Prize Catalogue</h2>
                <p style={{ color: c.sub, fontSize: 12 }}>Spend your points — your choice.</p>
              </div>
              <div style={{ ...card, padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: c.muted, letterSpacing: 1.5, marginBottom: 3, textTransform: "uppercase" }}>Available Points</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800, color: c.text, lineHeight: 1 }}>{myAvail}</div>
                <div style={{ fontSize: 9, color: c.muted, marginTop: 3 }}>{myOf?.total_points} earned · {mySpent} spent</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}>
              {cats.map(ct => (
                <button key={ct} onClick={() => setCatF(ct)}
                  style={{ padding: "5px 12px", borderRadius: 5, border: `1px solid ${catF === ct ? c.borderA : c.border}`, background: catF === ct ? c.chipSel : "transparent", color: catF === ct ? c.text : c.sub, fontSize: 12, fontWeight: catF === ct ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.12s" }}>
                  {ct}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 10, marginBottom: 24 }}>
              {catItems.map(p => {
                const can = myAvail >= p.cost;
                return (
                  <div key={p.id} onClick={() => can && !p.tba && setConfirm(p)}
                    style={{ ...card, padding: "16px 15px", position: "relative", opacity: can ? 1 : 0.4, cursor: can && !p.tba ? "pointer" : "default", transition: "opacity 0.15s" }}>
                    {p.tba && <div style={{ position: "absolute", top: 10, right: 10, padding: "2px 6px", borderRadius: 4, background: c.chipSel, border: `1px solid ${c.border}`, fontSize: 9, color: c.muted, fontWeight: 600 }}>TBA</div>}
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
                    <div style={{ fontSize: 9, color: p.color, fontWeight: 600, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{p.cat}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: c.sub, marginBottom: 14, lineHeight: 1.5 }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: can ? c.text : c.muted }}>{p.cost} <span style={{ fontSize: 9, fontWeight: 400, color: c.muted }}>pts</span></div>
                      {can && !p.tba
                        ? <div style={{ padding: "3px 9px", borderRadius: 4, background: c.chipSel, border: `1px solid ${c.border}`, color: c.text, fontSize: 10, fontWeight: 600 }}>Redeem</div>
                        : !can
                          ? <div style={{ fontSize: 9, color: c.muted }}>{p.cost - myAvail} more</div>
                          : <div style={{ fontSize: 9, color: c.muted }}>Soon</div>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
            <SpecialSection c={c} dark={dark} card={card} />
          </div>
        )}

        {/* ── Admin: Approvals ── */}
        {tab === "approvals" && isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 700 }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Activity Approvals</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 22, lineHeight: 1.6 }}>Approve or reject officer activity submissions.</p>
            {pending.length === 0
              ? <EmptyBox icon="✨" msg="All caught up — no pending submissions." c={c} card={card} />
              : (
                <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
                  {pending.map((s, i) => (
                    <div key={s.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < pending.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: c.text, fontWeight: 700 }}>{s.officer_name}</span>
                          <span style={{ fontSize: 9, color: c.muted }}>·</span>
                          <span style={{ fontSize: 11, color: c.sub }}>{s.unit}</span>
                        </div>
                        <div style={{ fontSize: 12, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                        <div style={{ fontSize: 10, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                      </div>
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: c.goldText, flexShrink: 0, fontWeight: 700 }}>+{s.points}</span>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <Btn ch="Approve" v="success" sz="sm" onClick={() => approve(s.id)} />
                        <Btn ch="Reject" v="danger" sz="sm" onClick={() => reject(s.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {subs.filter(s => s.status !== "pending").length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>History</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {subs.filter(s => s.status !== "pending").map((s, i, arr) => (
                    <div key={s.id} style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 10, opacity: 0.55, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 15 }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{s.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {s.activity}</span></div>
                      </div>
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: c.text, flexShrink: 0 }}>+{s.points}</span>
                      <Pill status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Admin: Redemptions ── */}
        {tab === "redemptions" && isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 700 }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Prize Redemptions</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 22, lineHeight: 1.6 }}>Fulfil or reject officer prize redemption requests.</p>
            {pendingR.length === 0
              ? <EmptyBox icon="🎁" msg="No pending redemptions." c={c} card={card} />
              : (
                <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
                  {pendingR.map((r, i) => (
                    <div key={r.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < pendingR.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{r.prize_icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: c.text, fontWeight: 700 }}>{r.officer_name}</span>
                          <span style={{ fontSize: 9, color: c.muted }}>·</span>
                          <span style={{ fontSize: 11, color: c.sub }}>{r.unit}</span>
                        </div>
                        <div style={{ fontSize: 12, color: c.text }}>{r.prize_name}</div>
                      </div>
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: c.goldText, flexShrink: 0, fontWeight: 700 }}>{r.cost} pts</span>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <Btn ch="Fulfil" v="success" sz="sm" onClick={() => fulfilR(r.id, r.officer_name)} />
                        <Btn ch="Reject" v="danger" sz="sm" onClick={() => rejectR(r.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {redems.filter(r => r.status !== "pending").length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: c.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>History</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {redems.filter(r => r.status !== "pending").map((r, i, arr) => (
                    <div key={r.id} style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 10, opacity: 0.55, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 15 }}>{r.prize_icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{r.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {r.prize_name}</span></div>
                      </div>
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: c.goldText, flexShrink: 0 }}>{r.cost} pts</span>
                      <Pill status={r.status === "fulfilled" ? "approved" : "rejected"} label={r.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Admin: Settings ── */}
        {tab === "settings" && isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 580 }}>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Settings</h2>
            <p style={{ color: c.sub, fontSize: 12, marginBottom: 28, lineHeight: 1.6 }}>Manage officers, branches, and admin password.</p>

            <Sec label="Add New Officer" c={c}>
              <div style={{ ...card, padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Full Name</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Tan" style={{ ...inp }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Branch</label>
                    <select value={newBr} onChange={e => setNewBr(e.target.value)} style={{ ...inp }}>
                      <option value="">Select branch…</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <Btn ch={sLoading ? "Adding…" : "Add Officer"} v="primary" onClick={addOfficer} disabled={!newName.trim() || !newBr || sLoading} />
              </div>
            </Sec>

            <Sec label={`All Officers (${officers.length})`} c={c}>
              <div style={{ ...card, overflow: "hidden" }}>
                {branches.map(br => {
                  const bOfs = byBranch[br.name] || [];
                  if (!bOfs.length) return null;
                  return (
                    <div key={br.id}>
                      <div style={{ padding: "7px 16px", background: c.chip, borderBottom: `1px solid ${c.border}` }}>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: c.muted, letterSpacing: 2, textTransform: "uppercase" }}>{br.name}</span>
                      </div>
                      {bOfs.map(o => (
                        <div key={o.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                          {editOf?.id === o.id ? (
                            <div style={{ padding: "15px 16px", background: c.infoBg }}>
                              <p style={{ fontSize: 10, color: c.sub, fontWeight: 600, marginBottom: 10 }}>Editing: {editOf.name}</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                <div>
                                  <label style={{ fontSize: 9, color: c.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Full Name</label>
                                  <input value={editN} onChange={e => setEditN(e.target.value)} style={{ ...inp, padding: "8px 10px", fontSize: 12 }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 9, color: c.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Branch</label>
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
                            <div className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.chip, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c.sub, flexShrink: 0 }}>{initials(o.name)}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{o.name}</div>
                                <div style={{ fontSize: 9, color: c.muted }}>{o.total_points} pts</div>
                              </div>
                              <Btn ch="Edit" v="ghost" sz="sm" onClick={() => startEdit(o)} disabled={sLoading} />
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

            <Sec label="Manage Branches" c={c}>
              <div style={{ ...card, padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>New Branch Name</label>
                    <input value={newBrName} onChange={e => setNewBrName(e.target.value)} placeholder="e.g. Operations" style={{ ...inp }} />
                  </div>
                  <Btn ch="Add" v="primary" onClick={addBranch} disabled={!newBrName.trim() || sLoading} />
                </div>
              </div>
              <div style={{ ...card, overflow: "hidden" }}>
                {branches.map((br, i) => (
                  <div key={br.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: i < branches.length - 1 ? `1px solid ${c.border}` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{br.name}</div>
                      <div style={{ fontSize: 9, color: c.muted }}>{(byBranch[br.name] || []).length} officers</div>
                    </div>
                    <Btn ch="Remove" v="danger" sz="sm" onClick={() => removeBranch(br.id, br.name)} disabled={sLoading} />
                  </div>
                ))}
              </div>
            </Sec>

            <Sec label="Change Admin Password" c={c}>
              <div style={{ ...card, padding: 18 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>New Password (min 6 characters)</label>
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
    <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 52, justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>← Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: c.text }}>GEAR Up</span>
          </div>
        </div>
        <Toggle />
      </div>
    </div>
  );
}

function Sec({ label, children, c }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 10, color: c.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>{label}</p>
      {children}
    </div>
  );
}

function StaticPrizeCard({ p, c, card }) {
  return (
    <div style={{ ...card, padding: "16px 15px", position: "relative" }}>
      {p.tba && <div style={{ position: "absolute", top: 10, right: 10, padding: "2px 6px", borderRadius: 4, background: c.chipSel, border: `1px solid ${c.border}`, fontSize: 9, color: c.muted, fontWeight: 600 }}>TBA</div>}
      <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
      <div style={{ fontSize: 9, color: p.color, fontWeight: 600, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{p.cat}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>{p.name}</div>
      <div style={{ fontSize: 11, color: c.sub, marginBottom: 12, lineHeight: 1.5 }}>{p.desc}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, color: p.color }}>{p.cost} <span style={{ fontSize: 9, fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: c.sub }}>pts</span></div>
    </div>
  );
}

function SpecialSection({ c, dark, card }) {
  return (
    <div style={{ ...card, padding: 20, border: `1px solid ${dark ? "rgba(201,162,39,0.15)" : "rgba(160,120,0,0.15)"}` }}>
      <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, color: "#c9a227", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>★ Special Prizes — Mini-Retreat Event</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "🥇🥈🥉", title: "Top 3 Officers", desc: "Exclusive prize + public recognition at Mini-Retreat" },
          { icon: "🏢", title: "Top Branch",   desc: "Branch trophy + special mention at Mini-Retreat" },
        ].map(item => (
          <div key={item.title} style={{ padding: "14px 15px", background: dark ? "rgba(201,162,39,0.03)" : "rgba(255,248,200,0.3)", border: `1px solid ${dark ? "rgba(201,162,39,0.08)" : "rgba(160,120,0,0.1)"}`, borderRadius: 8 }}>
            <div style={{ fontSize: 20, marginBottom: 7 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: c.sub, lineHeight: 1.55 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyBox({ icon, msg, c, card }) {
  return (
    <div style={{ ...card, padding: 44, textAlign: "center", marginBottom: 22 }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: c.sub, fontSize: 13 }}>{msg}</div>
    </div>
  );
}
