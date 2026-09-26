'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import MedicalFileCard from '@/components/MedicalFileCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FolderHeart, Loader2, FileText, ShieldCheck, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AppRecordsPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'admission'>('general');

    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
            return;
        }
        loadRecords();
    }, [user, token]);

    const loadRecords = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setRecords(res.data.data.medicalRecords || []);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load medical records.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRecords = records.filter((rec: any) =>
        !searchTerm || 
        (rec.diagnosis && rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rec.visit_summary && rec.visit_summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-purple-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-purple-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Loading medical records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-6">
            {/* Gradient Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-600 p-5 text-white shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <FolderHeart className="h-5 w-5 text-white/80" />
                                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Digital Health Vault</span>
                            </div>
                            <h2 className="text-xl font-bold">Medical Records</h2>
                            <p className="text-xs text-white/70 mt-1">{records.length} documents securely stored</p>
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 font-semibold text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {records.length}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Security notice */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/80 py-0 rounded-2xl shadow-sm">
                <CardContent className="flex items-center gap-3 p-3.5">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-800 mb-0.5">End-to-End Encrypted</p>
                        <p className="text-[11px] text-blue-600/80">
                            Your records are encrypted and securely stored. Only you and authorized doctors can access them.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Record Types */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 mt-2">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'general' 
                        ? 'bg-white text-purple-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    General Record
                </button>
                <button 
                    onClick={() => setActiveTab('admission')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === 'admission' 
                        ? 'bg-white text-purple-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                    Admission Record
                </button>
            </div>

            {activeTab === 'general' && (
                <>
                    {/* Search bar */}
                    {records.length > 0 && (
                        <div className="relative mb-4">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by diagnosis or summary..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 shadow-sm transition-all"
                            />
                        </div>
                    )}

                    {/* Records list */}
                    {filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center mb-4 shadow-sm">
                                <FolderHeart className="h-9 w-9 text-purple-300" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mb-1">
                                {searchTerm ? 'No matching records' : 'No medical records yet'}
                            </p>
                            <p className="text-xs text-slate-400 max-w-[260px]">
                                {searchTerm 
                                    ? 'Try a different search term to find your records.'
                                    : 'Your medical records will appear here once your doctor saves visit reports or uploads scanned documents.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            {filteredRecords.map((rec: any) => (
                                <MedicalFileCard key={rec.id} record={rec} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'admission' && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mb-4 shadow-sm">
                        <FileText className="h-9 w-9 text-indigo-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                        Admission Records
                    </p>
                    <p className="text-xs text-slate-400 max-w-[260px]">
                        The admission module is currently being built. Any future admission records will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
