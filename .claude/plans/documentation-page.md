# Documentation Page — Implementation Plan

## Overview
Create a new `/docs` route with a beautifully designed documentation page that follows our dark theme visual language. Add a "Documentation" button to the FloatingNav journey widget.

---

## Part A: Widget Changes (App.jsx)

### A1. Add "Docs" button to FloatingNav
- Add a new button between the Affiliate Simulator button and the collapse arrow
- Style: outlined, yellow border/text, same size as other buttons
- `onClick`: navigates to `/docs`
- Label: "Documentation"

### A2. Add route
- Import `DocumentationPage` from `@pages/DocumentationPage`
- Add `<Route path="/docs" element={<DocumentationPage />} />`

---

## Part B: Documentation Page (`src/pages/DocumentationPage.jsx`)

Single-file React component, ~1200 lines. Dark theme matching the site (`#0a0a0a` bg, `#1a1a1a` cards, Inter font, yellow `#eaef09` accent).

### Layout
- Fixed sidebar nav (left, 240px) with section links
- Scrollable main content area (right)
- Sticky top bar with Namico logo + "← Back" button
- Sections separated by horizontal dividers

---

## Section 1: Journey Tracker Guide

**Title:** "How to Use the Journey Tracker"
**Subtitle:** "A development-only widget for navigating the wireframe prototype"

**Content (all from real codebase data):**

#### What It Is
The floating widget in the bottom-right corner shows your position in the Namico flow. It distinguishes between two roles:
- **Creator** (yellow badge) — the person who creates the naming contest, writes the brief, invites participants, and manages the process
- **Participant** (green badge) — the person invited to submit name ideas, vote, or both

#### Navigation
- **← Prev** / **Next Step →** buttons walk through the flow step by step
- Clickable step circles let you jump to any screen
- Progress bar shows overall completion
- At the final step, the button reads "Journey Complete ✓"

#### Paywall Simulation
**What it shows:** Every place where a free user would see an upgrade prompt. Currently there are **9 paywall moments per segment**:

| # | Moment | Where | Trigger |
|---|--------|-------|---------|
| 1 | Open Submissions | Brief Builder | Toggling "Let participants suggest names" |
| 2 | Participant Cap | Invite Participants | Exceeding free limit (5 for personal/team, 3 for business) |
| 3 | Advanced Voting | Contest Type Selection | Selecting ranked-choice/pairwise/multi-criteria |
| 4 | Naming Methodology | Participant Education | Accessing Catchword articles |
| 5 | Contest Quality Score | Brief Builder sidebar | Viewing quality bar (business/team only) |
| 6 | Automated Reminders | Brief Builder — Deadlines | Setting up email reminders |
| 7 | PDF Report | Results Page | Clicking "Download PDF" (business/team only) |
| 8 | White-label Branding | PDF/Participant View | Previewing output with platform footer |
| 9 | Second Round Discount | Results Page | Selecting "We're still not sure" |

**What's free:** Voting-only mode (creator pre-loads names), up to 5 participants (3 for business), simple-poll voting, basic analytics, shareable URL export.

#### Affiliate Simulation
**What it shows:** Places where users see contextual partner recommendations that generate affiliate revenue. Currently **4 placements per segment**:

**Business:** Namecheap (domain), LegalZoom (trademark), Looka/99designs (logo), LegalZoom (registration)
**Team:** Printful (merch), 99designs (logo), Squarespace (website), Namecheap (domain)
**Personal:** Artifact Uprising (announcements), Etsy (gifts), Amazon (name books), Chewy (pet tags)

---

## Section 2: Complete Feature Specification

**Title:** "Platform Architecture & Flow"

### 2A. Visual Flow Map
ASCII/CSS-based flow diagram showing all routes:

