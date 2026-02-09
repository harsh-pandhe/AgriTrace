/**
 * Carbon Tracking Service - Calculates carbon offsets and manages rewards
 */

import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { CARBON_FACTORS } from './types';
import type { CarbonCredit, Reward } from './types';

/**
 * Calculate CO2 offset for a given waste type and quantity
 */
export function calculateCarbonOffset(wasteType: string, quantityMT: number): number {
  const factor = CARBON_FACTORS[wasteType] || CARBON_FACTORS['Other'];
  return Math.round(factor * quantityMT * 100) / 100;
}

/**
 * Calculate reward points from carbon offset
 * 1 kg CO2 = 1 point
 */
export function calculateRewardPoints(carbonOffsetKg: number): number {
  return Math.round(carbonOffsetKg);
}

/**
 * Get total carbon offset for a user
 */
export async function getUserCarbonStats(userId: string) {
  try {
    const q = query(
      collection(db, 'carbonCredits'),
      where('userId', '==', userId),
      orderBy('creditDate', 'desc')
    );
    const snapshot = await getDocs(q);
    const credits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CarbonCredit[];

    const totalOffset = credits.reduce((sum, c) => sum + (c.carbonOffsetKg || 0), 0);
    const totalWasteDiverted = credits.reduce((sum, c) => sum + (c.quantityMT || 0), 0);
    const verifiedCredits = credits.filter(c => c.status === 'verified').length;

    return {
      totalOffset: Math.round(totalOffset * 100) / 100,
      totalWasteDiverted: Math.round(totalWasteDiverted * 100) / 100,
      totalCredits: credits.length,
      verifiedCredits,
      credits,
    };
  } catch (error) {
    console.error('Error fetching carbon stats:', error);
    return {
      totalOffset: 0,
      totalWasteDiverted: 0,
      totalCredits: 0,
      verifiedCredits: 0,
      credits: [],
    };
  }
}

/**
 * Get total rewards for a user
 */
export async function getUserRewards(userId: string) {
  try {
    const q = query(
      collection(db, 'rewards'),
      where('userId', '==', userId),
      orderBy('earnedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const rewards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reward[];

    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);
    const redeemedPoints = rewards.filter(r => r.redeemed).reduce((sum, r) => sum + (r.points || 0), 0);

    return {
      totalPoints,
      availablePoints: totalPoints - redeemedPoints,
      redeemedPoints,
      rewards,
    };
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return {
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      rewards: [],
    };
  }
}

/**
 * Record a carbon credit when waste is processed
 */
export async function recordCarbonCredit(data: {
  userId: string;
  userRole: 'farmer' | 'agent' | 'admin';
  listingId: string;
  wasteType: string;
  quantityMT: number;
}): Promise<string> {
  const carbonOffsetKg = calculateCarbonOffset(data.wasteType, data.quantityMT);
  const rewardPoints = calculateRewardPoints(carbonOffsetKg);

  const creditPayload: Omit<CarbonCredit, 'id'> = {
    userId: data.userId,
    userRole: data.userRole,
    listingId: data.listingId,
    wasteType: data.wasteType,
    quantityMT: data.quantityMT,
    carbonOffsetKg,
    creditDate: serverTimestamp() as any,
    status: 'pending',
  };

  const creditRef = await addDoc(collection(db, 'carbonCredits'), creditPayload);

  // Auto-grant reward
  const rewardPayload: Omit<Reward, 'id'> = {
    userId: data.userId,
    type: 'carbon_offset',
    title: `${carbonOffsetKg.toFixed(1)} kg CO₂ offset`,
    description: `${data.quantityMT} MT of ${data.wasteType} diverted from burning`,
    points: rewardPoints,
    earnedAt: serverTimestamp() as any,
    redeemed: false,
  };

  await addDoc(collection(db, 'rewards'), rewardPayload);

  return creditRef.id;
}

/**
 * Get equivalent impact metrics for display
 */
export function getImpactEquivalents(carbonOffsetKg: number) {
  return {
    treesEquivalent: Math.round(carbonOffsetKg / 21), // ~21 kg CO2 per tree per year
    carKmAvoided: Math.round(carbonOffsetKg / 0.21), // ~0.21 kg CO2 per km
    homesDaysPowered: Math.round(carbonOffsetKg / 17), // ~17 kg CO2 per home per day
    phoneCharges: Math.round(carbonOffsetKg / 0.008), // ~8g CO2 per charge
  };
}
