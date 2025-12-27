/**
 * TypeScript interfaces strictly typed to match facebook-nodejs-business-sdk
 * Based on SDK version: 24.0.1
 *
 * These interfaces mirror the exact field structure and enums from the official META SDK
 * to ensure type safety and compatibility between mock and real API responses.
 */

import {
  AdAccount,
  Campaign,
  AdSet,
  Ad,
  AdsInsights
} from 'facebook-nodejs-business-sdk';

// =============================================================================
// ENUMS - Matching SDK Static Properties
// =============================================================================

/**
 * Campaign.Objective - All possible campaign objectives
 * Based on Campaign.Objective from facebook-nodejs-business-sdk
 */
export enum CampaignObjective {
  APP_INSTALLS = 'APP_INSTALLS',
  BRAND_AWARENESS = 'BRAND_AWARENESS',
  CONVERSIONS = 'CONVERSIONS',
  EVENT_RESPONSES = 'EVENT_RESPONSES',
  LEAD_GENERATION = 'LEAD_GENERATION',
  LINK_CLICKS = 'LINK_CLICKS',
  LOCAL_AWARENESS = 'LOCAL_AWARENESS',
  MESSAGES = 'MESSAGES',
  OFFER_CLAIMS = 'OFFER_CLAIMS',
  OUTCOME_APP_PROMOTION = 'OUTCOME_APP_PROMOTION',
  OUTCOME_AWARENESS = 'OUTCOME_AWARENESS',
  OUTCOME_ENGAGEMENT = 'OUTCOME_ENGAGEMENT',
  OUTCOME_LEADS = 'OUTCOME_LEADS',
  OUTCOME_SALES = 'OUTCOME_SALES',
  OUTCOME_TRAFFIC = 'OUTCOME_TRAFFIC',
  PAGE_LIKES = 'PAGE_LIKES',
  POST_ENGAGEMENT = 'POST_ENGAGEMENT',
  PRODUCT_CATALOG_SALES = 'PRODUCT_CATALOG_SALES',
  REACH = 'REACH',
  STORE_VISITS = 'STORE_VISITS',
  VIDEO_VIEWS = 'VIDEO_VIEWS'
}

/**
 * Campaign.Status - Campaign status values
 */
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Campaign.BidStrategy - Bidding strategies
 */
export enum CampaignBidStrategy {
  LOWEST_COST_WITHOUT_CAP = 'LOWEST_COST_WITHOUT_CAP',
  LOWEST_COST_WITH_BID_CAP = 'LOWEST_COST_WITH_BID_CAP',
  COST_CAP = 'COST_CAP',
  LOWEST_COST_WITH_MIN_ROAS = 'LOWEST_COST_WITH_MIN_ROAS'
}

/**
 * Campaign.EffectiveStatus - Effective status including system states
 */
export enum CampaignEffectiveStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED',
  IN_PROCESS = 'IN_PROCESS',
  WITH_ISSUES = 'WITH_ISSUES'
}

/**
 * AdSet.OptimizationGoal - All possible optimization goals
 */
export enum AdSetOptimizationGoal {
  NONE = 'NONE',
  APP_INSTALLS = 'APP_INSTALLS',
  AD_RECALL_LIFT = 'AD_RECALL_LIFT',
  ENGAGED_USERS = 'ENGAGED_USERS',
  EVENT_RESPONSES = 'EVENT_RESPONSES',
  IMPRESSIONS = 'IMPRESSIONS',
  LEAD_GENERATION = 'LEAD_GENERATION',
  QUALITY_LEAD = 'QUALITY_LEAD',
  LINK_CLICKS = 'LINK_CLICKS',
  OFFSITE_CONVERSIONS = 'OFFSITE_CONVERSIONS',
  PAGE_LIKES = 'PAGE_LIKES',
  POST_ENGAGEMENT = 'POST_ENGAGEMENT',
  QUALITY_CALL = 'QUALITY_CALL',
  REACH = 'REACH',
  LANDING_PAGE_VIEWS = 'LANDING_PAGE_VIEWS',
  VISIT_INSTAGRAM_PROFILE = 'VISIT_INSTAGRAM_PROFILE',
  VALUE = 'VALUE',
  THRUPLAY = 'THRUPLAY',
  DERIVED_EVENTS = 'DERIVED_EVENTS',
  APP_INSTALLS_AND_OFFSITE_CONVERSIONS = 'APP_INSTALLS_AND_OFFSITE_CONVERSIONS',
  CONVERSATIONS = 'CONVERSATIONS',
  IN_APP_VALUE = 'IN_APP_VALUE',
  MESSAGING_PURCHASE_CONVERSION = 'MESSAGING_PURCHASE_CONVERSION',
  MESSAGING_APPOINTMENT_CONVERSION = 'MESSAGING_APPOINTMENT_CONVERSION',
  SUBSCRIBERS = 'SUBSCRIBERS',
  REMINDERS_SET = 'REMINDERS_SET',
  MEANINGFUL_CALL_ATTEMPT = 'MEANINGFUL_CALL_ATTEMPT',
  PROFILE_AND_PAGE_ENGAGEMENT = 'PROFILE_AND_PAGE_ENGAGEMENT'
}

