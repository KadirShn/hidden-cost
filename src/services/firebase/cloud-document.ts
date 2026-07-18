import type { SyncQueueRecord } from '@/data/repositories/types';

type SyncPayload = Record<string, unknown> & {
  projectId?: string;
  revision?: number;
  updatedAt?: string;
  deletedAt?: string;
  deviceId?: string;
};

export type CloudDocumentMutation = {
  path: string;
  revision: number;
  updatedAt: string;
  data: Record<string, unknown>;
};

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`Invalid sync payload: ${field}`);
  return value;
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefined(item)]),
    );
  }
  return value;
}

export function buildCloudDocumentMutation(
  uid: string,
  record: SyncQueueRecord,
): CloudDocumentMutation {
  const payload = JSON.parse(record.payloadJson) as SyncPayload;
  const revision = payload.revision;
  if (!Number.isInteger(revision) || Number(revision) < 1) {
    throw new Error('Invalid sync payload: revision');
  }
  const updatedAt = requireString(payload.updatedAt ?? payload.deletedAt, 'updatedAt');
  let path: string;
  if (record.entityType === 'project') {
    path = `users/${uid}/projects/${record.entityId}`;
  } else if (record.entityType === 'cost_item') {
    path = `users/${uid}/projects/${requireString(payload.projectId, 'projectId')}/costItems/${record.entityId}`;
  } else if (record.entityType === 'scenario_override') {
    path = `users/${uid}/projects/${requireString(payload.projectId, 'projectId')}/scenarioOverrides/${record.entityId}`;
  } else {
    path = `users/${uid}/settings/profile`;
  }
  const data =
    record.operation === 'delete'
      ? {
          id: record.entityId,
          ownerId: uid,
          ...(payload.projectId ? { projectId: payload.projectId } : undefined),
          deletedAt: payload.deletedAt,
          updatedAt,
          revision,
          deviceId: payload.deviceId,
          schemaVersion: 1,
        }
      : {
          ...payload,
          ownerId: uid,
          revision,
          updatedAt,
          schemaVersion: Number(payload.schemaVersion ?? 1),
        };
  return {
    path,
    revision: Number(revision),
    updatedAt,
    data: stripUndefined(data) as Record<string, unknown>,
  };
}

export function resolveCloudMutation(
  local: Pick<CloudDocumentMutation, 'revision' | 'updatedAt'>,
  remote?: { revision?: unknown; updatedAt?: unknown },
): 'apply' | 'already_applied' | 'remote_newer' {
  if (!remote) return 'apply';
  const remoteRevision = typeof remote.revision === 'number' ? remote.revision : 0;
  const remoteUpdatedAt = typeof remote.updatedAt === 'string' ? remote.updatedAt : '';
  if (remoteRevision > local.revision) return 'remote_newer';
  if (remoteRevision < local.revision) return 'apply';
  if (remoteUpdatedAt > local.updatedAt) return 'remote_newer';
  if (remoteUpdatedAt < local.updatedAt) return 'apply';
  return 'already_applied';
}
