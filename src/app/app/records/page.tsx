'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import MedicalFileCard from '@/components/MedicalFileCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    FolderHeart, Loader2, FileText, ShieldCheck, Search,
    BedDouble, Hospital, Shield, User, CheckCircle2,
    Calendar, Pill, Upload, Activity, ChevronDown, ChevronUp,
    Download, Sparkles, AlertCircle, FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'ayushman' | 'mediclaim' | 'individual';
type Status = 'open' | 'closed';

interface Admission {
    id: string;
    hospital_id: string;
    hospital_name: string;
    patient_name: string;
    room_no: string;
    ward_no: string;
    bed_no?: string;
    category: Category;
    insurance_policy_no?: string;
    insurance_company?: string;
    admission_reason?: string;
    admitting_doctor?: string;
    diagnosis?: string;
    status: Status;
    admission_date: string;
    discharge_date?: string;
    days_count: number;
    dischargeSummary?: any;
}

// ─── Category Badge ───────────────────────────────────────────────────────────
const CategoryBadge = ({ cat }: { cat: Category }) => {
    const map: Record<Category, { label: string; className: string }> = {
        ayushman: { label: 'Ayushman PM-JAY', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800' },
        mediclaim: { label: 'Mediclaim TPA', className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200/60 dark:border-blue-800' },
        individual: { label: 'Self Pay', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60 dark:border-amber-800' },
    };
    const { label, className } = map[cat] || { label: cat, className: 'bg-slate-100 text-slate-600 border-slate-200' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${className}`}>{label}</span>;
};

// ─── Admission Detail Card ────────────────────────────────────────────────────
function AdmissionDetailCard({ admission }: { admission: Admission }) {
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const loadDetails = useCallback(async () => {
        if (details) return;
        setLoadingDetails(true);
        try {
            const [docsRes, detailRes] = await Promise.all([
                API.get(`/admissions/${admission.id}/documents`),
                API.get(`/admissions/${admission.id}/details`).catch(() => ({ data: { success: false, data: {} } })),
            ]);
            const detailData = detailRes.data?.data || {};
            setDetails({
                documents: docsRes.data?.data || [],
                medicines: detailData.medicines || [],
                dailyUpdates: detailData.dailyUpdates || [],
                dischargeSummary: detailData.dischargeSummary || null,
            });
        } catch {
            setDetails({ documents: [], medicines: [], dailyUpdates: [], dischargeSummary: null });
        } finally {
            setLoadingDetails(false);
        }
    }, [admission.id, details]);

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next) loadDetails();
    };

    const isActive = admission.status === 'open';

    return (
        <div className={`rounded-[24px] border overflow-hidden shadow-sm transition-all duration-300 ${
            isActive 
                ? 'border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 dark:from-slate-900 dark:to-slate-900 shadow-indigo-500/5' 
                : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900'
        }`}>
            <div className="p-5">
                {/* Hospital label & category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Hospital className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{admission.hospital_name || 'Hospital'}</span>
                    </div>
                    <CategoryBadge cat={admission.category} />
                </div>

                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isActive 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300/40' 
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {isActive ? 'In-Patient' : 'Discharged'}
                            </span>
                        </div>
                        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                            {admission.admission_reason || 'Hospital Admission'}
                        </h3>
                        {admission.diagnosis && (
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                                Diagnosis: {admission.diagnosis}
                            </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                <BedDouble className="h-3.5 w-3.5 text-indigo-500" />
                                Rm {admission.room_no} · Wd {admission.ward_no}{admission.bed_no ? ` · Bed ${admission.bed_no}` : ''}
                            </span>
                            {admission.admitting_doctor && (
                                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                    <Activity className="h-3.5 w-3.5 text-rose-500" />
                                    Dr. {admission.admitting_doctor}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center px-3.5 py-2.5 rounded-2xl shrink-0 shadow-sm ${
                        isActive 
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                        <span className="text-xl font-black leading-none">{admission.days_count}</span>
                        <span className="text-[9px] font-extrabold opacity-80 leading-none mt-1 tracking-wider uppercase">DAYS</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="h-3 w-3 text-indigo-500" />
                            Admitted: {admission.admission_date}
                        </span>
                        {admission.discharge_date && (
                            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Discharged: {admission.discharge_date}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={handleExpand} 
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition cursor-pointer"
                    >
                        {expanded ? 'Hide Details' : 'View Clinical File'}
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                    {loadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        </div>
                    ) : details ? (
                        <div className="p-4 space-y-4">
                            {/* Discharge Summary */}
                            {admission.status === 'closed' && details.dischargeSummary && (
                                <div className="bg-emerald-50/80 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200/60 dark:border-emerald-900/40">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Discharge Summary</h4>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        {details.dischargeSummary.final_diagnosis && <div><span className="text-slate-500 font-medium">Final Diagnosis: </span><span className="text-slate-800 dark:text-slate-200 font-bold">{details.dischargeSummary.final_diagnosis}</span></div>}
                                        {details.dischargeSummary.treatment_given && <div><span className="text-slate-500 font-medium">Treatment: </span><span className="text-slate-800 dark:text-slate-200">{details.dischargeSummary.treatment_given}</span></div>}
                                        {details.dischargeSummary.discharge_condition && <div><span className="text-slate-500 font-medium">Condition at Discharge: </span><span className="text-slate-800 dark:text-slate-200 font-bold capitalize">{details.dischargeSummary.discharge_condition}</span></div>}
                                        {details.dischargeSummary.follow_up_date && <div><span className="text-slate-500 font-medium">Follow-up: </span><span className="text-slate-800 dark:text-slate-200 font-bold">{details.dischargeSummary.follow_up_date}</span></div>}
                                        {details.dischargeSummary.follow_up_instructions && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30 mt-2">
                                                <p className="text-slate-500 font-semibold mb-0.5">Follow-up Instructions:</p>
                                                <p className="text-slate-700 dark:text-slate-300">{details.dischargeSummary.follow_up_instructions}</p>
                                            </div>
                                        )}
                                        {details.dischargeSummary.special_instructions && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                                                <p className="text-slate-500 font-semibold mb-0.5">Special Instructions:</p>
                                                <p className="text-slate-700 dark:text-slate-300">{details.dischargeSummary.special_instructions}</p>
                                            </div>
                                        )}
                                        {details.dischargeSummary.doctor_name && <p className="text-slate-500">Treating Doctor: <span className="text-slate-800 dark:text-slate-200 font-semibold">Dr. {details.dischargeSummary.doctor_name}</span></p>}
                                    </div>
                                </div>
                            )}

                            {/* Medicines */}
                            {details.medicines?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Pill className="h-3.5 w-3.5 text-purple-500" />
                                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">In-Patient Prescriptions ({details.medicines.length})</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {details.medicines.map((m: any) => (
                                            <div key={m.id} className="bg-purple-50/80 dark:bg-purple-950/20 rounded-xl p-3 flex items-start gap-2.5 border border-purple-100 dark:border-purple-900/40">
                                                <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                                                    <Pill className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.medicine_name}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.dosage} · {m.frequency} · {m.route}</p>
                                                    {m.instructions && <p className="text-[10px] text-slate-400 italic mt-0.5">{m.instructions}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Daily Updates */}
                            {details.dailyUpdates?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-3.5 w-3.5 text-blue-500" />
                                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">Daily Clinical Notes ({details.dailyUpdates.length} days)</h4>
                                    </div>
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {[...details.dailyUpdates].reverse().map((u: any) => {
                                            let vitals: any = {};
                                            try { vitals = JSON.parse(u.vitals || '{}'); } catch { }
                                            return (
                                                <div key={u.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">Day {u.day_number}</span>
                                                        <span className="text-[10px] font-semibold text-slate-400">{u.update_date}</span>
                                                    </div>
                                                    {(vitals.bp || vitals.temp || vitals.pulse || vitals.spo2) && (
                                                        <div className="flex gap-2 flex-wrap mb-1.5">
                                                            {vitals.bp && <span className="text-[10px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-md font-bold">❤️ {vitals.bp}</span>}
                                                            {vitals.temp && <span className="text-[10px] bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-bold">🌡️ {vitals.temp}°F</span>}
                                                            {vitals.pulse && <span className="text-[10px] bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md font-bold">💓 {vitals.pulse} bpm</span>}
                                                            {vitals.spo2 && <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md font-bold">💧 {vitals.spo2}% SpO2</span>}
                                                        </div>
                                                    )}
                                                    {u.notes && <p className="text-[11px] text-slate-600 dark:text-slate-300">{u.notes}</p>}
                                                    {u.doctor_remarks && (
                                                        <p className="text-[10px] italic text-slate-500 dark:text-slate-400 mt-1 border-l-2 border-indigo-300 dark:border-indigo-600 pl-2">
                                                            Doctor remarks: {u.doctor_remarks}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Documents */}
                            {details.documents?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Upload className="h-3.5 w-3.5 text-amber-500" />
                                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">Hospital Reports & Scans ({details.documents.length})</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {details.documents.map((d: any) => (
                                            <div key={d.id} className="bg-amber-50/80 dark:bg-amber-950/20 rounded-xl p-3 flex items-center justify-between border border-amber-200/50 dark:border-amber-900/40">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{d.document_name}</p>
                                                        <p className="text-[10px] text-slate-500 capitalize">{d.document_type} · {d.created_at?.split('T')[0]}</p>
                                                    </div>
                                                </div>
                                                {d.file_data && (
                                                    <a href={d.file_data} download={d.document_name} className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition shrink-0">
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!details.dischargeSummary && !details.medicines?.length && !details.documents?.length && !details.dailyUpdates?.length && (
                                <div className="text-center py-6 text-slate-400">
                                    <BedDouble className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-medium">No updates or clinical records posted yet for this admission.</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppRecordsPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [records, setRecords] = useState<any[]>([]);
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'admission'>('general');
    const [admissionsLoaded, setAdmissionsLoaded] = useState(false);

    useEffect(() => {
        if (!token || !user) { router.push('/login'); return; }
        loadRecords();
    }, [user, token]);

    useEffect(() => {
        if (activeTab === 'admission' && !admissionsLoaded && user) {
            loadAdmissions();
        }
    }, [activeTab]);

    const loadRecords = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setRecords(res.data.data.medicalRecords || []);
        } catch {
            toast.error('Failed to load medical records.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAdmissions = async () => {
        if (!user) return;
        setIsLoadingAdmissions(true);
        try {
            const res = await API.get(`/admissions/patient/${user.id}`);
            if (res.data.success) {
                setAdmissions(res.data.data);
                setAdmissionsLoaded(true);
            }
        } catch {
            toast.error('Failed to load admission records.');
        } finally {
            setIsLoadingAdmissions(false);
        }
    };

    const filteredRecords = records.filter((rec: any) =>
        !searchTerm ||
        (rec.diagnosis && rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rec.visit_summary && rec.visit_summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeAdmissions = admissions.filter(a => a.status === 'open');
    const pastAdmissions = admissions.filter(a => a.status === 'closed');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-indigo-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Opening secure health vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-fade-in-up">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-5 text-white shadow-xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-lg pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FolderHeart className="h-5 w-5 text-indigo-200" />
                            <span className="text-[11px] font-bold text-indigo-100/90 uppercase tracking-widest">Digital Health Vault</span>
                        </div>
                        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight">Clinical Records</h2>
                        <p className="text-xs text-indigo-100 font-medium mt-1">
                            {records.length} OPD consultations · {admissions.length} admissions
                        </p>
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-bold text-xs px-3 py-1 rounded-xl shadow-sm">
                        <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                        {records.length + admissions.length} Files
                    </Badge>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-slate-900 dark:to-slate-850 border border-blue-200/50 dark:border-blue-900/40 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-300">ABDM & HIPAA Compliant Security</p>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-400 font-medium">All discharge summaries and diagnostic scans are encrypted and linked to your ABHA profile.</p>
                </div>
            </div>

            {/* Tabs Filter */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                {(['general', 'admission'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === tab 
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        <span>{tab === 'general' ? 'OPD Consultations' : 'Hospital Admissions'}</span>
                        {tab === 'general' && records.length > 0 && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-extrabold">
                                {records.length}
                            </span>
                        )}
                        {tab === 'admission' && admissionsLoaded && admissions.length > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                                activeAdmissions.length > 0 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                                {admissions.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* General Records Tab */}
            {activeTab === 'general' && (
                <div className="space-y-4">
                    {records.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by diagnosis or doctor advice..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 shadow-sm font-medium"
                            />
                        </div>
                    )}
                    {filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                                <FolderHeart className="h-8 w-8 text-indigo-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                                {searchTerm ? 'No matching records found' : 'No medical records yet'}
                            </p>
                            <p className="text-xs text-slate-400 max-w-[260px]">
                                {searchTerm ? 'Try adjusting your search criteria.' : 'Your clinical prescriptions and notes will appear here right after your consultation.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1">
                            {filteredRecords.map((rec: any) => (
                                <MedicalFileCard key={rec.id} record={rec} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Admission Records Tab */}
            {activeTab === 'admission' && (
                <div className="space-y-4">
                    {isLoadingAdmissions ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                            </div>
                            <p className="text-xs font-semibold text-slate-500">Retrieving inpatient files...</p>
                        </div>
                    ) : admissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
                                <BedDouble className="h-8 w-8 text-indigo-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">No Inpatient Admissions</p>
                            <p className="text-xs text-slate-400 max-w-[260px]">
                                Hospital admissions, bed allocation, daily round updates and discharge summaries will display here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeAdmissions.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                            Currently Admitted ({activeAdmissions.length})
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {activeAdmissions.map(a => <AdmissionDetailCard key={a.id} admission={a} />)}
                                    </div>
                                </div>
                            )}
                            {pastAdmissions.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                                        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Past Hospitalizations ({pastAdmissions.length})
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {pastAdmissions.map(a => <AdmissionDetailCard key={a.id} admission={a} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
