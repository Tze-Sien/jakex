import type { Database } from '@repo/database/client';
import { syncJobs, eq, and, desc } from '@repo/database';

export type SyncJobType = 'full' | 'incremental' | 'manual';
export type SyncJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type SyncEntityType = 'adAccounts' | 'campaigns' | 'adSets' | 'ads' | 'insights';

export interface CreateSyncJobParams {
  metaConnectionId: string;
  type: SyncJobType;
  entityType?: SyncEntityType;
  adAccountId?: string;
}

export interface UpdateSyncJobParams {
  status?: SyncJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  totalSynced?: number;
  totalErrors?: number;
  errorMessage?: string;
  errorDetails?: string[];
}

/**
 * Sync job tracking helpers
 * Provides utilities to track sync operations in the database
 */
export class SyncJobTracker {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates a new sync job record
   */
  async createSyncJob(params: CreateSyncJobParams): Promise<string> {
    const [job] = await this.db
      .insert(syncJobs)
      .values({
        metaConnectionId: params.metaConnectionId,
        type: params.type,
        entityType: params.entityType || null,
        adAccountId: params.adAccountId || null,
        status: 'pending',
      })
      .returning({ id: syncJobs.id });

    if (!job) {
      throw new Error('Failed to create sync job');
    }

    return job.id;
  }

  /**
   * Updates an existing sync job
   */
  async updateSyncJob(jobId: string, params: UpdateSyncJobParams): Promise<void> {
    await this.db
      .update(syncJobs)
      .set({
        ...params,
        errorDetails: params.errorDetails ? params.errorDetails : undefined,
        updatedAt: new Date(),
      })
      .where(eq(syncJobs.id, jobId));
  }

  /**
   * Marks a sync job as running
   */
  async startSyncJob(jobId: string): Promise<void> {
    await this.updateSyncJob(jobId, {
      status: 'running',
      startedAt: new Date(),
    });
  }

  /**
   * Marks a sync job as completed
   */
  async completeSyncJob(
    jobId: string,
    params: { totalSynced: number; totalErrors: number; errorDetails?: string[] }
  ): Promise<void> {
    await this.updateSyncJob(jobId, {
      status: params.totalErrors > 0 ? 'failed' : 'completed',
      completedAt: new Date(),
      totalSynced: params.totalSynced,
      totalErrors: params.totalErrors,
      errorDetails: params.errorDetails,
      errorMessage:
        params.totalErrors > 0
          ? `Sync completed with ${params.totalErrors} error(s)`
          : undefined,
    });
  }

  /**
   * Marks a sync job as failed
   */
  async failSyncJob(jobId: string, errorMessage: string): Promise<void> {
    await this.updateSyncJob(jobId, {
      status: 'failed',
      completedAt: new Date(),
      errorMessage,
    });
  }

  /**
   * Gets the status of a sync job
   */
  async getSyncJobStatus(jobId: string) {
    const results = await this.db
      .select()
      .from(syncJobs)
      .where(eq(syncJobs.id, jobId))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Gets recent sync jobs for a META connection
   */
  async getRecentSyncJobs(metaConnectionId: string, limit: number = 10) {
    return await this.db
      .select()
      .from(syncJobs)
      .where(eq(syncJobs.metaConnectionId, metaConnectionId))
      .orderBy(desc(syncJobs.createdAt))
      .limit(limit);
  }

  /**
   * Gets the last successful sync time for a connection
   */
  async getLastSuccessfulSync(metaConnectionId: string): Promise<Date | null> {
    const results = await this.db
      .select()
      .from(syncJobs)
      .where(
        and(
          eq(syncJobs.metaConnectionId, metaConnectionId),
          eq(syncJobs.status, 'completed')
        )
      )
      .orderBy(desc(syncJobs.completedAt))
      .limit(1);

    const job = results[0];
    return job?.completedAt || null;
  }

  /**
   * Checks if a sync is currently running for a connection
   */
  async isSyncRunning(metaConnectionId: string): Promise<boolean> {
    const results = await this.db
      .select()
      .from(syncJobs)
      .where(
        and(
          eq(syncJobs.metaConnectionId, metaConnectionId),
          eq(syncJobs.status, 'running')
        )
      )
      .limit(1);

    return results.length > 0;
  }
}
