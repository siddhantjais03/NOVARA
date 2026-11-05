import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryData } from './memoryStore.js';

/**
 * Ensures configured administrator accounts exist in MongoDB and memory fallback,
 * and that their password hashes match the current process.env.ADMIN_PASSWORD.
 */
export const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : '';
  const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';

  if (!adminEmail || !adminPassword) {
    console.error('[Admin Initialization] Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required. Admin account creation and synchronization stopped.');
    return;
  }

  console.log(`[Admin Initialization] Verifying administrator configuration for: ${adminEmail}`);

  // 1. Update In-Memory fallback store
  try {
    const memUser = memoryData.users.find(u => u.email.toLowerCase() === adminEmail);
    if (memUser) {
      memUser.passwordHash = bcrypt.hashSync(adminPassword, 10);
      memUser.role = 'admin';
    } else {
      memoryData.users.push({
        _id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: 'Novara Atelier Director',
        email: adminEmail,
        passwordHash: bcrypt.hashSync(adminPassword, 10),
        role: 'admin',
        phone: '+91 98765 43210',
        membershipTier: 'House Administrator',
        address: {
          street: '1 Via Montenapoleone',
          city: 'Milan',
          state: 'Lombardy',
          postalCode: '20121',
          country: 'Italy'
        },
        createdAt: new Date().toISOString()
      });
    }
  } catch (memErr) {
    console.warn('[Admin Init Warning - Memory]', memErr.message);
  }

  // 2. Ensure MongoDB accounts
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne({ email: adminEmail }).select('+password');

      if (!user) {
        user = await User.create({
          name: 'Novara Atelier Director',
          email: adminEmail,
          password: adminPassword, // pre('save') hook will hash with bcrypt
          role: 'admin',
          phone: '+91 98765 43210',
          membershipTier: 'House Administrator',
          address: {
            street: '1 Via Montenapoleone',
            city: 'Milan',
            state: 'Lombardy',
            postalCode: '20121',
            country: 'Italy'
          }
        });
        console.log(`[Admin Initialization] Created administrator account in MongoDB: ${adminEmail}`);
      } else {
        let needsSave = false;
        const matches = await user.matchPassword(adminPassword);

        if (!matches) {
          user.password = adminPassword; // pre('save') hook will re-hash
          needsSave = true;
          console.log(`[Admin Initialization] Updated administrator password in MongoDB for: ${adminEmail} from .env`);
        }

        if (user.role !== 'admin') {
          user.role = 'admin';
          needsSave = true;
          console.log(`[Admin Initialization] Verified administrator role for: ${adminEmail}`);
        }

        if (needsSave) {
          await user.save();
        }
      }
      console.log('[Admin Initialization] Administrator account successfully synchronized and ready.');
    } catch (dbErr) {
      console.warn(`[Admin Init Error - MongoDB] ${dbErr.message}`);
    }
  }
};

