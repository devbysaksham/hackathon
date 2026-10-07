'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { SectionHeader } from '@/components/app/SectionHeader';
import {
    MessageSquare, Calendar, FolderHeart, Pill, Activity,
    Search, Loader2, HeartPulse, Droplets, ArrowRight,
    TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';

export default function AppHomePage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [patientFile, setPatientFile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || !user) { router.push('/login'); return; }
        loadPatientFile();
    }, [user, token]);

    const loadPatientFile = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setPatientFile(res.data.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { name: 'Book', icon: Calendar, href: '/app/appointments', color: 'text-primary', bg: 'bg-primary/20', border: 'border-primary/20' },
        { name: 'Doctors', icon: Search, href: '/app/appointments', color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent/20' },
        { name: 'Records', icon: FolderHeart, href: '/app/records', color: 'text-secondary', bg: 'bg-secondary/20', border: 'border-secondary/20' },
        { name: 'Rx', icon: Pill, href: '/app/medicines', color: 'text-rose-400', bg: 'bg-rose-400/20', border: 'border-rose-400/20' },
    ];

    const healthTips = [
        { icon: '💧', tip: 'Hydration Goal: 2L remaining today' },
        { icon: '🏃', tip: 'Activity: 30 min walk recommended' },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    const appointments = patientFile?.appointments || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingApps = appointments.filter((app: any) =>
        app.appointment_date >= todayStr &&
        (app.appointment_status === 'confirmed' || app.appointment_status === 'pending')
    );

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    placeholder="Search symptoms, doctors..."
                    className="w-full pl-11 pr-4 h-[52px] rounded-2xl glass-panel text-[14px] font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                />
            </div>

            {/* AI Health Assistant Hero */}
            <Link href="/app/chat" className="block outline-none">
                <div className="relative overflow-hidden rounded-[28px] bg-[#040B16] p-6 border border-white/5 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {/* Glowing background elements */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/40 rounded-full blur-[40px] animate-float pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-[40px] animate-float-delayed pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-56 h-56 bg-primary/20 rounded-full blur-[50px] pulse-animation" />
                    </div>

                    {/* Shooting Stars */}
                    <div className="night">
                        <div className="shooting_star"></div>
                        <div className="shooting_star"></div>
                        <div className="shooting_star"></div>
                        <div className="shooting_star"></div>
                        <div className="shooting_star"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">AI Assistant</span>
                        </div>
                        <h2 className="text-[22px] font-extrabold text-foreground leading-tight mb-2">
                            Your health,<br />intelligently guided.
                        </h2>
                        <p className="text-[13px] text-muted-foreground font-medium mb-5 max-w-[85%]">
                            Chat with our medical AI for instant health insights, symptom checking, and guidance.
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <div className="h-10 px-4 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center gap-2">
                                <span className="text-[13px] font-bold text-primary">Start Chat</span>
                                <ArrowRight className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action) => (
                    <Link key={action.name} href={action.href} className="flex flex-col items-center gap-2 group">
                        <div className={`h-[60px] w-[60px] rounded-[20px] glass-panel ${action.bg} ${action.border} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(0,255,255,0.2)] group-active:scale-95`}>
                            <action.icon className={`h-[24px] w-[24px] ${action.color}`} strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">{action.name}</span>
                    </Link>
                ))}
            </div>

            {/* Upcoming Appointment */}
            {upcomingApps.length > 0 && (
                <div className="rounded-[24px] glass-card p-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[18px] bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(0,255,255,0.1)]">
                        <Calendar className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">Upcoming Visit</p>
                        <p className="text-[14px] font-bold text-foreground truncate mt-0.5">
                            {upcomingApps[0].appointment_date}
                        </p>
                        <p className="text-[12px] font-medium text-muted-foreground truncate">
                            {upcomingApps[0].appointment_time}
                        </p>
                    </div>
                    <Link href="/app/appointments" className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20 hover:bg-secondary/30 transition-colors">
                        <ChevronRight className="h-5 w-5 text-secondary" />
                    </Link>
                </div>
            )}

            {/* Health at a Glance */}
            <div>
                <SectionHeader title="Health at a Glance" />
                <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="glass-card rounded-[22px] p-4 flex flex-col justify-between h-[110px]">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 text-rose-400" />
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Heart</span>
                        </div>
                        <div>
                            <p className="text-[24px] font-extrabold text-foreground">72</p>
                            <p className="text-[12px] text-muted-foreground font-medium">bpm · Resting</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-[22px] p-4 flex flex-col justify-between h-[110px]">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Steps</span>
                        </div>
                        <div>
                            <p className="text-[24px] font-extrabold text-foreground">6,430</p>
                            <p className="text-[12px] text-muted-foreground font-medium">Daily Goal: 10k</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div>
                <SectionHeader title="Recommendations" />
                <div className="space-y-3 mt-1">
                    {healthTips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-4 glass-card rounded-[20px] px-4 py-3.5">
                            <div className="h-10 w-10 rounded-xl bg-background border border-white/5 flex items-center justify-center shrink-0 text-lg">
                                {tip.icon}
                            </div>
                            <p className="text-[13px] font-semibold text-foreground">{tip.tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-6" />
        </div>
    );
}
