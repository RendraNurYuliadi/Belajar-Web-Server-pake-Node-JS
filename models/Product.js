const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    category: {
      type: String,
      default: 'Accessories',
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stok tidak boleh negatif'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'products', // Memastikan memakai collection 'products' di db belajar
  }
);

module.exports = mongoose.model('Product', productSchema);
