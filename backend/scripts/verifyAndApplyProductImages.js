import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

// Exact candidate image updates for the 59 new products
export const NEW_59_IMAGE_UPDATES = [
  // ACCESSORIES (10)
  {
    sku: 'NOV-ACC-006',
    image: 'https://plus.unsplash.com/premium_photo-1726769202190-ad2a3f2f360b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1671467857784-73e69ed7a02e?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-007',
    image: 'https://images.unsplash.com/photo-1722635941018-a9e7de0a5b1b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1672680441245-fcd192661cb9?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-008',
    image: 'https://images.unsplash.com/photo-1779167326965-eb7c6bcc4062?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-009',
    image: 'https://images.unsplash.com/photo-1630659115266-26d2ce96ed6e?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1524420249312-30219a878dbc?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-010',
    image: 'https://plus.unsplash.com/premium_photo-1671641737519-a69a7d324ce6?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1678834778658-9862d9987dd3?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-011',
    image: 'https://images.unsplash.com/photo-1617118602199-d3c05ae37ed8?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1683147713962-36b290586177?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-012',
    image: 'https://plus.unsplash.com/premium_photo-1709033404514-c3953af680b4?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1671641737519-841d15b5211f?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-013',
    image: 'https://images.unsplash.com/photo-1533462506003-13c20d204b58?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1723924810262-c67a0950f311?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-014',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1766998193619-d1da81c8f608?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-ACC-015',
    image: 'https://images.unsplash.com/photo-1614330316567-11d8e572db16?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1614267118647-20c5ffa6a6e4?auto=format&fit=crop&w=800&q=80'
  },

  // FOOTWEAR (12)
  {
    sku: 'NOV-FOT-004',
    image: 'https://images.unsplash.com/photo-1616406432452-07bc5938759d?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1670984281009-863453504c52?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-005',
    image: 'https://images.unsplash.com/photo-1551489186-ccb95a1ea6a3?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1553145478-5b0fee29e4fc?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-006',
    image: 'https://plus.unsplash.com/premium_photo-1711051513016-72baa1035293?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1761726065663-6e550c25a6ef?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-007',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-008',
    image: 'https://images.unsplash.com/photo-1623115893482-5bdd07191e7b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1677002240252-af3f88114efc?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-009',
    image: 'https://images.unsplash.com/photo-1784822041097-e0f9e7246e94?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-010',
    image: 'https://images.unsplash.com/photo-1785357693735-27bad0bdf84a?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-011',
    image: 'https://images.unsplash.com/photo-1774200449073-14837773dcf2?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-012',
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1670984281009-863453504c52?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-013',
    image: 'https://images.unsplash.com/photo-1732708862072-d2f9e578e531?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1792271057916-defd0178f4a2?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-014',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-FOT-015',
    image: 'https://images.unsplash.com/photo-1777987601423-f350ac29b3e9?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1777987601677-3059be0e1388?auto=format&fit=crop&w=800&q=80'
  },

  // OUTERWEAR (12)
  {
    sku: 'NOV-OUT-004',
    image: 'https://plus.unsplash.com/premium_photo-1674719144570-0728faf14f96?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1671030274122-b6ac34f87b8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-005',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1700748911489-0552c576f274?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-006',
    image: 'https://images.unsplash.com/photo-1677123718817-5a203404d638?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-007',
    image: 'https://images.unsplash.com/photo-1615233500379-44bceeb78d39?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-008',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1792244210487-e7f7a044493c?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-009',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1467493330285-2fe6a9f97483?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-010',
    image: 'https://images.unsplash.com/photo-1765099271937-b56f29e7679f?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-011',
    image: 'https://plus.unsplash.com/premium_photo-1670044658223-60a0b43f05d4?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1675799719530-57e65cef0f2e?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-012',
    image: 'https://images.unsplash.com/photo-1553717625-3bbeb1e2f5c2?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-013',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1674747087104-516a4d6d316c?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-014',
    image: 'https://images.unsplash.com/photo-1772678595079-0431384642a6?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1683134258556-eb0958a9de71?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-OUT-015',
    image: 'https://plus.unsplash.com/premium_photo-1674747087104-516a4d6d316c?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'
  },

  // CLOTHING (9)
  {
    sku: 'NOV-CLO-007',
    image: 'https://plus.unsplash.com/premium_photo-1674507926744-c05e1ac983ff?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1683121523671-9617aba661d7?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-008',
    image: 'https://images.unsplash.com/photo-1793395779500-086ee187d0a4?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1773574488220-569921a63d39?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-009',
    image: 'https://images.unsplash.com/photo-1603906650843-b58e94d9df4d?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1673125287084-e90996bad505?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-010',
    image: 'https://plus.unsplash.com/premium_photo-1673977134363-c86a9d5dcafa?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1675186049406-3fabe5f387eb?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-011',
    image: 'https://plus.unsplash.com/premium_photo-1690034978688-dbdd03eab792?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-012',
    image: 'https://plus.unsplash.com/premium_photo-1678218594563-9fe0d16c6838?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-013',
    image: 'https://images.unsplash.com/photo-1602415036709-b539a81a7bfd?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1788999459421-8ec6093cc486?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-014',
    image: 'https://plus.unsplash.com/premium_photo-1695339146296-ab03c0e6ae50?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-CLO-015',
    image: 'https://plus.unsplash.com/premium_photo-1689371952452-c88c72464115?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1689977493146-ed929d07d97e?auto=format&fit=crop&w=800&q=80'
  },

  // BAGS (7)
  {
    sku: 'NOV-BAG-004',
    image: 'https://plus.unsplash.com/premium_photo-1671028547420-a541b5a1243e?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1723914156298-f0a858f6b1ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-005',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1723826753083-2309f7203ab1?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-006',
    image: 'https://images.unsplash.com/photo-1590739225287-bd31519780c3?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1678739395192-bfdd13322d34?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-007',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-008',
    image: 'https://images.unsplash.com/photo-1523469202498-5aca1ea1184b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-009',
    image: 'https://images.unsplash.com/photo-1779088470584-f6a5eb7c14a2?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1723924907666-94cd23c21cfc?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-BAG-010',
    image: 'https://plus.unsplash.com/premium_photo-1724862978805-e9d41f90c815?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1672829371769-bcff266023a4?auto=format&fit=crop&w=800&q=80'
  },

  // WATCHES (9)
  {
    sku: 'NOV-WAT-002',
    image: 'https://plus.unsplash.com/premium_photo-1723561230205-3a8f566f8ba9?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1779363290535-2a027a2a1751?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-003',
    image: 'https://images.unsplash.com/photo-1776741929151-b3acce29f513?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1508962061361-bcb4d4c477f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-004',
    image: 'https://images.unsplash.com/photo-1772949400107-f35fd026ab77?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1772793384358-27b46e587bee?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-005',
    image: 'https://images.unsplash.com/photo-1508962061361-bcb4d4c477f8?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1636397264560-427e544ea531?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-006',
    image: 'https://plus.unsplash.com/premium_photo-1682097578070-901d10cabc5b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1609335464321-0152690ff3dd?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-007',
    image: 'https://plus.unsplash.com/premium_photo-1661344288476-72332d6978d1?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://plus.unsplash.com/premium_photo-1682125779534-76c5debea767?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-008',
    image: 'https://images.unsplash.com/photo-1584378687113-8739c327634c?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1588748512649-d4b00cadf9c8?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-009',
    image: 'https://images.unsplash.com/photo-1541778480-fc1752bbc2a9?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1575077659190-fa71c1cdc56d?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'NOV-WAT-010',
    image: 'https://images.unsplash.com/photo-1731877762476-ab0c4cc01b2b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1646738003298-d99f1240862c?auto=format&fit=crop&w=800&q=80'
  }
];

