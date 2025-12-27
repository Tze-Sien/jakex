# Product Requirements Document (PRD)
## META Marketing API SDK Integration with Mock Support

**Version:** 1.0
**Date:** 2025-12-27
**Project:** JakeX - META Ads Marketing Platform
**Author:** Product Team

---

## 1. Executive Summary

### 1.1 Purpose
This PRD outlines the integration of the official META Marketing API SDK into the JakeX platform's `meta-api` package, with a dual-mode architecture supporting both real META API calls and mock API responses for development without META account credentials.

### 1.2 Business Context
- **Current Challenge:** We do not yet have a registered META Business account for production API access
- **Development Need:** Frontend and backend development must continue without blocking on META approval
- **Solution:** Build a production-ready META API integration layer that can seamlessly switch between mock and real APIs

### 1.3 Success Criteria
- ✅ Official `facebook-nodejs-business-sdk` fully integrated
- ✅ Mock API provides realistic responses matching META's API schema
- ✅ Single environment variable switches between mock/real modes
- ✅ Dashboard displays live data from either mock or real META API
- ✅ All data persists to PostgreSQL database with sync tracking
- ✅ Type-safe TypeScript interfaces across the stack

---

## 2. Current State Analysis

### 2.1 Architecture Overview

**Monorepo Structure (Turborepo):**
```
jakex/
├── apps/
│   └── web/              # Next.js 16 app (dashboard, auth flows)
├── packages/
│   ├── meta-api/         # META API client wrapper ⚠️ NEEDS WORK
│   ├── database/         # Drizzle ORM schemas
│   ├── auth/             # Supabase authentication
│   └── ui/               # shadcn/ui components
```

### 2.2 Existing Implementation

#### 2.2.1 `meta-api` Package ([packages/meta-api/](packages/meta-api/))

**Status:** ⚠️ Partially Implemented

**Current Features:**
- ✅ `facebook-nodejs-business-sdk` v24.0.1 installed
- ✅ `MetaAdsClient` class with dual-mode support
- ✅ TypeScript interfaces for all META entities
- ✅ Methods defined: `getAdAccounts()`, `getCampaigns()`, `getAdSets()`, `getAds()`, `getInsights()`
- ✅ Mock data generation in [mock-data.ts](packages/meta-api/src/mock-data.ts)

**File Structure:**
```
packages/meta-api/
├── src/
│   ├── index.ts          # Exports
│   ├── types.ts          # TypeScript interfaces (MetaAdAccount, MetaCampaign, etc.)
│   ├── client.ts         # MetaAdsClient class
│   └── mock-data.ts      # Mock data generator
└── package.json
```

