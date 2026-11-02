import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ponelepele_secret_2024';

app.use(cors({origin:true, credentials:true}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if(!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req,file,cb)=> cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

let db;
async function connectDB(){
  try{
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'llms_db',
      waitForConnections: true
    });
    await db.query('SELECT 1');
    console.log('MySQL Connected - llms_db');
  }catch(e){
    console.log('MySQL not connected, using memory fallback. Error:', e.message);
    db = null;
  }
}
await connectDB();

function auth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({message:'No token'});
  try{
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }catch{ return res.status(401).json({message:'Invalid token'}); }
}

let memory = { users: [
  {id:1, name:'Admin', email:'admin@ponelepele.edu', password: bcrypt.hashSync('Admin123!',10), role:'admin'},
  {id:2, name:'Learner One', email:'learner1@ponelepele.edu', password: bcrypt.hashSync('Learner123!',10), role:'learner'}
], laptops: [
  {id:1, asset_tag:'PO-001', brand:'Dell', model:'Latitude 5420', specs:'i5 8GB 256GB', status:'available'},
  {id:2, asset_tag:'PO-002', brand:'HP', model:'ProBook 450', specs:'i7 16GB 512GB', status:'available'},
], loans: [], notifications: [] };

app.get('/', (req,res)=> res.json({message:'LLMS Backend running on http://localhost:5000', db: !!db}));

app.post('/api/auth/login', async (req,res)=>{
  const {email,password} = req.body;
  console.log('Login attempt:', email);
  if(!email || !password) return res.status(400).json({message:'Email and password required'});
  try{
    let user;
    if(db){
      const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
      user = rows[0];
    } else {
      user = memory.users.find(u=>u.email===email);
    }
    if(!user) return res.status(400).json({message:'Invalid credentials'});
    // FIX: handle both password and password_hash column names
    const hash = user.password || user.password_hash;
    if(!hash){
      console.log('User has no password hash:', user);
      return res.status(500).json({message:'User password not set in DB, run seed'});
    }
    const ok = await bcrypt.compare(password, hash);
    if(!ok) return res.status(400).json({message:'Invalid credentials'});
    const token = jwt.sign({id:user.id, email:user.email, role:user.role, name:user.name}, JWT_SECRET, {expiresIn:'7d'});
    res.json({token, user:{id:user.id, name:user.name, email:user.email, role:user.role}});
  }catch(e){ console.error('Login error:', e); res.status(500).json({message:e.message}); }
});

app.post('/api/auth/register', async (req,res)=>{
  const {name,email,password,role} = req.body;
  if(!name||!email||!password) return res.status(400).json({message:'All fields required'});
  try{
    const hash = await bcrypt.hash(password,10);
    const r = role==='admin' ? 'admin' : 'learner';
    if(db){
      try{
        await db.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name,email,hash,r]);
      }catch(e){
        if(e.code==='ER_BAD_FIELD_ERROR'){
          await db.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [name,email,hash,r]);
        } else throw e;
      }
      const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
      const user = rows[0];
      const token = jwt.sign({id:user.id, email:user.email, role:user.role, name:user.name}, JWT_SECRET, {expiresIn:'7d'});
      return res.json({token, user:{id:user.id, name:user.name, email:user.email, role:user.role}});
    } else {
      const id = memory.users.length+1;
      const user = {id, name, email, password:hash, role:r};
      memory.users.push(user);
      const token = jwt.sign({id, email, role:r, name}, JWT_SECRET, {expiresIn:'7d'});
      return res.json({token, user:{id, name, email, role:r}});
    }
  }catch(e){
    if(e.code==='ER_DUP_ENTRY') return res.status(400).json({message:'Email already exists'});
    res.status(500).json({message:e.message});
  }
});

app.get('/api/laptops', auth, async (req,res)=>{
  try{
    if(db){
      const [rows] = await db.query('SELECT * FROM laptops');
      return res.json(rows);
    }
    res.json(memory.laptops);
  }catch(e){ res.json(memory.laptops); }
});

app.post('/api/laptops', auth, async (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({message:'Admin only'});
  const {asset_tag,brand,model,specs,status} = req.body;
  try{
    if(db){
      await db.query('INSERT INTO laptops (asset_tag,brand,model,specs,status) VALUES (?,?,?,?,?)', [asset_tag,brand,model,specs,status||'available']);
      const [rows] = await db.query('SELECT * FROM laptops');
      return res.json(rows);
    }
    memory.laptops.push({id:memory.laptops.length+1, asset_tag,brand,model,specs,status:status||'available'});
    res.json(memory.laptops);
  }catch(e){ res.status(500).json({message:e.message}); }
});

app.get('/api/loans', auth, async (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({message:'Admin only'});
  try{
    if(db){
      await db.query("UPDATE loans SET status='overdue' WHERE status='issued' AND DATEDIFF(NOW(), issued_at) > 21");
      const [rows] = await db.query(`SELECT loans.*, users.name as user_name, users.email, laptops.brand, laptops.model, laptops.asset_tag FROM loans JOIN users ON loans.user_id=users.id JOIN laptops ON loans.laptop_id=laptops.id ORDER BY loans.created_at DESC`);
      return res.json(rows);
    }
    memory.loans.forEach(l=>{ if(l.status==='issued' && l.issued_at){ const diff=(Date.now()-new Date(l.issued_at))/86400000; if(diff>21) l.status='overdue'; } });
    res.json(memory.loans);
  }catch(e){ res.json(memory.loans); }
});

