import React, { useState, useEffect } from 'react';
import { Laptop, GraduationCap, Shield, Rocket, Users, ArrowRight, User, Lock, LayoutDashboard, History, Bell, Settings, HelpCircle, LogOut, Camera, Mail, Phone, Key, Type, Sun, Moon, FileText, CheckCircle, Clock, Calendar, Send, Trash2, UserPlus, BarChart3, Download, Wrench, Package, ClipboardList, BookOpen, Eye, Edit2, AlertTriangle, RotateCcw } from 'lucide-react';

const LOGO = "/oracle_logo.png";
const LAP = "/lap2.jpeg";

const DEFAULT_LAPTOPS = [
  {id:'l1', asset_tag:'PO-001', brand:'Dell', model:'Latitude 7420', status:'available', condition:'good', image:'/lap2.jpeg'},
  {id:'l2', asset_tag:'PO-002', brand:'HP', model:'EliteBook 840', status:'available', condition:'good', image:'/lap2.jpeg'},
  {id:'l3', asset_tag:'PO-003', brand:'Lenovo', model:'ThinkPad T14', status:'available', condition:'good', image:'/lap2.jpeg'},
];

export default function App(){
  const [users, setUsers] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_users')||'[]') }catch{ return [] } });
  const [user, setUser] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_user')||'null') }catch{ return null } });
  const [laptops, setLaptops] = useState(()=>{ 
    try{ 
      const v=JSON.parse(localStorage.getItem('llms_laptops')||'null'); 
      if(v && v.length) return v;
      return DEFAULT_LAPTOPS;
    }catch{ 
      return DEFAULT_LAPTOPS;
    }
  });
  const [loans, setLoans] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_loans')||'[]') }catch{ return [] } });
  const [notifs, setNotifs] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_notifs')||'[]') }catch{ return [] } });
  const [maintenance, setMaintenance] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('llms_maint')||'[]') }catch{ return [] } });

  const [page, setPage] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({userID:'', password:''});
  const [regForm, setRegForm] = useState({name:'', userID:'', password:'', role:'learner', email:'', phone:''});
  const [showRegister, setShowRegister] = useState(true);
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState(null);

  const [fontSize, setFontSize] = useState(()=> localStorage.getItem('llms_font')||'medium');
  const [theme, setTheme] = useState(()=> localStorage.getItem('llms_theme')||'light');
  const [profilePic, setProfilePic] = useState(()=> localStorage.getItem('llms_profile_pic')||'');
  const [requestForm, setRequestForm] = useState({laptopId:'', date:'', reason:''});
  const [laptopForm, setLaptopForm] = useState({asset_tag:'', brand:'', model:''});
  const [logoError, setLogoError] = useState(false);
  const [lapError, setLapError] = useState(false);

  const showToast = (t)=>{ setToast(t); setTimeout(()=>setToast(null),3000); };
  const validate = (n)=> /^\d{6}$/.test(String(n||''));

  useEffect(()=>{ localStorage.setItem('llms_users', JSON.stringify(users)); },[users]);
  useEffect(()=>{ localStorage.setItem('llms_laptops', JSON.stringify(laptops)); },[laptops]);
  useEffect(()=>{ localStorage.setItem('llms_loans', JSON.stringify(loans)); },[loans]);
  useEffect(()=>{ localStorage.setItem('llms_notifs', JSON.stringify(notifs)); },[notifs]);
  useEffect(()=>{ localStorage.setItem('llms_maint', JSON.stringify(maintenance)); },[maintenance]);
  useEffect(()=>{ localStorage.setItem('llms_font', fontSize); },[fontSize]);
  useEffect(()=>{ localStorage.setItem('llms_theme', theme); },[theme]);
  useEffect(()=>{ if(profilePic) localStorage.setItem('llms_profile_pic', profilePic); },[profilePic]);

  const handleLogin = (e)=>{
    e.preventDefault();
    const uid=String(loginForm.userID).trim();
    if(!validate(uid)) return setMsg('UserID must be 6 digits');
    const f=users.find(u=> String(u.userID||u.studentNumber)===uid);
    if(f){
      const up={...f, lastLogin:new Date().toISOString()};
      setUsers(users.map(u=>u.id===f.id?up:u));
      localStorage.setItem('llms_user', JSON.stringify(up));
      setUser(up);
      setPage('dashboard');
      showToast('Welcome ' + (up.name||up.userID)+'!');
    } else setMsg('UserID not found - Register first and choose Learner or Admin');
  };
  const handleRegister = (e)=>{
    e.preventDefault();
    const uid=String(regForm.userID).trim();
    if(!regForm.name.trim()) return setMsg('Full Name required');
    if(!validate(uid)) return setMsg('UserID must be 6 digits');
    if(regForm.password.length<6) return setMsg('Password min 6');
    if(users.some(u=> String(u.userID||u.studentNumber)===uid)) return setMsg('UserID exists - Login');
    if(!regForm.role) return setMsg('Choose Learner or Admin');
    const nu={id:Date.now(), name:regForm.name.trim(), userID:uid, studentNumber:uid, email:regForm.email||uid+'@student.edu', phone:regForm.phone||'', role:regForm.role, created_at:new Date().toISOString(), lastLogin:new Date().toISOString()};
    const uu=[...users,nu];
    setUsers(uu);
    localStorage.setItem('llms_user', JSON.stringify(nu));
    setUser(nu);
    setPage('dashboard');
    showToast('Account created as '+regForm.role+'!');
  };
  const logout = ()=>{ localStorage.removeItem('llms_user'); setUser(null); setPage('dashboard'); };

  const logoSrc = logoError? "https://via.placeholder.com/80?text=ORACLE" : LOGO;
  const lapSrc = lapError? "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&h=540&fit=crop" : LAP;

  const userLoans = user? loans.filter(l=> String(l.userId)===String(user.id)) : [];
  const userNotifs = user? notifs.filter(n=> String(n.userId)===String(user.id)) : [];
  const unread = userNotifs.filter(n=>!n.read).length;

  if(!user){
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0f0f0f]">
        {toast && <div className="fixed top-6 right-6 z-[100] bg-black text-white px-5 py-3 rounded-xl shadow-2xl text-sm">{toast}</div>}
        <div className="absolute inset-0">
          <img src={lapSrc} onError={()=>setLapError(true)} alt="bg" className="w-full h-full object-cover opacity-50"/>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40"></div>
        </div>
        <div className="hidden lg:block absolute top-0 right-0 w-[380px] h-[180px] bg-[#c1121f] z-10" style={{clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 0%)'}}></div>
        <div className="hidden lg:block absolute top-0 right-[110px] w-[220px] h-[95px] bg-white z-10" style={{clipPath: 'polygon(28% 0%, 100% 0%, 100% 100%, 0% 0%)'}}></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-[220px] h-[120px] bg-[#c1121f] z-10" style={{clipPath: 'polygon(0 25%, 100% 100%, 0 100%)'}}></div>
        <div className="hidden lg:block absolute bottom-0 right-0 w-[160px] h-[100px] bg-[#c1121f] z-10" style={{clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'}}></div>

        <div className="relative z-20 min-h-screen flex">
          <div className="hidden lg:flex w-[58%] flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="w-[62px] h-[62px] rounded-[14px] bg-white shadow-xl overflow-hidden p-1.5 flex items-center justify-center"><img src={logoSrc} onError={()=>setLogoError(true)} alt="Oracle" className="w-full h-full object-contain"/></div>
              <div><p className="text-white font-bold text-[18px] leading-none">Ponelepele Oracle</p><p className="text-white/60 text-[11px] tracking-wide uppercase mt-1">Laptop loan management system</p></div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-8">
              <div><div className="w-12 h-1 bg-[#c1121f] mb-5"></div><h1 className="text-[44px] font-bold leading-[0.9] text-white tracking-tight">Borrow a Laptop,<br/>Unlock a World of<br/>Possibilities —<br/><span className="text-[#c1121f]">Empowering Young<br/>Minds, One Click at<br/>a Time.</span></h1></div>
              <div className="relative w-full max-w-[640px] h-[320px] rounded-[20px] overflow-hidden shadow-2xl border border-white/20 bg-[#1e1e1e]"><img src={lapSrc} onError={()=>setLapError(true)} alt="Laptop" className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div className="absolute inset-0 flex items-center justify-center"><div className="bg-black/85 w-[300px] h-[180px] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden border border-white/10"><img src={logoSrc} onError={()=>setLogoError(true)} className="w-[120px] object-contain relative z-10" alt="logo"/><div className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#c1121f]/50" style={{clipPath: 'ellipse(75% 100% at 50% 100%)'}}></div></div></div></div>
              <div className="flex gap-9">
                <div className="flex flex-col items-center gap-2.5"><div className="w-[46px] h-[46px] rounded-full border-2 border-[#c1121f] flex items-center justify-center"><Laptop size={18} className="text-white"/></div><p className="text-[11px] text-white text-center leading-tight">Access<br/><span className="opacity-60">Technology</span></p></div>
                <div className="flex flex-col items-center gap-2.5"><div className="w-[46px] h-[46px] rounded-full border-2 border-[#c1121f] flex items-center justify-center"><GraduationCap size={18} className="text-white"/></div><p className="text-[11px] text-white text-center leading-tight">Support<br/><span className="opacity-60">Your Studies</span></p></div>
                <div className="flex flex-col items-center gap-2.5"><div className="w-[46px] h-[46px] rounded-full border-2 border-[#c1121f] flex items-center justify-center"><Rocket size={18} className="text-white"/></div><p className="text-[11px] text-white text-center leading-tight">Build<br/><span className="opacity-60">Your Future</span></p></div>
                <div className="flex flex-col items-center gap-2.5"><div className="w-[46px] h-[46px] rounded-full border-2 border-[#c1121f] flex items-center justify-center"><Users size={18} className="text-white"/></div><p className="text-[11px] text-white text-center leading-tight">Grow<br/><span className="opacity-60">Together</span></p></div>
              </div>
              <div><p className="text-white text-[30px] leading-none italic rotate-[-4deg]" style={{fontFamily: 'cursive'}}>Your Future</p><p className="text-white text-[30px] leading-none italic rotate-[-4deg] ml-5" style={{fontFamily: 'cursive'}}>Starts Here</p><div className="w-[130px] h-[3px] bg-[#c1121f] mt-2 rotate-[-4deg] ml-2 rounded-full"></div></div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-[440px] bg-white rounded-[20px] shadow-2xl p-8">
              <div className="flex flex-col items-center">
                <div className="w-[74px] h-[74px] rounded-[16px] bg-white border shadow-sm overflow-hidden p-2"><img src={logoSrc} onError={()=>setLogoError(true)} alt="Logo" className="w-full h-full object-contain"/></div>
                <h2 className="text-[28px] font-bold text-black mt-5 leading-none">{showRegister?'Create Account':'Welcome Back'}</h2>
                <p className="text-[13px] text-[#64748b] mt-2">Create your account to login and register - Choose Learner or Admin</p>
              </div>
              <div className="flex bg-[#f1f5f9] p-1.5 rounded-full w-fit mx-auto my-6">
                <button onClick={()=>{setShowRegister(false); setMsg('');}} className={'px-9 py-2.5 rounded-full text-[13px] font-semibold ' + (!showRegister ? 'bg-[#c1121f] text-white shadow' : 'text-[#64748b]')}>Login</button>
                <button onClick={()=>{setShowRegister(true); setMsg('');}} className={'px-9 py-2.5 rounded-full text-[13px] font-semibold ' + (showRegister ? 'bg-[#c1121f] text-white shadow' : 'text-[#64748b]')}>Register</button>
              </div>
              {msg && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4 text-center">{msg}</div>}
              {showRegister ? (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] focus:border-[#c1121f] focus:outline-none" placeholder="Full Name" value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} required/></div>
                  <div className="relative"><GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] font-mono focus:border-[#c1121f] focus:outline-none" placeholder="userID 6 digits" value={regForm.userID} onChange={e=>setRegForm({...regForm,userID:e.target.value.replace(/\D/g,'').slice(0,6)})} required/></div>
                  <div className="relative"><Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] focus:border-[#c1121f] focus:outline-none" placeholder="Email address" value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})}/></div>
                  <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] focus:border-[#c1121f] focus:outline-none" type="password" placeholder="Password min 6" value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})} required/></div>
                  <div className="pt-2">
                    <p className="text-[12px] font-bold mb-2 text-center uppercase tracking-wide">Choose Role - Learner or Admin</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={()=>setRegForm({...regForm,role:'learner'})} className={'py-4 rounded-[14px] border-2 flex flex-col items-center gap-1.5 transition-all ' + (regForm.role==='learner'?'bg-[#7f1d1d] border-[#7f1d1d] text-white shadow-lg scale-[1.02]':'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:border-[#c1121f]')}><GraduationCap size={24}/><span className="text-[13px] font-bold">Learner</span><span className="text-[10px] opacity-70">Borrow laptops</span></button>
                      <button type="button" onClick={()=>setRegForm({...regForm,role:'admin'})} className={'py-4 rounded-[14px] border-2 flex flex-col items-center gap-1.5 transition-all ' + (regForm.role==='admin'?'bg-[#7f1d1d] border-[#7f1d1d] text-white shadow-lg scale-[1.02]':'bg-[#f8fafc] border-[#e2e8f0] text-[#475569] hover:border-[#c1121f]')}><Shield size={24}/><span className="text-[13px] font-bold">Admin</span><span className="text-[10px] opacity-70">Manage system</span></button>
                    </div>
                  </div>
                  <button className="w-full text-white py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-[#c1121f] hover:bg-[#a50e1a] shadow-lg mt-2">Create Account as {regForm.role} <ArrowRight size={18}/></button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] font-mono focus:border-[#c1121f] focus:outline-none" placeholder="userID 6 digits" value={loginForm.userID} onChange={e=>setLoginForm({...loginForm,userID:e.target.value.replace(/\D/g,'').slice(0,6)})} required/></div>
                  <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black"/><input className="w-full border border-[#e2e8f0] pl-12 pr-4 py-3.5 rounded-full text-[14px] focus:border-[#c1121f] focus:outline-none" type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} required/></div>
                  <button className="w-full text-white py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 bg-[#c1121f] hover:bg-[#a50e1a] shadow-lg">Login <ArrowRight size={18}/></button>
                </form>
              )}
              <button onClick={()=>{localStorage.clear(); location.reload();}} className="w-full mt-4 text-[11px] text-gray-400 underline">Clear data if undefined error</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const NavItem = ({id, icon:Icon, label, badge, num})=>(
    <button onClick={()=>{ if(id==='logout') logout(); else setPage(id); }} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ' + (page===id?'bg-[#c1121f] text-white shadow-lg': id==='logout'?'text-gray-400 hover:bg-gray-100' :'text-gray-600 hover:bg-gray-100')}>
      <span className="text-[10px] opacity-50 w-4">{num}</span><Icon size={16}/> <span className="flex-1 text-left">{label}</span> {badge ? <span className="bg-white text-[#c1121f] text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
  );

  const isAdmin = user?.role==='admin';
  const isLearner = user?.role==='learner';

  return (
    <div className={'min-h-screen flex ' + (theme==='dark'?'bg-[#121212] text-white':'bg-[#f8fafc] text-black')} style={{fontSize: fontSize==='small'?'13px':fontSize==='large'?'17px':'14px'}}>
      {toast && <div className="fixed top-6 right-6 z-[100] bg-black text-white px-5 py-3 rounded-xl shadow-2xl text-sm">{toast}</div>}
      <div className={'w-[280px] ' + (theme==='dark'?'bg-[#1a1a1a] border-[#2a2a2a]':'bg-white border-gray-200') + ' border-r flex flex-col p-4 fixed h-full overflow-y-auto'}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[42px] h-[42px] rounded-xl bg-white border shadow overflow-hidden p-1"><img src={logoSrc} onError={()=>setLogoError(true)} className="w-full h-full object-contain" alt="logo"/></div>
          <div><p className="font-bold text-[13px] leading-none">Ponelepele Oracle</p><p className="text-[10px] opacity-60 mt-1">{isAdmin?'Admin':'Learner'} • {user?.name||user?.userID}</p></div>
        </div>
        <div className="space-y-1 flex-1">
          {isAdmin ? (
            <>
              <p className="text-[10px] font-bold uppercase opacity-40 px-3 py-2">Admin Menu 11 Items</p>
              <NavItem num="1" id="dashboard" icon={LayoutDashboard} label="Dashboard / Overview"/>
              <NavItem num="2" id="laptop_mgmt" icon={Package} label="Laptop Management"/>
              <NavItem num="3" id="loan_requests" icon={ClipboardList} label="Loan Requests" badge={loans.filter(l=>l.status==='pending').length||null}/>
              <NavItem num="4" id="loan_returns" icon={RotateCcw} label="Loan & Returns"/>
              <NavItem num="5" id="learner_mgmt" icon={Users} label="Learner Management"/>
              <NavItem num="6" id="notifications" icon={Bell} label="Notifications" badge={unread||null}/>
              <NavItem num="7" id="reports" icon={BarChart3} label="Reports & Analytics"/>
              <NavItem num="8" id="maintenance" icon={Wrench} label="Maintenance Management"/>
              <NavItem num="9" id="settings" icon={Settings} label="Settings"/>
              <NavItem num="10" id="help" icon={HelpCircle} label="Help & Support"/>
              <NavItem num="11" id="logout" icon={LogOut} label="Logout"/>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase opacity-40 px-3 py-2">Learner Menu 11 Items</p>
              <NavItem num="1" id="dashboard" icon={LayoutDashboard} label="Dashboard / Overview"/>
              <NavItem num="2" id="request" icon={Laptop} label="Request Laptop"/>
              <NavItem num="3" id="my_requests" icon={ClipboardList} label="My Requests"/>
              <NavItem num="4" id="active_loans" icon={BookOpen} label="My Active Loans"/>
              <NavItem num="5" id="return_tracking" icon={RotateCcw} label="Return Tracking"/>
              <NavItem num="6" id="notifications" icon={Bell} label="Notifications" badge={unread||null}/>
              <NavItem num="7" id="history" icon={History} label="Loan History"/>
              <NavItem num="8" id="profile" icon={User} label="My Profile"/>
              <NavItem num="9" id="settings" icon={Settings} label="Settings"/>
              <NavItem num="10" id="help" icon={HelpCircle} label="Help & Support"/>
              <NavItem num="11" id="logout" icon={LogOut} label="Logout"/>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 ml-[280px] p-6">
        {isAdmin && page==='dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><div><h1 className="text-[26px] font-bold">Dashboard / Overview - Admin</h1><p className="text-sm opacity-60">View system statistics and activities - FIXED: No more Welcome+Logout only</p><p className="text-xs opacity-40 mt-1">Welcome {user?.name} • {user?.userID} • {user?.role}</p></div><div className="w-20 h-20 rounded-2xl border-4 border-[#c1121f] overflow-hidden bg-white"><img src={LOGO} className="w-full h-full object-contain p-1" alt="logo"/></div></div>
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-white border p-4 rounded-2xl"><p className="text-xs opacity-60">Total Laptops</p><p className="text-2xl font-bold mt-1">{laptops.length}</p><p className="text-[11px] text-green-600 mt-1">Available: {laptops.filter(l=>l.status==='available').length}</p></div>
              <div className="bg-white border p-4 rounded-2xl"><p className="text-xs opacity-60">Loan Requests</p><p className="text-2xl font-bold mt-1">{loans.length}</p><p className="text-[11px] text-amber-600 mt-1">Pending: {loans.filter(l=>l.status==='pending').length}</p></div>
              <div className="bg-white border p-4 rounded-2xl"><p className="text-xs opacity-60">Active Loans</p><p className="text-2xl font-bold mt-1">{loans.filter(l=>l.status==='approved').length}</p><p className="text-[11px] opacity-60 mt-1">Issued</p></div>
              <div className="bg-white border p-4 rounded-2xl"><p className="text-xs opacity-60">Learners</p><p className="text-2xl font-bold mt-1">{users.filter(u=>u.role==='learner').length}</p><p className="text-[11px] opacity-60 mt-1">Registered</p></div>
              <div className="bg-white border p-4 rounded-2xl"><p className="text-xs opacity-60">Overdue</p><p className="text-2xl font-bold mt-1">{loans.filter(l=>l.status==='overdue').length}</p><p className="text-[11px] text-red-600 mt-1">Needs action</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border p-5 rounded-2xl"><h4 className="font-bold text-sm mb-3">Recent Requests</h4>{loans.slice(-4).reverse().map(l=>{ const lap=laptops.find(lp=>lp.id===l.laptopId); return <div key={l.id} className="flex justify-between py-2 border-b last:border-0 text-[13px]"><span>{l.userName} • {lap?.asset_tag}</span><span className={'px-2 py-0.5 rounded-full text-[10px] ' + (l.status==='pending'?'bg-amber-100 text-amber-700':l.status==='approved'?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>{l.status}</span></div>})}{loans.length===0&&<p className="text-sm opacity-60">No requests yet</p>}</div>
              <div className="bg-white border p-5 rounded-2xl"><h4 className="font-bold text-sm mb-3">Laptop Overview - lap2.jpeg</h4><img src={lapSrc} className="w-full h-[160px] object-cover rounded-xl border" alt="lap"/><p className="text-xs opacity-60 mt-2">Background NOT all black - same as screenshot, using lap2.jpeg</p></div>
            </div>
          </div>
        )}
        {isAdmin && page==='laptop_mgmt' && (
          <div className="space-y-5">
            <h1 className="text-[26px] font-bold">Laptop Management - Add, edit, delete and manage laptops.</h1>
            <div className="bg-white border p-5 rounded-2xl">
              <h4 className="font-bold mb-4">Add New Laptop</h4>
              <form onSubmit={e=>{ e.preventDefault(); if(!laptopForm.asset_tag) return; const nl={id:Date.now().toString(), asset_tag:laptopForm.asset_tag, brand:laptopForm.brand||'Dell', model:laptopForm.model||'Laptop', status:'available', condition:'good', image:'/lap2.jpeg'}; setLaptops([...laptops,nl]); setLaptopForm({asset_tag:'',brand:'',model:''}); showToast('Laptop added'); }} className="grid grid-cols-4 gap-3">
                <input placeholder="Asset Tag e.g. PO-004" value={laptopForm.asset_tag} onChange={e=>setLaptopForm({...laptopForm,asset_tag:e.target.value})} className="border rounded-xl px-3 py-2.5 text-sm" required/>
                <input placeholder="Brand e.g. Dell" value={laptopForm.brand} onChange={e=>setLaptopForm({...laptopForm,brand:e.target.value})} className="border rounded-xl px-3 py-2.5 text-sm"/>
                <input placeholder="Model e.g. Latitude 7420" value={laptopForm.model} onChange={e=>setLaptopForm({...laptopForm,model:e.target.value})} className="border rounded-xl px-3 py-2.5 text-sm"/>
                <button className="bg-[#c1121f] text-white rounded-xl text-sm font-bold">Add Laptop</button>
              </form>
            </div>
            <div className="bg-white border rounded-2xl overflow-hidden">
              <table className="w-full text-[13px]"><thead className="bg-gray-50 text-[11px] uppercase opacity-60"><tr><th className="px-4 py-3 text-left">Image</th><th className="px-4 py-3 text-left">Asset Tag</th><th className="px-4 py-3 text-left">Brand/Model</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead><tbody className="divide-y">
                {laptops.map(l=>(
                  <tr key={l.id}><td className="px-4 py-2"><img src={lapSrc} className="w-16 h-10 object-cover rounded-lg border" alt="lap"/></td><td className="px-4 py-3 font-mono font-bold">{l.asset_tag}</td><td className="px-4 py-3">{l.brand} {l.model}</td><td className="px-4 py-3"><span className={'px-2 py-1 rounded-full text-[10px] ' + (l.status==='available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>{l.status}</span></td><td className="px-4 py-3 flex gap-1"><button onClick={()=>{ const b=prompt('Brand?',l.brand); const m=prompt('Model?',l.model); if(b||m) setLaptops(laptops.map(x=>x.id===l.id?{...x,brand:b||x.brand,model:m||x.model}:x)); }} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={14}/></button><button onClick={()=>{ if(confirm('Delete?')) setLaptops(laptops.filter(x=>x.id!==l.id)); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button></td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        )}
        {isAdmin && page==='loan_requests' && (
          <div className="space-y-5">
            <h1 className="text-[26px] font-bold">Loan Requests - Review, approve and reject learner requests.</h1>
            <div className="bg-white border rounded-2xl p-5">
              {loans.filter(l=>l.status==='pending').length===0 ? <p className="text-center py-12 opacity-60">No pending requests - empty state</p> :
                loans.filter(l=>l.status==='pending').map(l=>{
                  const lap=laptops.find(lp=>lp.id===l.laptopId);
                  return <div key={l.id} className="flex justify-between items-center py-4 border-b last:border-0"><div><p className="font-bold text-sm">{l.userName} • {lap?.asset_tag||'Laptop'} • {l.date}</p><p className="text-[13px] opacity-70">{(l.reason||'').slice(0,100)}</p></div><div className="flex gap-2"><button onClick={()=>{ setLoans(loans.map(x=>x.id===l.id?{...x,status:'approved', approved_at:new Date().toISOString()}:x)); setLaptops(laptops.map(lp=>lp.id===l.laptopId?{...lp,status:'borrowed'}:lp)); setNotifs([...notifs,{id:Date.now(), userId:l.userId, title:'Approved', message:'Your request for '+(lap?.asset_tag||'laptop')+' approved! Due '+new Date(Date.now()+14*86400000).toLocaleDateString(), read:false, created_at:new Date().toISOString()}]); showToast('Approved'); }} className="px-4 py-2 bg-green-600 text-white rounded-full text-xs">Approve</button><button onClick={()=>{ setLoans(loans.map(x=>x.id===l.id?{...x,status:'rejected'}:x)); showToast('Rejected'); }} className="px-4 py-2 bg-red-600 text-white rounded-full text-xs">Reject</button></div></div>
                })
              }
            </div>
          </div>
        )}
        {isAdmin && page==='loan_returns' && (
          <div className="space-y-5">
            <h1 className="text-[26px] font-bold">Loan and Returns - Issue laptops and process returns.</h1>
            <div className="bg-white border rounded-2xl p-5">
              <h4 className="font-bold mb-4">Active Loans - Process Returns</h4>
              {loans.filter(l=>l.status==='approved').length===0 ? <p className="text-center py-8 opacity-60">No active loans</p> :
                loans.filter(l=>l.status==='approved').map(l=>{
                  const lap=laptops.find(lp=>lp.id===l.laptopId);
                  return <div key={l.id} className="flex justify-between items-center py-3 border-b last:border-0"><div><p className="font-bold text-sm">{l.userName} • {lap?.asset_tag} • Due: {l.due_date?new Date(l.due_date).toLocaleDateString():'-'}</p><p className="text-xs opacity-60">{l.reason?.slice(0,60)}</p></div><button onClick={()=>{ setLoans(loans.map(x=>x.id===l.id?{...x,status:'returned', returned_at:new Date().toISOString()}:x)); setLaptops(laptops.map(lp=>lp.id===l.laptopId?{...lp,status:'available'}:lp)); showToast('Return processed'); }} className="px-4 py-2 bg-[#c1121f] text-white rounded-full text-xs flex items-center gap-1"><RotateCcw size={12}/> Process Return</button></div>
                })
              }
            </div>
          </div>
        )}
        {isAdmin && page==='learner_mgmt' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center"><h1 className="text-[26px] font-bold">Learner Management</h1><button onClick={()=>{ const name=prompt('Full Name?'); if(!name) return; const uid=prompt('UserID 6 digits?'); if(!uid||!/^\d{6}$/.test(uid)) return alert('6 digits'); const nu={id:Date.now(), name, userID:uid, studentNumber:uid, role:'learner', email:uid+'@student.edu', created_at:new Date().toISOString(), lastLogin:'Never'}; setUsers([...users,nu]); showToast('Learner added'); }} className="px-4 py-2 bg-[#c1121f] text-white rounded-full text-xs flex items-center gap-2"><UserPlus size={14}/> Add Learner</button></div>
            <div className="bg-white border rounded-2xl overflow-hidden">
              <table className="w-full text-[13px]"><thead className="bg-gray-50 text-[11px] uppercase opacity-60"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">UserID</th><th className="px-4 py-3 text-left">Last Login</th><th className="px-4 py-3 text-left">Actions</th></tr></thead><tbody className="divide-y">
                {users.filter(u=>u.role==='learner').map(u=>(
                  <tr key={u.id}><td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3 font-mono">{u.userID||u.studentNumber}</td><td className="px-4 py-3 text-[11px]">{u.lastLogin&&u.lastLogin!=='Never'?new Date(u.lastLogin).toLocaleString():u.created_at?new Date(u.created_at).toLocaleDateString():'Never'}</td><td className="px-4 py-3 flex gap-1"><button onClick={()=>{ const n=prompt('New name?',u.name); if(n) setUsers(users.map(x=>x.id===u.id?{...x,name:n}:x)); }} className="p-1.5 hover:bg-gray-100 rounded"><Edit2 size={14}/></button><button onClick={()=>{ if(confirm('Delete '+u.name+'?')) setUsers(users.filter(x=>x.id!==u.id)); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button></td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        )}
        {isAdmin && page==='reports' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center"><h1 className="text-[26px] font-bold">Reports and Analytics</h1><button onClick={()=>{ const csv='User,UserID,Status,Date,Reason\n'+loans.map(l=>l.userName+','+(users.find(u=>String(u.id)===String(l.userId))?.userID||'')+','+l.status+','+l.date+',"'+(l.reason||'')+'"').join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='reports.csv'; a.click(); showToast('Exported'); }} className="px-4 py-2 bg-[#c1121f] text-white rounded-full text-xs flex items-center gap-2"><Download size={14}/> Export</button></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border p-5 rounded-2xl"><h4 className="font-bold text-sm mb-3">Inventory Report</h4><p className="text-xs">Total: {laptops.length} - Available: {laptops.filter(l=>l.status==='available').length}</p></div>
              <div className="bg-white border p-5 rounded-2xl"><h4 className="font-bold text-sm mb-3">Loan Report</h4><p className="text-xs">Approved: {loans.filter(l=>l.status==='approved').length} Pending: {loans.filter(l=>l.status==='pending').length}</p></div>
              <div className="bg-white border p-5 rounded-2xl"><h4 className="font-bold text-sm mb-3">Overdue Report</h4><p className="text-2xl font-bold text-red-600">{loans.filter(l=>l.status==='overdue').length}</p></div>
            </div>
          </div>
        )}
        {isAdmin && page==='maintenance' && (
          <div className="space-y-5">
            <h1 className="text-[26px] font-bold">Maintenance Management</h1>
            <div className="bg-white border p-5 rounded-2xl">
              <form onSubmit={e=>{ e.preventDefault(); const form=new FormData(e.target); const asset=form.get('asset'); const issue=form.get('issue'); if(!asset||!issue) return; const m={id:Date.now(), asset_tag:asset, issue, status:'reported', created_at:new Date().toISOString()}; setMaintenance([...maintenance,m]); showToast('Damaged recorded'); e.target.reset(); }} className="grid grid-cols-3 gap-3">
                <select name="asset" className="border rounded-xl px-3 py-2.5 text-sm" required><option value="">Select Laptop</option>{laptops.map(l=><option key={l.id} value={l.asset_tag}>{l.asset_tag} - {l.brand} {l.model}</option>)}</select>
                <input name="issue" placeholder="Issue e.g. Screen cracked" className="border rounded-xl px-3 py-2.5 text-sm" required/>
                <button className="bg-[#c1121f] text-white rounded-xl text-sm font-bold">Record Damaged</button>
              </form>
            </div>
          </div>
        )}
        {isLearner && page==='dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><div><h1 className="text-[26px] font-bold">Dashboard / Overview - Learner FIXED</h1><p className="text-sm opacity-60">View laptop availability and personal loan statistics - No more Welcome+Logout bug</p><p className="text-xs opacity-40 mt-1">Welcome {user?.name} • {user?.userID}</p></div><div className="w-24 h-24 rounded-2xl border-4 border-[#c1121f] overflow-hidden bg-white"><img src={profilePic||LOGO} className="w-full h-full object-cover" alt="profile"/></div></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border p-5 rounded-2xl"><p className="text-xs opacity-60">Available Laptops</p><p className="text-2xl font-bold mt-1">{laptops.filter(l=>l.status==='available').length}</p><img src={lapSrc} className="mt-3 w-full h-20 object-cover rounded-xl border" alt="lap"/></div>
              <div className="bg-white border p-5 rounded-2xl"><p className="text-xs opacity-60">My Requests</p><p className="text-2xl font-bold mt-1">{userLoans.length}</p></div>
              <div className="bg-white border p-5 rounded-2xl"><p className="text-xs opacity-60">Active Loans</p><p className="text-2xl font-bold mt-1">{userLoans.filter(l=>l.status==='approved').length}</p></div>
              <div className="bg-white border p-5 rounded-2xl"><p className="text-xs opacity-60">Return Tracking</p><p className="text-2xl font-bold mt-1">{userLoans.filter(l=>l.status==='approved').length}</p></div>
            </div>
          </div>
        )}
        {isLearner && page==='request' && (
          <div className="space-y-5 max-w-[600px]">
            <h1 className="text-[26px] font-bold">Request Laptop</h1>
            <div className="bg-white border p-6 rounded-2xl">
              <form onSubmit={e=>{ e.preventDefault(); if(!requestForm.laptopId||!requestForm.date||!requestForm.reason) return showToast('Fill all'); const lap=laptops.find(l=>l.id===requestForm.laptopId); const nl={id:Date.now(), userId:user.id, userName:user.name, laptopId:requestForm.laptopId, laptopTag:lap?.asset_tag, date:requestForm.date, reason:requestForm.reason, status:'pending', created_at:new Date().toISOString(), due_date:new Date(Date.now()+14*86400000).toISOString()}; setLoans([...loans,nl]); setNotifs([...notifs,{id:Date.now(), userId:user.id, title:'Request Submitted', message:'Your request for '+(lap?.asset_tag||'')+' on '+requestForm.date+' is pending', read:false, created_at:new Date().toISOString()}]); setRequestForm({laptopId:'',date:'',reason:''}); showToast('Submitted'); }} className="space-y-4">
                <select value={requestForm.laptopId} onChange={e=>setRequestForm({...requestForm,laptopId:e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm" required><option value="">Select laptop - {laptops.filter(l=>l.status==='available').length} available</option>{laptops.filter(l=>l.status==='available').map(l=><option key={l.id} value={l.id}>{l.asset_tag} - {l.brand} {l.model}</option>)}</select>
                <input type="date" value={requestForm.date} onChange={e=>setRequestForm({...requestForm,date:e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm" required/>
                <textarea placeholder="State date and reason" value={requestForm.reason} onChange={e=>setRequestForm({...requestForm,reason:e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm h-28" required></textarea>
                <button className="w-full bg-[#c1121f] text-white py-3 rounded-full font-bold">Submit Request</button>
              </form>
            </div>
          </div>
        )}
        {isLearner && page==='my_requests' && (
          <div className="space-y-5"><h1 className="text-[26px] font-bold">My Requests</h1><div className="bg-white border rounded-2xl p-5">{userLoans.length===0 ? <p className="text-center py-12 opacity-60">No requests yet</p> : userLoans.map(l=>{ const lap=laptops.find(lp=>lp.id===l.laptopId); return <div key={l.id} className="flex justify-between py-4 border-b last:border-0"><div><p className="font-bold text-sm">{lap?.asset_tag||l.laptopTag} • {l.date}</p><p className="text-[13px] opacity-70">{l.reason}</p></div><span className={'px-3 py-1 rounded-full text-xs ' + (l.status==='pending'?'bg-amber-100':l.status==='approved'?'bg-green-100':'bg-red-100')}>{l.status}</span></div>})}</div></div>
        )}
        {isLearner && page==='active_loans' && (
          <div className="space-y-5"><h1 className="text-[26px] font-bold">My Active Loans</h1><div className="bg-white border rounded-2xl p-5">{userLoans.filter(l=>l.status==='approved').length===0 ? <p className="text-center py-12 opacity-60">No active loans</p> : userLoans.filter(l=>l.status==='approved').map(l=>{ const lap=laptops.find(lp=>lp.id===l.laptopId); return <div key={l.id} className="flex justify-between py-4 border-b"><div><p className="font-bold">{lap?.asset_tag} - {lap?.brand}</p><p className="text-xs opacity-60">Due: {l.due_date?new Date(l.due_date).toLocaleDateString():'-'}</p></div><span className="px-3 py-1 bg-green-100 rounded-full text-xs">Active</span></div>})}</div></div>
        )}
        {isLearner && page==='return_tracking' && (
          <div className="space-y-5"><h1 className="text-[26px] font-bold">Return Tracking</h1><div className="bg-white border rounded-2xl p-5"><p className="text-sm opacity-60">Monitor return dates and statuses</p>{userLoans.filter(l=>['approved','returned'].includes(l.status)).map(l=>{ const lap=laptops.find(lp=>lp.id===l.laptopId); return <div key={l.id} className="py-3 border-b"><p>{lap?.asset_tag} - Due {l.due_date?new Date(l.due_date).toLocaleDateString():'-'}</p></div>})}</div></div>
        )}
        {(page==='notifications') && (
          <div className="space-y-5 max-w-[700px]">
            <h1 className="text-[26px] font-bold">Notifications - {isAdmin?'Send loan updates and overdue reminders':'Receive approvals, reminders and overdue alerts'}</h1>
            <div className="bg-white border rounded-2xl divide-y">
              {userNotifs.length===0 ? <div className="p-12 text-center"><Bell size={40} className="mx-auto opacity-20 mb-3"/><p className="font-medium">No notifications yet</p><p className="text-[13px] opacity-60 mt-2">There is no notifications yet - View return and approval notifications will appear here</p></div> :
                userNotifs.slice().reverse().map(n=>(
                  <div key={n.id} className={'p-4 flex gap-3 ' + (!n.read?'bg-red-50/50':'')}><div className={'w-9 h-9 rounded-full flex items-center justify-center ' + (!n.read?'bg-[#c1121f] text-white':'bg-gray-100')}><Bell size={14}/></div><div className="flex-1"><p className="font-semibold text-[13px]">{n.title}</p><p className="text-[13px] opacity-70">{n.message}</p></div></div>
                ))
              }
            </div>
          </div>
        )}
        {(page==='history') && (
          <div className="space-y-5"><h1 className="text-[26px] font-bold">Loan History - View previous borrowing and return records</h1><div className="bg-white border rounded-2xl overflow-hidden"><table className="w-full text-[13px]"><thead className="bg-gray-50 text-[11px] uppercase opacity-60"><tr><th className="px-4 py-3 text-left">Laptop</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody className="divide-y">{userLoans.map(l=>{ const lap=laptops.find(lp=>lp.id===l.laptopId); return <tr key={l.id}><td className="px-4 py-3">{lap?.asset_tag}</td><td className="px-4 py-3">{l.date}</td><td className="px-4 py-3">{l.status}</td></tr>})}{userLoans.length===0&&<tr><td colSpan={3} className="px-4 py-12 text-center opacity-60">No history - will show all loans ever made</td></tr>}</tbody></table></div></div>
        )}
        {(page==='profile') && (
          <div className="space-y-5 max-w-[700px]">
            <h1 className="text-[26px] font-bold">{isLearner?'My Profile - View and update personal information':'Profile'}</h1>
            <div className="bg-white border p-6 rounded-2xl">
              <div className="flex gap-6 mb-6">
                <div className="relative"><div className="w-32 h-32 rounded-2xl border-4 border-[#c1121f] overflow-hidden bg-white"><img src={profilePic||LOGO} className="w-full h-full object-cover" alt="profile"/></div><label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#c1121f] rounded-full flex items-center justify-center text-white cursor-pointer"><Camera size={14}/><input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ setProfilePic(String(ev.target?.result||'')); showToast('Profile picture updated'); }; r.readAsDataURL(f); }}/></label></div>
                <div><p className="font-bold text-xl">{user?.name}</p><p className="text-sm opacity-60">UserID: {user?.userID} • {user?.role}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold opacity-60">Full Name</label><input value={user?.name||''} onChange={e=>{ const up={...user,name:e.target.value}; setUser(up); localStorage.setItem('llms_user', JSON.stringify(up)); setUsers(users.map(u=>u.id===user.id?up:u)); }} className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm"/></div>
                <div><label className="text-xs font-bold opacity-60">Email - Update email</label><input value={user?.email||''} onChange={e=>{ const up={...user,email:e.target.value}; setUser(up); localStorage.setItem('llms_user', JSON.stringify(up)); setUsers(users.map(u=>u.id===user.id?up:u)); }} className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm"/></div>
              </div>
            </div>
          </div>
        )}
        {page==='settings' && (
          <div className="space-y-5 max-w-[700px]">
            <h1 className="text-[26px] font-bold">Settings - {isAdmin?'Manage account, security and system preferences':'Manage password and account preferences'}</h1>
            <div className="bg-white border p-6 rounded-2xl space-y-6">
              <div><h4 className="font-bold text-sm">Font Size</h4><div className="flex gap-2 mt-2"><button onClick={()=>setFontSize('small')} className={'px-4 py-2 rounded-full text-xs border ' + (fontSize==='small'?'bg-[#c1121f] text-white':'')}>Small</button><button onClick={()=>setFontSize('medium')} className={'px-4 py-2 rounded-full text-xs border ' + (fontSize==='medium'?'bg-[#c1121f] text-white':'')}>Medium</button><button onClick={()=>setFontSize('large')} className={'px-4 py-2 rounded-full text-xs border ' + (fontSize==='large'?'bg-[#c1121f] text-white':'')}>Large</button></div></div>
              <div><h4 className="font-bold text-sm">Theme</h4><div className="flex gap-2 mt-2"><button onClick={()=>setTheme('light')} className={'px-4 py-2 rounded-full text-xs border ' + (theme==='light'?'bg-[#c1121f] text-white':'')}>Light</button><button onClick={()=>setTheme('dark')} className={'px-4 py-2 rounded-full text-xs border ' + (theme==='dark'?'bg-[#c1121f] text-white':'')}>Dark</button></div></div>
              <button onClick={logout} className="px-5 py-2.5 border border-red-200 text-red-600 rounded-full text-xs flex items-center gap-2"><LogOut size={14}/> Sign out</button>
            </div>
          </div>
        )}
        {page==='help' && (
          <div className="space-y-5 max-w-[800px]">
            <h1 className="text-[26px] font-bold">Help and Support</h1>
            <div className="bg-white border p-6 rounded-2xl"><h3 className="font-bold mb-3">How to Use</h3><ul className="list-disc pl-5 text-sm opacity-80"><li>Create account and log in - Choose Learner or Admin</li><li>Request laptop - Select laptop, date and reason</li><li>Check approval status - My Requests</li><li>View history and return dates</li><li>Confirm overdue or returned late - Return Tracking</li></ul></div>
            <div className="bg-white border p-6 rounded-2xl"><h3 className="font-bold mb-3">FAQs</h3><div className="text-sm space-y-2"><p><b>How long can I borrow?</b> 14 days</p><p><b>What if rejected?</b> Try again</p><p><b>How check due date?</b> My Active Loans</p><p><b>What if late?</b> Overdue alert</p><p><b>Forgot password?</b> Settings or ICT</p></div></div>
          </div>
        )}
      </div>
    </div>
  )
}
