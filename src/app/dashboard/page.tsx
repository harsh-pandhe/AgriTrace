'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot } from 'firebase/firestore';
import type { Listing } from '@/lib/types';
import {
  Leaf,
  BarChart3,
  Truck,
  Plus,
  Heart,
  MapPin,
  TrendingUp,
  Package,
  Activity,
  X,
  Globe,
  LogOut,
  Bell,
  Settings,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  Database,
  Eye,
  Download,
} from 'lucide-react';

interface CardStats {
  totalSales: number;
  activeListings: number;
  inTransit: number;
  impact: number;
}

// ============ HEADER ============
function DashboardHeader({ user, userRole, onLogout }: any) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[50] w-full bg-white shadow-sm border-b border-slate-200">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={24} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">AgriTrace</span>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{userRole} Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-3">
            <p className="text-sm font-bold text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-500">Welcome back</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm hover:shadow-md hover:from-slate-200 hover:to-slate-100 transition-all"
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-[100]">
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{user?.email}</p>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{userRole}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-5 py-4 text-left flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all font-bold group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut size={18} />
                    </div>
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ============ FARMER ============
function FarmerDashboard({ user, listings, stats }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { createListing } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCancel = async (listingId: string) => {
    if (!confirm('Are you sure you want to cancel this listing?')) return;
    setCancellingId(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: user?.uid }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to cancel');
      toast({ title: 'Cancelled', description: 'Listing has been cancelled.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCancellingId(null);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setPosting(true);
      await createListing({
        title: formData.get('title') as string,
        quantity: parseFloat(formData.get('quantity') as string),
        price: parseFloat(formData.get('price') as string),
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        sellerId: user?.uid || '',
        sellerEmail: user?.email || '',
      });
      toast({ title: 'Success', description: 'Your listing has been published!' });
      setIsDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create listing.', variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const userListings = listings.filter((l: any) => l.sellerId === user?.uid);

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 blur-2xl ${color}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Icon size={20} />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-[1000] tracking-tighter text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-20">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-[120px]" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)` }} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900">FARMER <span className="text-emerald-500 italic">HUB</span></h1>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Monetize your agricultural waste
            </p>
          </div>
          <button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 h-14 bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl font-bold transition-all active:scale-95">
            <Plus size={20} /> <span className="uppercase tracking-widest text-xs">Post Waste</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={DollarSign} label="Total Earnings" value={`₹${userListings.filter((l: any) => l.status === 'DELIVERED' || l.status === 'RECYCLED').reduce((sum: number, l: any) => sum + (l.price * l.quantity || 0), 0)}`} sub="Completed listings" color="bg-emerald-500" />
          <StatCard icon={Package} label="Active Listings" value={userListings.filter((l: any) => l.status === 'OPEN').length} sub="Awaiting pickup" color="bg-blue-500" />
          <StatCard icon={Truck} label="In Progress" value={userListings.filter((l: any) => l.status === 'IN_TRANSIT' || l.status === 'ASSIGNED' || l.status === 'DELIVERED').length} sub="Being processed" color="bg-purple-500" />
          <StatCard icon={Leaf} label="Recycled" value={userListings.filter((l: any) => l.status === 'RECYCLED').length} sub="Fully processed" color="bg-teal-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Package size={24} className="text-emerald-600" />
                MY LISTINGS ({userListings.length})
              </h2>
              {userListings.length > 0 ? (
                <div className="space-y-4">
                  {userListings.map((item: any) => {
                    const statusColors: Record<string, string> = {
                      OPEN: 'bg-blue-100 text-blue-700',
                      ASSIGNED: 'bg-amber-100 text-amber-700',
                      IN_TRANSIT: 'bg-purple-100 text-purple-700',
                      DELIVERED: 'bg-emerald-100 text-emerald-700',
                      RECYCLED: 'bg-teal-100 text-teal-700',
                      CANCELLED: 'bg-red-100 text-red-700',
                    };
                    const status = item.status || 'OPEN';
                    return (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">🌾</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{item.title}</h3>
                            <p className="text-xs text-slate-500">{item.category} • {item.quantity}MT</p>
                            {item.assignedAgentEmail && (
                              <p className="text-xs text-emerald-600 font-bold mt-1">Agent: {item.assignedAgentEmail}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusColors[status]}`}>
                            {status.replace('_', ' ')}
                          </span>
                          <p className="font-black text-emerald-600 text-lg">₹{item.price}</p>
                          {(status === 'OPEN' || !item.status) && (
                            <button
                              onClick={() => handleCancel(item.id)}
                              disabled={cancellingId === item.id}
                              className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                            >
                              {cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No listings yet. Post your first waste asset!</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6">
              <h3 className="font-black text-slate-900 mb-4">Recent Activity</h3>
              <p className="text-slate-500 text-sm">No activity yet</p>
            </div>
          </div>
        </div>
      </main>

      {isDialogOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsDialogOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-3xl border border-slate-100 p-8 sm:p-12">
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-[1000] text-slate-900">POST <span className="text-emerald-500">WASTE</span></h2>
              <button onClick={() => setIsDialogOpen(false)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                  <select name="category" defaultValue="rice" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none mt-2">
                    <option value="rice">Rice Husk</option>
                    <option value="wheat">Wheat Stubble</option>
                    <option value="sugarcane">Sugarcane Bagasse</option>
                    <option value="cotton">Cotton Stalks</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Quantity (MT)</label>
                  <input name="quantity" type="number" placeholder="1.2" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none mt-2" required />
                </div>
              </div>
              <input name="title" type="text" placeholder="Title" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <input name="price" type="text" placeholder="Price (₹)" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" required />
              <textarea name="description" rows={3} placeholder="Description" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none resize-none" required />
              <button type="submit" disabled={posting} className="w-full h-14 bg-emerald-600 text-white font-black hover:bg-emerald-700 rounded-2xl transition-all disabled:opacity-70">
                {posting ? 'Publishing...' : 'PUBLISH'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AGENT ============
function AgentDashboard({ user, listings }: any) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Filter listings
  const availableListings = listings.filter((l: any) => l.status === 'OPEN' || !l.status);
  const myPickups = listings.filter((l: any) => l.assignedAgentId === user?.uid && (l.status === 'ASSIGNED' || l.status === 'IN_TRANSIT'));
  const myDelivered = listings.filter((l: any) => l.assignedAgentId === user?.uid && l.status === 'DELIVERED');

  const handleClaim = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: user?.uid, agentEmail: user?.email }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to claim');
      toast({ title: 'Success', description: 'Listing claimed! You can now pick it up.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: user?.uid }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to start');
      toast({ title: 'Success', description: 'Pickup started! Mark as delivered when complete.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: user?.uid }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to deliver');
      toast({ title: 'Success', description: 'Marked as delivered!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 blur-2xl ${color}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Icon size={20} />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-[1000] tracking-tighter text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>
      </div>
    </div>
  );

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    ASSIGNED: 'bg-amber-100 text-amber-700',
    IN_TRANSIT: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-20">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-[120px]" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)` }} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-10">
        <div className="mb-12">
          <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900">COLLECTION <span className="text-emerald-500 italic">AGENT</span></h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> Manage pickups and collections efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={Package} label="Available" value={availableListings.length} sub="Open listings" color="bg-blue-500" />
          <StatCard icon={Truck} label="My Pickups" value={myPickups.length} sub="Active assignments" color="bg-amber-500" />
          <StatCard icon={Leaf} label="Delivered" value={myDelivered.length} sub="Completed" color="bg-emerald-500" />
          <StatCard icon={DollarSign} label="Earnings" value={`₹${myDelivered.reduce((sum: number, l: any) => sum + (l.price * l.quantity || 0), 0)}`} sub="Total earned" color="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Listings */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Package size={24} className="text-blue-600" />
              AVAILABLE LISTINGS ({availableListings.length})
            </h2>
            {availableListings.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {availableListings.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🌾</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="text-xs text-slate-500">{item.category} • {item.quantity}MT</p>
                        <p className="text-xs text-blue-600 font-bold mt-1">Farmer: {item.sellerEmail}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-black text-emerald-600">₹{item.price}/MT</p>
                      <button
                        onClick={() => handleClaim(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-70"
                      >
                        {actionLoading === item.id ? 'Claiming...' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500 font-bold">No available listings</p>
                <p className="text-xs text-slate-400 mt-1">Check back later for new farmer listings</p>
              </div>
            )}
          </div>

          {/* My Pickups */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Truck size={24} className="text-amber-600" />
              MY PICKUPS ({myPickups.length})
            </h2>
            {myPickups.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {myPickups.map((item: any) => {
                  const status = item.status || 'ASSIGNED';
                  return (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-transparent rounded-xl border border-amber-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">📦</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{item.title}</h3>
                          <p className="text-xs text-slate-500">{item.category} • {item.quantity}MT</p>
                          <p className="text-xs text-amber-600 font-bold mt-1">Farmer: {item.sellerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusColors[status]}`}>
                          {status.replace('_', ' ')}
                        </span>
                        <p className="font-black text-emerald-600">₹{item.price}/MT</p>
                        {status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStart(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 bg-purple-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-purple-700 transition-all disabled:opacity-70"
                          >
                            {actionLoading === item.id ? 'Starting...' : 'Start Pickup'}
                          </button>
                        )}
                        {status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleDeliver(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-70"
                          >
                            {actionLoading === item.id ? 'Delivering...' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500 font-bold">No active pickups</p>
                <p className="text-xs text-slate-400 mt-1">Claim a listing to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        {myDelivered.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] border border-emerald-200 p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Leaf size={24} className="text-emerald-600" />
              RECENT DELIVERIES ({myDelivered.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDelivered.slice(0, 6).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.quantity}MT • ₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ============ ADMIN ============
function AdminDashboard({ user, listings }: any) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users'>('overview');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [recyclingId, setRecyclingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRecycle = async (listingId: string) => {
    if (!confirm('Mark this listing as recycled? This indicates the waste has been fully processed.')) return;
    setRecyclingId(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/recycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user?.uid }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to mark as recycled');
      toast({ title: 'Success', description: 'Listing marked as recycled!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setRecyclingId(null);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setAdminStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      setLoadingUsers(true);
      fetch('/api/admin/users')
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [activeTab, users.length]);

  // Calculate listing stats from real data
  const listingStats = {
    open: listings.filter((l: any) => l.status === 'OPEN' || !l.status).length,
    assigned: listings.filter((l: any) => l.status === 'ASSIGNED').length,
    inTransit: listings.filter((l: any) => l.status === 'IN_TRANSIT').length,
    delivered: listings.filter((l: any) => l.status === 'DELIVERED').length,
    recycled: listings.filter((l: any) => l.status === 'RECYCLED').length,
    cancelled: listings.filter((l: any) => l.status === 'CANCELLED').length,
    total: listings.length,
    totalVolume: listings.reduce((sum: number, l: any) => sum + (l.quantity || 0), 0),
    totalValue: listings.reduce((sum: number, l: any) => sum + ((l.price || 0) * (l.quantity || 0)), 0),
  };

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-700',
    ASSIGNED: 'bg-amber-100 text-amber-700',
    IN_TRANSIT: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    RECYCLED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const roleColors: Record<string, string> = {
    FARMER: 'bg-emerald-100 text-emerald-700',
    AGENT: 'bg-blue-100 text-blue-700',
    ADMIN: 'bg-purple-100 text-purple-700',
  };

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 blur-2xl ${color}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Icon size={20} />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-[1000] tracking-tighter text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-20">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-[120px]" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.15), transparent 80%)` }} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-[1000] tracking-tighter text-slate-900">ADMIN <span className="text-emerald-500 italic">CONTROL</span></h1>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Real-time platform monitoring
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={loadingStats ? '...' : (adminStats?.totalUsers || 0)} sub="All accounts" color="bg-blue-500" />
          <StatCard icon={Leaf} label="Farmers" value={loadingStats ? '...' : (adminStats?.farmers || 0)} sub="Producers" color="bg-emerald-500" />
          <StatCard icon={Truck} label="Agents" value={loadingStats ? '...' : (adminStats?.agents || 0)} sub="Collectors" color="bg-amber-500" />
          <StatCard icon={Package} label="Total Listings" value={listingStats.total} sub="All time" color="bg-purple-500" />
          <StatCard icon={BarChart3} label="Volume" value={`${listingStats.totalVolume.toFixed(1)} MT`} sub="Total waste" color="bg-teal-500" />
          <StatCard icon={DollarSign} label="Value" value={`₹${listingStats.totalValue.toLocaleString()}`} sub="Platform GMV" color="bg-green-500" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-black text-blue-700">OPEN: {listingStats.open}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
            <span className="text-xs font-black text-amber-700">ASSIGNED: {listingStats.assigned}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-purple-700">IN TRANSIT: {listingStats.inTransit}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
            <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-black text-emerald-700">DELIVERED: {listingStats.delivered}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-200">
            <div className="h-2 w-2 bg-teal-500 rounded-full"></div>
            <span className="text-xs font-black text-teal-700">RECYCLED: {listingStats.recycled}</span>
          </div>
          {listingStats.cancelled > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-200">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-black text-red-700">CANCELLED: {listingStats.cancelled}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab('listings')} className={`px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'listings' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            All Listings ({listings.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Listings */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6">
                <h2 className="text-xl font-black mb-4 flex items-center gap-3">
                  <Package size={22} className="text-emerald-600" />
                  RECENT LISTINGS
                </h2>
                {listings.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {listings.slice(0, 10).map((item: any) => {
                      const status = item.status || 'OPEN';
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-100 hover:shadow-md transition-all">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">🌾</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.sellerEmail} • {item.quantity}MT • ₹{item.price}/MT</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap ${statusColors[status]}`}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No listings yet</p>
                )}
              </div>

              {/* Platform Stats Dark Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white p-6">
                <h2 className="text-xl font-black mb-4 flex items-center gap-3">
                  <BarChart3 size={22} />
                  PLATFORM METRICS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
                    <p className="text-2xl font-black">{loadingStats ? '...' : (adminStats?.farmers || 0)}</p>
                    <p className="text-xs text-emerald-400 font-bold uppercase">Farmers</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
                    <p className="text-2xl font-black">{loadingStats ? '...' : (adminStats?.agents || 0)}</p>
                    <p className="text-xs text-blue-400 font-bold uppercase">Agents</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
                    <p className="text-2xl font-black">{listingStats.delivered}</p>
                    <p className="text-xs text-purple-400 font-bold uppercase">Completed</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
                    <p className="text-2xl font-black">{listingStats.assigned + listingStats.inTransit}</p>
                    <p className="text-xs text-amber-400 font-bold uppercase">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* System Health */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[2rem] border border-emerald-200 p-6">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  System Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="font-bold text-sm">Firebase</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-bold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="font-bold text-sm">Firestore</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-bold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="font-bold text-sm">Auth</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-bold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6">
                <h3 className="font-black text-slate-900 mb-4">Quick Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Completion Rate</span>
                    <span className="font-black text-emerald-600">
                      {listingStats.total > 0 ? Math.round((listingStats.delivered / listingStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Avg. Listing Value</span>
                    <span className="font-black">₹{listingStats.total > 0 ? Math.round(listingStats.totalValue / listingStats.total).toLocaleString() : 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Active Rate</span>
                    <span className="font-black text-amber-600">
                      {listingStats.total > 0 ? Math.round(((listingStats.assigned + listingStats.inTransit) / listingStats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <Package size={22} className="text-emerald-600" />
                  ALL LISTINGS ({listings.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Search by title or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RECYCLED">Recycled</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            {(() => {
              const filteredListings = listings.filter((item: any) => {
                const status = item.status || 'OPEN';
                const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
                const matchesSearch = !searchQuery || 
                  item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.sellerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.assignedAgentEmail?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesStatus && matchesSearch;
              });
              return filteredListings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Title</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Farmer</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Category</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Quantity</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Price</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Agent</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Status</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((item: any) => {
                      const status = item.status || 'OPEN';
                      return (
                        <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm text-slate-900">{item.title}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600">{item.sellerEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600">{item.category || '-'}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-sm">{item.quantity} MT</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-emerald-600">₹{item.price}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600">{item.assignedAgentEmail || '-'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${statusColors[status]}`}>
                              {status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            {status === 'DELIVERED' && (
                              <button
                                onClick={() => handleRecycle(item.id)}
                                disabled={recyclingId === item.id}
                                className="px-3 py-1.5 bg-teal-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-teal-700 transition-all disabled:opacity-70"
                              >
                                {recyclingId === item.id ? '...' : 'Mark Recycled'}
                              </button>
                            )}
                            {status === 'RECYCLED' && (
                              <span className="text-[10px] text-teal-600 font-bold">✓ Complete</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500 font-bold">{searchQuery || statusFilter !== 'ALL' ? 'No matching listings' : 'No listings yet'}</p>
              </div>
            );
            })()}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Users size={22} className="text-blue-600" />
                ALL USERS ({loadingStats ? '...' : (adminStats?.totalUsers || 0)})
              </h2>
            </div>
            {loadingUsers ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Email</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Role</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-sm text-slate-600">
                              {u.email?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <p className="font-bold text-sm text-slate-900">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                            {u.role || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-500">
                            {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500 font-bold mb-2">No users found</p>
                <p className="text-xs text-slate-400">Users will appear here as they sign up</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ============ MAIN ============
export default function DashboardPage() {
  const { user, loading, userRole, logout } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats] = useState<CardStats>({
    totalSales: 0,
    activeListings: 0,
    inTransit: 0,
    impact: 0,
  });
  const { listingsQuery } = useFirebase();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !userRole) {
      router.push('/role-selection');
    }
  }, [user, userRole, loading, router]);

  useEffect(() => {
    if (!user) {
      setListings([]);
      return;
    }
    const q = listingsQuery();
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setListings(data as Listing[]);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader user={user} userRole={userRole} onLogout={handleLogout} />
      {userRole === 'FARMER' && <FarmerDashboard user={user} listings={listings} stats={stats} />}
      {userRole === 'AGENT' && <AgentDashboard user={user} listings={listings} />}
      {userRole === 'ADMIN' && <AdminDashboard user={user} listings={listings} />}
    </div>
  );
}