```
Landing Page (/)
  ├── Select Segment (/select) → Business | Team | Personal
  │     └── Select Sub-type (/select/:group)
  │           └── Contest Type (/contest-type/:group/:sub)
  │                 ├── Open Contest (submission_voting)
  │                 │     └── Auth → Brief Builder → Invite → Contest Overview
  │                 │           → Submission Phase → [Curate Shortlist] → Voting → Results
  │                 ├── Voting Only (voting_only)
  │                 │     └── Auth → Upload Names → Invite → Contest Overview
  │                 │           → Voting → Results
  │                 └── Internal Brainstorm (internal_brainstorm)
  │                       └── Auth → Brief Builder → Invite Submitters → Contest Overview
  │                             → Submission Phase → [Curate Shortlist] → Invite Voters → Voting → Results
  └── Dashboard (/dashboard)
        └── Contest Detail (/contest-detail/:id)
```

### 2B. Screen-by-Screen Breakdown

For each screen, document:
- **Purpose** (1-2 sentences)
- **Role** (Creator or Participant)
- **Key features** on that screen
- **Where it leads** (next step)

**Screens (14 total from journey.js):**

1. **Landing Page** — Marketing page with hero, social proof (Catchword clients), pricing cards, methodology section, testimonials, FAQ
2. **Select Segment** — Choose Business ($89), Team ($29), or Personal ($9) with feature previews
3. **Auth / Sign Up** — Email/password or social login
4. **Select Sub-type** — Pick specific naming need (5 business, 6 team, 4 personal sub-segments)
5. **Contest Type** — Choose Open Contest, Voting Only, or Internal Brainstorm + voting method
6. **Brief Builder** — Multi-step form with naming primer, context fields, voting config, prizes, deadline. Fields vary by sub-segment (1-8 required fields)
7. **Upload Names** (voting_only) — Pre-load candidate names for vote-only contests
8. **Invite Participants** — Share contest link, manage voter list, send invitations
9. **Contest Overview** — Creator dashboard for single contest: phase tracker, submissions list, participation stats, quality score, quick actions
10. **Submission Phase** (participant) — Submit name ideas with rationale, view education content, earn naming points
11. **Curate Shortlist** (creator, manual mode only) — Review submissions, select finalists for voting round
12. **Voting Phase** (participant) — Vote on shortlisted names using selected method
13. **Results Page** — Winner announcement with particle animation, vote breakdown, affiliate recommendations, certificate, post-vote reflection
14. **Dashboard** — Multi-contest management: active/completed contests, account overview, subscription status

### 2C. Segments & Sub-segments Table
Full table with all 15 sub-segments, their codes (B1-B5, T1-T6, P1-P4), descriptions, brief field counts, and tone.

### 2D. Double-Sided Quality Score System

**Title:** "Contest Quality Score — Why Both Sides Matter"

**Philosophy:** Naming is a collaborative task. The quality of the result depends equally on:
- **Creator preparation** (0-50 points) — How well the brief is written
- **Participant engagement** (0-50 points) — How educated and active participants are

**Creator Score (0-50):**
- Field completion: each required field = equal share of 40 points (auto-scales)
- Primer bonus: +10 points for reading naming methodology guides
- Fields vary by sub-segment: baby-name needs 1 field, rebrand needs 8

**Participant Score (0-50):**
- Articles read: share of 25 points based on completion %
- Naming points earned: share of 25 points based on activity

**Combined Labels:**
| Range | Label |
|-------|-------|
| 85-100 | Excellent |
| 65-84 | Strong |
| 45-64 | Good |
| 25-44 | Fair |
| 0-24 | Low |

**Key insight:** This system replaces the chaos of "just throw names in a Google Doc" with structured guidance. Creators feel confident their brief is thorough. Participants feel their contributions are valued and informed. The score is visible to both sides — creating shared accountability.

### 2E. Contest Types Explained

| Type | Flow | Who submits names? | Who votes? |
|------|------|--------------------|------------|
| Open Contest | Full flow | Participants | Participants |
| Voting Only | Shortened | Creator pre-loads | Participants |
| Internal Brainstorm | Extended | Submitter group | Separate voter group |

---

## Section 3: Pricing & Revenue Model

**Title:** "Pricing Strategy & Revenue Projections"

### 3A. Pricing Architecture

**Per-contest pricing (not subscription):**

