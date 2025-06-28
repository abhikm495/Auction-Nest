import mongoose from 'mongoose';
import Product from "../models/product.js";
import Category from '../models/category.js';

// Image categories mapped to search terms for better relevance
const imageSearchTerms = {
  'Electronics': ['electronics', 'gadgets', 'technology', 'devices', 'smartphone', 'laptop', 'headphones'],
  'Antiques': ['antique', 'vintage', 'old', 'classic', 'retro', 'collectible', 'historical'],
  'Art': ['art', 'painting', 'sculpture', 'artwork', 'canvas', 'creative', 'artistic'],
  'Books': ['books', 'library', 'reading', 'literature', 'novel', 'bookshelf'],
  'Clothing': ['fashion', 'clothing', 'apparel', 'style', 'garment', 'outfit'],
  'Collectibles': ['collectibles', 'memorabilia', 'vintage', 'rare', 'collection'],
  'Home & Garden': ['home', 'garden', 'furniture', 'decor', 'interior', 'plants'],
  'Jewelry': ['jewelry', 'gems', 'rings', 'necklace', 'precious', 'gold', 'diamonds'],
  'Musical Instruments': ['music', 'instruments', 'guitar', 'piano', 'violin', 'drums'],
  'Sports': ['sports', 'fitness', 'exercise', 'athletic', 'gym', 'outdoor'],
  'Toys': ['toys', 'games', 'children', 'play', 'fun', 'colorful'],
  'Vehicles': ['cars', 'vehicles', 'automotive', 'transportation', 'motorcycle'],
  'Other': ['objects', 'items', 'products', 'misc', 'general']
};

// Function to get random search term
const getRandomSearchTerm = () => {
  const allTerms = Object.values(imageSearchTerms).flat();
  return allTerms[Math.floor(Math.random() * allTerms.length)];
};

// Function to get category-specific search term
const getCategorySearchTerm = (categoryName) => {
  const terms = imageSearchTerms[categoryName] || imageSearchTerms['Other'];
  return terms[Math.floor(Math.random() * terms.length)];
};

// Function to generate Unsplash URL (no API key required for basic usage)
const generateUnsplashUrl = (searchTerm, width = 400, height = 300) => {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://source.unsplash.com/${width}x${height}/?${searchTerm}&${randomId}`;
};

// Alternative: Picsum for random images (more reliable but less specific)
const generatePicsumUrl = (width = 400, height = 300) => {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/${width}/${height}?random=${randomId}`;
};

// Function to get random image from multiple sources
const getRandomImageUrl = (categoryName = null) => {
  const sources = [
    () => generateUnsplashUrl(categoryName ? getCategorySearchTerm(categoryName) : getRandomSearchTerm()),
    () => generatePicsumUrl(),
    () => `https://source.unsplash.com/400x300/?product&${Math.floor(Math.random() * 1000)}`,
    () => `https://source.unsplash.com/400x300/?object&${Math.floor(Math.random() * 1000)}`,
    () => `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000) + 1001}`
  ];
  
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  return randomSource();
};

// Function to update products with images
async function updateProductImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://abhikm911:admin@cluster0.l4dludr.mongodb.net/auction-nest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Get all products with their categories
    const products = await Product.find({}).populate('itemCategory', 'name');
    console.log(`Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log('No products found in database');
      return;
    }

    let updatedCount = 0;
    const batchSize = 10; // Process in smaller batches to avoid overwhelming the image services

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const updatePromises = [];

      for (const product of batch) {
        const categoryName = product.itemCategory?.name;
        const imageUrl = getRandomImageUrl(categoryName);
        
        const updatePromise = Product.findByIdAndUpdate(
          product._id,
          { itemPhoto: imageUrl },
          { new: true }
        );
        
        updatePromises.push(updatePromise);
      }

      // Execute batch updates
      await Promise.all(updatePromises);
      updatedCount += batch.length;
      
      console.log(`Updated ${updatedCount}/${products.length} products...`);
      
      // Add small delay between batches to be respectful to image services
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products with random images!`);
    
    // Display some sample updates
    const sampleProducts = await Product.find({}).limit(5).populate('itemCategory', 'name');
    console.log('\n--- Sample Updated Products ---');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.itemName}`);
      console.log(`   Category: ${product.itemCategory?.name || 'Unknown'}`);
      console.log(`   Image: ${product.itemPhoto}`);
      console.log('');
    });

    // Statistics
    const totalWithImages = await Product.countDocuments({ itemPhoto: { $ne: '' } });
    const totalWithoutImages = await Product.countDocuments({ itemPhoto: '' });
    
    console.log('--- Final Statistics ---');
    console.log(`Products with images: ${totalWithImages}`);
    console.log(`Products without images: ${totalWithoutImages}`);
    console.log(`Total products: ${totalWithImages + totalWithoutImages}`);

  } catch (error) {
    console.error('Error updating product images:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Additional function to update only products without images
async function updateProductsWithoutImages() {
  try {
    await mongoose.connect('mongodb+srv://abhikm911:admin@cluster0.l4dludr.mongodb.net/auction-nest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Get only products without images
    const products = await Product.find({ 
      $or: [
        { itemPhoto: '' },
        { itemPhoto: { $exists: false } },
        { itemPhoto: null }
      ]
    }).populate('itemCategory', 'name');
    
    console.log(`Found ${products.length} products without images`);

    if (products.length === 0) {
      console.log('All products already have images!');
      return;
    }

    let updatedCount = 0;
    for (const product of products) {
      const categoryName = product.itemCategory?.name;
      const imageUrl = getRandomImageUrl(categoryName);
      
      await Product.findByIdAndUpdate(
        product._id,
        { itemPhoto: imageUrl }
      );
      
      updatedCount++;
      if (updatedCount % 50 === 0) {
        console.log(`Updated ${updatedCount}/${products.length} products...`);
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} products with images!`);

  } catch (error) {
    console.error('Error updating products without images:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
console.log('Starting image update process...');
console.log('Choose your update method:');
console.log('1. Update ALL products (overwrites existing images)');
console.log('2. Update only products WITHOUT images');
console.log('');

// For this script, we'll update all products
// Change this to updateProductsWithoutImages() if you only want to update products without images
updateProductImages();