# Seller Onboarding User Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                                 │
│                                                                  │
│  [Navbar: "Become a Seller" Button]                            │
│  [Footer: "For Sellers" → "Become a Seller" Link]              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SELLER REGISTRATION                            │
│                  (/seller/register)                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Hero Section                                          │   │
│  │  - "Become a DeshGhuri Seller"                        │   │
│  │  - Value proposition                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Benefits Grid                                         │   │
│  │  [Reach Customers] [Secure Payments]                  │   │
│  │  [Easy Management] [Build Brand]                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Choose Business Type:                                 │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ 🏢 Travel Agency                           │ ───┐ │   │
│  │  │ Tour packages, travel services, itineraries  │   │ │   │
│  │  └──────────────────────────────────────────────┘   │ │   │
│  │                                                      │ │   │
│  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │ 🏨 Hotel / Resort                          │ ───┤ │   │
│  │  │ Accommodation, rooms, hospitality services   │   │ │   │
│  │  └──────────────────────────────────────────────┘   │ │   │
│  │                                                      │ │   │
│  │  ┌──────────────────────────────────────────────┐   │ │   │
│  │  │ 🗺️  Tour Operator                          │ ───┘ │   │
│  │  │ Unique experiences, activities, guided tours │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Requirements Checklist                                │   │
│  │  ✓ Trade License                                       │   │
│  │  ✓ NID/Passport                                        │   │
│  │  ✓ TIN Certificate                                     │   │
│  │  ✓ Bank Account                                        │   │
│  │  ✓ Property/Tour License                               │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               MULTI-STEP ONBOARDING WIZARD                       │
│                 (/seller/onboarding)                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Progress Steps:                                         │  │
│  │  ● ──── ○ ──── ○ ──── ○                                │  │
│  │  1      2      3      4                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║                   STEP 1: BUSINESS INFO                   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│  │                                                              │
│  │  Business Name: [________________________]                  │
│  │  Category: [Travel Agency ▾]                                │
│  │  Registration #: [________________________]                 │
│  │                                                              │
│  │  📍 Business Address                                        │
│  │  Street: [_____________________________________]            │
│  │  City: [____________]  District: [Dhaka ▾]                 │
│  │  Postal Code: [______]                                      │
│  │                                                              │
│  │  📞 Contact Information                                     │
│  │  Phone: [____________]  Email: [________________]           │
│  │                                                              │
│  │  Description: [                                          ]  │
│  │                [                                          ]  │
│  │                                                              │
│  │  [Previous]                  Step 1 of 4         [Next] ─┐  │
│  └──────────────────────────────────────────────────────────│──┘
│                                                               │
│                                                               ▼
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║                STEP 2: UPLOAD DOCUMENTS                   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│  │                                                              │
│  │  📄 Trade License *                                         │
│  │  ┌────────────────────────────────────────────┐            │
│  │  │  📤  Drop your file here or browse         │            │
│  │  │      PDF, JPG, PNG - Max 25MB              │            │
│  │  └────────────────────────────────────────────┘            │
│  │                                                              │
│  │  📄 National ID or Passport *                               │
│  │  ┌────────────────────────────────────────────┐            │
│  │  │  ✓ national_id.jpg - 1.5MB                 │            │
│  │  │  ✓ File ready to upload                    │            │
│  │  └────────────────────────────────────────────┘            │
│  │                                                              │
│  │  📄 TIN Certificate                                         │
│  │  📄 Property Documents * (for hotels)                       │
│  │  📄 Tour License * (for tour operators)                     │
│  │                                                              │
│  │  [Previous]                  Step 2 of 4         [Next] ─┐  │
│  └──────────────────────────────────────────────────────────│──┘
│                                                               │
│                                                               ▼
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║                  STEP 3: BANK ACCOUNT                     ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│  │                                                              │
│  │  Bank Name: [Select your bank ▾]                            │
│  │  Branch Name: [________________________]                    │
│  │                                                              │
│  │  Account Holder: [________________________]                 │
│  │  Account Type: [Savings Account ▾]                          │
│  │  Account Number: [________________________]                 │
│  │  Routing Number: [________________________] (optional)      │
│  │                                                              │
│  │  ℹ️ Micro-deposit verification:                            │
│  │    1. We'll send BDT 1-5 to your account                   │
│  │    2. Confirm the amount via SMS                            │
│  │    3. Verification completes in 24 hours                    │
│  │                                                              │
│  │  [Previous]                  Step 3 of 4         [Next] ─┐  │
│  └──────────────────────────────────────────────────────────│──┘
│                                                               │
│                                                               ▼
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║                 STEP 4: REVIEW & SUBMIT                   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│  │                                                              │
│  │  ┌────────────────────────────────────────┐                │
│  │  │ 🏢 Business Information                │                │
│  │  │                                        │                │
│  │  │ Business Name: ABC Travel Agency      │                │
│  │  │ Category: Travel Agency                │                │
│  │  │ Registration: TR-2026-12345            │                │
│  │  │ Address: 123 Gulshan Avenue, Dhaka    │                │
│  │  │ Contact: +880 1700-000000              │                │
│  │  └────────────────────────────────────────┘                │
│  │                                                              │
│  │  ┌────────────────────────────────────────┐                │
│  │  │ 📄 Uploaded Documents                  │                │
│  │  │                                        │                │
│  │  │ ✓ trade_license.pdf - 2.0 MB  [Ready] │                │
│  │  │ ✓ national_id.jpg - 1.5 MB    [Ready] │                │
│  │  │ ✓ tin_certificate.pdf - 1.0 MB [Ready] │                │
│  │  └────────────────────────────────────────┘                │
│  │                                                              │
│  │  ┌────────────────────────────────────────┐                │
│  │  │ 💳 Bank Account                        │                │
│  │  │                                        │                │
│  │  │ Bank: Dutch-Bangla Bank                │                │
│  │  │ Branch: Gulshan Branch                 │                │
│  │  │ Holder: John Doe                       │                │
│  │  │ Account: ****1234                      │                │
│  │  └────────────────────────────────────────┘                │
│  │                                                              │
│  │  ✓ All information is accurate                              │
│  │  ✓ I agree to Terms of Service                             │
│  │  ✓ Verification may take 24-48 hours                       │
│  │                                                              │
│  │  [Previous]         Step 4 of 4    [Submit Application] ─┐ │
│  └──────────────────────────────────────────────────────────│─┘
│                                                               │
└───────────────────────────────────────────────────────────────┘
                                                                │
                                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 VERIFICATION STATUS PAGE                         │
