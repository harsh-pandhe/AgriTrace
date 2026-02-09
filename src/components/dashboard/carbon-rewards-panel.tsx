'use client';

import React, { useEffect, useState } from 'react';
import { Leaf, TreePine, Car, Zap, Smartphone, Award, TrendingUp, Star } from 'lucide-react';
import { getUserCarbonStats, getUserRewards, getImpactEquivalents, calculateCarbonOffset } from '@/lib/carbon-service';

interface CarbonRewardsPanelProps {
  userId: string;
  listings: any[];
}

export function CarbonRewardsPanel({ userId, listings }: CarbonRewardsPanelProps) {
  const [carbonStats, setCarbonStats] = useState<any>(null);
  const [rewardStats, setRewardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculate carbon from listings (local estimation even without Firestore records)
  const estimatedCarbon = listings
    .filter((l: any) => l.status === 'DELIVERED' || l.status === 'RECYCLED')
    .reduce((sum: number, l: any) => {
      const offset = calculateCarbonOffset(l.category || 'Other', l.quantity || 0);
      return sum + offset;
    }, 0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [carbon, rewards] = await Promise.all([
          getUserCarbonStats(userId),
          getUserRewards(userId),
        ]);
        setCarbonStats(carbon);
        setRewardStats(rewards);
      } catch (err) {
        console.error('Error fetching carbon/rewards:', err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchData();
  }, [userId]);

  const totalCO2 = carbonStats?.totalOffset || estimatedCarbon;
  const impact = getImpactEquivalents(totalCO2);
  const totalPoints = rewardStats?.totalPoints || Math.round(estimatedCarbon);

  if (loading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-20 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carbon Offset Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-6">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Carbon Impact</h3>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Environmental Score</p>
            </div>
          </div>

          {/* Main CO2 metric */}
          <div className="mb-5">
            <div className="flex items-end gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {totalCO2.toFixed(1)}
              </span>
              <span className="text-sm text-emerald-400 font-semibold mb-1">kg CO₂ saved</span>
            </div>
            <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalCO2 / 5000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {totalCO2 < 5000 ? `${(5000 - totalCO2).toFixed(0)} kg to next milestone` : 'Milestone achieved!'}
            </p>
          </div>

          {/* Impact Equivalents */}
          <div className="grid grid-cols-2 gap-2">
            <ImpactBadge icon={TreePine} label="Trees Equivalent" value={`${impact.treesEquivalent}`} color="emerald" />
            <ImpactBadge icon={Car} label="Car km Avoided" value={`${impact.carKmAvoided.toLocaleString()}`} color="blue" />
            <ImpactBadge icon={Zap} label="Home Days Powered" value={`${impact.homesDaysPowered}`} color="amber" />
            <ImpactBadge icon={Smartphone} label="Phone Charges" value={`${impact.phoneCharges.toLocaleString()}`} color="purple" />
          </div>
        </div>
      </div>

      {/* Rewards Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-6">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Green Rewards</h3>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Reward Points</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
              <Star size={12} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{totalPoints}</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="p-4 bg-white/[0.04] rounded-xl border border-white/5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold">Level {Math.floor(totalPoints / 500) + 1}</span>
              <span className="text-xs text-amber-400 font-semibold">{totalPoints % 500}/500 pts</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-1000"
                style={{ width: `${(totalPoints % 500) / 5}%` }}
              />
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <RewardBadge
              earned={totalCO2 >= 100}
              title="Eco Starter"
              desc="Save 100 kg CO₂"
              icon="🌱"
            />
            <RewardBadge
              earned={totalCO2 >= 500}
              title="Green Champion"
              desc="Save 500 kg CO₂"
              icon="🏆"
            />
            <RewardBadge
              earned={totalCO2 >= 1000}
              title="Planet Saver"
              desc="Save 1,000 kg CO₂"
              icon="🌍"
            />
            <RewardBadge
              earned={listings.filter((l: any) => l.status === 'DELIVERED' || l.status === 'RECYCLED').length >= 10}
              title="Top Contributor"
              desc="Complete 10 deliveries"
              icon="⭐"
            />
          </div>
        </div>
      </div>

      {/* Carbon by Waste Type Breakdown */}
      {listings.length > 0 && (
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Carbon by Waste Type</h3>
          </div>
          <div className="space-y-3">
            {getWasteTypeBreakdown(listings).map(({ type, quantity, co2 }, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">
                    {getWasteEmoji(type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{type}</p>
                    <p className="text-[10px] text-slate-500">{quantity.toFixed(1)} MT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{co2.toFixed(0)} kg</p>
                  <p className="text-[10px] text-slate-500">CO₂ saved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
  };
  const classes = colorMap[color] || colorMap.emerald;
  return (
    <div className={`p-3 rounded-xl bg-gradient-to-br border ${classes}`}>
      <Icon size={14} className="mb-1" />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function RewardBadge({ earned, title, desc, icon }: { earned: boolean; title: string; desc: string; icon: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      earned
        ? 'bg-amber-500/10 border-amber-500/20'
        : 'bg-white/[0.02] border-white/5 opacity-50'
    }`}>
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${earned ? 'text-white' : 'text-slate-500'}`}>{title}</p>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
      {earned && (
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Earned
        </span>
      )}
    </div>
  );
}

function getWasteTypeBreakdown(listings: any[]) {
  const completed = listings.filter((l: any) => l.status === 'DELIVERED' || l.status === 'RECYCLED');
  const byType: Record<string, { quantity: number; co2: number }> = {};

  completed.forEach((l: any) => {
    const type = l.category || 'Other';
    if (!byType[type]) byType[type] = { quantity: 0, co2: 0 };
    byType[type].quantity += l.quantity || 0;
    byType[type].co2 += calculateCarbonOffset(type, l.quantity || 0);
  });

  return Object.entries(byType)
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.co2 - a.co2);
}

function getWasteEmoji(type: string): string {
  const map: Record<string, string> = {
    'Rice Husk': '🌾',
    'Rice Residue': '🍚',
    'Wheat Stubble': '🌿',
    'Sugarcane Bagasse': '🎋',
    'Cotton Stalks': '🧶',
    'Corn Stover': '🌽',
    'Paddy Straw': '🌾',
    'Coconut Shell': '🥥',
    'Groundnut Shell': '🥜',
    'Mustard Stalks': '🌻',
  };
  return map[type] || '♻️';
}

export default CarbonRewardsPanel;
