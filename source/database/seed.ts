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
];
const bookProducts = [
  'Programming Guide',
  'Design Patterns',
  'Clean Code',
  'JavaScript Handbook',
  'TypeScript Basics',
  'Web Development',
  'Database Design',
  'API Development',
  'DevOps Practices',
  'Agile Methods',
  'Software Architecture',
  'Testing Strategies',
  'Security Best Practices',
  'Cloud Computing',
  'Microservices',
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

    // Seed products (75 products)
    console.log('Seeding products...');
    const products: number[] = [];

    // Electronics (25 products)
    for (let i = 0; i < 25; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(electronicProducts);
      const product = db.createProduct(
        `${adjective} ${productName}`,
        parseFloat((randomNumber(1000, 50000) / 100).toFixed(2)),
        'Electronics',
        `High-quality ${productName.toLowerCase()} with advanced features`,
        randomNumber(50, 300),
        `https://example.com/images/electronics/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Books (25 products)
    for (let i = 0; i < 25; i++) {
      const productName = randomElement(bookProducts);
      const product = db.createProduct(
        productName,
        parseFloat((randomNumber(1999, 5999) / 100).toFixed(2)),
        'Books',
        `Comprehensive guide to ${productName.toLowerCase()}`,
        randomNumber(30, 200),
        `https://example.com/images/books/${i + 1}.jpg`,
      );
      products.push(product.id);
    }

    // Clothing (25 products)
    for (let i = 0; i < 25; i++) {
      const adjective = randomElement(productAdjectives);
      const productName = randomElement(clothingProducts);
      const product = db.createProduct(
        `${adjective} ${productName}`,
        parseFloat((randomNumber(1499, 12999) / 100).toFixed(2)),
        'Clothing',
        `Comfortable and stylish ${productName.toLowerCase()}`,
        randomNumber(40, 250),
        `https://example.com/images/clothing/${i + 1}.jpg`,
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