function checkUrlStatus(url) {
  return new Promise((resolve) => {
    https
      .get(url, { method: 'HEAD' }, (res) => {
        resolve({ url, status: res.statusCode });
      })
      .on('error', (err) => {
        resolve({ url, status: 500, error: err.message });
      });
  });
}

async function verifyAndApply() {
  console.log('================================================================');
  console.log(' NOVARA PRODUCT IMAGE AUDIT & TARGETED UPDATE');
  console.log('================================================================');
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log('✅ Connected to MongoDB Atlas:', db.databaseName);

  // 1. Fetch 21 original products
  const orig21Names = [
    'Sovereign Cashmere Double-Breasted Overcoat',
    'Aura Silk Satin Bias-Cut Slip Gown',
    'Lumina Sculpted Calfskin Shoulder Bag',
    'Vanguard Italian Wool Relaxed Blazer',
    'Atelier Lug-Sole Leather Chelsea Boot',
    'Chronos Automatic Minimalist Watch',
    'Elysian Chunky Alpaca Knit Turtleneck',
    'Metropolis Geometric Acetate Sunglasses',
    'Palladium Ribbed Merino Knit Polo',
    'Verona Micro Structured Leather Crossbody',
    'Zephyr Waterproof Technical Parka',
    'Serena Sculptural Sterling Silver Cuff',
    'Aurelius Double-Breasted Wool Trench',
    'Nova Minimalist Leather Court Sneaker',
    'Celeste Pleated Silk Chiffon Midi Skirt',
    'Tiberius Relaxed Pleated Wool Trousers',
    'Solis 18k Gold Geometric Ring',
    'Palazzo Structured Leather Weekend Duffle',
    'Veritas Heavyweight Cashmere Beanie & Scarf Set',
    'Corsica Artisanal Strappy Leather Sandal',
    'Monolith Architectural Silver Pendant'
  ];

  const allAtlasProducts = await db.collection('products').find({}).toArray();
  const orig21Products = allAtlasProducts.filter((p) => orig21Names.includes(p.name));
  console.log(`Original 21 products identified in Atlas: ${orig21Products.length} / 21`);

  const orig21Images = new Set();
  orig21Products.forEach((p) => {
    if (p.image) orig21Images.add(p.image);
    if (p.hoverImage) orig21Images.add(p.hoverImage);
  });
  console.log(`Total image URLs utilized by original 21 products: ${orig21Images.size}`);

  // 2. Validate all URLs in NEW_59_IMAGE_UPDATES
  const allCandidateUrls = new Set();
  NEW_59_IMAGE_UPDATES.forEach((item) => {
    if (item.image) allCandidateUrls.add(item.image);
    if (item.hoverImage) allCandidateUrls.add(item.hoverImage);
  });

  console.log(`Total distinct candidate URLs to verify: ${allCandidateUrls.size}`);
  console.log('Verifying HTTP 200 for all candidate URLs in parallel...');

  const urlList = Array.from(allCandidateUrls);
  const checkResults = await Promise.all(urlList.map((u) => checkUrlStatus(u)));
  const failedUrls = checkResults.filter((r) => r.status !== 200);

  if (failedUrls.length > 0) {
    console.error(`❌ HTTP Check Failed for ${failedUrls.length} URLs:`);
    failedUrls.forEach((f) => console.error(`  - ${f.status} : ${f.url}`));
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`✅ All ${checkResults.length} candidate URLs returned HTTP 200 OK.`);

  // 3. Ensure NO candidate URL collides with the original 21 images
  const collisionWithOrig = urlList.filter((u) => orig21Images.has(u));
  if (collisionWithOrig.length > 0) {
    console.error(`❌ Collision detected: ${collisionWithOrig.length} URLs belong to original 21:`);
    collisionWithOrig.forEach((c) => console.error(`  - ${c}`));
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('✅ Zero collisions with original 21 images.');

  // 4. Ensure uniqueness of main images across all 59 products
  const mainImages = NEW_59_IMAGE_UPDATES.map((item) => item.image);
  const uniqueMainImages = new Set(mainImages);
  console.log(`Main Image Uniqueness: ${uniqueMainImages.size} / 59`);
  if (uniqueMainImages.size !== 59) {
    console.error(`❌ Main image duplicate detected across the 59 products! Unique count: ${uniqueMainImages.size}`);
    // find duplicates
    const counts = {};
    mainImages.forEach((m) => (counts[m] = (counts[m] || 0) + 1));
    Object.entries(counts).filter(([_, c]) => c > 1).forEach(([url, count]) => {
      console.error(`  - Duplicated ${count}x: ${url}`);
    });
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('✅ All 59 new products have 100% unique main images.');

  // 5. Apply targeted MongoDB updates by SKU
  console.log('\nApplying targeted MongoDB updates to image and hoverImage fields only...');
  let updatedCount = 0;
  for (const update of NEW_59_IMAGE_UPDATES) {
    const res = await Product.updateOne(
      { sku: update.sku },
      {
        $set: {
          image: update.image,
          hoverImage: update.hoverImage
        }
      }
    );
    if (res.matchedCount === 1) {
      updatedCount++;
    } else {
      console.warn(`⚠️ Warning: SKU ${update.sku} not matched in MongoDB!`);
    }
  }
  console.log(`✅ Successfully updated ${updatedCount} / 59 products in MongoDB Atlas.\n`);

  // 6. Post-update verification
  const finalProducts = await db.collection('products').find({}).toArray();
  console.log(`Total products in Atlas after update: ${finalProducts.length} (Expected: 80)`);

  // Verify original 21 products are completely unchanged
  let origIntact = 0;
  orig21Products.forEach((orig) => {
    const curr = finalProducts.find((p) => String(p._id) === String(orig._id));
    if (
      curr &&
      curr.name === orig.name &&
      curr.category === orig.category &&
      curr.price === orig.price &&
      curr.image === orig.image &&
      curr.hoverImage === orig.hoverImage
    ) {
      origIntact++;
    } else {
      console.error(`❌ Original product was altered: ${orig.name}`);
    }
  });
  console.log(`Original 21 Products Integrity: ${origIntact} / 21 preserved 100% unchanged.`);

  await mongoose.disconnect();
  console.log('Disconnected safely from MongoDB Atlas.');
  console.log('================================================================');
}

verifyAndApply().catch((err) => {
  console.error('❌ Execution error:', err);
  process.exit(1);
});
