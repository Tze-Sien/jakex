import { faker } from '@faker-js/faker';
import {
  MetaAdAccount,
  MetaCampaign,
  MetaAdSet,
  MetaAd,
  MetaInsights,
  CampaignObjective,
  CampaignStatus,
  CampaignBidStrategy,
  AdSetStatus,
  AdSetOptimizationGoal,
  AdSetBillingEvent,
  AdStatus,
  AdAccountStatus
} from './types';

// ============================
// Dynamic Mock Data Generators
// ============================

/**
 * Generate a random mock ad account
 */
export function generateMockAdAccount(): MetaAdAccount {
  const accountId = faker.number.int({ min: 100000000, max: 999999999 }).toString();
  const amountSpent = faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 });

  return {
    id: `act_${accountId}`,
    account_id: accountId,
    name: `${faker.company.name()} Ads Account`,
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'CAD']),
    timezone_name: faker.helpers.arrayElement([
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'America/Chicago'
    ]),
    account_status: faker.helpers.arrayElement([AdAccountStatus.ACTIVE, AdAccountStatus.DISABLED]),
    amount_spent: amountSpent.toFixed(2),
    balance: '0',
    created_time: faker.date.past({ years: 2 }).toISOString()
  };
}

/**
 * Generate a random mock campaign
 */
export function generateMockCampaign(accountId: string): MetaCampaign {
  const campaignId = faker.number.int({ min: 10000000000, max: 99999999999 }).toString();
  const dailyBudget = faker.number.int({ min: 1000, max: 50000 }); // $10-$500 in cents

  const campaign: MetaCampaign = {
    id: campaignId,
    account_id: accountId.replace('act_', ''),
    name: `${faker.helpers.arrayElement(['Sales', 'Awareness', 'Traffic', 'Leads'])} - ${faker.commerce.productName()}`,
    status: faker.helpers.arrayElement([
      CampaignStatus.ACTIVE,
      CampaignStatus.PAUSED,
      CampaignStatus.ARCHIVED
    ]),
    objective: faker.helpers.arrayElement([
      CampaignObjective.OUTCOME_SALES,
      CampaignObjective.OUTCOME_AWARENESS,
      CampaignObjective.OUTCOME_TRAFFIC,
      CampaignObjective.OUTCOME_ENGAGEMENT,
      CampaignObjective.OUTCOME_LEADS
    ]),
    start_time: faker.date.past({ years: 1 }).toISOString()
  };

  // Randomly assign daily_budget or lifetime_budget
  if (faker.datatype.boolean()) {
    campaign.daily_budget = dailyBudget.toString();
  } else {
    campaign.lifetime_budget = (dailyBudget * 30).toString();
    campaign.stop_time = faker.date.future({ years: 1 }).toISOString();
  }

  return campaign;
}

/**
 * Generate a random mock ad set
 */
export function generateMockAdSet(accountId: string, campaignId: string): MetaAdSet {
  const adSetId = `${campaignId}_${faker.number.int({ min: 1, max: 99 })}`;
  const dailyBudget = faker.number.int({ min: 500, max: 25000 }); // $5-$250

  return {
    id: adSetId,
    account_id: accountId.replace('act_', ''),
    campaign_id: campaignId,
    name: faker.helpers.arrayElement([
      `Broad - ${faker.location.countryCode()} - ${faker.number.int({ min: 18, max: 65 })}-${faker.number.int({ min: 18, max: 65 })}`,
      `Retargeting - ${faker.commerce.department()}`,
      `Lookalike ${faker.number.int({ min: 1, max: 10 })}% - ${faker.word.noun()}`,
      `Interest - ${faker.commerce.productAdjective()}`
    ]),
    status: faker.helpers.arrayElement([AdSetStatus.ACTIVE, AdSetStatus.PAUSED]),
    optimization_goal: faker.helpers.arrayElement([
      AdSetOptimizationGoal.OFFSITE_CONVERSIONS,
      AdSetOptimizationGoal.LINK_CLICKS,
      AdSetOptimizationGoal.IMPRESSIONS,
      AdSetOptimizationGoal.REACH,
      AdSetOptimizationGoal.LANDING_PAGE_VIEWS
    ]),
    billing_event: AdSetBillingEvent.IMPRESSIONS,
    bid_strategy: faker.helpers.arrayElement([
      CampaignBidStrategy.LOWEST_COST_WITHOUT_CAP,
      CampaignBidStrategy.COST_CAP,
      CampaignBidStrategy.LOWEST_COST_WITH_BID_CAP
    ]),
    daily_budget: dailyBudget.toString(),
    targeting: {
      geo_locations: {
        countries: [faker.location.countryCode(), faker.location.countryCode()]
      },
      age_min: faker.number.int({ min: 18, max: 45 }),
      age_max: faker.number.int({ min: 46, max: 65 }),
      publisher_platforms: faker.helpers.arrayElements(['facebook', 'instagram', 'audience_network', 'messenger'], { min: 1, max: 3 })
    },
    start_time: faker.date.past({ years: 1 }).toISOString()
  };
}

