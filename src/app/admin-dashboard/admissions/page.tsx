'use client';

import React, { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import {
    BedDouble, Plus, Search, Filter, ChevronRight, Clock, X,
    User, Phone, MapPin, Shield, Upload, Pill, FileText,
    Activity, Calendar, AlertCircle, CheckCircle2,
    Loader2, Heart, Thermometer, Wind, Droplets,
    ChevronDown, Trash2, Download, Eye, Hospital, ClipboardList
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Category = 'ayushman' | 'mediclaim' | 'individual';
type Status = 'open' | 'closed';
type DocType = 'report' | 'xray' | 'insurance' | 'other';

interface Admission {
    id: string;
    patient_id: string;
    hospital_id: string;
    patient_name: string;
    patient_age: number;
    patient_gender: string;
    patient_phone: string;
    patient_address: string;
    emergency_contact: string;
    room_no: string;
    ward_no: string;
    bed_no: string;
    category: Category;
    insurance_policy_no: string;
    insurance_company: string;
    admission_reason: string;
    admitting_doctor: string;
    diagnosis: string;
    status: Status;
    admission_date: string;
    discharge_date: string;
    days_count: number;
    hospital_name: string;
    dailyUpdates?: any[];
    documents?: any[];
    medicines?: any[];
    dischargeSummary?: any;
}

// ─── BADGE COMPONENT ──────────────────────────────────────────────────────────
const CategoryBadge = ({ cat }: { cat: Category }) => {
    const map: Record<Category, { label: string; className: string }> = {
        ayushman: { label: 'Ayushman', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        mediclaim: { label: 'Mediclaim', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
        individual: { label: 'Individual', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    };
    const { label, className } = map[cat] || { label: cat, className: 'bg-slate-100 text-slate-600' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>{label}</span>;
};

const StatusBadge = ({ status }: { status: Status }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status === 'open'
        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
        {status === 'open' ? 'Active' : 'Discharged'}
    </span>
);

// ─── MODAL INPUT FIELD ────────────────────────────────────────────────────────
const ModalInputField = ({ label, name, type = 'text', required = false, placeholder = '', form, setForm }: any) => (
    <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <input
            type={type}
            value={form[name] || ''}
            onChange={e => setForm((f: any) => ({ ...f, [name]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
    </div>
);

// ─── ADMIT PATIENT MODAL ──────────────────────────────────────────────────────
function AdmitModal({ onClose, onSuccess, patients }: { onClose: () => void; onSuccess: () => void; patients: any[] }) {
    const [form, setForm] = useState({
        patientId: '', patientName: '', patientAge: '', patientGender: 'male',
        patientPhone: '', patientAddress: '', emergencyContact: '',
        roomNo: '', wardNo: '', bedNo: '',
        category: 'individual' as Category, insurancePolicyNo: '', insuranceCompany: '',
        admissionReason: '', admittingDoctor: '', diagnosis: '',
    });
    const [loading, setLoading] = useState(false);
    const [searchPatient, setSearchPatient] = useState('');
    const [patientMode, setPatientMode] = useState<'search' | 'manual'>('search');

    const handlePatientSelect = (p: any) => {
        setForm(f => ({
            ...f,
            patientId: p.id,
            patientName: p.name,
            patientAge: String(p.age || ''),
            patientGender: p.gender || 'male',
            patientPhone: p.phone || '',
            patientAddress: p.address || '',
            emergencyContact: p.emergency_contact || '',
        }));
        setSearchPatient(p.name);
    };

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
        (p.phone || '').includes(searchPatient)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.patientName || !form.roomNo || !form.wardNo || !form.category) {
            toast.error('Please fill all required fields.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/admissions', {
                ...form,
                patientAge: form.patientAge ? Number(form.patientAge) : undefined,
            });
            toast.success('Patient admitted successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to admit patient.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <BedDouble className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admit New Patient</h2>
                            <p className="text-xs text-slate-500">Fill in the patient and room details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Selection */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Patient Details</h3>
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                                {(['search', 'manual'] as const).map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setPatientMode(m)}
                                        className={`px-3 py-1.5 font-medium transition ${patientMode === m ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        {m === 'search' ? 'Search Existing' : 'Manual Entry'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {patientMode === 'search' && (
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchPatient}
                                        onChange={e => setSearchPatient(e.target.value)}
                                        placeholder="Search by name or phone..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {searchPatient && filtered.length > 0 && (
                                    <div className="mt-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg">
                                        {filtered.slice(0, 5).map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => { handlePatientSelect(p); setSearchPatient(p.name); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition border-b border-slate-100 dark:border-slate-800 last:border-0"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                                                    {p.name[0].toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-slate-800 dark:text-white">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.phone} · {p.gender}, {p.age}y</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ModalInputField form={form} setForm={setForm} label="Full Name" name="patientName" required placeholder="Patient full name" />
                            <ModalInputField form={form} setForm={setForm} label="Age" name="patientAge" type="number" placeholder="Age in years" />
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender</label>
                                <select
                                    value={form.patientGender}
                                    onChange={e => setForm(f => ({ ...f, patientGender: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <ModalInputField form={form} setForm={setForm} label="Phone" name="patientPhone" placeholder="+91 XXXXX XXXXX" />
                            <ModalInputField form={form} setForm={setForm} label="Address" name="patientAddress" placeholder="Full address" />
                            <ModalInputField form={form} setForm={setForm} label="Emergency Contact" name="emergencyContact" placeholder="Name - Phone" />
                        </div>
                    </section>

                    <div className="border-t border-slate-200 dark:border-slate-800" />

                    {/* Room & Ward */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">Room & Ward Allocation</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <ModalInputField form={form} setForm={setForm} label="Room No." name="roomNo" required placeholder="e.g. 204" />
                            <ModalInputField form={form} setForm={setForm} label="Ward No." name="wardNo" required placeholder="e.g. Ward A" />
                            <ModalInputField form={form} setForm={setForm} label="Bed No." name="bedNo" placeholder="e.g. B-12" />
                        </div>
                    </section>

                    <div className="border-t border-slate-200 dark:border-slate-800" />

                    {/* Category */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">Payment Category</h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {(['ayushman', 'mediclaim', 'individual'] as Category[]).map(cat => {
                                const icons: Record<Category, React.ReactNode> = {
                                    ayushman: <Shield className="h-5 w-5" />,
                                    mediclaim: <FileText className="h-5 w-5" />,
                                    individual: <User className="h-5 w-5" />,
                                };
                                const labels: Record<Category, string> = {
                                    ayushman: 'Ayushman Bharat',
                                    mediclaim: 'Mediclaim',
                                    individual: 'Individual / Self',
                                };
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition font-medium text-sm ${form.category === cat
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {icons[cat]}
                                        <span className="text-center text-xs leading-tight">{labels[cat]}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {form.category !== 'individual' && (
                            <div className="grid grid-cols-2 gap-4">
                                <ModalInputField form={form} setForm={setForm} label="Policy / Card No." name="insurancePolicyNo" placeholder="Policy number" />
                                <ModalInputField form={form} setForm={setForm} label="Insurance Company" name="insuranceCompany" placeholder="Company name" />
                            </div>
                        )}
                    </section>

                    <div className="border-t border-slate-200 dark:border-slate-800" />

                    {/* Medical Details */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">Medical Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ModalInputField form={form} setForm={setForm} label="Admitting Doctor" name="admittingDoctor" placeholder="Doctor name" />
                            <ModalInputField form={form} setForm={setForm} label="Admission Reason" name="admissionReason" placeholder="Chief complaint" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Provisional Diagnosis</label>
                            <textarea
                                value={form.diagnosis}
                                onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                                placeholder="Initial diagnosis..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </section>

                    <div className="flex items-center gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BedDouble className="h-4 w-4" />}
                            {loading ? 'Admitting...' : 'Admit Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── ADMISSION DETAIL DRAWER ──────────────────────────────────────────────────
function AdmissionDrawer({ admission: initialAdmission, onClose, onRefresh }: {
    admission: Admission;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const [admission, setAdmission] = useState<Admission & { dailyUpdates: any[]; documents: any[]; medicines: any[] }>(
        { ...initialAdmission, dailyUpdates: [], documents: [], medicines: [] }
    );
    const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'medicines' | 'documents' | 'discharge'>('overview');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Daily update form
    const [updateForm, setUpdateForm] = useState({ notes: '', doctorRemarks: '', vitals: { bp: '', temp: '', pulse: '', spo2: '' } });

    // Medicine form
    const [medForm, setMedForm] = useState({ medicineName: '', dosage: '', frequency: '', route: 'oral', instructions: '', prescribedBy: '' });

    // Document form
    const [docForm, setDocForm] = useState({ documentName: '', documentType: 'report' as DocType, fileData: '' });

    // Discharge form
    const [dischargeForm, setDischargeForm] = useState({
        finalDiagnosis: '',
        treatmentGiven: '',
        proceduresDone: '',
        dischargeCondition: 'stable',
        followUpDate: '',
        followUpInstructions: '',
        specialInstructions: '',
        doctorName: '',
    });
    const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get(`/admissions/${initialAdmission.id}/details`);
            if (res.data.success) {
                const d = res.data.data;
                setAdmission(d);
            }
        } catch { } finally {
            setLoading(false);
        }
    }, [initialAdmission.id]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setDocForm(f => ({
                ...f,
                fileData: reader.result as string,
                documentName: f.documentName || file.name,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post(`/admissions/${admission.id}/daily-update`, {
                notes: updateForm.notes,
                doctorRemarks: updateForm.doctorRemarks,
                vitals: updateForm.vitals,
            });
            toast.success('Daily update added!');
            setUpdateForm({ notes: '', doctorRemarks: '', vitals: { bp: '', temp: '', pulse: '', spo2: '' } });
            fetchDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add update.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medForm.medicineName || !medForm.dosage || !medForm.frequency) {
            toast.error('Fill in medicine name, dosage, and frequency.');
            return;
        }
        setSubmitting(true);
        try {
            await API.post(`/admissions/${admission.id}/medicines`, { ...medForm, startDate: new Date().toISOString().split('T')[0] });
            toast.success('Medicine added!');
            setMedForm({ medicineName: '', dosage: '', frequency: '', route: 'oral', instructions: '', prescribedBy: '' });
            fetchDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add medicine.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMedicine = async (medicineId: string) => {
        try {
            await API.delete(`/admissions/${admission.id}/medicines/${medicineId}`);
            toast.success('Medicine removed.');
            fetchDetails();
        } catch {
            toast.error('Failed to remove medicine.');
        }
    };

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docForm.documentName) {
            toast.error('Please enter a document name.');
            return;
        }
        setSubmitting(true);
        try {
            await API.post(`/admissions/${admission.id}/documents`, docForm);
            toast.success('Document uploaded!');
            setDocForm({ documentName: '', documentType: 'report', fileData: '' });
            fetchDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDischarge = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post(`/admissions/${admission.id}/discharge`, dischargeForm);
            toast.success('Patient discharged successfully!');
            onRefresh();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Discharge failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'updates', label: `Updates${admission.dailyUpdates?.length ? ` (${admission.dailyUpdates.length})` : ''}`, icon: ClipboardList },
        { id: 'medicines', label: `Medicines${admission.medicines?.length ? ` (${admission.medicines.length})` : ''}`, icon: Pill },
        { id: 'documents', label: `Documents${admission.documents?.length ? ` (${admission.documents.length})` : ''}`, icon: Upload },
        ...(admission.status === 'open' ? [{ id: 'discharge', label: 'Discharge', icon: CheckCircle2 }] : []),
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {admission.patient_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-base">{admission.patient_name}</h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={admission.status} />
                                <CategoryBadge cat={admission.category} />
                                <span className="text-xs text-slate-400">Rm {admission.room_no} · Wd {admission.ward_no}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{admission.days_count}</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Days</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 scrollbar-hide">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition shrink-0 ${activeTab === t.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <t.icon className="h-3.5 w-3.5" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* ── OVERVIEW ── */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    {/* Discharge summary card if closed */}
                                    {admission.status === 'closed' && admission.dischargeSummary && (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Discharge Summary</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div><span className="text-slate-500 text-xs">Final Diagnosis</span><p className="font-medium text-slate-800 dark:text-white">{admission.dischargeSummary.final_diagnosis || '—'}</p></div>
                                                <div><span className="text-slate-500 text-xs">Condition</span><p className="font-medium text-slate-800 dark:text-white capitalize">{admission.dischargeSummary.discharge_condition || '—'}</p></div>
                                                <div><span className="text-slate-500 text-xs">Follow Up Date</span><p className="font-medium text-slate-800 dark:text-white">{admission.dischargeSummary.follow_up_date || '—'}</p></div>
                                                <div><span className="text-slate-500 text-xs">Doctor</span><p className="font-medium text-slate-800 dark:text-white">{admission.dischargeSummary.doctor_name || '—'}</p></div>
                                            </div>
                                            {admission.dischargeSummary.treatment_given && (
                                                <div className="mt-3"><span className="text-slate-500 text-xs">Treatment Given</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{admission.dischargeSummary.treatment_given}</p></div>
                                            )}
                                            {admission.dischargeSummary.follow_up_instructions && (
                                                <div className="mt-3"><span className="text-slate-500 text-xs">Follow-up Instructions</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{admission.dischargeSummary.follow_up_instructions}</p></div>
                                            )}
                                        </div>
                                    )}

                                    {/* Patient info */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Patient Information</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <InfoItem icon={<User className="h-4 w-4" />} label="Age / Gender" value={`${admission.patient_age || '—'} yrs · ${admission.patient_gender || '—'}`} />
                                            <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={admission.patient_phone || '—'} />
                                            <InfoItem icon={<MapPin className="h-4 w-4" />} label="Address" value={admission.patient_address || '—'} />
                                            <InfoItem icon={<AlertCircle className="h-4 w-4" />} label="Emergency Contact" value={admission.emergency_contact || '—'} />
                                        </div>
                                    </div>

                                    {/* Admission info */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Admission Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <InfoItem icon={<BedDouble className="h-4 w-4" />} label="Room / Ward / Bed" value={`${admission.room_no} / ${admission.ward_no} / ${admission.bed_no || '—'}`} />
                                            <InfoItem icon={<Calendar className="h-4 w-4" />} label="Admitted On" value={admission.admission_date} />
                                            <InfoItem icon={<Activity className="h-4 w-4" />} label="Admitting Doctor" value={admission.admitting_doctor || '—'} />
                                            <InfoItem icon={<ClipboardList className="h-4 w-4" />} label="Admission Reason" value={admission.admission_reason || '—'} />
                                        </div>
                                        {admission.diagnosis && (
                                            <div className="mt-3">
                                                <span className="text-xs text-slate-500">Diagnosis</span>
                                                <p className="text-sm font-medium text-slate-800 dark:text-white mt-0.5">{admission.diagnosis}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Insurance info if applicable */}
                                    {admission.category !== 'individual' && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Insurance Details</h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <InfoItem icon={<Shield className="h-4 w-4" />} label="Policy No." value={admission.insurance_policy_no || '—'} />
                                                <InfoItem icon={<FileText className="h-4 w-4" />} label="Company" value={admission.insurance_company || '—'} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── DAILY UPDATES ── */}
                            {activeTab === 'updates' && (
                                <div className="space-y-4">
                                    {admission.status === 'open' && (
                                        <form onSubmit={handleAddUpdate} className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 space-y-3 border border-blue-200 dark:border-blue-800">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Add Today's Update</h3>
                                            <textarea
                                                value={updateForm.notes}
                                                onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))}
                                                placeholder="Patient condition notes..."
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {/* Vitals */}
                                            <div className="grid grid-cols-4 gap-2">
                                                {(['bp', 'temp', 'pulse', 'spo2'] as const).map(v => (
                                                    <div key={v}>
                                                        <label className="text-[10px] font-semibold text-slate-500 uppercase">{v === 'spo2' ? 'SpO2' : v.charAt(0).toUpperCase() + v.slice(1)}</label>
                                                        <input
                                                            value={updateForm.vitals[v]}
                                                            onChange={e => setUpdateForm(f => ({ ...f, vitals: { ...f.vitals, [v]: e.target.value } }))}
                                                            placeholder={v === 'bp' ? '120/80' : v === 'temp' ? '98.6' : v === 'pulse' ? '72' : '99%'}
                                                            className="w-full mt-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <textarea
                                                value={updateForm.doctorRemarks}
                                                onChange={e => setUpdateForm(f => ({ ...f, doctorRemarks: e.target.value }))}
                                                placeholder="Doctor's remarks..."
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button type="submit" disabled={submitting} className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                Add Update
                                            </button>
                                        </form>
                                    )}

                                    {/* Updates list */}
                                    {admission.dailyUpdates && admission.dailyUpdates.length > 0 ? (
                                        <div className="space-y-3">
                                            {[...admission.dailyUpdates].reverse().map((u: any) => {
                                                let vitals: any = {};
                                                try { vitals = JSON.parse(u.vitals || '{}'); } catch { }
                                                return (
                                                    <div key={u.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">Day {u.day_number}</span>
                                                            <span className="text-xs text-slate-400">{u.update_date}</span>
                                                        </div>
                                                        {(vitals.bp || vitals.temp || vitals.pulse || vitals.spo2) && (
                                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                {vitals.bp && <VitalChip icon={<Heart className="h-3 w-3" />} label="BP" value={vitals.bp} />}
                                                                {vitals.temp && <VitalChip icon={<Thermometer className="h-3 w-3" />} label="Temp" value={`${vitals.temp}°F`} />}
                                                                {vitals.pulse && <VitalChip icon={<Activity className="h-3 w-3" />} label="Pulse" value={`${vitals.pulse} bpm`} />}
                                                                {vitals.spo2 && <VitalChip icon={<Droplets className="h-3 w-3" />} label="SpO2" value={vitals.spo2} />}
                                                            </div>
                                                        )}
                                                        {u.notes && <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">{u.notes}</p>}
                                                        {u.doctor_remarks && (
                                                            <p className="text-xs italic text-slate-500 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                                                                Dr's Remarks: {u.doctor_remarks}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<ClipboardList className="h-8 w-8" />} text="No daily updates yet" />
                                    )}
                                </div>
                            )}

                            {/* ── MEDICINES ── */}
                            {activeTab === 'medicines' && (
                                <div className="space-y-4">
                                    {admission.status === 'open' && (
                                        <form onSubmit={handleAddMedicine} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 space-y-3 border border-purple-200 dark:border-purple-800">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Allot Medicine</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { name: 'medicineName', label: 'Medicine Name', placeholder: 'e.g. Amoxicillin' },
                                                    { name: 'dosage', label: 'Dosage', placeholder: 'e.g. 500mg' },
                                                    { name: 'frequency', label: 'Frequency', placeholder: 'e.g. 1-0-1, TDS' },
                                                    { name: 'prescribedBy', label: 'Prescribed By', placeholder: 'Doctor name' },
                                                ].map(f => (
                                                    <div key={f.name}>
                                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                                                        <input
                                                            value={(medForm as any)[f.name]}
                                                            onChange={e => setMedForm(fm => ({ ...fm, [f.name]: e.target.value }))}
                                                            placeholder={f.placeholder}
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Route</label>
                                                <select
                                                    value={medForm.route}
                                                    onChange={e => setMedForm(f => ({ ...f, route: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="oral">Oral</option>
                                                    <option value="IV">IV (Intravenous)</option>
                                                    <option value="IM">IM (Intramuscular)</option>
                                                    <option value="SC">SC (Subcutaneous)</option>
                                                    <option value="topical">Topical</option>
                                                    <option value="inhaled">Inhaled</option>
                                                </select>
                                            </div>
                                            <input
                                                value={medForm.instructions}
                                                onChange={e => setMedForm(f => ({ ...f, instructions: e.target.value }))}
                                                placeholder="Special instructions (optional)"
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button type="submit" disabled={submitting} className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                Add Medicine
                                            </button>
                                        </form>
                                    )}

                                    {admission.medicines && admission.medicines.length > 0 ? (
                                        <div className="space-y-2">
                                            {admission.medicines.map((m: any) => (
                                                <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                                            <Pill className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{m.medicine_name}</p>
                                                            <p className="text-xs text-slate-500">{m.dosage} · {m.frequency} · {m.route}</p>
                                                            {m.instructions && <p className="text-xs text-slate-400 italic mt-0.5">{m.instructions}</p>}
                                                            {m.prescribed_by && <p className="text-xs text-slate-400 mt-0.5">By: {m.prescribed_by}</p>}
                                                        </div>
                                                    </div>
                                                    {admission.status === 'open' && (
                                                        <button onClick={() => handleDeleteMedicine(m.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition shrink-0">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<Pill className="h-8 w-8" />} text="No medicines allotted yet" />
                                    )}
                                </div>
                            )}

                            {/* ── DOCUMENTS ── */}
                            {activeTab === 'documents' && (
                                <div className="space-y-4">
                                    {admission.status === 'open' && (
                                        <form onSubmit={handleUploadDoc} className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 space-y-3 border border-amber-200 dark:border-amber-800">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Document</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Document Name</label>
                                                    <input
                                                        value={docForm.documentName}
                                                        onChange={e => setDocForm(f => ({ ...f, documentName: e.target.value }))}
                                                        placeholder="e.g. Blood Report"
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                                                    <select
                                                        value={docForm.documentType}
                                                        onChange={e => setDocForm(f => ({ ...f, documentType: e.target.value as DocType }))}
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    >
                                                        <option value="report">Lab Report</option>
                                                        <option value="xray">X-Ray / Scan</option>
                                                        <option value="insurance">Insurance</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Upload File</label>
                                                <label className={`flex items-center justify-center gap-2 w-full h-20 rounded-xl border-2 border-dashed cursor-pointer transition ${docForm.fileData ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'}`}>
                                                    <Upload className="h-5 w-5 text-slate-400" />
                                                    <span className="text-sm text-slate-500">{docForm.fileData ? '✓ File selected' : 'Click to upload file'}</span>
                                                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                                                </label>
                                            </div>
                                            <button type="submit" disabled={submitting} className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                Upload Document
                                            </button>
                                        </form>
                                    )}

                                    {admission.documents && admission.documents.length > 0 ? (
                                        <div className="space-y-2">
                                            {admission.documents.map((d: any) => (
                                                <div key={d.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{d.document_name}</p>
                                                            <p className="text-xs text-slate-500 capitalize">{d.document_type} · {d.created_at?.split('T')[0]}</p>
                                                        </div>
                                                    </div>
                                                    {d.file_data && (
                                                        <a href={d.file_data} download={d.document_name} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 transition shrink-0">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={<FileText className="h-8 w-8" />} text="No documents uploaded yet" />
                                    )}
                                </div>
                            )}

                            {/* ── DISCHARGE ── */}
                            {activeTab === 'discharge' && admission.status === 'open' && (
                                <div className="space-y-4">
                                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className="h-5 w-5 text-rose-500" />
                                            <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Discharge Patient</h3>
                                        </div>
                                        <p className="text-xs text-rose-600 dark:text-rose-400/80">This will close the admission and generate a discharge summary. This action cannot be undone.</p>
                                    </div>

                                    {!showDischargeConfirm ? (
                                        <button onClick={() => setShowDischargeConfirm(true)} className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2 transition">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Proceed to Discharge
                                        </button>
                                    ) : (
                                        <form onSubmit={handleDischarge} className="space-y-4">
                                            <h3 className="font-bold text-slate-800 dark:text-white">Fill Discharge Summary</h3>
                                            {[
                                                { name: 'finalDiagnosis', label: 'Final Diagnosis', type: 'textarea' },
                                                { name: 'treatmentGiven', label: 'Treatment Given', type: 'textarea' },
                                                { name: 'proceduresDone', label: 'Procedures Done', type: 'textarea' },
                                                { name: 'followUpInstructions', label: 'Follow-up Instructions', type: 'textarea' },
                                                { name: 'specialInstructions', label: 'Special Instructions', type: 'textarea' },
                                                { name: 'doctorName', label: 'Treating Doctor Name', type: 'text' },
                                                { name: 'followUpDate', label: 'Follow-up Date', type: 'date' },
                                            ].map(f => (
                                                <div key={f.name}>
                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                                                    {f.type === 'textarea' ? (
                                                        <textarea
                                                            value={(dischargeForm as any)[f.name]}
                                                            onChange={e => setDischargeForm(df => ({ ...df, [f.name]: e.target.value }))}
                                                            rows={2}
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                        />
                                                    ) : (
                                                        <input
                                                            type={f.type}
                                                            value={(dischargeForm as any)[f.name]}
                                                            onChange={e => setDischargeForm(df => ({ ...df, [f.name]: e.target.value }))}
                                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Discharge Condition</label>
                                                <select
                                                    value={dischargeForm.dischargeCondition}
                                                    onChange={e => setDischargeForm(df => ({ ...df, dischargeCondition: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                >
                                                    <option value="stable">Stable</option>
                                                    <option value="improved">Improved</option>
                                                    <option value="cured">Cured</option>
                                                    <option value="critical">Critical</option>
                                                    <option value="against-advice">Against Medical Advice (LAMA)</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => setShowDischargeConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    Confirm Discharge
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-2">
        <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
        <div>
            <p className="text-[11px] text-slate-400 font-medium">{label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const VitalChip = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1">
        <span className="text-slate-500">{icon}</span>
        <span className="text-[10px] text-slate-500">{label}:</span>
        <span className="text-xs font-semibold text-slate-800 dark:text-white">{value}</span>
    </div>
);

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="mb-3 opacity-30">{icon}</div>
        <p className="text-sm font-medium">{text}</p>
    </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdmissionsPage() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | Category>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [admRes, patRes] = await Promise.all([
                API.get('/admissions'),
                API.get('/patients/all?scope=all'),
            ]);
            if (admRes.data.success) setAdmissions(admRes.data.data);
            if (patRes.data.success) setPatients(patRes.data.data);
        } catch (err: any) {
            toast.error('Failed to load admissions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = admissions.filter(a => {
        if (filterStatus !== 'all' && a.status !== filterStatus) return false;
        if (filterCategory !== 'all' && a.category !== filterCategory) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return a.patient_name.toLowerCase().includes(q) ||
                a.room_no.toLowerCase().includes(q) ||
                a.ward_no.toLowerCase().includes(q) ||
                (a.admitting_doctor || '').toLowerCase().includes(q);
        }
        return true;
    });

    const openCount = admissions.filter(a => a.status === 'open').length;
    const closedCount = admissions.filter(a => a.status === 'closed').length;
    const categoryCount: Record<Category, number> = {
        ayushman: admissions.filter(a => a.category === 'ayushman').length,
        mediclaim: admissions.filter(a => a.category === 'mediclaim').length,
        individual: admissions.filter(a => a.category === 'individual').length,
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* ── HEADER ── */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <BedDouble className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        Admissions
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">{openCount} active · {closedCount} discharged</p>
                </div>
                <button
                    onClick={() => setShowAdmitModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md shadow-blue-200 dark:shadow-none cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    Admit Patient
                </button>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                {[
                    { label: 'Active', value: openCount, color: 'emerald', icon: <Activity className="h-5 w-5" /> },
                    { label: 'Discharged', value: closedCount, color: 'slate', icon: <CheckCircle2 className="h-5 w-5" /> },
                    { label: 'Ayushman', value: categoryCount.ayushman, color: 'green', icon: <Shield className="h-5 w-5" /> },
                    { label: 'Individual', value: categoryCount.individual, color: 'orange', icon: <User className="h-5 w-5" /> },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/20 flex items-center justify-center text-${s.color}-600 dark:text-${s.color}-400 shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── FILTERS ── */}
            <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, room, doctor..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                    {(['all', 'open', 'closed'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-2 font-semibold capitalize transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                    {(['all', 'ayushman', 'mediclaim', 'individual'] as const).map(c => (
                        <button
                            key={c}
                            onClick={() => setFilterCategory(c)}
                            className={`px-3 py-2 font-semibold capitalize transition ${filterCategory === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                        >
                            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TABLE ── */}
            <div className="flex-1 px-6 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-blue-200/30 animate-ping" />
                            </div>
                            <p className="text-sm text-slate-500">Loading admissions...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <BedDouble className="h-14 w-14 mb-4 opacity-20" />
                        <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">No admissions found</h3>
                        <p className="text-sm mt-1">Admit a new patient to get started</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        {['Patient', 'Room / Ward', 'Category', 'Status', 'Days', 'Doctor', 'Admitted', 'Action'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a, i) => (
                                        <tr
                                            key={a.id}
                                            className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${i === filtered.length - 1 ? 'border-0' : ''}`}
                                            onClick={() => setSelectedAdmission(a)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {a.patient_name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-white">{a.patient_name}</p>
                                                        <p className="text-xs text-slate-400">{a.patient_age}y · {a.patient_gender}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800 dark:text-white">Rm {a.room_no}</p>
                                                <p className="text-xs text-slate-400">Wd {a.ward_no}{a.bed_no ? ` · Bed ${a.bed_no}` : ''}</p>
                                            </td>
                                            <td className="px-4 py-3"><CategoryBadge cat={a.category} /></td>
                                            <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Clock className={`h-3.5 w-3.5 ${a.status === 'open' ? 'text-blue-500' : 'text-slate-400'}`} />
                                                    <span className={`font-bold ${a.status === 'open' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{a.days_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{a.admitting_doctor || '—'}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{a.admission_date}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelectedAdmission(a); }}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${a.status === 'open'
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {a.status === 'open' ? 'Manage' : 'View'}
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODALS / DRAWERS ── */}
            {showAdmitModal && (
                <AdmitModal
                    onClose={() => setShowAdmitModal(false)}
                    onSuccess={loadData}
                    patients={patients}
                />
            )}
            {selectedAdmission && (
                <AdmissionDrawer
                    admission={selectedAdmission}
                    onClose={() => setSelectedAdmission(null)}
                    onRefresh={loadData}
                />
            )}
        </div>
    );
}