| Tier | Price | Max Participants | Price/Participant |
|------|-------|-----------------|-------------------|
| Personal | $9 | 15 | $0.60 |
| Team | $29 | 60 | $0.48 |
| Business | $89 | 240 | $0.37 |

**Scaling logic:**
- Price scales ~3x between tiers ($9 → $29 → $89)
- Participants scale ~4x between tiers (15 → 60 → 240)
- Price per participant decreases at higher tiers — rewarding larger contests
- Free tier: 5 participants (3 for business), voting-only mode

**Why these prices (research-backed):**
- Competitors charge $89-$1,999 per contest (Squadhelp $299+, Crowdspring $299+, NamingForce $649+, Hatchwise $89+)
- Namico's $9-$89 range is **3-30x cheaper** than any competitor
- NameStation is closest at $35-$45 but with fewer features
- **Why competitors are more expensive:** Most naming contest platforms (Squadhelp, Crowdspring, NamingForce) are creative marketplaces that source freelance namers to work on your project — their pricing includes prize pools, freelancer payouts, and managed service overhead. Namico is fundamentally different: it's a collaborative decision tool for teams and families who already have people with opinions. No freelancers, no prize pools — just structured naming with the people who matter.
- Our model works because: no prize pool needed (naming decisions, not freelance work), self-serve (no managed service overhead), purpose-built for collaborative naming (not creative marketplace)

**Business Credit Packs:**
| Pack | Credits | Total | Per Contest | Savings |
|------|---------|-------|-------------|---------|
| Starter | 3 | $99 | $33 | $18 |
| Pro | 10 | $299 | $29.90 | $91 |
| Enterprise | 25 | $649 | $25.96 | $326 |

### 3B. Revenue Streams

**Stream 1: Contest Purchases**
Direct revenue from paid contests at $9/$29/$89 per contest.

**Stream 2: Affiliate Revenue**
Contextual partner placements on the Results Page:

| Partner | Commission | Avg Order | Est. Revenue/Click |
|---------|-----------|-----------|-------------------|
| Namecheap | 20% | $12 domain | $2.40 |
| LegalZoom | 15% | $150 avg | $22.50 |
| 99designs | $60-100/sale | $299+ | $60 |
| Looka | 25-35% | $65 logo | $16-23 |
| Printful | 10% | $30 avg | $3 |
| Squarespace | $100+/sale | $144/yr | $100 |
| Artifact Uprising | 8-12% | $40 avg | $4 |
| Etsy | 4% | $35 avg | $1.40 |

### 3C. Revenue Projections (Traffic-Based)

**Funnel assumptions:**
- Visitor → starts free contest: 8-12% (high-intent tool, not blog traffic)
- Free contest → paid upgrade: 3-5% (industry median per OpenView/First Page Sage)
- Paid contest reaches Results Page: ~90%
- Results Page → affiliate click: 10-15%
- Affiliate click → conversion: 2-4%
- Contest mix: 50% personal ($9), 30% team ($29), 20% business ($89)
- Weighted average contest price: ~$23

**Traffic-based projections — Pessimistic:**

| Month | Monthly Visitors | Free Contests | Paid Contests | Contest Rev | Affiliate Rev | Total |
|-------|-----------------|---------------|---------------|-------------|---------------|-------|
| 3 | 800 | 64 | 2 | $46 | $8 | $54 |
| 6 | 2,000 | 160 | 5 | $115 | $25 | $140 |
| 12 | 5,000 | 400 | 12 | $276 | $60 | $336 |
| 18 | 8,000 | 640 | 19 | $437 | $100 | $537 |
| 24 | 12,000 | 960 | 29 | $667 | $150 | $817 |

Pessimistic Year 1 total: ~$1,500 | Year 2 total: ~$8,200

**Traffic-based projections — Moderate:**

