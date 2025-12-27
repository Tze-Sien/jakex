# JakeX - Meta Ads Optimization Assistant

## Product Requirements Document (PRD)
---

## 1. Executive Summary

JakeX is a Meta Ads optimization tool that helps advertisers analyze their ad performance and get AI-powered recommendations. The MVP focuses on a **simple, manual workflow**:

1. **Login** - Authenticate via Supabase Auth
2. **Authorize** - Connect to Meta Ads Manager via OAuth
3. **Select** - Choose an Ad Account to analyze
4. **Collect** - Query reports for multiple date ranges (7 Days, 3 Days, Today)
5. **Analyze** - Use AI prompts to analyze the collected data
6. **Suggest** - Display text-based action suggestions
7. **Regenerate** - User manually triggers report regeneration

---

## 2. Problem Statement

### Current Pain Points

| Problem | Impact |
|---------|--------|
| Advertisers don't check ads frequently | Money wasted on poor performers |
| No clear guidance on what to fix | Decision paralysis |
| Meta Ads Manager is overwhelming | Too many metrics, no priorities |
| Analysis requires expertise | Non-experts struggle to interpret data |

### Solution

A simplified tool that:
- Connects to Meta Ads Manager
- Fetches ad data across multiple time ranges
- Uses AI to analyze performance
- Provides clear, actionable text suggestions

---

## 3. User Flow (MVP)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MVP USER FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

1. LOGIN
   └─► User logs in via Supabase Auth (Google/Facebook OAuth)
   └─► Redirect to dashboard if authenticated

2. AUTHORIZE META
   └─► If no Meta connection exists:
       └─► Show "Connect Meta Ads" button
       └─► User clicks and grants permissions (ads_read)
       └─► Store access token securely

3. SELECT AD ACCOUNT
   └─► Fetch ad accounts from Meta API
   └─► User selects one ad account
   └─► Store selection for the session

4. COLLECT DATA
   └─► User clicks "Generate Report" button
   └─► Fetch data from Meta API:
       ├── Campaigns (with metrics for 7D, 3D, Today)
       ├── Ad Sets (with metrics for 7D, 3D, Today)
       └── Ads (with metrics for 7D, 3D, Today)
   └─► Store all data in database

5. ANALYZE WITH AI
   └─► Send collected data to AI (via prompt)
   └─► AI analyzes performance across time ranges
   └─► AI identifies trends and issues

6. DISPLAY SUGGESTIONS
   └─► Show AI-generated text recommendations:
       ├── Stop Campaign / Ad Set / Ad
       ├── Boost Campaign / Ad Set / Ad
       └── Update Campaign / Ad Set / Ad
   └─► Display reasoning for each suggestion

7. REGENERATE (Manual)
   └─► User clicks "Regenerate Report" button
   └─► Repeat steps 4-6 with fresh data
```

---

## 4. MVP Scope

### ✅ In Scope (Must Have)

| Feature | Priority | Description |
|---------|----------|-------------|
| Supabase Auth | P0 | Google/Facebook OAuth login |
| Meta OAuth | P0 | Connect to Meta Ads Manager |
| Ad Account Selection | P0 | List and select ad accounts |
| Data Collection | P0 | Fetch Campaigns, Ad Sets, Ads |
| Multiple Date Ranges | P0 | Query 7 Days, 3 Days, Today |
| Store in Database | P0 | Persist collected metrics |
| AI Analysis | P0 | Use prompt to analyze data |
| Text Suggestions | P0 | Display actionable recommendations |
| Manual Regenerate | P0 | Button to refresh report |

### ❌ Out of Scope (Post-MVP)

| Feature | Reason |
|---------|--------|
| Auto-apply actions | Requires additional Meta permissions |
| Automatic refresh | Keep MVP simple with manual trigger |
| Performance tracking | Focus on analysis first |
| Accept/Reject actions | Just show suggestions as text |
| Email notifications | Manual workflow only |
| Real-time updates | On-demand data fetching only |

---

## 5. Data Collection

### Date Ranges

| Range | Description | Use Case |
|-------|-------------|----------|
| **Today** | Current day data | Real-time performance check |
| **3 Days** | Last 3 days | Short-term trend analysis |
| **7 Days** | Last 7 days | Standard performance window |

### Metrics to Collect

For each Campaign, Ad Set, and Ad, collect:

| Metric | Description |
|--------|-------------|
| `spend` | Amount spent |
| `impressions` | Number of impressions |
| `clicks` | Number of clicks |
| `ctr` | Click-through rate |
| `cpc` | Cost per click |
| `cpm` | Cost per 1000 impressions |
| `conversions` | Number of conversions (purchases) |
| `cost_per_conversion` | Cost per conversion |
| `roas` | Return on ad spend |

### Data Hierarchy

```
Ad Account
├── Campaign 1
│   ├── Ad Set 1A
│   │   ├── Ad 1A-1
│   │   └── Ad 1A-2
│   └── Ad Set 1B
│       └── Ad 1B-1
└── Campaign 2
    └── Ad Set 2A
        └── Ad 2A-1
```

---

## 6. AI Analysis

### Prompt Strategy

The AI will receive structured data and analyze it to provide suggestions:

```
Analyze the following Meta Ads performance data:

[Campaign/Ad Set/Ad data with metrics for 7D, 3D, Today]

Based on the data, provide actionable recommendations in the following categories:
1. STOP - What should be paused immediately? Why?
2. BOOST - What is performing well and should get more budget? Why?
3. UPDATE - What needs optimization changes? What changes?

Consider:
- Trend direction (improving, declining, stable)
- Spend efficiency (ROAS, CPC, CPM)
- Performance relative to other items
- Data significance (enough spend/impressions to judge)
```

### Suggestion Types

| Action | Description | Example |
|--------|-------------|---------|
| **Stop** | Pause underperforming items | "Stop Ad Set 'Summer Sale' - ROAS dropped from 2.1 to 0.8 over 7 days" |
| **Boost** | Increase budget for winners | "Boost Campaign 'Brand Awareness' - CTR increased 40% in 3 days" |
| **Update** | Suggest optimization changes | "Update Ad 'Blue Banner' - High impressions but low CTR, consider new creative" |

---


## 9. UI Screens (MVP)

### Screen 1: Login
- Google/Facebook OAuth buttons
- Simple, clean branding
- Redirect to dashboard on success

### Screen 2: Connect Meta
- "Connect Meta Ads Manager" CTA button
- Brief permission explanation
- Success/error states

### Screen 3: Select Ad Account
- Dropdown or list of ad accounts
- Account name and ID displayed
- "Continue" button after selection

### Screen 4: Dashboard / Report
- Selected ad account info
- **"Generate Report" button** (primary action)
- Loading state during data collection
- Report results display:
  - Summary metrics (total spend, overall ROAS)
  - Data tables (Campaigns, Ad Sets, Ads)
  - Date range toggle (7D / 3D / Today)
- **AI Suggestions section**:
  - Stop recommendations (red)
  - Boost recommendations (green)
  - Update recommendations (yellow)
  - Each with entity name and reasoning
- **"Regenerate Report" button** at bottom

---

## 10. Success Metrics

### MVP Launch Criteria

| Metric | Target |
|--------|--------|
| User can log in | 100% success |
| User can connect Meta account | 100% success |
| Data fetches successfully | For accounts with < 50 ads |
| AI suggestions generate | Within 30 seconds |
| Report displays correctly | All metrics visible |

---