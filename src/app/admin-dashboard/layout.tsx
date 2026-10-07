'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import AdminSidebar from '@/components/AdminSidebar';
import { Loader2, Menu, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [isMounted, setIsMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!token || !user || !['admin', 'receptionist'].includes(user.role)) {
            toast.error('Access denied. Administrator privileges required.');
            router.push('/login');
        }
    }, [user, token]);

    if (!isMounted || !user || !['admin', 'receptionist'].includes(user.role)) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 h-screen">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-500">Authenticating administrator access...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[100dvh] w-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between bg-card/50 backdrop-blur-xl border-b border-white/5 h-16 px-4 shrink-0">
                <span className="font-bold text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" /> Admin Console
                </span>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -mr-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className="flex-1 flex flex-col overflow-y-auto bg-background relative z-10">
                {children}
            </main>
        </div>
    );
}
