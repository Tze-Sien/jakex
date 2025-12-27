# META API Integration - Implementation Checklist

**Project:** JakeX - META Marketing API SDK Integration
**PRD Version:** 1.0
**Last Updated:** 2025-12-27

---

## 📋 Overview

This checklist breaks down the [PRD-META-API-INTEGRATION.md](PRD-META-API-INTEGRATION.md) into actionable tasks organized by phase. Check off items as you complete them.

**Legend:**
- ✅ = Completed
- 🟡 = In Progress
- ⚠️ = Blocked
- ❌ = Not Started

---

## Phase 1: Mock API Enhancements (Week 1)

**Goal:** Upgrade mock API to support realistic development scenarios

### 1.1 Query Parameter Support
- [ ] Add date range filtering (`date_start`, `date_stop`) support
- [ ] Implement pagination parameters (`limit`, `after` cursor)
- [ ] Add field selection parameter (`fields=id,name,status`)
- [ ] Parse query params in mock route handler
- [ ] Test all parameter combinations
- [ ] Document supported parameters in code comments

**Files to modify:**
- [apps/web/app/api/mock/meta/[...slug]/route.ts](../apps/web/app/api/mock/meta/[...slug]/route.ts)

### 1.2 Error Simulation
- [ ] Implement 10% rate limiting (HTTP 429) simulation
- [ ] Implement 5% server error (HTTP 500) simulation
- [ ] Implement 2% invalid token (HTTP 401) simulation
- [ ] Add configurable error rates via env vars
- [ ] Return proper META error response format
- [ ] Add `fbtrace_id` to error responses

**Files to modify:**
- [apps/web/app/api/mock/meta/[...slug]/route.ts](../apps/web/app/api/mock/meta/[...slug]/route.ts)

**New files to create:**
- `apps/web/app/api/mock/meta/errors.ts` (error generators)

### 1.3 Dynamic Data Generation
- [ ] Install `@faker-js/faker` package
- [ ] Create `generateMockAdAccount()` function
- [ ] Create `generateMockCampaign()` function
- [ ] Create `generateMockAdSet()` function
- [ ] Create `generateMockAd()` function
- [ ] Create `generateMockInsights()` function
- [ ] Generate 3-5 ad accounts per session
- [ ] Generate 5-20 campaigns per account
- [ ] Add realistic budget ranges ($10-$500/day)
- [ ] Randomize campaign objectives, statuses
- [ ] Add varied performance metrics (CTR: 0.5-5%, CPC: $0.10-$2.00)

**Files to modify:**
- [packages/meta-api/src/mock-data.ts](../packages/meta-api/src/mock-data.ts)

### 1.4 Pagination Implementation
- [ ] Generate cursor tokens (base64 encoded offsets)
- [ ] Return `paging.cursors.before` and `paging.cursors.after`
- [ ] Return `paging.next` URL for next page
- [ ] Implement cursor-based pagination logic
- [ ] Test pagination with different page sizes
- [ ] Add `summary.total_count` to responses

**Files to modify:**
- [apps/web/app/api/mock/meta/[...slug]/route.ts](../apps/web/app/api/mock/meta/[...slug]/route.ts)

### 1.5 Response Time Simulation
- [ ] Replace fixed 300ms delay with random 200-500ms delay
- [ ] Add configurable delay via env var
- [ ] Simulate slower responses for insights (400-800ms)

**Files to modify:**
- [apps/web/app/api/mock/meta/[...slug]/route.ts](../apps/web/app/api/mock/meta/[...slug]/route.ts)

---

## Phase 2: Dashboard Integration (Week 1-2)

**Goal:** Connect dashboard UI to live data from MetaAdsClient

### 2.1 Remove Hardcoded Data
- [ ] Delete `mockAds` array from dashboard page
- [ ] Remove all hardcoded ad/campaign data
- [ ] Identify all data dependencies in UI components

