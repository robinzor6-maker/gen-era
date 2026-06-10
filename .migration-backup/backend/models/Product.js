const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: 160,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      index: true,
      enum: ['clothing', 'accessories'],
      default: 'clothing',
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    gallery: {
      type: [String],
      default: [],
    },
    modelPath: {
      type: String,
      default: '',
    },
    texturePath: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true, // false = soft-deleted from public
    },
  },
  { timestamps: true }
);

// ─── Indexes as per architecture spec ───
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