/**
 * Generate a random mock ad
 */
export function generateMockAd(accountId: string, campaignId: string, adSetId: string): MetaAd {
  // Use timestamp + random to ensure uniqueness
  const uniqueSuffix = `${Date.now()}_${faker.number.int({ min: 1000, max: 9999 })}`;
  const adId = `${adSetId}_${uniqueSuffix}`;
  const creativeId = faker.number.int({ min: 100000, max: 999999 }).toString();

  const adFormats = ['Video', 'Image', 'Carousel', 'Collection', 'Stories'];
  const ctaTypes = ['SHOP_NOW', 'LEARN_MORE', 'SIGN_UP', 'DOWNLOAD', 'GET_QUOTE', 'APPLY_NOW'] as const;

  return {
    id: adId,
    account_id: accountId.replace('act_', ''),
    campaign_id: campaignId,
    adset_id: adSetId,
    name: `${faker.helpers.arrayElement(adFormats)} - ${faker.commerce.productAdjective()} ${faker.word.noun()}`,
    status: faker.helpers.arrayElement([AdStatus.ACTIVE, AdStatus.PAUSED]),
    creative: {
      id: creativeId,
      title: faker.company.catchPhrase(),
      body: faker.lorem.sentence(),
      call_to_action_type: faker.helpers.arrayElement(ctaTypes),
      image_url: `https://picsum.photos/seed/${creativeId}/1200/630`
    }
  };
}

/**
 * Helper to format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Calculate date range based on date preset
 */
function getDateRangeFromPreset(preset: string): { dateStart: string; dateStop: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStop = formatDate(today);
  let dateStart = dateStop;

  switch (preset) {
    case 'today':
      dateStart = dateStop;
      break;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dateStart = formatDate(yesterday);
      break;
    case 'last_3d':
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      dateStart = formatDate(threeDaysAgo);
      break;
    case 'last_7d':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateStart = formatDate(sevenDaysAgo);
      break;
    case 'last_14d':
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      dateStart = formatDate(fourteenDaysAgo);
      break;
    case 'last_28d':
    case 'last_30d':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateStart = formatDate(thirtyDaysAgo);
      break;
    case 'last_90d':
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      dateStart = formatDate(ninetyDaysAgo);
      break;
    case 'this_month':
      dateStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateStart: formatDate(lastMonthStart), dateStop: formatDate(lastMonthEnd) };
    default:
      // Default to last 7 days
      const defaultStart = new Date(today);
      defaultStart.setDate(defaultStart.getDate() - 7);
      dateStart = formatDate(defaultStart);
  }

  return { dateStart, dateStop };
}

/**
 * Generate random mock insights for an entity
 * Enhanced with more realistic metrics and comprehensive data
 */
