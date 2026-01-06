'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot } from 'firebase/firestore';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import type { Listing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, MapPin, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface CardStats {
  totalSales: number;
  activeListings: number;
  inTransit: number;
  impact: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [selectedTab, setSelectedTab] = useState('purchases');
  const [stats, setStats] = useState<CardStats>({
    totalSales: 12450,
    activeListings: 4,
    inTransit: 2,
    impact: 850,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const { createListing, listingsQuery, ordersQueryForBuyer, ordersQueryForSeller } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Subscribe to listings
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

  // Subscribe to orders and sales
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setSales([]);
      return;
    }

    const buyerQuery = ordersQueryForBuyer(user.uid);
    const sellerQuery = ordersQueryForSeller(user.uid);

    const unsubscribeBuyer = onSnapshot(buyerQuery, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    });

    const unsubscribeSeller = onSnapshot(sellerQuery, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSales(data);
    });

    return () => {
      unsubscribeBuyer();
      unsubscribeSeller();
    };
  }, [user]);

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
        createdAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Your listing has been published!',
      });

      setIsDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <SidebarNav />
      <Header />

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-8 space-y-8">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                <span>💰</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Sales</p>
                <h3 className="text-xl font-bold text-slate-800"><span>₹</span>{stats.totalSales.toLocaleString()}</h3>
              </div>
            </div>

            {/* Active Listings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <span>📦</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Active Listings</p>
                <h3 className="text-xl font-bold text-slate-800">{stats.activeListings} Items</h3>
              </div>
            </div>

            {/* In Transit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                <span>🚚</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">In Transit</p>
                <h3 className="text-xl font-bold text-slate-800">{stats.inTransit} Orders</h3>
              </div>
            </div>

            {/* Impact */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <span>🌿</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Impact</p>
                <h3 className="text-xl font-bold text-slate-800">{stats.impact} kg</h3>
              </div>
            </div>
          </div>

          {/* Marketplace Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Marketplace</h2>
                <p className="text-sm text-slate-500">Available agricultural waste listings</p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors bg-white border border-emerald-200"
              >
                View All <span className="ml-1">→</span>
              </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.length > 0 ? (
                listings.slice(0, 4).map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative"
                  >
                    {/* Image Placeholder */}
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="text-6xl drop-shadow-sm">🌾</span>
                    </div>

                    {/* Like Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                          {listing.category}
                        </span>
                        <div className="flex items-center text-xs text-slate-500">
                          <MapPin className="h-3 w-3 mr-1 text-emerald-500" /> Pune
                        </div>
                      </div>

                      <h3 className="text-slate-900 font-bold text-lg mb-1 truncate">{listing.title}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-4">{listing.description}</p>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-emerald-600 font-bold text-lg">
                          <span>₹</span>{listing.price}
                          <span className="text-xs text-slate-400 font-normal">/unit</span>
                        </span>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500">No listings available yet</p>
                </div>
              )}

              {/* Coming Soon Card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group cursor-pointer opacity-75 hover:opacity-100">
                <div className="h-40 bg-slate-50 flex items-center justify-center">
                  <span className="text-4xl text-slate-300">📷</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-slate-400 font-bold text-lg mb-1">More Listings</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4">More listings will appear based on your preferences.</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-slate-300 font-bold text-lg">--</span>
                    <Button disabled className="bg-slate-100 text-slate-400 text-xs font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                      Unavailable
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Section (Tabs) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200">
              <nav className="flex">
                <button
                  onClick={() => setSelectedTab('purchases')}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${selectedTab === 'purchases'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  My Purchases
                </button>
                <button
                  onClick={() => setSelectedTab('sales')}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${selectedTab === 'sales'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  My Sales
                </button>
              </nav>
            </div>

            <div className="p-8">
              {selectedTab === 'purchases' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">No purchases yet</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Browse the marketplace above to find sustainable agricultural waste for your needs.
                  </p>
                  <Button className="text-emerald-600 font-semibold text-sm hover:underline bg-transparent border-0 p-0 h-auto">
                    Browse Listings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">You haven't posted anything</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                    Turn your agricultural waste into profit. It only takes a minute to post.
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Post First Item
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Post Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post New Waste</DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-1">
                Waste Type
              </Label>
              <Select name="category" defaultValue="rice">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Rice Husk</SelectItem>
                  <SelectItem value="wheat">Wheat Stubble</SelectItem>
                  <SelectItem value="cotton">Cotton Stalks</SelectItem>
                  <SelectItem value="sugarcane">Sugarcane Bagasse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 mb-1">
                  Quantity (kg/ton)
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="text"
                  placeholder="e.g. 500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-slate-700 mb-1">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium text-slate-700 mb-1">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Premium Rice Husk"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-1">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe quality, condition..."
                rows={3}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={posting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 mt-2"
            >
              {posting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-300 flex items-center justify-center z-40 hover:scale-110 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

