import { useState, useEffect, useCallback } from "react";

// ── Supabase ──────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://odhxxcjkaqfnnnfiyqac.supabase.co";
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
  get:   (t, q = "") => api(`${t}?${q}`),
  post:  (t, b)      => api(t, { method: "POST",   body: JSON.stringify(b) }),
  patch: (t, q, b)   => api(`${t}?${q}`, { method: "PATCH",  body: JSON.stringify(b) }),
  del:   (t, q)      => api(`${t}?${q}`, { method: "DELETE", prefer: "return=minimal" }),
};

// ── Static data ───────────────────────────────────────────────────────────
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
  { id: "v1", cat: "Vouchers",    name: "NTUC FairPrice $10",   desc: "$10 grocery voucher",     cost: 40,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v2", cat: "Vouchers",    name: "Grab $10",             desc: "$10 ride / food credits", cost: 40,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v3", cat: "Vouchers",    name: "NTUC FairPrice $25",   desc: "$25 grocery voucher",     cost: 90,  icon: "🛒", color: "#22c55e", tba: false },
  { id: "v4", cat: "Vouchers",    name: "Grab $25",             desc: "$25 ride / food credits", cost: 90,  icon: "🚗", color: "#f59e0b", tba: false },
  { id: "v5", cat: "Vouchers",    name: "Shopping Voucher $50", desc: "Capitaland / Lazada",     cost: 180, icon: "🛍️", color: "#a855f7", tba: false },
  { id: "l1", cat: "Leave",       name: "Half-Day Off-in-Lieu", desc: "Take half a day off",     cost: 60,  icon: "🌅", color: "#06b6d4", tba: false },
  { id: "l2", cat: "Leave",       name: "Full-Day Off-in-Lieu", desc: "Take a full day off",     cost: 110, icon: "🏖️", color: "#06b6d4", tba: false },
  { id: "p1", cat: "Coming Soon", name: "Mystery Prize A",      desc: "To be announced",         cost: 50,  icon: "🎁", color: "#ec4899", tba: true },
  { id: "p2", cat: "Coming Soon", name: "Mystery Prize B",      desc: "To be announced",         cost: 120, icon: "🎁", color: "#ec4899", tba: true },
  { id: "p3", cat: "Coming Soon", name: "Mystery Prize C",      desc: "To be announced",         cost: 200, icon: "🎁", color: "#ec4899", tba: true },
];

const TIERS = [
  { name: "Unranked",    min: 0,   max: 0,        icon: "🎮", color: "#666666" }, // Dimmed Grey
  { name: "Challenger",  min: 1,   max: 99,       icon: "🥊", color: "#a78bfa" }, // Purple Glow
  { name: "Elite",       min: 100, max: 199,      icon: "⚡", color: "#fbbf24" }, // Gold Glow
  { name: "MVP",         min: 200, max: 299,      icon: "💎", color: "#22d3ee" }, // Diamond Glow
  { name: "GOAT",        min: 300, max: Infinity, icon: "🐐", color: "#ffffff" }, // Neon White
];

// ── Helpers ───────────────────────────────────────────────────────────────
const getTier   = pts => TIERS[Math.max(0, TIERS.findIndex(t => pts >= t.min && pts <= t.max))];
const tierRange = t   => t.max === Infinity ? `${t.min}+ pts` : `${t.min} – ${t.max} pts`;
const initials  = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const CAMPAIGN_END = new Date("2026-12-31");
const getCountdown = () => {
  const d = CAMPAIGN_END - new Date();
  if (d <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days:  Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    mins:  Math.floor((d % 3600000)  / 60000),
    secs:  Math.floor((d % 60000)    / 1000),
  };
};

// ── Theme ─────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#000000", surface: "rgba(85,0,170,0.5)", surfaceHover: "rgba(255,255,255,0.3)",
  border: "rgba(172,3,181,0.1)", borderA: "rgba(255,255,255,0.18)", text: "#f0f0f0",
  sub: "rgba(255,255,255,0.75)", muted: "rgba(255,255,255,0.5)", nav: "rgb(95,0,173)",
  chip: "rgba(255,255,255,0.04)", chipSel: "rgba(255,255,255,0.09)",
  inputBg: "rgba(255,255,255,0.05)", inputBdr: "rgba(255,255,255,0.09)", div: "rgba(255,255,255,0.06)",
  blank: "rgba(255,255,255,0.05)", infoBg: "rgba(255,255,255,0.03)", infoBdr: "rgba(255,255,255,0.09)",
  shadow: "rgba(0,0,0,0.5)", goldText: "#d4a017",
};
const LITE = {
  bg: "#f5f5f5", surface: "#ffffff", surfaceHover: "#fafafa",
  border: "rgba(0,0,0,0.07)", borderA: "rgba(0,0,0,0.16)", text: "#111111",
  sub: "rgba(0,0,0,0.42)", muted: "rgba(0,0,0,0.5)", nav: "rgba(245,245,245,0.96)",
  chip: "rgba(0,0,0,0.04)", chipSel: "rgba(0,0,0,0.07)",
  inputBg: "#ffffff", inputBdr: "rgba(0,0,0,0.09)", div: "rgba(0,0,0,0.06)",
  blank: "rgba(0,0,0,0.04)", infoBg: "rgba(0,0,0,0.02)", infoBdr: "rgba(0,0,0,0.07)",
  shadow: "rgba(0,0,0,0.07)", goldText: "#a07000",
};

// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const c = dark ? DARK : LITE;

  // DB state
  const [branches, setBranches] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [subs,     setSubs]     = useState([]);
  const [redems,   setRedems]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dbErr,    setDbErr]    = useState(null);
  const [adminPwd, setAdminPwd] = useState("admin1234");

  // UI state
  const [screen,           setScreen]           = useState("landing");
  const [user,             setUser]             = useState(null);
  const [isAdmin,          setIsAdmin]          = useState(false);
  const [tab,              setTab]              = useState("leaderboard");
  const [cd,               setCd]              = useState(getCountdown());
  const [toast,            setToast]            = useState(null);
  const [confirm,          setConfirm]          = useState(null);
  const [menuOpen,         setMenuOpen]         = useState(false);
  const [leaderboardTab,   setLeaderboardTab]   = useState("officers");
  const [expandedBranches, setExpandedBranches] = useState({});

  // Landing form
  const [selBranch, setSelBranch] = useState("");
  const [selName,   setSelName]   = useState("");
  const [adminBox,  setAdminBox]  = useState(false);
  const [adminIn,   setAdminIn]   = useState("");

  // Submit form
  const [form, setForm] = useState({ rubricId: "", date: "", desc: "" });
  const [catF, setCatF] = useState("All");

  // Settings form
  const [newName,   setNewName]   = useState("");
  const [newBr,     setNewBr]     = useState("");
  const [newBrName, setNewBrName] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [sLoading,  setSLoading]  = useState(false);
  const [editOf,    setEditOf]    = useState(null);
  const [editN,     setEditN]     = useState("");
  const [editB,     setEditB]     = useState("");

  // ── Data loading ──────────────────────────────────────────────────────────
  const takeSnapshotIfNeeded = useCallback(async (officerList) => {
    if (!officerList.length || new Date().getDay() !== 1) return;
    const monday = new Date(); monday.setHours(0, 0, 0, 0);
    const weekStr = monday.toISOString().split("T")[0];
    try {
      const existing = await db.get("leaderboard_snapshots", `week_start=eq.${weekStr}&limit=1`);
      if (existing?.length) return;
      const ranked = [...officerList].sort((a, b) => b.total_points - a.total_points);
      for (const [i, o] of ranked.entries())
        await db.post("leaderboard_snapshots", { officer_id: o.id, officer_name: o.name, unit: o.unit, total_points: o.total_points, rank: i + 1, week_start: weekStr });
    } catch (e) { console.warn("Snapshot failed", e.message); }
  }, []);

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
      const mapped = (of || []).map(o => ({ ...o, unit: o.branches?.name || "" }));
      setBranches(br || []);
      setOfficers(mapped);
      setSubs(su || []);
      setRedems(re || []);
      if (cfg?.[0]) setAdminPwd(cfg[0].value);
      await takeSnapshotIfNeeded(mapped);
    } catch (e) { setDbErr(e.message); }
    finally { setLoading(false); }
  }, [takeSnapshotIfNeeded]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => setCd(getCountdown()), 1000); return () => clearInterval(id); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const sorted     = [...officers].sort((a, b) => b.total_points - a.total_points);
  const byBranch   = branches.reduce((a, br) => { a[br.name] = officers.filter(o => o.unit === br.name); return a; }, {});
  const unitScores = branches.map(br => {
    const ofs   = byBranch[br.name] || [];
    const total = ofs.reduce((s, o) => s + o.total_points, 0);
    return { unit: br.name, total, count: ofs.length, avg: ofs.length ? Math.round(total / ofs.length) : 0 };
  }).sort((a, b) => b.avg - a.avg);

  const pending  = subs.filter(s => s.status === "pending");
  const pendingR = redems.filter(r => r.status === "pending");
  const myOf     = user ? officers.find(o => o.id === user.id) : null;
  const mySpent  = user ? redems.filter(r => r.officer_id === user.id && r.status !== "rejected").reduce((s, r) => s + r.cost, 0) : 0;
  const myAvail  = myOf ? myOf.total_points - mySpent : 0;
  const myRank   = user ? sorted.findIndex(o => o.id === user.id) + 1 : null;
  const mySubs   = user ? subs.filter(s => s.officer_id === user.id) : [];
  const cats     = ["All", ...Array.from(new Set(CATALOGUE.map(p => p.cat)))];
  const catItems = catF === "All" ? CATALOGUE : CATALOGUE.filter(p => p.cat === catF);

  // My tier info
  const tierPts     = myOf?.total_points || 0;
  const tier        = getTier(tierPts);
  const tierIdx     = TIERS.indexOf(tier);
  const nextTier    = TIERS[tierIdx + 1] || null;
  const tierBarPct  = nextTier ? Math.min(100, Math.round(((tierPts - tier.min) / (nextTier.min - tier.min)) * 100)) : 100;
  const tierPtsLeft = nextTier ? nextTier.min - tierPts : 0;
  const isChamp     = !nextTier;

  // ── Actions ───────────────────────────────────────────────────────────────
  const msg          = (text, type = "ok") => { setToast({ text, type }); setTimeout(() => setToast(null), 3200); };
  const toggleBranch = unit => setExpandedBranches(p => ({ ...p, [unit]: !p[unit] }));

  const enterOfficer = () => {
    const o = officers.find(o => o.name === selName && o.unit === selBranch);
    if (!o) return;
    setUser(o); setIsAdmin(false); setTab("submit"); setScreen("portal");
  };
  const enterAdmin = () => {
    if (adminIn === adminPwd) { setIsAdmin(true); setUser(null); setTab("approvals"); setScreen("portal"); }
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

  const approve = async id => {
    const s = subs.find(s => s.id === id);
    try {
      await db.patch("submissions", `id=eq.${id}`, { status: "approved" });
      await db.patch("officers", `id=eq.${s.officer_id}`, { total_points: (officers.find(o => o.id === s.officer_id)?.total_points || 0) + s.points });
      msg(`✅ +${s.points} pts → ${s.officer_name}`); await load();
    } catch (e) { msg(e.message, "err"); }
  };
  const reject  = async id => { try { await db.patch("submissions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected."); await load(); } catch (e) { msg(e.message, "err"); } };
  const redeemP = async p => {
    try {
      await db.post("redemptions", { officer_id: user.id, officer_name: user.name, unit: user.unit, prize_name: p.name, prize_icon: p.icon, cost: p.cost, status: "pending" });
      setConfirm(null); msg("🎁 Redemption submitted!"); await load();
    } catch (e) { msg(e.message, "err"); }
  };
  const fulfilR = async (id, name) => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "fulfilled" }); msg(`🎁 Fulfilled for ${name}`); await load(); } catch (e) { msg(e.message, "err"); } };
  const rejectR = async id => { try { await db.patch("redemptions", `id=eq.${id}`, { status: "rejected" }); msg("Rejected.", "err"); await load(); } catch (e) { msg(e.message, "err"); } };

  const addOfficer    = async () => { if (!newName.trim() || !newBr) return; setSLoading(true); try { const br = branches.find(b => b.name === newBr); await db.post("officers", { name: newName.trim(), branch_id: br.id, total_points: 0 }); setNewName(""); setNewBr(""); msg(`✅ ${newName} added`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeOfficer = async (id, name) => { if (!window.confirm(`Remove ${name}?`)) return; setSLoading(true); try { await db.del("submissions", `officer_id=eq.${id}`); await db.del("redemptions", `officer_id=eq.${id}`); await db.del("officers", `id=eq.${id}`); msg(`${name} removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const startEdit     = o => { setEditOf(o); setEditN(o.name); setEditB(o.unit); };
  const cancelEdit    = () => { setEditOf(null); setEditN(""); setEditB(""); };
  const saveEdit      = async () => { if (!editN.trim() || !editB) return; setSLoading(true); try { const br = branches.find(b => b.name === editB); await db.patch("officers", `id=eq.${editOf.id}`, { name: editN.trim(), branch_id: br.id }); if (editN !== editOf.name) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { officer_name: editN.trim() }); } if (editB !== editOf.unit) { await db.patch("submissions", `officer_id=eq.${editOf.id}`, { unit: editB }); await db.patch("redemptions", `officer_id=eq.${editOf.id}`, { unit: editB }); } msg(`✅ ${editN} updated`); cancelEdit(); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const addBranch     = async () => { if (!newBrName.trim()) return; setSLoading(true); try { await db.post("branches", { name: newBrName.trim() }); setNewBrName(""); msg("✅ Branch added"); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const removeBranch  = async (id, name) => { if (!window.confirm(`Remove "${name}"?`)) return; setSLoading(true); try { for (const o of (byBranch[name] || [])) { await db.del("submissions", `officer_id=eq.${o.id}`); await db.del("redemptions", `officer_id=eq.${o.id}`); await db.del("officers", `id=eq.${o.id}`); } await db.del("branches", `id=eq.${id}`); msg(`Branch "${name}" removed.`); await load(); } catch (e) { msg(e.message, "err"); } setSLoading(false); };
  const changePw      = async () => { if (newPw.length < 6) { msg("Min 6 characters.", "err"); return; } setSLoading(true); try { await db.patch("config", "key=eq.admin_password", { value: newPw.trim() }); setAdminPwd(newPw.trim()); setNewPw(""); msg("✅ Password updated."); } catch (e) { msg(e.message, "err"); } setSLoading(false); };

  // ── Shared style objects ──────────────────────────────────────────────────
  const card = { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10 };
  const inp  = { width: "100%", padding: "10px 12px", background: c.inputBg, border: `1px solid ${c.inputBdr}`, borderRadius: 7, color: c.text, fontSize: 15, fontFamily: "'Inter',sans-serif", outline: "none", boxSizing: "border-box" };

  // ── Shared mini-components (need closure over c / dark) ───────────────────
  const Btn = ({ ch, onClick, v = "primary", sz = "md", disabled = false }) => {
    const pad = { sm: "5px 10px", md: "9px 16px", lg: "12px 22px" };
    const s = {
      primary: { bg: c.text,        col: dark ? "#0a0a0a" : "#ffffff", bdr: "none" },
      success: { bg: "transparent", col: "#4ade80", bdr: "1px solid rgba(74,222,128,0.22)" },
      danger:  { bg: "transparent", col: "#f87171", bdr: "1px solid rgba(248,113,113,0.22)" },
      ghost:   { bg: "transparent", col: c.sub,     bdr: `1px solid ${c.border}` },
    }[v] || {};
    return (
      <button onClick={onClick} disabled={disabled}
        style={{ padding: pad[sz], background: disabled ? c.blank : s.bg, color: disabled ? c.muted : s.col, border: s.bdr, borderRadius: 6, cursor: disabled ? "default" : "pointer", fontWeight: 600, fontSize: sz === "sm" ? 11 : 13, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1 }}>
        {ch}
      </button>
    );
  };

  const Toggle = () => (
    <button onClick={() => setDark(d => !d)}
      style={{ width: 64, height: 32, borderRadius: 16, border: `1px solid ${c.borderA}`, cursor: "pointer", background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", position: "relative", padding: 0, display: "flex", alignItems: "center", justifyContent: "space-around", transition: "all 0.2s ease" }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", background: c.text, position: "absolute", top: 2, left: dark ? 34 : 2, transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }} />
      <span style={{ fontSize: 14, opacity: dark ? 0.3 : 1, zIndex: 1 }}>☀️</span>
      <span style={{ fontSize: 14, opacity: dark ? 1 : 0.3, zIndex: 1 }}>🌙</span>
    </button>
  );

  const Pill = ({ status, label }) => {
    const map = { approved: ["rgba(74,222,128,0.08)", "#4ade80"], pending: ["rgba(250,204,21,0.08)", "#fbbf24"], rejected: ["rgba(248,113,113,0.08)", "#f87171"] };
    const [bg, col] = map[status] || map.pending;
    return <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: bg, color: col, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{(label || status).toUpperCase()}</span>;
  };

  const CSS = () => (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: ${c.bg}; min-height: 100vh; font-size: 17px; overflow-x: hidden; max-width: 100vw; }
@media (max-width: 480px) { html { font-size: 15px; } }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
input:focus, select:focus, textarea:focus { outline: none !important; border-color: ${c.borderA} !important; box-shadow: none !important; }
input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1) opacity(0.3)" : "opacity(0.35)"}; cursor: pointer; }
select option { background: ${dark ? "#111" : "#fff"}; color: ${c.text}; }
@keyframes toastIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop     { 0%{transform:scale(0.93);opacity:0} 65%{transform:scale(1.01)} 100%{transform:scale(1);opacity:1} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes up      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.up { animation: up 0.2s ease both; }
.row-hover:hover { background: ${c.surfaceHover} !important; }
.portal-cards-3 { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
@media (max-width: 900px) { .portal-top3 { grid-template-columns: 1fr !important; } }
.landing-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
@media (min-width: 901px) { .landing-grid { grid-template-columns: repeat(2,1fr); } }
    `}</style>
  );

  // ── Shared sticky nav wrapper ─────────────────────────────────────────────
  const StickyNav = ({ children, maxW = 820 }) => (
    <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 52, justifyContent: "space-between", gap: 12 }}>
        {children}
      </div>
    </div>
  );

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'Inter',sans-serif" }}>
      <CSS />
      <div style={{ width: 28, height: 28, border: `2px solid ${c.border}`, borderTop: `2px solid ${c.text}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <p style={{ color: c.muted, fontSize: 14 }}>Connecting…</p>
    </div>
  );

  if (dbErr) return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, fontFamily: "'Inter',sans-serif", textAlign: "center" }}>
      <CSS />
      <div style={{ fontSize: 32 }}>⚠️</div>
      <h2 style={{ fontSize: 16, color: c.text, fontWeight: 700 }}>Database Connection Error</h2>
      <p style={{ color: c.sub, fontSize: 15, maxWidth: 360, lineHeight: 1.65 }}>{dbErr}</p>
      <Btn ch="Retry" onClick={load} />
    </div>
  );

  // ── About screen ──────────────────────────────────────────────────────────
  if (screen === "about") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter',sans-serif" }}>
      <CSS />
      <StickyNav>
        <button onClick={() => setScreen("landing")} style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 14 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 18 }}>🚀</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: c.text }}>GEAR Up</span>
        </div>
        <Toggle />
      </StickyNav>
      <div className="up" style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: c.text, marginBottom: 8 }}>The GEAR Up Mindset</h2>
          <p style={{ color: c.sub, fontSize: 15, fontStyle: "italic" }}>A shift from being taught to being a learner.</p>
        </div>
        <div style={{ ...card, padding: 32, lineHeight: 1.8, fontSize: 15, color: c.text, boxShadow: `0 10px 30px ${c.shadow}` }}>
          {[
            ["G", "rowth is the expansion of your personal knowledge and skillsets. It's about widening your horizons through every interaction, reading, or experience, recognizing that learning happens in any form, anywhere."],
            ["E", "xpertise is not just what you know, but becoming an expert at the process of learning itself. It's the agility to master new concepts quickly and the curiosity to deconstruct how the world works."],
            ["A", "utonomy means taking full charge of your learning journey. You are the architect of your own potential; you move into the driver's seat to decide your destination and choose the route that gets you there."],
            ["R", "eadiness is the state of being perpetually prepared for the future. By embracing learning as a continuous habit rather than a one-time event, you ensure you are ready for challenges that haven't even arrived yet."],
          ].map(([letter, rest], i, arr) => (
            <p key={letter} style={{ marginBottom: i < arr.length - 1 ? 20 : 0 }}>
              <strong style={{ color: c.goldText, fontSize: 18 }}>{letter}</strong>{rest}
            </p>
          ))}
        </div>
        <div style={{ marginTop: 48, textAlign: "center", paddingBottom: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 }}>Developed by TRACOM officers for TRACOM officers</div>
          <div style={{ maxWidth: 400, margin: "0 auto", fontSize: 13, color: c.sub, lineHeight: 1.6 }}>
            Have any comments or suggestions, or faced any issues?
            <div style={{ marginTop: 8 }}>
              Please reach out to the team at:<br />
              <a href="https://go.gov.sg/gearup" target="_blank" rel="noreferrer"
                style={{ color: c.goldText, fontWeight: 700, textDecoration: "none", display: "inline-block", marginTop: 4, borderBottom: `1px solid ${c.goldText}` }}>
                go.gov.sg/gearup
              </a>
            </div>
          </div>
          <div style={{ marginTop: 32, fontSize: 11, color: c.muted, letterSpacing: 3, fontWeight: 800, textTransform: "uppercase" }}>Shift Into Higher Gear</div>
        </div>
      </div>
    </div>
  );

  // ── Landing screen ────────────────────────────────────────────────────────
  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter',sans-serif" }}>
      <CSS />
      <div style={{ background: dark ? "#1a1a1a" : "#eee", borderBottom: `1px solid ${c.border}`, padding: "6px 0", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 700, color: c.sub, letterSpacing: 1 }}>
          <span style={{ color: "#f87171" }}>⏱️ GEAR UP 2026 ENDS IN:</span>
          <div style={{ display: "flex", gap: 8, color: c.text }}>
            <span>{cd.days}D</span><span>{cd.hours}H</span><span>{cd.mins}M</span><span>{cd.secs}S</span>
          </div>
        </div>
      </div>
      <StickyNav maxW={1160}>
        <button onClick={() => setScreen("about")} className="row-hover"
          style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
          ℹ️ About
        </button>
        <Toggle />
      </StickyNav>
      <div style={{ maxWidth: 1160, width: "100%", margin: "0 auto", padding: "0 24px 80px" }}>
        <div className="landing-grid" style={{ paddingTop: 40 }}>
          {/* Login card */}
          <div className="up">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 40, fontWeight: 800, color: c.text, marginBottom: 10, textAlign: "center" }}>🚀 GEAR Up</h1>
              <p style={{ fontSize: 14, textAlign: "center", color: c.sub, lineHeight: 1.6 }}>Get Recognised for Driving Your Own Development</p>
            </div>
            <div style={{ ...card, padding: 28, boxShadow: `0 10px 30px ${c.shadow}` }}>
              {!adminBox ? (
                <>
                  <p style={{ fontSize: 13, color: c.muted, letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase", fontWeight: 700 }}>Officer Access</p>
                  <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 7 }}>BRANCH</label>
                  <select value={selBranch} onChange={e => { setSelBranch(e.target.value); setSelName(""); }} style={{ ...inp, marginBottom: 16 }}>
                    <option value="">Select branch...</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                  {selBranch && (
                    <>
                      <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 7 }}>YOUR NAME</label>
                      <select value={selName} onChange={e => setSelName(e.target.value)} style={{ ...inp, marginBottom: 20 }}>
                        <option value="">Select name...</option>
                        {(byBranch[selBranch] || []).map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                      </select>
                    </>
                  )}
                  <button onClick={enterOfficer} disabled={!selBranch || !selName}
                    style={{ width: "100%", padding: 12, borderRadius: 8, background: selBranch && selName ? c.text : c.blank, color: selBranch && selName ? (dark ? "#000" : "#fff") : c.muted, border: "none", fontWeight: 700, cursor: "pointer" }}>
                    Enter Portal →
                  </button>
                  <button onClick={() => setAdminBox(true)} style={{ width: "100%", marginTop: 16, background: "none", border: "none", color: c.muted, fontSize: 13, cursor: "pointer" }}>Admin Login</button>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => setAdminBox(false)} style={{ background: "none", border: "none", color: c.sub, cursor: "pointer", fontSize: 14, marginBottom: 15 }}>← Back</button>
                  <input type="password" placeholder="Admin Password" value={adminIn} onChange={e => setAdminIn(e.target.value)} style={{ ...inp, marginBottom: 10 }} />
                  <Btn ch="Login as Admin" onClick={enterAdmin} />
                </div>
              )}
            </div>
          </div>
          {/* Live leaderboard preview */}
          <div className="up" style={{ animationDelay: "0.1s" }}>
            <p style={{ fontSize: 20, color: c.sub, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>🏆 Live Leaderboard</p>
            <div style={{ ...card, overflow: "hidden" }}>
              {sorted.slice(0, 5).map((o, i) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < 4 ? `1px solid ${c.border}` : "none", background: i < 3 ? (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)") : "transparent" }}>
                  <span style={{ fontSize: i < 3 ? 18 : 12, width: 24, fontWeight: 800, color: i === 0 ? "#c9a227" : c.muted }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{o.unit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: c.text }}>{o.total_points}</div>
                    <div style={{ fontSize: 10, color: c.muted, textTransform: "uppercase" }}>PTS</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: c.muted }}>Only showing top 5. Log in to see where you stand!</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Portal ────────────────────────────────────────────────────────────────
  const OTABS = [
    { id: "submit",      label: "Log Activity" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "mylog",       label: `My Log${mySubs.length ? ` (${mySubs.length})` : ""}` },
    { id: "rewards",     label: "Tiers & Prizes" },
  ];
  const ATABS = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "approvals",   label: `Approvals${pending.length ? ` (${pending.length})` : ""}` },
    { id: "redemptions", label: `Redemptions${pendingR.length ? ` (${pendingR.length})` : ""}` },
    { id: "settings",    label: "Settings" },
  ];
  const TABS = isAdmin ? ATABS : OTABS;
  const activeLabel = TABS.find(t => t.id === tab)?.label || "";

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter',sans-serif", overflowX: "hidden" }}>
      <CSS />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: toast.type === "err" ? "#dc2626" : (dark ? "#1a1a1a" : "#111"), color: "#fff", border: `1px solid ${toast.type === "err" ? "rgba(220,38,38,0.3)" : c.border}`, boxShadow: `0 4px 20px ${c.shadow}`, animation: "toastIn 0.2s ease", maxWidth: 280 }}>
          {toast.text}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(10px)", padding: 20 }}>
          <div style={{ ...card, width: "100%", maxWidth: 300, padding: 28, textAlign: "center", animation: "pop 0.25s ease", boxShadow: `0 20px 60px ${c.shadow}` }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{confirm.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{confirm.name}</h3>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 6, lineHeight: 1.5 }}>{confirm.desc}</p>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 22 }}>
              Costs <strong style={{ color: c.text }}>{confirm.cost} pts</strong>. You'll have <strong style={{ color: c.text }}>{myAvail - confirm.cost} pts</strong> remaining.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => redeemP(confirm)} style={{ flex: 1, padding: "10px 0", background: c.text, color: dark ? "#0a0a0a" : "#fff", fontWeight: 600, fontSize: 15, borderRadius: 7, border: "none", cursor: "pointer" }}>Confirm</button>
              <button onClick={() => setConfirm(null)} style={{ padding: "10px 14px", background: "transparent", border: `1px solid ${c.border}`, color: c.sub, fontSize: 15, borderRadius: 7, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${c.div}`, background: c.nav, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, width: 36, height: 36, background: menuOpen ? c.chipSel : "transparent", border: `1px solid ${menuOpen ? c.borderA : c.border}`, borderRadius: 8, cursor: "pointer", padding: 0 }}>
              <span style={{ width: 16, height: 2, background: c.text, borderRadius: 2, transition: "0.18s", transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
              <span style={{ width: 16, height: 2, background: c.text, borderRadius: 2, transition: "0.18s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 16, height: 2, background: c.text, borderRadius: 2, transition: "0.18s", transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>{activeLabel}</span>
          </div>
          <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setTab("submit")}>
            <div style={{ fontWeight: 800, fontSize: 20, color: c.text, lineHeight: 1 }}>🚀 GEAR Up</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}><Toggle /></div>
        </div>
        {menuOpen && (
          <div className="up" style={{ borderTop: `1px solid ${c.border}`, background: c.nav, padding: "8px 18px 12px" }}>
            {TABS.map(tb => (
              <button key={tb.id} onClick={() => { setTab(tb.id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: 12, borderRadius: 8, border: "none", background: tab === tb.id ? c.chipSel : "transparent", color: tab === tb.id ? c.text : c.sub, fontSize: 14, fontWeight: tab === tb.id ? 600 : 400, marginBottom: 2, cursor: "pointer" }}>
                {tb.label}
              </button>
            ))}
            <button onClick={() => setScreen("landing")} style={{ width: "100%", textAlign: "left", padding: 12, color: "#f87171", background: "none", border: "none", fontSize: 14, cursor: "pointer" }}>Logout</button>
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 18px 60px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", boxSizing: "border-box" }}>

        {/* ── Log Activity ── */}
        {tab === "submit" && !isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 540 }}>
            {/* Tier dashboard card */}
            <div style={{
              marginBottom: 26, borderRadius: 14, padding: "22px 22px 20px",
              background: dark ? "linear-gradient(135deg,rgb(238,103,0),rgb(255,183,0))" : "linear-gradient(135deg,rgb(104,0,165),rgb(17,0,168))",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: dark ? "0 0 0 1px rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.45)" : "0 2px 16px rgba(0,0,0,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)", boxShadow: "0 0 0 4px rgba(255,255,255,0.08),0 4px 12px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {tier.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.unit}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{tierPts}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>pts</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Rank #{myRank} · {myAvail} avail.</div>
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 14 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{tier.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{tier.name}</span>
                </div>
                {isChamp
                  ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>★ Max Tier Reached</span>
                  : <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{tierPtsLeft} pts to</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{nextTier.icon} {nextTier.name}</span>
                    </div>
                }
              </div>
              <div style={{ height: 14, borderRadius: 99, background: "rgba(0,0,0,0.35)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
                <div style={{ height: "100%", width: `${tierBarPct}%`, borderRadius: 99, minWidth: tierBarPct > 0 ? 14 : 0, background: isChamp ? "linear-gradient(90deg,#f0c040,#ffe566)" : "linear-gradient(90deg,rgba(255,255,255,0.7),#fff)", boxShadow: isChamp ? "0 0 12px rgba(255,220,60,0.8)" : "0 0 12px rgba(255,255,255,0.7)", transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tier.min} pts</span>
                {!isChamp && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{nextTier.min} pts</span>}
              </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Log an Activity</h2>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 20, lineHeight: 1.65 }}>Select what you did — points are awarded once your Reporting Officer approves.</p>
            <p style={{ fontSize: 12, color: c.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Select Activity *</p>
            <div style={{ ...card, overflow: "hidden", marginBottom: 18 }}>
              {RUBRICS.map((r, idx) => {
                const sel = form.rubricId === String(r.id);
                return (
                  <div key={r.id} onClick={() => setForm(p => ({ ...p, rubricId: String(r.id) }))} className="row-hover"
                    style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: idx < RUBRICS.length - 1 ? `1px solid ${c.border}` : "none", background: sel ? c.chipSel : "transparent", transition: "background 0.1s" }}>
                    <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{r.icon}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: sel ? 600 : 400, color: c.text, lineHeight: 1.4 }}>{r.activity}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: sel ? c.text : c.muted, flexShrink: 0 }}>+{r.points}</span>
                    {sel && <span style={{ fontSize: 13, color: c.text, flexShrink: 0 }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ ...card, padding: 20 }}>
              <label style={{ fontSize: 12, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ ...inp, marginBottom: 16 }} />
              <label style={{ fontSize: 12, color: c.muted, letterSpacing: 1.5, display: "block", marginBottom: 7, textTransform: "uppercase" }}>Description / Evidence *</label>
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder='e.g. Attended "Leadership in Action" workshop, full day.' rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.6, marginBottom: 16 }} />
              {form.rubricId && (
                <div style={{ padding: "10px 14px", background: c.infoBg, border: `1px solid ${c.infoBdr}`, borderRadius: 7, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: c.sub }}>Points upon approval</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: c.text }}>+{RUBRICS.find(r => r.id === parseInt(form.rubricId))?.points}</span>
                </div>
              )}
              <button onClick={submitAct} disabled={!form.rubricId || !form.date || !form.desc.trim()}
                style={{ width: "100%", padding: "11px 0", fontSize: 15, fontWeight: 600, borderRadius: 7, border: `1px solid ${form.rubricId && form.date && form.desc.trim() ? c.borderA : c.border}`, cursor: form.rubricId && form.date && form.desc.trim() ? "pointer" : "default", background: form.rubricId && form.date && form.desc.trim() ? c.text : "transparent", color: form.rubricId && form.date && form.desc.trim() ? (dark ? "#0a0a0a" : "#fff") : c.muted, transition: "all 0.16s" }}>
                Submit for Approval →
              </button>
            </div>
          </div>
        )}

        {/* ── Leaderboard ── */}
        {tab === "leaderboard" && (
          <div className="up" style={{ width: "100%", maxWidth: 800 }}>
            <p style={{ fontSize: 12, color: c.muted, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase", textAlign: "center" }}>Top 3 Officers</p>
            {/* Podium */}
            <div className="portal-top3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
              {[sorted[1], sorted[0], sorted[2]].map((o, i) => {
                if (!o) return <div key={i} />;
                const pos  = [2, 1, 3][i];
                const isMe = user && o.id === user.id;
                return (
                  <div key={o.id} style={{ ...card, padding: pos === 1 ? "24px 12px" : "16px 10px", textAlign: "center", border: isMe ? `2px solid ${c.borderA}` : pos === 1 ? `1px solid rgba(201,162,39,0.18)` : `1px solid ${c.border}`, background: pos === 1 ? (dark ? "rgba(201,162,39,0.08)" : "rgba(255,248,210,0.6)") : c.surface, transform: pos === 1 ? "scale(1.05)" : "scale(1)", zIndex: pos === 1 ? 2 : 1 }}>
                    <div style={{ fontSize: pos === 1 ? 32 : 24, marginBottom: 8 }}>{["🥈","🥇","🥉"][i]}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text, lineHeight: 1.2, marginBottom: 2 }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: c.sub, marginBottom: 10 }}>{o.unit}</div>
                    <div style={{ fontSize: pos === 1 ? 24 : 18, fontWeight: 800, color: pos === 1 ? c.goldText : c.text, lineHeight: 1 }}>{o.total_points}</div>
                    <div style={{ fontSize: 10, color: c.muted }}>PTS</div>
                  </div>
                );
              })}
            </div>
            {/* Toggle */}
            <div style={{ display: "flex", background: c.chip, padding: 4, borderRadius: 10, marginBottom: 20, border: `1px solid ${c.border}` }}>
              {[["officers","👥 Officers"],["branches","🏢 Branches"]].map(([id, label]) => (
                <button key={id} onClick={() => setLeaderboardTab(id)}
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", cursor: "pointer", background: leaderboardTab === id ? c.surface : "transparent", color: leaderboardTab === id ? c.text : c.sub, fontWeight: 600, fontSize: 14 }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Tables */}
            <div className="up" key={leaderboardTab}>
              {leaderboardTab === "officers" ? (
                <div style={{ ...card, overflow: "hidden" }}>
                  {sorted.slice(3).map((o, i) => {
                    const oTier = getTier(o.total_points);
                    const isMe  = user && o.id === user.id;
                    return (
                      <div key={o.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${c.border}`, background: isMe ? c.infoBg : "transparent" }}>
                        <span style={{ fontSize: 13, color: c.muted, width: 24, flexShrink: 0 }}>#{i + 4}</span>
                        <span style={{ fontSize: 15, flexShrink: 0 }} title={oTier.name}>{oTier.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: c.text, display: "flex", alignItems: "center", gap: 6 }}>
                            {o.name}
                            {isMe && <span style={{ fontSize: 10, color: c.muted, fontWeight: 400, background: c.chipSel, padding: "1px 6px", borderRadius: 3 }}>you</span>}
                          </div>
                          <div style={{ fontSize: 11, color: c.muted }}>{o.unit}</div>
                        </div>
                        <div style={{ textAlign: "right", fontWeight: 700, color: c.text, flexShrink: 0 }}>{o.total_points}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ ...card, overflow: "hidden" }}>
                  {unitScores.map((u, i) => {
                    const isOpen = !!expandedBranches[u.unit];
                    const branchOfficers = [...(byBranch[u.unit] || [])].sort((a, b) => b.total_points - a.total_points);
                    return (
                      <div key={u.unit}>
                        <div className="row-hover" onClick={() => toggleBranch(u.unit)}
                          style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.border}`, cursor: "pointer", background: isOpen ? c.infoBg : "transparent", transition: "background 0.15s" }}>
                          <span style={{ fontSize: 16, width: 24, flexShrink: 0 }}>{i === 0 ? "🥇" : i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{u.unit}</div>
                            <div style={{ fontSize: 11, color: c.muted }}>{u.count} officer{u.count !== 1 ? "s" : ""} · tap to {isOpen ? "collapse" : "expand"}</div>
                          </div>
                          <div style={{ textAlign: "right", marginRight: 10 }}>
                            <div style={{ fontWeight: 800, color: i === 0 ? c.goldText : c.text, fontSize: 16 }}>{u.avg}</div>
                            <div style={{ fontSize: 10, color: c.muted }}>AVG PTS</div>
                          </div>
                          <span style={{ fontSize: 11, color: c.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}>▼</span>
                        </div>
                        {isOpen && (
                          <div className="up" style={{ borderBottom: `1px solid ${c.border}` }}>
                            {branchOfficers.map((o, oi) => {
                              const isMe  = user && o.id === user.id;
                              const oTier = getTier(o.total_points);
                              return (
                                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 10px 48px", borderBottom: oi < branchOfficers.length - 1 ? `1px solid ${c.border}` : "none", background: isMe ? (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") : (dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)") }}>
                                  <span style={{ fontSize: 12, color: c.muted, width: 20, flexShrink: 0 }}>#{oi + 1}</span>
                                  <span style={{ fontSize: 14, flexShrink: 0 }} title={oTier.name}>{oTier.icon}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: isMe ? 700 : 500, color: c.text, display: "flex", alignItems: "center", gap: 6 }}>
                                      {o.name}
                                      {isMe && <span style={{ fontSize: 10, color: c.muted, fontWeight: 400, background: c.chipSel, padding: "1px 6px", borderRadius: 3 }}>you</span>}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: c.text }}>{o.total_points}</div>
                                    <div style={{ fontSize: 10, color: c.muted }}>pts</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── My Log ── */}
        {tab === "mylog" && !isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 600 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>My Activity Log</h2>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>Your submitted activities and their approval status.</p>
            {mySubs.length === 0 ? (
              <div style={{ ...card, padding: 44, textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>📭</div>
                <div style={{ color: c.sub, fontSize: 15, marginBottom: 16 }}>No activities logged yet.</div>
                <Btn ch="Log your first activity →" onClick={() => setTab("submit")} v="ghost" sz="sm" />
              </div>
            ) : (
              <div style={{ ...card, overflow: "hidden" }}>
                {mySubs.map((s, i) => (
                  <div key={s.id} style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < mySubs.length - 1 ? `1px solid ${c.border}` : "none" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                      <div style={{ fontSize: 12, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                    </div>
                    <span style={{ fontSize: 15, color: c.text, flexShrink: 0, marginRight: 6, fontWeight: 700 }}>+{s.points}</span>
                    <Pill status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tiers & Prizes ── */}
        {tab === "rewards" && (
          <div className="up" style={{ width: "100%", maxWidth: 820 }}>
            <TiersGrid c={c} dark={dark} card={card} />
            <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 48 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text }}>Prize Catalogue</h2>
                <div style={{ ...card, padding: "8px 16px", background: c.infoBg, textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: c.muted, textTransform: "uppercase" }}>Your Balance</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: c.text }}>{myAvail} pts</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {cats.map(ct => (
                  <button key={ct} onClick={() => setCatF(ct)}
                    style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${catF === ct ? c.borderA : c.border}`, background: catF === ct ? c.text : "transparent", color: catF === ct ? (dark ? "#000" : "#fff") : c.sub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {ct}
                  </button>
                ))}
              </div>
              <div className="portal-cards-3" style={{ marginBottom: 32 }}>
                {catItems.map(p => {
                  const can = myAvail >= p.cost;
                  return (
                    <div key={p.id} onClick={() => can && !p.tba && setConfirm(p)}
                      style={{ ...card, padding: 16, opacity: can ? 1 : 0.5, cursor: can && !p.tba ? "pointer" : "default" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                      <div style={{ fontSize: 11, color: p.color, fontWeight: 700, textTransform: "uppercase" }}>{p.cat}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginTop: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: c.sub, margin: "8px 0 16px" }}>{p.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 800, color: c.text }}>{p.cost} pts</div>
                        {can && !p.tba && <div style={{ fontSize: 12, color: c.goldText, fontWeight: 700 }}>Redeem →</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <SpecialSection c={c} dark={dark} card={card} />
            </div>
          </div>
        )}

        {/* ── Admin: Approvals ── */}
        {tab === "approvals" && isAdmin && (
          <div className="up" style={{ width: "100%", maxWidth: 700 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Activity Approvals</h2>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>Approve or reject officer activity submissions.</p>
            {pending.length === 0
              ? <EmptyBox icon="✨" msg="All caught up — no pending submissions." c={c} card={card} />
              : (
                <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
                  {pending.map((s, i) => (
                    <div key={s.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < pending.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, color: c.text, fontWeight: 700 }}>{s.officer_name}</span>
                          <span style={{ fontSize: 11, color: c.muted }}>·</span>
                          <span style={{ fontSize: 13, color: c.sub }}>{s.unit}</span>
                        </div>
                        <div style={{ fontSize: 14, color: c.text, marginBottom: 2 }}>{s.activity}</div>
                        <div style={{ fontSize: 12, color: c.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.date} · {s.description}</div>
                      </div>
                      <span style={{ fontSize: 15, color: c.goldText, flexShrink: 0, fontWeight: 700 }}>+{s.points}</span>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <Btn ch="Approve" v="success" sz="sm" onClick={() => approve(s.id)} />
                        <Btn ch="Reject"  v="danger"  sz="sm" onClick={() => reject(s.id)}  />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {subs.filter(s => s.status !== "pending").length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: c.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>History</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {subs.filter(s => s.status !== "pending").map((s, i, arr) => (
                    <div key={s.id} style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 10, opacity: 0.55, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 15 }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{s.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {s.activity}</span></div>
                      </div>
                      <span style={{ fontSize: 13, color: c.text, flexShrink: 0 }}>+{s.points}</span>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Prize Redemptions</h2>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>Fulfil or reject officer prize redemption requests.</p>
            {pendingR.length === 0
              ? <EmptyBox icon="🎁" msg="No pending redemptions." c={c} card={card} />
              : (
                <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
                  {pendingR.map((r, i) => (
                    <div key={r.id} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < pendingR.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{r.prize_icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 14, color: c.text, fontWeight: 700 }}>{r.officer_name}</span>
                          <span style={{ fontSize: 11, color: c.muted }}>·</span>
                          <span style={{ fontSize: 13, color: c.sub }}>{r.unit}</span>
                        </div>
                        <div style={{ fontSize: 14, color: c.text }}>{r.prize_name}</div>
                      </div>
                      <span style={{ fontSize: 14, color: c.goldText, flexShrink: 0, fontWeight: 700 }}>{r.cost} pts</span>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <Btn ch="Fulfil" v="success" sz="sm" onClick={() => fulfilR(r.id, r.officer_name)} />
                        <Btn ch="Reject" v="danger"  sz="sm" onClick={() => rejectR(r.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            {redems.filter(r => r.status !== "pending").length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: c.muted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>History</p>
                <div style={{ ...card, overflow: "hidden" }}>
                  {redems.filter(r => r.status !== "pending").map((r, i, arr) => (
                    <div key={r.id} style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 10, opacity: 0.55, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : "none" }}>
                      <span style={{ fontSize: 15 }}>{r.prize_icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{r.officer_name} <span style={{ color: c.muted, fontWeight: 400 }}>· {r.prize_name}</span></div>
                      </div>
                      <span style={{ fontSize: 13, color: c.goldText, flexShrink: 0 }}>{r.cost} pts</span>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: c.text }}>Settings</h2>
            <p style={{ color: c.sub, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Manage officers, branches, and admin password.</p>

            <Sec label="Add New Officer" c={c}>
              <div style={{ ...card, padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Full Name</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Tan" style={{ ...inp }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Branch</label>
                    <select value={newBr} onChange={e => setNewBr(e.target.value)} style={{ ...inp }}>
                      <option value="">Select branch…</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <Btn ch={sLoading ? "Adding…" : "Add Officer"} onClick={addOfficer} disabled={!newName.trim() || !newBr || sLoading} />
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
                        <span style={{ fontSize: 11, color: c.muted, letterSpacing: 2, textTransform: "uppercase" }}>{br.name}</span>
                      </div>
                      {bOfs.map(o => (
                        <div key={o.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                          {editOf?.id === o.id ? (
                            <div style={{ padding: "15px 16px", background: c.infoBg }}>
                              <p style={{ fontSize: 12, color: c.sub, fontWeight: 600, marginBottom: 10 }}>Editing: {editOf.name}</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                <div>
                                  <label style={{ fontSize: 11, color: c.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Full Name</label>
                                  <input value={editN} onChange={e => setEditN(e.target.value)} style={{ ...inp, padding: "8px 10px", fontSize: 14 }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: c.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Branch</label>
                                  <select value={editB} onChange={e => setEditB(e.target.value)} style={{ ...inp, padding: "8px 10px", fontSize: 14 }}>
                                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Btn ch={sLoading ? "Saving…" : "Save Changes"} sz="sm" onClick={saveEdit} disabled={!editN.trim() || sLoading} />
                                <Btn ch="Cancel" v="ghost" sz="sm" onClick={cancelEdit} />
                              </div>
                            </div>
                          ) : (
                            <div className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.chip, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.sub, flexShrink: 0 }}>{initials(o.name)}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{o.name}</div>
                                <div style={{ fontSize: 11, color: c.muted }}>{o.total_points} pts</div>
                              </div>
                              <Btn ch="Edit"   v="ghost"  sz="sm" onClick={() => startEdit(o)}               disabled={sLoading} />
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
                    <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>New Branch Name</label>
                    <input value={newBrName} onChange={e => setNewBrName(e.target.value)} placeholder="e.g. Operations" style={{ ...inp }} />
                  </div>
                  <Btn ch="Add" onClick={addBranch} disabled={!newBrName.trim() || sLoading} />
                </div>
              </div>
              <div style={{ ...card, overflow: "hidden" }}>
                {branches.map((br, i) => (
                  <div key={br.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: i < branches.length - 1 ? `1px solid ${c.border}` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{br.name}</div>
                      <div style={{ fontSize: 11, color: c.muted }}>{(byBranch[br.name] || []).length} officers</div>
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
                    <label style={{ fontSize: 12, color: c.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>New Password (min 6 characters)</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" style={{ ...inp }} />
                  </div>
                  <Btn ch="Update" onClick={changePw} disabled={newPw.length < 6 || sLoading} />
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

function Sec({ label, children, c }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 12, color: c.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>{label}</p>
      {children}
    </div>
  );
}

function TiersGrid({ c, dark, card }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 12, color: c.muted, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase", textAlign: "center" }}>The Learning Journey</p>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center", color: c.text }}>Achievement Tiers</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {TIERS.map(t => (
          <div key={t.name} style={{ ...card, padding: "24px 16px", textAlign: "center", borderTop: `4px solid ${t.color}`, background: dark ? "rgba(255,255,255,0.02)" : "#fff" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: c.text, marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: c.sub }}>{tierRange(t)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecialSection({ c, dark, card }) {
  return (
    <div style={{ ...card, padding: 20, border: `1px solid ${dark ? "rgba(201,162,39,0.15)" : "rgba(160,120,0,0.15)"}` }}>
      <p style={{ fontSize: 11, color: "#c9a227", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>★ Special Prizes — Mini-Retreat Event</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { icon: "🥇🥈🥉", title: "Top 3 Officers", desc: "Exclusive prize + public recognition at Mini-Retreat" },
          { icon: "🏢",      title: "Top Branch",    desc: "Branch trophy + special mention at Mini-Retreat" },
        ].map(item => (
          <div key={item.title} style={{ padding: "14px 15px", background: dark ? "rgba(201,162,39,0.03)" : "rgba(255,248,200,0.3)", border: `1px solid ${dark ? "rgba(201,162,39,0.08)" : "rgba(160,120,0,0.1)"}`, borderRadius: 8 }}>
            <div style={{ fontSize: 20, marginBottom: 7 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: c.sub, lineHeight: 1.55 }}>{item.desc}</div>
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
      <div style={{ color: c.sub, fontSize: 15 }}>{msg}</div>
    </div>
  );
}
