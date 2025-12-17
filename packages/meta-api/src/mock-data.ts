import { MetaAdAccount, MetaCampaign, MetaAdSet, MetaAd, MetaInsights } from './types';

// Hardcoded Account ID for consistency: act_123456789

// 1. Ad Accounts
export const MOCK_AD_ACCOUNT: MetaAdAccount = {
  id: 'act_123456789',
  account_id: '123456789',
  name: 'JakeX Demo Account',
  currency: 'USD',
  timezone_name: 'America/New_York',
  account_status: 1, // Active
  amount_spent: '15400.50',
  balance: '0',
  created_time: '2023-01-01T00:00:00+0000'
};

// 2. Campaigns
// We will simulate 3 campaigns:
// - C1: High performing Sales (Good ROAS)
// - C2: Low performing Awareness (High CPM, low CTR)
// - C3: Average Traffic (Mid performance)

export const MOCK_CAMPAIGNS: MetaCampaign[] = [
  {
    id: '12020202020',
    account_id: '123456789',
    name: 'Sales - Summer Promo - 2024',
    status: 'ACTIVE',
    objective: 'OUTCOME_SALES',
    daily_budget: '5000', // $50.00
    start_time: '2024-06-01T08:00:00+0000'
  },
  {
    id: '12020202021',
    account_id: '123456789',
    name: 'Awareness - Brand Launch',
    status: 'ACTIVE',
    objective: 'OUTCOME_AWARENESS',
    daily_budget: '2000', // $20.00
    start_time: '2024-05-15T08:00:00+0000'
  },
  {
    id: '12020202022',
    account_id: '123456789',
    name: 'Traffic - Blog Content',
    status: 'PAUSED',
    objective: 'OUTCOME_TRAFFIC',
    lifetime_budget: '10000', // $100.00
    start_time: '2024-04-01T08:00:00+0000',
    stop_time: '2024-04-30T23:59:59+0000'
  }
];

// 3. Ad Sets
export const MOCK_AD_SETS: MetaAdSet[] = [
  // C1 Ad Sets
  {
    id: '12020202020_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    name: 'Broad - US - 25-45',
    status: 'ACTIVE',
    optimization_goal: 'OFFSITE_CONVERSIONS',
    billing_event: 'IMPRESSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    daily_budget: '2500',
    targeting: {
      geo_locations: { countries: ['US'] },
      age_min: 25,
      age_max: 45,
      publisher_platforms: ['facebook', 'instagram']
    },
    start_time: '2024-06-01T08:00:00+0000'
  },
  {
    id: '12020202020_2',
    account_id: '123456789',
    campaign_id: '12020202020',
    name: 'Retargeting - Website Visitors',
    status: 'ACTIVE',
    optimization_goal: 'OFFSITE_CONVERSIONS',
    billing_event: 'IMPRESSIONS',
    bid_strategy: 'COST_CAP',
    daily_budget: '2500',
    targeting: {
      geo_locations: { countries: ['US'] }
    },
    start_time: '2024-06-01T08:00:00+0000'
  },
  // C2 Ad Set
  {
    id: '12020202021_1',
    account_id: '123456789',
    campaign_id: '12020202021',
    name: 'Lookalike 1% - Purchasers',
    status: 'ACTIVE',
    optimization_goal: 'IMPRESSIONS',
    billing_event: 'IMPRESSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    daily_budget: '2000',
    start_time: '2024-05-15T08:00:00+0000'
  }
];

// 4. Ads
export const MOCK_ADS: MetaAd[] = [
  // C1 Ad Set 1 Ads
  {
    id: '12020202020_1_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    adset_id: '12020202020_1',
    name: 'Video - Product Use Case',
    status: 'ACTIVE',
    creative: {
      id: '999111',
      title: 'Solves your problem instantly',
      body: 'See why 10,000+ customers love JakeX.',
      call_to_action_type: 'SHOP_NOW',
      image_url: 'https://placeholder.com/video_thumb.jpg'
    }
  },
  {
    id: '12020202020_1_2',
    account_id: '123456789',
    campaign_id: '12020202020',
    adset_id: '12020202020_1',
    name: 'Image - Lifestyle Shot',
    status: 'ACTIVE',
    creative: {
      id: '999112',
      title: 'Upgrade your workflow',
      body: 'Automation made simple.',
      call_to_action_type: 'SHOP_NOW',
      image_url: 'https://placeholder.com/lifestyle.jpg'
    }
  },
  // C1 Ad Set 2 Ads (Retargeting)
  {
    id: '12020202020_2_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    adset_id: '12020202020_2',
    name: 'Carousel - Testimonial',
    status: 'PAUSED', // Underperforming
    creative: {
      id: '999113',
      title: 'What they say',
      body: 'Verified reviews.',
      call_to_action_type: 'LEARN_MORE'
    }
  }
];

// 5. Insights (Simulating "Last 7 Days" or "Today")
// We will key these by entity ID for easy retrieval in the mock client
export const MOCK_INSIGHTS_MAP: Record<string, MetaInsights> = {
  // Campaign 1: Good Performance
  '12020202020': {
    account_id: '123456789',
    campaign_id: '12020202020',
    spend: '350.50',
    impressions: '15000',
    clicks: '450',
    cpc: '0.78',
    cpm: '23.36',
    ctr: '3.00',
    date_start: '2024-06-10',
    date_stop: '2024-06-17',
    actions: [
      { action_type: 'purchase', value: '12' },
      { action_type: 'landing_page_view', value: '300' }
    ] // High ROAS implied
  },
  
  // Campaign 2: Bad Performance (High spend, no sales)
  '12020202021': {
    account_id: '123456789',
    campaign_id: '12020202021',
    spend: '140.00',
    impressions: '50000', // Cheap impressions
    clicks: '100', // Low clicks
    cpc: '1.40',
    cpm: '2.80',
    ctr: '0.20', // Terrible CTR
    date_start: '2024-06-10',
    date_stop: '2024-06-17',
    actions: [] // No conversions
  }
};