**Files to modify:**
- [apps/web/app/dashboard/page.tsx](../apps/web/app/dashboard/page.tsx)

### 2.2 Server Component Data Fetching
- [ ] Import `MetaAdsClient` from `@repo/meta-api`
- [ ] Get user session with `getSession()`
- [ ] Fetch META connection from database
- [ ] Redirect to `/authorize-meta` if no connection
- [ ] Initialize `MetaAdsClient` with access token
- [ ] Fetch ad accounts in parallel with campaigns
- [ ] Fetch insights data for date range
- [ ] Handle selected ad account from user preferences
- [ ] Pass data to client component as props

**Files to modify:**
- [apps/web/app/dashboard/page.tsx](../apps/web/app/dashboard/page.tsx)

**New server actions to create:**
- `apps/web/app/actions/meta.ts` (getMetaConnection, etc.)

### 2.3 Loading States
- [ ] Create `DashboardSkeleton` component
- [ ] Wrap dashboard with `<Suspense fallback={<DashboardSkeleton />}>`
- [ ] Add skeleton for ad cards
- [ ] Add skeleton for metrics summary
- [ ] Add skeleton for XP/level display
- [ ] Test loading state appearance

**New files to create:**
- `apps/web/app/dashboard/loading.tsx`
- `apps/web/components/dashboard/dashboard-skeleton.tsx`

### 2.4 Error Handling
- [ ] Create `DashboardError` component
- [ ] Wrap dashboard with error boundary
- [ ] Display user-friendly error messages
- [ ] Add "Retry" button
- [ ] Add "Use cached data" fallback option
- [ ] Log errors to monitoring service

**New files to create:**
- `apps/web/app/dashboard/error.tsx`
- `apps/web/components/dashboard/dashboard-error.tsx`

### 2.5 Client Component Extraction
- [ ] Extract interactive UI into `DashboardClient` component
- [ ] Mark component with `'use client'` directive
- [ ] Accept server data as props
- [ ] Keep swipe functionality
- [ ] Keep "Apply" / "Skip" button handlers
- [ ] Maintain XP/gamification state

**New files to create:**
- `apps/web/components/dashboard/dashboard-client.tsx`

### 2.6 Server Actions for Interactivity
- [ ] Create `recordAdReview` server action (Apply/Skip)
- [ ] Update XP in database on review
- [ ] Update streak tracking
- [ ] Return updated XP/level to UI
- [ ] Handle optimistic UI updates

**Files to modify:**
- `apps/web/app/actions/gamification.ts` (or create new)

### 2.7 Testing with Mock Mode
- [ ] Set `NEXT_PUBLIC_USE_MOCK_META_API=true`
- [ ] Test dashboard loads mock data
- [ ] Test swipe interactions work
- [ ] Test Apply/Skip buttons work
- [ ] Test error states display correctly
- [ ] Verify no console errors

---

## Phase 3: Database Sync (Week 2-3)

**Goal:** Persist META API data to PostgreSQL

### 3.1 Create Sync Service
- [ ] Create `MetaSyncService` class
- [ ] Add constructor accepting `MetaAdsClient` and `db`
- [ ] Implement `syncAdAccounts(userId)` method
- [ ] Implement `syncCampaigns(adAccountId)` method
- [ ] Implement `syncAdSets(adAccountId)` method
- [ ] Implement `syncAds(adAccountId)` method
- [ ] Implement `syncInsights(entityId, level, dateRange)` method
- [ ] Add upsert logic (update if exists, insert if new)
- [ ] Update `lastSyncedAt` timestamps

**New files to create:**
- `packages/meta-api/src/sync.ts`

### 3.2 Sync Job Tracking
- [ ] Add `syncJobs` table to database schema
- [ ] Track sync status (pending, running, completed, failed)
- [ ] Record start and completion timestamps
- [ ] Store error messages on failure
- [ ] Create `createSyncJob()` helper
- [ ] Create `updateSyncJob()` helper
- [ ] Create `getSyncJobStatus()` helper

