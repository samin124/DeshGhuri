# Product Requirements Document (PRD)

# **DeshGhuri**

## Phase 2/3 Expansion: Mobile, Notifications, Advanced Ops, and Growth Systems

---

---

### **Table of Contents**

[1. Executive Summary](#1-executive-summary)

[2. User Roles & Permissions](#2-user-roles--permissions)

[3. Homepage & Website Sections](#3-homepage--website-sections)

[4. Search & Discovery](#4-search--discovery)

[5. Listing Details & Booking Panel](#5-listing-details--booking-panel)

[6. Booking Engine (Hold -> Pay -> Confirmed)](#6-booking-engine-hold---pay---confirmed)

[7. Escrow + Proof-Based Confirmation](#7-escrow--proof-based-confirmation)

[8. Group Booking Discounts](#8-group-booking-discounts)

[9. Price Lock + Refund Guarantee](#9-price-lock--refund-guarantee)

[10. Split Payment](#10-split-payment)

[11. Seller Portal](#11-seller-portal)

[12. Admin Panel & Operations](#12-admin-panel--operations)

[13. Notifications](#13-notifications)

[14. Mobile App](#14-mobile-app)

[15. Edge Cases / Exceptions](#15-edge-cases--exceptions)

[16. User Stories + Sprint Points (Fibonacci)](#16-user-stories--sprint-points-fibonacci)

[17. Success Metrics](#17-success-metrics)

[Appendices](#appendices)

# 1. Executive Summary

## 1.1 Product Overview

DeshGhuri Phase 2/3 expands the existing multi-vendor travel marketplace into a **mobile-first, notification-driven, and ops-optimized platform**. This phase focuses on:

- **Mobile apps** (iOS/Android) for customers and sellers
- **Push notifications** and richer communications
- **Advanced seller operations** (inventory, payouts, compliance, and analytics)
- **Stronger admin tooling** (audit logs, dispute automation, monitoring)
- **Growth systems** (loyalty, referrals, retention)

The core booking, escrow, group booking, and price-lock mechanisms remain unchanged but are extended to support mobile and higher-volume operations.

## 1.2 Product Vision

Phase 2/3 aims to make DeshGhuri a **trust-first travel marketplace that works seamlessly across web and mobile**, reduces seller friction, and gives admins the tooling to maintain quality at scale. The experience must remain automated and rule-driven while adapting to higher booking volume and multi-channel engagement.

## 1.3 Business Goals

| ID       | Goal                                  | Target                          | Timeline |
| -------- | ------------------------------------- | ------------------------------- | -------- |
| GOAL-101 | Increase repeat booking rate          | 50% by end of Phase 3           | Year 2   |
| GOAL-102 | Launch mobile apps                    | 50k installs in 6 months        | Year 2   |
| GOAL-103 | Push notification adoption            | 60% opt-in of active users      | Year 2   |
| GOAL-104 | Improve seller operational efficiency | 30% fewer manual support tickets| Year 2   |
| GOAL-105 | Reduce dispute resolution time        | < 48 hours average              | Year 2   |
| GOAL-106 | Increase seller retention             | 80% active sellers quarterly    | Year 2   |
| GOAL-107 | Expand verified sellers               | 1,500+ verified sellers         | Year 2   |

### 1.4 Prototype

Phase 2/3 includes web enhancements plus mobile app UX prototypes. Web prototype from v2 remains the baseline.

---

# 2. User Roles & Permissions

## 2.1 Role Definitions (Additions)

| Role ID  | Role Name             | Description                                    |
| -------- | --------------------- | ---------------------------------------------- |
| ROLE-012 | Support Agent         | Handles tickets and customer disputes          |
| ROLE-013 | Content Moderator     | Reviews listings, media, and seller profiles   |
| ROLE-014 | Finance Auditor       | Reviews escrow releases and payout discrepancies |

## 2.2 Permissions Matrix (New Permissions)

| Permission                     | Admin | Super Admin | Support | Moderator | Finance |
| ----------------------------- | ----- | ----------- | ------- | --------- | ------- |
| Access support tickets        | -     | -           | X       | -         | -       |
| Moderate listings/media       | -     | -           | -       | X         | -       |
| Approve/reject disputes       | X     | X           | X       | -         | -       |
| Audit escrow and payouts      | X     | X           | -       | -         | X       |
| Manage notification templates | X     | X           | -       | -         | -       |

---

# 3. Homepage & Website Sections

## 3.1 Phase 2/3 Additions

| Section # | Section Name          | Purpose                                 | Key Interactions                         |
| --------- | --------------------- | --------------------------------------- | ---------------------------------------- |
| 17        | Loyalty Banner         | Promote points and rewards             | View points -> Rewards page              |
| 18        | App Download           | Encourage mobile installs              | App store badges -> app store            |
| 19        | Referral Promo         | Boost growth via referrals             | Share link -> referral tracking          |

## 3.2 Mobile Web Enhancements

- Sticky booking CTA on listing pages
- Faster image loading and reduced data mode
- In-app banners for mobile app install

---

# 4. Search & Discovery

## 4.1 Phase 2/3 Search Features

| Feature ID | Feature              | Description                                   | Behavior                                   |
| ---------- | -------------------- | --------------------------------------------- | ------------------------------------------ |
| SRC-014    | Nearby Search         | Location-based discovery                      | Uses GPS (mobile) or city fallback         |
| SRC-015    | Voice Search          | Voice-based search on mobile                  | Language detection, text fallback          |
| SRC-016    | Smart Re-ranking      | Personalized ranking using history + intent   | A/B testable, explainable badges           |
| SRC-017    | Off-peak Deals Filter | Highlights off-peak and last-minute discounts | Toggle, filter by time window              |

---

# 5. Listing Details & Booking Panel

## 5.1 Phase 2/3 Enhancements

- Mobile-native gallery viewer with swipe and download
- Seller response time badge and reliability score
- Live availability indicator (updated every 5 minutes)
- Accessibility improvements (screen reader labels, contrast)

---

# 6. Booking Engine (Hold -> Pay -> Confirmed)

## 6.1 Mobile and Notification Enhancements

- Booking status shown as a **timeline** with notifications at each step
- Push notification for payment success, hold expiration, and reminder
- Offline-friendly confirmation screen with cached booking ID

---

# 7. Escrow + Proof-Based Confirmation

## 7.1 Phase 2/3 Enhancements

- Proof submission from mobile (photo uploads)
- Escrow automation rules for low-risk listings
- Finance audit queue with SLA tracking

---

# 8. Group Booking Discounts

## 8.1 Phase 2/3 Enhancements

- Group chat for participants
- Auto-reminder for pending split payments
- Group organizer analytics (progress, payment completion)

---

# 9. Price Lock + Refund Guarantee

## 9.1 Phase 2/3 Enhancements

- Auto price-drop notifications
- Bulk refund processing for group price-lock adjustments

---

# 10. Split Payment

## 10.1 Phase 2/3 Enhancements

- Saved payment methods for faster split payments
- Auto-retry on failed participant payments
- Group payment dashboard in mobile app

---

# 11. Seller Portal

## 11.1 Phase 2/3 Seller Enhancements

- **Listing Management v2**: seasonal pricing, inventory rules, blackout dates
- **Payouts v2**: bank verification, payout scheduling, tax documents
- **Seller App**: basic listing and booking management on mobile
- **Quality Insights**: cancellation rate, response time, review trends

---

# 12. Admin Panel & Operations

## 12.1 Phase 2/3 Admin Enhancements

- Support ticket system with SLA tracking
- Audit logs with export and filtering
- Fraud signals dashboard (suspicious bookings, chargebacks)
- Bulk actions (approve listings, refund batches)
- Notification template editor

---

# 13. Notifications

## 13.1 Phase 2/3 Notification Channels

| Channel | Description                     | Phase |
| ------- | ------------------------------- | ----- |
| Email   | Full templates, transactional   | 2     |
| SMS     | Critical updates only           | 2     |
| Push    | Mobile app notifications        | 2     |
| In-App  | Notification center (web/mobile)| 2     |
| WhatsApp| Optional in Phase 3             | 3     |

## 13.2 Template Categories (New)

- Price drop alerts
- Group completion reminders
- Loyalty rewards and referral invites
- Seller payout notifications

---

# 14. Mobile App

## 14.1 Scope

**Customer App**
- Browse, search, book, pay
- Manage bookings and group payments
- Push notifications and loyalty points

**Seller App**
- Booking alerts
- Proof submission and payout tracking
- Lightweight listing updates

## 14.2 Platforms

- iOS and Android (single shared codebase preferred)
- Offline support for booking confirmation and ticket access

---

# 15. Edge Cases / Exceptions

- Push notification disabled -> fallback to email + in-app
- Offline booking confirmation -> cached booking view with sync
- Seller payout failure -> auto-retry + finance queue
- Group payment deadline missed -> auto-cancel with partial refund rules
- GPS permission denied -> fallback to city selection

---

# 16. User Stories + Sprint Points (Fibonacci)

## Epic 17: Mobile App (Customer)

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-17.1  | As a customer, I want to browse listings on mobile             | P0       | 8   | Smooth scroll, cached images               | Slow net  |
| US-17.2  | As a customer, I want to book and pay in the app               | P0       | 8   | Full booking flow, secure payment          | Payment fail |
| US-17.3  | As a customer, I want booking timelines                       | P1       | 5   | Timeline with status changes               | Offline   |
| US-17.4  | As a customer, I want push notifications                       | P0       | 5   | Opt-in, delivery tracking                  | Opt-out   |

**Epic Total: 26 SP**

## Epic 18: Mobile App (Seller)

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-18.1  | As a seller, I want booking alerts on mobile                   | P0       | 5   | Push alerts, quick view                    | Offline   |
| US-18.2  | As a seller, I want to submit proof via mobile                 | P0       | 5   | Photo upload, retry on fail                | Poor net  |
| US-18.3  | As a seller, I want to track payouts                           | P1       | 3   | Payout list, status updates                | N/A       |

**Epic Total: 13 SP**

## Epic 19: Notifications v2

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-19.1  | As a user, I want push notifications                           | P0       | 5   | Delivery logs, opt-in control              | Opt-out   |
| US-19.2  | As a user, I want notification preferences                     | P0       | 5   | Per-category toggles                       | Critical locked |
| US-19.3  | As admin, I want template management                           | P1       | 5   | Edit templates, preview                    | Invalid tokens |

**Epic Total: 15 SP**

## Epic 20: Payment System (Core)

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-20.1  | As a customer, I want to complete payments securely            | P0       | 5   | Payment success -> confirmation + receipt  | Gateway timeout |
| US-20.2  | As a customer, I want to retry failed payments                 | P0       | 5   | Up to 3 retries, clear failure reasons     | Duplicate charge |
| US-20.3  | As a customer, I want to save payment methods                  | P1       | 3   | Tokenized methods, delete anytime          | Token expired |
| US-20.4  | As a customer, I want payment history and receipts             | P1       | 3   | History list, receipt download             | Missing data |
| US-20.5  | As a customer, I want refunds to be initiated and tracked      | P0       | 5   | Refund request -> status updates           | Partial refund |
| US-20.6  | As an admin, I want payment monitoring and overrides           | P0       | 5   | Transaction list, manual retry, audit log  | Large volume |

**Epic Total: 26 SP**

## Epic 21: Seller Ops v2

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-21.1  | As a seller, I want seasonal pricing                           | P0       | 5   | Date-based pricing rules                   | Overlap   |
| US-21.2  | As a seller, I want payout scheduling                           | P0       | 5   | Schedule by weekly/monthly                 | Missed run |
| US-21.3  | As a seller, I want quality insights                           | P1       | 5   | Dashboard insights, trends                 | Low data  |

**Epic Total: 15 SP**

## Epic 22: Admin Ops v2

| Story ID | User Story                                                     | Priority | SP  | Acceptance Criteria                        | Edge Cases |
| -------- | -------------------------------------------------------------- | -------- | --- | ------------------------------------------ | --------- |
| US-22.1  | As admin, I want audit logs with export                        | P0       | 5   | Filter + CSV export                        | Large data |
| US-22.2  | As admin, I want support tickets                               | P0       | 5   | SLA tracking, status changes               | N/A       |
| US-22.3  | As admin, I want fraud dashboard                               | P1       | 5   | Signals, flags, manual review              | False positive |

**Epic Total: 15 SP**

---

## Sprint Point Summary by Epic

| Epic #    | Epic Name                      | Total Stories | Total SP |
| --------- | ------------------------------ | ------------- | -------- |
| 17        | Mobile App (Customer)          | 4             | 26       |
| 18        | Mobile App (Seller)            | 3             | 13       |
| 19        | Notifications v2               | 3             | 15       |
| 20        | Payment System (Core)          | 6             | 26       |
| 21        | Seller Ops v2                  | 3             | 15       |
| 22        | Admin Ops v2                   | 3             | 15       |
| **TOTAL** |                                | **22**        | **110**  |

---

## Recommended Sprint Allocation

| Sprint       | Focus                          | Epics                     | Est. SP | Duration |
| ------------ | ------------------------------ | ------------------------- | ------- | -------- |
| Sprint 1-2   | Mobile foundation              | Epic 17 (part)            | 20      | 4 weeks  |
| Sprint 3-4   | Mobile booking + payments + push | Epic 17 (remaining), 19, 20 | 32      | 4 weeks  |
| Sprint 5-6   | Seller mobile + ops             | Epic 18, 21               | 28      | 4 weeks  |
| Sprint 7-8   | Admin ops + stabilization        | Epic 22                   | 15      | 4 weeks  |
| Sprint 9     | QA, performance, polish         | Cross-epic                | 10-15   | 2 weeks  |

---

# 17. Success Metrics

## 17.1 Business Metrics

| Metric ID | Metric                       | Target                     | Frequency |
| --------- | ---------------------------- | -------------------------- | --------- |
| BM-101    | Mobile install count         | 50k in 6 months            | Weekly    |
| BM-102    | Mobile booking share         | 35% of total bookings      | Weekly    |
| BM-103    | Seller churn rate            | < 5% monthly               | Monthly   |
| BM-104    | Support ticket volume        | 30% reduction              | Monthly   |

## 17.2 Feature Adoption Metrics

| Metric ID | Metric                    | Target                 | Frequency |
| --------- | ------------------------- | ---------------------- | --------- |
| FA-101    | Push opt-in rate           | 60%                    | Weekly    |
| FA-102    | Seller payout scheduling   | 50% of sellers         | Monthly   |
| FA-103    | Seasonal pricing adoption  | 40% of active listings | Monthly   |

## 17.3 Trust & Quality Metrics

| Metric ID | Metric                       | Target               | Frequency |
| --------- | ---------------------------- | -------------------- | --------- |
| TQ-101    | Dispute resolution time      | < 48 hours           | Weekly    |
| TQ-102    | Escrow automation accuracy   | 99%+                 | Weekly    |

## 17.4 Operational Metrics

| Metric ID | Metric                  | Target               | Frequency |
| --------- | ----------------------- | -------------------- | --------- |
| OP-101    | Payout processing time  | < 48 hours           | Weekly    |
| OP-102    | Notification delivery   | 98%+ success         | Daily     |
| OP-103    | Mobile crash-free rate  | 99.5%+               | Daily     |

---

# Appendices

## Appendix A: Mobile Status Definitions

| Status          | Description                       |
| --------------- | --------------------------------- |
| Offline Cached  | Booking data cached for offline   |
| Sync Pending    | Offline data pending sync         |
| Sync Failed     | Sync error, retry needed          |

## Appendix B: Notification Status Definitions

| Status          | Description                       |
| --------------- | --------------------------------- |
| Queued          | Awaiting delivery                 |
| Sent            | Delivered to provider             |
| Failed          | Delivery failed                   |
| Retried         | Retry in progress                 |

## Appendix C: Glossary Additions

| Term              | Definition                                      |
| ----------------- | ----------------------------------------------- |
| Push Opt-in       | User consent to receive push notifications      |
| SLA               | Service Level Agreement for support timing      |
| Fraud Signal      | Pattern indicating suspicious behavior          |

---

**End of Document**

_DeshGhuri PRD v3.0 | February 2026_