export function generateMockInsights(
  entityId: string,
  accountId: string,
  level: 'account' | 'campaign' | 'adset' | 'ad',
  datePreset: string = 'last_7d',
  timeRange?: { since: string; until: string },
  entityName?: string
): MetaInsights {
  // Calculate date range
  const { dateStart, dateStop } = timeRange
    ? { dateStart: timeRange.since, dateStop: timeRange.until }
    : getDateRangeFromPreset(datePreset);

  // Generate realistic metrics based on level
  const baseBudget = level === 'account' ? 10000 : level === 'campaign' ? 5000 : level === 'adset' ? 2000 : 500;
  const spend = faker.number.float({ min: baseBudget * 0.3, max: baseBudget * 0.9, fractionDigits: 2 });

  // Impressions scale with spend and level
  const impressionMultiplier = level === 'ad' ? 100 : level === 'adset' ? 500 : level === 'campaign' ? 2000 : 5000;
  const impressions = faker.number.int({ min: Math.floor(spend * impressionMultiplier * 0.8), max: Math.floor(spend * impressionMultiplier * 1.2) });

  // Reach is typically 60-95% of impressions
  const reach = faker.number.int({ min: Math.floor(impressions * 0.6), max: Math.floor(impressions * 0.95) });

  // Frequency = impressions / reach
  const frequency = (impressions / reach).toFixed(2);

  // CTR varies by level (ads typically have higher CTR)
  const ctrMultiplier = level === 'ad' ? 0.05 : level === 'adset' ? 0.03 : 0.02;
  const clicks = faker.number.int({ min: Math.floor(impressions * ctrMultiplier * 0.5), max: Math.floor(impressions * ctrMultiplier * 1.5) });

  // Calculate cost metrics
  const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';
  const cpm = impressions > 0 ? ((spend / impressions) * 1000).toFixed(2) : '0.00';
  const cpp = reach > 0 ? ((spend / reach) * 1000).toFixed(2) : '0.00';
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(4) : '0.0000';

  // Generate conversion actions with attribution windows
  const hasConversions = faker.datatype.boolean({ probability: 0.7 });
  const purchases = hasConversions ? faker.number.int({ min: 1, max: Math.floor(clicks * 0.05) }) : 0;
  const landingPageViews = faker.number.int({ min: Math.floor(clicks * 0.3), max: Math.floor(clicks * 0.8) });
  const addToCarts = faker.number.int({ min: Math.floor(purchases * 1.5), max: Math.floor(clicks * 0.3) });
  const initiateCheckouts = faker.number.int({ min: purchases, max: Math.floor(addToCarts * 0.6) });

  const actions = [
    {
      action_type: 'link_click',
      value: clicks.toString(),
      '1d_click': Math.floor(clicks * 0.4).toString(),
      '7d_click': Math.floor(clicks * 0.9).toString(),
      '28d_click': clicks.toString()
    },
    {
      action_type: 'landing_page_view',
      value: landingPageViews.toString(),
      '1d_click': Math.floor(landingPageViews * 0.4).toString(),
      '7d_click': Math.floor(landingPageViews * 0.9).toString()
    },
    {
      action_type: 'offsite_conversion.fb_pixel_view_content',
      value: faker.number.int({ min: Math.floor(landingPageViews * 0.5), max: landingPageViews }).toString()
    }
  ];

  // Add conversion actions if applicable
  if (hasConversions) {
    actions.push(
      {
        action_type: 'offsite_conversion.fb_pixel_add_to_cart',
        value: addToCarts.toString(),
        '1d_click': Math.floor(addToCarts * 0.4).toString(),
        '7d_click': Math.floor(addToCarts * 0.85).toString()
      },
      {
        action_type: 'offsite_conversion.fb_pixel_initiate_checkout',
        value: initiateCheckouts.toString(),
        '1d_click': Math.floor(initiateCheckouts * 0.4).toString(),
        '7d_click': Math.floor(initiateCheckouts * 0.85).toString()
      },
      {
        action_type: 'offsite_conversion.fb_pixel_purchase',
        value: purchases.toString(),
        '1d_click': Math.floor(purchases * 0.3).toString(),
        '7d_click': Math.floor(purchases * 0.8).toString(),
        '28d_click': purchases.toString()
      }
    );
  }

  // Generate action values (revenue)
  const action_values = hasConversions ? [
    {
      action_type: 'offsite_conversion.fb_pixel_purchase',
      value: (purchases * faker.number.float({ min: 25, max: 150, fractionDigits: 2 })).toFixed(2),
      '1d_click': (Math.floor(purchases * 0.3) * faker.number.float({ min: 25, max: 150, fractionDigits: 2 })).toFixed(2),
      '7d_click': (Math.floor(purchases * 0.8) * faker.number.float({ min: 25, max: 150, fractionDigits: 2 })).toFixed(2)
    }
  ] : undefined;

  // Calculate cost per action type
  const cost_per_action_type = [
    {
      action_type: 'link_click',
      value: cpc
    },
    {
      action_type: 'landing_page_view',
      value: landingPageViews > 0 ? (spend / landingPageViews).toFixed(2) : '0.00'
    }
  ];

  if (hasConversions) {
    cost_per_action_type.push(
      {
        action_type: 'offsite_conversion.fb_pixel_add_to_cart',
        value: addToCarts > 0 ? (spend / addToCarts).toFixed(2) : '0.00'
      },
      {
        action_type: 'offsite_conversion.fb_pixel_purchase',
        value: purchases > 0 ? (spend / purchases).toFixed(2) : '0.00'
      }
    );
  }

  const insights: MetaInsights = {
    account_id: accountId.replace('act_', ''),
    spend: spend.toFixed(2),
    impressions: impressions.toString(),
    clicks: clicks.toString(),
    reach: reach.toString(),
    frequency,
    cpc,
    cpm,
    cpp,
    ctr,
    date_start: dateStart,
    date_stop: dateStop,
    actions,
    action_values,
    cost_per_action_type
  };

  // Add level-specific fields
  if (level === 'campaign') {
    insights.campaign_id = entityId;
    insights.campaign_name = entityName || `Campaign ${entityId}`;
  } else if (level === 'adset') {
    insights.adset_id = entityId;
    insights.adset_name = entityName || `AdSet ${entityId}`;
  } else if (level === 'ad') {
    insights.ad_id = entityId;
    insights.ad_name = entityName || `Ad ${entityId}`;
  } else {
    insights.account_name = entityName || `Account ${accountId}`;
  }

  // Add quality rankings for ads
  if (level === 'ad') {
    insights.quality_ranking = faker.helpers.arrayElement(['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE']);
    insights.engagement_rate_ranking = faker.helpers.arrayElement(['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE']);
    insights.conversion_rate_ranking = faker.helpers.arrayElement(['ABOVE_AVERAGE', 'AVERAGE', 'BELOW_AVERAGE']);
  }

  return insights;
}

