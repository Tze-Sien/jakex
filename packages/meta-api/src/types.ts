export interface MetaAdAccount {
  id: string; // "act_123..."
  account_id: string; // "123..."
  name: string;
  currency: string;
  timezone_name: string;
  account_status: 1 | 2 | 3 | 7 | 8 | 9 | 101 | 102; // 1 = Active
  amount_spent: string;
  balance: string;
  created_time: string;
}

export interface MetaCampaign {
  id: string;
  account_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS' | 'OUTCOME_ENGAGEMENT' | 'OUTCOME_LEADS' | 'OUTCOME_APP_PROMOTION';
  daily_budget?: string;
  lifetime_budget?: string;
  start_time: string; // ISO 8601
  stop_time?: string; // ISO 8601
}

export interface MetaAdSet {
  id: string;
  account_id: string;
  campaign_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  optimization_goal: 'OFFSITE_CONVERSIONS' | 'LINK_CLICKS' | 'IMPRESSIONS' | 'REACH' | 'LANDING_PAGE_VIEWS';
  billing_event: 'IMPRESSIONS' | 'LINK_CLICKS';
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP' | 'COST_CAP' | 'BID_CAP';
  daily_budget?: string;
  lifetime_budget?: string;
  targeting?: {
    age_min?: number;
    age_max?: number;
    geo_locations?: {
      countries?: string[];
    };
    publisher_platforms?: string[]; // "facebook", "instagram"
  };
  start_time: string;
  end_time?: string;
}

export interface MetaAd {
  id: string;
  account_id: string;
  campaign_id: string;
  adset_id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  creative: {
    id: string;
    name?: string;
    title?: string;
    body?: string;
    image_url?: string;
    call_to_action_type?: string;
  };
}

export interface MetaInsightAction {
  action_type: string; // "purchase", "link_click", "post_engagement"
  value: string;
}

export interface MetaInsights {
  account_id: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  
  spend: string;
  impressions: string;
  clicks: string;
  cpc: string;
  cpm: string;
  ctr: string;
  
  actions?: MetaInsightAction[];
  
  date_start: string; // "YYYY-MM-DD"
  date_stop: string; // "YYYY-MM-DD"
}

export interface MetaResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  summary?: {
    total_count: number;
  };
}