**Key Code - Dual Mode Pattern ([client.ts:9-15](packages/meta-api/src/client.ts#L9-L15)):**
```typescript
constructor(accessToken: string) {
  this.accessToken = accessToken;
  this.useMock = process.env.NEXT_PUBLIC_USE_MOCK_META_API === "true";

  if (!this.useMock) {
    FacebookAdsApi.init(this.accessToken);
  }
}
```

**Issues:**
- ❌ Mock API endpoint exists but not fully integrated
- ❌ Error handling is minimal
- ❌ No retry logic for API failures
- ❌ Pagination not implemented
- ❌ Rate limiting not handled

#### 2.2.2 Mock API Endpoint ([apps/web/app/api/mock/meta/\[...slug\]/route.ts](apps/web/app/api/mock/meta/[...slug]/route.ts))

**Status:** ✅ Implemented

**Features:**
- Returns realistic mock data matching META API schema
- 300ms artificial delay to simulate network latency
- Hardcoded dataset:
  - 1 ad account (`act_123456789`)
  - 3 campaigns (varied performance profiles)
  - 3 ad sets
  - 3 ads
  - 2 insights records

**Supported Routes:**
- `GET /api/mock/meta/me/adaccounts`
- `GET /api/mock/meta/act_{id}/campaigns`
- `GET /api/mock/meta/act_{id}/adsets`
- `GET /api/mock/meta/act_{id}/ads`
- `GET /api/mock/meta/{entityId}/insights`

**Issues:**
- ❌ Static dataset (no dynamic generation)
- ❌ No support for query parameters (date ranges, pagination)
- ❌ No error simulation (always returns 200)

#### 2.2.3 Database Schema ([packages/database/src/schema.ts](packages/database/src/schema.ts))

**Status:** ✅ Fully Designed

**Tables:**
```
profiles                          # User accounts
metaConnections                   # OAuth tokens & user info
adAccounts                        # META ad accounts
campaigns                         # Ad campaigns
adSets                           # Ad sets
ads                              # Individual ads
insights                         # Performance metrics
reports                          # Report snapshots
userSelectedAdAccount            # Active account selection
```

**Key Features:**
- ✅ Hierarchical foreign key relationships
- ✅ `lastSyncedAt` timestamps for incremental sync
- ✅ JSONB fields for flexible metadata
- ✅ Unique constraints on META IDs

**Issues:**
- ❌ No sync logic implemented
- ❌ No data fetching or persistence in app

#### 2.2.4 Dashboard UI ([apps/web/app/dashboard/page.tsx](apps/web/app/dashboard/page.tsx))

**Status:** ⚠️ UI Complete, Data Integration Missing

**Current Implementation:**
- ✅ Card-based ad review interface (swipeable)
- ✅ XP/gamification system (level, streak, rewards)
- ✅ Performance metrics display (spend, ROAS, CTR, etc.)
- ✅ Mobile-responsive layout

**Critical Issue:**
```typescript
// Line 26-54: HARDCODED MOCK DATA
const mockAds = [
  {
    id: "1",
    title: "Summer Sale - 50% Off!",
    // ... static data
  },
  // ...
]
```

**What's Missing:**
- ❌ No `MetaAdsClient` method calls
- ❌ No loading states
- ❌ No error handling
- ❌ No data fetching from API
- ❌ No connection to database

#### 2.2.5 OAuth Flow ([apps/web/app/authorize-meta/](apps/web/app/authorize-meta/))

**Status:** ⚠️ Simulated Only

**Current Flow:**
1. `/authorize-meta` → Shows "Connect Meta Ads" button
2. 2-second fake loading animation
3. → `/select-account` → Mock account selection
4. → `/collect-data` → 10-15s simulated data collection
5. → `/dashboard` → Shows hardcoded ads

**Issues:**
- ❌ No real OAuth 2.0 implementation
- ❌ No token storage
- ❌ No token refresh logic

---

## 3. Target State (Final Implementation)

### 3.1 Architecture Goals

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Web App                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Dashboard UI │  │ Settings UI  │  │  Reports UI  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │  Server Actions │                       │
│                    │  & API Routes   │                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐      ┌─────▼──────┐      ┌────▼─────┐
    │ Database │      │  meta-api  │      │   Auth   │
    │ (Drizzle)│      │   Package  │      │ (Supabase)│
    └──────────┘      └─────┬──────┘      └──────────┘
                            │
              ┌─────────────┴─────────────┐
              │   NEXT_PUBLIC_USE_MOCK    │
              │   _META_API=true/false    │
              └─────────────┬─────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
    ┌────▼─────────────┐          ┌───────────▼────────┐
    │  Mock API        │          │  Real META API     │
    │  (Local Server)  │          │  Graph API v19.0   │
    │                  │          │                    │
    │ - Static data    │          │ - facebook-nodejs  │
    │ - 300ms delay    │          │   -business-sdk    │
    │ - Development    │          │ - Production       │
    └──────────────────┘          └────────────────────┘
```

### 3.2 Feature Requirements

#### FR-1: Dual-Mode META API Integration

**Priority:** P0 (Critical)

**Description:**
The `meta-api` package MUST support seamless switching between mock and real META APIs via a single environment variable.

**Acceptance Criteria:**
- `NEXT_PUBLIC_USE_MOCK_META_API=true` → Uses mock API endpoint
- `NEXT_PUBLIC_USE_MOCK_META_API=false` → Uses real META Graph API v19.0
- No code changes required to switch modes
- All methods return identical TypeScript interfaces in both modes
- Mock responses match real API schema exactly

**Implementation:**
- ✅ Already implemented in [client.ts](packages/meta-api/src/client.ts#L9-L15)
- ⚠️ Needs testing and validation

---

#### FR-2: Mock API Enhancements

**Priority:** P0 (Critical)

**Description:**
Upgrade mock API to support realistic development scenarios including error states, pagination, and dynamic data.

**Current State:**
- Mock endpoint: [route.ts](apps/web/app/api/mock/meta/[...slug]/route.ts)
- Static dataset with 1 account, 3 campaigns, 3 ad sets, 3 ads

**Required Enhancements:**

**FR-2.1: Query Parameter Support**
```typescript
// Date range filtering
GET /api/mock/meta/{entityId}/insights?date_start=2025-01-01&date_stop=2025-01-31

// Pagination
GET /api/mock/meta/act_123/campaigns?limit=25&after=cursor_xyz

// Field selection
GET /api/mock/meta/act_123/campaigns?fields=id,name,status,objective
```

**FR-2.2: Realistic Error Simulation**
```typescript
// 10% chance of rate limiting (HTTP 429)
// 5% chance of server error (HTTP 500)
// 2% chance of invalid token (HTTP 401)
```

**FR-2.3: Dynamic Data Generation**
- Use `faker.js` or similar to generate varied ad names, descriptions
- Random performance metrics within realistic ranges
- Multiple ad accounts (3-5) with different sizes
- Campaigns with varied budgets, statuses, objectives

**FR-2.4: Stateful Mock (Optional)**
- In-memory store to persist changes (e.g., pausing a campaign)
- Resets on server restart

**Acceptance Criteria:**
- ✅ Supports all query parameters used by dashboard
- ✅ Returns paginated responses with cursors
- ✅ Randomly simulates errors (configurable frequency)
- ✅ Data looks realistic (varied names, metrics)
- ✅ Response times match real API (~200-500ms)

---

#### FR-3: Real META API Integration

**Priority:** P0 (Critical)

**Description:**
Complete integration with official `facebook-nodejs-business-sdk` for production use.

**Current State:**
- SDK installed: `facebook-nodejs-business-sdk@24.0.1`
- Methods defined but not fully implemented

**Required Implementation:**

**FR-3.1: Ad Accounts Fetching**
```typescript
async getAdAccounts(): Promise<MetaResponse<MetaAdAccount>> {
  if (this.useMock) { /* ... existing mock logic ... */ }

  // Real implementation
  const user = new User('me');
  const accounts = await user.getAdAccounts([
    'account_id', 'name', 'currency', 'timezone_name',
    'account_status', 'amount_spent', 'balance', 'created_time'
  ]);

  return this.transformResponse(accounts);
}
```

**FR-3.2: Campaigns, Ad Sets, Ads Fetching**
- Use `AdAccount.getCampaigns()`, `AdAccount.getAdSets()`, `AdAccount.getAds()`
- Fetch required fields matching TypeScript interfaces
- Handle pagination (fetch all pages or return cursors)

**FR-3.3: Insights Fetching**
```typescript
async getInsights(
  entityId: string,
  level: 'account' | 'campaign' | 'adset' | 'ad',
  dateRange: { start: string; end: string }
): Promise<MetaResponse<MetaInsights>> {
  // Use Campaign.getInsights() or AdSet.getInsights()
  // Fetch metrics: spend, impressions, clicks, cpc, cpm, ctr, actions
  // Support date_preset or date_start/date_stop
}
```

**FR-3.4: Error Handling**
```typescript
try {
  // SDK call
} catch (error) {
  if (error.code === 190) throw new MetaAuthError('Invalid token');
  if (error.code === 17) throw new MetaRateLimitError('Rate limit exceeded');
  throw new MetaAPIError(error.message, error.code);
}
```

**FR-3.5: Rate Limiting**
- Respect META's rate limits (200 calls/hour per user, 4800/hour per app)
- Implement exponential backoff for 429 errors
- Queue requests if needed

**Acceptance Criteria:**
- ✅ All methods fetch real data from META Graph API
- ✅ Responses match TypeScript interfaces exactly
- ✅ Handles all META error codes gracefully
- ✅ Respects rate limits with automatic retry
- ✅ Supports pagination (manual or automatic)
- ✅ Includes unit tests with mocked SDK responses

---

#### FR-4: Dashboard Data Integration

**Priority:** P0 (Critical)

**Description:**
Connect dashboard UI to live data from `MetaAdsClient` instead of hardcoded arrays.

**Current State:**
- Dashboard: [dashboard/page.tsx](apps/web/app/dashboard/page.tsx#L26-L54)
- Uses hardcoded `mockAds` array

**Required Changes:**

**FR-4.1: Data Fetching Server Component**
```typescript
// apps/web/app/dashboard/page.tsx
import { MetaAdsClient } from '@repo/meta-api';

export default async function DashboardPage() {
  const session = await getSession(); // Get user session
  const connection = await getMetaConnection(session.user.id); // Get stored token

  if (!connection) redirect('/authorize-meta');

  const client = new MetaAdsClient(connection.accessToken);

  // Fetch data in parallel
  const [accounts, campaigns, insights] = await Promise.all([
    client.getAdAccounts(),
    client.getCampaigns(connection.selectedAdAccountId),
    client.getInsights(connection.selectedAdAccountId, 'campaign', {
      start: '2025-01-01',
      end: '2025-01-31'
    })
  ]);

  return <DashboardUI data={{ accounts, campaigns, insights }} />;
}
```

**FR-4.2: Loading & Error States**
```typescript
// Use React Suspense for loading
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>

// Error boundary for API failures
<ErrorBoundary fallback={<DashboardError />}>
  <DashboardContent />
</ErrorBoundary>
```

**FR-4.3: Client-Side Interactivity**
- Extract UI into separate client component
- Pass server-fetched data as props
- Handle user actions (Apply, Skip) with server actions

**Acceptance Criteria:**
- ✅ Dashboard displays live data from `MetaAdsClient`
- ✅ Switches between mock/real based on env var
- ✅ Shows loading skeleton while fetching
- ✅ Displays error message on API failure
- ✅ Updates UI when data changes
- ✅ No hardcoded data in production build

---

#### FR-5: Database Synchronization

**Priority:** P1 (High)

**Description:**
Persist META API data to PostgreSQL for caching, offline access, and historical tracking.

**Database Schema:**
- Already designed: [schema.ts](packages/database/src/schema.ts)

**Required Implementation:**

**FR-5.1: Sync Service**
```typescript
// packages/meta-api/src/sync.ts
export class MetaSyncService {
  constructor(
    private client: MetaAdsClient,
    private db: Database
  ) {}

  async syncAdAccounts(userId: string): Promise<void> {
    const response = await this.client.getAdAccounts();

    for (const account of response.data) {
      await this.db.upsert('adAccounts', {
        metaConnectionId: userId,
        metaAdAccountId: account.account_id,
        name: account.name,
        currency: account.currency,
        // ...
        lastSyncedAt: new Date()
      });
    }
  }

  async syncCampaigns(adAccountId: string): Promise<void> { /* ... */ }
  async syncAdSets(adAccountId: string): Promise<void> { /* ... */ }
  async syncAds(adAccountId: string): Promise<void> { /* ... */ }
  async syncInsights(entityId: string, level: string): Promise<void> { /* ... */ }
}
```

**FR-5.2: Sync Strategy**
- **Full Sync:** On first connection, fetch all data
- **Incremental Sync:** Fetch only changes since `lastSyncedAt`
- **Scheduled Sync:** Cron job every 6 hours
- **Manual Sync:** User-triggered refresh button

**FR-5.3: Sync Status Tracking**
```typescript
// packages/database/src/schema.ts
export const syncJobs = pgTable('syncJobs', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => profiles.id),
  type: text('type'), // 'accounts' | 'campaigns' | 'insights'
  status: text('status'), // 'pending' | 'running' | 'completed' | 'failed'
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  error: text('error')
});
```

**FR-5.4: Dashboard Data Source**
```typescript
// Option 1: Serve from database (fast, may be stale)
const campaigns = await db.query.campaigns.findMany({
  where: eq(campaigns.adAccountId, accountId)
});

