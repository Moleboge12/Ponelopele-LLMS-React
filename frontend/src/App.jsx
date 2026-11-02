import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Laptop, LayoutGrid, ClipboardList, Repeat2, Users, BellRing, BarChart3, Wrench, Settings, HelpCircle, Camera, LogOut, User, Trash2, Upload, GraduationCap, Rocket, Plus, X, Image as ImageIcon, Edit3, Package, CheckCircle2, AlertTriangle, Clock, Calendar, CheckCircle, FileText, Download, Filter } from 'lucide-react';

const DEFAULT_LAPTOPS = [
  {id:'LPT001', asset_tag:'PO-001', brand:'Dell', model:'Latitude 7420', status:'available', ram:'16GB', storage:'512GB SSD', cpu:'i7-1185G7', condition:'Excellent', photo:'', created_at:'2026-01-10'},
  {id:'LPT002', asset_tag:'PO-002', brand:'HP', model:'EliteBook 840', status:'issued', ram:'8GB', storage:'256GB SSD', cpu:'i5-1135G7', condition:'Good', photo:'', created_at:'2026-01-12'},
  {id:'LPT003', asset_tag:'PO-003', brand:'Lenovo', model:'ThinkPad T14', status:'available', ram:'16GB', storage:'1TB SSD', cpu:'i7-1165G7', condition:'Excellent', photo:'', created_at:'2026-01-15'},
  {id:'LPT004', asset_tag:'PO-004', brand:'Apple', model:'MacBook Air M1', status:'available', ram:'8GB', storage:'256GB SSD', cpu:'M1', condition:'Excellent', photo:'', created_at:'2026-01-18'},
  {id:'LPT005', asset_tag:'PO-005', brand:'Dell', model:'XPS 13', status:'maintenance', ram:'16GB', storage:'512GB SSD', cpu:'i7-1165G7', condition:'Good', photo:'', created_at:'2026-01-20'},
];

