'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { Bell, User as UserIcon, ArrowLeft } from 'lucide-react';
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

export default function AppHeader() {
    const { user, logout, setUser } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
        if (!name) return 'A';
        return name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    }

    const bottomNavRoutes = ['/app/home', '/app/chat', '/app/appointments', '/app/records', '/app/medicines', '/app/profile', '/app/requests', '/app'];
    const isRootNode = bottomNavRoutes.some(route => pathname === route || pathname === '/app');
    const isHome = pathname === '/app/home' || pathname === '/app';
    const showBack = !isRootNode;

    const getPageTitle = () => {
        if (pathname.includes('/chat')) return 'AI Health Assistant';
        if (pathname.includes('/appointments')) return 'My Appointments';
        if (pathname.includes('/records')) return 'Health Records';
        if (pathname.includes('/medicines')) return 'Medicines';
        if (pathname.includes('/profile')) return 'My Profile';
        if (pathname.includes('/requests')) return 'Doctor Access';
        return '';
    };

    const timeOfDay = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className="sticky top-0 z-40 w-full h-[68px] flex items-center justify-between px-5 shrink-0">
            {/* Glass background */}
            <div className="absolute inset-0 glass-panel border-x-0 border-t-0 rounded-none shadow-[0_1px_0_0_rgba(0,0,0,0.2)]" />
            
            <div className="relative z-10 flex items-center gap-3">
                {showBack ? (
                    <>
                        <button
                            onClick={() => router.back()}
                            className="h-9 w-9 rounded-2xl bg-card hover:bg-accent/20 flex items-center justify-center text-muted-foreground hover:text-accent-foreground active:scale-95 transition-all border border-white/5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <h1 className="font-bold text-[17px] text-foreground tracking-tight">
                            {getPageTitle()}
                        </h1>
                    </>
                ) : isHome ? (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]">
                            {mounted ? timeOfDay() : 'WELCOME'}
                        </span>
                        <h1 className="font-extrabold text-[20px] text-foreground tracking-tight leading-tight">
                            {mounted ? (user?.name?.split(' ')[0] || 'there') : 'there'} 👋
                        </h1>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]">SwasthSetu</span>
                        <h1 className="font-extrabold text-[19px] text-foreground tracking-tight leading-tight">
                            {getPageTitle()}
                        </h1>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex items-center gap-2.5">
                {isHome && (
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-2xl bg-card border border-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger className="relative outline-none">
                        <Avatar className="h-10 w-10 flex-shrink-0 rounded-2xl ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,255,0.2)]">
                            {mounted && <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} className="object-cover" />}
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold rounded-2xl">
                                {mounted ? getInitials(user?.name) : 'A'}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 mt-3 shadow-[0_16px_48px_rgba(0,0,0,0.5)] rounded-2xl border border-white/10 p-2 glass-panel">
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl">
                                    {mounted && <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />}
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold rounded-xl">
                                        {mounted ? getInitials(user?.name) : 'A'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[14px] font-bold text-foreground leading-tight">{mounted ? (user?.name || 'Patient') : 'Patient'}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate max-w-[130px]">{mounted ? user?.email : ''}</p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10 my-1" />
                        <DropdownMenuItem className="cursor-pointer rounded-xl p-0 focus:bg-transparent">
                            <Link href="/app/profile" className="w-full flex items-center py-2.5 px-3 hover:bg-primary/10 transition-colors text-foreground rounded-xl gap-3">
                                <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-semibold text-[13px]">My Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl p-0 mt-1 focus:bg-transparent">
                            <div className="w-full flex items-center py-2.5 px-3 hover:bg-destructive/10 transition-colors rounded-xl gap-3">
                                <div className="h-8 w-8 rounded-xl bg-destructive/20 flex items-center justify-center">
                                    <span className="text-[14px]">🚪</span>
                                </div>
                                <span className="font-semibold text-[13px] text-destructive">Log Out</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