// Option 2: Fetch from API and sync to DB (fresh, slower)
const response = await client.getCampaigns(accountId);
await syncService.syncCampaigns(accountId);
const campaigns = response.data;

// Option 3: Hybrid - serve from DB, sync in background
const campaigns = await db.query.campaigns.findMany(...);
syncInBackground(accountId); // Fire and forget
```

**Acceptance Criteria:**
- ✅ All META entities persist to database
- ✅ Sync runs on first connection (full sync)
- ✅ Background sync every 6 hours
- ✅ Manual refresh button in UI
- ✅ Sync status visible to user
- ✅ Dashboard can serve from DB or API
- ✅ `lastSyncedAt` timestamps accurate

---

#### FR-6: Real OAuth 2.0 Implementation

**Priority:** P1 (High)

**Description:**
Replace simulated OAuth flow with real META OAuth 2.0 integration.

**Current State:**
- Fake flow in [authorize-meta/page.tsx](apps/web/app/authorize-meta/page.tsx)
- No token storage or refresh

**Required Implementation:**

**FR-6.1: OAuth Flow**
```typescript
// apps/web/app/api/auth/meta/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to META OAuth
    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.set('client_id', process.env.META_APP_ID);
    authUrl.searchParams.set('redirect_uri', `${process.env.APP_URL}/api/auth/meta`);
    authUrl.searchParams.set('scope', 'ads_read,ads_management');
    authUrl.searchParams.set('state', generateCSRFToken());

    return redirect(authUrl.toString());
  }

  // Step 2: Exchange code for access token
  const tokenResponse = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/auth/meta`,
      code
    })
  });

  const { access_token } = await tokenResponse.json();

  // Step 3: Fetch user info
  const userResponse = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${access_token}`);
  const user = await userResponse.json();

  // Step 4: Store in database
  await db.insert(metaConnections).values({
    userId: session.user.id,
    metaUserId: user.id,
    metaUserName: user.name,
    accessToken: access_token,
    grantedScopes: 'ads_read,ads_management',
    status: 'active'
  });

  return redirect('/select-account');
}
```

**FR-6.2: Token Refresh**
- META tokens expire after 60 days
- Implement refresh flow (exchange short-lived for long-lived token)
- Store expiry timestamp, refresh 7 days before expiration

**FR-6.3: Required META App Configuration**
- Create META App at [developers.facebook.com](https://developers.facebook.com)
- Add OAuth redirect URI: `https://jakex.app/api/auth/meta`
- Request permissions: `ads_read`, `ads_management`
- Get `META_APP_ID` and `META_APP_SECRET`

