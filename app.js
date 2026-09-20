require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Product = require('./models/Product');
const { verifyToken, adminOnly } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 2. KONEKSI KE MONGODB ATLAS (SERVERLESS READY)
// ==========================================
let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Variabel MONGO_URI belum diset di Environment Variables Vercel!');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
};

// Middleware: Pastikan koneksi MongoDB selalu siap sebelum mengolah request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ [MONGODB ATLAS ERROR]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal terhubung ke database MongoDB Atlas.',
      error: err.message,
    });
  }
});

// ==========================================
// 3. ROUTE API AUTENTIKASI
// ==========================================

// POST: Login & Terbitkan Token JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi!',
      });
    }

    // Cari user di database MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak sesuai!',
      });
    }

    // Cek status aktif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan. Hubungi admin.',
      });
    }

    // Cek kecocokan password (mendukung hash bcrypt & plain text untuk data awal DB)
    let isMatch = false;
    if (user.password === password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password tidak sesuai!',
      });
    }

    // Buat token JWT (berisi payload user)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message,
    });
  }
});

// POST: Register User Baru (Menyimpan langsung ke MongoDB)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi!',
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email ini sudah terdaftar!',
      });
    }

    // Hash password demi keamanan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      age: age || 20,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi user berhasil!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendaftar user baru.',
      error: error.message,
    });
  }
});

// ==========================================
// 4. ROUTE DILINDUNGI MIDDLEWARE (PROTECTED)
// ==========================================

// GET: Cek Profil Saya (Memakai middleware verifyToken)
app.get('/api/auth/me', verifyToken, async (req, res) => {
  // req.user otomatis disuntikkan oleh middleware verifyToken
  res.json({
    success: true,
    message: 'Data profil berhasil diakses melalui middleware autentikasi!',
    user: req.user,
  });
});

// GET: Daftar Semua Pengguna dari MongoDB (Khusus Admin, memakai 2 middleware!)
app.get('/api/users', verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data user.',
    });
  }
});

// POST: Tambah Pengguna Baru (Create)
app.post('/api/users', verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role, age, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi!',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email tersebut sudah terdaftar!',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      age: Number(age) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Pengguna berhasil ditambahkan!',
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan pengguna.',
      error: error.message,
    });
  }
});

// PUT: Update Pengguna (Update)
app.put('/api/users/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, age, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan!',
      });
    }

    // Cek jika email diganti ke email yang sudah terpakai user lain
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan pengguna lain!',
        });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (age !== undefined) user.age = Number(age);
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    // Update password jika diisi
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui!',
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengguna.',
      error: error.message,
    });
  }
});

// DELETE: Hapus Pengguna (Delete)
app.delete('/api/users/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Larang menghapus diri sendiri yang sedang login
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!',
      });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan!',
      });
    }

    res.json({
      success: true,
      message: `Pengguna "${deleted.name}" berhasil dihapus dari MongoDB!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengguna.',
      error: error.message,
    });
  }
});

// ==========================================
// 5. ROUTE CRUD PRODUK (MongoDB 'products')
// ==========================================

// GET: Ambil Semua Produk
app.get('/api/products', verifyToken, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data produk.',
      error: error.message,
    });
  }
});

// POST: Tambah Produk Baru
app.post('/api/products', verifyToken, async (req, res) => {
  try {
    const { name, description, price, category, stock, isActive } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Nama produk dan harga wajib diisi!',
      });
    }

    const newProduct = await Product.create({
      name,
      description: description || '',
      price: Number(price),
      category: category || 'Accessories',
      stock: Number(stock) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Produk baru berhasil ditambahkan!',
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk.',
      error: error.message,
    });
  }
});

// PUT: Update Produk
app.put('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan!',
      });
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    await product.save();

    res.json({
      success: true,
      message: 'Data produk berhasil diperbarui!',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk.',
      error: error.message,
    });
  }
});

// DELETE: Hapus Produk
app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan!',
      });
    }

    res.json({
      success: true,
      message: `Produk "${deleted.name}" berhasil dihapus dari database!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk.',
      error: error.message,
    });
  }
});

// GET: Statistik Ringkas untuk Beranda Dashboard
app.get('/api/stats/dashboard', verifyToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const products = await Product.find();

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalStock,
        totalValue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memuat statistik dashboard.',
    });
  }
});

// ==========================================
// 5. STATUS SERVER & KONEKSI DB
// ==========================================
app.get('/api/status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.json({
    server: 'Express API Server',
    port: port,
    mongodb: {
      status: statusMap[dbState] || 'Unknown',
      database: mongoose.connection.name || 'belajar',
      host: mongoose.connection.host || 'localhost',
    },
    timestamp: new Date().toISOString(),
  });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 [EXPRESS] Backend aktif di http://localhost:${port}`);
    console.log(`📡 [STATUS DB]: http://localhost:${port}/api/status`);
  });
}

module.exports = app;

