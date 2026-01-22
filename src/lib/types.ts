import { Timestamp } from 'firebase/firestore';

/**
 * User Roles
 */
export enum UserRole {
  FARMER = 'farmer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

/**
 * Waste Report Status - Complete workflow
 */
export enum WasteReportStatus {
  PENDING_PICKUP = 'Pending Pickup',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  PROCESSING = 'Processing',
  RECYCLED = 'Recycled',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

/**
 * Location data
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: number;
}

/**
 * Waste Report - Enhanced with photos and location
 */
export interface WasteReport {
  id: string;
  farmerName: string;
  farmerId: string;
  wasteType: string; // e.g., 'Wheat Stubble', 'Rice Residue', 'Corn Stover'
  quantity: number; // in tonnes
  location: LocationData; // Now includes lat/lon
  address?: string; // Human-readable address
  photos?: string[]; // Array of photo URLs
  notes?: string;
  status: WasteReportStatus;
  collectionAgent?: string;
  collectionAgentId?: string;
  recycler?: string;
  recyclerId?: string;
  reportedAt: Timestamp | Date;
  pickedUpAt?: Timestamp | Date;
  deliveredAt?: Timestamp | Date;
  processedAt?: Timestamp | Date;
  lastUpdate: Timestamp | Date;
  payment?: number;
  paymentStatus?: 'Pending' | 'Paid';
}

/**
 * Waste Delivery - Tracking waste from agent to recycler
 */
export interface WasteDelivery {
  id: string;
  wasteReportId: string;
  agentId: string;
  recyclerId: string;
  pickupLocation: LocationData;
  deliveryLocation: LocationData;
  status: 'In Transit' | 'Delivered' | 'Received';
  deliveryProofs?: string[]; // Photos of delivered waste
  signatureUrl?: string;
  startTime: Timestamp | Date;
  deliveryTime?: Timestamp | Date;
  notes?: string;
}

/**
 * Waste Processing - Recycler intake and processing
 */
export interface WasteProcessing {
  id: string;
  wasteReportId: string;
  recyclerId: string;
  recyclingFacilityId: string;
  wasteType: string;
  quantity: number;
  receivedDate: Timestamp | Date;
  processedDate?: Timestamp | Date;
  completionDate?: Timestamp | Date;
  status: 'Received' | 'Processing' | 'Completed';
  processingMethod?: string;
  yieldQuantity?: number;
  byProducts?: string[];
  certifications?: string[]; // e.g., ISO certifications
  photos?: string[];
  notes?: string;
}

/**
 * Recycling Facility
 */
export interface RecyclingFacility {
  id: string;
  name: string;
  location: LocationData;
  address: string;
  capacity: number; // in tonnes
  wasteTypes: string[]; // Types of waste they accept
  certification?: string;
  contactPerson: string;
  phone: string;
  email: string;
  operatingHours?: string;
  createdAt: Timestamp | Date;
}

/**
 * Analytics Data
 */
export interface AnalyticsData {
  date: string;
  totalWaste: number; // tonnes
  wasteCollected: number; // tonnes
  wasteRecycled: number; // tonnes
  activeReports: number;
  completedReports: number;
  facilityCount: number;
  agentCount: number;
  farmerCount: number;
}

/**
 * Listing Status - Complete workflow
 */
export enum ListingStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RECYCLED = 'RECYCLED',
  CANCELLED = 'CANCELLED',
}

/**
 * Listing - Agricultural products/waste for sale
 */
export interface Listing {
  id?: string;
  title: string;
  price: number;
  quantity?: number;
  location?: string;
  category: string;
  ownerId?: string;
  sellerId?: string;
  sellerEmail?: string;
  description?: string;
  photos?: string[];
  status?: ListingStatus;
  assignedAgentId?: string;
  assignedAgentEmail?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

/**
 * Order
 */
export interface Order {
  id?: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';
  createdAt?: Timestamp | Date;
}

/**
 * User Profile
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  location?: LocationData;
  address?: string;
  profilePhoto?: string;
  createdAt: Timestamp | Date;
  verified: boolean;
  kycVerified?: boolean; // For recyclers
}

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalWaste: number;
  activeReports: number;
  completedReports: number;
  recycledWaste: number;
  earnings?: number; // For farmers
  collectionsAssigned?: number; // For agents
  wasteProcessed?: number; // For recyclers
}
