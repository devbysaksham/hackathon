'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import {
    Stethoscope, Search, Users, Clock, CheckCircle2, XCircle,
    LogOut, ChevronRight, Loader2, UserSearch, AlertCircle, Send
} from 'lucide-react';

type PatientSearchResult = {
    id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phone: string;
    accessStatus: 'pending' | 'accepted' | 'rejected' | null;
};

type AccessRequest = {
    id: string;
    status: string;
    patient_id: string;
    patient_name: string;
    patient_email: string;
    age: number;
    gender: string;
    phone: string;
    requested_at: string;
};

export default function DoctorDashboard() {
    const router = useRouter();
    const { user, token, logout } = useAppStore();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'patients' | 'requests'>('search');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [myPatients, setMyPatients] = useState<any[]>([]);
    const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sendingRequest, setSendingRequest] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        if (!token) { router.push('/doctor/login'); return; }
        if (user && user.role !== 'doctor') { router.push('/doctor/login'); return; }
        loadMyPatients();
        loadMyRequests();
    }, [token, user]);

    const loadMyPatients = async () => {
        try {
            const res = await API.get('/doctor-access/my-patients');
            setMyPatients(res.data.data || []);
        } catch (e) { /* silent */ }
    };

    const loadMyRequests = async () => {
        try {
            const res = await API.get('/doctor-access/my-requests');
            setMyRequests(res.data.data || []);
        } catch (e) { /* silent */ }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length < 2) {
            toast.error('Enter at least 2 characters to search.');
            return;
        }
        setIsSearching(true);
        try {
            const res = await API.get(`/doctor-access/search-patients?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data.data || []);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Search failed.');
        } finally {
            setIsSearching(false);
        }
    };

    const sendRequest = async (patientId: string) => {
        setSendingRequest(patientId);
        try {
            const res = await API.post(`/doctor-access/request/${patientId}`);
            toast.success(res.data.message);
            // Update local result
            setSearchResults(prev => prev.map(p =>
                p.id === patientId ? { ...p, accessStatus: 'pending' } : p
            ));
            loadMyRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send request.');
        } finally {
            setSendingRequest(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/doctor/login');
    };

    const pendingRequests = myRequests.filter(r => r.status === 'pending');
    const acceptedRequests = myRequests.filter(r => r.status === 'accepted');
    const rejectedRequests = myRequests.filter(r => r.status === 'rejected');

    const statusBadge = (status: string | null) => {
        if (!status) return null;
        const styles: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || ''} uppercase tracking-wider`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#03111F] text-foreground">
            {/* Fixed Header */}
            <header className="sticky top-0 z-40 bg-[#040E1A]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Doctor Portal</p>
                        <h1 className="text-base font-extrabold text-foreground leading-tight">
                            {mounted ? `Dr. ${user?.name || ''}` : 'Loading...'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {mounted && user?.specialization && (
                        <span className="hidden sm:block text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                            {user.specialization}
                        </span>
                    )}
                    <button
                        onClick={handleLogout}
                        className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Accepted Patients', value: myPatients.length, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                        { label: 'Pending Requests', value: pendingRequests.length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                        { label: 'Total Requests', value: myRequests.length, icon: Send, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    ].map((stat) => (
                        <div key={stat.label} className={`rounded-[20px] ${stat.bg} border ${stat.border} p-4`}>
                            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                            <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Nav */}
                <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { id: 'search', label: 'Search Patients', icon: UserSearch },
                        { id: 'patients', label: 'My Patients', icon: Users },
                        { id: 'requests', label: 'Requests', icon: Clock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(0,255,255,0.3)]'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ─── TAB: Search Patients ─────────────────────────── */}
                {activeTab === 'search' && (
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by patient name or email..."
                                    className="w-full h-[52px] pl-11 pr-4 rounded-2xl bg-white/5 border border-white/8 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="h-[52px] px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2 shadow-[0_0_16px_rgba(0,255,255,0.25)]"
                            >
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Search
                            </button>
                        </form>

                        {searchResults.length === 0 && !isSearching && (
                            <div className="text-center py-16">
                                <UserSearch className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-muted-foreground font-semibold">Search for registered patients</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Enter a name or email to find patients</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {searchResults.map(patient => (
                                <div key={patient.id} className="rounded-[20px] bg-white/3 border border-white/8 p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
                                        <span className="text-lg font-bold text-primary">
                                            {patient.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-foreground text-sm">{patient.name}</p>
                                            {statusBadge(patient.accessStatus)}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{patient.email}</p>
                                        <p className="text-xs text-muted-foreground">{patient.age}y · {patient.gender} · {patient.phone}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {patient.accessStatus === 'accepted' ? (
                                            <Link
                                                href={`/doctor/patients/${patient.id}`}
                                                className="h-9 px-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-1.5 hover:bg-green-500/30 transition-colors"
                                            >
                                                View Records <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        ) : patient.accessStatus === 'pending' ? (
                                            <span className="h-9 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" /> Pending
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => sendRequest(patient.id)}
                                                disabled={sendingRequest === patient.id}
                                                className="h-9 px-4 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary/30 transition-colors disabled:opacity-60"
                                            >
                                                {sendingRequest === patient.id
                                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                                    : <Send className="h-3 w-3" />
                                                }
                                                {patient.accessStatus === 'rejected' ? 'Re-Request' : 'Request Access'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── TAB: My Patients ─────────────────────────────── */}
                {activeTab === 'patients' && (
                    <div className="space-y-3">
                        {myPatients.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-muted-foreground font-semibold">No accepted patients yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Send access requests to patients from the search tab</p>
                            </div>
                        ) : (
                            myPatients.map(patient => (
                                <div key={patient.id} className="rounded-[20px] bg-white/3 border border-white/8 p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-green-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground text-sm">{patient.name}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{patient.email}</p>
                                        <p className="text-xs text-muted-foreground">{patient.age}y · {patient.gender}</p>
                                    </div>
                                    <Link
                                        href={`/doctor/patients/${patient.id}`}
                                        className="h-9 px-4 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary/30 transition-colors shrink-0"
                                    >
                                        Records <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ─── TAB: Requests ────────────────────────────────── */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        {myRequests.length === 0 ? (
                            <div className="text-center py-16">
                                <AlertCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-muted-foreground font-semibold">No requests sent yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Search for patients and send access requests</p>
                            </div>
                        ) : (
                            myRequests.map(req => (
                                <div key={req.id} className="rounded-[20px] bg-white/3 border border-white/8 p-4 flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        req.status === 'accepted' ? 'bg-green-500/20' : req.status === 'rejected' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                                    }`}>
                                        {req.status === 'accepted' ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                                            : req.status === 'rejected' ? <XCircle className="h-5 w-5 text-red-400" />
                                            : <Clock className="h-5 w-5 text-yellow-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-foreground text-sm">{req.patient_name}</p>
                                            {statusBadge(req.status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{req.patient_email}</p>
                                        <p className="text-xs text-muted-foreground">Requested: {new Date(req.requested_at).toLocaleDateString()}</p>
                                    </div>
                                    {req.status === 'accepted' && (
                                        <Link
                                            href={`/doctor/patients/${req.patient_id}`}
                                            className="h-9 px-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-1 hover:bg-green-500/30 transition-colors shrink-0"
                                        >
                                            View <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
