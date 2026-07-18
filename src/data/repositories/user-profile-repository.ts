import { eq } from 'drizzle-orm';

import { userProfileTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import {
  defaultRepositoryDependencies,
  type RepositoryDependencies,
} from '@/data/repositories/dependencies';
import { enqueueSync } from '@/data/repositories/sync-queue-writer';
import type { UserProfileRecord, UserProfileRepository } from '@/data/repositories/types';

function fromRow(row: typeof userProfileTable.$inferSelect): UserProfileRecord {
  return {
    ...row,
    authType: row.authType as UserProfileRecord['authType'],
    displayName: row.displayName ?? undefined,
    email: row.email ?? undefined,
    locale: row.locale as UserProfileRecord['locale'],
    theme: row.theme as UserProfileRecord['theme'],
    adsConsentStatus: row.adsConsentStatus as UserProfileRecord['adsConsentStatus'],
  };
}

export class SQLiteUserProfileRepository<TRunResult> implements UserProfileRepository {
  constructor(
    private readonly db: AppDatabase<TRunResult>,
    private readonly dependencies: RepositoryDependencies = defaultRepositoryDependencies,
  ) {}

  get(id: string): UserProfileRecord | null {
    const row = this.db.select().from(userProfileTable).where(eq(userProfileTable.id, id)).get();
    return row ? fromRow(row) : null;
  }

  upsert(profile: UserProfileRecord): UserProfileRecord {
    return this.db.transaction((tx) => {
      const existing = tx
        .select({ revision: userProfileTable.revision, createdAt: userProfileTable.createdAt })
        .from(userProfileTable)
        .where(eq(userProfileTable.id, profile.id))
        .get();
      const next: UserProfileRecord = {
        ...profile,
        createdAt: existing?.createdAt ?? profile.createdAt,
        updatedAt: this.dependencies.now(),
        revision: (existing?.revision ?? 0) + 1,
        deviceId: this.dependencies.deviceId,
      };
      tx.insert(userProfileTable)
        .values({ ...next, displayName: next.displayName ?? null, email: next.email ?? null })
        .onConflictDoUpdate({
          target: userProfileTable.id,
          set: { ...next, displayName: next.displayName ?? null, email: next.email ?? null },
        })
        .run();
      enqueueSync(tx, this.dependencies, 'profile', next.id, 'upsert', next);
      return next;
    });
  }
}
