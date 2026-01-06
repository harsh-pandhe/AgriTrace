import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { WasteReport, WasteReportStatus, Listing, Order } from './types';

export async function createWasteReport(values: Omit<Partial<WasteReport>, 'id' | 'reportedAt' | 'lastUpdate' | 'status'> & { farmerId: string }) {
  const payload = {
    ...values,
    status: 'Pending Pickup' as WasteReportStatus,
    reportedAt: serverTimestamp(),
    lastUpdate: serverTimestamp(),
  } as Partial<WasteReport>;
  const ref = await addDoc(collection(db, 'wasteReports'), payload as any);
  return ref.id;
}

export async function updateWasteReportStatus(reportId: string, update: Partial<Pick<WasteReport, 'status' | 'collectionAgent' | 'collectionAgentId'>>) {
  const ref = doc(db, 'wasteReports', reportId);
  await updateDoc(ref, { ...update, lastUpdate: serverTimestamp() } as Partial<WasteReport>);
}

export function reportsQueryForUser(userId: string, role?: string) {
  if (role === 'agent') {
    // Agents see all reports ordered by reportedAt
    return query(collection(db, 'wasteReports'), orderBy('reportedAt', 'desc'));
  }

  return query(collection(db, 'wasteReports'), where('farmerId', '==', userId), orderBy('reportedAt', 'desc'));
}

// Listings helpers
export async function createListing(data: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
  const payload: Partial<Listing> = {
    ...data,
    // serverTimestamp returns a FieldValue; cast to any for Firestore write
    createdAt: serverTimestamp() as any,
  };
  const ref = await addDoc(collection(db, 'listings'), payload as any);
  return ref.id;
}

export function listingsQuery() {
  // For now, show all listings ordered by newest first. We can add filters for role/user later.
  return query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const payload: Partial<Order> = {
    ...data,
    status: 'Pending',
    createdAt: serverTimestamp() as any,
  };
  try {
    const ref = await addDoc(collection(db, 'orders'), payload as any);
    return ref.id;
  } catch (err: any) {
    console.error('createOrder failed:', err);
    // Throw a sanitized error to avoid leaking internal SDK messages to clients
    throw new Error('Failed to persist order');
  }
}

export function ordersQueryForBuyer(buyerId: string) {
  return query(collection(db, 'orders'), where('buyerId', '==', buyerId), orderBy('createdAt', 'desc'));
}

export function ordersQueryForSeller(sellerId: string) {
  return query(collection(db, 'orders'), where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
}

// Recycler functions
export async function recordWasteIntake(data: any): Promise<string> {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    status: 'IN_TRANSIT',
  };
  const ref = await addDoc(collection(db, 'wasteIntakes'), payload);

  // Update the waste report status
  if (data.wasteReportId) {
    const reportRef = doc(db, 'wasteReports', data.wasteReportId);
    await updateDoc(reportRef, {
      status: 'IN_TRANSIT',
      lastUpdate: serverTimestamp(),
    });
  }

  return ref.id;
}

export async function recordWasteProcessing(data: any): Promise<string> {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    status: 'RECYCLED',
  };
  const ref = await addDoc(collection(db, 'wasteProcessing'), payload);

  // Update the waste report status to RECYCLED
  if (data.intakeId) {
    const intakeRef = doc(db, 'wasteIntakes', data.intakeId);
    await updateDoc(intakeRef, {
      status: 'PROCESSED',
      lastUpdate: serverTimestamp(),
    });
  }

  return ref.id;
}

export async function recordWasteDelivery(data: any): Promise<string> {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    status: 'DELIVERED',
  };
  const ref = await addDoc(collection(db, 'wasteDeliveries'), payload);

  // Update the waste report status to IN_TRANSIT
  if (data.reportId) {
    const reportRef = doc(db, 'wasteReports', data.reportId);
    await updateDoc(reportRef, {
      status: 'IN_TRANSIT',
      collectionAgentId: data.agentId,
      collectionAgent: data.agentName,
      lastUpdate: serverTimestamp(),
    });
  }

  return ref.id;
}
export async function getRecyclerDashboardStats(recyclerId: string) {
  try {
    const intakeSnapshot = await fetch(`/api/recycler/stats?id=${recyclerId}`);
    return intakeSnapshot.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalWasteReceived: 0,
      totalWasteProcessed: 0,
      totalProductOutput: 0,
      processingRate: 0,
    };
  }
}

export function getWasteIntakeRecords(recyclerId: string) {
  return query(
    collection(db, 'wasteIntakes'),
    where('recyclerId', '==', recyclerId),
    orderBy('createdAt', 'desc')
  );
}

export function getProcessingRecords(recyclerId: string) {
  return query(
    collection(db, 'wasteProcessing'),
    where('recyclerId', '==', recyclerId),
    orderBy('createdAt', 'desc')
  );
}
export function getWasteDeliveryRecords(agentId: string) {
  return query(
    collection(db, 'wasteDeliveries'),
    where('agentId', '==', agentId),
    orderBy('createdAt', 'desc')
  );
}

export function getWasteReportsForAgent(agentId?: string) {
  // Get all reports with PENDING status for agents to claim
  // Optionally filter by agent if assigned
  if (agentId) {
    return query(
      collection(db, 'wasteReports'),
      where('collectionAgentId', '==', agentId),
      orderBy('reportedAt', 'desc')
    );
  }
  // Get all unassigned reports
  return query(
    collection(db, 'wasteReports'),
    where('status', '==', 'PENDING'),
    orderBy('reportedAt', 'desc')
  );
}