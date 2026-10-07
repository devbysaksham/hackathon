'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import {
    ArrowLeft, User, FileText, Building2, Loader2,
    HeartPulse, Stethoscope, Calendar, ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';

type PatientRecords = {
    patient: {
        id: string; name: string; email: string; age: number;
        gender: string; phone: string; address: string; emergency_contact: string;
    };
    records: any[];
    admissions: any[];
};

export default function DoctorPatientRecordsPage() {
    const router = useRouter();
    const params = useParams();
    const { user, token } = useAppStore();
    const [data, setData] = useState<PatientRecords | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'records' | 'admissions'>('records');
    const patientId = params.id as string;

    useEffect(() => {
        if (!token) { router.push('/doctor/login'); return; }
        if (user && user.role !== 'doctor') { router.push('/doctor/login'); return; }
        loadRecords();
    }, [token, user, patientId]);

    const loadRecords = async () => {
        setIsLoading(true);
        try {
            const res = await API.get(`/doctor-access/patient/${patientId}/records`);
            setData(res.data.data);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to load records.';
            alert(msg);
            router.push('/doctor/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#03111F] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground font-semibold">Loading patient records...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;
    const { patient, records, admissions } = data;

    return (
        <div className="min-h-screen bg-[#03111F] text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#040E1A]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <Link
                    href="/doctor/dashboard"
                    className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Patient Records</p>
                    <h1 className="text-base font-extrabold text-foreground">{patient.name}</h1>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Patient Info Card */}
                <div className="rounded-[24px] bg-[#060F1C] border border-white/8 p-5">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <span className="text-2xl font-extrabold text-primary">{patient.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-extrabold text-lg text-foreground">{patient.name}</h2>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {[
                                    { label: 'Age', value: `${patient.age}y` },
                                    { label: 'Gender', value: patient.gender },
                                    { label: 'Phone', value: patient.phone },
                                ].map(item => (
                                    <div key={item.label} className="bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                        <p className="text-xs font-bold text-foreground mt-0.5">{item.value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                            {patient.emergency_contact && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    🚨 Emergency: <span className="text-foreground font-semibold">{patient.emergency_contact}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] bg-primary/10 border border-primary/20 p-4 text-center">
                        <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-extrabold text-foreground">{records.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Medical Records</p>
                    </div>
                    <div className="rounded-[20px] bg-accent/10 border border-accent/20 p-4 text-center">
                        <Building2 className="h-5 w-5 text-accent mx-auto mb-1" />
                        <p className="text-2xl font-extrabold text-foreground">{admissions.length}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admissions</p>
                    </div>
                </div>

                {/* Tab Nav */}
                <div className="flex gap-2 bg-white/5 rounded-2xl p-1.5">
                    {[
                        { id: 'records', label: 'Medical Records', icon: ClipboardList },
                        { id: 'admissions', label: 'Admissions', icon: Building2 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(0,255,255,0.3)]'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Medical Records ──────────────────────────────── */}
                {activeTab === 'records' && (
                    <div className="space-y-3">
                        {records.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-muted-foreground font-semibold">No medical records found</p>
                            </div>
                        ) : records.map(record => (
                            <div key={record.id} className="rounded-[20px] bg-white/3 border border-white/8 overflow-hidden">
                                <button
                                    className="w-full flex items-center gap-4 p-4 text-left"
                                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                                >
                                    <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
                                        <HeartPulse className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground text-sm">{record.diagnosis || 'No diagnosis recorded'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Dr. {record.doctor_name || 'Unknown'} · {new Date(record.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {expandedRecord === record.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                                </button>

                                {expandedRecord === record.id && (
                                    <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3">
                                        {[
                                            { label: 'Symptoms', value: record.symptoms },
                                            { label: 'Diagnosis', value: record.diagnosis },
                                            { label: 'Doctor Notes', value: record.doctor_notes },
                                            { label: 'Visit Summary', value: record.visit_summary },
                                            { label: 'Follow-up Advice', value: record.follow_up_advice },
                                        ].map(item => item.value && (
                                            <div key={item.label}>
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                                                <p className="text-sm text-foreground font-medium">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Admissions ───────────────────────────────────── */}
                {activeTab === 'admissions' && (
                    <div className="space-y-3">
                        {admissions.length === 0 ? (
                            <div className="text-center py-12">
                                <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-muted-foreground font-semibold">No admissions found</p>
                            </div>
                        ) : admissions.map(admission => (
                            <div key={admission.id} className="rounded-[20px] bg-white/3 border border-white/8 p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/20 flex items-center justify-center shrink-0">
                                        <Building2 className="h-4 w-4 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-foreground text-sm">{admission.hospital_name || 'Hospital'}</p>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                                admission.status === 'open'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : 'bg-muted/30 text-muted-foreground border-white/10'
                                            }`}>
                                                {admission.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Admitted: {new Date(admission.admission_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { l: 'Ward', v: admission.ward_no },
                                        { l: 'Room', v: admission.room_no },
                                        { l: 'Bed', v: admission.bed_no },
                                    ].map(item => (
                                        <div key={item.l} className="bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.l}</p>
                                            <p className="text-xs font-bold text-foreground mt-0.5">{item.v || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                {(admission.admission_reason || admission.diagnosis) && (
                                    <div className="bg-white/3 rounded-xl p-3 space-y-1">
                                        {admission.admission_reason && (
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Reason</p>
                                                <p className="text-xs text-foreground font-medium">{admission.admission_reason}</p>
                                            </div>
                                        )}
                                        {admission.diagnosis && (
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Diagnosis</p>
                                                <p className="text-xs text-foreground font-medium">{admission.diagnosis}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-8" />
            </div>
        </div>
    );
}
