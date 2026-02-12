# How to Change Admin Password

## Option 1: Using "Forgot Password" Link ✅ (Recommended)

**Just implemented!** The admin login now has a "Forgot Password" link.

### Steps:

1. Go to: `http://localhost:3001/admin`
2. Enter your email in the email field
3. Click "**Forgot password?**" link (next to the password field)
4. Check your email for the reset link
5. Click the link in your email
6. Enter your new password on the reset page
7. Submit → You'll be redirected to login

**Screenshot:**

```
[Administrator Email field]
Password                    Forgot password? ← Click here
[Password field]
```

### Files Created:

- `/apps/web/src/routes/admin/index.tsx` - Added forgot password link
- `/apps/web/src/routes/admin/reset-password.tsx` - Password reset page

---

## Option 2: Direct Database Update (Quick Fix)

If you need to change the password immediately without email:

### Using SQL:

```sql
-- Update password for admin user
-- First, generate a hashed password using bcrypt or Better Auth

-- Example: Change password to 'NewPassword123'
-- Note: You'll need to hash the password first using Better Auth's hashing
-- This is a simplified example - actual implementation needs proper hashing
UPDATE "user"
SET password_hash = 'your_hashed_password_here'
WHERE email = 'abxvein2001@gmail.com';
```

### Using Script (Better):

Create `update-admin-password.ts`:

```typescript
import { db } from '@DeshGhuri/db';
import { user } from '@DeshGhuri/db/schema';
import { eq } from '@DeshGhuri/db';
import { hash } from '@node-rs/argon2';

const ADMIN_EMAIL = 'abxvein2001@gmail.com';
const NEW_PASSWORD = 'YourNewPassword123';

async function updatePassword() {
  // Hash the password
  const hashedPassword = await hash(NEW_PASSWORD, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Update in database
  await db.update(user).set({ password: hashedPassword }).where(eq(user.email, ADMIN_EMAIL));

  console.log('✅ Password updated successfully!');
  console.log('Email:', ADMIN_EMAIL);
  console.log('New Password:', NEW_PASSWORD);
}

updatePassword();
```

Run: `cd apps/server && bun run ../../update-admin-password.ts`

---

## Option 3: Add Password Change in Admin Settings (Future)

Add a "Change Password" section in the admin dashboard settings page.

### Implementation:

1. Create `/admin/settings` page
2. Add "Change Password" form with:
   - Current Password field
   - New Password field
   - Confirm Password field
3. Validate current password before changing
4. Update password in database

---

## How Password Reset Works

### Email Flow:

```
1. User clicks "Forgot password?" on /admin
   ↓
2. Better Auth sends email with reset token
   ↓
3. Email contains link: /admin/reset-password?token=xxx
   ↓
4. User clicks link → Opens reset password page
   ↓
5. User enters new password
   ↓
6. Better Auth validates token and updates password
   ↓
7. Redirects to /admin login page
```

### Token Security:

- Reset tokens expire after 1 hour (Better Auth default)
- Tokens are single-use (can't be reused)
- Tokens are stored encrypted in database

---

## Testing Password Reset

### Test the Flow:

1. **Open admin login:**

   ```
   http://localhost:3001/admin
   ```

2. **Enter your email:**

   ```
   abxvein2001@gmail.com
   ```

3. **Click "Forgot password?"**
   - Should show success toast
   - Check your email inbox

4. **Click link in email:**
   - Opens: `/admin/reset-password?token=...`
   - Shows password reset form

5. **Enter new password:**
   - Password (min 8 characters)
   - Confirm password

6. **Submit:**
   - Success → Redirects to /admin
   - Login with new password

---

## Troubleshooting

### Issue: Not receiving reset email

**Cause:** Email configuration might be missing
**Check:**

```bash
# Check email settings in .env
grep EMAIL apps/server/.env
```

**Should have:**

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@deshghuri.com
```

### Issue: Reset link not working

**Cause:** Token might be expired or invalid
**Solution:**

- Request a new reset link
- Tokens expire after 1 hour

### Issue: "Forgot password?" link not showing

**Cause:** Page needs refresh after code update
**Solution:**

```bash
# Restart dev server
bun run dev
```

---

## Password Requirements

- **Minimum length:** 8 characters
- **Recommended:** Use a mix of:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters

**Strong examples:**

- `AdminPass2024!`
- `Secure#Admin123`
- `MyStr0ng!P@ssw0rd`

---

## Security Best Practices

✅ **DO:**

- Use strong, unique passwords
- Change password regularly
- Use a password manager
- Enable 2FA (when available)
- Use Google OAuth for easier management

❌ **DON'T:**

- Share admin passwords
- Use same password as other accounts
- Write passwords in plain text
- Store passwords in code/config files
- Use simple passwords like "password123"

---

## Quick Reference

| Method               | Speed  | Requires Email | Complexity |
| -------------------- | ------ | -------------- | ---------- |
| Forgot Password Link | Medium | Yes            | Easy       |
| Direct DB Update     | Fast   | No             | Hard       |
| Admin Settings       | Medium | No             | Medium     |

**Recommended:** Use "Forgot Password" link for normal password changes. It's secure, tracks changes, and sends confirmation emails.

---

**Last Updated:** 2026-02-06
**Related:** ADMIN_SYSTEM.md, ADMIN_LOGIN_IMPLEMENTATION.md