**Files to modify:**
- [packages/database/src/schema.ts](../packages/database/src/schema.ts)

### 3.3 Full Sync on First Connection
- [ ] Detect first-time connection (no `lastSyncedAt`)
- [ ] Trigger full sync after OAuth completion
- [ ] Fetch all ad accounts
- [ ] Fetch all campaigns for each account
- [ ] Fetch all ad sets for each campaign
- [ ] Fetch all ads for each ad set
- [ ] Fetch last 30 days of insights
- [ ] Display progress to user (optional)

**Files to modify:**
- `apps/web/app/api/auth/meta/route.ts` (OAuth callback)

### 3.4 Incremental Sync
- [ ] Add `since` parameter to sync methods
- [ ] Use `lastSyncedAt` timestamp as filter
- [ ] Fetch only entities modified since last sync
- [ ] Update existing records, insert new ones
- [ ] Handle deleted entities (mark as deleted)

**Files to modify:**
- `packages/meta-api/src/sync.ts`

### 3.5 Background Sync (Cron Job)
- [ ] Choose cron solution (Vercel Cron, node-cron, etc.)
- [ ] Create sync endpoint (`/api/cron/sync-meta`)
- [ ] Verify cron secret for security
- [ ] Fetch all active META connections
- [ ] Run incremental sync for each user
- [ ] Log sync results and errors
- [ ] Set schedule to every 6 hours

**New files to create:**
- `apps/web/app/api/cron/sync-meta/route.ts`
- `vercel.json` (cron configuration)

### 3.6 Manual Refresh UI
- [ ] Add "Refresh Data" button to dashboard
- [ ] Trigger manual sync server action
- [ ] Show loading state during sync
- [ ] Display last sync timestamp
- [ ] Show sync status (syncing, success, error)
- [ ] Toast notification on completion

**Files to modify:**
- `apps/web/components/dashboard/dashboard-header.tsx` (create if needed)

**New server actions:**
- `apps/web/app/actions/meta.ts` → `triggerManualSync()`

### 3.7 Hybrid Data Strategy
- [ ] Implement "serve from DB" mode (default)
- [ ] Fetch campaigns/ads from database tables
- [ ] Display `lastSyncedAt` indicator in UI
- [ ] Add option to force API fetch
- [ ] Cache API responses in DB immediately after fetch

**Files to modify:**
- `apps/web/app/dashboard/page.tsx`

---

## Phase 4: Real META API Integration (Week 3-4)

⚠️ **BLOCKED UNTIL META BUSINESS ACCOUNT APPROVED**

### 4.1 Ad Accounts Fetching
- [ ] Import `User` from `facebook-nodejs-business-sdk`
- [ ] Implement real `getAdAccounts()` method
- [ ] Fetch fields: `account_id`, `name`, `currency`, `timezone_name`, `account_status`, `amount_spent`, `balance`, `created_time`
- [ ] Transform SDK response to `MetaResponse<MetaAdAccount>`
- [ ] Handle empty results
- [ ] Add error handling

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.2 Campaigns Fetching
- [ ] Import `AdAccount` from SDK
- [ ] Implement real `getCampaigns(accountId)` method
- [ ] Fetch required fields matching `MetaCampaign` interface
- [ ] Handle pagination (auto-fetch all pages)
- [ ] Transform response format
- [ ] Add error handling

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.3 Ad Sets Fetching
- [ ] Implement real `getAdSets(accountId)` method
- [ ] Fetch fields matching `MetaAdSet` interface
- [ ] Include targeting spec
- [ ] Handle pagination
- [ ] Transform response

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.4 Ads Fetching
- [ ] Implement real `getAds(accountId)` method
- [ ] Fetch fields matching `MetaAd` interface
- [ ] Include creative details
- [ ] Handle pagination
- [ ] Transform response

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.5 Insights Fetching
- [ ] Implement real `getInsights(entityId, level, dateRange)` method
- [ ] Support `date_preset` parameter
- [ ] Support `date_start` / `date_stop` parameters
- [ ] Fetch metrics: spend, impressions, clicks, cpc, cpm, ctr, actions
- [ ] Support all levels: account, campaign, adset, ad
- [ ] Handle async insights job (if needed)
- [ ] Transform response to `MetaInsights[]`

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.6 Error Handling
- [ ] Create custom error classes: `MetaAPIError`, `MetaAuthError`, `MetaRateLimitError`, `MetaPermissionError`
- [ ] Map SDK errors to custom errors
- [ ] Handle code 190 (invalid token) → `MetaAuthError`
- [ ] Handle code 17, 80004 (rate limit) → `MetaRateLimitError`
- [ ] Handle code 200, 200 (permissions) → `MetaPermissionError`
- [ ] Add `fbtrace_id` to error objects
- [ ] Log errors with context

