import { Hono } from 'hono';
import { db, user, seller, eq } from '@DeshGhuri/db';

const app = new Hono();

/**
 * POST /api/auth/check-email
 * Checks if an email is already in use by any account type (user, seller, admin)
 * Returns { available: boolean, accountType?: string }
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({
        available: false,
        error: 'Invalid email format'
      }, 400);
    }

    // Check if email exists in user table (covers all roles: customer, admin, super_admin)
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      return c.json({
        available: false,
        accountType: 'user',
        message: 'This email is already registered. Each email can only be used for one account type. Please sign in or use a different email.',
      });
    }

    // Check if email exists in seller table (seller-only accounts)
    const existingSeller = await db.query.seller.findFirst({
      where: eq(seller.email, email),
    });

    if (existingSeller) {
      return c.json({
        available: false,
        accountType: 'seller',
        message: 'This email is already registered as a seller. Each email can only be used for one account type. Please sign in or use a different email.',
      });
    }

    // Email is available
    return c.json({
      available: true,
      message: 'Email is available',
    });
  } catch (error) {
    console.error('Error checking email availability:', error);
    return c.json({ error: 'Failed to check email availability' }, 500);
  }
});

export default app;
