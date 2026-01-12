'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Package,
  Activity,
  X,
  LogOut,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  Download,
  ChevronRight,
  Home,
  Sparkles,
} from 'lucide-react';

// ============ HEADER ============
function DashboardHeader({ user, userRole, onLogout }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={`sticky top-0 z-[50] w-full bg-[#0a120a]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">AgriTrace</span>
            <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">{userRole} Dashboard</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-3">
            <p className="text-sm font-semibold text-white">{user?.email}</p>
            <p className="text-xs text-slate-400">Welcome back</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-72 bg-[#0a120a] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[100]">
                  <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{user?.email}</p>
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">{userRole}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/"
                    className="w-full px-5 py-4 flex items-center gap-3 text-slate-300 hover:bg-white/5 transition-all font-semibold group"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Home size={18} />
                    </div>
                    <span>Home</span>
                  </Link>
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-5 py-4 text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-all font-semibold group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
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
function FarmerDashboard({ user, listings }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { createListing } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
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

  const StatCard = ({ icon: Icon, label, value, sub, gradient }: any) => (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050a05] text-white pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 py-8 sm:py-10">
        <div className={`mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Farmer <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-slate-400 flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" /> Monetize your agricultural waste
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button onClick={() => {
              const headers = ['Title','Category','Quantity','Price','Status','Agent Email','Created At','Updated At'];
              const toDate = (ts: any) => {
                if (!ts) return null;
                try {
                  if (typeof ts.toDate === 'function') return ts.toDate();
                  if (ts.seconds) return new Date(ts.seconds * 1000);
                  const d = new Date(ts);
                  return isNaN(d.getTime()) ? null : d;
                } catch { return null; }
              };
              const rows = userListings.map((item: any) => {
                const created = toDate(item.createdAt);
                const updated = toDate(item.updatedAt);
                return [
                  item.title || '',
                  item.category || '',
                  item.quantity ?? '',
                  item.price ?? '',
                  (item.status || 'OPEN').replace('_',' '),
                  item.assignedAgentEmail || '',
                  created ? created.toISOString() : '',
                  updated ? updated.toISOString() : '',
                ];
              });
              const csv = [headers, ...rows]
                .map((r) => r.map(String).map((v: string) => '"' + v.replace(/"/g, '""') + '"').join(','))
                .join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `agritrace_listings_${user?.uid || 'farmer'}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 sm:px-6 h-12 sm:h-14 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <Download size={18} /> <span className="text-xs sm:text-sm">Export CSV</span>
            </button>
            <button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-6 sm:px-8 h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={20} /> <span className="text-xs sm:text-sm">Post Waste</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <StatCard icon={DollarSign} label="Total Earnings" value={<><span style={{fontFamily: 'Arial'}}>₹</span>{userListings.filter((l: any) => l.status === 'DELIVERED' || l.status === 'RECYCLED').reduce((sum: number, l: any) => sum + (l.price * l.quantity || 0), 0)}</>} sub="Completed listings" gradient="from-emerald-400 to-emerald-600" />
          <StatCard icon={Package} label="Active Listings" value={userListings.filter((l: any) => l.status === 'OPEN').length} sub="Awaiting pickup" gradient="from-blue-400 to-blue-600" />
          <StatCard icon={Truck} label="In Progress" value={userListings.filter((l: any) => l.status === 'IN_TRANSIT' || l.status === 'ASSIGNED' || l.status === 'DELIVERED').length} sub="Being processed" gradient="from-purple-400 to-purple-600" />
          <StatCard icon={Leaf} label="Recycled" value={userListings.filter((l: any) => l.status === 'RECYCLED').length} sub="Fully processed" gradient="from-teal-400 to-teal-600" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* My Listings */}
            <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                MY LISTINGS ({userListings.length})
              </h2>
              {userListings.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {userListings.map((item: any) => {
                    const statusColors: Record<string, string> = {
                      OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      ASSIGNED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      IN_TRANSIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                      DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      RECYCLED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
                      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
                    };
                    const status = item.status || 'OPEN';
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-300 gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-slate-400">{item.category} • {item.quantity}MT</p>
                            {item.assignedAgentEmail && (
                              <p className="text-xs text-emerald-400 font-medium mt-1">Agent: {item.assignedAgentEmail}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${statusColors[status]}`}>
                            {status.replace('_', ' ')}
                          </span>
                          <p className="font-bold text-emerald-400 text-lg"><span style={{fontFamily: 'Arial'}}>₹</span>{item.price}</p>
                          {(status === 'OPEN' || !item.status) && (
                            <button
                              onClick={() => handleCancel(item.id)}
                              disabled={cancellingId === item.id}
                              className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
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
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-slate-400 font-medium">No listings yet</p>
                  <p className="text-xs text-slate-500 mt-1">Post your first waste asset!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" />
                Recent Activity
              </h3>
              {userListings.length > 0 ? (
                <div className="space-y-3">
                  {userListings
                    .slice()
                    .sort((a: any, b: any) => {
                      const toDate = (ts: any) => {
                        if (!ts) return null;
                        try {
                          if (typeof ts.toDate === 'function') return ts.toDate();
                          if (ts.seconds) return new Date(ts.seconds * 1000);
                          const d = new Date(ts);
                          return isNaN(d.getTime()) ? null : d;
                        } catch { return null; }
                      };
                      const ad = toDate(a.updatedAt) || toDate(a.createdAt) || new Date(0);
                      const bd = toDate(b.updatedAt) || toDate(b.createdAt) || new Date(0);
                      return bd.getTime() - ad.getTime();
                    })
                    .slice(0, 5)
                    .map((item: any) => {
                      const statusColors: Record<string, string> = {
                        OPEN: 'bg-blue-500/20 text-blue-400',
                        ASSIGNED: 'bg-amber-500/20 text-amber-400',
                        IN_TRANSIT: 'bg-purple-500/20 text-purple-400',
                        DELIVERED: 'bg-emerald-500/20 text-emerald-400',
                        RECYCLED: 'bg-teal-500/20 text-teal-400',
                        CANCELLED: 'bg-red-500/20 text-red-400',
                      };
                      const status = item.status || 'OPEN';
                      const when = (item.updatedAt && (typeof item.updatedAt.toDate === 'function' ? item.updatedAt.toDate() : item.updatedAt.seconds ? new Date(item.updatedAt.seconds * 1000) : new Date(item.updatedAt)))
                        || (item.createdAt && (typeof item.createdAt.toDate === 'function' ? item.createdAt.toDate() : item.createdAt.seconds ? new Date(item.createdAt.seconds * 1000) : new Date(item.createdAt)))
                        || null;
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">🌾</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-500">{item.quantity}MT</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColors[status]}`}>{status.replace('_',' ')}</span>
                            <p className="text-[10px] text-slate-500 mt-1">{when ? when.toLocaleDateString() : '-'}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No activity yet</p>
              )}
            </div>

            {/* Quick Tips */}
            <div className={`bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                Quick Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight size={12} className="text-emerald-400" />
                  </div>
                  <span>Post waste early for faster agent pickup</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight size={12} className="text-emerald-400" />
                  </div>
                  <span>Add accurate weight for fair pricing</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight size={12} className="text-emerald-400" />
                  </div>
                  <span>Track your environmental impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Post Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsDialogOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0a120a] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-10">
            <div className="absolute -top-20 -right-20 h-40 w-40 bg-emerald-500/20 rounded-full blur-[80px]" />
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Post <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Waste</span></h2>
              <button onClick={() => setIsDialogOpen(false)} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</label>
                  <select name="category" defaultValue="rice" className="w-full h-12 sm:h-14 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all">
                    <option value="rice" className="bg-[#0a120a]">Rice Husk</option>
                    <option value="wheat" className="bg-[#0a120a]">Wheat Stubble</option>
                    <option value="sugarcane" className="bg-[#0a120a]">Sugarcane Bagasse</option>
                    <option value="cotton" className="bg-[#0a120a]">Cotton Stalks</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quantity (MT)</label>
                  <input name="quantity" type="number" step="0.1" placeholder="1.2" className="w-full h-12 sm:h-14 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-sm text-white font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Title</label>
                <input name="title" type="text" placeholder="Enter title" className="w-full h-12 sm:h-14 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-sm text-white font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Price (<span style={{fontFamily: 'Arial'}}>₹</span>/MT)</label>
                <input name="price" type="number" placeholder="500" className="w-full h-12 sm:h-14 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-sm text-white font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</label>
                <textarea name="description" rows={3} placeholder="Describe your waste..." className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-sm text-white font-medium placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none transition-all" required />
              </div>
              <button type="submit" disabled={posting} className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                {posting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Listing</span>
                )}
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
  const [mounted, setMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
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

  const StatCard = ({ icon: Icon, label, value, sub, gradient }: any) => (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">{sub}</p>
      </div>
    </div>
  );

  const statusColors: Record<string, string> = {
    OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ASSIGNED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    IN_TRANSIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 py-8 sm:py-10">
        <div className={`mb-10 sm:mb-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Collection <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Agent</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-slate-400 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" /> Manage pickups and collections efficiently
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <StatCard icon={Package} label="Available" value={availableListings.length} sub="Open listings" gradient="from-blue-400 to-blue-600" />
          <StatCard icon={Truck} label="My Pickups" value={myPickups.length} sub="Active assignments" gradient="from-amber-400 to-amber-600" />
          <StatCard icon={Leaf} label="Delivered" value={myDelivered.length} sub="Completed" gradient="from-emerald-400 to-emerald-600" />
          <StatCard icon={DollarSign} label="Earnings" value={<><span style={{fontFamily: 'Arial'}}>₹</span>{myDelivered.reduce((sum: number, l: any) => sum + (l.price * l.quantity || 0), 0)}</>} sub="Total earned" gradient="from-green-400 to-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Listings */}
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              AVAILABLE ({availableListings.length})
            </h2>
            {availableListings.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {availableListings.map((item: any) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white/[0.02] rounded-xl border border-blue-500/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all duration-300 gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">🌾</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-400">{item.category} • {item.quantity}MT</p>
                        <p className="text-xs text-blue-400 font-medium mt-1">Farmer: {item.sellerEmail}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3">
                      <p className="font-bold text-emerald-400"><span style={{fontFamily: 'Arial'}}>₹</span>{item.price}/MT</p>
                      <button
                        onClick={() => handleClaim(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold uppercase rounded-lg hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70"
                      >
                        {actionLoading === item.id ? 'Claiming...' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-blue-400" />
                </div>
                <p className="text-slate-400 font-medium">No available listings</p>
                <p className="text-xs text-slate-500 mt-1">Check back later for new farmer listings</p>
              </div>
            )}
          </div>

          {/* My Pickups */}
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Truck size={20} />
              </div>
              MY PICKUPS ({myPickups.length})
            </h2>
            {myPickups.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {myPickups.map((item: any) => {
                  const status = item.status || 'ASSIGNED';
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white/[0.02] rounded-xl border border-amber-500/10 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all duration-300 gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-400">{item.category} • {item.quantity}MT</p>
                          <p className="text-xs text-amber-400 font-medium mt-1">Farmer: {item.sellerEmail}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${statusColors[status]}`}>
                          {status.replace('_', ' ')}
                        </span>
                        <p className="font-bold text-emerald-400"><span style={{fontFamily: 'Arial'}}>₹</span>{item.price}/MT</p>
                        {status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStart(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold uppercase rounded-lg hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-70"
                          >
                            {actionLoading === item.id ? 'Starting...' : 'Start Pickup'}
                          </button>
                        )}
                        {status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleDeliver(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold uppercase rounded-lg hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70"
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
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Truck size={32} className="text-amber-400" />
                </div>
                <p className="text-slate-400 font-medium">No active pickups</p>
                <p className="text-xs text-slate-500 mt-1">Claim a listing to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        {myDelivered.length > 0 && (
          <div className={`mt-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-6 sm:p-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Leaf size={20} />
              </div>
              RECENT DELIVERIES ({myDelivered.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDelivered.slice(0, 6).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-emerald-500/10">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg">✅</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.quantity}MT • <span style={{fontFamily: 'Arial'}}>₹</span>{item.price * item.quantity}</p>
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
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
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
    OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ASSIGNED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    IN_TRANSIT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    RECYCLED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const roleColors: Record<string, string> = {
    FARMER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    AGENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const StatCard = ({ icon: Icon, label, value, sub, gradient }: any) => (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-3xl ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon size={18} />
          </div>
        </div>
        <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050a05] text-white pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.06)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 py-8 sm:py-10">
        <div className={`mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Admin <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Control</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-slate-400 flex items-center gap-2">
              <Activity size={16} className="text-purple-400" /> Real-time platform monitoring
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={Users} label="Total Users" value={loadingStats ? '...' : (adminStats?.totalUsers || 0)} sub="All accounts" gradient="from-blue-400 to-blue-600" />
          <StatCard icon={Leaf} label="Farmers" value={loadingStats ? '...' : (adminStats?.farmers || 0)} sub="Producers" gradient="from-emerald-400 to-emerald-600" />
          <StatCard icon={Truck} label="Agents" value={loadingStats ? '...' : (adminStats?.agents || 0)} sub="Collectors" gradient="from-amber-400 to-amber-600" />
          <StatCard icon={Package} label="Total Listings" value={listingStats.total} sub="All time" gradient="from-purple-400 to-purple-600" />
          <StatCard icon={BarChart3} label="Volume" value={`${listingStats.totalVolume.toFixed(1)} MT`} sub="Total waste" gradient="from-teal-400 to-teal-600" />
          <StatCard icon={DollarSign} label="Value" value={<><span style={{fontFamily: 'Arial'}}>₹</span>{listingStats.totalValue.toLocaleString()}</>} sub="Platform GMV" gradient="from-green-400 to-green-600" />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-blue-400 rounded-full"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-blue-400">OPEN: {listingStats.open}</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-amber-400 rounded-full"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-400">ASSIGNED: {listingStats.assigned}</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-purple-400">IN TRANSIT: {listingStats.inTransit}</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-400 rounded-full"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-400">DELIVERED: {listingStats.delivered}</span>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-teal-500/10 rounded-full border border-teal-500/20">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-teal-400 rounded-full"></div>
            <span className="text-[10px] sm:text-xs font-semibold text-teal-400">RECYCLED: {listingStats.recycled}</span>
          </div>
          {listingStats.cancelled > 0 && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 rounded-full border border-red-500/20">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-400 rounded-full"></div>
              <span className="text-[10px] sm:text-xs font-semibold text-red-400">CANCELLED: {listingStats.cancelled}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('overview')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === 'overview' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/10'}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab('listings')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === 'listings' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/10'}`}>
            All Listings ({listings.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === 'users' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/10'}`}>
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Listings */}
              <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-3 text-white">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  RECENT LISTINGS
                </h2>
                {listings.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {listings.slice(0, 10).map((item: any) => {
                      const status = item.status || 'OPEN';
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-lg flex-shrink-0">🌾</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                            <p className="text-xs text-slate-400 truncate">{item.sellerEmail} • {item.quantity}MT • <span style={{fontFamily: 'Arial'}}>₹</span>{item.price}/MT</p>
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap ${statusColors[status]}`}>
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
              <div className={`bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/20 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-3 text-white">
                  <BarChart3 size={22} className="text-emerald-400" />
                  PLATFORM METRICS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/[0.05] rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold text-white">{loadingStats ? '...' : (adminStats?.farmers || 0)}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase">Farmers</p>
                  </div>
                  <div className="bg-white/[0.05] rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold text-white">{loadingStats ? '...' : (adminStats?.agents || 0)}</p>
                    <p className="text-[10px] sm:text-xs text-blue-400 font-semibold uppercase">Agents</p>
                  </div>
                  <div className="bg-white/[0.05] rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold text-white">{listingStats.delivered}</p>
                    <p className="text-[10px] sm:text-xs text-purple-400 font-semibold uppercase">Completed</p>
                  </div>
                  <div className="bg-white/[0.05] rounded-xl p-4 backdrop-blur-sm text-center border border-white/5">
                    <p className="text-xl sm:text-2xl font-bold text-white">{listingStats.assigned + listingStats.inTransit}</p>
                    <p className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* System Health */}
              <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  System Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="font-medium text-sm text-slate-300">Firebase</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-semibold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="font-medium text-sm text-slate-300">Firestore</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-semibold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="font-medium text-sm text-slate-300">Auth</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-semibold">ONLINE</span>
                      <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
                <h3 className="font-bold text-white mb-4">Quick Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="font-bold text-emerald-400">
                      {listingStats.total > 0 ? Math.round((listingStats.delivered / listingStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="text-slate-400">Avg. Listing Value</span>
                    <span className="font-bold text-white"><span style={{fontFamily: 'Arial'}}>₹</span>{listingStats.total > 0 ? Math.round(listingStats.totalValue / listingStats.total).toLocaleString() : 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="text-slate-400">Active Rate</span>
                    <span className="font-bold text-amber-400">
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
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 sm:p-6 border-b border-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-white">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  ALL LISTINGS ({listings.length})
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search by title or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none w-full sm:w-64 transition-all"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  >
                    <option value="ALL" className="bg-[#0a120a]">All Status</option>
                    <option value="OPEN" className="bg-[#0a120a]">Open</option>
                    <option value="ASSIGNED" className="bg-[#0a120a]">Assigned</option>
                    <option value="IN_TRANSIT" className="bg-[#0a120a]">In Transit</option>
                    <option value="DELIVERED" className="bg-[#0a120a]">Delivered</option>
                    <option value="RECYCLED" className="bg-[#0a120a]">Recycled</option>
                    <option value="CANCELLED" className="bg-[#0a120a]">Cancelled</option>
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
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Title</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400 hidden md:table-cell">Farmer</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400 hidden lg:table-cell">Category</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Qty</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Price</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400 hidden lg:table-cell">Agent</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Status</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((item: any) => {
                      const status = item.status || 'OPEN';
                      return (
                        <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 sm:p-4">
                            <p className="font-semibold text-sm text-white truncate max-w-[120px] sm:max-w-none">{item.title}</p>
                          </td>
                          <td className="p-3 sm:p-4 hidden md:table-cell">
                            <p className="text-sm text-slate-400 truncate max-w-[150px]">{item.sellerEmail}</p>
                          </td>
                          <td className="p-3 sm:p-4 hidden lg:table-cell">
                            <p className="text-sm text-slate-400">{item.category || '-'}</p>
                          </td>
                          <td className="p-3 sm:p-4">
                            <p className="font-semibold text-sm text-white">{item.quantity} MT</p>
                          </td>
                          <td className="p-3 sm:p-4">
                            <p className="font-semibold text-emerald-400"><span style={{fontFamily: 'Arial'}}>₹</span>{item.price}</p>
                          </td>
                          <td className="p-3 sm:p-4 hidden lg:table-cell">
                            <p className="text-sm text-slate-400 truncate max-w-[150px]">{item.assignedAgentEmail || '-'}</p>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-3 py-1 rounded-full border ${statusColors[status]}`}>
                              {status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            {status === 'DELIVERED' && (
                              <button
                                onClick={() => handleRecycle(item.id)}
                                disabled={recyclingId === item.id}
                                className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[9px] sm:text-[10px] font-semibold uppercase rounded-lg hover:from-teal-400 hover:to-teal-500 transition-all disabled:opacity-70 shadow-lg shadow-teal-500/25"
                              >
                                {recyclingId === item.id ? '...' : 'Recycle'}
                              </button>
                            )}
                            {status === 'RECYCLED' && (
                              <span className="text-[10px] text-teal-400 font-semibold">✓ Complete</span>
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
                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">{searchQuery || statusFilter !== 'ALL' ? 'No matching listings' : 'No listings yet'}</p>
              </div>
            );
            })()}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 sm:p-6 border-b border-white/5">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 text-white">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
                ALL USERS ({loadingStats ? '...' : (adminStats?.totalUsers || 0)})
              </h2>
            </div>
            {loadingUsers ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-medium">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Email</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Role</th>
                      <th className="text-left p-3 sm:p-4 text-[9px] sm:text-[10px] font-semibold uppercase text-slate-400">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center font-semibold text-sm text-emerald-400">
                              {u.email?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <p className="font-semibold text-sm text-white truncate max-w-[150px] sm:max-w-none">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-3 py-1 rounded-full border ${roleColors[u.role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {u.role || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className="text-sm text-slate-400">
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
                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium mb-2">No users found</p>
                <p className="text-xs text-slate-500">Users will appear here as they sign up</p>
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
      <div className="flex h-screen items-center justify-center bg-[#050a05]">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06)_0%,transparent_50%)]" />
        </div>
        <div className="text-center relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 animate-pulse">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <div className="h-8 w-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050a05] min-h-screen">
      <DashboardHeader user={user} userRole={userRole} onLogout={handleLogout} />
      {userRole === 'FARMER' && <FarmerDashboard user={user} listings={listings} />}
      {userRole === 'AGENT' && <AgentDashboard user={user} listings={listings} />}
      {userRole === 'ADMIN' && <AdminDashboard user={user} listings={listings} />}
    </div>
  );
}