**New files to create:**
- `packages/meta-api/src/errors.ts`

### 4.7 Rate Limiting & Retry Logic
- [ ] Create `retryWithBackoff()` helper
- [ ] Implement exponential backoff: [1s, 2s, 5s, 10s]
- [ ] Retry only on rate limit errors (429, 17, 80004)
- [ ] Max 4 retries
- [ ] Throw error after max retries exceeded
- [ ] Add retry counter to logs

**New files to create:**
- `packages/meta-api/src/retry.ts`

### 4.8 Pagination Support
- [ ] Implement auto-pagination for all methods
- [ ] Use `Cursor.next()` to fetch next page
- [ ] Stop after 500 items (configurable limit)
- [ ] Option to return cursors for manual pagination
- [ ] Add `hasMore` flag to response

**Files to modify:**
- [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts)

### 4.9 Unit Tests with Mocked SDK
- [ ] Set up Jest test environment
- [ ] Mock `facebook-nodejs-business-sdk` module
- [ ] Test `getAdAccounts()` returns correct data
- [ ] Test `getCampaigns()` with pagination
- [ ] Test error handling (401, 429, 500)
- [ ] Test retry logic on rate limit
- [ ] Test dual-mode switching (mock vs real)
- [ ] Achieve 80%+ code coverage

**New files to create:**
- `packages/meta-api/__tests__/client.test.ts`
- `packages/meta-api/__tests__/sync.test.ts`
- `packages/meta-api/__tests__/errors.test.ts`

---

## Phase 5: OAuth Implementation (Week 4-5)

⚠️ **BLOCKED UNTIL META APP CREATED**