**Acceptance Criteria:**
- ✅ Real OAuth flow redirects to META login
- ✅ User grants permissions
- ✅ Access token stored securely in database
- ✅ Token refresh implemented
- ✅ Handles OAuth errors (user declined, etc.)
- ✅ CSRF protection (state parameter)

---

#### FR-7: Enhanced Mock Data Generation

**Priority:** P2 (Medium)

**Description:**
Generate realistic, varied mock data using libraries like Faker.js.

**Implementation:**
```typescript
// packages/meta-api/src/mock-data.ts
import { faker } from '@faker-js/faker';

export function generateMockAdAccount(): MetaAdAccount {
  return {
    id: `act_${faker.number.int({ min: 100000000, max: 999999999 })}`,
    account_id: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
    name: faker.company.name() + ' Ads',
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
    timezone_name: faker.location.timeZone(),
    account_status: 1, // Active
    amount_spent: faker.finance.amount({ min: 1000, max: 50000, dec: 2 }),
    balance: faker.finance.amount({ min: 0, max: 10000, dec: 2 }),
    created_time: faker.date.past({ years: 2 }).toISOString()
  };
}

export function generateMockCampaign(accountId: string): MetaCampaign {
  const objectives = ['OUTCOME_SALES', 'OUTCOME_TRAFFIC', 'OUTCOME_AWARENESS'];
  const statuses = ['ACTIVE', 'PAUSED'];

  return {
    id: faker.string.numeric(16),
    account_id: accountId,
    name: faker.helpers.arrayElement([
      `${faker.commerce.productAdjective()} ${faker.commerce.product()} Sale`,
      `${faker.date.month()} Promotion - ${faker.commerce.department()}`,
      `Brand ${faker.word.verb()} Campaign`
    ]),
    status: faker.helpers.arrayElement(statuses),
    objective: faker.helpers.arrayElement(objectives),
    daily_budget: faker.finance.amount({ min: 10, max: 500, dec: 2 }),
    start_time: faker.date.recent({ days: 30 }).toISOString(),
    // ...
  };
}
```