/**
 * AdSet.BillingEvent - Billing event types
 */
export enum AdSetBillingEvent {
  APP_INSTALLS = 'APP_INSTALLS',
  CLICKS = 'CLICKS',
  IMPRESSIONS = 'IMPRESSIONS',
  LINK_CLICKS = 'LINK_CLICKS',
  NONE = 'NONE',
  OFFER_CLAIMS = 'OFFER_CLAIMS',
  PAGE_LIKES = 'PAGE_LIKES',
  POST_ENGAGEMENT = 'POST_ENGAGEMENT',
  THRUPLAY = 'THRUPLAY',
  PURCHASE = 'PURCHASE',
  LISTING_INTERACTION = 'LISTING_INTERACTION'
}

/**
 * AdSet.Status - Ad set status values
 */
export enum AdSetStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Ad.Status - Ad status values
 */
export enum AdStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Ad.EffectiveStatus - Ad effective status including review states
 */
export enum AdEffectiveStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DELETED = 'DELETED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  DISAPPROVED = 'DISAPPROVED',
  PREAPPROVED = 'PREAPPROVED',
  PENDING_BILLING_INFO = 'PENDING_BILLING_INFO',
  CAMPAIGN_PAUSED = 'CAMPAIGN_PAUSED',
  ARCHIVED = 'ARCHIVED',
  ADSET_PAUSED = 'ADSET_PAUSED',
  IN_PROCESS = 'IN_PROCESS',
  WITH_ISSUES = 'WITH_ISSUES'
}

/**
 * AdAccount.AccountStatus - Account status codes
 */
export enum AdAccountStatus {
  ACTIVE = 1,
  DISABLED = 2,
  UNSETTLED = 3,
  PENDING_RISK_REVIEW = 7,
  PENDING_SETTLEMENT = 8,
  IN_GRACE_PERIOD = 9,
  PENDING_CLOSURE = 101,
  CLOSED = 102,
  ANY_ACTIVE = 201,
  ANY_CLOSED = 202
}

/**
 * Supported currencies - subset of most common ones
 * Full list available in SDK: AdAccount.Currency
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
  CNY = 'CNY',
  INR = 'INR',
  BRL = 'BRL',
  MXN = 'MXN',
  KRW = 'KRW',
  SGD = 'SGD',
  HKD = 'HKD',
  CHF = 'CHF',
  SEK = 'SEK',
  NZD = 'NZD',
  ZAR = 'ZAR'
}

// =============================================================================
// CORE ENTITY INTERFACES
// =============================================================================

/**
 * AdAccount interface matching facebook-nodejs-business-sdk AdAccount.Fields
 * Represents a META Ads account with all core fields
 */
export interface MetaAdAccount {
  // Core identification
  id: string; // "act_123456789"
  account_id: string; // "123456789"
  name: string;

  // Financial info
  currency: string; // Use Currency enum
  balance: string; // Amount as string, e.g., "10000.50"
  amount_spent: string;

  // Status and settings
  account_status: AdAccountStatus;

  // Location and time
  timezone_name: string; // "America/Los_Angeles"
  timezone_offset_hours_utc?: number;

  // Ownership
  business_name?: string;
  owner?: string; // User ID
  is_personal?: boolean;

  // Capabilities
  can_create_brand_lift_study?: boolean;
  capabilities?: string[];

  // Metadata
  created_time: string; // ISO 8601

  // Optional extended fields
  email?: string;
  funding_source?: string;
  owner_business?: {
    id: string;
    name: string;
  };
}

