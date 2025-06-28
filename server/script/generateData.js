import mongoose from 'mongoose';
import Product from "./models/product.js"

// Sample data arrays
const productNames = {
  Electronics: [
    'iPhone 13 Pro', 'Samsung Galaxy S22', 'MacBook Pro', 'Dell XPS 13', 'iPad Air',
    'Nintendo Switch', 'PlayStation 5', 'Xbox Series X', 'Apple Watch', 'AirPods Pro',
    'Sony Headphones', 'Canon DSLR Camera', 'Gaming Monitor', 'Wireless Keyboard',
    'Bluetooth Speaker', 'Smart TV', 'Tablet', 'Laptop Charger', 'Phone Case', 'Power Bank'
  ],
  Antiques: [
    'Victorian Dining Table', 'Vintage Pocket Watch', 'Antique Vase', 'Old Grandfather Clock',
    'Vintage Typewriter', 'Antique Mirror', 'Victorian Chair', 'Old Phonograph',
    'Vintage Lamp', 'Antique Chest', 'Old Painting', 'Vintage Radio', 'Antique Jewelry Box',
    'Old Tea Set', 'Vintage Perfume Bottles', 'Antique Books', 'Old Compass', 'Vintage Globe'
  ],
  Art: [
    'Abstract Painting', 'Portrait Oil Painting', 'Landscape Watercolor', 'Modern Sculpture',
    'Digital Art Print', 'Handmade Pottery', 'Photography Print', 'Mixed Media Art',
    'Acrylic Painting', 'Charcoal Drawing', 'Vintage Poster', 'Art Sketch', 'Canvas Art',
    'Wall Sculpture', 'Ceramic Vase', 'Glass Art', 'Metal Sculpture', 'Wood Carving'
  ],
  Books: [
    'Rare First Edition Novel', 'Vintage Comic Book', 'Art History Book', 'Cookbook Collection',
    'Technical Manual', 'Poetry Collection', 'Biography', 'Science Fiction Novel',
    'History Book', 'Philosophy Text', 'Travel Guide', 'Self-Help Book', 'Children Book',
    'Dictionary Set', 'Encyclopedia', 'Medical Textbook', 'Language Learning Book'
  ],
  Clothing: [
    'Vintage Leather Jacket', 'Designer Dress', 'Casual T-Shirt', 'Formal Suit',
    'Winter Coat', 'Summer Dress', 'Jeans', 'Sneakers', 'Boots', 'Hat',
    'Scarf', 'Gloves', 'Belt', 'Handbag', 'Wallet', 'Sunglasses', 'Watch', 'Jewelry'
  ],
  Collectibles: [
    'Baseball Cards', 'Vintage Toys', 'Stamps Collection', 'Coins Set', 'Action Figures',
    'Trading Cards', 'Miniature Models', 'Vintage Posters', 'Movie Memorabilia',
    'Sports Memorabilia', 'Comic Books', 'Figurines', 'Vintage Pins', 'Postcards'
  ],
  'Home & Garden': [
    'Garden Tools Set', 'Indoor Plants', 'Outdoor Furniture', 'Kitchen Appliances',
    'Home Decor', 'Lighting Fixtures', 'Rugs', 'Curtains', 'Bedding Set',
    'Cookware', 'Dinnerware', 'Storage Containers', 'Cleaning Supplies', 'Tools'
  ],
  Jewelry: [
    'Diamond Ring', 'Gold Necklace', 'Silver Bracelet', 'Pearl Earrings',
    'Vintage Brooch', 'Wedding Ring', 'Watch', 'Pendant', 'Cufflinks',
    'Charm Bracelet', 'Engagement Ring', 'Gemstone Ring', 'Chain Necklace'
  ],
  'Musical Instruments': [
    'Acoustic Guitar', 'Electric Guitar', 'Piano', 'Violin', 'Drums Set',
    'Saxophone', 'Trumpet', 'Flute', 'Keyboard', 'Bass Guitar', 'Ukulele',
    'Harmonica', 'Microphone', 'Audio Interface', 'Studio Monitors'
  ],
  Sports: [
    'Tennis Racket', 'Golf Clubs Set', 'Basketball', 'Football', 'Soccer Ball',
    'Baseball Glove', 'Cycling Helmet', 'Running Shoes', 'Gym Equipment',
    'Yoga Mat', 'Dumbbells', 'Exercise Bike', 'Surfboard', 'Skateboard'
  ],
  Toys: [
    'LEGO Set', 'Board Game', 'Puzzle', 'Action Figure', 'Doll',
    'Remote Control Car', 'Video Game', 'Toy Train', 'Building Blocks',
    'Stuffed Animal', 'Educational Toy', 'Outdoor Toy', 'Craft Kit'
  ],
  Vehicles: [
    'Vintage Car', 'Motorcycle', 'Bicycle', 'Scooter', 'Boat',
    'RV', 'Truck', 'SUV', 'Convertible', 'Electric Car', 'ATV', 'Jet Ski'
  ],
  Other: [
    'Mystery Box', 'Craft Supplies', 'Office Supplies', 'Pet Accessories',
    'Travel Gear', 'Fitness Equipment', 'Beauty Products', 'Health Supplements',
    'Storage Solutions', 'Party Supplies', 'Outdoor Gear', 'Hobby Items'
  ]
};

