
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

let db;

async function connectDB() {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];

  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(`${variable} is missing from environment variables`);
    }
  }

  if (!process.env.DB_SSL_CA_PATH) {
    throw new Error('DB_SSL_CA_PATH is missing. TiDB requires an SSL certificate.');
  }

  const ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');

  db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
      ca,
      rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
  });

  await db.query('SELECT 1');

  console.log('Successfully connected to TiDB Cloud database.');
}

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Root and health check
app.get('/', (req, res) => {
  res.json({
    message: 'Ponelopele LLMS Backend is running',
    database: db ? 'Connected' : 'Disconnected'
  });
});

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected'
    });
  }
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must contain at least 8 characters'
    });
  }

  const userRole = role === 'admin' ? 'admin' : 'learner';

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hash, userRole]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: userRole
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const hash = user.password || user.password_hash;

    if (!hash) {
      return res.status(500).json({
        message: 'Account password is not configured'
      });
    }

    const validPassword = await bcrypt.compare(password, hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(userData, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET LAPTOPS
app.get('/api/laptops', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM laptops ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Laptop retrieval error:', error.message);
    res.status(500).json({ message: 'Could not retrieve laptops' });
  }
});

// ADD LAPTOP
app.post('/api/laptops', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { asset_tag, brand, model, specs, status } = req.body;

  if (!asset_tag || !brand || !model) {
    return res.status(400).json({
      message: 'Asset tag, brand and model are required'
    });
  }

  try {
    await db.query(
      `INSERT INTO laptops
       (asset_tag, brand, model, specs, status)
       VALUES (?, ?, ?, ?, ?)`,
      [asset_tag, brand, model, specs || '', status || 'available']
    );

    const [rows] = await db.query('SELECT * FROM laptops ORDER BY id DESC');
    res.status(201).json(rows);
  } catch (error) {
    console.error('Laptop creation error:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Asset tag already exists' });
    }

    res.status(500).json({ message: 'Could not add laptop' });
  }
});

// ADMIN: GET ALL LOANS
app.get('/api/loans', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    await db.query(
      `UPDATE loans
       SET status = 'overdue'
       WHERE status = 'issued'
       AND issued_at < DATE_SUB(NOW(), INTERVAL 21 DAY)`
    );

    const [rows] = await db.query(`
      SELECT loans.*,
             users.name AS user_name,
             users.email,
             laptops.brand,
             laptops.model,
             laptops.asset_tag
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN laptops ON loans.laptop_id = laptops.id
      ORDER BY loans.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Loan retrieval error:', error.message);
    res.status(500).json({ message: 'Could not retrieve loans' });
  }
});

// LEARNER: GET MY LOANS
app.get('/api/loans/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT loans.*,
             laptops.brand,
             laptops.model,
             laptops.asset_tag
      FROM loans
      JOIN laptops ON loans.laptop_id = laptops.id
      WHERE loans.user_id = ?
      ORDER BY loans.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    console.error('My loans error:', error.message);
    res.status(500).json({ message: 'Could not retrieve your loans' });
  }
});

// LEARNER: REQUEST LAPTOP
app.post('/api/loans', auth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({
      message: 'Administrators cannot request laptops'
    });
  }

  const { laptop_id, purpose } = req.body;

  if (!laptop_id) {
    return res.status(400).json({ message: 'Select a laptop' });
  }

  try {
    const [active] = await db.query(
      `SELECT id FROM loans
       WHERE user_id = ?
       AND status IN ('pending', 'approved', 'issued', 'overdue')`,
      [req.user.id]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: 'You already have an active loan'
      });
    }

    const [laptops] = await db.query(
      'SELECT * FROM laptops WHERE id = ? AND status = ?',
      [laptop_id, 'available']
    );

    if (laptops.length === 0) {
      return res.status(400).json({
        message: 'This laptop is not available'
      });
    }

    await db.query(
      `INSERT INTO loans (user_id, laptop_id, purpose, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, laptop_id, purpose || '']
    );

    res.status(201).json({ message: 'Laptop request submitted successfully' });
  } catch (error) {
    console.error('Loan request error:', error.message);
    res.status(500).json({ message: 'Could not submit loan request' });
  }
});

// ADMIN: UPDATE LOAN STATUS
app.put('/api/loans/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { status, collection_date, collection_location, admin_note } = req.body;
  const { id } = req.params;

  const allowedStatuses = [
    'approved', 'rejected', 'issued', 'returned'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid loan status' });
  }

  if (status === 'approved' && !collection_date) {
    return res.status(400).json({
      message: 'Collection date is required'
    });
  }

  if (status === 'rejected' && !admin_note) {
    return res.status(400).json({
      message: 'Rejection reason is required'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM loans WHERE id = ? FOR UPDATE',
      [id]
    );

    const loan = rows[0];

    if (!loan) {
      await connection.rollback();
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (status === 'approved') {
      await connection.query(
        `UPDATE loans
         SET status = ?, collection_date = ?,
             collection_location = ?, admin_note = ?
         WHERE id = ?`,
        [status, collection_date, collection_location || '', admin_note || '', id]
      );
    } else if (status === 'rejected') {
      await connection.query(
        'UPDATE loans SET status = ?, admin_note = ? WHERE id = ?',
        [status, admin_note, id]
      );
    } else if (status === 'issued') {
      await connection.query(
        `UPDATE loans SET status = ?, issued_at = NOW(), admin_note = ?
         WHERE id = ?`,
        [status, admin_note || '', id]
      );

      await connection.query(
        'UPDATE laptops SET status = ? WHERE id = ?',
        ['loaned', loan.laptop_id]
      );
    } else if (status === 'returned') {
      await connection.query(
        `UPDATE loans SET status = ?, returned_at = NOW()
         WHERE id = ?`,
        [status, id]
      );

      await connection.query(
        'UPDATE laptops SET status = ? WHERE id = ?',
        ['available', loan.laptop_id]
      );
    }

    let title = '';
    let message = '';

    if (status === 'approved') {
      title = 'Request Approved - Ready for Collection';
      message = `Collect your laptop from ${collection_location || 'the school'} on ${collection_date}. ${admin_note || ''}`;
    } else if (status === 'rejected') {
      title = 'Request Rejected';
      message = `Your request was rejected. Reason: ${admin_note}`;
    } else if (status === 'issued') {
      title = 'Laptop Issued';
      message = 'Your laptop has been issued. Please return it within three weeks.';
    } else if (status === 'returned') {
      title = 'Laptop Returned';
      message = 'Thank you for returning the laptop.';
    }

    if (title) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES (?, ?, ?)`,
        [loan.user_id, title, message]
      );
    }

    await connection.commit();

    res.json({ message: 'Loan status updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Loan status update error:', error.message);
    res.status(500).json({ message: 'Could not update loan status' });
  } finally {
    if (connection) connection.release();
  }
});

// GET NOTIFICATIONS
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Notification error:', error.message);
    res.status(500).json({ message: 'Could not retrieve notifications' });
  }
});

// ADMIN: GET ALL USERS
app.get('/api/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
    );

    res.json(rows);
  } catch (error) {
    console.error('User retrieval error:', error.message);
    res.status(500).json({ message: 'Could not retrieve users' });
  }
});

// START SERVER ONLY AFTER DATABASE CONNECTS
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`LLMS backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
