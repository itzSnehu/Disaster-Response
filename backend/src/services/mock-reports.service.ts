import { CacheService } from './cache.service.js';
import { fetchWithTimeout } from '../utils/http.js';
import { env } from '../config/env.js';

export interface CommunityReport {
  id: string;
  content: string;
  user: string;
  createdAt: string;
}

export interface ReportsResult {
  data: CommunityReport[];
  meta: {
    source: 'cache' | 'external' | 'stale_cache' | 'fallback';
    stale: boolean;
    warning?: string;
  };
}

export class MockReportsService {
  /**
   * Internal mock report provider (can simulate HTTP requests to external reports service)
   */
  static async getReportsFromProvider(disasterId: string): Promise<CommunityReport[]> {
    // If REPORTS_SERVICE_URL points to an external service or endpoint, attempt HTTP fetch with timeout
    if (env.REPORTS_SERVICE_URL && !env.REPORTS_SERVICE_URL.includes('localhost:4000/api/v1/mock')) {
      const response = await fetchWithTimeout<unknown[]>(
        `${env.REPORTS_SERVICE_URL}?disasterId=${encodeURIComponent(disasterId)}`,
        { timeoutMs: 5000 }
      );

      if (response.ok && Array.isArray(response.data)) {
        return response.data.map((item: any, idx: number) => ({
          id: item.id || `report-${idx + 1}`,
          content: String(item.content || item.text || ''),
          user: String(item.user || item.author || 'anonymous'),
          createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
        }));
      }
    }

    // Default built-in mock response generator
    return [
      {
        id: 'rep-1',
        content: 'Heavy waterlogging reported near central boulevard. Clean drinking water distribution required.',
        user: 'citizen_101',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'rep-2',
        content: 'Emergency shelter team operating near community hall. Volunteers needed.',
        user: 'responder_val',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ];
  }

  /**
   * Main entry point for disaster reports with caching and stale fallback
   */
  static async getDisasterReports(disasterId: string, forceFail: boolean = false): Promise<ReportsResult> {
    const cacheKey = `community-reports:${disasterId}`;

    // 1. Check fresh cache
    const freshData = CacheService.getFresh<CommunityReport[]>(cacheKey);
    if (freshData && !forceFail) {
      return {
        data: freshData,
        meta: {
          source: 'cache',
          stale: false,
        },
      };
    }

    // 2. Cache miss -> call external report provider
    if (!forceFail) {
      try {
        const rawReports = await this.getReportsFromProvider(disasterId);
        
        // Cache normalized reports
        CacheService.set(cacheKey, rawReports, env.CACHE_TTL_SECONDS);

        return {
          data: rawReports,
          meta: {
            source: 'external',
            stale: false,
          },
        };
      } catch (error) {
        console.warn(`[MockReportsService] External report fetch failed for disaster ${disasterId}:`, error);
      }
    }

    // 3. Provider failure -> check stale cache
    const staleEntry = CacheService.getStale<CommunityReport[]>(cacheKey);
    if (staleEntry) {
      return {
        data: staleEntry.value,
        meta: {
          source: 'stale_cache',
          stale: true,
          warning: 'External community reports service is unavailable. Displaying cached data.',
        },
      };
    }

    // 4. Provider failure & no stale cache -> fallback empty array
    return {
      data: [],
      meta: {
        source: 'fallback',
        stale: false,
        warning: 'Community reports are temporarily unavailable.',
      },
    };
  }
}