**Acceptance Criteria:**
- ✅ Each mock session generates unique data
- ✅ Data looks realistic (proper names, amounts)
- ✅ Performance metrics within expected ranges
- ✅ 3-5 ad accounts per user
- ✅ 5-20 campaigns per account
- ✅ Varied campaign objectives, statuses, budgets

---

#### FR-8: Type Safety & Validation

**Priority:** P0 (Critical) - COMPLETED ✅

**Description:**
Ensure type-safe data flow from META API → Database → UI with strict typing matching the official facebook-nodejs-business-sdk.

**Current Status:**
✅ **COMPLETED** - [types.ts](packages/meta-api/src/types.ts) has been updated with comprehensive TypeScript interfaces that strictly match the META SDK.

**Implementation:**

**FR-8.1: Strict SDK Type Matching** ✅ COMPLETED
```typescript
// packages/meta-api/src/types.ts
// All interfaces now strictly match facebook-nodejs-business-sdk v24.0.1

// Comprehensive enums matching SDK static properties:
- CampaignObjective (21 values: APP_INSTALLS, BRAND_AWARENESS, CONVERSIONS, etc.)
- CampaignStatus (4 values: ACTIVE, PAUSED, DELETED, ARCHIVED)
- CampaignBidStrategy (4 values)
- CampaignEffectiveStatus (6 values including IN_PROCESS, WITH_ISSUES)
- AdSetOptimizationGoal (26 values: NONE, APP_INSTALLS, AD_RECALL_LIFT, etc.)
- AdSetBillingEvent (11 values: IMPRESSIONS, LINK_CLICKS, PURCHASE, etc.)
- AdSetStatus (4 values)
- AdStatus (4 values)
- AdEffectiveStatus (12 values including PENDING_REVIEW, DISAPPROVED, etc.)
- AdAccountStatus (numeric codes: 1=ACTIVE, 2=DISABLED, etc.)
- Currency (17 major currencies)

// Comprehensive interfaces with all SDK fields:
interface MetaAdAccount {
  // Core fields + extended fields (owner_business, capabilities, etc.)
}

interface MetaCampaign {
  // All status types, budget fields, promoted_object, issues_info, etc.
}

interface MetaTargeting {
  // Complete targeting spec: demographics, geo_locations, placements,
  // interests, behaviors, custom_audiences, exclusions, etc.
}

interface MetaAdSet {
  // Full optimization, billing, targeting, attribution, pacing config
}

interface MetaCreative {
  // Assets, CTAs, asset_feed_spec, object_story_spec for native formats
}

interface MetaAd {
  // Complete ad structure with creative, tracking, review feedback, issues
}

interface MetaInsights {
  // 40+ metric fields: core metrics, cost metrics, video metrics,
  // quality rankings, ROAS, attribution, catalog, canvas, etc.
}

interface MetaInsightAction {
  // Action data with attribution windows (1d_click, 7d_click, 28d_click, etc.)
}
```

