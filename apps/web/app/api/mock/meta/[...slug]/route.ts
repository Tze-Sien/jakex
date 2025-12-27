import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_AD_ACCOUNT,
  MOCK_CAMPAIGNS,
  MOCK_AD_SETS,
  MOCK_ADS,
  MOCK_INSIGHTS_MAP,
  generateMockAdAccounts,
  generateMockCampaigns,
  generateMockAdSets,
  generateMockAds,
  generateMockInsights
} from '@repo/meta-api';
import { simulateError, createNotFoundError } from '../errors';

/**
 * Simulate network latency with randomized delay
 */
async function simulateDelay(path: string) {
  const isInsights = path.includes('insights');
  const baseDelay = Number(process.env.MOCK_API_DELAY || '200');

  // Insights endpoints are slower (400-800ms), others are 200-500ms
  const minDelay = isInsights ? 400 : baseDelay;
  const maxDelay = isInsights ? 800 : baseDelay + 300;

  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generate pagination cursors
 */
function generateCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset })).toString('base64');
}

/**
 * Parse pagination cursor
 */
function parseCursor(cursor: string): number {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed.offset || 0;
  } catch {
    return 0;
  }
}

/**
 * Create paginated response
 */
function createPaginatedResponse<T>(
  data: T[],
  offset: number,
  limit: number,
  totalCount: number,
  baseUrl: string
) {
  const hasMore = offset + limit < totalCount;
  const hasBefore = offset > 0;

  const response: any = {
    data,
    paging: {
      cursors: {
        before: generateCursor(Math.max(0, offset - limit)),
        after: generateCursor(offset + limit)
      }
    }
  };

  if (hasMore) {
    response.paging.next = `${baseUrl}?limit=${limit}&after=${generateCursor(offset + limit)}`;
  }

  if (hasBefore) {
    response.paging.previous = `${baseUrl}?limit=${limit}&before=${generateCursor(Math.max(0, offset - limit))}`;
  }

  response.summary = {
    total_count: totalCount
  };

  return response;
}

/**
 * Filter fields from response data
 */
function filterFields<T extends Record<string, any>>(data: T[], fields?: string): T[] {
  if (!fields) return data;

  const fieldList = fields.split(',').map(f => f.trim());

  return data.map(item => {
    const filtered: any = {};
    fieldList.forEach(field => {
      if (field in item) {
        filtered[field] = item[field];
      }
    });
    return filtered as T;
  });
}

// This function handles all requests that come to /api/mock/meta/...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  const searchParams = request.nextUrl.searchParams;

  console.log(`[Mock Meta API] GET /${path}`);

  // Simulate network latency
  await simulateDelay(path);

  // Simulate errors based on configuration
  const errorResponse = simulateError();
  if (errorResponse) {
    return errorResponse;
  }

  // Parse query parameters
  const limit = Number(searchParams.get('limit') || '25');
  const after = searchParams.get('after');
  const before = searchParams.get('before');
  const fields = searchParams.get('fields') || undefined;
  const dateStart = searchParams.get('date_start') || undefined;
  const dateStop = searchParams.get('date_stop') || undefined;

  // Calculate offset from cursor
  const offset = after ? parseCursor(after) : before ? parseCursor(before) : 0;

  // 1. /me/adaccounts -> Get Ad Accounts
  if (path === 'me/adaccounts') {
    // Use dynamic generated accounts for more realistic data
    const accounts = generateMockAdAccounts();
    const paginatedData = accounts.slice(offset, offset + limit);
    const filteredData = filterFields(paginatedData, fields);

    return NextResponse.json(
      createPaginatedResponse(
        filteredData,
        offset,
        limit,
        accounts.length,
        '/api/mock/meta/me/adaccounts'
      )
    );
  }

  // 2. /{act_id}/campaigns -> Get Campaigns
  if (path.match(/^act_\d+\/campaigns$/)) {
    const accountId = path.split('/')[0];

    // Use dynamic generated campaigns for more realistic data
    const campaigns = generateMockCampaigns(accountId, 15); // Generate 15 campaigns
    const paginatedData = campaigns.slice(offset, offset + limit);
    const filteredData = filterFields(paginatedData, fields);

    return NextResponse.json(
      createPaginatedResponse(
        filteredData,
        offset,
        limit,
        campaigns.length,
        `/api/mock/meta/${accountId}/campaigns`
      )
    );
  }

  // 3. /{act_id}/adsets -> Get Ad Sets
  if (path.match(/^act_\d+\/adsets$/)) {
    const accountId = path.split('/')[0];

    // Generate ad sets for the first 3 campaigns
    const campaigns = generateMockCampaigns(accountId, 3);
    const allAdSets = campaigns.flatMap(campaign =>
      generateMockAdSets(accountId, campaign.id, 3)
    );

    const paginatedData = allAdSets.slice(offset, offset + limit);
    const filteredData = filterFields(paginatedData, fields);

    return NextResponse.json(
      createPaginatedResponse(
        filteredData,
        offset,
        limit,
        allAdSets.length,
        `/api/mock/meta/${accountId}/adsets`
      )
    );
  }

  // 4. /{act_id}/ads -> Get Ads
  if (path.match(/^act_\d+\/ads$/)) {
    const accountId = path.split('/')[0];

    // Generate ads for a campaign and ad set
    const campaigns = generateMockCampaigns(accountId, 2);
    const allAds: any[] = [];

    campaigns.forEach(campaign => {
      const adSets = generateMockAdSets(accountId, campaign.id, 2);
      adSets.forEach(adSet => {
        const ads = generateMockAds(accountId, campaign.id, adSet.id, 3);
        allAds.push(...ads);
      });
    });

    const paginatedData = allAds.slice(offset, offset + limit);
    const filteredData = filterFields(paginatedData, fields);

    return NextResponse.json(
      createPaginatedResponse(
        filteredData,
        offset,
        limit,
        allAds.length,
        `/api/mock/meta/${accountId}/ads`
      )
    );
  }

  // 5. /{entity_id}/insights -> Get Insights
  if (path.match(/.*\/insights$/)) {
    // Extract the entity ID from the path (e.g. "12020202020" from "12020202020/insights")
    const entityId = slug[slug.length - 2];
    const accountId = path.startsWith('act_') ? path.split('/')[0] : 'act_123456789';

    // Try to get from static mock data first
    let insights = MOCK_INSIGHTS_MAP[entityId];

    // If not found, generate dynamic insights
    if (!insights) {
      insights = generateMockInsights(
        entityId,
        accountId,
        'campaign',
        dateStart,
        dateStop
      );
    }

    const data = [insights];
    const filteredData = filterFields(data, fields);

    return NextResponse.json({
      data: filteredData,
      paging: {
        cursors: {
          before: generateCursor(0),
          after: generateCursor(1)
        }
      }
    });
  }

  // Debug: 404 for unknown routes
  return createNotFoundError(path);
}