/**
 * Campaign interface matching facebook-nodejs-business-sdk Campaign.Fields
 */
export interface MetaCampaign {
  // Core identification
  id: string;
  account_id: string;
  name: string;

  // Status
  status: CampaignStatus;
  effective_status?: CampaignEffectiveStatus;
  configured_status?: CampaignStatus;

  // Objective and strategy
  objective: CampaignObjective;
  bid_strategy?: CampaignBidStrategy;

  // Budget
  daily_budget?: string; // Amount in cents, e.g., "10000" = $100.00
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;

  // Timing
  start_time?: string; // ISO 8601
  stop_time?: string; // ISO 8601
  created_time?: string;
  updated_time?: string;

  // Advanced features
  special_ad_categories?: string[]; // "HOUSING", "EMPLOYMENT", "CREDIT"
  special_ad_category?: string;
  special_ad_category_country?: string[];

  // Promoted object (for specific objectives)
  promoted_object?: {
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
    application_id?: string;
    object_store_url?: string;
  };

  // Optimization
  pacing_type?: string[]; // ["standard", "no_pacing"]

  // Metadata
  source_campaign_id?: string;
  is_skadnetwork_attribution?: boolean;

  // Issues and recommendations
  issues_info?: Array<{
    error_code: number;
    error_message: string;
    error_summary: string;
    level: 'WARNING' | 'ERROR';
  }>;
}

/**
 * Targeting specification for AdSets
 * Comprehensive targeting options matching SDK
 */
export interface MetaTargeting {
  // Demographics
  age_min?: number; // 13-65+
  age_max?: number;
  genders?: (1 | 2)[]; // 1 = male, 2 = female

  // Location
  geo_locations?: {
    countries?: string[]; // ISO country codes: ["US", "CA"]
    regions?: Array<{ key: string; name?: string }>;
    cities?: Array<{ key: string; radius?: number; distance_unit?: 'mile' | 'kilometer' }>;
    zips?: Array<{ key: string }>;
    location_types?: ('home' | 'recent')[];
  };

  // Placement
  publisher_platforms?: ('facebook' | 'instagram' | 'audience_network' | 'messenger')[];
  facebook_positions?: string[]; // "feed", "right_hand_column", "instant_article", etc.
  instagram_positions?: string[]; // "stream", "story", "explore", etc.
  device_platforms?: ('mobile' | 'desktop')[];

  // Interests and behaviors
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name?: string }>;
    behaviors?: Array<{ id: string; name?: string }>;
    life_events?: Array<{ id: string; name?: string }>;
  }>;

  // Exclusions
  exclusions?: {
    interests?: Array<{ id: string; name?: string }>;
    behaviors?: Array<{ id: string; name?: string }>;
  };

  // Custom audiences
  custom_audiences?: Array<{ id: string; name?: string }>;
  excluded_custom_audiences?: Array<{ id: string; name?: string }>;

  // Locale
  locales?: string[]; // Language codes: ["en_US", "es_ES"]
}

/**
 * AdSet interface matching facebook-nodejs-business-sdk AdSet.Fields
 */
export interface MetaAdSet {
  // Core identification
  id: string;
  account_id: string;
  campaign_id: string;
  name: string;

  // Status
  status: AdSetStatus;
  effective_status?: CampaignEffectiveStatus;
  configured_status?: AdSetStatus;

  // Optimization
  optimization_goal: AdSetOptimizationGoal;
  optimization_sub_event?: string;
  billing_event: AdSetBillingEvent;
  bid_strategy?: CampaignBidStrategy;
  bid_amount?: string;

  // Budget
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  daily_min_spend_target?: string;
  daily_spend_cap?: string;
  lifetime_min_spend_target?: string;
  lifetime_spend_cap?: string;

  // Targeting
  targeting?: MetaTargeting;

  // Timing
  start_time?: string; // ISO 8601
  end_time?: string; // ISO 8601
  created_time?: string;
  updated_time?: string;

  // Promoted object
  promoted_object?: {
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
    application_id?: string;
    object_store_url?: string;
  };

  // Attribution
  attribution_spec?: Array<{
    event_type: string;
    window_days: number;
  }>;

  // Pacing
  pacing_type?: string[]; // ["standard", "no_pacing", "day_parting"]

  // Creative settings
  is_dynamic_creative?: boolean;

  // Metadata
  campaign?: {
    id: string;
    name?: string;
  };