│              (/seller/verification-status)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🔄 UNDER REVIEW                                       │   │
│  │  Our team is currently reviewing your documents        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────┐  ┌────────────────────────────┐  │
│  │  📄 Document Status     │  │  📅 Timeline              │  │
│  │                         │  │                            │  │
│  │  Trade License          │  │  ● Application submitted   │  │
│  │  ✓ Approved             │  │    Jan 25, 10:00 AM       │  │
│  │                         │  │                            │  │
│  │  National ID            │  │  ● Documents under review  │  │
│  │  ✓ Approved             │  │    Jan 26, 9:00 AM        │  │
│  │                         │  │                            │  │
│  │  TIN Certificate        │  │                            │  │
│  │  ⏳ Pending             │  │                            │  │
│  │                         │  │  What's Next?              │  │
│  │                         │  │  • Waiting for review      │  │
│  │                         │  │  • Email notification      │  │
│  │                         │  │  • Est. 12-24 hours        │  │
│  └─────────────────────────┘  └────────────────────────────┘  │
│                                                                  │
│  [📧 Contact Support]                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    (Status Updates via Email)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ✅ VERIFICATION APPROVED                         │
│                                                                  │
│  Congratulations! Your seller account has been verified.        │
│                                                                  │
│  [Go to Seller Dashboard] ──────────────────────────┐           │
└─────────────────────────────────────────────────────│───────────┘
                                                       │
                                                       ▼
                                          ┌────────────────────┐
                                          │  SELLER DASHBOARD  │
                                          │    (Epic 13)       │
                                          └────────────────────┘
```

## Status Flow States

```
┌──────────┐
│ PENDING  │  →  Application submitted, waiting for review
└──────────┘
     │
     ▼
┌────────────┐
│ IN-REVIEW  │  →  Documents being reviewed by team
└────────────┘
     │
     ├─────────────┐
     │             │
     ▼             ▼
┌──────────┐  ┌────────────┐
│ APPROVED │  │  REJECTED  │  →  Application declined
└──────────┘  └────────────┘
     │             │
     │             ▼
     │        ┌────────────┐
     │        │ INCOMPLETE │  →  Needs more documents
     │        └────────────┘
     │             │
     │             └──────────────┐
     │                            │
     ▼                            ▼
┌──────────────────┐      ┌────────────┐
│ SELLER DASHBOARD │  ←── │ RESUBMIT   │
│    (Epic 13)     │      └────────────┘
└──────────────────┘
```

## Mobile vs Desktop Experience

### Mobile (< 768px)
- Stacked single-column layout
- Full-width form fields
- Collapsible progress steps (icons only)
- Slide-up mobile menu
- Touch-optimized file upload
- Bottom navigation buttons

### Desktop (>= 1024px)
- Multi-column form layout
- Horizontal progress indicator with labels
- Sidebar layout for status page
- Inline navigation
- Drag-and-drop file upload
- Side-by-side buttons

## Key Interactions

### 1. Category Selection
**Location**: Seller Registration Page
- Click on category card
- Navigates to onboarding with pre-selected category
- Affects required documents in Step 2

### 2. Form Navigation
**Location**: Onboarding Wizard
- "Next" button: Advances to next step
- "Previous" button: Goes to previous step
- Progress indicator: Shows current step
- Form state: Persists across navigation

### 3. File Upload
**Location**: Step 2 - Documents
- **Desktop**: Drag & drop or click to browse
- **Mobile**: Tap to open file picker
- Shows preview for images
- Displays file info (name, size, status)
- Remove button to delete uploaded file

### 4. Form Submission
**Location**: Step 4 - Review
- Review all entered information
- "Submit Application" button
- Loading state during submission
- Redirect to verification status page

### 5. Status Tracking
**Location**: Verification Status Page
- Real-time status display
- Individual document status
- Verification timeline
- Action buttons based on status

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | 320px - 767px | Single column, stacked cards |
| Tablet | 768px - 1023px | 2-column grids, side-by-side forms |
| Desktop | 1024px+ | Multi-column, sidebar layouts |
| Large | 1280px+ | Wider max-width containers |

## Color-Coded Status Indicators

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| Pending | Yellow | ⏳ | Waiting for review |
| In Review | Blue | 🔄 | Being reviewed |
| Approved | Green | ✓ | Verified and approved |
| Rejected | Red | ✗ | Not approved |
| Incomplete | Orange | ⚠️ | More info needed |

---

**Note**: This flow represents Epic 11 only. Epic 13 (Seller Dashboard) and Epic 14 (Admin Panel) will be implemented separately.
