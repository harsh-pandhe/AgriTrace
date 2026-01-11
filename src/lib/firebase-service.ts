import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';
import type { WasteReport, WasteReportStatus, Listing, Order, ListingStatus } from './types';

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
export async function createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
  const payload: Partial<Listing> = {
    ...data,
    status: 'OPEN' as ListingStatus,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };
  const ref = await addDoc(collection(db, 'listings'), payload as any);
  return ref.id;
}

export function listingsQuery() {
  // For now, show all listings ordered by newest first. We can add filters for role/user later.
  return query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
}

export function openListingsQuery() {
  // Get all open listings for agents to claim
  return query(collection(db, 'listings'), where('status', '==', 'OPEN'), orderBy('createdAt', 'desc'));
}

export function agentListingsQuery(agentId: string) {
  // Get listings assigned to this agent
  return query(collection(db, 'listings'), where('assignedAgentId', '==', agentId), orderBy('updatedAt', 'desc'));
}

export async function claimListing(listingId: string, agentId: string, agentEmail: string): Promise<void> {
  const ref = doc(db, 'listings', listingId);
  await updateDoc(ref, {
    status: 'ASSIGNED' as ListingStatus,
    assignedAgentId: agentId,
    assignedAgentEmail: agentEmail,
    updatedAt: serverTimestamp(),
  });
}

export async function startPickup(listingId: string): Promise<void> {
  const ref = doc(db, 'listings', listingId);
  await updateDoc(ref, {
    status: 'IN_TRANSIT' as ListingStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function markDelivered(listingId: string): Promise<void> {
  const ref = doc(db, 'listings', listingId);
  await updateDoc(ref, {
    status: 'DELIVERED' as ListingStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelListing(listingId: string): Promise<void> {
  const ref = doc(db, 'listings', listingId);
  await updateDoc(ref, {
    status: 'CANCELLED' as ListingStatus,
    updatedAt: serverTimestamp(),
  });
}

// Admin stats helpers
export async function getAdminStats() {
  try {
    // Get user counts by role
    const usersRef = collection(db, 'users');
    const farmersQuery = query(usersRef, where('role', '==', 'FARMER'));
    const agentsQuery = query(usersRef, where('role', '==', 'AGENT'));
    const adminsQuery = query(usersRef, where('role', '==', 'ADMIN'));
    
    const [farmersSnap, agentsSnap, adminsSnap] = await Promise.all([
      getCountFromServer(farmersQuery),
      getCountFromServer(agentsQuery),
      getCountFromServer(adminsQuery),
    ]);

    // Get listing counts by status
    const listingsRef = collection(db, 'listings');
    const openQuery = query(listingsRef, where('status', '==', 'OPEN'));
    const assignedQuery = query(listingsRef, where('status', '==', 'ASSIGNED'));
    const inTransitQuery = query(listingsRef, where('status', '==', 'IN_TRANSIT'));
    const deliveredQuery = query(listingsRef, where('status', '==', 'DELIVERED'));

    const [openSnap, assignedSnap, inTransitSnap, deliveredSnap] = await Promise.all([
      getCountFromServer(openQuery),
      getCountFromServer(assignedQuery),
      getCountFromServer(inTransitQuery),
      getCountFromServer(deliveredQuery),
    ]);

    return {
      users: {
        farmers: farmersSnap.data().count,
        agents: agentsSnap.data().count,
        admins: adminsSnap.data().count,
        total: farmersSnap.data().count + agentsSnap.data().count + adminsSnap.data().count,
      },
      listings: {
        open: openSnap.data().count,
        assigned: assignedSnap.data().count,
        inTransit: inTransitSnap.data().count,
        delivered: deliveredSnap.data().count,
        total: openSnap.data().count + assignedSnap.data().count + inTransitSnap.data().count + deliveredSnap.data().count,
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      users: { farmers: 0, agents: 0, admins: 0, total: 0 },
      listings: { open: 0, assigned: 0, inTransit: 0, delivered: 0, total: 0 },
    };
  }
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