  // Issues
  issues_info?: Array<{
    error_code: number;
    error_message: string;
    error_summary: string;
    level: 'WARNING' | 'ERROR';
  }>;
}

/**
 * Creative specification for Ads
 */
export interface MetaCreative {
  id: string;
  name?: string;

  // Creative assets
  title?: string;
  body?: string;
  image_url?: string;
  image_hash?: string;
  video_id?: string;
  thumbnail_url?: string;

  // Link
  link_url?: string;
  call_to_action_type?: 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'DOWNLOAD' | 'BOOK_TRAVEL' | 'CONTACT_US' | 'APPLY_NOW' | 'GET_QUOTE' | 'SUBSCRIBE';

  // Multi-asset
  asset_feed_spec?: {
    images?: Array<{ hash: string; url?: string }>;
    bodies?: Array<{ text: string }>;
    titles?: Array<{ text: string }>;
    descriptions?: Array<{ text: string }>;
    ad_formats?: ('SINGLE_IMAGE' | 'SINGLE_VIDEO' | 'CAROUSEL')[];
    link_urls?: Array<{ website_url: string }>;
    call_to_action_types?: string[];
  };

  // Object story spec (for native formats)
  object_story_spec?: {
    page_id: string;
    instagram_actor_id?: string;
    link_data?: {
      image_hash?: string;
      link?: string;
      message?: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
        };
      };
    };
    video_data?: {
      video_id: string;
      image_hash?: string;
      message?: string;
      title?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
        };
      };
    };
  };
}

/**
 * Ad interface matching facebook-nodejs-business-sdk Ad.Fields
 */
export interface MetaAd {
  // Core identification
  id: string;
  account_id: string;
  campaign_id: string;
  adset_id: string;
  name: string;

  // Status
  status: AdStatus;
  effective_status?: AdEffectiveStatus;
  configured_status?: AdStatus;

  // Creative
  creative: MetaCreative;

  // Bidding
  bid_amount?: string;
  bid_type?: 'CPC' | 'CPM' | 'ABSOLUTE_OCPM' | 'CPA';

  // Targeting override
  targeting?: MetaTargeting;

  // Timing
  created_time?: string;
  updated_time?: string;

  // Related objects
  campaign?: {
    id: string;
    name?: string;
  };
  adset?: {
    id: string;
    name?: string;
  };

  // Review feedback
  ad_review_feedback?: {
    global?: {
      [key: string]: any;
    };
  };

  // Issues
  issues_info?: Array<{
    error_code: number;
    error_message: string;
    error_summary: string;
    level: 'WARNING' | 'ERROR';
  }>;
  failed_delivery_checks?: Array<{
    rule_id: string;
    description: string;
  }>;

  // Tracking
  tracking_specs?: Array<{
    action_type: string[];
    fb_pixel?: string[];
    app_id?: string[];
  }>;
  conversion_specs?: Array<{
    action_type: string[];
    fb_pixel?: string[];
  }>;
}

/**
 * Date preset options for insights queries
 * Based on AdsInsights.DatePreset from facebook-nodejs-business-sdk
 */
export enum InsightsDatePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  MAXIMUM = 'maximum',
  DATA_MAXIMUM = 'data_maximum',
  LAST_3D = 'last_3d',
  LAST_7D = 'last_7d',
  LAST_14D = 'last_14d',
  LAST_28D = 'last_28d',
  LAST_30D = 'last_30d',
  LAST_90D = 'last_90d',
  LAST_WEEK_MON_SUN = 'last_week_mon_sun',
  LAST_WEEK_SUN_SAT = 'last_week_sun_sat',
  LAST_QUARTER = 'last_quarter',
  LAST_YEAR = 'last_year',
  THIS_WEEK_MON_TODAY = 'this_week_mon_today',
  THIS_WEEK_SUN_TODAY = 'this_week_sun_today',
  THIS_YEAR = 'this_year'
}

/**
 * Insights level - determines the granularity of the data
 * Based on AdsInsights.Level from facebook-nodejs-business-sdk
 */
export enum InsightsLevel {
  ACCOUNT = 'account',
  CAMPAIGN = 'campaign',
  ADSET = 'adset',
  AD = 'ad'
}

/**
 * Time increment for insights breakdown
 * Based on AdsInsights.TimeIncrement from facebook-nodejs-business-sdk
 */