const LOGO_URL = "/oracle_logo.png";
const LOGO_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' rx='24' fill='white'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-weight='900' font-size='28' fill='black'>PO&#10;O</text></svg>`;
const getGreeting = (date) => {
  const h = date.getHours();
  if(h < 12) return "Good morning";
  if(h < 17) return "Good afternoon";
  return "Good evening";
};
// ===== REQUEST LAPTOP - VERTICAL CARDS WITH PHOTOS, REASON, DATE & TIME =====
function RequestLaptopPage({ laptops, requests, user, setRequests, addAudit }){
  const [search, setSearch] = useState('');
  const [forms, setForms] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => { setToastMsg(msg); setTimeout(()=>setToastMsg(''), 4000); };
  const update = (id, field, value) => setForms(prev => ({ ...prev, [id]: { ...(prev[id]||{reason:'', needDate:'', returnDate:''}), [field]: value }}));
  const submit = (lp) => {
    const f = forms[lp.id] || {};
    const reason = (f.reason||'').trim();
    const needDate = f.needDate;
    const returnDate = f.returnDate;
    if(!reason){ showToast('❌ Please state reason for borrowing'); return; }
    if(!needDate){ showToast('❌ Please insert date & time you need laptop'); return; }
    const dup = requests.find(r => String(r.learnerID)===String(user?.userID) && r.laptopId===lp.id && r.status==='pending');
    if(dup){ showToast('⚠ Already requested this laptop - pending'); return; }
    const newReq = { id:'REQ'+Date.now(), laptopId:lp.id, laptop:lp.asset_tag, asset_tag:lp.asset_tag, brand:lp.brand, model:lp.model, learner:user?.name||'Learner', learnerID:user?.userID, reason, needDate, returnDate, status:'pending', date:new Date().toLocaleDateString(), created_at:new Date().toISOString() };
    setRequests(prev=>[newReq, ...prev]);
    if(addAudit) addAudit('LOAN_REQUESTED', `${user?.name} requested ${lp.asset_tag} for ${needDate} - Reason: ${reason}`);
    showToast(`✅ Request sent! ${lp.brand} ${lp.model} for ${new Date(needDate).toLocaleString()}`);
    setForms(prev=>({...prev, [lp.id]:{reason:'', needDate:'', returnDate:''}}));
  };
  const filtered = laptops.filter(l=> l.status==='available' && (!search || `${l.asset_tag} ${l.brand} ${l.model}`.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex items-center justify-between"><div><h1 className="text-[28px] font-bold mt-2">Request Laptop</h1></div><div className="text-[12px] bg-[#dcfce7] text-[#166534] px-4 py-2 rounded-full font-bold">{filtered.length} Available</div></div>
      <div className="relative bg-white border border-[#ecebe8] rounded-[16px] p-4 shadow-sm"><Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-[#a1a1aa]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search brand, model, asset tag..." className="w-full h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-full pl-10 pr-4 text-[13px] outline-none focus:bg-white focus:border-[#111]"/></div>
      {toastMsg && <div className="fixed bottom-6 right-6 z-[200] bg-[#111] text-white px-6 py-3 rounded-full shadow-2xl text-[13px] font-medium">{toastMsg}</div>}
      <div className="space-y-5">
        {filtered.map(lp=>{
          const f = forms[lp.id]||{reason:'', needDate:'', returnDate:''};
          return (
            <div key={lp.id} className="bg-white border-2 border-[#ecebe8] rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#E30613]/20 transition-all flex flex-col md:flex-row">
              <div className="w-full md:w-[300px] h-[260px] md:h-[340px] relative flex-shrink-0 overflow-hidden bg-[#f8f7f4] border-b md:border-b-0 md:border-r border-[#f4f4f5]">
                <img src={lp.photo || 'https://images.unsplash.com/photo-1588872657576-7efd1f1555ed?w=400&h=400&fit=crop'} alt={lp.brand} className="w-full h-full object-cover" onError={e=>e.target.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 flex flex-col gap-2"><span className="px-3 py-1.5 rounded-full bg-[#22c55e] text-white text-[11px] font-bold shadow-lg">● AVAILABLE</span><span className="px-3 py-1 rounded-full bg-black/80 text-white text-[11px] font-mono font-bold">{lp.asset_tag}</span></div>
                <div className="absolute bottom-0 left-0 right-0 p-4"><p className="text-white font-bold text-[16px]">{lp.brand} {lp.model}</p><p className="text-white/80 text-[12px] mt-1">{lp.ram} • {lp.storage} • {lp.condition}</p></div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start"><div><h3 className="font-bold text-[18px]">{lp.brand} {lp.model}</h3><p className="text-[11px] text-[#a1a1aa] font-mono mt-1">{lp.id} • {lp.cpu}</p></div><span className="px-3 py-1 rounded-full bg-[#f4f4f5] text-[11px]">{lp.condition}</span></div>
                <div className="grid grid-cols-3 gap-2 mt-4"><div className="bg-[#fafaf9] border rounded-xl p-3"><p className="text-[9px] text-[#a1a1aa] uppercase">RAM</p><p className="text-[14px] font-bold mt-1">{lp.ram}</p></div><div className="bg-[#fafaf9] border rounded-xl p-3"><p className="text-[9px] text-[#a1a1aa] uppercase">Storage</p><p className="text-[14px] font-bold mt-1">{lp.storage}</p></div><div className="bg-[#fafaf9] border rounded-xl p-3"><p className="text-[9px] text-[#a1a1aa] uppercase">CPU</p><p className="text-[13px] font-bold mt-1">{lp.cpu}</p></div></div>
                <div className="mt-5 p-4 bg-[#fefefe] rounded-[16px] border-2 border-dashed border-[#e4e4e7]">
                  <p className="text-[12px] font-bold">💻 Request This Laptop - Fill Below</p>
                  <div className="mt-4"><label className="text-[11px] font-bold uppercase">Reason for loaning * <span className="text-[#E30613]">Required</span></label><textarea value={f.reason} onChange={e=>update(lp.id,'reason', e.target.value)} placeholder="Why do you need this laptop? e.g. Research project, exam preparation..." className="w-full mt-2 min-h-[90px] bg-white border-2 border-[#e4e4e7] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#E30613] resize-none"/></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><div><label className="text-[11px] font-bold uppercase">Date & Time needed * <span className="text-[#E30613]">Required</span></label><input type="datetime-local" value={f.needDate||''} onChange={e=>update(lp.id,'needDate', e.target.value)} min={new Date().toISOString().slice(0,16)} className="w-full mt-2 h-12 bg-white border-2 border-[#e4e4e7] rounded-xl px-4 text-[13px] font-medium outline-none focus:border-[#E30613]"/><p className="text-[10px] text-[#22c55e] mt-1">📅 Pick date & time</p></div><div><label className="text-[11px] font-bold uppercase text-[#71717a]">Return Date & Time (Optional)</label><input type="datetime-local" value={f.returnDate||''} onChange={e=>update(lp.id,'returnDate', e.target.value)} min={new Date().toISOString().slice(0,16)} className="w-full mt-2 h-12 bg-white border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none focus:border-[#111]"/></div></div>
                  <button onClick={()=>submit(lp)} className="w-full mt-5 h-[52px] bg-[#E30613] text-white rounded-full font-bold text-[14px] hover:bg-[#c00510] flex items-center justify-center gap-3 shadow-lg"><Calendar size={20}/> Request Laptop for Selected Date & Time</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <div className="bg-white border-2 border-dashed rounded-[24px] p-12 text-center"><Laptop size={48} className="mx-auto text-[#d4d4d8]"/><p className="text-[16px] font-bold mt-4">No laptops available</p><p className="text-[12px] text-[#a1a1aa] mt-2">All laptops are issued or in maintenance — check again later</p></div>}
      </div>
    </div>
  );
}

export default function App(){
  const [users, setUsers] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_users')||'[]')}catch{return[]}});
  const [user, setUser] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_user')||'null')}catch{return null}});
  const [loans, setLoans] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_loans')||'[{"id":"LN-2002","learner":"Thato Molefe","learnerId":"STU123457","laptop":"LPT002","issue":"20 Oct 2026","due":"03 Nov 2026","status":"Issued"}]')}catch{return [{id:"LN-2002",learner:"Thato Molefe",learnerId:"STU123457",laptop:"LPT002",issue:"20 Oct 2026",due:"03 Nov 2026",status:"Issued"}]}});
  const [laptops, setLaptops] = useState(()=>{ try{ const s=localStorage.getItem('llms_laptops'); if(s) return JSON.parse(s); return DEFAULT_LAPTOPS }catch{return DEFAULT_LAPTOPS}});
  const [activePage, setActivePage] = useState('overview');
  const [profilePic, setProfilePic] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [loginForm, setLoginForm] = useState({userID:'', password:'', role:'learner'});
  const [regForm, setRegForm] = useState({name:'', userID:'', password:'', confirmPassword:'', role:'learner'});
  const [showPasswords, setShowPasswords] = useState({reg:false, regConfirm:false, login:false, reset:false, resetConfirm:false});
  const [showReset, setShowReset] = useState(false);
  const [resetForm, setResetForm] = useState({userID:'', newPassword:'', confirmPassword:''});
  const [showReg, setShowReg] = useState(true);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('active');
  const [logoErr, setLogoErr] = useState(false);
  const [theme, setTheme] = useState(()=> localStorage.getItem('llms_theme')||'light');
  const [fontSize, setFontSize] = useState(()=> Number(localStorage.getItem('llms_fontSize')||14));
  const [notificationsOn, setNotificationsOn] = useState(()=> localStorage.getItem('llms_notifications')!=='off');
  const [accent, setAccent] = useState(()=> localStorage.getItem('llms_accent')||'#E30613');
  const [auditLog, setAuditLog] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_audit')||'[]')}catch{return []}});
  const [requests, setRequests] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_requests')||'[]')}catch{return []}});
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [learnerSearch, setLearnerSearch] = useState('');
  const [showLearnerModal, setShowLearnerModal] = useState(false);
  const [learnerForm, setLearnerForm] = useState({name:'', userID:'', password:'', email:''});
  const [editingUser, setEditingUser] = useState(null);
  const [learnerTab, setLearnerTab] = useState('accounts');
  const [showPwdModal, setShowPwdModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const fileRef = useRef(null);
  const headerFileRef = useRef(null);
  const laptopPhotoRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [laptopForm, setLaptopForm] = useState({asset_tag:'', brand:'', model:'', status:'available', ram:'', storage:'', cpu:'', condition:'Good', photo:''});
  const [laptopSearch, setLaptopSearch] = useState('');
  const [laptopFilter, setLaptopFilter] = useState('all');

  const showToast = (t)=>{ setToast(t); setTimeout(()=>setToast(null),3500); };
  useEffect(()=>{ localStorage.setItem('llms_users', JSON.stringify(users))},[users]);
  useEffect(()=>{ localStorage.setItem('llms_loans', JSON.stringify(loans))},[loans]);
  useEffect(()=>{ localStorage.setItem('llms_audit', JSON.stringify(auditLog))},[auditLog]);
  useEffect(()=>{ localStorage.setItem('llms_requests', JSON.stringify(requests))},[requests]);
  useEffect(()=>{ const id=setInterval(()=>setCurrentDateTime(new Date()), 60000); return ()=>clearInterval(id); },[]);
  useEffect(()=>{ localStorage.setItem('llms_laptops', JSON.stringify(laptops))},[laptops]);
  // Per-user profile picture - each user has own pic
  useEffect(()=>{
    if(user?.userID){
      const saved = localStorage.getItem(`llms_pic_${user.userID}`);
      if(saved){ setProfilePic(saved); }
      else {
        const found = users.find(u=> String(u.userID)===String(user.userID));
        if(found?.profilePic) setProfilePic(found.profilePic);
        else setProfilePic('');
      }
    } else {
      setProfilePic('');
    }
  }, [user?.userID]);

  useEffect(()=>{
    if(!user?.userID) return;
    if(profilePic){
      localStorage.setItem(`llms_pic_${user.userID}`, profilePic);
      // also save in users array so admin can see and it persists
      setUsers(prev => prev.map(u=> String(u.userID)===String(user.userID) ? {...u, profilePic} : u));
    } else {
      localStorage.removeItem(`llms_pic_${user.userID}`);
    }
  },[profilePic]);
  const isValid = (n)=> /^\d{6}$/.test(String(n||''));
  const addAudit = (action, detail)=>{ const entry={id:Date.now()+Math.random(), action, detail, user:user?.name||'System', userID:user?.userID||'---', timestamp:new Date().toLocaleString()}; setAuditLog(prev=>[entry, ...prev].slice(0,200)); };
  const exportCSV = (filename, rows)=>{ if(!rows.length) return showToast('No data to export'); const headers=Object.keys(rows[0]); const csv=[headers.join(','), ...rows.map(r=> headers.map(h=> `"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); showToast(`Exported ${filename}`); addAudit('REPORT_EXPORTED',`Exported ${filename} (${rows.length} rows)`); };

  const handleLogin = (e)=>{
    e.preventDefault();
    if(!isValid(loginForm.userID)) return setMsg('UserID must be 6 digits');
    const f=users.find(u=> String(u.userID)===String(loginForm.userID));
    if(f){ setUser(f); localStorage.setItem('llms_user', JSON.stringify(f)); addAudit('USER_LOGIN', `${f.name} (${f.userID}) logged in as ${f.role}`); showToast('Welcome '+f.name); }
    else setMsg('UserID not found - Register first');
  };
  const handleRegister = (e)=>{
    e.preventDefault();
    if(!regForm.name.trim()) return setMsg('Full Name required');
    if(!isValid(regForm.userID)) return setMsg('UserID must be 6 digits');
    if(regForm.password.length<6) return setMsg('Password min 6 characters');
    if(regForm.password !== regForm.confirmPassword) return setMsg('Passwords do not match - Confirm password must equal password');
    if(users.some(u=> String(u.userID)===String(regForm.userID))) return setMsg('UserID exists - Please Login or Reset Password');
    const nu={id:Date.now(), name:regForm.name.trim(), userID:String(regForm.userID), email:regForm.userID+'@student.edu', phone:'', role:regForm.role, password:regForm.password, created_at:new Date().toISOString()};
    setUsers([...users, nu]); localStorage.setItem('llms_user', JSON.stringify(nu)); setUser(nu); addAudit('ACCOUNT_CREATED', `New ${nu.role} account: ${nu.name} (${nu.userID})`); showToast('✅ Account created - Welcome '+nu.name);
  };

  const handleResetPassword = (e)=>{
    e.preventDefault();
    if(!isValid(resetForm.userID)) return setMsg('Enter valid 6-digit UserID to reset');
    if(resetForm.newPassword.length<6) return setMsg('New password min 6 characters');
    if(resetForm.newPassword !== resetForm.confirmPassword) return setMsg('New passwords do not match');
    const idx = users.findIndex(u=> String(u.userID)===String(resetForm.userID));
    if(idx===-1) return setMsg('UserID not found - Cannot reset');
    const updated = [...users];
    updated[idx] = {...updated[idx], password: resetForm.newPassword};
    setUsers(updated);
    addAudit('PASSWORD_RESET', `Password reset for ${updated[idx].name} (${updated[idx].userID})`);
    setMsg(''); setShowReset(false); setResetForm({userID:'', newPassword:'', confirmPassword:''});
    showToast('✅ Password reset successful - Please login with new password');
    setShowReg(false);
  };
  const logout = ()=>{ if(!confirm('Logout?')) return; addAudit('USER_LOGOUT', `${user?.name} logged out`); localStorage.removeItem('llms_user'); setUser(null); setProfilePic(''); showToast('Logged out - Your profile picture is saved for next login'); };
  const handlePicUpload = (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    if(!user?.userID) return showToast('Please login first');
    if(f.size>5*1024*1024) return showToast('Max 5MB - Image too large');
    const r=new FileReader(); 
    r.onload=ev=>{ 
      const data = String(ev.target?.result||'');
      setProfilePic(data); 
      showToast(`✅ Profile picture uploaded for ${user?.name}`); 
      setShowProfileMenu(false); 
      addAudit('PROFILE_PIC_UPDATED', `${user?.name} (${user?.userID}) updated profile picture - per-user storage`); 
    }; 
    r.readAsDataURL(f);
  };
  const handleLaptopPhoto = (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    if(f.size>5*1024*1024) return showToast('Max 5MB');
    const r=new FileReader(); r.onload=ev=>{ setLaptopForm({...laptopForm, photo:String(ev.target?.result||'')}); }; r.readAsDataURL(f);
  };
  const openAddModal = ()=>{
    setEditingLaptop(null);
    setLaptopForm({asset_tag:`PO-${String(laptops.length+1).padStart(3,'0')}`, brand:'', model:'', status:'available', ram:'8GB', storage:'256GB SSD', cpu:'', condition:'Good', photo:''});
    setShowAddModal(true);
  };
  const openEditModal = (lp)=>{
    setEditingLaptop(lp);
    setLaptopForm({...lp});
    setShowAddModal(true);
  };
  const saveLaptop = (e)=>{
    e.preventDefault();
    if(!laptopForm.asset_tag.trim() || !laptopForm.brand.trim() || !laptopForm.model.trim()) return showToast('Fill required fields: Asset Tag, Brand, Model');
    if(editingLaptop){
      setLaptops(laptops.map(l=> l.id===editingLaptop.id ? {...l, ...laptopForm} : l));
      addAudit('LAPTOP_UPDATED', `Laptop ${laptopForm.asset_tag} updated`);
      showToast('✅ Laptop updated');
    } else {
      const newLp = {id:`LPT${String(Date.now()).slice(-4)}`, ...laptopForm, created_at:new Date().toISOString().split('T')[0]};
      setLaptops([...laptops, newLp]);
      addAudit('LAPTOP_ADDED', `Laptop ${newLp.asset_tag} added - ${newLp.brand} ${newLp.model}`);
      showToast('✅ Laptop added');
    }
    setShowAddModal(false);
  };
  const deleteLaptop = (id)=>{
    if(!confirm('Delete this laptop?')) return;
    const lp = laptops.find(l=>l.id===id);
    setLaptops(laptops.filter(l=>l.id!==id));
    addAudit('LAPTOP_DELETED', `Laptop ${lp?.asset_tag} deleted`);
    showToast('Laptop deleted');
  };

  const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : user?.role==='admin'?'AD':'LN';
  const displayName = user?.name || (user?.role==='admin'?'Administrator':'Learner');
  const displayRole = user?.role==='admin'?'Admin':'Learner';
  const logoSrc = logoErr ? LOGO_FALLBACK_SVG : LOGO_URL;

  const totalLaptops = laptops.length;
  const availableLaptops = laptops.filter(l=>l.status==='available').length;
  const issuedLaptops = laptops.filter(l=>l.status==='issued').length;
  const maintenanceLaptops = laptops.filter(l=>l.status==='maintenance').length;
  const totalLearners = users.filter(u=>u.role==='learner').length;
  const activeLoans = loans.filter(l=>l.status==='Issued').length;
  const pendingRequests = requests.filter(r=>r.status==='pending').length;
  const overdueLoans = loans.filter(l=>{ const due=new Date(l.due); return !isNaN(due) && due < new Date() && l.status==='Issued'; }).length || 0;

  const filteredLaptops = laptops.filter(l=>{
    const matchSearch = !laptopSearch || `${l.asset_tag} ${l.brand} ${l.model}`.toLowerCase().includes(laptopSearch.toLowerCase());
    const matchFilter = laptopFilter==='all' || l.status===laptopFilter;
    return matchSearch && matchFilter;
  });

  if(!user){
    return (
      <div className="min-h-screen w-full relative bg-[#0a0a0a] overflow-hidden flex">
        {toast && <div className="fixed top-6 right-6 z-[200] bg-black text-white px-6 py-3 rounded-xl shadow-2xl text-sm">{toast}</div>}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&h=1080&fit=crop" className="w-full h-full object-cover opacity-40" alt=""/>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60"></div>
          <div className="absolute top-0 right-0 w-[40%] h-[25%] bg-[#E30613] rotate-[-8deg] translate-x-20 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-[30%] h-[20%] bg-[#E30613] rotate-[-8deg] -translate-x-10 translate-y-10"></div>
        </div>
        <div className="hidden lg:flex relative z-10 w-[58%] flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center">
              <img src={logoSrc} onError={()=>setLogoErr(true)} alt="Ponelepele Oracle" className="w-full h-full object-contain"/>
            </div>
            <div>
              <p className="text-white font-bold text-[18px] tracking-wide">Ponelepele Oracle</p>
              <p className="text-white/60 text-[11px] uppercase tracking-[0.15em] mt-1">Laptop Loan Management System</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[560px]">
            <div className="w-12 h-1 bg-[#E30613] mb-6 rounded-full"></div>
            <h1 className="text-[40px] xl:text-[44px] font-bold leading-[0.95] text-white tracking-tight">
              "Borrow a Laptop,<br/>Unlock a World of<br/>Possibilities —<br/>
              <span className="text-[#E30613]">Empowering Young<br/>Minds, One Click at<br/>a Time."</span>
            </h1>
            <div className="flex gap-6 mt-10">
              <div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full border-2 border-[#E30613] flex items-center justify-center bg-black/30 backdrop-blur"><Laptop size={20} className="text-white"/></div><p className="text-[11px] text-white text-center"><span className="font-semibold">Access</span><br/><span className="opacity-60">Technology</span></p></div>
              <div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full border-2 border-[#E30613] flex items-center justify-center bg-black/30 backdrop-blur"><GraduationCap size={20} className="text-white"/></div><p className="text-[11px] text-white text-center"><span className="font-semibold">Support</span><br/><span className="opacity-60">Your Studies</span></p></div>
              <div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full border-2 border-[#E30613] flex items-center justify-center bg-black/30 backdrop-blur"><Rocket size={20} className="text-white"/></div><p className="text-[11px] text-white text-center"><span className="font-semibold">Build</span><br/><span className="opacity-60">Your Future</span></p></div>
              <div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full border-2 border-[#E30613] flex items-center justify-center bg-black/30 backdrop-blur"><Users size={20} className="text-white"/></div><p className="text-[11px] text-white text-center"><span className="font-semibold">Grow</span><br/><span className="opacity-60">Together</span></p></div>
            </div>
            <div className="mt-14"><p className="text-white text-[32px] leading-none italic font-light" style={{fontFamily:'cursive'}}>Your Future</p><p className="text-white text-[32px] leading-none italic font-light ml-6" style={{fontFamily:'cursive'}}>Starts Here</p><div className="w-[140px] h-1 bg-[#E30613] mt-3 ml-2 rounded-full rotate-[-3deg]"></div></div>
          </div>
          <div className="h-10"></div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-8">
            <div className="flex flex-col items-center">
              <div className="w-[84px] h-[84px] bg-white rounded-2xl border-2 border-[#E30613]/20 p-2 shadow-sm flex items-center justify-center"><img src={logoSrc} onError={()=>setLogoErr(true)} alt="ORACLE" className="w-full h-full object-contain"/></div>
              <h2 className="mt-5 text-[28px] font-bold tracking-tight">{showReg ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-[13px] text-[#6b7280] mt-1 text-center">Ponelepele Oracle Secondary School</p>
              <div className="mt-6 flex bg-[#f3f4f6] p-1.5 rounded-full w-full">
                <button onClick={()=>{setShowReg(false); setMsg('')}} className={'flex-1 py-2.5 rounded-full text-[14px] font-medium transition-all ' + (!showReg?'bg-white shadow-sm text-black':'text-[#6b7280]')}>Login</button>
                <button onClick={()=>{setShowReg(true); setMsg('')}} className={'flex-1 py-2.5 rounded-full text-[14px] font-medium transition-all ' + (showReg?'bg-[#E30613] text-white shadow-md':'text-[#6b7280]')}>Register</button>
              </div>
            </div>
            {msg && <div className="mt-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[13px] text-center">{msg}</div>}
            {showReset ? (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-3.5">
                <div className="text-center mb-2"><p className="text-[16px] font-bold">Reset Password</p><p className="text-[12px] text-[#6b7280] mt-1">Enter your UserID and new password</p></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><User size={18} className="text-black"/></div><input className="w-full bg-white border border-[#e5e7eb] pl-12 pr-4 py-3.5 rounded-xl text-[14px] font-mono outline-none" placeholder="Your 6-digit UserID" value={resetForm.userID} onChange={e=>setResetForm({...resetForm,userID:e.target.value.replace(/\D/g,'').slice(0,6)})} required/></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><span className="text-[16px]">🔒</span></div><input type={showPasswords.reset ? "text" : "password"} className="w-full bg-white border border-[#e5e7eb] pl-12 pr-12 py-3.5 rounded-xl text-[13px] outline-none" placeholder="New Password min 6" value={resetForm.newPassword} onChange={e=>setResetForm({...resetForm,newPassword:e.target.value})} required/><button type="button" onClick={()=>setShowPasswords({...showPasswords, reset:!showPasswords.reset})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]">{showPasswords.reset ? "Hide" : "Show"}</button></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><span className="text-[16px]">✅</span></div><input type={showPasswords.resetConfirm ? "text" : "password"} className="w-full bg-white border border-[#e5e7eb] pl-12 pr-12 py-3.5 rounded-xl text-[13px] outline-none" placeholder="Confirm New Password" value={resetForm.confirmPassword} onChange={e=>setResetForm({...resetForm,confirmPassword:e.target.value})} required/><button type="button" onClick={()=>setShowPasswords({...showPasswords, resetConfirm:!showPasswords.resetConfirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]">{showPasswords.resetConfirm ? "Hide" : "Show"}</button></div>
                <button className="w-full h-[52px] bg-[#111] hover:bg-black text-white rounded-xl font-semibold text-[15px]">Reset Password →</button>
                <button type="button" onClick={()=>{setShowReset(false); setMsg('');}} className="w-full h-[44px] bg-white border border-[#e5e7eb] rounded-xl text-[13px] font-medium">Back to Login</button>
              </form>
            ) : showReg ? (
              <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><User size={18} className="text-black"/></div><input className="w-full bg-white border border-[#e5e7eb] focus:border-[#E30613] pl-12 pr-4 py-3.5 rounded-xl text-[14px] outline-none" placeholder="Full Name" value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} required/></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><User size={18} className="text-black"/></div><input className="w-full bg-white border border-[#e5e7eb] pl-12 pr-4 py-3.5 rounded-xl text-[14px] font-mono outline-none" placeholder="userID 6 digits e.g. 123456" value={regForm.userID} onChange={e=>setRegForm({...regForm,userID:e.target.value.replace(/\D/g,'').slice(0,6)})} required/></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><span className="text-[16px]">🔒</span></div><input type={showPasswords.reg ? "text" : "password"} className="w-full bg-white border border-[#e5e7eb] pl-12 pr-12 py-3.5 rounded-xl text-[13px] outline-none" placeholder="Password min 6" value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})} required/><button type="button" onClick={()=>setShowPasswords({...showPasswords, reg:!showPasswords.reg})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]">{showPasswords.reg ? "Hide" : "Show"}</button></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><span className="text-[16px]">✅</span></div><input type={showPasswords.regConfirm ? "text" : "password"} className="w-full bg-white border border-[#e5e7eb] pl-12 pr-12 py-3.5 rounded-xl text-[13px] outline-none" placeholder="Confirm Password" value={regForm.confirmPassword} onChange={e=>setRegForm({...regForm,confirmPassword:e.target.value})} required/><button type="button" onClick={()=>setShowPasswords({...showPasswords, regConfirm:!showPasswords.regConfirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]">{showPasswords.regConfirm ? "Hide" : "Show"}</button></div>
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button type="button" onClick={()=>setRegForm({...regForm,role:'learner'})} className={'h-[64px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[13px] font-medium ' + (regForm.role==='learner'?'bg-[#7f1d1d] border-[#7f1d1d] text-white':'bg-white border-[#e5e7eb] text-[#6b7280]')}><GraduationCap size={20}/> Learner</button>
                  <button type="button" onClick={()=>setRegForm({...regForm,role:'admin'})} className={'h-[64px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[13px] font-medium ' + (regForm.role==='admin'?'bg-[#7f1d1d] border-[#7f1d1d] text-white':'bg-white border-[#e5e7eb] text-[#6b7280]')}><span>🛡</span> Admin</button>
                </div>
                <button className="w-full h-[52px] bg-[#E30613] hover:bg-[#c00510] text-white rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2">Create Account <span>→</span></button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><User size={18} className="text-black"/></div><input className="w-full bg-white border border-[#e5e7eb] pl-12 pr-4 py-3.5 rounded-xl text-[14px] font-mono outline-none" placeholder="userID 6 digits" value={loginForm.userID} onChange={e=>setLoginForm({...loginForm,userID:e.target.value.replace(/\D/g,'').slice(0,6)})} required/></div>
                <div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2"><span className="text-[16px]">🔒</span></div><input type={showPasswords.login ? "text" : "password"} className="w-full bg-white border border-[#e5e7eb] pl-12 pr-12 py-3.5 rounded-xl text-[13px] outline-none" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} required/><button type="button" onClick={()=>setShowPasswords({...showPasswords, login:!showPasswords.login})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6b7280]">{showPasswords.login ? "Hide" : "Show"}</button></div>
                <div className="flex justify-between items-center -mt-1"><button type="button" onClick={()=>{setShowReset(true); setMsg('');}} className="text-[12px] text-[#E30613] hover:underline font-medium">Forgot Password? Reset</button><span className="text-[11px] text-[#a1a1aa]">6-digit UserID</span></div>
                <button className="w-full h-[52px] bg-[#E30613] text-white rounded-xl font-semibold text-[15px]">Login →</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const NavBtn = ({id, icon:Icon, label, active})=>(
    <button onClick={()=>setActivePage(id)} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-left transition-all ' + (active?'bg-[#E30613] text-white':'text-[#a1a1aa] hover:text-white hover:bg-white/5')}>
      <Icon size={18} className={active?'text-white':'text-[#a1a1aa]'}/>{label}
      {id==='loan_requests' && pendingRequests>0 && <span className="ml-auto bg-[#f59e0b] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingRequests}</span>}
      {id==='notifications' && requests.length>0 && <span className="ml-auto w-2 h-2 bg-[#facc15] rounded-full"></span>}
    </button>
  );

  const rootStyle = {fontSize: fontSize+"px"};
  const bgClass = theme==="dark" ? "bg-[#0a0a0a] text-white" : theme==="oracle" ? "bg-[#fef2f2] text-[#111]" : "bg-[#f8f7f4] text-[#111]";
  return (
    <div className={`min-h-screen flex ${bgClass}`} style={rootStyle}>
      {toast && <div className="fixed top-5 right-5 z-[200] bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium">{toast}</div>}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-[20px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#f4f4f5] p-6 flex items-center justify-between rounded-t-[20px]">
              <div><h3 className="font-bold text-[18px]">{editingLaptop ? 'Edit Laptop' : 'Add New Laptop'}</h3><p className="text-[12px] text-[#71717a] mt-1">Fill details and upload photo</p></div>
              <button onClick={()=>setShowAddModal(false)} className="w-9 h-9 rounded-full bg-[#f4f4f5] flex items-center justify-center hover:bg-[#e4e4e7]"><X size={18}/></button>
            </div>
            <form onSubmit={saveLaptop} className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-bold tracking-widest opacity-50 uppercase">Laptop Photo - Upload from PC</label>
                <div className="mt-3 flex gap-4">
                  <div className="w-[120px] h-[90px] rounded-xl overflow-hidden bg-[#f4f4f5] border-2 border-dashed border-[#e4e4e7] flex items-center justify-center">
                    {laptopForm.photo ? <img src={laptopForm.photo} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-[#a1a1aa]"/>}
                  </div>
                  <div className="flex-1">
                    <button type="button" onClick={()=>laptopPhotoRef.current?.click()} className="h-10 px-5 bg-[#111] text-white rounded-full text-[12px] font-medium flex items-center gap-2 hover:bg-black"><Upload size={14}/> {laptopForm.photo ? 'Change Photo' : 'Upload Photo'}</button>
                    <p className="text-[11px] text-[#a1a1aa] mt-2">PNG, JPG up to 5MB. Photo visible in cards.</p>
                    {laptopForm.photo && <button type="button" onClick={()=>setLaptopForm({...laptopForm, photo:''})} className="mt-2 text-[11px] text-red-600 hover:underline">Remove photo</button>}
                    <input ref={laptopPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleLaptopPhoto}/>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Asset Tag *</label><input value={laptopForm.asset_tag} onChange={e=>setLaptopForm({...laptopForm, asset_tag:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none focus:bg-white focus:border-[#111]" placeholder="PO-001" required/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Status</label><select value={laptopForm.status} onChange={e=>setLaptopForm({...laptopForm, status:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none"><option value="available">Available</option><option value="issued">Issued</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option></select></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Brand *</label><input value={laptopForm.brand} onChange={e=>setLaptopForm({...laptopForm, brand:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none" placeholder="Dell" required/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Model *</label><input value={laptopForm.model} onChange={e=>setLaptopForm({...laptopForm, model:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none" placeholder="Latitude 7420" required/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">RAM</label><input value={laptopForm.ram} onChange={e=>setLaptopForm({...laptopForm, ram:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none" placeholder="16GB"/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Storage</label><input value={laptopForm.storage} onChange={e=>setLaptopForm({...laptopForm, storage:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none" placeholder="512GB SSD"/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">CPU / Processor</label><input value={laptopForm.cpu} onChange={e=>setLaptopForm({...laptopForm, cpu:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none" placeholder="i7-1185G7"/></div>
                <div><label className="text-[11px] font-semibold tracking-widest opacity-60 uppercase">Condition</label><select value={laptopForm.condition} onChange={e=>setLaptopForm({...laptopForm, condition:e.target.value})} className="w-full mt-2 h-11 bg-[#fafaf9] border border-[#e4e4e7] rounded-xl px-4 text-[13px] outline-none"><option>Excellent</option><option>Good</option><option>Fair</option><option>Needs Repair</option></select></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={()=>setShowAddModal(false)} className="flex-1 h-12 bg-white border border-[#e4e4e7] rounded-full text-[13px] font-medium">Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-[#E30613] text-white rounded-full text-[13px] font-semibold hover:bg-[#c00510]">{editingLaptop ? 'Update Laptop' : 'Add Laptop'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-[280px] fixed h-full bg-[#111111] text-white flex flex-col z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-[72px] h-[72px] bg-white rounded-2xl p-2 shadow-xl flex items-center justify-center border-2 border-[#E30613]">
            <img src={logoSrc} onError={()=>setLogoErr(true)} alt="Ponelepele Oracle" className="w-full h-full object-contain"/>
          </div>
          <div><p className="font-bold text-[13px] tracking-wide leading-none">PONELOPELE ORACLE</p><p className="text-[10px] text-[#71717a] tracking-widest mt-1">SECONDARY SCHOOL</p></div>
        </div>
        <div className="flex-1 px-4 overflow-y-auto">
          <p className="text-[10px] tracking-widest text-[#52525b] px-3 mb-3">{user?.role==='admin'?'ADMIN WORKSPACE':'LEARNER WORKSPACE'}</p>
          <div className="space-y-1">
            {user?.role==='admin' ? (
              <>
                <NavBtn id="overview" icon={LayoutGrid} label="Dashboard" active={activePage==='overview'}/>
                <NavBtn id="laptop_mgmt" icon={Laptop} label="Laptop management" active={activePage==='laptop_mgmt'}/>
                <NavBtn id="learners" icon={Users} label="Learners" active={activePage==='learners'}/>
                <NavBtn id="loan_requests" icon={ClipboardList} label="Laptop requests" active={activePage==='loan_requests'}/>
                <NavBtn id="loans_returns" icon={Repeat2} label="Loans & returns" active={activePage==='loans_returns'}/>
                <NavBtn id="notifications" icon={BellRing} label="Notifications" active={activePage==='notifications'}/>
                <NavBtn id="reports" icon={BarChart3} label="Report and analytics" active={activePage==='reports'}/>
                <NavBtn id="maintenance" icon={Wrench} label="Maintenance" active={activePage==='maintenance'}/>
                <NavBtn id="settings" icon={Settings} label="Settings" active={activePage==='settings'}/>
              </>
            ) : (
              <>
                <NavBtn id="overview" icon={LayoutGrid} label="Dashboard / Overview" active={activePage==='overview'}/>
                <NavBtn id="request_laptop" icon={Laptop} label="Request laptop" active={activePage==='request_laptop'}/>
                <NavBtn id="my_history" icon={ClipboardList} label="My history" active={activePage==='my_history'}/>
                <NavBtn id="notifications" icon={BellRing} label="Notifications" active={activePage==='notifications'}/>
                <NavBtn id="settings" icon={Settings} label="Settings" active={activePage==='settings'}/>
                <NavBtn id="help" icon={HelpCircle} label="Help & support" active={activePage==='help'}/>
              </>
            )}
          </div>
          {/* Date/Time removed as requested */}
        </div>
        <div className="p-4 border-t border-[#1f1f1f] mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1a1a1a] mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#27272a] flex items-center justify-center">
              {profilePic ? <img src={profilePic} className="w-full h-full object-cover"/> : <span className="text-[11px] font-bold">{initials}</span>}
            </div>
            <div className="flex-1 min-w-0"><p className="text-[12px] font-medium truncate">{displayName}</p><p className="text-[10px] text-[#71717a]">{user?.userID}</p></div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#a1a1aa] hover:text-white hover:bg-white/5"><LogOut size={18}/> Logout</button>
        </div>
      </div>

      <div className="flex-1 ml-[280px] min-h-screen">
        <div className="h-[64px] bg-white border-b border-[#ecebe8] flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-[14px]">
            {/* Title removed - was opposite search bar */}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"/><input placeholder="Search this page..." className="w-[280px] h-9 bg-[#fafaf9] border border-[#e4e4e7] rounded-full pl-9 pr-4 text-[13px] outline-none focus:bg-white focus:border-[#111]"/></div>
            <button onClick={()=>setActivePage('notifications')} className="relative w-9 h-9 bg-white border border-[#e4e4e7] rounded-full flex items-center justify-center"><Bell size={16}/>{(pendingRequests>0 || requests.length>0) && <span className="absolute top-1 right-1 w-2 h-2 bg-[#E30613] rounded-full"></span>}</button>
            <div className="relative">
              <button onClick={()=>setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-full border border-[#e4e4e7] bg-white hover:bg-[#fafaf9]">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#fde2e2] flex items-center justify-center">
                  {profilePic ? <img src={profilePic} className="w-full h-full object-cover"/> : <span className="text-[11px] font-bold text-[#E30613]">{initials}</span>}
                </div>
                <div className="text-left"><p className="text-[12px] font-semibold leading-none">{displayName}</p><p className="text-[10px] text-[#71717a] leading-none mt-1">{displayRole}</p></div>
                <span className="text-[12px] opacity-50">⌄</span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-[44px] w-[300px] bg-white border border-[#e4e4e7] rounded-2xl shadow-xl p-2 z-50">
                  <div className="p-3 flex gap-3 items-center border-b border-[#f4f4f5] mb-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#fde2e2] flex items-center justify-center relative group">
                      {profilePic ? <img src={profilePic} className="w-full h-full object-cover"/> : <span className="font-bold text-[#E30613] text-[14px]">{initials}</span>}
                    </div>
                    <div className="flex-1"><p className="text-[13px] font-semibold">{displayName}</p><p className="text-[11px] text-[#71717a] font-mono">{user?.userID}</p><p className="text-[10px] text-[#E30613] mt-1">160px profile picture</p></div>
                  </div>
                  <button onClick={()=>headerFileRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:bg-[#f4f4f5] text-left"><Upload size={16}/> Upload / Change picture</button>
                  <button onClick={()=>{ setActivePage('settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:bg-[#f4f4f5] text-left"><User size={16}/> My Profile & Settings</button>
                  {profilePic && <button onClick={()=>{ setProfilePic(''); showToast('Picture removed'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:bg-red-50 text-red-600 text-left"><Trash2 size={16}/> Remove picture</button>}
                  <div className="border-t border-[#f4f4f5] mt-2 pt-2"><button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:bg-red-50 text-red-600 text-left"><LogOut size={16}/> Logout (Header)</button></div>
                  <input ref={headerFileRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload}/>
                </div>
              )}
            </div>
          </div>
        </div>

        
        <div className="p-8 max-w-[1280px]">
          {activePage==='overview' && (
            <div className="space-y-6">
              {user?.role==='admin' ? (
                <>
                  {/* LIVELY ADMIN DASHBOARD */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#E30613] rounded-[24px] p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#E30613]/40 rounded-full blur-[60px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-widest">● LIVE SYSTEM</span>
                          <span className="px-3 py-1 rounded-full bg-[#E30613] text-[10px] font-bold">ORACLE v2.0</span>
                        </div>
                        <h1 className="text-[32px] font-black mt-4 leading-none">Ponelepele Oracle<br/>Command Center</h1>
                        <p className="text-[13px] text-white/60 mt-3 max-w-[400px]">Real-time monitoring of {totalLaptops} laptops, {totalLearners} learners, and {requests.length} requests. Everything you need, one dashboard.</p>
                        <div className="flex items-center gap-3 mt-5">
                          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2"><Calendar size={14}/><span className="text-[11px]">{currentDateTime.toLocaleDateString('en-ZA', {weekday:'long', day:'numeric', month:'long'})}</span></div>
                          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2"><Clock size={14}/><span className="text-[11px] font-mono">{currentDateTime.toLocaleTimeString('en-ZA', {hour:'2-digit', minute:'2-digit'})} Live</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10"><p className="text-[10px] opacity-60 uppercase tracking-widest">Uptime</p><p className="text-[22px] font-bold mt-1">99.9%</p><p className="text-[10px] text-[#22c55e] mt-1">↗ All systems OK</p></div>
                        <div className="bg-white rounded-2xl p-4 text-black"><p className="text-[10px] opacity-60 uppercase">Pending Action</p><p className="text-[22px] font-black mt-1 text-[#E30613]">{pendingRequests}</p><p className="text-[10px] mt-1">Needs approval</p></div>
                        <div className="bg-[#22c55e] rounded-2xl p-4 text-white"><p className="text-[10px] opacity-80 uppercase">Available Now</p><p className="text-[22px] font-bold mt-1">{availableLaptops}</p><p className="text-[10px] mt-1">Ready to issue</p></div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10"><p className="text-[10px] opacity-60 uppercase">Overdue</p><p className="text-[22px] font-bold mt-1">{overdueLoans}</p><p className="text-[10px] text-[#f59e0b] mt-1">{overdueLoans===0?'No overdue!':'⚠ Action needed'}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="group bg-white border border-[#ecebe8] rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-l-[#E30613]">
                      <div className="flex justify-between items-start"><div><p className="text-[10px] tracking-widest text-[#a1a1aa] uppercase font-bold">Total Laptops</p><p className="text-[32px] font-black mt-2">{totalLaptops}</p><div className="flex items-center gap-2 mt-2"><span className="px-2 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-[10px] font-bold">{availableLaptops} available</span><span className="text-[10px] text-[#22c55e]">● Live</span></div></div><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fde2e2] to-[#fecaca] flex items-center justify-center group-hover:scale-110 transition-transform"><Laptop size={24} className="text-[#E30613]"/></div></div>
                      <div className="mt-4 h-2 bg-[#f4f4f5] rounded-full overflow-hidden"><div className="h-full bg-[#E30613] rounded-full" style={{width: `${Math.round((availableLaptops/totalLaptops)*100)||0}%`}}></div></div>
                    </div>
                    <div className="group bg-white border border-[#ecebe8] rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-l-[#111]">
                      <div className="flex justify-between"><div><p className="text-[10px] tracking-widest text-[#a1a1aa] uppercase font-bold">Active Loans</p><p className="text-[32px] font-black mt-2">{activeLoans}</p><p className="text-[11px] text-[#71717a] mt-2">{issuedLaptops} issued • {overdueLoans} overdue</p></div><div className="w-14 h-14 rounded-2xl bg-[#111] flex items-center justify-center group-hover:scale-110 transition-transform"><Repeat2 size={24} className="text-white"/></div></div>
                    </div>
                    <div className="group bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border border-[#fcd34d] rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="flex justify-between"><div><p className="text-[10px] tracking-widest text-[#92400e] uppercase font-bold">Pending Requests</p><p className="text-[32px] font-black mt-2 text-[#92400e]">{pendingRequests}</p><p className="text-[11px] text-[#92400e]/70 mt-2">⚡ Needs your approval</p></div><div className="w-14 h-14 rounded-2xl bg-[#f59e0b] flex items-center justify-center animate-pulse"><ClipboardList size={24} className="text-white"/></div></div>
                      {pendingRequests>0 && <button onClick={()=>setActivePage('loan_requests')} className="mt-3 w-full h-8 bg-[#92400e] text-white rounded-full text-[11px] font-bold">Review Now →</button>}
                    </div>
                    <div className="group bg-white border border-[#ecebe8] rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-l-4 border-l-[#22c55e]">
                      <div className="flex justify-between"><div><p className="text-[10px] tracking-widest text-[#a1a1aa] uppercase font-bold">Learners</p><p className="text-[32px] font-black mt-2">{totalLearners || users.length}</p><p className="text-[11px] text-[#22c55e] mt-2">● {users.filter(u=>u.role==='learner').length} active today</p></div><div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center group-hover:scale-110 transition-transform"><Users size={24} className="text-[#22c55e]"/></div></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                      <div className="flex justify-between items-center"><p className="text-[13px] font-bold">Laptop Status • Live</p><span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></span></div>
                      <div className="mt-5 space-y-4">
                        {[
                          {label:'Available', count:availableLaptops, total:totalLaptops, color:'bg-[#22c55e]', dot:'bg-[#22c55e]'},
                          {label:'Issued', count:issuedLaptops, total:totalLaptops, color:'bg-[#111]', dot:'bg-[#111]'},
                          {label:'Maintenance', count:maintenanceLaptops, total:totalLaptops, color:'bg-[#f59e0b]', dot:'bg-[#f59e0b]'},
                          {label:'Overdue', count:overdueLoans, total:totalLaptops, color:'bg-[#E30613]', dot:'bg-[#E30613]'},
                        ].map(s=>(
                          <div key={s.label}><div className="flex justify-between text-[12px]"><span className="flex items-center gap-2"><span className={`w-2 h-2 ${s.dot} rounded-full`}></span>{s.label}</span><span className="font-bold">{s.count} / {s.total} • {Math.round((s.count/(s.total||1))*100)}%</span></div><div className="mt-2 h-2 bg-[#f4f4f5] rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full transition-all`} style={{width: `${Math.round((s.count/(s.total||1))*100)}%`}}></div></div></div>
                        ))}
                      </div>
                      <div className="mt-6 p-3 bg-[#fafaf9] rounded-xl border"><p className="text-[11px] font-bold">Brand Breakdown</p><div className="mt-2 flex flex-wrap gap-2">{[...new Set(laptops.map(l=>l.brand))].map(b=><span key={b} className="px-2 py-1 bg-white border rounded-full text-[10px] font-medium">{b}: {laptops.filter(l=>l.brand===b).length}</span>)}</div></div>
                    </div>

                    <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                      <div className="flex justify-between"><p className="text-[13px] font-bold">Pending Requests • Action Needed</p><span className="px-2 py-1 bg-[#fef3c7] text-[#92400e] rounded-full text-[10px] font-bold">{pendingRequests} pending</span></div>
                      <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto">
                        {requests.filter(r=>r.status==='pending').slice(0,3).map(req=>(
                          <div key={req.id} className="p-4 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                            <div className="flex justify-between"><p className="text-[12px] font-bold">{req.learner} ({req.learnerID})</p><span className="text-[10px] bg-[#f59e0b] text-white px-2 py-0.5 rounded-full">PENDING</span></div>
                            <p className="text-[11px] mt-1">{req.brand} {req.model} • {req.asset_tag}</p>
                            <p className="text-[11px] text-[#71717a] mt-1">Need: {req.needDate? new Date(req.needDate).toLocaleString(): ''}</p>
                            <div className="p-2 bg-white rounded-lg border mt-2"><p className="text-[10px] text-[#a1a1aa] uppercase">Reason</p><p className="text-[11px] mt-1 line-clamp-2">{req.reason}</p></div>
                            <div className="flex gap-2 mt-3"><button onClick={()=>{ setRequests(requests.map(r=> r.id===req.id ? {...r, status:'approved'}:r)); const newLoan={id:'LN-'+Date.now().toString().slice(-4), learner:req.learner, learnerId:req.learnerID, laptop:req.laptopId, asset_tag:req.asset_tag, issue:new Date().toLocaleDateString('en-ZA'), due:req.returnDate? new Date(req.returnDate).toLocaleDateString('en-ZA') : new Date(Date.now()+7*86400000).toLocaleDateString('en-ZA'), status:'Issued'}; setLoans([newLoan, ...loans]); setLaptops(laptops.map(l=> l.id===req.laptopId ? {...l, status:'issued'}:l)); addAudit('REQUEST_APPROVED', `Approved ${req.id}`); showToast('Approved'); }} className="flex-1 h-8 bg-[#22c55e] text-white rounded-full text-[11px] font-bold">Approve</button><button onClick={()=>{ setRequests(requests.map(r=> r.id===req.id ? {...r, status:'rejected'}:r)); showToast('Rejected'); }} className="flex-1 h-8 bg-white border rounded-full text-[11px]">Reject</button></div>
                          </div>
                        ))}
                        {pendingRequests===0 && <div className="text-center py-12"><CheckCircle2 size={32} className="mx-auto text-[#22c55e]"/><p className="text-[13px] font-bold mt-3">All caught up!</p><p className="text-[11px] text-[#a1a1aa]">No pending requests</p></div>}
                      </div>
                      {pendingRequests>3 && <button onClick={()=>setActivePage('loan_requests')} className="w-full mt-3 h-9 bg-[#111] text-white rounded-full text-[12px]">View All {pendingRequests} Requests →</button>}
                    </div>

                    <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                      <p className="text-[13px] font-bold">Live Activity Feed</p>
                      <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto">
                        {loans.slice(0,5).map(l=>(
                          <div key={l.id} className="flex gap-3 py-2 border-b border-[#f4f4f5] last:border-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E30613] to-[#111] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{l.learner?.charAt(0)||'S'}</div>
                            <div className="flex-1"><p className="text-[12px] font-medium">{l.learner} • {l.laptop}</p><p className="text-[10px] text-[#a1a1aa]">Due {l.due} • {l.status}</p><div className="mt-1 flex gap-1"><span className="px-2 py-0.5 bg-[#dbeafe] text-[#1e40af] rounded-full text-[9px]">{l.id}</span><span className="px-2 py-0.5 bg-[#dcfce7] text-[#166534] rounded-full text-[9px]">Issued</span></div></div>
                          </div>
                        ))}
                        {auditLog.slice(0,3).map(log=>(
                          <div key={log.id} className="flex gap-3 py-2"><div className="w-8 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[10px]">🔔</div><div><p className="text-[11px] font-medium">{log.action}</p><p className="text-[10px] text-[#a1a1aa]">{log.detail?.slice(0,60)}</p></div></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <button onClick={()=>setActivePage('laptop_mgmt')} className="h-[90px] bg-white border-2 border-[#ecebe8] rounded-[16px] flex flex-col items-center justify-center gap-2 hover:border-[#E30613] hover:shadow-lg transition-all group"><div className="w-10 h-10 rounded-full bg-[#fde2e2] flex items-center justify-center group-hover:scale-110 transition-transform"><Plus size={18} className="text-[#E30613]"/></div><span className="text-[12px] font-bold">Add Laptop</span></button>
                    <button onClick={()=>setActivePage('loan_requests')} className="h-[90px] bg-[#111] text-white rounded-[16px] flex flex-col items-center justify-center gap-2 hover:bg-black hover:shadow-xl transition-all"><ClipboardList size={20}/><span className="text-[12px] font-bold">Review {pendingRequests} Requests</span></button>
                    <button onClick={()=>setActivePage('loans_returns')} className="h-[90px] bg-white border-2 border-[#ecebe8] rounded-[16px] flex flex-col items-center justify-center gap-2 hover:border-[#111] transition-all"><Repeat2 size={20}/><span className="text-[12px] font-bold">Loans & Returns</span></button>
                    <button onClick={()=>setActivePage('reports')} className="h-[90px] bg-gradient-to-br from-[#E30613] to-[#991b1b] text-white rounded-[16px] flex flex-col items-center justify-center gap-2 hover:shadow-xl transition-all"><BarChart3 size={20}/><span className="text-[12px] font-bold">Export Reports</span></button>
                  </div>
                </>
              ) : (
                <>
                  {/* LIVELY LEARNER DASHBOARD WITH LOAN STATUS */}
                  <div className="bg-gradient-to-r from-[#111] via-[#1f1f1f] to-[#E30613] text-white rounded-[24px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-[50px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between">
                      <div>
                        <p className="text-[11px] tracking-widest opacity-60 uppercase">{getGreeting(currentDateTime)}, {user?.name?.split(' ')[0]||'Learner'}! {currentDateTime.getHours()<12?'☀': currentDateTime.getHours()<17?'🌤':'🌙'}</p>
                        <h2 className="text-[26px] font-black mt-2 leading-tight">Your Laptop Journey<br/>Starts Here 🚀</h2>
                        <p className="text-[13px] opacity-70 mt-3 max-w-[420px]">Track your requests - pending, approved, or rejected - all in one lively dashboard. Your future starts now.</p>
                        <div className="flex gap-3 mt-5">
                          <button onClick={()=>setActivePage('request_laptop')} className="px-6 h-11 bg-[#E30613] text-white rounded-full text-[13px] font-bold hover:bg-[#c00510] shadow-lg">Request Laptop Now →</button>
                          <button onClick={()=>setActivePage('my_history')} className="px-5 h-11 bg-white/10 backdrop-blur border border-white/20 rounded-full text-[13px]">My History</button>
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 grid grid-cols-3 gap-3">
                        {[
                          {label:'My Requests', count: requests.filter(r=>String(r.learnerID)===String(user?.userID)).length, color:'bg-white text-black'},
                          {label:'Pending', count: requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='pending').length, color:'bg-[#f59e0b] text-white'},
                          {label:'Approved', count: requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='approved').length, color:'bg-[#22c55e] text-white'},
                        ].map(c=>(
                          <div key={c.label} className={`w-[90px] h-[90px] rounded-2xl ${c.color} flex flex-col items-center justify-center shadow-lg`}><span className="text-[24px] font-black">{c.count}</span><span className="text-[9px] uppercase font-bold mt-1">{c.label}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#f59e0b]"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Pending Review</p><p className="text-[28px] font-black mt-2">{requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='pending').length}</p><p className="text-[11px] text-[#f59e0b] mt-1">⏳ Awaiting admin</p></div>
                    <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#22c55e]"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Approved</p><p className="text-[28px] font-black mt-2 text-[#22c55e]">{requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='approved').length}</p><p className="text-[11px] text-[#22c55e] mt-1">✅ Ready to collect</p></div>
                    <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#E30613]"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Rejected</p><p className="text-[28px] font-black mt-2 text-[#E30613]">{requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='rejected').length}</p><p className="text-[11px] text-[#E30613] mt-1">❌ See reason</p></div>
                    <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#111]"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Active Loans</p><p className="text-[28px] font-black mt-2">{loans.filter(l=>String(l.learnerId)===String(user?.userID)).length}</p><p className="text-[11px] text-[#71717a] mt-1">💻 Currently with you</p></div>
                  </div>

                  <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                    <div className="flex justify-between items-center"><h3 className="font-bold text-[16px]">My Loan Status • Pending, Approved, Rejected</h3><div className="flex gap-2"><span className="px-2 py-1 bg-[#fef3c7] text-[#92400e] rounded-full text-[10px] font-bold">Pending: {requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='pending').length}</span><span className="px-2 py-1 bg-[#dcfce7] text-[#166534] rounded-full text-[10px] font-bold">Approved: {requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='approved').length}</span><span className="px-2 py-1 bg-[#fee2e2] text-[#991b1b] rounded-full text-[10px] font-bold">Rejected: {requests.filter(r=>String(r.learnerID)===String(user?.userID) && r.status==='rejected').length}</span></div></div>
                    
                    <div className="mt-5 space-y-4">
                      {requests.filter(r=>String(r.learnerID)===String(user?.userID)).length===0 ? (
                        <div className="text-center py-16 bg-[#fafaf9] rounded-[16px] border-2 border-dashed">
                          <div className="w-16 h-16 rounded-full bg-white border shadow-sm flex items-center justify-center mx-auto"><Laptop size={24} className="text-[#a1a1aa]"/></div>
                          <p className="text-[16px] font-bold mt-4">No requests yet, {user?.name?.split(' ')[0]}!</p><p className="text-[12px] text-[#a1a1aa] mt-2">Request a laptop to see pending / approved / rejected status here</p>
                          <button onClick={()=>setActivePage('request_laptop')} className="mt-5 px-8 h-11 bg-[#E30613] text-white rounded-full text-[13px] font-bold shadow-lg">Request Your First Laptop →</button>
                        </div>
                      ) : (
                        requests.filter(r=>String(r.learnerID)===String(user?.userID)).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)).map(req=>(
                          <div key={req.id} className={`p-5 rounded-[16px] border-2 flex flex-col gap-3 transition-all hover:shadow-md ${req.status==='pending'?'bg-[#fffbeb] border-[#fde68a]': req.status==='approved'?'bg-[#f0fdf4] border-[#bbf7d0]':'bg-[#fef2f2] border-[#fecaca]'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3"><div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${req.status==='pending'?'bg-[#f59e0b]': req.status==='approved'?'bg-[#22c55e]':'bg-[#E30613]'} text-white`}><Laptop size={20}/></div><div><p className="text-[14px] font-bold">{req.brand} {req.model} • {req.asset_tag}</p><p className="text-[11px] text-[#71717a] mt-1">ID: {req.id} • Requested: {req.date} • Need: <span className="font-bold text-[#111]">{req.needDate? new Date(req.needDate).toLocaleString('en-ZA',{dateStyle:'medium', timeStyle:'short'}):'Not set'}</span></p></div></div>
                              <span className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest ${req.status==='pending'?'bg-[#f59e0b] text-white animate-pulse': req.status==='approved'?'bg-[#22c55e] text-white':'bg-[#E30613] text-white'}`}>{req.status==='pending'?'⏳ PENDING': req.status==='approved'?'✅ APPROVED':'❌ REJECTED'}</span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                              <div className="md:col-span-2 p-3 bg-white rounded-xl border"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold tracking-widest">Reason for loaning</p><p className="text-[13px] mt-1">{req.reason}</p></div>
                              <div className="p-3 bg-white rounded-xl border"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Timeline</p><div className="mt-2 space-y-1 text-[11px]"><p>📅 Requested: {req.date}</p><p>🎯 Needed: {req.needDate? new Date(req.needDate).toLocaleDateString():''}</p><p>↩ Return: {req.returnDate? new Date(req.returnDate).toLocaleDateString():'Not set'}</p></div></div>
                            </div>
                            {req.status==='approved' && <div className="p-3 bg-[#22c55e] text-white rounded-xl flex justify-between items-center"><p className="text-[12px] font-bold">🎉 Approved! Collect your laptop at ICT Office • Asset: {req.asset_tag}</p><span className="text-[11px] bg-white/20 px-3 py-1 rounded-full">Ready</span></div>}
                            {req.status==='rejected' && <div className="p-3 bg-[#E30613] text-white rounded-xl"><p className="text-[12px] font-bold">❌ This request was rejected. Please contact admin or request another laptop.</p></div>}
                            {req.status==='pending' && <div className="p-3 bg-[#f59e0b] text-white rounded-xl flex justify-between"><p className="text-[12px] font-bold">⏳ Pending admin approval - you'll be notified once reviewed</p><span className="text-[10px] bg-white/20 px-2 py-1 rounded-full animate-pulse">Waiting</span></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {loans.filter(l=>String(l.learnerId)===String(user?.userID)).length>0 && (
                    <div className="bg-[#111] text-white rounded-[20px] p-6">
                      <h3 className="font-bold text-[14px]">💻 My Current Loans</h3>
                      <div className="mt-4 grid gap-3">
                        {loans.filter(l=>String(l.learnerId)===String(user?.userID)).map(l=>(
                          <div key={l.id} className="flex justify-between items-center p-4 bg-white/10 backdrop-blur rounded-xl border border-white/10"><div><p className="text-[13px] font-bold">{l.learner} • {l.laptop} ({l.asset_tag||l.laptop})</p><p className="text-[11px] opacity-60">Issued: {l.issue} • Due: {l.due}</p></div><span className="px-3 py-1 bg-[#22c55e] text-white rounded-full text-[10px] font-bold">{l.status}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}


          {activePage==='laptop_mgmt' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between"><div><h1 className="text-[28px] font-bold tracking-tight mt-2">Laptop management</h1><p className="text-[13px] text-[#71717a] mt-1">Add laptops, upload photos, manage availability & maintenance — horizontal display.</p></div><button onClick={openAddModal} className="h-11 px-6 bg-[#E30613] text-white rounded-full text-[13px] font-semibold flex items-center gap-2 hover:bg-[#c00510] shadow-lg"><Plus size={16}/> Add Laptop</button></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-5 shadow-sm flex items-center gap-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"/><input value={laptopSearch} onChange={e=>setLaptopSearch(e.target.value)} placeholder="Search asset tag, brand, model..." className="w-full h-10 bg-[#fafaf9] border border-[#e4e4e7] rounded-full pl-9 pr-4 text-[13px] outline-none focus:bg-white focus:border-[#111]"/></div><select value={laptopFilter} onChange={e=>setLaptopFilter(e.target.value)} className="h-10 bg-[#fafaf9] border border-[#e4e4e7] rounded-full px-4 text-[13px] outline-none"><option value="all">All Status</option><option value="available">Available</option><option value="issued">Issued</option><option value="maintenance">Maintenance</option></select></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredLaptops.map(lp=>(
                  <div key={lp.id} className="bg-white border border-[#ecebe8] rounded-[18px] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#E30613]/20 transition-all group">
                    <div className="relative h-[160px] bg-[#f8f7f4] overflow-hidden">
                      {lp.photo ? <img src={lp.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><Laptop size={32} className="text-[#d4d4d8]"/><span className="text-[10px] text-[#a1a1aa]">No photo - Upload</span></div>}
                      <div className="absolute top-3 left-3">{lp.status==='available' && <span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-[10px] font-bold">AVAILABLE</span>}{lp.status==='issued' && <span className="px-3 py-1 rounded-full bg-[#111] text-white text-[10px] font-bold">ISSUED</span>}{lp.status==='maintenance' && <span className="px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-[10px] font-bold">MAINTENANCE</span>}</div>
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>openEditModal(lp)} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#111] hover:text-white"><Edit3 size={14}/></button><button onClick={()=>deleteLaptop(lp.id)} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#E30613] hover:text-white"><Trash2 size={14}/></button></div>
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end"><span className="text-white font-mono text-[11px] font-bold bg-black/40 backdrop-blur px-2 py-1 rounded-full">{lp.asset_tag}</span><span className="text-white text-[10px] bg-black/40 backdrop-blur px-2 py-1 rounded-full">{lp.condition}</span></div>
                    </div>
                    <div className="p-4"><h3 className="font-bold text-[14px]">{lp.brand} {lp.model}</h3><p className="text-[11px] text-[#71717a] mt-1 font-mono">{lp.id} • {lp.cpu || 'Intel'}</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="bg-[#fafaf9] border rounded-lg p-2"><p className="text-[9px] text-[#a1a1aa] uppercase">RAM</p><p className="text-[12px] font-semibold mt-1">{lp.ram}</p></div><div className="bg-[#fafaf9] border rounded-lg p-2"><p className="text-[9px] text-[#a1a1aa] uppercase">Storage</p><p className="text-[12px] font-semibold mt-1">{lp.storage}</p></div></div><div className="mt-3 flex items-center justify-between"><span className="text-[11px] text-[#71717a]">{lp.created_at}</span><div className="flex gap-2"><button onClick={()=>openEditModal(lp)} className="px-3 h-7 bg-[#f4f4f5] hover:bg-[#111] hover:text-white rounded-full text-[11px]">Edit</button><button onClick={()=>{ setLaptops(laptops.map(l=> l.id===lp.id ? {...l, status: l.status==='available'?'maintenance':'available'}:l)); showToast('Status updated');}} className="px-3 h-7 bg-[#E30613] text-white rounded-full text-[11px]">{lp.status==='available'?'Maintain':'Available'}</button></div></div></div>
                  </div>
                ))}
              </div>
              {filteredLaptops.length===0 && <div className="bg-white border rounded-[16px] p-12 text-center"><Laptop size={40} className="mx-auto text-[#e4e4e7]"/><p className="text-[14px] font-medium mt-4">No laptops found</p><button onClick={openAddModal} className="mt-5 px-6 h-11 bg-[#E30613] text-white rounded-full text-[13px]">+ Add first laptop</button></div>}
            </div>
          )}

          {activePage==='request_laptop' && <RequestLaptopPage laptops={laptops} requests={requests} user={user} setRequests={setRequests} addAudit={addAudit} />}

          {activePage==='my_history' && (
            <div className="space-y-6 max-w-[1000px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">LEARNER - MY HISTORY - ONLY YOUR REQUESTS</p><h1 className="text-[28px] font-bold mt-2">My History</h1></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#E30613]"><p className="text-[11px] text-[#a1a1aa] uppercase">My Requests Only</p><p className="text-[24px] font-bold mt-2">{requests.filter(r=> String(r.learnerID)===String(user?.userID)).length}</p><p className="text-[11px] text-[#71717a] mt-1">{requests.filter(r=> String(r.learnerID)===String(user?.userID) && r.status==='pending').length} pending</p></div>
                <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#111]"><p className="text-[11px] text-[#a1a1aa] uppercase">My Active Loans</p><p className="text-[24px] font-bold mt-2">{loans.filter(l=> String(l.learnerId)===String(user?.userID)).length}</p></div>
                <div className="bg-white border rounded-[16px] p-5 shadow-sm border-l-4 border-l-[#22c55e]"><p className="text-[11px] text-[#a1a1aa] uppercase">System Total</p><p className="text-[24px] font-bold mt-2">{requests.length}</p></div>
              </div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between"><h3 className="font-semibold text-[14px]">My Requests - Filtered by UserID {user?.userID}</h3><button onClick={()=>{ if(confirm('Clear MY requests only?')) setRequests(requests.filter(r=> String(r.learnerID)!==String(user?.userID))); }} className="text-[11px] px-3 py-1 bg-[#fef2f2] text-[#991b1b] rounded-full">Clear My History</button></div>
                <div className="mt-4 space-y-3">
                  {requests.filter(r=> String(r.learnerID)===String(user?.userID)).length===0 ? (
                    <div className="text-center py-10"><ClipboardList size={24} className="mx-auto text-[#a1a1aa]"/><p className="text-[14px] font-bold mt-3">No history yet for {user?.name}</p><p className="text-[12px] text-[#a1a1aa] mt-1">Request a laptop to see history here</p><button onClick={()=>setActivePage('request_laptop')} className="mt-4 px-6 h-11 bg-[#E30613] text-white rounded-full text-[13px] font-semibold">Go Request Laptop</button></div>
                  ) : requests.filter(r=> String(r.learnerID)===String(user?.userID)).map(req=>(
                    <div key={req.id} className="p-4 bg-[#fafaf9] rounded-xl border space-y-2">
                      <div className="flex items-start justify-between"><div><p className="text-[13px] font-bold">{req.brand} {req.model} - {req.asset_tag}</p><p className="text-[11px] text-[#a1a1aa]">ID:{req.id} • {req.date} • Need: <span className="font-bold text-[#111]">{req.needDate ? new Date(req.needDate).toLocaleString('en-ZA', {dateStyle:'medium', timeStyle:'short'}) : 'Not set'}</span></p></div><span className={'px-3 py-1 rounded-full text-[10px] font-bold h-fit ' + (req.status==='pending'?'bg-[#fef3c7] text-[#92400e]': req.status==='approved'?'bg-[#dcfce7] text-[#166534]':'bg-[#fee2e2] text-[#991b1b]')}>{req.status.toUpperCase()}</span></div>
                      <div className="p-3 bg-white rounded-lg border"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Reason for loaning</p><p className="text-[13px] mt-1">{req.reason}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage==='loan_requests' && (
            <div className="space-y-6 max-w-[1100px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">ADMIN - LAPTOP REQUESTS</p><h1 className="text-[28px] font-bold mt-2">Laptop Requests</h1><p className="text-[13px] text-[#71717a] mt-1">Approve / reject learner requests with reason, date & time needed.</p></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-6 shadow-sm">
                <h3 className="font-semibold text-[14px]">Pending Requests - {pendingRequests} awaiting</h3>
                <div className="mt-4 space-y-4">
                  {requests.length===0 && <p className="text-[13px] text-[#a1a1aa] text-center py-8">No requests yet — learners must request laptops from Request Laptop page</p>}
                  {requests.map(req=>(
                    <div key={req.id} className="p-5 bg-[#fafaf9] border-2 border-[#ecebe8] rounded-[16px] flex flex-col gap-4">
                      <div className="flex justify-between"><div><p className="font-bold text-[14px]">{req.learner} ({req.learnerID}) — {req.brand} {req.model} {req.asset_tag}</p><p className="text-[12px] text-[#71717a] mt-1">Requested: {req.date} • Need: <span className="font-bold text-[#111]">{req.needDate ? new Date(req.needDate).toLocaleString() : ''}</span> • Return: {req.returnDate ? new Date(req.returnDate).toLocaleString() : 'Not set'}</p></div><span className={'px-3 py-1 rounded-full text-[11px] font-bold h-fit ' + (req.status==='pending'?'bg-[#fef3c7] text-[#92400e]':'bg-[#dcfce7] text-[#166534]')}>{req.status}</span></div>
                      <div className="bg-white border rounded-xl p-3"><p className="text-[10px] text-[#a1a1aa] uppercase font-bold">Reason for loaning</p><p className="text-[13px] mt-1">{req.reason}</p></div>
                      {req.status==='pending' && (
                        <div className="flex gap-2">
                          <button onClick={()=>{ setRequests(requests.map(r=> r.id===req.id ? {...r, status:'approved'}:r)); const newLoan={id:'LN-'+Date.now().toString().slice(-4), learner:req.learner, learnerId:req.learnerID, laptop:req.laptopId, asset_tag:req.asset_tag, issue:new Date().toLocaleDateString('en-ZA'), due:req.returnDate? new Date(req.returnDate).toLocaleDateString('en-ZA') : new Date(Date.now()+7*86400000).toLocaleDateString('en-ZA'), status:'Issued'}; setLoans([newLoan, ...loans]); setLaptops(laptops.map(l=> l.id===req.laptopId ? {...l, status:'issued'}:l)); addAudit('REQUEST_APPROVED', `Approved ${req.id} for ${req.learner} - ${req.asset_tag}`); showToast('✅ Approved & Issued'); }} className="px-5 h-10 bg-[#22c55e] text-white rounded-full text-[12px] font-bold hover:bg-[#16a34a]">✅ Approve & Issue Laptop</button>
                          <button onClick={()=>{ setRequests(requests.map(r=> r.id===req.id ? {...r, status:'rejected'}:r)); addAudit('REQUEST_REJECTED', `Rejected ${req.id}`); showToast('Rejected'); }} className="px-5 h-10 bg-white border border-[#e4e4e7] rounded-full text-[12px] font-bold hover:bg-[#fef2f2] hover:text-red-600">❌ Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage==='loans_returns' && (
            <div className="space-y-5">
              <div><h1 className="text-[28px] font-bold mt-2">Loans & Returns</h1><p className="text-[13px] text-[#71717a] mt-1">Record laptop issues, due dates and completed returns.</p></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-6 shadow-sm">
                <div className="flex gap-2"><button onClick={()=>setTab('active')} className={'px-4 h-8 rounded-full text-[12px] font-medium border ' + (tab==='active'?'bg-[#fde2e2] border-[#fecaca] text-[#E30613]':'bg-white border-[#e4e4e7]')}>Active loans ({activeLoans})</button><button onClick={()=>setTab('all')} className={'px-4 h-8 rounded-full text-[12px] font-medium border ' + (tab==='all'?'bg-[#fde2e2] border-[#fecaca] text-[#E30613]':'bg-white border-[#e4e4e7]')}>All</button></div>
                <div className="mt-6 overflow-x-auto">
                  <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-[#fafaf9] rounded-lg text-[11px] font-medium text-[#71717a] uppercase tracking-wide"><div>Loan ID</div><div>Learner</div><div>Laptop</div><div>Issue</div><div>Due</div><div>Status</div><div>Action</div></div>
                  {(tab==='active'? loans.filter(l=>l.status==='Issued'): loans).map(l=>(
                    <div key={l.id} className="grid grid-cols-7 gap-4 px-4 py-4 border-b border-[#f4f4f5] items-center text-[13px]">
                      <div className="font-mono font-medium">{l.id}</div><div><p className="font-medium">{l.learner||l.learnerId}</p><p className="text-[11px] text-[#a1a1aa] font-mono">{l.learnerId}</p></div><div className="font-mono">{l.laptop}</div><div>{l.issue}</div><div>{l.due}</div><div><span className="px-3 py-1 rounded-full bg-[#dbeafe] text-[#1e40af] text-[11px]">{l.status}</span></div><div><button onClick={()=>{ setLoans(loans.filter(x=>x.id!==l.id)); setLaptops(laptops.map(lp=> lp.id===l.laptop || lp.asset_tag===l.laptop ? {...lp, status:'available'}:lp)); addAudit('LAPTOP_RETURNED', `${l.laptop} returned by ${l.learner}`); showToast('✅ Return recorded - Laptop available'); }} className="px-4 h-8 bg-[#E30613] text-white rounded-full text-[11px] font-semibold hover:bg-[#c00510]">Record return</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          
          {activePage==='reports' && (
            <div className="space-y-6 max-w-[1400px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">ADMIN - ADVANCED REPORTS & ANALYTICS</p>
                  <h1 className="text-[28px] font-black mt-2">Reports & Analytics • Graphs</h1>
                  <p className="text-[13px] text-[#71717a] mt-1">All graphs exportable as PNG, CSV, and PDF • Live data</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{ exportCSV('full_system_report.csv', [{totalLaptops, availableLaptops, issuedLaptops, maintenanceLaptops, activeLoans, pendingRequests, totalLearners, overdueLoans, totalRequests: requests.length, totalAudit: auditLog.length, date: new Date().toLocaleString()}]); }} className="h-11 px-5 bg-[#111] text-white rounded-full text-[12px] font-bold flex items-center gap-2"><Download size={14}/> Export Summary CSV</button>
                  <button onClick={()=>window.print()} className="h-11 px-5 bg-[#E30613] text-white rounded-full text-[12px] font-bold flex items-center gap-2"><FileText size={14}/> Export PDF (Print)</button>
                </div>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#111] to-[#333] text-white rounded-[16px] p-5"><p className="text-[10px] opacity-60 uppercase tracking-widest">Total Value</p><p className="text-[20px] font-bold mt-2">{totalLaptops} Laptops</p><p className="text-[11px] opacity-60 mt-1">Across {[...new Set(laptops.map(l=>l.brand))].length} brands</p></div>
                <div className="bg-white border rounded-[16px] p-5"><p className="text-[10px] text-[#a1a1aa] uppercase">Utilization Rate</p><p className="text-[24px] font-black mt-2">{totalLaptops ? Math.round((issuedLaptops/totalLaptops)*100) : 0}%</p><div className="mt-2 h-2 bg-[#f4f4f5] rounded-full"><div className="h-full bg-[#E30613] rounded-full" style={{width: `${totalLaptops ? Math.round((issuedLaptops/totalLaptops)*100) : 0}%`}}></div></div></div>
                <div className="bg-white border rounded-[16px] p-5"><p className="text-[10px] text-[#a1a1aa] uppercase">Approval Rate</p><p className="text-[24px] font-black mt-2 text-[#22c55e]">{requests.length ? Math.round((requests.filter(r=>r.status==='approved').length/requests.length)*100) : 0}%</p><p className="text-[11px] text-[#22c55e] mt-1">{requests.filter(r=>r.status==='approved').length} approved of {requests.length}</p></div>
                <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[16px] p-5"><p className="text-[10px] text-[#92400e] uppercase font-bold">Pending Action</p><p className="text-[24px] font-black mt-2 text-[#92400e]">{pendingRequests}</p><p className="text-[11px] text-[#92400e] mt-1">Needs approval now</p></div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* GRAPH 1: Laptop Status Donut */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <div className="flex justify-between items-center"><h3 className="font-bold text-[14px] flex items-center gap-2"><BarChart3 size={16}/> Laptop Status Distribution • Donut</h3><div className="flex gap-2"><button onClick={()=>exportCSV('laptop_status.csv', [{status:'available', count:availableLaptops}, {status:'issued', count:issuedLaptops}, {status:'maintenance', count:maintenanceLaptops}, {status:'overdue', count:overdueLoans}])} className="px-3 h-7 bg-[#f4f4f5] rounded-full text-[11px]">CSV</button><button onClick={()=>{ const c=document.getElementById('graph-status'); if(c){ const link=document.createElement('a'); link.download='laptop_status.png'; link.href=c.toDataURL(); link.click(); } }} className="px-3 h-7 bg-[#111] text-white rounded-full text-[11px]">PNG</button></div></div>
                  <div className="mt-6 flex items-center justify-center gap-8">
                    <div className="relative w-[160px] h-[160px]">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {(() => {
                          const data = [{v: availableLaptops, c: '#22c55e'}, {v: issuedLaptops, c: '#111'}, {v: maintenanceLaptops, c: '#f59e0b'}, {v: overdueLoans||1, c: '#E30613'}];
                          const total = data.reduce((s,d)=>s+d.v,0) || 1;
                          let offset = 0;
                          return data.map((d,i)=>{
                            const pct = d.v/total;
                            const dash = pct*251.2;
                            const el = <circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={d.c} strokeWidth="16" strokeDasharray={`${dash} 251.2`} strokeDashoffset={-offset} className="transition-all"/>;
                            offset += dash;
                            return el;
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-[22px] font-black">{totalLaptops}</p><p className="text-[10px] text-[#a1a1aa] uppercase">Total</p></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 bg-[#22c55e] rounded-full"></span>Available <b>{availableLaptops}</b> ({totalLaptops?Math.round(availableLaptops/totalLaptops*100):0}%)</div>
                      <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 bg-[#111] rounded-full"></span>Issued <b>{issuedLaptops}</b></div>
                      <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 bg-[#f59e0b] rounded-full"></span>Maintenance <b>{maintenanceLaptops}</b></div>
                      <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 bg-[#E30613] rounded-full"></span>Overdue <b>{overdueLoans}</b></div>
                    </div>
                  </div>
                  <canvas id="graph-status" width="400" height="200" className="hidden"></canvas>
                </div>

                {/* GRAPH 2: Brand Distribution Bar */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <div className="flex justify-between"><h3 className="font-bold text-[14px]">Brand Distribution • Bar Chart</h3><button onClick={()=>exportCSV('brand_distribution.csv', [...new Set(laptops.map(l=>l.brand))].map(b=>({brand:b, count:laptops.filter(l=>l.brand===b).length})))} className="px-3 h-7 bg-[#f4f4f5] rounded-full text-[11px]">Export CSV</button></div>
                  <div className="mt-6 space-y-3">
                    {[...new Set(laptops.map(l=>l.brand))].map(brand=>{
                      const count = laptops.filter(l=>l.brand===brand).length;
                      const max = Math.max(...[...new Set(laptops.map(l=>l.brand))].map(b=>laptops.filter(l=>l.brand===b).length)) || 1;
                      const pct = (count/max)*100;
                      return (
                        <div key={brand}><div className="flex justify-between text-[12px]"><span className="font-medium">{brand}</span><span className="font-bold">{count} laptops</span></div><div className="mt-1 h-8 bg-[#f4f4f5] rounded-full overflow-hidden relative"><div className="h-full bg-gradient-to-r from-[#E30613] to-[#111] rounded-full flex items-center justify-end pr-3 transition-all duration-700" style={{width: `${pct}%`}}><span className="text-[10px] text-white font-bold">{Math.round(pct)}%</span></div></div></div>
                      );
                    })}
                  </div>
                </div>

                {/* GRAPH 3: Requests Status */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <div className="flex justify-between"><h3 className="font-bold text-[14px]">Loan Requests Status • Pie & Stats</h3><button onClick={()=>exportCSV('requests_status.csv', [{status:'pending', count: requests.filter(r=>r.status==='pending').length}, {status:'approved', count: requests.filter(r=>r.status==='approved').length}, {status:'rejected', count: requests.filter(r=>r.status==='rejected').length}])} className="px-3 h-7 bg-[#f4f4f5] rounded-full text-[11px]">Export CSV</button></div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      {label:'Pending', count: requests.filter(r=>r.status==='pending').length, color:'bg-[#fef3c7] border-[#fde68a] text-[#92400e]', dot:'bg-[#f59e0b]'},
                      {label:'Approved', count: requests.filter(r=>r.status==='approved').length, color:'bg-[#dcfce7] border-[#bbf7d0] text-[#166534]', dot:'bg-[#22c55e]'},
                      {label:'Rejected', count: requests.filter(r=>r.status==='rejected').length, color:'bg-[#fee2e2] border-[#fecaca] text-[#991b1b]', dot:'bg-[#E30613]'},
                    ].map(s=>(
                      <div key={s.label} className={`rounded-[16px] p-4 border-2 ${s.color} text-center`}><div className={`w-3 h-3 ${s.dot} rounded-full mx-auto`}></div><p className="text-[22px] font-black mt-2">{s.count}</p><p className="text-[11px] font-bold uppercase">{s.label}</p><div className="mt-2 h-1 bg-white/50 rounded-full"><div className={`h-full ${s.dot} rounded-full`} style={{width: `${requests.length? Math.round((s.count/requests.length)*100):0}%`}}></div></div><p className="text-[10px] mt-1">{requests.length? Math.round((s.count/requests.length)*100):0}% of total</p></div>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-[#fafaf9] rounded-xl border">
                    <p className="text-[11px] font-bold uppercase">Monthly Trend (Requests)</p>
                    <div className="mt-3 flex items-end gap-2 h-[80px]">
                      {[3,5,2,8,6,4,7].map((h,i)=><div key={i} className="flex-1 bg-gradient-to-t from-[#E30613] to-[#fde2e2] rounded-t-lg transition-all hover:from-[#111] hover:to-[#E30613]" style={{height: `${h*10+20}%`}} title={`${h} requests`}></div>)}
                    </div>
                    <div className="flex justify-between text-[9px] text-[#a1a1aa] mt-2"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                  </div>
                </div>

                {/* GRAPH 4: Loans Over Time Line */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <div className="flex justify-between"><h3 className="font-bold text-[14px]">Loans vs Returns • Line Chart</h3><button onClick={()=>exportCSV('loans_returns_trend.csv', loans.map(l=>({id:l.id, learner:l.learner, laptop:l.laptop, issue:l.issue, due:l.due, status:l.status})))} className="px-3 h-7 bg-[#f4f4f5] rounded-full text-[11px]">Export CSV</button></div>
                  <div className="mt-6 relative h-[200px] bg-[#fafaf9] rounded-xl border p-4">
                    <svg viewBox="0 0 300 120" className="w-full h-full">
                      <polyline fill="none" stroke="#E30613" strokeWidth="3" points={`0,80 ${loans.length>0? loans.slice(0,6).map((_,i)=> `${(i+1)*40},${60+Math.sin(i)*20}`).join(' ') : '40,60 80,40 120,70 160,30 200,50 240,20'}`} className="drop-shadow-sm"/>
                      <polyline fill="none" stroke="#111" strokeWidth="2" strokeDasharray="6 4" points="0,100 40,90 80,85 120,80 160,75 200,70 240,60" opacity="0.5"/>
                      {loans.slice(0,6).map((_,i)=><circle key={i} cx={(i+1)*40} cy={60+Math.sin(i)*20} r="4" fill="#E30613" stroke="white" strokeWidth="2"/>)}
                    </svg>
                    <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-[#a1a1aa]"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Today</span></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]"><div className="flex items-center gap-2"><span className="w-3 h-1 bg-[#E30613] rounded-full"></span>Active Loans: {activeLoans}</div><div className="flex items-center gap-2"><span className="w-3 h-1 bg-[#111] rounded-full"></span>Returned: {loans.length-activeLoans}</div></div>
                </div>

                {/* GRAPH 5: Condition & RAM */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <h3 className="font-bold text-[14px]">Laptop Condition & Specs</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div><p className="text-[11px] font-bold uppercase">Condition</p><div className="mt-2 space-y-2">{['Excellent','Good','Fair','Needs Repair'].map(c=>{ const cnt=laptops.filter(l=>l.condition===c).length; return <div key={c} className="flex justify-between text-[11px]"><span>{c}</span><span className="font-bold">{cnt}</span></div>})}</div></div>
                    <div><p className="text-[11px] font-bold uppercase">RAM Distribution</p><div className="mt-2 space-y-2">{[...new Set(laptops.map(l=>l.ram))].map(r=>{ const cnt=laptops.filter(l=>l.ram===r).length; return <div key={r} className="flex justify-between text-[11px]"><span>{r}</span><span className="font-bold">{cnt}</span></div>})}</div></div>
                  </div>
                  <button onClick={()=>exportCSV('laptop_specs.csv', laptops.map(l=>({asset_tag:l.asset_tag, brand:l.brand, model:l.model, ram:l.ram, storage:l.storage, cpu:l.cpu, condition:l.condition, status:l.status})))} className="w-full mt-4 h-9 bg-[#f4f4f5] rounded-full text-[11px] font-bold">Export Full Specs CSV</button>
                </div>

                {/* GRAPH 6: Top Learners */}
                <div className="bg-white border border-[#ecebe8] rounded-[20px] p-6 shadow-sm">
                  <h3 className="font-bold text-[14px]">Top Learners • Most Active</h3>
                  <div className="mt-4 space-y-3">
                    {users.filter(u=>u.role==='learner').slice(0,5).map(u=>{
                      const reqCount = requests.filter(r=>String(r.learnerID)===String(u.userID)).length;
                      const loanCount = loans.filter(l=>String(l.learnerId)===String(u.userID)).length;
                      const total = reqCount+loanCount;
                      return (
                        <div key={u.userID} className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-xl border">
                          <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">{u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover"/> : u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
                          <div className="flex-1"><p className="text-[12px] font-bold">{u.name} • {u.userID}</p><p className="text-[10px] text-[#71717a]">{reqCount} requests • {loanCount} loans</p></div>
                          <div className="text-right"><p className="text-[14px] font-black">{total}</p><p className="text-[9px] text-[#a1a1aa]">TOTAL</p></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* EXPORT ALL SECTION */}
              <div className="bg-[#111] text-white rounded-[20px] p-8">
                <div className="flex justify-between items-center">
                  <div><h3 className="font-bold text-[16px]">Export Everything • All Graphs Exportable</h3><p className="text-[12px] opacity-60 mt-1">Each graph has CSV + PNG export. Use buttons below for bulk export.</p></div>
                  <div className="flex gap-2">
                    <button onClick={()=>{ exportCSV('laptops_inventory.csv', laptops); exportCSV('loans_returns.csv', loans); exportCSV('learner_accounts.csv', users.filter(u=>u.role==='learner')); exportCSV('audit_log.csv', auditLog); exportCSV('laptop_requests.csv', requests); showToast('✅ All 5 CSVs exported'); }} className="h-11 px-6 bg-white text-black rounded-full text-[12px] font-bold">Export All CSVs (5 files)</button>
                    <button onClick={()=>window.print()} className="h-11 px-6 bg-[#E30613] text-white rounded-full text-[12px] font-bold">Export All as PDF</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <button onClick={()=>exportCSV('laptops_inventory.csv', laptops)} className="h-[56px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20"><Download size={16}/><span className="text-[12px] font-medium">Laptops Inventory</span></button>
                  <button onClick={()=>exportCSV('loans_returns.csv', loans)} className="h-[56px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20"><Download size={16}/><span className="text-[12px] font-medium">Loans & Returns</span></button>
                  <button onClick={()=>exportCSV('learner_accounts.csv', users.filter(u=>u.role==='learner'))} className="h-[56px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20"><Download size={16}/><span className="text-[12px] font-medium">Learner Accounts</span></button>
                  <button onClick={()=>exportCSV('audit_log.csv', auditLog)} className="h-[56px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20"><FileText size={16}/><span className="text-[12px] font-medium">Audit Log</span></button>
                  <button onClick={()=>exportCSV('laptop_requests.csv', requests)} className="h-[56px] rounded-xl bg-white/10 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/20"><ClipboardList size={16}/><span className="text-[12px] font-medium">All Requests</span></button>
                  <button onClick={()=>exportCSV('summary_stats.csv', [{totalLaptops, availableLaptops, issuedLaptops, maintenanceLaptops, activeLoans, pendingRequests, totalLearners, overdueLoans, date:new Date().toLocaleString()}])} className="h-[56px] rounded-xl bg-[#E30613] flex items-center justify-center gap-2"><BarChart3 size={16}/><span className="text-[12px] font-medium">Full System Report</span></button>
                </div>
                <p className="text-[10px] opacity-50 mt-4 text-center">Graphs are built with SVG - right-click any graph to Save as Image. CSV exports include all raw data for Excel.</p>
              </div>
            </div>
          )}



          {activePage==='maintenance' && (
            <div className="space-y-6 max-w-[900px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">ADMIN - MAINTENANCE</p><h1 className="text-[28px] font-bold mt-2">Maintenance</h1><p className="text-[13px] text-[#71717a] mt-1">Laptops in repair, mark available after fix.</p></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-6 shadow-sm">
                <h3 className="font-semibold text-[14px]">In Maintenance - {maintenanceLaptops}</h3>
                <div className="mt-4 grid gap-4">
                  {laptops.filter(l=>l.status==='maintenance').map(lp=><div key={lp.id} className="p-4 bg-[#fef3c7] rounded-xl border flex justify-between items-center"><div><p className="font-bold text-[13px]">{lp.asset_tag} - {lp.brand} {lp.model}</p><p className="text-[11px] text-[#a1a1aa]">{lp.condition} • {lp.ram} • {lp.storage}</p></div><button onClick={()=>{ setLaptops(laptops.map(x=> x.id===lp.id ? {...x, status:'available'}:x)); showToast('Moved to available'); }} className="px-4 h-9 bg-[#111] text-white rounded-full text-[12px]">Mark Fixed → Available</button></div>)}
                  {maintenanceLaptops===0 && <p className="text-[13px] text-[#a1a1aa] text-center py-8">No laptops in maintenance — all good!</p>}
                </div>
              </div>
            </div>
          )}

          {activePage==='settings' && (
            <div className="space-y-6 max-w-[900px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">SETTINGS</p><h1 className="text-[28px] font-bold mt-2">Settings</h1><p className="text-[13px] text-[#71717a] mt-1">Letter size, display, notifications, profile picture 160px.</p></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-8 shadow-sm">
                <h3 className="font-bold text-[16px]">Letter Size - {fontSize}px</h3>
                <div className="mt-4 flex items-center gap-4"><span>A-</span><input type="range" min="12" max="22" value={fontSize} onChange={e=>{ const v=Number(e.target.value); setFontSize(v); localStorage.setItem('llms_fontSize', String(v)); }} className="flex-1 accent-[#E30613]"/><span>A+</span><div className="w-14 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[12px] font-bold">{fontSize}px</div></div>
                <div className="mt-6 grid grid-cols-4 gap-3">
                  {[12,14,17,20].map(s=><button key={s} onClick={()=>{ setFontSize(s); localStorage.setItem('llms_fontSize', String(s)); }} className={'h-[70px] rounded-xl border-2 flex flex-col items-center justify-center ' + (fontSize===s?'border-[#E30613] bg-[#fef2f2]':'border-[#e4e4e7]')}><span className="font-bold" style={{fontSize:s+'px'}}>Aa - {s}px</span></button>)}
                </div>
              </div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-8 shadow-sm">
                <h3 className="font-bold text-[16px]">Display Theme</h3>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <button onClick={()=>{ localStorage.setItem('llms_theme','light'); setTheme('light'); }} className={'h-[100px] rounded-[16px] border-2 p-4 ' + (theme==='light'?'border-[#E30613] bg-[#fef2f2]':'border-[#e4e4e7]')}>Light</button>
                  <button onClick={()=>{ localStorage.setItem('llms_theme','dark'); setTheme('dark'); }} className={'h-[100px] rounded-[16px] border-2 p-4 bg-[#111] text-white ' + (theme==='dark'?'border-[#E30613]':'border-[#e4e4e7]')}>Dark</button>
                  <button onClick={()=>{ localStorage.setItem('llms_theme','oracle'); setTheme('oracle'); }} className={'h-[100px] rounded-[16px] border-2 p-4 bg-[#fef2f2] ' + (theme==='oracle'?'border-[#E30613] bg-[#E30613] text-white':'border-[#e4e4e7]')}>Oracle Red</button>
                </div>
              </div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-8 shadow-sm">
                <h3 className="font-bold text-[16px] flex items-center gap-2"><BellRing size={18}/> Notifications ON/OFF</h3>
                <div className="mt-4 flex items-center justify-between p-4 bg-[#fafaf9] rounded-xl border"><div><p className="text-[13px] font-semibold">System Notifications</p><p className="text-[11px] text-[#71717a]">Toggle all alerts</p></div><button onClick={()=>{ const v=!notificationsOn; setNotificationsOn(v); localStorage.setItem('llms_notifications', v?'on':'off'); }} className={'w-[56px] h-[32px] rounded-full p-1 flex ' + (notificationsOn?'bg-[#E30613] justify-end':'bg-[#e4e4e7] justify-start')}><div className="w-6 h-6 rounded-full bg-white shadow-md"></div></button></div>
                {!notificationsOn && <div className="mt-3 p-3 bg-[#fef2f2] border rounded-xl text-[12px] text-[#991b1b] text-center">🔕 Notifications OFF</div>}
                {notificationsOn && <div className="mt-3 p-3 bg-[#f0fdf4] border rounded-xl text-[12px] text-[#166534] text-center">🔔 Notifications ON</div>}
              </div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-8 shadow-sm">
                <h3 className="font-semibold text-[15px] flex items-center gap-2"><Camera size={18}/> Profile Picture - 160px Dashboard</h3>
                <div className="flex gap-8 mt-6"><div className="w-[100px] h-[100px] rounded-[20px] overflow-hidden bg-[#f4f4f5] border-2 flex items-center justify-center">{profilePic ? <img src={profilePic} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-[#111] text-white flex items-center justify-center text-[28px] font-black">{initials}</div>}</div><div className="flex-1 space-y-3"><button onClick={()=>fileRef.current?.click()} className="w-full h-11 bg-[#111] text-white rounded-full text-[13px] flex items-center justify-center gap-2"><Upload size={16}/> Upload Picture</button>{profilePic && <button onClick={()=>{ setProfilePic(''); showToast('Removed'); }} className="w-full h-10 bg-white border rounded-full text-[12px] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600"><Trash2 size={14}/> Remove</button>}<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload}/></div></div>
              </div>
            </div>
          )}

          {activePage==='help' && (
            <div className="space-y-6 max-w-[900px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">SUPPORT</p><h1 className="text-[28px] font-bold mt-2">Help & Support</h1></div>
              <div className="space-y-3">
                {[
                  {q:'How do I borrow a laptop?', a:'Go to Request Laptop → Fill reason & date & time → Request. Admin approves in Laptop Requests → Issues in Loans & Returns.'},
                  {q:'What is UserID format?', a:'6 digits only e.g. 123456 — used for login.'},
                  {q:'How to upload profile picture?', a:'Top-right AD menu → Upload OR Settings → Profile Picture. 160px shown in header & sidebar. Max 5MB.'},
                  {q:'Admin: How to add laptop with photo?', a:'Laptop management → Add Laptop → Fill Asset Tag, Brand, Model → Upload Photo from PC → Add.'},
                  {q:'How to change letter size & display?', a:'Settings → Letter Size slider 12-22px → Display Light/Dark/Oracle Red → Saves instantly.'},
                  {q:'Notifications ON/OFF?', a:'Settings → Notifications toggle. When ON: alerts for requests, overdue, returns.'},
                  {q:'What happens when overdue?', a:'Loans & Returns tracks due dates. Overdue badge. Must return immediately.'},
                  {q:'How to record return?', a:'Loans & Returns → Find loan → Record return → Laptop becomes available.'},
                ].map((faq,i)=><div key={i} className="bg-white border border-[#ecebe8] rounded-[16px] shadow-sm"><details className="group"><summary className="flex justify-between p-5 cursor-pointer list-none"><span className="font-semibold text-[13px]">{i+1}. {faq.q}</span><span>⌄</span></summary><div className="px-5 pb-5"><div className="p-4 bg-[#fafaf9] rounded-xl border text-[13px]">{faq.a}</div></div></details></div>)}
              </div>
            </div>
          )}

          {activePage==='learners' && (
            <div className="space-y-6 max-w-[1200px]">
              <div className="flex items-start justify-between"><div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">LEARNERS</p><h1 className="text-[28px] font-bold mt-2">Learners</h1></div><button onClick={()=>{ setEditingUser(null); setLearnerForm({name:'', userID:'', password:'', email:''}); setShowLearnerModal(true); }} className="h-11 px-6 bg-[#E30613] text-white rounded-full text-[13px] font-semibold flex items-center gap-2"><Plus size={16}/> Create Learner</button></div>
              <div className="bg-white border rounded-[16px] p-2 shadow-sm flex gap-2 w-fit"><button onClick={()=>setLearnerTab('accounts')} className={'px-5 h-9 rounded-full text-[12px] ' + (learnerTab==='accounts'?'bg-[#111] text-white':'bg-[#f4f4f5]')}>Accounts ({users.filter(u=>u.role==='learner').length})</button><button onClick={()=>setLearnerTab('audit')} className={'px-5 h-9 rounded-full text-[12px] ' + (learnerTab==='audit'?'bg-[#111] text-white':'bg-[#f4f4f5]')}>Audit Log ({auditLog.length})</button></div>
              {learnerTab==='accounts' && (
                <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden">
                  <div className="p-4 flex gap-4"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]"/><input value={learnerSearch} onChange={e=>setLearnerSearch(e.target.value)} placeholder="Search name, UserID..." className="w-full h-10 bg-[#fafaf9] border rounded-full pl-9 pr-4 text-[13px] outline-none"/></div></div>
                  <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-[#fafaf9] text-[11px] font-bold tracking-widest text-[#71717a] uppercase"><div>Learner</div><div>UserID</div><div>Email</div><div>Role</div><div>Status</div><div>Actions</div></div>
                  {users.filter(u=>u.role==='learner').filter(u=> !learnerSearch || (u.name+u.userID).toLowerCase().includes(learnerSearch.toLowerCase())).map(lr=>(
                    <div key={lr.userID} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-[#f4f4f5] items-center text-[13px] hover:bg-[#fafaf9]"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">{lr.profilePic ? <img src={lr.profilePic} className="w-full h-full object-cover"/> : <span>{lr.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span>}</div><p className="font-semibold">{lr.name}</p></div><div><span className="font-mono bg-[#f4f4f5] px-2 py-1 rounded-full text-[12px]">{lr.userID}</span></div><div className="text-[12px]">{lr.email}</div><div>{lr.role}</div><div><span className="px-3 py-1 rounded-full bg-[#dcfce7] text-[#166534] text-[10px]">ACTIVE</span></div><div className="flex gap-1"><button onClick={()=>{ setEditingUser(lr); setLearnerForm({name:lr.name, userID:lr.userID, password:'', email:lr.email||''}); setShowLearnerModal(true); }} className="w-8 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center hover:bg-[#111] hover:text-white"><Edit3 size={14}/></button><button onClick={()=>{ setShowPwdModal(lr); }} className="w-8 h-8 rounded-full bg-[#f4f4f5] flex items-center justify-center">🔑</button><button onClick={()=>{ if(!confirm('Delete '+lr.name+'?')) return; setUsers(users.filter(u=> String(u.userID)!==String(lr.userID))); addAudit('ACCOUNT_DELETED', `Deleted ${lr.name}`); }} className="w-8 h-8 rounded-full bg-[#fef2f2] text-[#E30613] flex items-center justify-center"><Trash2 size={14}/></button></div></div>
                  ))}
                </div>
              )}
              {learnerTab==='audit' && (
                <div className="bg-white border rounded-[16px] shadow-sm overflow-hidden"><div className="grid grid-cols-4 gap-4 px-6 py-3 bg-[#fafaf9] text-[11px] font-bold uppercase"><div>Time</div><div>User</div><div>Action</div><div>Details</div></div>{auditLog.map(log=><div key={log.id} className="grid grid-cols-4 gap-4 px-6 py-3 border-b text-[12px]"><div className="text-[11px] text-[#71717a]">{log.timestamp}</div><div>{log.user} ({log.userID})</div><div><span className="px-2 py-1 rounded-full bg-[#f4f4f5] text-[10px] font-bold">{log.action}</span></div><div>{log.detail}</div></div>)}</div>
              )}
              {showLearnerModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowLearnerModal(false)}></div><div className="relative bg-white rounded-[20px] w-full max-w-[520px] shadow-2xl p-6"><h3 className="font-bold text-[18px]">{editingUser?'Edit Learner':'Create Learner'}</h3><form onSubmit={e=>{ e.preventDefault(); if(!learnerForm.name.trim() || !/^\d{6}$/.test(learnerForm.userID)) return showToast('Check fields'); if(!editingUser && users.some(u=> String(u.userID)===String(learnerForm.userID))) return showToast('UserID exists'); if(editingUser){ setUsers(users.map(u=> String(u.userID)===String(editingUser.userID) ? {...u, name:learnerForm.name, userID:learnerForm.userID, email:learnerForm.email}:u)); } else { setUsers([...users, {id:Date.now(), name:learnerForm.name, userID:learnerForm.userID, email:learnerForm.email||learnerForm.userID+'@student.edu', role:'learner', password:learnerForm.password, created_at:new Date().toISOString()}]); } setShowLearnerModal(false); showToast(editingUser?'Updated':'Created'); }} className="mt-4 space-y-4"><input value={learnerForm.name} onChange={e=>setLearnerForm({...learnerForm, name:e.target.value})} placeholder="Full Name" className="w-full h-11 bg-[#fafaf9] border rounded-xl px-4 text-[13px]" required/><div className="grid grid-cols-2 gap-4"><input value={learnerForm.userID} onChange={e=>setLearnerForm({...learnerForm, userID:e.target.value.replace(/\D/g,'').slice(0,6)})} placeholder="UserID 6 digits" className="w-full h-11 bg-[#fafaf9] border rounded-xl px-4 text-[13px] font-mono" required/><input type="password" value={learnerForm.password} onChange={e=>setLearnerForm({...learnerForm, password:e.target.value})} placeholder="Password min 6" className="w-full h-11 bg-[#fafaf9] border rounded-xl px-4 text-[13px]"/></div><input value={learnerForm.email} onChange={e=>setLearnerForm({...learnerForm, email:e.target.value})} placeholder="Email optional" className="w-full h-11 bg-[#fafaf9] border rounded-xl px-4 text-[13px]"/><div className="flex gap-3"><button type="button" onClick={()=>setShowLearnerModal(false)} className="flex-1 h-12 bg-white border rounded-full text-[13px]">Cancel</button><button type="submit" className="flex-1 h-12 bg-[#E30613] text-white rounded-full text-[13px]">{editingUser?'Update':'Create'}</button></div></form></div></div>
              )}
              {showPwdModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50" onClick={()=>setShowPwdModal(null)}></div><div className="relative bg-white rounded-[20px] w-full max-w-[400px] p-6"><h3 className="font-bold">Change Password - {showPwdModal.name}</h3><form onSubmit={e=>{ e.preventDefault(); if(newPassword.length<6) return showToast('Min 6'); setUsers(users.map(u=> String(u.userID)===String(showPwdModal.userID) ? {...u, password:newPassword}:u)); setShowPwdModal(null); setNewPassword(''); showToast('Password changed'); }} className="mt-4 space-y-4"><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" className="w-full h-11 border rounded-xl px-4 text-[13px]" required/><div className="flex gap-3"><button type="button" onClick={()=>setShowPwdModal(null)} className="flex-1 h-11 border rounded-full">Cancel</button><button type="submit" className="flex-1 h-11 bg-[#111] text-white rounded-full">Change</button></div></form></div></div>
              )}
            </div>
          )}

          {activePage==='notifications' && (
            <div className="space-y-6 max-w-[1000px]">
              <div><p className="text-[10px] tracking-[0.15em] text-[#E30613] font-semibold uppercase">{user?.role==='admin'?'ADMIN':'LEARNER'} - NOTIFICATIONS</p><h1 className="text-[28px] font-bold mt-2">Notifications {notificationsOn?'🔔 ON':'🔕 OFF'}</h1><p className="text-[13px] text-[#71717a] mt-1">{user?.role==='admin'?'All system alerts':'Your alerts only - filtered by UserID '+user?.userID}</p></div>
              <div className="bg-white border border-[#ecebe8] rounded-[16px] p-6 shadow-sm">
                <div className="space-y-3">
                  {user?.role==='admin' ? requests.map(req=><div key={req.id} className="p-4 bg-[#fef3c7] rounded-xl border flex gap-3"><div className="w-10 h-10 rounded-full bg-[#f59e0b] text-white flex items-center justify-center"><ClipboardList size={16}/></div><div className="flex-1"><p className="text-[13px] font-bold">New Request - {req.learner} ({req.learnerID}) - {req.asset_tag}</p><p className="text-[12px] mt-1">{req.reason?.slice(0,80)} • Need: {req.needDate ? new Date(req.needDate).toLocaleString() : ''}</p></div><span className="text-[10px] px-2 py-1 bg-[#f59e0b] text-white rounded-full h-fit">{req.status}</span></div>) : requests.filter(r=> String(r.learnerID)===String(user?.userID)).map(req=><div key={req.id} className="p-4 bg-[#fef3c7] rounded-xl border flex gap-3"><div className="w-10 h-10 rounded-full bg-[#f59e0b] text-white flex items-center justify-center"><ClipboardList size={16}/></div><div className="flex-1"><p className="text-[13px] font-bold">{req.status==='pending'?'⏳ Pending Approval':'✅ Approved'} - {req.brand} {req.model}</p><p className="text-[12px] mt-1">{req.reason} • Need: {req.needDate ? new Date(req.needDate).toLocaleString() : ''}</p></div></div>)}
                  {requests.length===0 && <div className="text-center py-10"><BellRing size={32} className="mx-auto text-[#d4d4d8]"/><p className="text-[13px] mt-3">No notifications</p></div>}
                  {user?.role==='learner' && requests.filter(r=> String(r.learnerID)===String(user?.userID)).length===0 && <div className="text-center py-10"><BellRing size={32} className="mx-auto text-[#d4d4d8]"/><p className="text-[13px] font-bold mt-3">No alerts for {user?.name}</p></div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