// ============================
// Generate Mock Data Sets
// ============================

/**
 * Generate multiple ad accounts (3-5)
 */
export function generateMockAdAccounts(): MetaAdAccount[] {
  const count = faker.number.int({ min: 3, max: 5 });
  return Array.from({ length: count }, () => generateMockAdAccount());
}

/**
 * Generate multiple campaigns for an account (5-20)
 */
export function generateMockCampaigns(accountId: string, count?: number): MetaCampaign[] {
  const numCampaigns = count || faker.number.int({ min: 5, max: 20 });
  return Array.from({ length: numCampaigns }, () => generateMockCampaign(accountId));
}

/**
 * Generate multiple ad sets for a campaign (2-8)
 */
export function generateMockAdSets(accountId: string, campaignId: string, count?: number): MetaAdSet[] {
  const numAdSets = count || faker.number.int({ min: 2, max: 8 });
  return Array.from({ length: numAdSets }, () => generateMockAdSet(accountId, campaignId));
}

/**
 * Generate multiple ads for an ad set (1-5)
 */
export function generateMockAds(accountId: string, campaignId: string, adSetId: string, count?: number): MetaAd[] {
  const numAds = count || faker.number.int({ min: 1, max: 5 });
  return Array.from({ length: numAds }, () => generateMockAd(accountId, campaignId, adSetId));
}

// ============================
// Static Mock Data (for backwards compatibility)
// ============================

export const MOCK_AD_ACCOUNT: MetaAdAccount = {
  id: 'act_123456789',
  account_id: '123456789',
  name: 'JakeX Demo Account',
  currency: 'USD',
  timezone_name: 'America/New_York',
  account_status: AdAccountStatus.ACTIVE,
  amount_spent: '15400.50',
  balance: '0',
  created_time: '2023-01-01T00:00:00+0000'
};

