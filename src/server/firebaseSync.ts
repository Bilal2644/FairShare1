/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.ts';
import { ShiftRecord, HazardReport, FeedbackResponse, PayQuery } from '../types/index.ts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function syncShiftToFirestore(shift: ShiftRecord): Promise<void> {
  const path = `shifts/${shift.id}`;
  try {
    await setDoc(doc(db, 'shifts', shift.id), {
      id: shift.id,
      orgId: shift.orgId,
      siteId: shift.siteId,
      workerId: shift.workerId,
      startTimeUtc: shift.startTimeUtc,
      endTimeUtc: shift.endTimeUtc || null,
      workDayDate: shift.workDayDate,
      status: shift.status,
      checkInMethod: shift.checkInMethod,
      regularHours: shift.regularHours,
      overtimeHours: shift.overtimeHours,
      isWithinGeofence: shift.isWithinGeofence,
      idempotencyKey: shift.idempotencyKey,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncHazardToFirestore(hazard: HazardReport): Promise<void> {
  const path = `hazards/${hazard.id}`;
  try {
    await setDoc(doc(db, 'hazards', hazard.id), {
      id: hazard.id,
      orgId: hazard.orgId,
      siteId: hazard.siteId,
      reporterWorkerId: hazard.reporterWorkerId || null,
      reporterName: hazard.reporterName || 'Anonymous Worker',
      isAnonymous: hazard.isAnonymous,
      category: hazard.category,
      severity: hazard.severity,
      description: hazard.description,
      status: hazard.status,
      targetResponseHours: hazard.targetResponseHours,
      createdAt: hazard.createdAt,
      slaBreachAt: hazard.slaBreachAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncFeedbackToFirestore(feedback: FeedbackResponse): Promise<void> {
  const path = `feedbackResponses/${feedback.id}`;
  try {
    await setDoc(doc(db, 'feedbackResponses', feedback.id), {
      id: feedback.id,
      cycleId: feedback.cycleId,
      departmentOrTeamId: feedback.departmentOrTeamId,
      questionId: feedback.questionId,
      scoreRating: feedback.scoreRating,
      feedbackTextScrubbed: feedback.feedbackTextScrubbed || null,
      submittedDayBucket: feedback.submittedDayBucket,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncPayQueryToFirestore(query: PayQuery): Promise<void> {
  const path = `payQueries/${query.id}`;
  try {
    await setDoc(doc(db, 'payQueries', query.id), {
      id: query.id,
      payslipId: query.payslipId,
      workerId: query.workerId,
      workerName: query.workerName,
      queryType: query.queryType,
      message: query.message,
      status: query.status,
      createdAt: query.createdAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
