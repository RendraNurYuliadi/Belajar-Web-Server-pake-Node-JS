const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    age: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'users', // Memastikan memakai collection 'users' di db belajar
  }
);

module.exports = mongoose.model('User', userSchema);
