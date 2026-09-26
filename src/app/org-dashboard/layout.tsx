'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import OrgSidebar from '@/components/OrgSidebar';

export default function OrgDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, token } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (!token || user?.role !== 'org_admin') {
            router.push('/login');
        }
    }, [user, token, router]);

    if (!user || user.role !== 'org_admin') {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <OrgSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
