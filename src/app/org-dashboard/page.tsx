'use client';
import React, { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Building2, Activity, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function OrgDashboardPage() {
    const { user } = useAppStore();
    const [hospitals, setHospitals] = useState<any[]>([]);

    useEffect(() => {
        API.get('/hospitals').then(res => {
            if (res.data.success) {
                setHospitals(res.data.data);
            }
        });
    }, []);

    const govtCount = hospitals.filter(h => h.category === 'govt').length;
    const privateCount = hospitals.filter(h => h.category === 'private').length;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name}</h1>
                <p className="text-slate-500 mt-1">Manage all affiliated hospitals across the network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Hospitals</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{hospitals.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Govt Hospitals</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{govtCount}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Private Hospitals</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{privateCount}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Start</h2>
                <p className="text-slate-500 mb-4">Head over to the Hospitals tab to register a new hospital. Once registered, the hospital admin can log in to their dashboard to manage doctors and appointments.</p>
            </div>
        </div>
    );
}