export type InsightsTimeIncrement = 'all_days' | 'monthly' | number; // number represents daily (1-90)

/**
 * Action attribution windows
 * Based on AdsInsights.ActionAttributionWindows from facebook-nodejs-business-sdk
 */
export enum InsightsActionAttributionWindows {
  VALUE_1D_CLICK = '1d_click',
  VALUE_7D_CLICK = '7d_click',
  VALUE_28D_CLICK = '28d_click',
  VALUE_1D_VIEW = '1d_view',
  VALUE_7D_VIEW = '7d_view',
  VALUE_28D_VIEW = '28d_view',
  VALUE_DEFAULT = 'default'
}

/**
 * Action breakdowns
 * Based on AdsInsights.ActionBreakdowns from facebook-nodejs-business-sdk
 */
export enum InsightsActionBreakdowns {
  ACTION_CANVAS_COMPONENT_NAME = 'action_canvas_component_name',
  ACTION_CAROUSEL_CARD_ID = 'action_carousel_card_id',
  ACTION_CAROUSEL_CARD_NAME = 'action_carousel_card_name',
  ACTION_DESTINATION = 'action_destination',
  ACTION_DEVICE = 'action_device',
  ACTION_REACTION = 'action_reaction',
  ACTION_TARGET_ID = 'action_target_id',
  ACTION_TYPE = 'action_type',
  ACTION_VIDEO_SOUND = 'action_video_sound',
  ACTION_VIDEO_TYPE = 'action_video_type'
}

/**
 * Breakdowns for insights
 * Based on AdsInsights.Breakdowns from facebook-nodejs-business-sdk
 */
export enum InsightsBreakdowns {
  AGE = 'age',
  COUNTRY = 'country',
  DMA = 'dma',
  GENDER = 'gender',
  FREQUENCY_VALUE = 'frequency_value',
  HOURLY_STATS_AGGREGATED_BY_ADVERTISER_TIME_ZONE = 'hourly_stats_aggregated_by_advertiser_time_zone',
  HOURLY_STATS_AGGREGATED_BY_AUDIENCE_TIME_ZONE = 'hourly_stats_aggregated_by_audience_time_zone',
  IMPRESSION_DEVICE = 'impression_device',
  PLACE_PAGE_ID = 'place_page_id',
  PUBLISHER_PLATFORM = 'publisher_platform',
  PLATFORM_POSITION = 'platform_position',
  DEVICE_PLATFORM = 'device_platform',
  PRODUCT_ID = 'product_id',
  REGION = 'region'
}

/**
 * Action/Conversion data in insights
 */
export interface MetaInsightAction {
  action_type: string; // "purchase", "link_click", "post_engagement", "offsite_conversion.fb_pixel_purchase", etc.
  value: string; // Count or value as string
  '1d_click'?: string;
  '7d_click'?: string;
  '1d_view'?: string;
  '7d_view'?: string;
  '28d_click'?: string;
  '28d_view'?: string;
}

/**
 * Insights interface matching facebook-nodejs-business-sdk AdsInsights.Fields
 * Comprehensive performance metrics
 */
export interface MetaInsights {
  // Identification
  account_id: string;
  account_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;

  // Date range
  date_start: string; // "YYYY-MM-DD"
  date_stop: string; // "YYYY-MM-DD"

  // Core metrics
  impressions: string;
  clicks: string;
  spend: string; // Amount spent in account currency
  reach?: string; // Unique people reached
  frequency?: string; // Average impressions per person

  // Cost metrics
  cpc: string; // Cost per click
  cpm: string; // Cost per 1000 impressions
  cpp: string; // Cost per 1000 people reached
  ctr: string; // Click-through rate (percentage)

  // Engagement
  inline_link_clicks?: string;
  inline_link_click_ctr?: string;
  inline_post_engagement?: string;

  // Actions and conversions
  actions?: MetaInsightAction[];
  action_values?: MetaInsightAction[];
  cost_per_action_type?: MetaInsightAction[];
  conversions?: MetaInsightAction[];
  conversion_values?: MetaInsightAction[];
  cost_per_conversion?: MetaInsightAction[];