### 5.1 Create META App
- [ ] Go to [developers.facebook.com](https://developers.facebook.com)
- [ ] Create new app (Business type)
- [ ] Add "Marketing API" product
- [ ] Configure OAuth redirect URI: `https://jakex.app/api/auth/meta`
- [ ] Request permissions: `ads_read`, `ads_management`
- [ ] Copy `META_APP_ID` to env vars
- [ ] Copy `META_APP_SECRET` to env vars (keep secure!)
- [ ] Submit app for review (if needed)

### 5.2 OAuth Route Handler - Step 1 (Redirect to META)
- [ ] Create `/api/auth/meta/route.ts`
- [ ] Generate CSRF token (store in session)
- [ ] Build META OAuth URL with query params:
  - `client_id`
  - `redirect_uri`
  - `scope=ads_read,ads_management`
  - `state` (CSRF token)
- [ ] Redirect user to META login

**New files to create:**
- `apps/web/app/api/auth/meta/route.ts`

### 5.3 OAuth Route Handler - Step 2 (Handle Callback)
- [ ] Parse `code` and `state` from query params
- [ ] Verify `state` matches CSRF token
- [ ] Exchange `code` for `access_token` via POST to META token endpoint
- [ ] Parse `access_token` from response
- [ ] Fetch user info from `https://graph.facebook.com/v19.0/me`
- [ ] Store in `metaConnections` table:
  - `userId`
  - `metaUserId`
  - `metaUserName`
  - `accessToken` (encrypted!)
  - `grantedScopes`
  - `status='active'`
  - `createdAt`
- [ ] Redirect to `/select-account`

**Files to modify:**
- `apps/web/app/api/auth/meta/route.ts`

### 5.4 Token Encryption
- [ ] Install encryption library (`@47ng/cloak` or similar)
- [ ] Encrypt `accessToken` before storing in DB
- [ ] Decrypt token when initializing `MetaAdsClient`
- [ ] Store encryption key in env var (`META_TOKEN_ENCRYPTION_KEY`)

**Files to modify:**
- `apps/web/app/api/auth/meta/route.ts`
- `apps/web/app/actions/meta.ts`

### 5.5 Token Refresh Implementation
- [ ] Add `expiresAt` field to `metaConnections` table
- [ ] Store expiry timestamp (60 days from grant)
- [ ] Create cron job to refresh expiring tokens (7 days before expiry)
- [ ] Exchange short-lived token for long-lived token
- [ ] Update `accessToken` and `expiresAt` in DB

**Files to modify:**
- [packages/database/src/schema.ts](../packages/database/src/schema.ts)

**New files to create:**
- `apps/web/app/api/cron/refresh-tokens/route.ts`

### 5.6 OAuth Error Handling
- [ ] Handle "user declined permissions" error
- [ ] Handle invalid `code` or `state`
- [ ] Handle token exchange failure
- [ ] Display user-friendly error messages
- [ ] Add "Try Again" button
- [ ] Log errors for debugging

**New files to create:**
- `apps/web/app/authorize-meta/error/page.tsx`

### 5.7 Update Authorization Flow
- [ ] Replace fake OAuth in `/authorize-meta/page.tsx`
- [ ] Add real "Connect Meta Ads" button → redirects to `/api/auth/meta`
- [ ] Remove 2-second fake loading animation
- [ ] Update UI to show real connection status
- [ ] Add "Disconnect" functionality

**Files to modify:**
- [apps/web/app/authorize-meta/page.tsx](../apps/web/app/authorize-meta/page.tsx)

### 5.8 CSRF Protection
- [ ] Generate cryptographically secure CSRF token
- [ ] Store token in secure HTTP-only cookie
- [ ] Verify token on callback
- [ ] Reject requests with invalid/missing tokens
- [ ] Add error message for CSRF failures

**Files to modify:**
- `apps/web/app/api/auth/meta/route.ts`

---

## Phase 6: Testing & QA (Week 5-6)

### 6.1 Unit Tests - meta-api Package
- [ ] Test `MetaAdsClient` in mock mode
- [ ] Test `MetaAdsClient` in real mode (mocked SDK)
- [ ] Test `MetaSyncService.syncAdAccounts()`
- [ ] Test `MetaSyncService.syncCampaigns()`
- [ ] Test error handling for all methods
- [ ] Test retry logic on rate limit
- [ ] Test pagination auto-fetch
- [ ] Achieve 80%+ code coverage

**Test files:**
- `packages/meta-api/__tests__/client.test.ts`
- `packages/meta-api/__tests__/sync.test.ts`
- `packages/meta-api/__tests__/retry.test.ts`

### 6.2 Integration Tests
- [ ] Test dashboard fetches mock data correctly
- [ ] Test dashboard handles API errors gracefully
- [ ] Test OAuth flow (with mocked META endpoints)
- [ ] Test database sync after OAuth
- [ ] Test manual refresh triggers sync
- [ ] Test background cron sync runs

**Test files:**
- `apps/web/__tests__/integration/dashboard.test.ts`
- `apps/web/__tests__/integration/oauth.test.ts`
- `apps/web/__tests__/integration/sync.test.ts`

### 6.3 E2E Tests (Playwright)
- [ ] Set up Playwright test environment
- [ ] Test: User connects META account (mock mode)
- [ ] Test: User selects ad account
- [ ] Test: Dashboard displays ads
- [ ] Test: User reviews ad (Apply/Skip)
- [ ] Test: XP updates after review
- [ ] Test: Error state displays on API failure
- [ ] Test: Refresh button triggers re-fetch

**New files to create:**
- `apps/web/e2e/auth-flow.spec.ts`
- `apps/web/e2e/dashboard.spec.ts`

### 6.4 Manual QA - Mock Mode
- [ ] Set `NEXT_PUBLIC_USE_MOCK_META_API=true`
- [ ] Test full OAuth flow (simulated)
- [ ] Verify dashboard loads mock data
- [ ] Verify swipe interactions work
- [ ] Verify Apply/Skip buttons work
- [ ] Test error states (simulate 429, 500)
- [ ] Test loading states
- [ ] Test mobile responsive layout

### 6.5 Manual QA - Real Mode
⚠️ **Requires META account approval**
- [ ] Set `NEXT_PUBLIC_USE_MOCK_META_API=false`
- [ ] Test real OAuth flow with META login
- [ ] Connect real META ad account
- [ ] Verify real campaigns display
- [ ] Verify insights data is accurate
- [ ] Test token refresh works
- [ ] Test manual sync button
- [ ] Monitor error rates

### 6.6 Performance Testing
- [ ] Measure dashboard load time (target < 2s p95)
- [ ] Measure API response time (target < 500ms p95)
- [ ] Test with large datasets (100+ campaigns)
- [ ] Test pagination performance
- [ ] Test database query performance
- [ ] Optimize slow queries if needed

### 6.7 Security Testing
- [ ] Verify tokens are encrypted at rest
- [ ] Verify CSRF protection works
- [ ] Test OAuth state validation
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Verify API keys not exposed in client bundle

---

## Phase 7: Production Deployment (Week 6)

### 7.1 Staging Deployment (Mock Mode)
- [ ] Deploy to staging environment
- [ ] Set `NEXT_PUBLIC_USE_MOCK_META_API=true`
- [ ] Run smoke tests on staging
- [ ] Test OAuth flow
- [ ] Test dashboard functionality
- [ ] Monitor error logs
- [ ] Fix any critical bugs

### 7.2 Database Migration
- [ ] Generate Drizzle migration files
- [ ] Review migration SQL
- [ ] Test migration on staging DB
- [ ] Run migration on production DB
- [ ] Verify all tables created correctly
- [ ] Verify indexes exist
- [ ] Backup database before migration

**Commands:**
```bash
bun run db:generate
bun run db:migrate
```

### 7.3 Environment Variables Setup
- [ ] Add all env vars to Vercel production:
  - `NEXT_PUBLIC_USE_MOCK_META_API`
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_OAUTH_REDIRECT_URI`
  - `META_TOKEN_ENCRYPTION_KEY`
  - `DATABASE_URL`
  - `DATABASE_AUTH_TOKEN`
  - Supabase keys
- [ ] Verify all secrets are secure
- [ ] Test env var access in production

### 7.4 Switch to Real API
⚠️ **Only after META app approved**
- [ ] Set `NEXT_PUBLIC_USE_MOCK_META_API=false`
- [ ] Deploy to production
- [ ] Monitor error rates closely
- [ ] Test OAuth with real META account
- [ ] Verify real data displays correctly
- [ ] Monitor API rate limits

### 7.5 Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor API error rates
- [ ] Monitor database query performance
- [ ] Set up alerts for high error rates (> 5%)
- [ ] Set up alerts for slow API responses (> 1s p95)
- [ ] Monitor META API rate limit usage

### 7.6 Gradual Rollout
- [ ] Enable for 10% of users first
- [ ] Monitor metrics for 24 hours
- [ ] Increase to 50% if stable
- [ ] Monitor for another 24 hours
- [ ] Roll out to 100% of users
- [ ] Keep mock mode as fallback option

### 7.7 Documentation
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Create OAuth setup guide
- [ ] Create troubleshooting guide
- [ ] Document API error codes and meanings
- [ ] Create runbook for common issues

**New files to create:**
- `docs/SETUP.md`
- `docs/OAUTH-SETUP.md`
- `docs/TROUBLESHOOTING.md`
- `docs/RUNBOOK.md`

---

## Post-Launch Tasks

### Monitoring & Maintenance
- [ ] Monitor daily error rates (target < 1%)
- [ ] Monitor API performance (target < 500ms p95)
- [ ] Monitor database performance
- [ ] Review user feedback
- [ ] Track OAuth connection success rate (target > 95%)
- [ ] Track sync success rate (target > 99%)

### Future Enhancements
- [ ] Add Zod runtime validation (FR-8.4)
- [ ] Implement stateful mock API (optional)
- [ ] Add support for video metrics
- [ ] Add support for custom audiences
- [ ] Implement A/B testing for ads
- [ ] Add bulk operations (pause multiple campaigns)
- [ ] Add advanced filtering in dashboard
- [ ] Export reports to PDF/CSV

---

## Success Criteria Checklist

### Development Metrics
- [ ] ✅ Mock API used by 100% of dev team
- [ ] ✅ Zero blocked developers waiting for META approval
- [ ] ✅ Dashboard functional with mock data within 1 week

### Technical Metrics
- [ ] ✅ API response time < 500ms (p95)
- [ ] ✅ Dashboard load time < 2s (p95)
- [ ] ✅ Error rate < 1%
- [ ] ✅ 80%+ code coverage

### User Metrics (Post-Launch)
- [ ] ✅ OAuth connection success rate > 95%
- [ ] ✅ Data sync success rate > 99%
- [ ] ✅ User complaints about stale data < 5%

---

## Notes & Blockers

### Current Blockers
1. ⚠️ **Phase 4-5 blocked:** Waiting for META Business account approval
2. ⚠️ **Real API testing blocked:** Need META App ID and Secret

### Key Decisions Made
- Using hybrid data strategy (serve from DB, sync in background)
- Auto-fetch pagination up to 500 items
- 6-hour background sync interval
- Mock mode as permanent fallback option

### Open Questions
- [ ] Should mock API persist changes across sessions? **Decision: No**
- [ ] Serve from DB or always fetch from API? **Decision: Hybrid**
- [ ] Auto-fetch all pages or manual pagination? **Decision: Auto up to 500**

---

## Quick Reference

### Key Files
| Component | File Path | Status |
|-----------|-----------|--------|
| META Client | [packages/meta-api/src/client.ts](../packages/meta-api/src/client.ts) | ⚠️ Partial |
| Mock API | [apps/web/app/api/mock/meta/[...slug]/route.ts](../apps/web/app/api/mock/meta/[...slug]/route.ts) | ⚠️ Partial |
| Dashboard | [apps/web/app/dashboard/page.tsx](../apps/web/app/dashboard/page.tsx) | ❌ Needs work |
| DB Schema | [packages/database/src/schema.ts](../packages/database/src/schema.ts) | ✅ Complete |
| Types | [packages/meta-api/src/types.ts](../packages/meta-api/src/types.ts) | ✅ Complete |

### Helpful Commands
```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Run tests
bun test

# Database migrations
bun run db:generate
bun run db:migrate

# Type checking
bun run type-check

# Switch between mock/real
# In .env.local:
NEXT_PUBLIC_USE_MOCK_META_API=true  # or false
```

---

**Last Updated:** 2025-12-27
**Next Review:** After Phase 1 completion
