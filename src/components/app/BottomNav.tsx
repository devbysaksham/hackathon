'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Calendar, FolderHeart, Pill, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';

export default function BottomNav() {
    const pathname = usePathname();
    const { token, user } = useAppStore();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Only fetch for patient role — doctors/admins don't use this nav
        if (!token || !user || user.role !== 'patient') return;
        const fetchPending = async () => {
            try {
                const res = await API.get('/doctor-access/incoming-requests');
                const pending = (res.data.data || []).filter((r: any) => r.status === 'pending');
                setPendingCount(pending.length);
            } catch {/* silent */}
        };
        fetchPending();
        // Refresh every 60s
        const interval = setInterval(fetchPending, 60000);
        return () => clearInterval(interval);
    }, [token, user?.role]);

    const navItems = [
        { name: 'Home', path: '/app/home', icon: Home, badge: 0 },
        { name: 'Chat', path: '/app/chat', icon: MessageSquare, badge: 0 },
        { name: 'Visits', path: '/app/appointments', icon: Calendar, badge: 0 },
        { name: 'Records', path: '/app/records', icon: FolderHeart, badge: 0 },
        { name: 'Rx', path: '/app/medicines', icon: Pill, badge: 0 },
        { name: 'Doctors', path: '/app/requests', icon: ShieldCheck, badge: pendingCount },
        { name: 'Me', path: '/app/profile', icon: User, badge: 0 },
    ];

    return (
        <div className="glass-card rounded-[2.5rem] px-1.5 py-2 flex items-center justify-between mx-auto max-w-[380px] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
            {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/app' && item.path !== '/app/home' && pathname.startsWith(item.path));
                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={cn(
                            "relative flex flex-col items-center justify-center w-[2.8rem] h-[3.3rem] rounded-[1rem] transition-all duration-300 gap-0.5 z-10",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <span className="absolute inset-0 rounded-[1.2rem] bg-primary/10 shadow-[inset_0_0_12px_rgba(0,255,255,0.1)] border border-primary/20" />
                        )}
                        <div className="relative">
                            <item.icon className={cn(
                                "h-[18px] w-[18px] transition-all duration-300 relative z-10",
                                isActive ? "stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" : "stroke-[1.5px]"
                            )} />
                            {item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive border border-background text-[9px] font-extrabold text-white flex items-center justify-center shadow-[0_0_8px_rgba(255,0,0,0.6)] z-20">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[9px] tracking-tight transition-all duration-200 relative z-10",
                            isActive ? "font-bold drop-shadow-[0_0_4px_rgba(0,255,255,0.3)] text-primary" : "font-medium opacity-70 text-muted-foreground"
                        )}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