app.get('/api/loans/my', auth, async (req,res)=>{
  try{
    if(db){
      const [rows] = await db.query(`SELECT loans.*, laptops.brand, laptops.model, laptops.asset_tag FROM loans JOIN laptops ON loans.laptop_id=laptops.id WHERE loans.user_id=? ORDER BY loans.created_at DESC`, [req.user.id]);
      return res.json(rows);
    }
    res.json(memory.loans.filter(l=>l.user_id===req.user.id));
  }catch(e){ res.json(memory.loans.filter(l=>l.user_id===req.user.id)); }
});

app.post('/api/loans', auth, async (req,res)=>{
  if(req.user.role==='admin') return res.status(403).json({message:'Admins cannot request laptops'});
  const {laptop_id, purpose} = req.body;
  try{
    if(db){
      const [active] = await db.query("SELECT * FROM loans WHERE user_id=? AND status IN ('pending','approved','issued','overdue')", [req.user.id]);
      if(active.length>0) return res.status(400).json({message:'You already have an active loan, return first'});
      await db.query('INSERT INTO loans (user_id,laptop_id,purpose,status) VALUES (?,?,?,?)', [req.user.id,laptop_id,purpose,'pending']);
      return res.json({message:'Request submitted'});
    }
    if(memory.loans.find(l=>l.user_id===req.user.id && ['pending','approved','issued','overdue'].includes(l.status))) return res.status(400).json({message:'You already have an active loan'});
    memory.loans.push({id:memory.loans.length+1, user_id:req.user.id, laptop_id, purpose, status:'pending', user_name:req.user.name, brand:'Laptop', model:'', created_at:new Date()});
    res.json({message:'Request submitted'});
  }catch(e){ res.status(500).json({message:e.message}); }
});

app.put('/api/loans/:id/status', auth, async (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({message:'Admin only'});
  const {status, collection_date, collection_location, admin_note} = req.body;
  const {id} = req.params;
  try{
    if(!status) return res.status(400).json({message:'Status required'});
    if(status==='approved' && !collection_date) return res.status(400).json({message:'Collection date required'});
    if(status==='rejected' && !admin_note) return res.status(400).json({message:'Rejection reason required'});
    
    let loanUser;
    if(db){
      const [rows] = await db.query('SELECT * FROM loans WHERE id=?', [id]);
      loanUser = rows[0];
      let query = 'UPDATE loans SET status=?';
      let params = [status];
      if(status==='approved'){ query+=', collection_date=?, collection_location=?, admin_note=?'; params.push(collection_date,collection_location,admin_note); }
      else if(status==='rejected'){ query+=', admin_note=?'; params.push(admin_note); }
      else if(status==='issued'){ query+=', issued_at=NOW(), admin_note=?'; params.push(admin_note||''); const [l] = await db.query('SELECT laptop_id FROM loans WHERE id=?',[id]); if(l[0]) await db.query('UPDATE laptops SET status=? WHERE id=?',['loaned', l[0].laptop_id]); }
      else if(status==='returned'){ query+=', returned_at=NOW()'; const [l] = await db.query('SELECT laptop_id FROM loans WHERE id=?',[id]); if(l[0]) await db.query('UPDATE laptops SET status=? WHERE id=?',['available', l[0].laptop_id]); }
      query+=' WHERE id=?'; params.push(id);
      await db.query(query, params);
      
      let notifTitle='', notifMsg='';
      if(status==='approved'){ notifTitle='Request Approved - Ready for Collection'; notifMsg=`Collect your laptop from ${collection_location} on ${collection_date}. Note: ${admin_note||''}`; }
      if(status==='rejected'){ notifTitle='Request Rejected'; notifMsg=`Your request rejected. Reason: ${admin_note}`; }
      if(status==='issued'){ notifTitle='Laptop Issued'; notifMsg='Your laptop has been issued. Return within 3 weeks.'; }
      if(status==='returned'){ notifTitle='Laptop Returned'; notifMsg='Thank you for returning the laptop.'; }
      if(notifTitle && loanUser) await db.query('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)', [loanUser.user_id, notifTitle, notifMsg]);
      
      return res.json({message:'Status updated'});
    }
    const loan = memory.loans.find(l=>l.id==id);
    if(loan){ loan.status=status; loan.admin_note=admin_note; loan.collection_info= collection_location+' on '+collection_date; if(status==='issued') loan.issued_at=new Date(); }
    res.json({message:'Status updated'});
  }catch(e){ res.status(500).json({message:e.message}); }
});

app.get('/api/notifications', auth, async (req,res)=>{
  try{
    if(db){
      const [rows] = await db.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
      return res.json(rows);
    }
    res.json(memory.notifications.filter(n=>n.user_id===req.user.id));
  }catch(e){ res.json([]); }
});

app.get('/api/users', auth, async (req,res)=>{
  if(req.user.role!=='admin') return res.status(403).json({message:'Admin only'});
  try{
    if(db){ const [rows]=await db.query('SELECT id,name,email,role,created_at FROM users'); return res.json(rows); }
    res.json(memory.users.map(u=>({id:u.id,name:u.name,email:u.email,role:u.role})));
  }catch(e){ res.json([]); }
});

app.listen(PORT, ()=> console.log(`LLMS Backend running on http://localhost:${PORT}`));
