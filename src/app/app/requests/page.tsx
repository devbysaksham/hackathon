'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import {
    Stethoscope, CheckCircle2, XCircle, Clock, ShieldCheck,
    ShieldX, Loader2, Users, AlertCircle, Building2, RotateCcw
} from 'lucide-react';

type DoctorRequest = {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    requested_at: string;
    doctor_id: string;
    doctor_name: string;
    specialization: string;
    doctor_email: string;
    doctor_phone: string;
    avatar_url?: string;
    hospital_name?: string;
};

export default function DoctorRequestsPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [requests, setRequests] = useState<DoctorRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !user) { router.push('/login'); return; }
        if (user.role !== 'patient') { router.push('/app/home'); return; }
        loadRequests();
    }, [token, user]);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const res = await API.get('/doctor-access/incoming-requests');
            setRequests(res.data.data || []);
        } catch (e) {
            toast.error('Failed to load requests');
        } finally {
            setIsLoading(false);
        }
    };

    const respond = async (requestId: string, action: 'accept' | 'reject') => {
        setRespondingTo(requestId);
        try {
            const res = await API.put(`/doctor-access/respond/${requestId}`, { action });
            toast.success(res.data.message);
            setRequests(prev => prev.map(r =>
                r.id === requestId
                    ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' }
                    : r
            ));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to respond.');
        } finally {
            setRespondingTo(null);
        }
    };

    const revoke = async (requestId: string) => {
        setRespondingTo(requestId);
        try {
            const res = await API.put(`/doctor-access/revoke/${requestId}`);
            toast.success(res.data.message);
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'rejected' } : r
            ));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revoke.');
        } finally {
            setRespondingTo(null);
        }
    };

    const pending = requests.filter(r => r.status === 'pending');
    const accepted = requests.filter(r => r.status === 'accepted');
    const rejected = requests.filter(r => r.status === 'rejected');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-4">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-primary">Privacy Controls</span>
                </div>
                <h1 className="text-[22px] font-extrabold text-foreground">Doctor Access</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage which doctors can view your medical records. You are always in full control.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending', value: pending.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                    { label: 'Granted', value: accepted.length, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                    { label: 'Rejected', value: rejected.length, color: 'text-muted-foreground', bg: 'bg-white/5', border: 'border-white/10' },
                ].map(stat => (
                    <div key={stat.label} className={`rounded-[18px] ${stat.bg} border ${stat.border} p-3 text-center`}>
                        <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-16">
                    <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-muted-foreground">No doctor requests yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Doctors from your hospital can request to view your records</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Pending */}
                    {pending.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-400 mb-3 flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Pending Requests ({pending.length})
                            </p>
                            <div className="space-y-3">
                                {pending.map(req => (
                                    <RequestCard
                                        key={req.id}
                                        req={req}
                                        respondingTo={respondingTo}
                                        onAccept={() => respond(req.id, 'accept')}
                                        onReject={() => respond(req.id, 'reject')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Accepted */}
                    {accepted.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3" /> Granted Access ({accepted.length})
                            </p>
                            <div className="space-y-3">
                                {accepted.map(req => (
                                    <div key={req.id} className="rounded-[20px] bg-green-500/5 border border-green-500/20 p-4">
                                        <DoctorInfo req={req} />
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="flex-1 flex items-center gap-2 text-xs text-green-400 font-bold">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Access Granted
                                            </div>
                                            <button
                                                onClick={() => revoke(req.id)}
                                                disabled={respondingTo === req.id}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 border border-red-400/30 rounded-xl px-3 py-1.5 hover:bg-red-400/10"
                                            >
                                                {respondingTo === req.id
                                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                                    : <RotateCcw className="h-3 w-3" />
                                                }
                                                Revoke Access
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejected */}
                    {rejected.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                <XCircle className="h-3 w-3" /> Declined ({rejected.length})
                            </p>
                            <div className="space-y-3">
                                {rejected.map(req => (
                                    <div key={req.id} className="rounded-[20px] bg-white/3 border border-white/8 p-4 opacity-70">
                                        <DoctorInfo req={req} />
                                        <div className="mt-3 text-xs text-muted-foreground font-semibold flex items-center gap-2">
                                            <ShieldX className="h-3.5 w-3.5" /> Access Declined
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DoctorInfo({ req }: { req: DoctorRequest }) {
    return (
        <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">Dr. {req.doctor_name}</p>
                <p className="text-xs text-primary font-semibold">{req.specialization}</p>
                {req.hospital_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {req.hospital_name}
                    </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                    Requested {new Date(req.requested_at).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}

function RequestCard({ req, respondingTo, onAccept, onReject }: {
    req: DoctorRequest;
    respondingTo: string | null;
    onAccept: () => void;
    onReject: () => void;
}) {
    return (
        <div className="rounded-[20px] bg-yellow-500/5 border border-yellow-500/25 p-4 space-y-4">
            <DoctorInfo req={req} />

            <div className="bg-yellow-500/10 rounded-2xl px-4 py-3 border border-yellow-500/20">
                <p className="text-xs font-semibold text-yellow-300 leading-relaxed">
                    🔐 Dr. {req.doctor_name} is requesting access to your <strong>medical records</strong> and <strong>admission history</strong>. You can revoke access at any time.
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onAccept}
                    disabled={respondingTo === req.id}
                    className="flex-1 h-10 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                    {respondingTo === req.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <CheckCircle2 className="h-3.5 w-3.5" />
                    }
                    Accept
                </button>
                <button
                    onClick={onReject}
                    disabled={respondingTo === req.id}
                    className="flex-1 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                    {respondingTo === req.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <XCircle className="h-3.5 w-3.5" />
                    }
                    Decline
                </button>
            </div>
        </div>
    );
}