**FR-8.2: Response Type Wrappers** ✅ COMPLETED
```typescript
// Matches SDK Cursor and API response structure
interface MetaResponse<T> {
  data: T[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
    previous?: string;
  };
  summary?: { total_count: number };
}

// Cursor-like helper for type compatibility
interface MetaCursor<T> extends Array<T> {
  paging?: {
    next?: string[];
    previous?: string[];
    params?: Record<string, any>;
  };
  summary?: { total_count?: number };
  hasNext?: () => boolean;
  hasPrevious?: () => boolean;
}
```

**FR-8.3: Error Types** ✅ COMPLETED
```typescript
interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id?: string;
}

interface MetaErrorResponse {
  error: MetaAPIError;
}
```

**FR-8.4: Zod Schemas for Runtime Validation** (TODO - Phase 2)
```typescript
// packages/meta-api/src/validation.ts
import { z } from 'zod';

export const MetaAdAccountSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  name: z.string(),
  currency: z.string(),
  timezone_name: z.string(),
  account_status: z.nativeEnum(AdAccountStatus),
  amount_spent: z.string(),
  balance: z.string(),
  created_time: z.string().datetime(),
  // ... all optional fields
});

export const MetaCampaignSchema = z.object({
  id: z.string(),
  account_id: z.string(),
  name: z.string(),
  status: z.nativeEnum(CampaignStatus),
  objective: z.nativeEnum(CampaignObjective),
  // ... all fields with proper enum validation
});

// Use in client
async getAdAccounts(): Promise<MetaResponse<MetaAdAccount>> {
  const response = await this.fetchFromAPI('/me/adaccounts');
  return MetaAdAccountSchema.array().parse(response.data); // Runtime validation
}
```

**FR-8.5: Database Type Generation** (TODO - Phase 3)
```typescript
// packages/database/src/types.ts
import { InferSelectModel } from 'drizzle-orm';
import { adAccounts, campaigns } from './schema';

export type AdAccount = InferSelectModel<typeof adAccounts>;
export type Campaign = InferSelectModel<typeof campaigns>;
```

**Acceptance Criteria:**
- ✅ **COMPLETED:** All TypeScript interfaces strictly match facebook-nodejs-business-sdk v24.0.1
- ✅ **COMPLETED:** Comprehensive enums for all status types, objectives, optimization goals
- ✅ **COMPLETED:** Extended interfaces include all optional SDK fields
- ✅ **COMPLETED:** MetaTargeting interface covers full targeting specification
- ✅ **COMPLETED:** MetaInsights includes 40+ performance metric fields
- ✅ **COMPLETED:** Error types match META API error structure
- ⏳ **TODO:** Zod schemas for runtime validation (Phase 2)
- ⏳ **TODO:** Database types auto-generated from Drizzle schema (Phase 3)
- ⏳ **TODO:** Runtime errors if API returns unexpected data (Phase 2)

