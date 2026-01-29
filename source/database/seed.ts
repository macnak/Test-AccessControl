import { getDatabase } from './database.service';

const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Barbara',
  'David',
  'Elizabeth',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Donald',
  'Ashley',
  'Steven',
  'Kimberly',
  'Paul',
  'Emily',
  'Andrew',
  'Donna',
  'Joshua',
  'Michelle',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
];

const streets = [
  'Main St',
  'Oak Ave',
  'Maple Dr',
  'Cedar Ln',
  'Pine St',
  'Elm Ave',
  'Washington Blvd',
  'Park Ave',
  'Lake St',
  'Hill Rd',
];
const cities = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
];

const productAdjectives = [
  'Premium',
  'Professional',
  'Deluxe',
  'Classic',
  'Modern',
  'Vintage',
  'Elite',
  'Ultimate',
  'Essential',
  'Smart',
];
const electronicProducts = [
  'Wireless Headphones',
  'Bluetooth Speaker',
  'Smartphone Stand',
  'USB-C Cable',
  'Wireless Mouse',
  'Mechanical Keyboard',
  'Webcam',
  'External SSD',
  'Power Bank',
  'Fitness Tracker',
  'Smart Watch',
  'Tablet Stand',
  'HDMI Cable',
  'Laptop Sleeve',
  'Phone Case',
  'Gaming Mouse',
  'USB Hub',
  'Wireless Charger',
  'Portable Monitor',
  'USB Microphone',
  'LED Desk Lamp',
  'Cable Organizer',
  'Screen Protector',
  'Laptop Stand',
  'Cooling Pad',
  'External Hard Drive',
  'Memory Card',
  'Card Reader',
  'Ethernet Cable',
  'DisplayPort Cable',
  'Thunderbolt Cable',
  'Audio Interface',
  'Studio Headphones',
  'Condenser Microphone',
  'Pop Filter',
  'Camera Tripod',
  'Ring Light',
  'Green Screen',
  'Capture Card',
  'Drawing Tablet',
  'Stylus Pen',
  'VR Headset',
  'Gaming Keyboard',
  'RGB Mouse Pad',
  'Streaming Deck',
  'Docking Station',
  '4K Webcam',
  'Conference Speaker',
  'Noise Cancelling Headphones',
  'True Wireless Earbuds',
];
const clothingProducts = [
  'Cotton T-Shirt',
  'Running Shoes',
  'Winter Jacket',
  'Casual Jeans',
  'Sports Shorts',
  'Hoodie',
  'Dress Shirt',
  'Sneakers',
  'Baseball Cap',
  'Socks Pack',
  'Athletic Leggings',
  'Polo Shirt',
  'Sweatpants',
  'Beanie',
  'Track Jacket',
  'Cargo Pants',
  'Windbreaker',
  'Tank Top',
  'Compression Shirt',
  'Training Shorts',
  'Yoga Pants',
  'Fleece Jacket',
  'Denim Jacket',
  'Chino Pants',
  'Graphic Tee',
  'Long Sleeve Shirt',
  'Pullover Sweater',
  'Zip Hoodie',
  'Joggers',
  'Board Shorts',
  'Thermal Underwear',
  'Rain Jacket',
  'Puffer Vest',
  'Henley Shirt',
  'Button Down Shirt',
  'Khaki Shorts',
  'Swim Trunks',
  'Tank Dress',
  'Maxi Dress',
  'Midi Skirt',
  'Leather Jacket',
  'Cardigan',
  'Blazer',
  'Trench Coat',
  'Parka',
  'Combat Boots',
  'Loafers',
  'Sandals',
  'Slides',
  'High Tops',
];
const homeGardenProducts = [
  'Coffee Maker',
  'Blender',
  'Toaster',
  'Air Fryer',
  'Slow Cooker',
  'Vacuum Cleaner',
  'Robot Vacuum',
  'Steam Mop',
  'Iron',
  'Ironing Board',
  'Desk Organizer',
  'Storage Bins',
  'Bookshelf',
  'Office Chair',
  'Standing Desk',
  'Table Lamp',
  'Floor Lamp',
  'Ceiling Fan',
  'Space Heater',
  'Tower Fan',
  'Area Rug',
  'Throw Pillows',
  'Curtains',
  'Blackout Blinds',
  'Picture Frames',
  'Wall Clock',
  'Mirror',
  'Coat Rack',
  'Shoe Rack',
  'Laundry Hamper',
  'Trash Can',
  'Recycling Bin',
  'Step Stool',
  'Folding Table',
  'TV Stand',
  'Plant Pot',
  'Watering Can',
  'Garden Tools Set',
  'Pruning Shears',
  'Garden Hose',
  'Lawn Mower',
  'Hedge Trimmer',
  'Leaf Blower',
  'Compost Bin',
  'Raised Garden Bed',
  'Outdoor Furniture',
  'Patio Umbrella',
  'Fire Pit',
  'String Lights',
  'Solar Lights',
];
const sportsProducts = [
  'Yoga Mat',
  'Resistance Bands',
  'Dumbbells',
  'Kettlebell',
  'Foam Roller',
  'Jump Rope',
  'Exercise Ball',
  'Pull Up Bar',
  'Push Up Bars',
  'Ab Wheel',
  'Weight Bench',
  'Barbell Set',
  'Plate Set',
  'Gym Bag',
  'Water Bottle',
  'Protein Shaker',
  'Workout Gloves',
  'Lifting Straps',
  'Wrist Wraps',
  'Knee Sleeves',
  'Running Belt',
  'Arm Band',
  'Sweat Towel',
  'Cooling Towel',
  'Sport Headband',
  'Basketball',
  'Football',
  'Soccer Ball',
  'Volleyball',
  'Tennis Racket',
  'Badminton Set',
  'Table Tennis Paddle',
  'Golf Clubs',
  'Golf Balls',
  'Golf Bag',
  'Baseball Glove',
  'Baseball Bat',
  'Softball',
  'Frisbee',
  'Cornhole Set',
  'Camping Tent',
  'Sleeping Bag',
  'Camping Chair',
  'Cooler',
  'Backpack',
  'Hiking Boots',
  'Trekking Poles',
  'Hydration Pack',
  'Bike Helmet',
  'Bike Lock',
];
const toysGamesProducts = [
  'Board Game',
  'Puzzle 1000pc',
  'Playing Cards',
  'Dice Set',
  'Chess Set',
  'Checkers',
  'Dominoes',
  'Jenga',
  'Uno Cards',
  'Monopoly',
  'Scrabble',
  'Connect Four',
  'Battleship',
  'Risk',
  'Catan',
  'Action Figure',
  'Doll House',
  'RC Car',
  'Drone',
  'Nerf Blaster',
  'LEGO Set',
  'Building Blocks',
  'Model Kit',
  'Paint Set',
  'Craft Kit',
  'Coloring Book',
  'Crayons',
  'Markers',
  'Colored Pencils',
  'Sketch Pad',
  'Stuffed Animal',
  'Plush Toy',
  'Ball Pit Balls',
  'Play Tent',
  'Toy Kitchen',
  'Tool Set Toy',
  'Doctor Kit',
  'Science Kit',
  'Robot Kit',
  'Microscope',
  'Telescope',
  'Binoculars',
  'Magic Set',
  'Yo-Yo',
  'Slime Kit',
  'Bubble Machine',
  'Water Guns',
  'Sand Toys',
  'Kite',
  'Skateboard',
];
const beautyHealthProducts = [
  'Face Moisturizer',
  'Cleanser',
  'Serum',
  'Face Mask',
  'Eye Cream',
  'Sunscreen SPF50',
  'Lip Balm',
  'Hand Cream',
  'Body Lotion',
  'Body Wash',
  'Shampoo',
  'Conditioner',
  'Hair Mask',
  'Hair Oil',
  'Dry Shampoo',
  'Hair Dryer',
  'Straightener',
  'Curling Iron',
  'Hair Brush',
  'Comb',
  'Nail Polish',
  'Nail File',
  'Cuticle Oil',
  'Manicure Set',
  'Pedicure Kit',
  'Electric Toothbrush',
  'Toothpaste',
  'Mouthwash',
  'Floss',
  'Tongue Scraper',
  'Face Roller',
  'Gua Sha',
  'Facial Steamer',
  'LED Face Mask',
  'Massage Gun',
  'Essential Oil Set',
  'Diffuser',
  'Aromatherapy',
  'Bath Bombs',
  'Bubble Bath',
  'Heating Pad',
  'Ice Pack',
  'First Aid Kit',
  'Thermometer',
  'Blood Pressure Monitor',
  'Pulse Oximeter',
  'Humidifier',
  'Air Purifier',
  'White Noise Machine',
  'Sleep Mask',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+1-555-${randomNumber(1000, 9999)}`;
}

function generateAddress(): string {
  return `${randomNumber(100, 9999)} ${randomElement(streets)}, ${randomElement(cities)} ${randomNumber(10000, 99999)}`;
}

export async function seedDatabase(): Promise<void> {
  const db = getDatabase();

  console.log('Starting database seeding...');

  // Check if already seeded
  const userCount = db.getUserCount();
  if (userCount > 0) {
    console.log(`Database already contains ${userCount} users. Skipping seed.`);
    console.log('To re-seed, run: npm run db:reset');
    return;
  }

  try {
    // Seed users (150 users)
    console.log('Seeding users...');
    const users: number[] = [];

    // All users use the same password for easy JMeter testing
    const testPassword = 'password123';

    // Generate 150 users for load testing
    for (let i = 1; i <= 150; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const user = db.createUser(
        `user${i}@example.com`,
        testPassword,
        `${firstName} ${lastName}`,
        generateAddress(),
        generatePhone(),
      );
      users.push(user.id);
    }

    console.log(`✓ Created ${users.length} users`);

    // Seed products (300+ products for performance testing)
    console.log('Seeding products...');
    const products: number[] = [];

    // Electronics (60 products)
    for (let i = 0; i < 60; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(electronicProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `v${i}` : ''}`,
        parseFloat((randomNumber(1000, 50000) / 100).toFixed(2)),
        'Electronics',
        `High-quality ${productName.toLowerCase()} with advanced features`,
        randomNumber(500, 2000), // Much higher stock for performance testing
        `https://example.com/images/electronics/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Clothing (60 products)
    for (let i = 0; i < 60; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(clothingProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `Style ${i}` : ''}`,
        parseFloat((randomNumber(1499, 12999) / 100).toFixed(2)),
        'Clothing',
        `Comfortable and stylish ${productName.toLowerCase()}`,
        randomNumber(500, 2000),
        `https://example.com/images/clothing/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Home & Garden (60 products)
    for (let i = 0; i < 60; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(homeGardenProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `Model ${i}` : ''}`,
        parseFloat((randomNumber(2999, 29999) / 100).toFixed(2)),
        'Home & Garden',
        `Quality ${productName.toLowerCase()} for your home`,
        randomNumber(300, 1500),
        `https://example.com/images/home/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Sports & Outdoors (60 products)
    for (let i = 0; i < 60; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(sportsProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `Pro ${i}` : ''}`,
        parseFloat((randomNumber(999, 19999) / 100).toFixed(2)),
        'Sports & Outdoors',
        `Professional ${productName.toLowerCase()} for athletes`,
        randomNumber(400, 1800),
        `https://example.com/images/sports/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Toys & Games (30 products)
    for (let i = 0; i < 30; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(toysGamesProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `Edition ${i}` : ''}`,
        parseFloat((randomNumber(999, 9999) / 100).toFixed(2)),
        'Toys & Games',
        `Fun and entertaining ${productName.toLowerCase()}`,
        randomNumber(600, 2500),
        `https://example.com/images/toys/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Beauty & Health (30 products)
    for (let i = 0; i < 30; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(beautyHealthProducts);
      const product = db.createProduct(
        `${adjective} ${productName} ${i > 0 ? `Plus ${i}` : ''}`,
        parseFloat((randomNumber(599, 14999) / 100).toFixed(2)),
        'Beauty & Health',
        `Premium ${productName.toLowerCase()} for wellness`,
        randomNumber(400, 2000),
        `https://example.com/images/beauty/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    console.log(`✓ Created ${products.length} products`);

    // Seed some sample orders (20 orders)
    console.log('Seeding sample orders...');
    let orderCount = 0;

    for (let i = 0; i < 20; i++) {
      const userId = randomElement(users);
      const user = db.getUserById(userId)!;
      const orderProductCount = randomNumber(1, 5);
      const orderItems: Array<{
        productId: number;
        productName: string;
        quantity: number;
        price: number;
      }> = [];
      let total = 0;

      for (let j = 0; j < orderProductCount; j++) {
        const productId = randomElement(products);
        const product = db.getProductById(productId)!;
        const quantity = randomNumber(1, 3);
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
        });
        total += product.price * quantity;
      }

      const orderId = `ORD-SEED-${Date.now()}-${i}-${randomNumber(1000, 9999)}`;
      db.createOrder(
        orderId,
        userId,
        parseFloat(total.toFixed(2)),
        'credit_card',
        user.address || generateAddress(),
        orderItems,
      );

      // Set some orders to completed
      if (i % 3 === 0) {
        db.updateOrderStatus(orderId, 'completed');
      } else if (i % 4 === 0) {
        db.updateOrderStatus(orderId, 'pending');
      }

      orderCount++;
    }

    console.log(`✓ Created ${orderCount} sample orders`);

    // Seed some payment methods (30 payment methods for various users)
    console.log('Seeding payment methods...');
    let paymentCount = 0;

    for (let i = 0; i < 30; i++) {
      const userId = randomElement(users);
      const type = randomElement(['credit_card', 'debit_card', 'paypal'] as const);
      const paymentId = `pm-seed-${Date.now()}-${i}-${randomNumber(1000, 9999)}`;

      db.addPaymentMethod(
        paymentId,
        userId,
        type,
        type !== 'paypal' ? `${randomNumber(1000, 9999)}` : undefined,
        type !== 'paypal' ? randomNumber(1, 12) : undefined,
        type !== 'paypal' ? randomNumber(2025, 2030) : undefined,
        i < 10, // First 10 are default
      );
      paymentCount++;
    }

    console.log(`✓ Created ${paymentCount} payment methods`);

    const stats = db.getDatabaseStats();
    console.log('\n=== Database Seeding Complete ===');
    console.log(`Users:    ${stats.users}`);
    console.log(`Products: ${stats.products}`);
    console.log(`Orders:   ${stats.orders}`);
    console.log(`Sessions: ${stats.sessions}`);
    console.log('=================================\n');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Auto-seed on import if running as script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