  // Video metrics
  video_30_sec_watched_actions?: MetaInsightAction[];
  video_avg_time_watched_actions?: MetaInsightAction[];
  video_p25_watched_actions?: MetaInsightAction[];
  video_p50_watched_actions?: MetaInsightAction[];
  video_p75_watched_actions?: MetaInsightAction[];
  video_p95_watched_actions?: MetaInsightAction[];
  video_p100_watched_actions?: MetaInsightAction[];
  cost_per_thruplay?: MetaInsightAction[];

  // Quality metrics
  quality_ranking?: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
  engagement_rate_ranking?: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
  conversion_rate_ranking?: 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';

  // Advanced metrics
  estimated_ad_recallers?: string;
  estimated_ad_recall_rate?: string;
  cost_per_estimated_ad_recallers?: string;

  // Mobile app
  mobile_app_purchase_roas?: MetaInsightAction[];
  website_purchase_roas?: MetaInsightAction[];
  purchase_roas?: MetaInsightAction[];

  // Auction metrics
  auction_bid?: string;
  auction_competitiveness?: string;
  auction_max_competitor_bid?: string;

  // Attribution
  attribution_setting?: string;

  // Catalog
  catalog_segment_actions?: MetaInsightAction[];
  catalog_segment_value?: MetaInsightAction[];

  // Canvas
  canvas_avg_view_percent?: string;
  canvas_avg_view_time?: string;

  // Instant Experience
  instant_experience_clicks_to_open?: string;
  instant_experience_clicks_to_start?: string;
  instant_experience_outbound_clicks?: string;

  // Full view
  full_view_impressions?: string;
  full_view_reach?: string;

  // Objective-specific
  lead_generation_actions?: MetaInsightAction[];
  cost_per_lead?: string;
}

// =============================================================================
// RESPONSE WRAPPERS
// =============================================================================

/**
 * Standard META API response wrapper
 * Matches the structure returned by SDK Cursor and API responses
 */
export interface MetaResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string; // URL for next page
    previous?: string; // URL for previous page
  };
  summary?: {
    total_count: number;
  };
}

/**
 * Cursor-like pagination helper
 * Mirrors SDK Cursor behavior for type compatibility
 */
export interface MetaCursor<T> extends Array<T> {
  paging?: {
    next?: string[];
    previous?: string[];
    params?: Record<string, any>;
  };
  summary?: {
    total_count?: number;
  };
  hasNext?: () => boolean;
  hasPrevious?: () => boolean;
}

// =============================================================================
// INSIGHTS QUERY PARAMETERS
// =============================================================================

/**
 * Comprehensive insights query parameters
 * Based on AdsInsights query parameters from facebook-nodejs-business-sdk
 */
export interface MetaInsightsParams {
  // Level of aggregation
  level?: InsightsLevel;

  // Date parameters (use either date_preset OR time_range)
  date_preset?: InsightsDatePreset | string;
  time_range?: {
    since: string; // 'YYYY-MM-DD'
    until: string; // 'YYYY-MM-DD'
  };

  // Time increment
  time_increment?: InsightsTimeIncrement;

  // Breakdowns
  breakdowns?: InsightsBreakdowns[] | string[];
  action_breakdowns?: InsightsActionBreakdowns[] | string[];

  // Action attribution windows
  action_attribution_windows?: InsightsActionAttributionWindows[] | string[];

  // Action report time (when to attribute the action)
  action_report_time?: 'impression' | 'conversion' | 'mixed';

  // Fields to return
  fields?: string[];

  // Filtering
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'IN' | 'NOT_IN' | 'CONTAIN' | 'NOT_CONTAIN' | 'IN_RANGE' | 'NOT_IN_RANGE';
    value: string | number | string[] | number[];
  }>;

  // Sorting
  sort?: string[]; // e.g., ['spend_descending', 'reach_ascending']

  // Pagination
  limit?: number;
  after?: string; // cursor
  before?: string; // cursor

  // Summary
  summary?: boolean;
  summary_action_breakdowns?: string[];

  // Use account currency
  use_account_attribution_setting?: boolean;

  // Default summary (for breakdown queries)
  default_summary?: boolean;

  // Use unified attribution setting
  use_unified_attribution_setting?: boolean;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * META API Error structure
 */
export interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  error_user_title?: string;
  error_user_msg?: string;
  fbtrace_id?: string;
}

/**
 * Error response wrapper
 */
export interface MetaErrorResponse {
  error: MetaAPIError;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export SDK types for convenience
export type {
  AdAccount,
  Campaign,
  AdSet,
  Ad,
  AdsInsights
};
