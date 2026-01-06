'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import NotificationBell from '@/components/notification-bell';

export function Header() {
  const { logout, user } = useAuth();
  const router = useRouter();

  // Get user initials from email or name
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 lg:ml-64 h-16 px-4 sm:px-8 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <h2 className="text-sm font-semibold text-slate-800">Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋</h2>
          <p className="text-xs text-slate-500">Here's what's happening with your waste management today.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 1118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 border-2 border-slate-200 hover:border-emerald-500 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.name || user?.email || 'User'}
                />
                <AvatarFallback className="bg-emerald-600 text-white font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1 py-2">
              <div className="text-sm font-semibold text-slate-900">
                {user?.email}
              </div>
              <div className="text-xs text-slate-600">
                {user?.role === 'FARMER' ? 'Farmer Account' : user?.role === 'AGENT' ? 'Collection Agent' : user?.role === 'RECYCLER' ? 'Recycler Account' : 'Admin Account'}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
