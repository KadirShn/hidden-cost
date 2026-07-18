import fs from 'node:fs';
import process from 'node:process';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const projectId = 'demo-hidden-cost';
const environment = await initializeTestEnvironment({
  projectId,
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
});

const project = (ownerId) => ({
  id: 'project-1',
  ownerId,
  localOwnerId: 'local-device',
  title: 'Motorcycle',
  category: 'motorcycle',
  templateId: 'motorcycle',
  templateVersion: 1,
  currency: 'TRY',
  purchasePriceMinor: '10000000',
  ownershipMonths: 36,
  usagePerMonth: 500,
  usageUnit: 'km',
  status: 'complete',
  assumptions: {},
  createdAt: '2026-07-19T10:00:00.000Z',
  updatedAt: '2026-07-19T10:00:00.000Z',
  deletedAt: null,
  syncStatus: 'pending',
  schemaVersion: 1,
  revision: 1,
  deviceId: 'device-a',
});

try {
  const alice = environment.authenticatedContext('alice').firestore();
  const bob = environment.authenticatedContext('bob').firestore();
  const guest = environment.unauthenticatedContext().firestore();
  const aliceProject = doc(alice, 'users/alice/projects/project-1');

  await assertSucceeds(setDoc(aliceProject, project('alice')));
  await assertSucceeds(getDoc(aliceProject));
  await assertFails(getDoc(doc(bob, 'users/alice/projects/project-1')));
  await assertFails(getDoc(doc(guest, 'users/alice/projects/project-1')));
  await assertFails(setDoc(doc(alice, 'users/alice/projects/foreign'), project('bob')));
  await assertFails(setDoc(doc(bob, 'users/alice/projects/project-2'), project('alice')));

  await assertSucceeds(
    setDoc(aliceProject, {
      id: 'project-1',
      ownerId: 'alice',
      deletedAt: '2026-07-19T11:00:00.000Z',
      updatedAt: '2026-07-19T11:00:00.000Z',
      revision: 2,
      deviceId: 'device-a',
      schemaVersion: 1,
    }),
  );
  await assertFails(
    setDoc(aliceProject, {
      ...project('alice'),
      revision: 1,
      updatedAt: '2026-07-19T12:00:00.000Z',
    }),
  );

  console.log('Firestore rules tests passed: owner isolation, auth, tombstone, revision.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await environment.cleanup();
}
