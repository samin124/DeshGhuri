# Epic 1: User Registration & Authentication

This branch implements **Epic 1 – User Registration & Authentication**, focusing on secure and user-friendly account creation and access management.

---

## 📌 Scope of This Epic

This epic covers the **core authentication flows** required for MVP:

- Email-based user registration
- Social login (Google)
- Password reset and recovery
- Email verification and account activation


These features are intentionally excluded to keep the MVP lightweight and focused.

---

## ✅ Included User Stories

### **US-1.1: Email Registration**
**As a guest**, I want to register with email so I can create an account.

**Acceptance Criteria**
- Email format validation
- Strong password enforcement
- Verification email sent within **2 minutes**
- Account activated only after verification

**Edge Cases**
- Duplicate email blocked
- Invalid email format
- Verification link expires after **24 hours**

---

### **US-1.3: Social Registration (Google)**
**As a guest**, I want to sign up using Google or Facebook for faster onboarding.

**Acceptance Criteria**
- OAuth flow completes within **10 seconds**
- Profile data imported automatically
- Email marked as pre-verified

**Edge Cases**
- OAuth permission denied
- Email already exists in the system

---

### **US-1.4: Password Reset**
**As a user**, I want to reset my password so I can recover my account.

**Acceptance Criteria**
- Password reset link sent within **2 minutes**
- Link valid for **1 hour**
- Reset link is single-use only
- New password must meet security rules

**Edge Cases**
- Email not found
- Reset link expired
- Reset link already used

---

## 🧪 Status
- **Current Stage:** Testing / QA
- **Branch Type:** Feature / Epic
- **MVP Ready:** ✅ Yes (authentication core complete)

---

## 🔀 Branch Information
- **Branch Name:** `epic/user-registration-auth`
- **Base Branch:** `main`
- **Related Epics:** Authentication, User Management

---

## 🚀 Notes
- This epic establishes the foundation for secure user access.
- Advanced security features (OTP, 2FA) will be introduced in a 

---

## 👥 Contributors
- Backend: Auth API, validation, email flows
- Frontend: Registration UI, OAuth integration
- QA: Validation, edge-case testing


