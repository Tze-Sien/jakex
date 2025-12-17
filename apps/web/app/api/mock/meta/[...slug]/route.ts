import { NextRequest, NextResponse } from 'next/server';
import { 
  MOCK_AD_ACCOUNT, 
  MOCK_CAMPAIGNS, 
  MOCK_AD_SETS, 
  MOCK_ADS, 
  MOCK_INSIGHTS_MAP 
} from '@repo/meta-api';

// This function handles all requests that come to /api/mock/meta/...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  
  console.log(`[Mock Meta API] GET /${path}`);

  // Artificial Delay to simulate network latency (300ms)
  await new Promise(resolve => setTimeout(resolve, 300));

  // 1. /me/adaccounts -> Get Ad Accounts
  if (path === 'me/adaccounts') {
    return NextResponse.json({
      data: [MOCK_AD_ACCOUNT],
      paging: { cursors: { before: 'xyz', after: 'abc' } }
    });
  }

  // 2. /{act_id}/campaigns -> Get Campaigns
  if (path.match(/^act_\d+\/campaigns$/)) {
    return NextResponse.json({
      data: MOCK_CAMPAIGNS,
      paging: { cursors: { before: 'xyz', after: 'abc' } }
    });
  }

  // 3. /{act_id}/adsets -> Get Ad Sets
  if (path.match(/^act_\d+\/adsets$/)) {
    return NextResponse.json({
      data: MOCK_AD_SETS,
      paging: { cursors: { before: 'xyz', after: 'abc' } }
    });
  }

  // 4. /{act_id}/ads -> Get Ads
  if (path.match(/^act_\d+\/ads$/)) {
    return NextResponse.json({
      data: MOCK_ADS,
      paging: { cursors: { before: 'xyz', after: 'abc' } }
    });
  }

  // 5. /{entity_id}/insights -> Get Insights
  // Matches IDs like: act_123/insights OR 1202020.../insights
  if (path.match(/.*\/insights$/)) {
    // Extract the entity ID from the path (e.g. "12020202020" from "12020202020/insights")
    const entityId = slug[slug.length - 2];
    
    // Look up mock insights
    const insights = MOCK_INSIGHTS_MAP[entityId];
    
    if (insights) {
      return NextResponse.json({
        data: [insights],
        paging: { cursors: { before: 'xyz', after: 'abc' } }
      });
    }

    // Default Fallback for unknown IDs (return empty or generic data)
    return NextResponse.json({
      data: [],
      paging: { cursors: { before: 'xyz', after: 'abc' } }
    });
  }

  // Debug: 404 for unknown routes
  return NextResponse.json({ error: { message: 'Unknown Mock Endpoint', type: 'OAuthException', code: 404, fbtrace_id: 'mock_trace_id' } }, { status: 404 });
}
