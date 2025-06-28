import mongoose from "mongoose"
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    enum: {
      values: [
        "Electronics",
        "Antiques",
        "Art",
        "Books",
        "Clothing",
        "Collectibles",
        "Home & Garden",
        "Jewelry",
        "Musical Instruments",
        "Sports",
        "Toys",
        "Vehicles",
        "Other"
      ],
      message: '{VALUE} is not a valid category'
    },
    trim: true
  },
  itemPhoto: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically handle createdAt and updatedAt
});



const Category = mongoose.model('categories', categorySchema);

export default Category