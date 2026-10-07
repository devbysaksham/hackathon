'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function OrgSidebar() {
    const pathname = usePathname();
    const { logout } = useAppStore();

    const menuItems = [
        { href: '/org-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/org-dashboard/hospitals', icon: Building2, label: 'Hospitals' },
        { href: '/org-dashboard/patients', icon: Users, label: 'Patients' },
        { href: '/org-dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
                    <Building2 className="h-6 w-6" />
                    <span>SwasthSetu Org</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${active ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}>
                            <Icon className={`h-5 w-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
