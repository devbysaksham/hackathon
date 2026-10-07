'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import {
    User, Mail, Phone, Shield, LogOut, ChevronRight,
    Bell, Moon, HelpCircle, FileText, Heart, ShieldCheck,
    Crown, Sparkles, MapPin, AlertCircle, QrCode, Activity,
    Calendar, Lock, CheckCircle2, Award
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AppProfilePage() {
    const router = useRouter();
    const { user, logout } = useAppStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully.');
        router.push('/login');
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    };

    const diceBearAvatar = user?.name 
        ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=e0e7ff,c7d2fe`
        : undefined;

    const menuSections = [
        {
            title: 'Personal Health Passport',
            items: [
                {
                    icon: User,
                    label: 'Personal Information',
                    desc: 'Manage name, contact & emergency details',
                    badge: 'Verified',
                    badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
                    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
                    action: () => toast.info('Profile details are synchronized with your hospital registration.')
                },
                {
                    icon: ShieldCheck,
                    label: 'ABHA / Health ID',
                    desc: 'National Ayushman Bharat Health Account',
                    badge: 'Linked',
                    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
                    color: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
                    action: () => toast.info('Your ABHA ID is linked with SwasthSetu Cloud.')
                },
                {
                    icon: Heart,
                    label: 'Emergency & Allergies',
                    desc: 'Emergency contact: ' + (user?.emergency_contact || 'None registered'),
                    color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
                    action: () => toast.info('Allergy and emergency data is shared with attending doctors.')
                },
            ]
        },
        {
            title: 'Preferences & Security',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications & Reminders',
                    desc: 'Dosage alerts & appointment updates',
                    color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                    action: () => {
                        setNotificationsEnabled(!notificationsEnabled);
                        toast.success(notificationsEnabled ? 'Notifications muted' : 'Notifications enabled');
                    }
                },
                {
                    icon: Shield,
                    label: 'Privacy & Security',
                    desc: 'End-to-end encrypted medical files',
                    badge: 'AES-256',
                    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
                    action: () => toast.info('Your health vault is secured with end-to-end encryption.')
                },
            ]
        },
        {
            title: 'Support & Compliance',
            items: [
                {
                    icon: HelpCircle,
                    label: '24/7 Patient Support',
                    desc: 'Get immediate help or report issues',
                    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
                    action: () => toast.info('For emergency assistance, call 108 or contact hospital helpdesk.')
                },
                {
                    icon: FileText,
                    label: 'Terms & Clinical Policies',
                    desc: 'HIPAA & Ayushman Bharat compliance',
                    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                    action: () => toast.info('SwasthSetu is compliant with ABDM standards.')
                },
            ]
        }
    ];

    return (
        <div className="space-y-5 pb-8 animate-fade-in-up">
            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 shadow-xl shadow-indigo-500/20 text-white p-6">
                {/* Ambient glow decorative circles */}
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-[3px] border-white/30 shadow-xl ring-4 ring-white/10 bg-white/10 backdrop-blur-md">
                                <AvatarImage src={diceBearAvatar} alt={user?.name || 'User'} />
                                <AvatarFallback className="bg-white/20 backdrop-blur-md text-white text-2xl font-black">
                                    {getInitials(user?.name || 'User')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-white" />
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-white leading-tight truncate">
                                    {user?.name || 'Guest Patient'}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 uppercase tracking-wider">
                                    <Crown className="h-3 w-3 text-amber-300" />
                                    {user?.role || 'Patient'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Active ID
                                </span>
                            </div>
                            <p className="text-[11px] text-white/75 truncate mt-1">
                                {user?.email || 'No email attached'}
                            </p>
                        </div>
                    </div>

                    {/* Vitals Summary Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                            <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">Gender / Age</p>
                            <p className="text-xs font-black text-white mt-0.5">
                                {user?.gender || 'N/A'} {user?.age ? `· ${user.age}y` : ''}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                            <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">Health Score</p>
                            <p className="text-xs font-black text-emerald-300 mt-0.5">94 / 100</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10">
                            <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">Status</p>
                            <p className="text-xs font-black text-white mt-0.5">Healthy</p>
                        </div>
                    </div>

                    {/* Contact Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {user?.phone && (
                            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-xl px-2.5 py-1 text-[11px] text-white/90 border border-white/10">
                                <Phone className="h-3 w-3 text-indigo-300" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        {user?.address && (
                            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-xl px-2.5 py-1 text-[11px] text-white/90 border border-white/10 truncate max-w-[240px]">
                                <MapPin className="h-3 w-3 text-indigo-300 shrink-0" />
                                <span className="truncate">{user.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Digital Health ID Card */}
            <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-teal-200/60 dark:border-slate-700/60 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                        <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                                Swasthya QR Code
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                                Ready to Scan
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Show this at hospital reception for express registration
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toast.success('Digital QR ready. Tap receptionist kiosk to sync.')}
                    className="shrink-0 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100/50 rounded-xl"
                >
                    View QR
                </Button>
            </div>

            {/* Menu Sections */}
            {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                    <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
                        {section.title}
                    </h3>
                    <div className="bg-white dark:bg-slate-900 rounded-[22px] overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {section.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left cursor-pointer active:scale-[0.99]"
                            >
                                <div className={`h-10 w-10 rounded-[14px] ${item.color} flex items-center justify-center shrink-0`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                                        {item.badge && (
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.desc}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Logout Button */}
            <div className="pt-2">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 rounded-[18px] h-12 font-bold text-sm cursor-pointer shadow-sm transition-all active:scale-[0.98]"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out of SwasthSetu
                </Button>
            </div>

            {/* Version & Certifications */}
            <div className="text-center pt-2 space-y-1">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>ABDM Compliant · ISO 27001 Certified</span>
                </div>
                <p className="text-[10px] text-slate-400">
                    SwasthSetu Patient Portal v2.4.0
                </p>
            </div>
        </div>
    );
}
