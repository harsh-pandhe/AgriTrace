'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tractor, Map, Recycle, Leaf, LogOut, Zap, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItemsByRole = {
  FARMER: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/reporting', icon: Tractor, label: 'Waste Reporting' },
    { href: '/tracking', icon: Map, label: 'Tracking' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  AGENT: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/recycling', icon: Recycle, label: 'Assigned Collections' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  RECYCLER: [
    { href: '/recycler', icon: Zap, label: 'Recycling Management' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  ADMIN: [
    { href: '/admin', icon: Settings, label: 'Admin Dashboard' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  ],
};

export function SidebarNav() {
  const pathname = usePathname();
  const { user, userRole, logout } = useAuth();
  const router = useRouter();

  const role = (userRole || 'FARMER') as keyof typeof navItemsByRole;
  const navItems = navItemsByRole[role] || navItemsByRole.FARMER;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      FARMER: 'Farmer Account',
      AGENT: 'Collection Agent Account',
      RECYCLER: 'Recycler Account',
      ADMIN: 'Admin Account',
    };
    return labels[role] || 'User Account';
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href={'/dashboard'} className="flex items-center gap-3 text-emerald-700 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
            <Leaf className="text-sm" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900">AgriTrace</h1>
            <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider leading-none">Connect</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${isActive
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-emerald-600 rounded-r" />
              )}
              <item.icon className="w-5 text-center" />
              {item.label}
            </Link>
          );
        })}

      </nav>

      {/* User Profile Bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.name || user?.email || 'User'} />
            <AvatarFallback className="bg-emerald-500 text-white font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-100 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors bg-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
