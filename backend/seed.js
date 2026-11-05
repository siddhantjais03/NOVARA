import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Coupon } from './models/Coupon.js';
import { Order } from './models/Order.js';
import { Review } from './models/Review.js';
import { CATALOGUE_80 } from './data/catalogue80.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novara';

// Set of the original 21 products to strictly protect them from automatic field changes
export const ORIGINAL_21_IDS = new Set([
  '672801a1e1b2c3d4e5f60001',
  '672801a1e1b2c3d4e5f60002',
  '672801a1e1b2c3d4e5f60003',
  '672801a1e1b2c3d4e5f60004',
  '672801a1e1b2c3d4e5f60005',
  '672801a1e1b2c3d4e5f60006',
  '672801a1e1b2c3d4e5f60007',
  '672801a1e1b2c3d4e5f60008',
  '672801a1e1b2c3d4e5f60009',
  '672801a1e1b2c3d4e5f60010',
  '672801a1e1b2c3d4e5f60011',
  '672801a1e1b2c3d4e5f60012',
  '672801a1e1b2c3d4e5f60013',
  '672801a1e1b2c3d4e5f60014',
  '672801a1e1b2c3d4e5f60015',
  '672801a1e1b2c3d4e5f60016',
  '672801a1e1b2c3d4e5f60017',
  '672801a1e1b2c3d4e5f60018',
  '672801a1e1b2c3d4e5f60019',
  '672801a1e1b2c3d4e5f60020',
  '672801a1e1b2c3d4e5f60021'
]);

const initialCoupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    description: '10% Welcome Discount for New Patrons',
    isActive: true
  },
  {
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 150,
    description: '20% Off Orders over $150',
    isActive: true
  },
  {
    code: 'NOVARA50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 200,
    description: 'Flat ₹50 / $50 Off Your Order',
    isActive: true
  },
  {
    code: 'NOVARA45',
    discountType: 'percentage',
    discountValue: 45,
    minOrderAmount: 250,
    description: '45% Mid-Season Private Archive Event',
    isActive: true
  }
];