const descriptions = [
  'Excellent condition, barely used',
  'Great condition with minor wear',
  'Good condition, fully functional',
  'Vintage piece in working condition',
  'Rare find, collector\'s item',
  'High quality, well maintained',
  'Perfect for beginners',
  'Professional grade equipment',
  'Unique piece, one of a kind',
  'Complete set with all accessories',
  'Recently serviced and cleaned',
  'Original packaging included',
  'Certificate of authenticity included',
  'No damage, smoke-free home',
  'Ideal for gift giving'
];

// Function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Function to get random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to get random date between now and future
const getRandomFutureDate = (daysFromNow = 30) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (Math.random() * daysFromNow * 24 * 60 * 60 * 1000));
  return futureDate;
};

// Function to generate random bids


// Main function to generate dummy data
async function generateDummyProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://abhikm911:admin@cluster0.l4dludr.mongodb.net/auction-nest', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB testing');

    // First, create categories if they don't exist
    const categoryIds = [
        '685ac338064f068122cf25c2',
        '685ac339064f068122cf25c7',
        '685ac33a064f068122cf25cb',
        '685ac33a064f068122cf25ce',
        '685ac363555a21d62f351b03',
        '685ac363555a21d62f351b06',
        '685ac364555a21d62f351b09',
        '685ac364555a21d62f351b0c',
        '685ac365555a21d62f351b0f',
        '685ac365555a21d62f351b12',
        '685ac366555a21d62f351b15',
        '685ac367555a21d62f351b18',
        '685ac367555a21d62f351b1b'
      ];
    

    const products = [];
    
    for (let i = 0; i < 1000; i++) {
        const randomCategoryId = getRandomElement(categoryIds);
      const startingPrice = getRandomNumber(10, 1000);
      const currentPrice = startingPrice + getRandomNumber(0, 500);
      
      const product = {
        itemName: getRandomElement(productNames.Electronics.concat(
            productNames.Antiques, productNames.Art, productNames.Books,
            productNames.Clothing, productNames.Collectibles, productNames['Home & Garden'],
            productNames.Jewelry, productNames['Musical Instruments'], productNames.Sports,
            productNames.Toys, productNames.Vehicles, productNames.Other
          )),
        itemDescription: getRandomElement(descriptions),
        itemCategory: randomCategoryId,
        itemPhoto: ``, // Random placeholder image
        startingPrice: startingPrice,
        currentPrice: currentPrice,
        itemStartDate: new Date(Date.now() - getRandomNumber(0, 604800000)), // Random date in last week
        itemEndDate: getRandomFutureDate(100), // Random date in next 30 days
        seller: '685c0e7bf39970f930339f7d',
        winner:  null, // 20% chance of having a winner
        isSold: false // 10% chance of being sold
      };
      
      products.push(product);
    }

    // Insert products in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
    }

    console.log(`Successfully generated ${products.length} dummy products!`);
    
    // Display some statistics
    const totalProducts = await Product.countDocuments();
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'itemCategory',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n--- Statistics ---');
    console.log(`Total products: ${totalProducts}`);
    console.log('\nProducts by category:');
    productsByCategory.forEach(cat => {
      console.log(`${cat._id}: ${cat.count}`);
    });

  } catch (error) {
    console.error('Error generating dummy data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
generateDummyProducts();