**Key Benefits:**
- **Type Safety:** Mock and real API responses are guaranteed to match
- **IDE Autocomplete:** Full IntelliSense support for all META API fields
- **Compile-Time Validation:** TypeScript catches type mismatches before runtime
- **Documentation:** Comprehensive JSDoc comments explain each field
- **Future-Proof:** Easy to update when SDK adds new fields or enums

---

#### FR-9: Testing Strategy

**Priority:** P1 (High)

**Description:**
Comprehensive test coverage for mock and real API integration.

**Test Plan:**

**Unit Tests:**
```typescript
// packages/meta-api/__tests__/client.test.ts
describe('MetaAdsClient', () => {
  describe('Mock Mode', () => {
    it('should fetch ad accounts from mock API', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_META_API = 'true';
      const client = new MetaAdsClient('mock-token');
      const response = await client.getAdAccounts();

      expect(response.data).toHaveLength(1);
      expect(response.data[0].name).toBe('JakeX Demo Account');
    });
  });

  describe('Real Mode', () => {
    it('should fetch ad accounts from META API', async () => {
      // Mock facebook-nodejs-business-sdk
      jest.mock('facebook-nodejs-business-sdk');

      process.env.NEXT_PUBLIC_USE_MOCK_META_API = 'false';
      const client = new MetaAdsClient('real-token');
      const response = await client.getAdAccounts();

      expect(response.data).toBeDefined();
    });
  });
});
```

**Integration Tests:**
- Test dashboard data fetching with mock API
- Test OAuth flow (with mocked META endpoints)
- Test database sync service

**E2E Tests (Playwright):**
- User connects META account → selects ad account → views dashboard
- Data displays correctly in all modes

**Acceptance Criteria:**
- ✅ 80%+ code coverage for `meta-api` package
- ✅ All critical paths tested (happy path + errors)
- ✅ CI/CD runs tests on every commit

---

## 4. Implementation Plan

### Phase 1: Mock API Enhancements (Week 1)
- [ ] Implement query parameter support (date ranges, pagination, fields)
- [ ] Add error simulation (401, 429, 500)
- [ ] Integrate Faker.js for dynamic data generation
- [ ] Update mock endpoint to return varied datasets
- [ ] Add configuration for error rates

### Phase 2: Dashboard Integration (Week 1-2)
- [ ] Remove hardcoded `mockAds` array from dashboard
- [ ] Fetch data using `MetaAdsClient` in server component
- [ ] Add loading states (Suspense + skeleton)
- [ ] Add error boundaries
- [ ] Test with `NEXT_PUBLIC_USE_MOCK_META_API=true`

### Phase 3: Database Sync (Week 2-3)
- [ ] Implement `MetaSyncService` class
- [ ] Create sync methods for all entities
- [ ] Add sync job tracking table
- [ ] Implement full sync on first connection
- [ ] Add manual refresh button in UI
- [ ] Set up background sync cron job

### Phase 4: Real META API (Week 3-4) - BLOCKED UNTIL META ACCOUNT
- [ ] Complete real API implementations in `MetaAdsClient`
- [ ] Add error handling for all META error codes
- [ ] Implement rate limiting and retry logic
- [ ] Add pagination support
- [ ] Write unit tests with mocked SDK

### Phase 5: OAuth Implementation (Week 4-5) - BLOCKED UNTIL META APP
- [ ] Create META App in developers portal
- [ ] Implement OAuth route handlers
- [ ] Add token storage to database
- [ ] Implement token refresh logic
- [ ] Update authorize flow to use real OAuth

### Phase 6: Testing & QA (Week 5-6)
- [ ] Write unit tests (target 80% coverage)
- [ ] Write integration tests
- [ ] Write E2E tests for critical flows
- [ ] Manual QA in both mock and real modes
- [ ] Performance testing (load times, API response times)

### Phase 7: Production Deployment (Week 6)
- [ ] Deploy to staging with mock mode
- [ ] Switch to real META API once account approved
- [ ] Monitor error rates and performance
- [ ] Gradual rollout to users

---

## 5. Technical Specifications

### 5.1 Environment Variables

```bash
# Meta API Configuration
NEXT_PUBLIC_USE_MOCK_META_API=true          # true = mock, false = real API

# Required for Real API (when META app is approved)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_OAUTH_REDIRECT_URI=https://jakex.app/api/auth/meta

# Database
DATABASE_URL=postgresql://...
DATABASE_AUTH_TOKEN=...

# Auth (Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 5.2 API Response Format

All methods return `MetaResponse<T>`:

```typescript
interface MetaResponse<T> {
  data: T[];                                   // Array of entities
  paging?: {
    cursors: { before: string; after: string; };
    next?: string;                             // Next page URL
    previous?: string;                         // Previous page URL
  };
  summary?: {
    total_count: number;
  };
}
```

### 5.3 Error Handling

```typescript
// Custom error classes
class MetaAPIError extends Error {
  constructor(
    public message: string,
    public code: number,
    public type: string
  ) {}
}