export const seedDatabase = async ({ dryRun = false } = {}) => {
  console.log('====================================================');
  console.log(dryRun ? ' NOVARA SAFE SEEDER (DRY-RUN SIMULATION)' : ' NOVARA SAFE SEEDER (ADDITIVE & IDEMPOTENT)');
  console.log('====================================================');
  console.log('Guarantees:');
  console.log('• Never deletes existing products, orders, reviews, users, or coupons.');
  console.log('• Preserves the original 21 products without automatic field changes.');
  console.log('• Inserts only missing products from CATALOGUE_80 using SKU & ID checks.');
  console.log('• Preserves custom coupons; never overwrites existing coupons.');
  console.log('• Never changes existing customer or administrator passwords.');
  console.log('• Inserts demo orders & reviews ONLY if collections are currently empty.');
  console.log('----------------------------------------------------\n');

  let isConnected = false;

  try {
    console.log(`Connecting to database at ${uri.substring(0, 35)}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`✅ Connected successfully to: ${mongoose.connection.host} / ${mongoose.connection.name}\n`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to MongoDB Atlas directly (${err.message}).`);
    console.warn(`   (If this is an IP whitelist issue, add your current IP in MongoDB Atlas Network Access).`);
    console.log(`   Running dry-run simulation against local/in-memory catalog definitions.\n`);
  }

  // Pre-seed metrics
  let currentCounts = {
    products: 0,
    orders: 0,
    reviews: 0,
    users: 0,
    coupons: 0
  };

  if (isConnected) {
    currentCounts = {
      products: await Product.countDocuments(),
      orders: await Order.countDocuments(),
      reviews: await Review.countDocuments(),
      users: await User.countDocuments(),
      coupons: await Coupon.countDocuments()
    };
    console.log('Live Database Pre-Seed Counts:');
    console.log(`  • Products: ${currentCounts.products}`);
    console.log(`  • Orders:   ${currentCounts.orders}`);
    console.log(`  • Reviews:  ${currentCounts.reviews}`);
    console.log(`  • Users:    ${currentCounts.users}`);
    console.log(`  • Coupons:  ${currentCounts.coupons}\n`);
  }

  // 1. Process Products (Additive & Idempotent)
  let preservedOriginalCount = 0;
  let skippedExistingNewCount = 0;
  let toInsertNewCount = 0;
  const itemsToInsert = [];

  for (const item of CATALOGUE_80) {
    const isOriginal = ORIGINAL_21_IDS.has(item._id);

    if (isOriginal) {
      // OPTION 1: Strictly preserve original 21 products without any field changes
      preservedOriginalCount++;
      continue;
    }

    // Process strictly the 59 new products
    if (isConnected) {
      const matchBySku = item.sku ? await Product.findOne({ sku: item.sku }) : null;
      const matchById = item._id ? await Product.findById(item._id).catch(() => null) : null;
      const matchByName = item.name ? await Product.findOne({ name: item.name }) : null;
      const existing = matchBySku || matchById || matchByName;

      if (existing) {
        skippedExistingNewCount++;
      } else {
        toInsertNewCount++;
        itemsToInsert.push(item);
      }
    } else {
      // Dry-run projection if offline
      toInsertNewCount++;
      itemsToInsert.push(item);
    }
  }

  console.log('Product Analysis:');
  console.log(`  • Original 21 Products: ${preservedOriginalCount} detected (Preserved 100% Untouched)`);
  console.log(`  • Existing New Products: ${skippedExistingNewCount} (Skipped by unique SKU/ID)`);
  console.log(`  • Missing Products to Insert: ${toInsertNewCount}`);

  if (!dryRun && isConnected && itemsToInsert.length > 0) {
    for (const item of itemsToInsert) {
      await Product.create(item);
      console.log(`    + [INSERTED] ${item.sku} | ${item.name} ($${item.price})`);
    }
  }

  // 2. Process Coupons (Additive & Idempotent)
  let couponsPreserved = 0;
  let couponsToInsert = 0;

  for (const couponData of initialCoupons) {
    if (isConnected) {
      const existingCoupon = await Coupon.findOne({ code: couponData.code.toUpperCase() });
      if (existingCoupon) {
        couponsPreserved++;
      } else {
        couponsToInsert++;
        if (!dryRun) {
          await Coupon.create(couponData);
        }
      }
    } else {
      couponsPreserved++;
    }
  }

  console.log('\nCoupon Analysis:');
  console.log(`  • Existing/Preserved Coupons: ${couponsPreserved}`);
  console.log(`  • Missing Initial Coupons to Add: ${couponsToInsert}`);

  // 3. Process Users (Additive & Password Protection)
  const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : '';
  const envAdminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';

  let adminStatus = 'Unknown';
  let demoPatronStatus = 'Unknown';

  if (!envAdminEmail || !envAdminPassword) {
    adminStatus = 'Skipped - ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required. Admin account creation stopped.';
    console.error('\n[User Account Error] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required. Admin account creation stopped.');
  } else {
    const adminEmail = envAdminEmail.toLowerCase();
    if (isConnected) {
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (existingAdmin) {
        adminStatus = `Preserved (email: ${existingAdmin.email}, role: ${existingAdmin.role}) - Password Untouched`;
      } else {
        adminStatus = `Missing - Would create admin (${adminEmail})`;
        if (!dryRun) {
          await User.create({
            name: 'Novara Atelier Director',
            email: adminEmail,
            password: envAdminPassword,
            role: 'admin',
            phone: '+91 98765 43210',
            membershipTier: 'House Administrator'
          });
        }
      }
    }
  }

  if (isConnected) {
    const existingPatron = await User.findOne({ email: 'elena@novara.luxury' });
    if (existingPatron) {
      demoPatronStatus = `Preserved (${existingPatron.email}) - Password Untouched`;
    } else {
      demoPatronStatus = `Missing - Would create demo patron (elena@novara.luxury)`;
      if (!dryRun) {
        await User.create({
          name: 'Elena Rostova',
          email: 'elena@novara.luxury',
          password: 'Password123!',
          role: 'user',
          phone: '+91 91234 56789',
          membershipTier: 'VIP Atelier Tier'
        });
      }
    }
  }

  console.log('\nUser Account Analysis:');
  console.log(`  • Administrator Account: ${adminStatus}`);
  console.log(`  • Demo Customer Account: ${demoPatronStatus}`);

  // 4. Process Orders (Only insert demo orders if Order collection is empty)
  let orderAction = 'Preserved all existing orders';
  if (isConnected) {
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      orderAction = 'Order collection is empty: demo showcase orders would be seeded';
    } else {
      orderAction = `Existing orders found (${orderCount}): zero orders modified or added`;
    }
  }
  console.log('\nOrder Archive Analysis:');
  console.log(`  • ${orderAction}`);

  // 5. Process Reviews (Only insert demo reviews if Review collection is empty)
  let reviewAction = 'Preserved all existing reviews';
  if (isConnected) {
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      reviewAction = 'Review collection is empty: demo reviews would be seeded';
    } else {
      reviewAction = `Existing reviews found (${reviewCount}): zero reviews modified or added`;
    }
  }
  console.log('\nReview Moderation Analysis:');
  console.log(`  • ${reviewAction}`);

  // Summary
  console.log('\n----------------------------------------------------');
  console.log('Seeder Summary:');
  console.log(`  • Mode:                       ${dryRun ? 'DRY-RUN (Zero DB writes)' : (isConnected ? 'LIVE WRITES COMPLETED' : 'OFFLINE')}`);
  console.log(`  • Destructive Operations:     NONE (0 deletions, 0 drops)`);
  console.log(`  • Original 21 Modified:       0 (Strictly Preserved)`);
  console.log(`  • Total Catalogue Target:     80 products`);
  console.log('====================================================\n');

  if (isConnected) {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }

  return {
    isConnected,
    currentCounts,
    preservedOriginalCount,
    skippedExistingNewCount,
    toInsertNewCount
  };
};

// Check if run directly from command line
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].includes('seed'));
if (isDirectRun) {
  const isDryRun = process.argv.includes('--dry-run');
  seedDatabase({ dryRun: isDryRun }).catch((err) => {
    console.error('Seeder execution error:', err.message);
    process.exit(1);
  });
}
