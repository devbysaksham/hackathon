'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { Bell, User as UserIcon, Search, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export default function AppHeader() {
    const { user, logout, setUser } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();

    // Fetch full profile on mount so age/phone/gender are always populated
    useEffect(() => {
        if (user?.id && user.role === 'patient' && !user.phone) {
            API.get(`/auth/me`).then(res => {
                if (res.data?.data) {
                    setUser({ ...user, ...res.data.data });
                }
            }).catch(() => {});
        }
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    function getInitials(name?: string) {
      if (!name) return "A";
      return name
        .trim()
        .split(" ")
        .map(part => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    // Determine context
    const bottomNavRoutes = ['/app/home', '/app/chat', '/app/appointments', '/app/records', '/app/medicines', '/app/profile', '/app'];
    const isRootNode = bottomNavRoutes.some(route => pathname === route || pathname === '/app');
    const isHome = pathname === '/app/home' || pathname === '/app';
    const showBack = !isRootNode;

    const getPageTitle = () => {
        if (pathname.includes('/chat')) return 'AI Assistant';
        if (pathname.includes('/appointments')) return 'Appointments';
        if (pathname.includes('/records')) return 'My Records';
        if (pathname.includes('/medicines')) return 'My Medicines';
        if (pathname.includes('/profile')) return 'Profile';
        return '';
    };

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)] h-[72px] flex items-center justify-between px-6 shrink-0 transition-all">
            {isHome ? (
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-500/80 dark:text-indigo-400/80 mb-0.5">Welcome</span>
                    <h1 className="font-extrabold text-[22px] text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                        {user?.name || 'Saksham'}!
                    </h1>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        {getPageTitle()}
                    </h1>
                </div>
            )}
            
            <div className="flex items-center gap-4">
                {isHome && (
                    <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-[14px] bg-slate-50 dark:bg-slate-900 shadow-inner border border-slate-200/60 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                        <Bell className="h-[22px] w-[22px]" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-slate-50 dark:border-slate-900"></span>
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-11 w-11 flex-shrink-0 rounded-[14px] select-none cursor-pointer p-0 overflow-hidden outline-none ring-2 ring-transparent hover:ring-indigo-500/30 transition-all shadow-md">
                        <Avatar className="h-11 w-11 flex-shrink-0 bg-white overflow-hidden rounded-[14px]">
                            <AvatarImage src="https://i.pravatar.cc/150?u=saksham" className="object-cover h-11 w-11" />
                             <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold h-11 w-11 flex items-center justify-center">
                                 {getInitials('S')}
                             </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-3 shadow-2xl shadow-indigo-500/10 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-2">
                        <DropdownMenuLabel className="font-normal p-2.5">
                            <div className="flex flex-col space-y-1">
                                <p className="text-[15px] font-bold leading-none text-slate-800 dark:text-slate-100">{user?.name || 'Saksham'}</p>
                                <p className="text-xs font-medium leading-none text-slate-500 mt-1">{user?.email || 'patient@swasthsetu.com'}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                        <DropdownMenuItem className="cursor-pointer rounded-xl p-0">
                            <Link href="/app/profile" className="w-full flex items-center py-3 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-600 dark:text-slate-300">
                                <UserIcon className="mr-3 h-[18px] w-[18px]" />
                                <span className="font-bold text-[13px]">My Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 py-3 px-3 rounded-xl mt-1 transition-colors">
                            <span className="font-bold text-[13px] w-full text-left">Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
