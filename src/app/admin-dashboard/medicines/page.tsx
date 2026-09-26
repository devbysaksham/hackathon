'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, Pill, Search, Plus, Trash2, X, CheckCircle2, User } from 'lucide-react';

interface Patient { id: string; name: string; phone: string; email: string; age: number; gender: string; }
interface MedicineEntry {
    medicineName: string;
    dosage: string;
    timings: string[];
    durationDays: string;
    startDate: string;
    instructions: string;
    beforeAfterFood: string;
}

const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const FOOD_OPTIONS = ['Before food', 'After food', 'With food', 'Empty stomach'];
const emptyMed = (): MedicineEntry => ({
    medicineName: '', dosage: '1 tablet', timings: ['Morning'],
    durationDays: '5', startDate: new Date().toISOString().split('T')[0],
    instructions: '', beforeAfterFood: 'After food'
});

function MedicinesContent() {
    const { token } = useAppStore();
    const searchParams = useSearchParams();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [medicines, setMedicines] = useState<MedicineEntry[]>([emptyMed()]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const searchPatients = useCallback(async (query: string) => {
        if (!query.trim()) { setPatients([]); return; }
        setSearching(true);
        try {
            const res = await fetch(`http://localhost:5000/api/admin/patients?search=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setPatients(data.data);
        } catch { toast.error('Error searching patients'); }
        finally { setSearching(false); }
    }, [token]);

    useEffect(() => {
        const timer = setTimeout(() => searchPatients(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm, searchPatients]);

    useEffect(() => {
        const patientId = searchParams.get('patientId');
        if (patientId && token) {
            fetch(`http://localhost:5000/api/patients/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setSelectedPatient(data.data);
                    setSearchTerm(data.data.name);
                    setPatients([data.data]);
                }
            })
            .catch(err => console.error(err));
        }
    }, [searchParams, token]);

    const addMedicine = () => setMedicines(m => [...m, emptyMed()]);
    const removeMedicine = (i: number) => setMedicines(m => m.filter((_, idx) => idx !== i));
    const updateMed = (i: number, field: keyof MedicineEntry, value: string | string[]) => {
        setMedicines(m => m.map((med, idx) => idx === i ? { ...med, [field]: value } : med));
    };
    const toggleTiming = (i: number, timing: string) => {
        setMedicines(m => m.map((med, idx) => {
            if (idx !== i) return med;
            const has = med.timings.includes(timing);
            const next = has ? med.timings.filter(t => t !== timing) : [...med.timings, timing];
            return { ...med, timings: next.length ? next : [timing] };
        }));
    };

    const handleSubmit = async () => {
        if (!selectedPatient) { toast.error('Please select a patient'); return; }
        const invalid = medicines.find(m => !m.medicineName.trim());
        if (invalid) { toast.error('Please fill medicine name for all entries'); return; }

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/medicines/allot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ patientId: selectedPatient.id, medicines })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Medicine allotted to ${selectedPatient.name} successfully!`);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false); setSelectedPatient(null);
                    setMedicines([emptyMed()]); setSearchTerm(''); setPatients([]);
                }, 3000);
            } else toast.error(data.message || 'Failed to allot medicine');
        } catch { toast.error('Error allotting medicine'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="h-6 w-6 text-violet-600" /> Medicine Allotment
                </h1>
                <p className="text-slate-500 mt-1">Prescribe medicines and set dosage schedules for patients.</p>
            </div>

            {/* Success banner */}
            {success && (
                <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800">Medicine allotted successfully!</p>
                        <p className="text-xs text-emerald-600">Reminders have been scheduled. Patient will see their routine in the medicines tracker.</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT: Patient selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" /> Select Patient
                        </h2>

                        {selectedPatient ? (
                            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-violet-900">{selectedPatient.name}</p>
                                        <p className="text-xs text-violet-600 mt-0.5">{selectedPatient.email}</p>
                                        <p className="text-xs text-violet-500">{selectedPatient.phone} · {selectedPatient.age}y · {selectedPatient.gender}</p>
                                    </div>
                                    <button onClick={() => setSelectedPatient(null)} className="p-1 rounded-lg hover:bg-violet-100 cursor-pointer">
                                        <X className="h-4 w-4 text-violet-500" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    />
                                </div>
                                {searching && <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-violet-500" /></div>}
                                {patients.length > 0 && (
                                    <div className="space-y-1 max-h-60 overflow-y-auto">
                                        {patients.map(p => (
                                            <button key={p.id} onClick={() => { setSelectedPatient(p); setSearchTerm(''); setPatients([]); }}
                                                className="w-full text-left p-3 rounded-xl hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all cursor-pointer">
                                                <div className="font-semibold text-sm text-slate-800">{p.name}</div>
                                                <div className="text-xs text-slate-500">{p.phone} · {p.age}y {p.gender}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchTerm && !searching && patients.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-3">No patients found</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT: Medicine form */}
                <div className="lg:col-span-2 space-y-4">
                    {medicines.map((med, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-black">{i + 1}</div>
                                    Medicine #{i + 1}
                                </h3>
                                {medicines.length > 1 && (
                                    <button onClick={() => removeMedicine(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Medicine Name *</label>
                                    <input value={med.medicineName} onChange={e => updateMed(i, 'medicineName', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="e.g. Paracetamol, Metformin" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Dosage *</label>
                                    <input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="1 tablet, 5ml, 2 caps..." />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Before/After Food</label>
                                    <select value={med.beforeAfterFood} onChange={e => updateMed(i, 'beforeAfterFood', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                                        {FOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Timings */}
                            <div className="mb-3">
                                <label className="text-xs font-semibold text-slate-500 block mb-2">Timing (when to take)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {TIMINGS.map(t => (
                                        <button key={t} type="button" onClick={() => toggleTiming(i, t)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${med.timings.includes(t) ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                                            {t === 'Morning' ? '🌅 Morning' : t === 'Afternoon' ? '☀️ Afternoon' : t === 'Evening' ? '🌆 Evening' : '🌙 Night'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Duration (days)</label>
                                    <input type="number" min="1" max="90" value={med.durationDays} onChange={e => updateMed(i, 'durationDays', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 block mb-1">Start Date</label>
                                    <input type="date" value={med.startDate} onChange={e => updateMed(i, 'startDate', e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Instructions (optional)</label>
                                <input value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    placeholder="e.g. Shake well before use, avoid alcohol..." />
                            </div>

                            {/* Summary badge */}
                            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                                <span className="font-semibold">Schedule:</span> {med.timings.join(' + ')} × {med.durationDays} days
                                {' → '}<span className="font-semibold">{Number(med.timings.length) * Number(med.durationDays)} total doses</span>
                            </div>
                        </div>
                    ))}

                    <button onClick={addMedicine}
                        className="w-full py-3 border-2 border-dashed border-violet-200 rounded-2xl text-sm font-semibold text-violet-500 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-all cursor-pointer flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add Another Medicine
                    </button>

                    <button onClick={handleSubmit} disabled={submitting || !selectedPatient}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-200 cursor-pointer flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Pill className="h-5 w-5" />}
                        {submitting ? 'Allotting Medicines...' : `Allot ${medicines.length} Medicine${medicines.length > 1 ? 's' : ''} to Patient`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminMedicinesPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <MedicinesContent />
        </Suspense>
    );
}