export const MOCK_CAMPAIGNS: MetaCampaign[] = [
  {
    id: '12020202020',
    account_id: '123456789',
    name: 'Sales - Summer Promo - 2024',
    status: CampaignStatus.ACTIVE,
    objective: CampaignObjective.OUTCOME_SALES,
    daily_budget: '5000',
    start_time: '2024-06-01T08:00:00+0000'
  },
  {
    id: '12020202021',
    account_id: '123456789',
    name: 'Awareness - Brand Launch',
    status: CampaignStatus.ACTIVE,
    objective: CampaignObjective.OUTCOME_AWARENESS,
    daily_budget: '2000',
    start_time: '2024-05-15T08:00:00+0000'
  },
  {
    id: '12020202022',
    account_id: '123456789',
    name: 'Traffic - Blog Content',
    status: CampaignStatus.PAUSED,
    objective: CampaignObjective.OUTCOME_TRAFFIC,
    lifetime_budget: '10000',
    start_time: '2024-04-01T08:00:00+0000',
    stop_time: '2024-04-30T23:59:59+0000'
  }
];

export const MOCK_AD_SETS: MetaAdSet[] = [
  {
    id: '12020202020_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    name: 'Broad - US - 25-45',
    status: AdSetStatus.ACTIVE,
    optimization_goal: AdSetOptimizationGoal.OFFSITE_CONVERSIONS,
    billing_event: AdSetBillingEvent.IMPRESSIONS,
    bid_strategy: CampaignBidStrategy.LOWEST_COST_WITHOUT_CAP,
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
    status: AdSetStatus.ACTIVE,
    optimization_goal: AdSetOptimizationGoal.OFFSITE_CONVERSIONS,
    billing_event: AdSetBillingEvent.IMPRESSIONS,
    bid_strategy: CampaignBidStrategy.COST_CAP,
    daily_budget: '2500',
    targeting: {
      geo_locations: { countries: ['US'] }
    },
    start_time: '2024-06-01T08:00:00+0000'
  },
  {
    id: '12020202021_1',
    account_id: '123456789',
    campaign_id: '12020202021',
    name: 'Lookalike 1% - Purchasers',
    status: AdSetStatus.ACTIVE,
    optimization_goal: AdSetOptimizationGoal.IMPRESSIONS,
    billing_event: AdSetBillingEvent.IMPRESSIONS,
    bid_strategy: CampaignBidStrategy.LOWEST_COST_WITHOUT_CAP,
    daily_budget: '2000',
    start_time: '2024-05-15T08:00:00+0000'
  }
];

export const MOCK_ADS: MetaAd[] = [
  {
    id: '12020202020_1_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    adset_id: '12020202020_1',
    name: 'Video - Product Use Case',
    status: AdStatus.ACTIVE,
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
    status: AdStatus.ACTIVE,
    creative: {
      id: '999112',
      title: 'Upgrade your workflow',
      body: 'Automation made simple.',
      call_to_action_type: 'SHOP_NOW',
      image_url: 'https://placeholder.com/lifestyle.jpg'
    }
  },
  {
    id: '12020202020_2_1',
    account_id: '123456789',
    campaign_id: '12020202020',
    adset_id: '12020202020_2',
    name: 'Carousel - Testimonial',
    status: AdStatus.PAUSED,
    creative: {
      id: '999113',
      title: 'What they say',
      body: 'Verified reviews.',
      call_to_action_type: 'LEARN_MORE'
    }
  }
];

export const MOCK_INSIGHTS_MAP: Record<string, MetaInsights> = {
  '12020202020': {
    account_id: '123456789',
    campaign_id: '12020202020',
    spend: '350.50',
    impressions: '15000',
    clicks: '450',
    cpc: '0.78',
    cpm: '23.36',
    cpp: '30.50',
    ctr: '3.00',
    date_start: '2024-06-10',
    date_stop: '2024-06-17',
    actions: [
      { action_type: 'purchase', value: '12' },
      { action_type: 'landing_page_view', value: '300' }
    ]
  },
  '12020202021': {
    account_id: '123456789',
    campaign_id: '12020202021',
    spend: '140.00',
    impressions: '50000',
    clicks: '100',
    cpc: '1.40',
    cpm: '2.80',
    cpp: '3.50',
    ctr: '0.20',
    date_start: '2024-06-10',
    date_stop: '2024-06-17',
    actions: []
  }
};
