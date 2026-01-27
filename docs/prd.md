# Product Requirements Document (PRD)

# **DeshGhuri**

## Multi-Vendor Travel Marketplace with Automated Booking and Payment Security

---

---

### **Table of Contents**

[1.Executive Summary](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[2. User Roles & Permissions](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[3. Homepage & Website Sections](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[4. Search & Discovery](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[5. Listing Details & Booking Panel](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[6. Booking Engine (Hold → Pay → Confirmed)](https://www.notion.so/2ee4b3597e9d80c7b1a9f23c8309eafd?pvs=21)

[7. Escrow + Proof-Based Confirmation](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[8. Group Booking Discounts](https://www.notion.so/2ee4b3597e9d80c7b1a9f23c8309eafd?pvs=21)

[9. Price Lock + Refund Guarantee](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[10. Split Payment](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[11. Seller Portal](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[13. Notifications](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[15. Edge Cases / Exceptions](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[16. User Stories + Sprint Points (Fibonacci)](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[17. Success Metrics](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

[Appendices](https://www.notion.so/DeshGhuri_PRD_v2-2ee7b2328783807d8757d9af4a11f27b?pvs=21)

# 1. Product Summary

## 1.1 Product Overview

DeshGhuri is a **multi-vendor, service-based eCommerce marketplace** that enables travelers to **discover, book, and pay for travel services-i**ncluding hotels, tour packages, and experiences from verified agencies, hotels, and tour operators. The platform **automates the entire booking lifecycle**, from availability-based pricing and instant checkout to escrow-secured payments and conditional fund release.

Designed for both **individual and group travelers**, DeshGhuri introduces built-in **group booking, split payments, and price-lock protection**, removing coordination friction and price uncertainty. Payments are securely held in escrow and **automatically released after service verification**, ensuring trust, faster settlements for sellers, and a transparent booking experience for customers.

## 1.2 Product Vision

DeshGhuri’s vision is to **standardize trust and reliability in online travel bookings** through automation rather than human mediation. The platform is built on the belief that booking failures, disputes, and coordination issues are not user problems, but **system design problems** that can be solved through rule-driven workflows and conditional transactions.

The primary goal of the platform is to **orchestrate complex travel bookings at scale** by transforming fragmented processes-pricing changes, group coordination, payment collection, verification, and settlement-into a **single automated transaction pipeline**. By enforcing escrow-based payments, automated group pricing, deadline-driven split payments, and proof-based service verification, DeshGhuri reduces operational ambiguity for both customers and vendors.

In doing so, the platform aims to create a **self-regulating multi-vendor ecosystem** where sellers can operate efficiently without manual follow-ups and customers can book with confidence, knowing that pricing fairness, payment security, and service fulfillment are system-enforced rather than trust-based.

## 1.3 Business Goals

| ID | Goal | Target | Timeline |
| --- | --- | --- | --- |
| GOAL-001 | Establish market trust via escrow | 90% customer confidence rating | Year 1 |
| GOAL-002 | Increase group booking adoption | 35% of total bookings | Year 1 |
| GOAL-003 | Reduce cart abandonment | 25% reduction | Year 1 |
| GOAL-004 | Price-lock feature adoption | 40% of bookings | Year 1 |
| GOAL-005 | Build seller ecosystem | 500+ verified sellers | Year 1 |
| GOAL-006 | Fast dispute resolution | < 72 hours average | Ongoing |
| GOAL-007 | Repeat customer rate | 45% by Year 2 | Year 2 |

### 1.4 Prototype

[Lovable App](https://radiant-concept-lab.lovable.app/)

---

# 2. User Roles & Permissions

## 2.1 Role Definitions

| Role ID | Role Name | Description |
| --- | --- | --- |
| ROLE-001 | Guest | Unregistered visitor browsing listings |
| ROLE-002 | Customer | Registered user who makes bookings |
| ROLE-003 | Group Organizer | Customer who creates and manages group bookings |
| ROLE-004 | Group Participant | Customer who joins existing group bookings |
| ROLE-005 | Seller (Agency) | Travel agency listing tour packages |
| ROLE-006 | Seller (Hotel) | Hotel/accommodation listing rooms |
| ROLE-007 | Seller (Tour Operator) | Tour operator listing experiences |
| ROLE-008 | Platform Admin | Operations team member |
| ROLE-009 | Finance Admin | Financial operations specialist |
| ROLE-010 | Dispute Admin | Customer service/dispute specialist |
| ROLE-011 | Super Admin | Platform owner with full access |

## 2.2 Permissions Matrix

| Permission | Guest | Customer | Organizer | Participant | Seller | Admin | Super Admin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Browse listings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View listing details | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create account | ✓ | - | - | - | - | - | - |
| Make individual booking | - | ✓ | ✓ | ✓ | - | - | - |
| Create group booking | - | - | ✓ | - | - | - | - |
| Join group booking | - | ✓ | ✓ | ✓ | - | - | - |
| Invite participants | - | - | ✓ | - | - | - | - |
| Enable split payment | - | - | ✓ | - | - | - | - |
| Enable price lock | - | ✓ | ✓ | ✓ | - | - | - |
| View own bookings | - | ✓ | ✓ | ✓ | - | - | - |
| Cancel booking | - | ✓ | ✓ | ✓ | - | - | - |
| Initiate dispute | - | ✓ | ✓ | ✓ | ✓ | - | - |
| Create listings | - | - | - | - | ✓ | - | - |
| Manage inventory | - | - | - | - | ✓ | - | - |
| Submit completion proof | - | - | - | - | ✓ | - | - |
| View seller dashboard | - | - | - | - | ✓ | - | - |
| Resolve disputes | - | - | - | - | - | ✓ | ✓ |
| Release/hold funds | - | - | - | - | - | ✓ | ✓ |
| Verify sellers | - | - | - | - | - | ✓ | ✓ |
| Manage users | - | - | - | - | - | ✓ | ✓ |
| System configuration | - | - | - | - | - | - | ✓ |
| Access all reports | - | - | - | - | - | ✓ | ✓ |

---

# 3. Homepage & Website Sections

## 3.1 Homepage Sections Overview

| Section # | Section Name | Purpose | Key Interactions |
| --- | --- | --- | --- |
| 1 | Navbar | Primary navigation, account access, cart | Logo click → Home; Search icon → Expand search; Profile → Dropdown menu; Cart → View held bookings |
| 2 | City Quick Filter Bar | Fast destination filtering | Click city chip → Filter all listings by city; Scroll horizontally on mobile |
| 3 | Hero + Search | Visual hook + primary search entry | Enter destination, dates, guests → Search; Quick category buttons → Filtered results |
| 4 | Categories Grid | Browse by travel type | Click category card → Category listing page; Hover → Show listing count |
| 5 | Flash Deals | Time-limited discounts | Countdown timer visible; Click deal → Listing with discount applied; “View All” → Deals page |
| 6 | New Arrivals | Recently added listings | Click listing → Detail page; Auto-refresh daily; “See More” → New listings page |
| 7 | Trending | Popular/high-engagement listings | Based on views + bookings; Click → Detail page; Updated hourly |
| 8 | Most Booked | Highest booking volume | Social proof badges; Click → Detail page; Filter by category |
| 9 | Group Booking Spotlight | Promote group deals | Show active groups forming; “Join Group” → Group join flow; “Start Group” → Create group |
| 10 | Recommended | Personalized suggestions | Based on browse history; Guest: show popular; Logged in: personalized |
| 11 | Verified Sellers | Trust-building seller showcase | Verification badge visible; Click seller → Seller profile page; Show rating + reviews |
| 12 | How It Works | User education | Step-by-step visual guide; Expandable details; Links to help center |
| 13 | Escrow Trust & Safety | Build payment confidence | Explain escrow process; Show protection guarantees; Link to detailed FAQ |
| 14 | Testimonials | Social proof via reviews | Carousel of customer reviews; Star ratings visible; Filter by category |
| 15 | FAQ | Answer common questions | Accordion expand/collapse; Search within FAQ; Link to support |
| 16 | Footer | Secondary navigation + legal | Site links, social media, contact, legal pages, newsletter signup |

## 3.2 Navbar Components

| Component | Description | Behavior |
| --- | --- | --- |
| Logo | DeshGhuri brand logo | Click → Homepage |
| Search Bar | Compact search input | Expand on focus; Autocomplete suggestions |
| City Selector | Current city dropdown | Change city → Update listings |
| Categories Menu | Dropdown with all categories | Hover/click → Show category list |
| Deals Link | Flash deals shortcut | Click → Deals page |
| Group Booking | Group feature shortcut | Click → Active groups page |
| Help | Support access | Click → Help center |
| Language | BN/EN toggle | Click → Switch language |
| Currency | BDT display | Display only (Phase 1) |
| Wishlist Icon | Saved listings count | Click → Wishlist page |
| Cart Icon | Held bookings count | Click → Cart/held bookings |
| Profile/Login | Account access | Guest: Login/Register; User: Profile dropdown |

## 3.3 Footer Components

| Component | Description |
| --- | --- |
| About Section | Company info, mission, team link |
| Quick Links | Popular destinations, categories, deals |
| Customer Support | Help center, contact, track booking |
| For Sellers | Seller registration, seller login, seller support |
| Legal | Terms of Service, Privacy Policy, Refund Policy, Escrow Terms |
| Social Media | Facebook, Instagram, YouTube, LinkedIn icons |
| Newsletter | Email signup for offers |
| Payment Partners | Payment method logos |
| App Download | App store badges (Phase 2) |
| Copyright | © 2026 DeshGhuri. All rights reserved. |

---

# 4. Search & Discovery

## 4.1 Search Functionality

| Feature ID | Feature | Description | Behavior |
| --- | --- | --- | --- |
| SRC-001 | Keyword Search | Search by destination, listing name, seller | Results < 2 seconds; Relevance ranking |
| SRC-002 | Location Autocomplete | Suggest locations as user types | Show top 5 suggestions; Include city, district, landmark |
| SRC-003 | Date Picker | Select check-in/check-out or travel dates | Block past dates; Show availability indicators |
| SRC-004 | Guest Selector | Number of adults, children, rooms | Increment/decrement buttons; Max limits apply |
| SRC-005 | Category Filter | Filter by Hotels, Tours, Experiences, Packages | Multi-select enabled; Show count per category |
| SRC-006 | Price Range Filter | Min-max price slider | Slider + manual input; Update results live |
| SRC-007 | Rating Filter | Minimum star rating | 3★, 4★, 4.5★ options |
| SRC-008 | Amenity Filters | Filter by amenities/features | Checkboxes; Common amenities prioritized |
| SRC-009 | Group Booking Filter | Show only group-eligible listings | Toggle switch; Show “Groups Forming” badge |
| SRC-010 | Verified Seller Filter | Show only verified sellers | Toggle switch |
| SRC-011 | Sort Options | Sort results | Price (Low-High, High-Low), Rating, Popularity, Newest |
| SRC-012 | Map View | View listings on map | Toggle list/map view; Click pin → Mini card |
| SRC-013 | Save Search | Save search criteria | Login required; Notification on new matches |

## 4.2 Search Results Display

| Element | Description |
| --- | --- |
| Result Card | Image, title, location, price, rating, badges |
| Badges | “Verified”, “Flash Deal”, “Groups Forming”, “New”, “Most Booked” |
| Price Display | Per person/per night; Original + discounted price |
| Quick Actions | Wishlist heart, Quick view, Book Now |
| Pagination | 20 results per page; Infinite scroll on mobile |
| No Results | Suggestions to modify search; Similar listings |

---

# 5. Listing Details & Booking Panel

## 5.1 Listing Detail Page Sections

| Section | Content | Interactions |
| --- | --- | --- |
| Image Gallery | Primary image + thumbnail gallery (min 3, max 20) | Click → Fullscreen lightbox; Swipe on mobile |
| Title & Location | Listing name, full address, map pin | Click map → Expand map view |
| Badges | Verified, Flash Deal, Group Eligible, etc. | Informational display |
| Rating & Reviews | Average rating, review count, recent reviews | Click → Jump to reviews section |
| Price Display | Base price, discounted price, per unit label | Dynamic based on dates/guests selected |
| Seller Info | Seller name, badge, rating, response time | Click → Seller profile page |
| Description | Full listing description | Expandable if long |
| Inclusions | What’s included (structured list) | Checkmark icons |
| Exclusions | What’s not included | X icons |
| Amenities/Facilities | Available amenities grid | Icons + labels |
| Policies | Cancellation, check-in/out, house rules | Accordion expandable |
| Availability Calendar | Date availability grid | Click date → Select; Unavailable dates grayed |
| Group Booking Section | Current groups forming, tier pricing | “Join Group” or “Start Group” buttons |
| Reviews Section | All reviews with filters | Filter by rating; Sort by date/helpful |
| Similar Listings | Related listings carousel | Click → Navigate to listing |
| Recently Viewed | User’s recent views | Click → Navigate to listing |

## 5.2 Booking Panel (Sticky Sidebar)

| Element | Description | Behavior |
| --- | --- | --- |
| Date Selector | Check-in / Check-out or Travel Date | Calendar popup; Sync with page calendar |
| Guest Selector | Adults, Children, Rooms/Units | Increment/decrement; Capacity validation |
| Price Breakdown | Base, taxes, fees, discounts, total | Update dynamically on selection change |
| Price Lock Toggle | Enable price lock protection | Checkbox with info tooltip |
| Group Booking Option | Start or join group | Show tier pricing preview |
| Promo Code Input | Enter discount code | “Apply” button; Validate and show discount |
| Book Now Button | Primary CTA | Proceed to booking confirmation |
| Hold Indicator | “Inventory held for 10:00” | Countdown after booking initiated |
| Wishlist Button | Save for later | Heart icon toggle |
| Share Button | Share listing | Copy link, social share options |
| Contact Seller | Message seller | Opens chat/inquiry form |

---

# 6. Booking Engine (Hold → Pay → Confirmed)

## 6.1 Booking Lifecycle States

| State | Description | Triggers | Next States |
| --- | --- | --- | --- |
| Draft | Booking initiated, not submitted | User starts booking | Hold, Abandoned |
| Hold | Inventory held for 10 minutes | User submits booking request | Payment Pending, Expired |
| Payment Pending | Awaiting payment completion | Hold confirmed | Confirmed, Expired, Failed |
| Confirmed | Payment successful, booking active | Payment success | Completed, Cancelled, Disputed |
| Completed | Service delivered and verified | Proof verified OR auto-complete | Refunded (partial) |
| Cancelled | Booking cancelled by user/seller/admin | Cancellation request | Refunded |
| Expired | Hold or payment window expired | Timeout (10 min hold / 72h payment) | Draft (retry) |
| Disputed | Dispute raised by customer or seller | Dispute initiation | Resolved → Refunded/Completed |
| Refunded | Refund processed | Cancellation, dispute resolution | Terminal |

## 6.2 Booking Flow Steps

| Step | Action | System Behavior | Timeout |
| --- | --- | --- | --- |
| 1 | User clicks “Book Now” | Create draft booking; Show booking form | None |
| 2 | User fills guest details | Validate inputs; Calculate final price | None |
| 3 | User selects payment method | Display available methods | None |
| 4 | User confirms booking | Create inventory HOLD; Start 10-min timer | 10 minutes |
| 5 | User completes payment | Process payment; Create escrow | 10 minutes |
| 6 | Payment success | Mark CONFIRMED; Send confirmations | Immediate |
| 7 | Payment failure | Release hold; Show retry option | Immediate |
| 8 | Hold expires | Release inventory; Notify user | Auto at 10 min |

## 6.3 Inventory Hold System

| Rule | Description |
| --- | --- |
| Hold Duration | 10 minutes from booking confirmation click |
| Hold Scope | Specific dates + units selected |
| Concurrent Holds | Same inventory cannot be held by multiple users |
| Hold Release | Auto-release on expiry, payment failure, user cancellation |
| Hold Extension | Not allowed; User must restart if expired |
| Visual Indicator | Countdown timer visible to user |
| Conflict Handling | If inventory taken during checkout, show error + alternatives |

## 6.4 Payment Processing

| Feature | Description |
| --- | --- |
| Payment Methods | bKash, Nagad, Credit/Debit Card, Bank Transfer |
| Payment Window | Must complete within hold period (10 minutes) |
| Escrow Creation | On payment success, funds move to escrow |
| Receipt Generation | Automatic receipt sent via email + SMS |
| Partial Payment | Not allowed for individual bookings |
| Split Payment | Allowed for group bookings (see Section 10) |
| Failed Payment | 3 retry attempts; Then hold released |
| Refund Method | Original payment method; 5-7 business days |

## 6.5 Booking Confirmation

| Element | Description |
| --- | --- |
| Confirmation Number | Format: DG-YYYYMMDD-XXXXX |
| Confirmation Page | Summary of booking, payment, next steps |
| Email Confirmation | Full details, PDF attachment, calendar invite |
| SMS Confirmation | Short confirmation with booking ID |
| Push Notification | App notification (Phase 2) |
| Seller Notification | Immediate notification to seller |
| Calendar Sync | .ics file attachment for calendar apps |

---

# 7. Escrow + Proof-Based Confirmation

## 7.1 Escrow System Overview

| Attribute | Description |
| --- | --- |
| Purpose | Hold customer funds securely until service delivery verified |
| Escrow Creation | On successful payment |
| Fund Location | Platform escrow account (not seller) |
| Release Trigger | Proof verified + No dispute within window |
| Dispute Impact | Funds frozen until resolution |
| Platform Fee | Deducted at release time |

## 7.2 Escrow Lifecycle

| Stage | Event | Fund Status | Timeline |
| --- | --- | --- | --- |
| 1 | Payment successful | Funds in escrow | Day 0 |
| 2 | Pre-service period | Held | Day 0 to service date |
| 3 | Service delivered | Held | Service date |
| 4 | Seller submits proof | Held, pending verification | Within 48h of service |
| 5 | Proof verified | Release initiated | 24h after verification |
| 6 | Customer confirmation (optional) | Immediate release | If customer confirms |
| 7 | Auto-release (no dispute) | Released | 7 days after service |
| 8 | Disbursement | Funds to seller bank | 3-5 business days |

## 7.3 Proof Submission Requirements

| Listing Type | Required Proof | Accepted Formats |
| --- | --- | --- |
| Hotel/Resort | Check-in record, guest signature, room photo | JPG, PNG, PDF (max 25MB) |
| Tour Package | Attendance list, group photo, itinerary completion | JPG, PNG, PDF |
| Experience | Activity photos, participant confirmation | JPG, PNG, PDF |
| Transport | Trip log, pickup/drop confirmation | JPG, PNG, PDF |

## 7.4 Proof Verification Process

| Step | Actor | Action | Outcome |
| --- | --- | --- | --- |
| 1 | Seller | Upload proof within 48h of service end | Proof submitted |
| 2 | System | Auto-verify if meets criteria | Pass → Release queue; Fail → Manual review |
| 3 | Admin | Manual review if flagged | Approve / Reject with reason |
| 4 | System | If approved, initiate release | Release within 24h |
| 5 | Seller | If rejected, resubmit with corrections | New review cycle |
| 6 | System | 3 rejections → Escalate to dispute | Admin intervention |

## 7.5 Fund Release Rules

| Trigger | Release Timeline | Condition |
| --- | --- | --- |
| Proof verified | Within 24 hours | No dispute raised |
| Customer confirms | Immediate | Customer clicks “Confirm Service” |
| Auto-release | 7 days after service | No dispute, no proof required (small bookings) |
| Dispute resolved | Per resolution | Admin decision executed |
| Partial release | As determined | Dispute with partial fault |

## 7.6 Escrow Edge Cases

| Case | Scenario | Handling |
| --- | --- | --- |
| EC-ESC-001 | Seller submits proof before service | Reject; Allow after service date only |
| EC-ESC-002 | Proof deadline missed | Reminder → Escalate → Admin review |
| EC-ESC-003 | Customer disputes after auto-release | Handle outside escrow; Seller contact |
| EC-ESC-004 | Seller account suspended during escrow | Hold funds; Admin decides |
| EC-ESC-005 | Multiple proof submissions | Accept all until release; Use latest |
| EC-ESC-006 | Proof file corrupted | Notify seller; Request re-upload |

---

# 8. Group Booking Discounts

## 8.1 Group Booking Overview

| Attribute | Description |
| --- | --- |
| Purpose | Enable group travel with tiered discounts |
| Minimum Group Size | 2 participants |
| Maximum Group Size | Defined per listing (default: 20) |
| Tier System | Price decreases as group size increases |
| Retroactive Refund | Earlier members refunded when tier upgrades |
| Formation Window | 1-30 days (default: 7 days) |

## 8.2 Tier Pricing Structure (Example)

| Tier | Participants | Discount | Price/Person (Base: BDT 1,000) |
| --- | --- | --- | --- |
| Base | 1-2 | 0% | BDT 1,000 |
| Tier 1 | 3-4 | 10% | BDT 900 |
| Tier 2 | 5-7 | 20% | BDT 800 |
| Tier 3 | 8-10 | 30% | BDT 700 |
| Tier 4 | 11+ | 40% | BDT 600 |

## 8.3 Group Booking States

| State | Description | Actions Available |
| --- | --- | --- |
| Forming | Group created, accepting members | Join, Invite, Pay share |
| Minimum Met | Minimum participants reached | Same + Confirm if deadline |
| Confirmed | Deadline passed, minimum met | View details, Cancel (policy) |
| Failed | Deadline passed, minimum not met | Auto-cancel, Full refund |
| Completed | Service delivered | Rate, Review |

## 8.4 Group Booking Rules

| Rule ID | Rule | Description |
| --- | --- | --- |
| GRP-001 | Organizer Creates | Only organizer can create group |
| GRP-002 | Organizer Pays First | Organizer must pay to activate group |
| GRP-003 | Public/Private | Organizer chooses visibility |
| GRP-004 | Join Until Deadline | Members can join until formation deadline |
| GRP-005 | Tier Auto-Update | Price updates as members join |
| GRP-006 | Retroactive Refund | Earlier payers refunded tier difference |
| GRP-007 | Minimum Required | Group fails if minimum not met by deadline |
| GRP-008 | Organizer Can Remove | Organizer can remove unpaid members |
| GRP-009 | Capacity Limit | Cannot exceed listing capacity |
| GRP-010 | Individual Withdrawal | Member can leave; Refund per policy |

## 8.5 Group Booking Edge Cases

| Case | Scenario | Handling |
| --- | --- | --- |
| EC-GRP-001 | Tier fluctuates up and down | Recalculate; No refund for temp changes |
| EC-GRP-002 | Organizer cancels entire group | Cancel all; Refund per policy |
| EC-GRP-003 | Organizer becomes unresponsive | Admin can reassign organizer |
| EC-GRP-004 | Listing unavailable mid-formation | Cancel group; Full refund all |
| EC-GRP-005 | Last member drops below minimum | Warning; If deadline passed, fail group |
| EC-GRP-006 | Duplicate join attempt | Block; Show “Already in group” |

---

# 9. Price Lock + Refund Guarantee

## 9.1 Price Lock Overview

| Attribute | Description |
| --- | --- |
| Purpose | Guarantee booking price; Auto-refund if price drops |
| Opt-in | Customer enables at booking time |
| Fee | Free (built into platform value) |
| Validity | From booking until service date |
| Coverage | Base price, tier upgrades, seller promotions |

## 9.2 Price Lock Mechanism

| Trigger | Action | Refund Calculation |
| --- | --- | --- |
| Group tier upgrade | Refund tier difference | (Old tier price - New tier price) × quantity |
| Seller runs promotion | Refund promo difference | Locked price - Promo price |
| Flash deal applies | Refund deal difference | Locked price - Deal price |
| Price increase | No impact | Customer protected at locked price |

## 9.3 Price Lock Flow

| Step | Event | System Action |
| --- | --- | --- |
| 1 | Customer enables price lock | Record locked price with booking |
| 2 | System monitors price changes | Continuous until service date |
| 3 | Price drop detected | Calculate refund amount |
| 4 | Auto-refund initiated | Refund to original payment method |
| 5 | Customer notified | Email + in-app notification |
| 6 | Service date reached | Price lock protection ends |

## 9.4 Price Lock Edge Cases

| Case | Scenario | Handling |
| --- | --- | --- |
| EC-PLK-001 | Multiple price drops | Cumulative refunds; Cap at original payment |
| EC-PLK-002 | Price lock + split payment | Distribute refund proportionally |
| EC-PLK-003 | Customer cancels after refund | Cancellation policy on net paid amount |
| EC-PLK-004 | Price drops after service date | No refund; Lock expired |
| EC-PLK-005 | Refund processing fails | Queue retry; Admin alert |
| EC-PLK-006 | Price anomaly (data error) | Flag for review; Delay refund |

---

# 10. Split Payment

## 10.1 Split Payment Overview

| Attribute | Description |
| --- | --- |
| Purpose | Allow group members to pay their share separately |
| Availability | Group bookings only |
| Initiated By | Group organizer |
| Share Calculation | Equal split (default) or custom amounts |
| Deadline | 72 hours (default), configurable 24-168 hours |
| Booking Confirmation | Only after ALL shares paid |

## 10.2 Split Payment Flow

| Step | Actor | Action | System Response |
| --- | --- | --- | --- |
| 1 | Organizer | Enable split payment | Calculate shares |
| 2 | Organizer | Invite participants | Send invites via email/SMS/link |
| 3 | Organizer | Pay own share | Record payment; Hold inventory |
| 4 | Participant | Receive invite | View amount due, deadline |
| 5 | Participant | Pay share | Update paid status; Notify organizer |
| 6 | System | All shares paid | Confirm booking; Release to escrow |
| 7 | System | Deadline + incomplete | Notify organizer of options |

## 10.3 Split Payment Rules

| Rule ID | Rule | Description |
| --- | --- | --- |
| SPL-001 | Organizer Pays First | Organizer must pay to activate invitations |
| SPL-002 | Equal Default | Shares calculated equally by default |
| SPL-003 | Custom Allowed | Organizer can set custom amounts |
| SPL-004 | Total Must Match | Sum of shares = Total booking amount |
| SPL-005 | Full Share Only | Participants must pay full share (no partial) |
| SPL-006 | Reminder System | Auto-reminders at 24h, 12h, 2h before deadline |
| SPL-007 | Organizer Coverage | Organizer can pay remaining shares |
| SPL-008 | Deadline Extension | One extension allowed (up to 48h) |
| SPL-009 | Cancellation | If incomplete after deadline, options provided |

## 10.4 Incomplete Split Payment Handling

| Option | Description | Action |
| --- | --- | --- |
| Option A | Organizer covers remaining | Organizer pays unpaid shares |
| Option B | Extend deadline | One extension up to 48 hours |
| Option C | Remove unpaid members | Recalculate; Continue with paid members |
| Option D | Cancel booking | Full refund to all who paid |

## 10.5 Split Payment Edge Cases

| Case | Scenario | Handling |
| --- | --- | --- |
| EC-SPL-001 | Participant claims paid, system shows not | Admin investigates; Transaction proof |
| EC-SPL-002 | Invited wrong email | Cancel invite; Resend to correct |
| EC-SPL-003 | Share amount changes (tier change) | Notify; Refund diff or request more |
| EC-SPL-004 | Payment fails for one participant | Retry allowed; Others unaffected |
| EC-SPL-005 | Organizer wants to remove paid member | Refund member; Recalculate shares |
| EC-SPL-006 | Currency conversion | All payments in BDT |

---

# 11. Seller Portal

## 11.1 Seller Dashboard Overview

| Section | Purpose | Key Features |
| --- | --- | --- |
| Overview | At-a-glance performance | Today’s bookings, revenue, pending actions |
| Listings | Manage all listings | Create, edit, pause, delete listings |
| Bookings | View and manage bookings | Upcoming, past, cancelled bookings |
| Calendar | Availability management | Block dates, set pricing by date |
| Inbox | Customer communications | Messages, inquiries, notifications |
| Reviews | Review management | View, respond to reviews |
| Earnings | Financial overview | Pending, released, withdrawn |
| Payouts | Bank/payment setup | Bank details, payout history |
| Proof Center | Service proof management | Submit, track, resubmit proofs |
| Analytics | Performance insights | Views, conversion, revenue trends |
| Settings | Account settings | Profile, notifications, policies |

## 11.2 Listing Management

| Feature | Description |
| --- | --- |
| Create Listing | Multi-step form: Basic info → Media → Pricing → Policies → Tiers → Review |
| Bulk Upload | CSV upload for multiple listings |
| Clone Listing | Duplicate existing listing |
| Seasonal Pricing | Set date-based price variations |
| Inventory Management | Set available units/rooms/slots |
| Group Pricing Tiers | Configure 2-5 pricing tiers |
| Pause/Resume | Temporarily hide listing |
| Archive | Remove from active listings |

## 11.3 Seller Proof Submission

| Step | Action | Deadline |
| --- | --- | --- |
| 1 | Service completed | Day 0 |
| 2 | Upload proof | Within 48 hours |
| 3 | System/Admin reviews | Within 24 hours |
| 4 | If rejected, resubmit | Within 24 hours |
| 5 | If approved, funds released | Within 24 hours |

## 11.4 Seller Verification Requirements

| Document | Required For | Verification Time |
| --- | --- | --- |
| Trade License | All sellers | 24-48 hours |
| NID/Passport | All sellers | 24-48 hours |
| TIN Certificate | Revenue > BDT 50K/month | 24-48 hours |
| Bank Account | All sellers | Micro-deposit verification |
| Property Docs | Hotels/Resorts | 48-72 hours |
| Tour License | Tour Operators | 48-72 hours |

---

# 12. Admin Panel

## 12.1 Admin Dashboard Modules

| Module | Purpose | Key Functions |
| --- | --- | --- |
| Dashboard | Overview metrics | Bookings today, revenue, pending items, alerts |
| Users | User management | View, edit, suspend, delete users |
| Sellers | Seller management | Verification queue, seller profiles, performance |
| Listings | Listing moderation | Review queue, approve, reject, feature |
| Bookings | Booking management | View all bookings, manual actions |
| Transactions | Financial management | Payments, escrow, refunds, payouts |
| Disputes | Dispute resolution | Open cases, evidence review, resolution |
| Reports | Business intelligence | Revenue, bookings, users, sellers |
| Promotions | Marketing tools | Flash deals, coupons, featured listings |
| Content | CMS functions | Homepage sections, banners, FAQ |
| Settings | Platform configuration | Fees, policies, notifications |
| Audit Logs | Activity tracking | All admin actions logged |

## 12.2 Seller Verification Queue

| Field | Description |
| --- | --- |
| Seller ID | Unique identifier |
| Business Name | Registered business name |
| Category | Agency / Hotel / Tour Operator |
| Documents | Uploaded verification docs |
| Submitted Date | Application date |
| Status | Pending / In Review / Approved / Rejected |
| Assigned Admin | Reviewer assigned |
| Actions | Approve, Reject (with reason), Request more docs |

## 12.3 Dispute Management Interface

| Field | Description |
| --- | --- |
| Dispute ID | Unique identifier |
| Booking ID | Related booking |
| Initiator | Customer / Seller |
| Category | Service Not Provided / Quality Issue / Partial / No-Show / Other |
| Status | Open / Under Review / Resolved / Appealed |
| Evidence | Uploaded by both parties |
| Timeline | Key dates and actions |
| Escrow Amount | Funds at stake |
| Resolution Options | Full refund / Partial / Release to seller / Mutual |
| Admin Notes | Internal notes |

## 12.4 Financial Management

| Function | Description |
| --- | --- |
| Escrow Overview | Total in escrow, pending release, held |
| Manual Release | Release funds with justification |
| Manual Hold | Freeze funds with reason |
| Refund Processing | Process refunds, track status |
| Payout Management | Seller payouts, failed payouts |
| Fee Configuration | Platform commission rates |
| Reconciliation | Daily settlement reports |
| Financial Reports | Revenue, fees, refunds, payouts |

---

# 13. Notifications

## 13.1 Customer Notifications

| Trigger | Channel | Content Summary |
| --- | --- | --- |
| Booking confirmed | Email, SMS, Push | Confirmation number, details, receipt |
| Payment received | Email, Push | Amount, transaction ID, escrow status |
| Group member joined | Email, Push | New member name, group progress |
| Tier upgraded | Email, Push | New price, refund amount |
| Price lock refund | Email, Push | Refund amount, reason |
| Split payment invite | Email, SMS | Booking details, amount, deadline |
| Split payment reminder | Email, SMS, Push | Amount due, deadline, pay link |
| Booking upcoming | Email, Push | 7 days and 1 day before |
| Service confirmation request | Email, Push | Confirm service received |
| Dispute update | Email, Push | Status change, next steps |
| Refund processed | Email, Push | Amount, method, timeline |
| Booking cancelled | Email, SMS | Cancellation confirmation, refund details |
| Group failed (min not met) | Email, SMS | Group cancelled, full refund |

## 13.2 Seller Notifications

| Trigger | Channel | Content Summary |
| --- | --- | --- |
| New booking | Email, SMS, Push | Booking details, guest info |
| Payment received | Email, Push | Amount in escrow |
| Proof submission reminder | Email, Push | 24h and 12h before deadline |
| Proof approved | Email, Push | Funds release timeline |
| Proof rejected | Email, Push | Reason, resubmit instructions |
| Funds released | Email, Push | Amount, bank details, ETA |
| Dispute raised | Email, SMS, Push | Details, evidence request |
| Dispute resolved | Email, Push | Outcome, fund status |
| Booking cancelled | Email, Push | Cancellation details, inventory update |
| New review received | Email, Push | Rating, review text |
| Verification status | Email | Approved / Rejected with reason |
| Payout completed | Email | Amount deposited |

## 13.3 Admin Notifications

| Trigger | Channel | Content Summary |
| --- | --- | --- |
| New dispute | Email, Dashboard | Dispute details, urgency |
| Dispute response timeout | Email, Dashboard | Escalation needed |
| New seller application | Dashboard | Application details |
| High-value booking | Dashboard | Monitoring flag |
| Proof pending review | Dashboard | Proof details, deadline |
| Failed payout | Email, Dashboard | Error details, action needed |
| System alert | Email, Dashboard | Issue type, recommended action |
| Daily summary | Email | Key metrics, pending items |

---

# 14. Refunds, Cancellations, Disputes

## 14.1 Cancellation Policies

| Policy Type | Window | Refund % | Processing Fee |
| --- | --- | --- | --- |
| Flexible | 24+ hours before | 100% | BDT 100 |
| Flexible | < 24 hours | 0% | - |
| Moderate | 48+ hours before | 100% | BDT 100 |
| Moderate | 24-48 hours | 50% | BDT 100 |
| Moderate | < 24 hours | 0% | - |
| Strict | 7+ days before | 50% | BDT 200 |
| Strict | < 7 days | 0% | - |
| Non-refundable | Any time | 0% | - |

## 14.2 Cancellation Flow

| Initiator | Steps | System Actions |
| --- | --- | --- |
| Customer | Request → Confirm → Processed | Calculate refund per policy; Release inventory; Process refund |
| Seller | Request → Admin review → Approved/Denied | If approved, full refund to customer; Seller penalty may apply |
| Admin | Direct cancellation | Full refund; Inventory released; Parties notified |
| System | Auto-cancel (payment timeout, group fail) | Full refund; Inventory released; Notification |

## 14.3 Refund Processing

| Attribute | Details |
| --- | --- |
| Refund Method | Original payment method |
| Processing Time | 5-7 business days |
| Partial Refunds | Supported for disputes |
| Refund to Expired Card | Request alternative method |
| Failed Refund | Retry 3 times; Admin alert |

## 14.4 Dispute Categories

| Category | Description | Typical Resolution |
| --- | --- | --- |
| Service Not Provided | Service completely not delivered | Full refund |
| Quality Issue | Service below described standard | Partial refund (negotiated) |
| Partial Service | Only part of service delivered | Proportional refund |
| No-Show (Customer) | Customer didn’t arrive | Release to seller (per policy) |
| No-Show (Seller) | Seller didn’t deliver | Full refund + compensation |
| Overcharge | Charged more than agreed | Difference refunded |
| Safety Issue | Health/safety concerns | Full refund + investigation |

## 14.5 Dispute Resolution Flow

| Step | Timeline | Actor | Action |
| --- | --- | --- | --- |
| 1 | Day 0 | Customer/Seller | Raise dispute with evidence |
| 2 | Day 0 | System | Freeze escrow; Notify other party |
| 3 | Day 1-3 | Respondent | Submit response + evidence |
| 4 | Day 3-5 | Admin | Review case; Request info if needed |
| 5 | Day 5-7 | Admin | Make decision |
| 6 | Day 7 | System | Execute resolution; Notify parties |
| 7 | Day 7-14 | Either party | Appeal (optional, once) |
| 8 | Day 14-21 | Senior Admin | Final decision |

## 14.6 Dispute Edge Cases

| Case | Scenario | Handling |
| --- | --- | --- |
| EC-DIS-001 | Both parties unresponsive | Decide on available evidence |
| EC-DIS-002 | Fraudulent evidence | Investigation; Account action |
| EC-DIS-003 | Dispute after fund release | Handle outside escrow; Contact seller |
| EC-DIS-004 | Counter-claim by seller | Separate dispute track |
| EC-DIS-005 | Repeated disputes from same user | Flag account; Enhanced review |
| EC-DIS-006 | Dispute amount > booking value | Cap at booking value |

---

# 15. Edge Cases / Exceptions

## 15.1 Payment Edge Cases

| Case ID | Scenario | System Behavior | User Communication |
| --- | --- | --- | --- |
| EC-PAY-001 | Payment timeout | Cancel hold; Release inventory | “Payment timed out. Please try again.” |
| EC-PAY-002 | Insufficient funds | Mark failed; Allow retry | “Payment failed. Please try another method.” |
| EC-PAY-003 | Duplicate payment | Process first; Reject duplicate; Refund if charged | “Duplicate detected. Refund processing.” |
| EC-PAY-004 | Currency rate change | Honor displayed rate for 15 min | N/A (transparent) |
| EC-PAY-005 | Payment gateway down | Show error; Suggest retry later | “Payment service temporarily unavailable.” |
| EC-PAY-006 | Refund to expired card | Prompt alternative method | “Card expired. Please provide new payment method.” |

## 15.2 Booking Edge Cases

| Case ID | Scenario | System Behavior | User Communication |
| --- | --- | --- | --- |
| EC-BKG-001 | Inventory taken during checkout | Show error; Suggest alternatives | “This listing just sold out. Here are similar options.” |
| EC-BKG-002 | Hold expires during payment | Release inventory; Show error | “Your hold expired. Please restart booking.” |
| EC-BKG-003 | Seller deactivates listing mid-booking | Complete if paid; Cancel if unpaid | “This listing is no longer available.” |
| EC-BKG-004 | Price changes during checkout | Honor displayed price | N/A (protected) |
| EC-BKG-005 | Guest count exceeds capacity | Block booking; Show error | “Maximum capacity is X guests.” |
| EC-BKG-006 | Booking dates now unavailable | Show error; Suggest alternatives | “Selected dates no longer available.” |

## 15.3 Group Booking Edge Cases

| Case ID | Scenario | System Behavior | User Communication |
| --- | --- | --- | --- |
| EC-GRP-001 | Organizer deletes account | Admin assigns new organizer or cancels | “Group organizer changed. Contact support.” |
| EC-GRP-002 | All members leave except organizer | Convert to individual or cancel | “Offer individual booking option.” |
| EC-GRP-003 | Tier drops after member leaves | Recalculate; No additional charge | “Group pricing updated.” |
| EC-GRP-004 | Participant joins twice | Block duplicate | “You’re already in this group.” |
| EC-GRP-005 | Group deadline falls on holiday | Process normally; Financial ops next day | N/A |
| EC-GRP-006 | Listing capacity reached mid-join | Block new joins | “This group is now full.” |

## 15.4 System Edge Cases

| Case ID | Scenario | System Behavior | User Communication |
| --- | --- | --- | --- |
| EC-SYS-001 | Email delivery failure | Retry; Fallback to SMS | SMS sent as backup |
| EC-SYS-002 | SMS delivery failure | Retry; Email fallback | Email sent as backup |
| EC-SYS-003 | Database replication lag | Read from primary for critical ops | N/A |
| EC-SYS-004 | Session timeout during booking | Save progress; Resume on login | “Session expired. Your progress is saved.” |
| EC-SYS-005 | Concurrent booking conflict | First payment wins; Others refunded | “Booking completed by another user.” |
| EC-SYS-006 | Image upload fails | Retry; Show error after 3 attempts | “Upload failed. Please try again.” |

## 15.5 Account Edge Cases

| Case ID | Scenario | System Behavior | User Communication |
| --- | --- | --- | --- |
| EC-ACC-001 | Account hacked | Lock account; Require verification | “Unusual activity detected. Account secured.” |
| EC-ACC-002 | Deletion with active bookings | Block until bookings complete | “Complete or cancel bookings first.” |
| EC-ACC-003 | Seller verification docs expired | Notify; Grace period; Then suspend | “Please update verification documents.” |
| EC-ACC-004 | Minor attempts booking | Block booking | “You must be 18+ to book.” |
| EC-ACC-005 | Duplicate accounts detected | Flag for review | Admin review; May merge or suspend |
| EC-ACC-006 | Password reset for social login only | Prompt social login | “Sign in with Google/Facebook.” |

---

# 16. User Stories + Sprint Points (Fibonacci)

## Epic 1: User Registration & Authentication

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-1.1 | As a guest, I want to register with email so I can create an account | P0 | 3 | • Email validation • Password strength check • Verification email sent in < 2 min • Account activated on verification | • Duplicate email blocked • Invalid email format error • Verification link expires in 24h |
| US-1.2 | As a guest, I want to register with phone + OTP so I can create an account quickly | P0 | 5 | • Valid BD phone format • OTP sent in < 30 sec • 6-digit OTP valid for 5 min • Max 3 OTP requests/hour | • Invalid phone format • OTP expired • Max attempts exceeded |
| US-1.3 | As a guest, I want to register with Google ,so I can sign up faster | P1 | 5 | • OAuth flow completes < 10 sec • Profile data imported • Email pre-verified | • OAuth denied • Email already exists |
| US-1.4 | As a user, I want to reset my password so I can recover my account | P0 | 3 | • Reset link sent < 2 min • Link valid for 1 hour • Single use only • New password enforced | • Email not found • Link expired • Already used link |
| US-1.5 | As a user, I want to enable 2FA so I can secure my account | P2 | 5 | • TOTP setup with QR • Backup codes generated • Required on new device | • Lost 2FA device → backup codes • Backup codes exhausted → support |

**Epic Total: 21 SP**

---

## Epic 2: Search & Discovery

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-2.1 | As a user, I want to search by destination so I can find listings in my desired location | P0 | 5 | • Autocomplete suggestions < 500ms • Results < 2 sec • Relevance ranking applied | • No results → show suggestions • Typo tolerance enabled |
| US-2.2 | As a user, I want to filter by date and guests so I can see available listings only | P0 | 3 | • Only available inventory shown • Price updated for guest count • Past dates blocked | • No availability → “No results” with alternatives |
| US-2.3 | As a user, I want to filter by price range so I can stay within budget | P0 | 2 | • Slider + manual input • Live result update • Min/max validation | • Max < Min → error • No results in range → expand suggestion |
| US-2.4 | As a user, I want to filter by category so I can browse specific listing types | P0 | 2 | • Multi-select enabled • Count shown per category • “All” default | • Empty category → hide or show 0 |
| US-2.5 | As a user, I want to sort results so I can find the best option quickly | P0 | 2 | • Price, Rating, Popularity, Newest • Default: Relevance • Persist during session | • N/A |
| US-2.6 | As a user, I want to filter for group-eligible listings so I can find group deals | P1 | 2 | • Toggle filter • Show “Groups Forming” badge • Show active groups | • No group listings → message |
| US-2.7 | As a user, I want to view listings on a map so I can choose by location | P1 | 5 | • Interactive map • Click pin → mini card • Zoom to search area | • Many pins → clustering • No pins → message |
| US-2.8 | As a user, I want to save searches so I can get notified of new matches | P2 | 3 | • Login required • Save criteria • Email on new match | • Max 10 saved searches |

**Epic Total: 24 SP**

---

## Epic 3: Listing Details & Wishlist

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-3.1 | As a user, I want to view listing details so I can make an informed decision | P0 | 5 | • All info displayed • Images load < 3 sec • Mobile responsive | • Missing info → hide section • Broken image → placeholder |
| US-3.2 | As a user, I want to view the availability calendar so I can pick available dates | P0 | 5 | • Available dates clickable • Unavailable dates grayed • Prices shown per date | • All dates unavailable → “Contact seller” |
| US-3.3 | As a user, I want to see seller info and reviews so I can trust the listing | P0 | 3 | • Seller name, badge, rating • Response time shown • Link to profile | • New seller → “New Seller” badge |
| US-3.4 | As a user, I want to read reviews so I can learn from others’ experiences | P0 | 3 | • Sorted by newest • Filter by rating • Helpful count | • No reviews → “Be the first” |
| US-3.5 | As a user, I want to add listings to wishlist so I can save for later | P1 | 2 | • Heart icon toggle • Login required • View wishlist page | • Max 100 items |
| US-3.6 | As a user, I want to share a listing so I can tell friends | P1 | 2 | • Copy link • Social share buttons | • N/A |
| US-3.7 | As a user, I want to contact the seller so I can ask questions | P1 | 3 | • Inquiry form • Message sent to seller • Response in inbox | • Seller unresponsive → support contact |

**Epic Total: 23 SP**

---

## Epic 4: Individual Booking

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-4.1 | As a user, I want to select dates and guests so I can configure my booking | P0 | 3 | • Date picker • Guest selector • Price updates live | • Invalid dates → error • Exceeds capacity → error |
| US-4.2 | As a user, I want to see a price breakdown so I can understand the total cost | P0 | 3 | • Base, taxes, fees, discounts • Total clearly shown | • N/A |
| US-4.3 | As a user, I want to enter guest details so the booking is complete | P0 | 3 | • Primary guest required • Validation on submit | • Invalid phone/email → error |
| US-4.4 | As a user, I want to apply a promo code so I can get a discount | P1 | 2 | • Input field • “Apply” validates • Discount shown | • Invalid code → error • Expired → error |
| US-4.5 | As a user, I want to enable price lock so I can get refunded if price drops | P1 | 2 | • Checkbox opt-in • Info tooltip explains • Confirmed in receipt | • N/A |
| US-4.6 | As a user, I want inventory held during checkout so I don’t lose my booking | P0 | 5 | • 10-min hold starts • Countdown visible • Released if payment fails | • Hold expires → error + retry |
| US-4.7 | As a user, I want to select a payment method so I can complete payment | P0 | 5 | • bKash, Nagad, Card options • Saved cards (logged in) | • Method unavailable → show others |
| US-4.8 | As a user, I want to receive confirmation so I know my booking is secured | P0 | 3 | • Confirmation page • Email + SMS • Booking ID generated | • Email fails → SMS backup |

**Epic Total: 26 SP**

---

## Epic 5: Group Booking

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-5.1 | As a user, I want to start a group booking so I can organize group travel | P0 | 5 | • Group created • Organizer assigned • Unique group ID • Tier pricing shown | • Listing not group-eligible → error |
| US-5.2 | As an organizer, I want to set group visibility so I can control who joins | P0 | 2 | • Public/Private toggle • Private requires link | • N/A |
| US-5.3 | As an organizer, I want to invite participants so they can join my group | P0 | 5 | • Email/SMS/Link invite • Invite tracks status | • Invalid email → error • Resend allowed |
| US-5.4 | As a user, I want to join an existing group so I can get group discounts | P0 | 3 | • Find group or use link • See group details • Join button | • Group full → error • Already member → error |
| US-5.5 | As a user, I want to see tier progress so I know the current price level | P0 | 3 | • Progress bar • Current vs next tier • Members needed | • Max tier → “Best price reached” |
| US-5.6 | As a member, I want retroactive refund when tier upgrades so I get the best price | P0 | 5 | • Auto-calculate diff • Auto-refund processed • Notification sent | • Refund fails → retry + admin |
| US-5.7 | As an organizer, I want to remove unpaid members so the group can proceed | P1 | 3 | • Remove option (before deadline) • Member notified | • Cannot remove paid members |
| US-5.8 | As a member, I want to leave a group so I can cancel my participation | P1 | 3 | • Leave button • Refund per policy • Group updated | • Last member → convert to individual |
| US-5.9 | As a user, I want the system to handle group failure so I get refunded | P0 | 5 | • Auto-cancel if min not met • Full refund all • Notification sent | • N/A |

**Epic Total: 34 SP**

---

## Epic 6: Split Payment

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-6.1 | As an organizer, I want to enable split payment so members pay their share | P0 | 3 | • Toggle option • Share calculation shown | • Cannot enable after all paid |
| US-6.2 | As an organizer, I want to set custom share amounts so I can adjust contributions | P1 | 5 | • Custom input per member • Total must match • Validation | • Total mismatch → error |
| US-6.3 | As a participant, I want to receive payment invite so I know my share | P0 | 3 | • Email/SMS with amount • Deadline shown • Pay link | • N/A |
| US-6.4 | As a participant, I want to pay my share so the booking can be confirmed | P0 | 5 | • Payment flow • Status updated • Organizer notified | • Payment fails → retry |
| US-6.5 | As an organizer, I want to track payment status so I know who has paid | P0 | 3 | • Dashboard view • Paid/Pending status • Reminder button | • N/A |
| US-6.6 | As a participant, I want reminders so I don’t miss the deadline | P0 | 2 | • Auto at 24h, 12h, 2h • Manual by organizer | • Notifications off → still send |
| US-6.7 | As an organizer, I want to cover remaining shares so the booking confirms | P1 | 3 | • Pay remaining option • Single payment | • Insufficient funds → error |
| US-6.8 | As an organizer, I want to extend the deadline so members have more time | P1 | 2 | • Extend button • Max 48h extension • Once only | • Already extended → error |
| US-6.9 | As a system, I want to handle incomplete payments so bookings resolve | P0 | 5 | • Options shown to organizer • Timeout handling • Refund if cancelled | • N/A |

**Epic Total: 31 SP**

---

## Epic 7: Escrow & Proof Verification

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-7.1 | As a customer, I want my payment in escrow so I’m protected until service | P0 | 5 | • Funds held on payment • Visible in booking status • Not released until verified | • N/A |
| US-7.2 | As a seller, I want to submit proof so I can receive payment | P0 | 5 | • Upload interface • File validation • Submission confirmed | • File too large → error • Wrong format → error |
| US-7.3 | As a seller, I want proof deadline reminders so I don’t miss the window | P0 | 2 | • Reminder at 24h, 12h • Escalation if missed | • N/A |
| US-7.4 | As an admin, I want to review proof so I can verify service delivery | P0 | 5 | • Review queue • Approve/Reject • Rejection reason required | • Evidence unclear → request more |
| US-7.5 | As a seller, I want to resubmit rejected proof so I can still get paid | P0 | 3 | • Resubmit option • View rejection reason • Deadline reset | • Max 3 attempts → escalate |
| US-7.6 | As a customer, I want to confirm service so funds release faster | P1 | 2 | • “Confirm Service” button • Immediate release • Optional | • Customer unresponsive → auto-release |
| US-7.7 | As a system, I want auto-release after 7 days so sellers get paid | P0 | 3 | • No dispute = release • Notification to both | • N/A |
| US-7.8 | As a seller, I want to see fund release status so I know when to expect payment | P0 | 2 | • Status in dashboard • Bank transfer timeline | • N/A |

**Epic Total: 27 SP**

---

## Epic 8: Price Lock & Refund Guarantee

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-8.1 | As a customer, I want to enable price lock so I’m protected from price increases | P0 | 2 | • Checkbox at booking • Price snapshot saved | • N/A |
| US-8.2 | As a system, I want to monitor price changes so I can trigger refunds | P0 | 8 | • Continuous monitoring • Detect drops • Calculate diff | • Data anomaly → flag for review |
| US-8.3 | As a customer, I want automatic refund when price drops so I get the best deal | P0 | 5 | • Auto-refund processed • Notification sent • Visible in history | • Refund fails → retry + alert |
| US-8.4 | As a customer, I want tier upgrade refunds so I benefit from group growth | P0 | 5 | • Calculate tier diff • Auto-refund • Notification | • Multiple drops → cumulative |
| US-8.5 | As a customer, I want price lock to expire at service date so it’s bounded | P0 | 2 | • Monitoring stops at service • No retroactive claims | • N/A |

**Epic Total: 22 SP**

---

## Epic 9: Cancellations & Refunds

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-9.1 | As a customer, I want to cancel my booking so I can change my plans | P0 | 5 | • Cancel button • Policy displayed • Refund calculated • Confirmation required | • Non-refundable → warning shown |
| US-9.2 | As a customer, I want to see cancellation policy so I know refund amount | P0 | 2 | • Policy on listing • Policy at checkout • Policy on booking | • N/A |
| US-9.3 | As a customer, I want my refund processed so I get my money back | P0 | 5 | • Original method • 5-7 business days • Status tracking | • Method unavailable → request new |
| US-9.4 | As a seller, I want to request cancellation so I can handle emergencies | P1 | 3 | • Request form • Admin review required • Full refund to customer | • Frequent cancels → warning |
| US-9.5 | As an admin, I want to process manual refunds so I can handle exceptions | P0 | 3 | • Refund interface • Reason required • Audit logged | • N/A |

**Epic Total: 18 SP**

---

## Epic 10: Disputes

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-10.1 | As a customer, I want to raise a dispute so I can report issues | P0 | 5 | • Dispute form • Category selection • Evidence upload • Submitted confirmation | • Duplicate dispute → blocked |
| US-10.2 | As a seller, I want to respond to disputes so I can defend my service | P0 | 5 | • Response form • Evidence upload • 72h deadline | • No response → default to customer |
| US-10.3 | As an admin, I want to review disputes so I can resolve them fairly | P0 | 8 | • Full case view • Both sides’ evidence • Resolution options • Decision recording | • Unclear evidence → request more |
| US-10.4 | As a party, I want dispute status updates so I know the progress | P0 | 2 | • Status notifications • Timeline visible | • N/A |
| US-10.5 | As a party, I want to appeal the decision so I can contest unfair resolution | P1 | 5 | • Appeal button (7 days) • New evidence allowed • Senior review | • One appeal only |
| US-10.6 | As a system, I want to execute resolution so funds are distributed correctly | P0 | 5 | • Auto-execute on decision • Refund/release processed • Parties notified | • Execution fails → admin alert |

**Epic Total: 30 SP**

---

## Epic 11: Seller Onboarding & Management

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-11.1 | As a seller, I want to register so I can list on the platform | P0 | 5 | • Registration form • Business details • Category selection | • Incomplete form → save draft |
| US-11.2 | As a seller, I want to upload verification docs so I can get verified | P0 | 5 | • Doc upload (License, NID, etc.) • Format validation • Submission confirmed | • Doc unreadable → request re-upload |
| US-11.3 | As an admin, I want to review seller applications so I can verify them | P0 | 5 | • Review queue • Approve/Reject • Request more docs | • Suspicious → flag for review |
| US-11.4 | As a seller, I want verification status updates so I know my progress | P0 | 2 | • Status visible • Email on change | • N/A |
| US-11.5 | As a seller, I want to set up bank account so I can receive payouts | P0 | 3 | • Bank details form • Micro-deposit verification | • Verification fails → retry |
| US-11.6 | As a verified seller, I want a badge so customers trust me | P0 | 2 | • Badge on profile • Badge on listings | • N/A |

**Epic Total: 22 SP**

---

## Epic 12: Listing Management

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-12.1 | As a seller, I want to create a listing so I can sell my services | P0 | 8 | • Multi-step form • All fields validated • Preview before submit | • Incomplete → save draft |
| US-12.2 | As a seller, I want to upload photos so my listing looks attractive | P0 | 5 | • Min 3, max 20 photos • Format validation • Reorder capability | • Upload fails → retry |
| US-12.3 | As a seller, I want to set pricing so customers know the cost | P0 | 3 | • Base price • Seasonal pricing • Per-unit pricing | • Invalid price → error |
| US-12.4 | As a seller, I want to configure group tiers so I can offer group discounts | P1 | 5 | • 2-5 tiers • Progressive discounts enforced | • Non-progressive → error |
| US-12.5 | As a seller, I want to manage availability so I don’t get overbooked | P0 | 5 | • Calendar interface • Block dates • Inventory count | • Double booking prevented |
| US-12.6 | As a seller, I want to set cancellation policy so customers know terms | P0 | 2 | • Policy selection • Displayed on listing | • N/A |
| US-12.7 | As a seller, I want to pause/resume listing so I can control visibility | P1 | 2 | • Pause button • Resume button • Status indicator | • Active bookings → warning |
| US-12.8 | As an admin, I want to review new listings so I can maintain quality | P0 | 5 | • Review queue • Approve/Reject • Feedback to seller | • Violation → reject with reason |

**Epic Total: 35 SP**

---

## Epic 13: Seller Dashboard & Analytics

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-13.1 | As a seller, I want a dashboard overview so I can see my performance | P0 | 5 | • Today’s bookings • Revenue summary • Pending actions | • No data → onboarding tips |
| US-13.2 | As a seller, I want to view my bookings so I can manage them | P0 | 5 | • List view • Filter by status • Booking details | • No bookings → “Get started” |
| US-13.3 | As a seller, I want to view earnings so I can track revenue | P0 | 3 | • Pending, Released, Total • Date filters | • N/A |
| US-13.4 | As a seller, I want to view payout history so I can reconcile | P0 | 3 | • Payout list • Status, Amount, Date | • Failed payout → alert |
| US-13.5 | As a seller, I want to view analytics so I can improve performance | P1 | 5 | • Views, Bookings, Conversion • Trend charts | • Insufficient data → message |
| US-13.6 | As a seller, I want to manage reviews so I can respond to feedback | P1 | 3 | • Review list • Response capability | • N/A |

**Epic Total: 24 SP**

---

## Epic 14: Admin Panel

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-14.1 | As an admin, I want a dashboard so I can monitor platform health | P0 | 8 | • Key metrics • Alerts • Pending items | • Data delay → “Updated X min ago” |
| US-14.2 | As an admin, I want to manage users so I can handle account issues | P0 | 5 | • User list • Search • Edit/Suspend/Delete | • Delete with active bookings → warning |
| US-14.3 | As an admin, I want to manage sellers so I can maintain quality | P0 | 5 | • Seller list • Verification queue • Performance view | • N/A |
| US-14.4 | As an admin, I want to manage listings so I can moderate content | P0 | 5 | • Listing queue • Approve/Reject/Feature | • Violation → suspend + notify |
| US-14.5 | As an admin, I want to manage bookings so I can handle exceptions | P0 | 5 | • Booking search • Manual actions • Audit logging | • N/A |
| US-14.6 | As an admin, I want to manage transactions so I can handle financial issues | P0 | 5 | • Transaction list • Manual refunds • Escrow controls | • N/A |
| US-14.7 | As an admin, I want to manage promotions so I can drive sales | P1 | 5 | • Create/Edit deals • Schedule • Target listings | • Expired deal → auto-deactivate |
| US-14.8 | As an admin, I want to manage content so I can update the website | P1 | 5 | • Homepage sections • Banners • FAQ | • N/A |
| US-14.9 | As an admin, I want audit logs so I can track all actions | P0 | 3 | • All actions logged • Searchable • Export | • N/A |
| US-14.10 | As an admin, I want reports so I can make business decisions | P0 | 5 | • Revenue, Bookings, Users • Export • Schedule | • N/A |

**Epic Total: 51 SP**

---

## Epic 15: Notifications & Communications

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-15.1 | As a user, I want email notifications so I stay informed | P0 | 5 | • All triggers configured • Templates branded • Delivery tracking | • Bounce → retry |
| US-15.2 | As a user, I want SMS notifications so I get urgent updates | P0 | 5 | • Critical triggers only • Short format • Delivery tracking | • Delivery fail → email fallback |
| US-15.3 | As a user, I want in-app notifications so I see updates when logged in | P0 | 5 | • Notification center • Read/Unread • Click to action | • N/A |
| US-15.4 | As a user, I want to manage notification preferences so I control what I receive | P1 | 3 | • Channel toggles • Category toggles • Critical non-optional | • N/A |
| US-15.5 | As a user, I want to message sellers so I can ask questions | P1 | 5 | • Inbox interface • Thread by booking/listing | • Spam filter |

**Epic Total: 23 SP**

---

## Epic 16: Homepage & Content

| Story ID | User Story | Priority | SP | Acceptance Criteria | Edge Cases |
| --- | --- | --- | --- | --- | --- |
| US-16.1 | As a user, I want a homepage so I can discover listings | P0 | 8 | • All 16 sections rendered • Fast load < 3 sec • Mobile responsive | • Section empty → hide |
| US-16.2 | As a user, I want to see flash deals so I can get discounts | P0 | 5 | • Countdown timer • Deal badge • Auto-expire | • Deal sold out → remove |
| US-16.3 | As a user, I want to see trending listings so I know what’s popular | P0 | 3 | • Based on views/bookings • Updated hourly | • Low data → show popular |
| US-16.4 | As a user, I want to browse by category so I can find specific types | P0 | 3 | • Category grid • Click to filter | • Empty category → hide |
| US-16.5 | As a user, I want to see groups forming so I can join group deals | P0 | 3 | • Active groups shown • Progress visible • Join CTA | • No groups → “Start one” |
| US-16.6 | As a user, I want to understand how it works so I trust the platform | P1 | 3 | • Step-by-step visual • Escrow explanation | • N/A |
| US-16.7 | As a user, I want to read testimonials so I see social proof | P1 | 2 | • Review carousel • Star ratings | • No reviews → hide section |
| US-16.8 | As a user, I want FAQ so I can find answers quickly | P1 | 2 | • Accordion UI • Search within FAQ | • No match → contact support |

**Epic Total: 29 SP**

---

## Sprint Point Summary by Epic

| Epic # | Epic Name | Total Stories | Total SP |
| --- | --- | --- | --- |
| 1 | User Registration & Authentication | 5 | 21 |
| 2 | Search & Discovery | 8 | 24 |
| 3 | Listing Details & Wishlist | 7 | 23 |
| 4 | Individual Booking | 8 | 26 |
| 5 | Group Booking | 9 | 34 |
| 6 | Split Payment | 9 | 31 |
| 7 | Escrow & Proof Verification | 8 | 27 |
| 8 | Price Lock & Refund Guarantee | 5 | 22 |
| 9 | Cancellations & Refunds | 5 | 18 |
| 10 | Disputes | 6 | 30 |
| 11 | Seller Onboarding & Management | 6 | 22 |
| 12 | Listing Management | 8 | 35 |
| 13 | Seller Dashboard & Analytics | 6 | 24 |
| 14 | Admin Panel | 10 | 51 |
| 15 | Notifications & Communications | 5 | 23 |
| 16 | Homepage & Content | 8 | 29 |
| **TOTAL** |  | **103** | **460** |

---

## Recommended Sprint Allocation

| Sprint | Focus | Epics | Est. SP | Duration |
| --- | --- | --- | --- | --- |
| Sprint 1-2 | Foundation | Epic 1, Epic 16 (partial) | 50 | 4 weeks |
| Sprint 3-4 | Discovery & Listings | Epic 2, Epic 3 | 47 | 4 weeks |
| Sprint 5-6 | Individual Booking & Payment | Epic 4, Epic 7 (partial) | 53 | 4 weeks |
| Sprint 7-8 | Group Booking | Epic 5 | 34 | 4 weeks |
| Sprint 9-10 | Split Payment & Price Lock | Epic 6, Epic 8 | 53 | 4 weeks |
| Sprint 11-12 | Escrow Completion & Disputes | Epic 7 (remaining), Epic 9, Epic 10 | 75 | 4 weeks |
| Sprint 13-14 | Seller Portal | Epic 11, Epic 12, Epic 13 | 81 | 4 weeks |
| Sprint 15-16 | Admin & Notifications | Epic 14, Epic 15 | 74 | 4 weeks |
| Sprint 17 | Homepage, Polish, Testing | Epic 16 (remaining), QA | ~30 | 2 weeks |
| **Total** |  |  | **~500** | **34 weeks** |

---

# 17. Success Metrics

## 17.1 Business Metrics

| Metric ID | Metric | Target | Frequency |
| --- | --- | --- | --- |
| BM-001 | Gross Booking Value (GBV) | 20% MoM growth (Year 1) | Weekly |
| BM-002 | Net Revenue | 10% of GBV | Monthly |
| BM-003 | Average Booking Value | BDT 8,000+ | Weekly |
| BM-004 | Daily Bookings | 100+ by Month 6 | Daily |
| BM-005 | Verified Sellers | 500+ by Year 1 | Monthly |
| BM-006 | Active Listings | 2,000+ by Year 1 | Monthly |
| BM-007 | Customer Acquisition Cost | < BDT 500 | Monthly |
| BM-008 | Customer Lifetime Value | BDT 15,000+ | Quarterly |

## 17.2 Feature Adoption Metrics

| Metric ID | Metric | Target | Frequency |
| --- | --- | --- | --- |
| FA-001 | Group Booking Adoption | 35% of bookings | Weekly |
| FA-002 | Split Payment Usage | 60% of group bookings | Weekly |
| FA-003 | Price Lock Adoption | 40% of bookings | Weekly |
| FA-004 | Average Group Size | 5+ participants | Weekly |
| FA-005 | Group Completion Rate | 70% | Weekly |
| FA-006 | Tier Achievement Rate | 50% reach Tier 2+ | Weekly |

## 17.3 Trust & Quality Metrics

| Metric ID | Metric | Target | Frequency |
| --- | --- | --- | --- |
| TQ-001 | Dispute Rate | < 2% | Weekly |
| TQ-002 | Dispute Resolution Time | < 72 hours | Weekly |
| TQ-003 | Escrow Success Rate | 98%+ | Weekly |
| TQ-004 | Proof Submission Rate | 95%+ within deadline | Weekly |
| TQ-005 | Customer Satisfaction (CSAT) | 4.5/5.0+ | Continuous |
| TQ-006 | Net Promoter Score (NPS) | 50+ | Quarterly |
| TQ-007 | Seller Rating Average | 4.3/5.0+ | Weekly |

## 17.4 Conversion Metrics

| Metric ID | Metric | Target | Frequency |
| --- | --- | --- | --- |
| CV-001 | Search to View Rate | 30%+ | Daily |
| CV-002 | View to Book Rate | 5%+ | Daily |
| CV-003 | Cart Abandonment Rate | < 30% | Daily |
| CV-004 | Payment Success Rate | 95%+ | Daily |
| CV-005 | Repeat Booking Rate | 45% by Year 2 | Monthly |

## 17.5 Operational Metrics

| Metric ID | Metric | Target | Frequency |
| --- | --- | --- | --- |
| OP-001 | Seller Verification Time | < 48 hours | Weekly |
| OP-002 | Listing Approval Time | < 24 hours | Daily |
| OP-003 | Support Response Time | < 4 hours | Daily |
| OP-004 | Refund Processing Time | < 5 business days | Weekly |
| OP-005 | Platform Uptime | 99.9%+ | Continuous |
| OP-006 | Page Load Time | < 3 seconds | Continuous |

---

# Appendices

## Appendix A: Booking Status Definitions

| Status | Description | Visible To |
| --- | --- | --- |
| Draft | Booking started, not submitted | Customer |
| Hold | Inventory held, awaiting payment | Customer, Seller |
| Payment Pending | Payment initiated, processing | Customer, Seller |
| Confirmed | Payment successful, booking active | Customer, Seller, Admin |
| Completed | Service delivered, verified | Customer, Seller, Admin |
| Cancelled | Booking cancelled | Customer, Seller, Admin |
| Expired | Hold or payment timed out | Customer |
| Disputed | Dispute raised | Customer, Seller, Admin |
| Refunded | Refund processed | Customer, Seller, Admin |

## Appendix B: Escrow Status Definitions

| Status | Description |
| --- | --- |
| Created | Funds received, holding |
| Pending Proof | Awaiting seller proof |
| Proof Submitted | Proof under review |
| Proof Verified | Proof approved, release pending |
| Proof Rejected | Proof rejected, resubmission needed |
| On Hold | Dispute active, funds frozen |
| Released | Funds released to seller |
| Refunded | Funds returned to customer |

## Appendix C: Notification Templates Summary

| Notification | Channels | Trigger |
| --- | --- | --- |
| Booking Confirmed | Email, SMS | Payment success |
| Payment Received | Email | Payment success |
| Group Member Joined | Email, Push | New member joins |
| Tier Upgraded | Email, Push | Group reaches new tier |
| Split Payment Invite | Email, SMS | Organizer invites |
| Payment Reminder | Email, SMS, Push | 24h, 12h, 2h before deadline |
| Booking Upcoming | Email, Push | 7 days, 1 day before |
| Proof Reminder | Email, Push | 24h, 12h before proof deadline |
| Dispute Update | Email, Push | Status change |
| Refund Processed | Email | Refund complete |

## Appendix D: Glossary

| Term | Definition |
| --- | --- |
| Escrow | Third-party fund holding until service verification |
| Disbursement | Transfer of funds from escrow to seller |
| Formation Window | Time period for group to accept members |
| Price Lock | Feature guaranteeing price with auto-refund on drops |
| Retroactive Refund | Refund to earlier members when tier upgrades |
| Proof of Completion | Evidence submitted by seller for service verification |
| Split Payment | Booking cost divided among group participants |
| Inventory Hold | Temporary reservation during checkout (10 minutes) |
| Tier | Pricing level based on group size |

---

**End of Document**

*DeshGhuri PRD v2.0 | January 2026*