| Month | Monthly Visitors | Free Contests | Paid Contests | Contest Rev | Affiliate Rev | Total |
|-------|-----------------|---------------|---------------|-------------|---------------|-------|
| 3 | 2,000 | 200 | 8 | $184 | $30 | $214 |
| 6 | 5,000 | 500 | 20 | $460 | $100 | $560 |
| 12 | 15,000 | 1,500 | 60 | $1,380 | $350 | $1,730 |
| 18 | 25,000 | 2,500 | 100 | $2,300 | $650 | $2,950 |
| 24 | 40,000 | 4,000 | 160 | $3,680 | $1,100 | $4,780 |

Moderate Year 1 total: ~$10,000 | Year 2 total: ~$42,000

**Traffic-based projections — Optimistic:**

| Month | Monthly Visitors | Free Contests | Paid Contests | Contest Rev | Affiliate Rev | Total |
|-------|-----------------|---------------|---------------|-------------|---------------|-------|
| 3 | 5,000 | 600 | 30 | $690 | $120 | $810 |
| 6 | 15,000 | 1,800 | 90 | $2,070 | $500 | $2,570 |
| 12 | 40,000 | 4,800 | 240 | $5,520 | $1,800 | $7,320 |
| 18 | 70,000 | 8,400 | 420 | $9,660 | $3,500 | $13,160 |
| 24 | 100,000 | 12,000 | 600 | $13,800 | $5,500 | $19,300 |

Optimistic Year 1 total: ~$40,000 | Year 2 total: ~$160,000

**Notes:**
- Traffic numbers assume organic SEO + content marketing + word-of-mouth. No paid acquisition budget factored in.
- Affiliate revenue is conservative — only counts Results Page placements. Brief Builder placements (e.g., Amazon baby name books) would add incremental revenue.
- Credit pack upsells for repeat business users are not included — these would lift business segment revenue significantly.
- Per-contest model means no recurring churn — each sale is one-time. Repeat usage is gravy, not a dependency.

---

## Section 4: Wireframe Scope Reminder

**Title:** "What This Wireframe Is — and Isn't"

### What this wireframe defines:
- Complete user flows for all 3 segments and 15 sub-segments
- Screen-by-screen logic and navigation
- Paywall trigger points and upgrade messaging
- Affiliate placement strategy
- Quality scoring system architecture
- Pricing model and tier structure
- Contest lifecycle from brief to results

### What this wireframe is NOT:
- Actual platform development (Phase 3 — separate SOW)
- Go-to-market strategy and marketing channel planning
- Copywriting — educational content, website copy, and any other written content (structure and topics are defined in the feature spec; actual writing is a separate effort)
- Visual design (brand identity, color system, typography, UI polish)
- Any live backend, database, or payment integration

### Important note:
Wireframes set the base logic and architecture for the build. Exact field placements, layouts, text, and visual details will evolve during development — for example, educational content sections will be refined in the final build, naming tips will be rewritten, and UI elements will be polished. The core logic and step-by-step flows, however, should remain largely as defined in this Phase 2 wireframe.

### What comes next:
The current wireframe is very close to becoming a functioning product. The next steps are:
1. Adapting layouts for mobile and tablet
2. Connecting the backend (auth, database, payment processing)
3. Writing production copy and educational content
4. Visual design polish (brand identity finalization)
5. Turning it into a real, functioning product

---

## Part C: Visual Design Spec

- **Background:** `#0a0a0a` (page), `#1a1a1a` (cards/sections)
- **Accent:** `#eaef09` (yellow) for headings, labels, highlights
- **Text:** `#ffffff` (headings), `#a1a1a1` (body), `#7a7a7a` (muted)
- **Tables:** dark borders `rgba(255,255,255,0.08)`, alternating row `#141414`
- **Section headers:** Yellow uppercase label + white heading + grey subtitle
- **Flow diagram:** CSS boxes with colored borders per segment
- **Cards:** `#1a1a1a` bg, subtle border, 12px border-radius
- **Sidebar:** Fixed left, `#0f0f0f` bg, yellow active state
- **Font:** Inter throughout, monospace for code/technical values

---

## Implementation Order
1. Create `src/pages/DocumentationPage.jsx` with all 4 sections
2. Add route in `App.jsx`
3. Add "Documentation" button to FloatingNav in `App.jsx`
4. Test build
5. Commit and push
