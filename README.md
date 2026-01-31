# Seller Onboarding & Verification

This branch implements the **Seller Onboarding and Verification flow**, enabling sellers to register, submit verification documents, receive approval, and configure payout information before listing on the platform.

The flow ensures trust, compliance, and secure onboarding of sellers.

---

## Scope

This epic includes:

- Seller registration and onboarding flow
- Upload and submission of verification documents
- Admin review and approval workflow
- Seller verification status tracking
- Bank account setup for payouts
- Verified seller badge display

---

## Features Implemented

### Seller Registration
- Seller registration form
- Business and category information capture
- Draft saving when onboarding is incomplete

### Document Verification
- Upload of required documents (License, NID, etc.)
- File format validation
- Submission confirmation after upload
- Re-upload requested when documents are unreadable

### Admin Review Workflow
- Seller application review queue
- Approve or reject applications
- Request additional documents when required
- Suspicious submissions can be flagged for review

### Verification Status Updates
- Sellers can track verification progress
- Email notifications sent on status updates

### Bank Account Setup
- Bank details submission form
- Micro-deposit verification flow
- Retry mechanism if verification fails

### Verified Seller Badge
- Badge displayed on seller profile
- Badge displayed on listings for customer trust

---

## Status
- Stage: **Testing / QA**
- Type: **Feature / Epic**
- MVP Ready: ✅

---

## Branch Info
- Branch: `epic/seller-onboarding`
- Base: `main`