class MetaAuthError extends MetaAPIError {}        // 401, 190
class MetaRateLimitError extends MetaAPIError {}   // 429, 17, 80004
class MetaPermissionError extends MetaAPIError {}  // 200, 200
```

### 5.4 Rate Limiting Strategy

```typescript
// Exponential backoff for rate limit errors
const retryDelays = [1000, 2000, 5000, 10000]; // ms

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 4
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code !== 17 && error.code !== 429) throw error;
      if (i === maxRetries - 1) throw error;

      await sleep(retryDelays[i]);
    }
  }
}
```

---

## 6. Success Metrics

### 6.1 Development Metrics
- ✅ Mock API used by 100% of dev team
- ✅ Zero blocked developers waiting for META approval
- ✅ Dashboard functional with mock data within 1 week

### 6.2 Technical Metrics
- ✅ API response time < 500ms (p95)
- ✅ Dashboard load time < 2s (p95)
- ✅ Error rate < 1%
- ✅ 80%+ code coverage

### 6.3 User Metrics (Post-Launch)
- ✅ OAuth connection success rate > 95%
- ✅ Data sync success rate > 99%
- ✅ User complaints about stale data < 5%

---

## 7. Risks & Mitigations

### Risk 1: META App Approval Delay
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Proceed with mock API for all development
- Deploy to production with mock mode initially
- Switch to real API when approved (zero code changes)

### Risk 2: META API Rate Limits
**Impact:** Medium
**Probability:** High
**Mitigation:**
- Implement aggressive caching (serve from DB)
- Background sync to stay under limits
- Queue requests if needed

### Risk 3: API Schema Changes
**Impact:** Medium
**Probability:** Low
**Mitigation:**
- Use Zod validation to catch schema mismatches
- Pin SDK version until tested
- Monitor META developer changelog

### Risk 4: Token Expiration
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Implement automatic token refresh
- Alert user when re-auth needed
- Store token expiry timestamp

---

## 8. Open Questions

1. **Data Freshness:** Should dashboard serve from DB (fast, may be stale) or always fetch from API (slow, fresh)?
   - **Recommendation:** Hybrid - serve from DB, sync in background every 6 hours

2. **Pagination Strategy:** Auto-fetch all pages or implement manual pagination in UI?
   - **Recommendation:** Auto-fetch up to 500 items, then paginate

3. **Error Handling UX:** Show error message or fallback to cached data?
   - **Recommendation:** Show cached data + warning banner "Data may be outdated"

4. **Mock Data Persistence:** Should mock API persist changes (e.g., pausing a campaign) across sessions?
   - **Recommendation:** No - reset on server restart (simpler, sufficient for dev)

---

## 9. Appendix

### 9.1 Relevant Files

| File | Path | Status |
|------|------|--------|
| META Client | [packages/meta-api/src/client.ts](packages/meta-api/src/client.ts) | ⚠️ Partial |
| Types | [packages/meta-api/src/types.ts](packages/meta-api/src/types.ts) | ✅ Complete |
| Mock Data | [packages/meta-api/src/mock-data.ts](packages/meta-api/src/mock-data.ts) | ✅ Complete |
| Mock API | [apps/web/app/api/mock/meta/\[...slug\]/route.ts](apps/web/app/api/mock/meta/[...slug]/route.ts) | ⚠️ Partial |
| Dashboard | [apps/web/app/dashboard/page.tsx](apps/web/app/dashboard/page.tsx) | ❌ Hardcoded |
| DB Schema | [packages/database/src/schema.ts](packages/database/src/schema.ts) | ✅ Complete |
| OAuth Flow | [apps/web/app/authorize-meta/page.tsx](apps/web/app/authorize-meta/page.tsx) | ❌ Simulated |

### 9.2 External Resources

- [META Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [Facebook Business SDK for Node.js](https://github.com/facebook/facebook-nodejs-business-sdk)
- [META Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

**Document Control:**
- Version: 1.0
- Last Updated: 2025-12-27
- Next Review: After Phase 1 completion
- Owner: Product Team
- Approvers: Engineering Lead, Product Manager
