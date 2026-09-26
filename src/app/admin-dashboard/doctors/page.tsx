'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import {
    Loader2, Stethoscope, Plus, Pencil, Trash2, X, Calendar,
    ChevronLeft, ChevronRight, Users, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Doctor {
    id: string;
    name: string;
    specialization: string;
    experience: number;
    fee: number;
    phone: string;
    email: string;
    available_days: string[];
    slot_start_time?: string;
    slot_end_time?: string;
    manual_slots?: string[];
    max_patients_per_slot: number;
    status: string;
    avatar_url?: string;
}

interface Slot {
    time: string;
    capacity: number;
    booked: number;
    available: number;
    isFull: boolean;
}

interface SlotData {
    isAvailable: boolean;
    reason?: string;
    date: string;
    day: string;
    slots: Slot[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECIALIZATIONS = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'ENT Specialist',
    'Orthopedic Surgeon', 'Pediatrician', 'Neurologist', 'Gynecologist',
    'Psychiatrist', 'Ophthalmologist', 'Urologist', 'Pulmonologist', 'Physiotherapist'
];

const emptyForm = {
    name: '', specialization: '', experience: 0, fee: 0,
    phone: '', email: '', availableDays: [] as string[], manualSlots: [] as string[], newSlot: '',
    maxPatientsPerSlot: '10', avatarUrl: '', status: 'active'
};

export default function AdminDoctorsPage() {
    const { token } = useAppStore();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    // Slot viewer state
    const [slotDoctorId, setSlotDoctorId] = useState<string | null>(null);
    const [slotDate, setSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [slotData, setSlotData] = useState<SlotData | null>(null);
    const [slotLoading, setSlotLoading] = useState(false);

    const fetchDoctors = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/doctors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDoctors(data.data);
            else toast.error(data.message || 'Failed to fetch doctors');
        } catch { toast.error('Error fetching doctors'); }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => { if (token) fetchDoctors(); }, [token, fetchDoctors]);

    const fetchSlots = useCallback(async (doctorId: string, date: string) => {
        setSlotLoading(true);
        setSlotData(null);
        try {
            const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/slots?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setSlotData(data.data);
            else toast.error(data.message || 'Could not load slots');
        } catch { toast.error('Error loading slots'); }
        finally { setSlotLoading(false); }
    }, [token]);

    useEffect(() => {
        if (slotDoctorId && slotDate) fetchSlots(slotDoctorId, slotDate);
    }, [slotDoctorId, slotDate, fetchSlots]);

    const openAdd = () => { setForm({ ...emptyForm }); setShowModal('add'); };
    const openEdit = (doc: Doctor) => {
        setSelectedDoctor(doc);
        setForm({
            name: doc.name, specialization: doc.specialization,
            experience: doc.experience, fee: doc.fee,
            phone: doc.phone, email: doc.email, 
            availableDays: doc.available_days || [], manualSlots: doc.manual_slots || [], newSlot: '',
            maxPatientsPerSlot: String(doc.max_patients_per_slot || 10),
            avatarUrl: doc.avatar_url || '', status: doc.status
        });
        setShowModal('edit');
    };
    const openDelete = (doc: Doctor) => { setSelectedDoctor(doc); setShowModal('delete'); };
    const closeModal = () => { setShowModal(null); setSelectedDoctor(null); };

    const toggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };

    const handleSave = async () => {
        if (!form.name || !form.specialization || !form.experience || !form.fee || !form.phone || !form.email || form.availableDays.length === 0) {
            toast.error('Please fill all required fields'); return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name, specialization: form.specialization,
                experience: Number(form.experience), fee: Number(form.fee),
                phone: form.phone, email: form.email,
                availableDays: form.availableDays, manualSlots: form.manualSlots,
                maxPatientsPerSlot: Number(form.maxPatientsPerSlot || 10),
                avatarUrl: form.avatarUrl || null, status: form.status
            };
            const url = showModal === 'add'
                ? `http://localhost:5000/api/doctors`
                : `http://localhost:5000/api/doctors/${selectedDoctor!.id}`;
            const method = showModal === 'add' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(showModal === 'add' ? 'Doctor added successfully!' : 'Doctor updated successfully!');
                closeModal(); fetchDoctors();
            } else toast.error(data.message || 'Operation failed');
        } catch { toast.error('Error saving doctor'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!selectedDoctor) return;
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/doctors/${selectedDoctor.id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) { toast.success('Doctor deactivated'); closeModal(); fetchDoctors(); }
            else toast.error(data.message || 'Delete failed');
        } catch { toast.error('Error deleting doctor'); }
        finally { setSaving(false); }
    };

    const shiftDate = (delta: number) => {
        const d = new Date(slotDate);
        d.setDate(d.getDate() + delta);
        setSlotDate(d.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="h-6 w-6 text-blue-600" /> Doctors Management
                    </h1>
                    <p className="text-slate-500 mt-1">Add, edit, deactivate doctors and view slot bookings.</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm cursor-pointer">
                    <Plus className="h-4 w-4" /> Add Doctor
                </button>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shrink-0">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-4">Doctor</th>
                                    <th className="px-5 py-4">Specialization</th>
                                    <th className="px-5 py-4">Experience</th>
                                    <th className="px-5 py-4">Fee</th>
                                    <th className="px-5 py-4">Days</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {doctors.length === 0 ? (
                                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No doctors found.</td></tr>
                                ) : doctors.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">Dr. {doc.name}</div>
                                            <div className="text-xs text-slate-500">{doc.email}</div>
                                        </td>
                                        <td className="px-5 py-4">{doc.specialization}<div className="text-xs text-slate-400">{doc.phone}</div></td>
                                        <td className="px-5 py-4">{doc.experience} yrs</td>
                                        <td className="px-5 py-4 font-semibold">₹{doc.fee}</td>
                                        <td className="px-5 py-4 max-w-[160px]">
                                            <div className="flex flex-wrap gap-1">
                                                {(doc.available_days || []).map(d => (
                                                    <span key={d} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5 font-medium">{d.slice(0, 3)}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${doc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {doc.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setSlotDoctorId(doc.id); setSlotDate(new Date().toISOString().split('T')[0]); }}
                                                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer" title="View Slots">
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => openEdit(doc)}
                                                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors cursor-pointer" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => openDelete(doc)}
                                                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer" title="Deactivate">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Slot Viewer Panel */}
            {slotDoctorId && (() => {
                const doc = doctors.find(d => d.id === slotDoctorId);
                return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-sm">Slot Booking Grid</h2>
                                    <p className="text-xs text-slate-500">Dr. {doc?.name} — {doc?.specialization}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSlotDoctorId(null); setSlotData(null); }}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Date Navigator */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <ChevronLeft className="h-4 w-4 text-slate-600" />
                            </button>
                            <div className="flex-1">
                                <input type="date" value={slotDate} onChange={e => setSlotDate(e.target.value)}
                                    className="w-full text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <button onClick={() => shiftDate(1)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <ChevronRight className="h-4 w-4 text-slate-600" />
                            </button>
                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">{formatDate(slotDate)}</div>
                        </div>

                        {/* Slot Grid */}
                        <div className="p-6">
                            {slotLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                </div>
                            ) : !slotData ? (
                                <p className="text-center text-slate-400 py-8">Select a date to view slots</p>
                            ) : !slotData.isAvailable ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <AlertCircle className="h-8 w-8 text-amber-400" />
                                    <p className="text-sm font-medium text-slate-600">{slotData.reason || 'Doctor unavailable on this date'}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary row */}
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                                            <div className="text-lg font-bold text-blue-700">{slotData.slots.length}</div>
                                            <div className="text-xs text-blue-500 font-medium">Total Slots</div>
                                        </div>
                                        <div className="bg-rose-50 rounded-xl p-3 text-center border border-rose-100">
                                            <div className="text-lg font-bold text-rose-700">{slotData.slots.filter(s => s.isFull).length}</div>
                                            <div className="text-xs text-rose-500 font-medium">Fully Booked</div>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                            <div className="text-lg font-bold text-emerald-700">{slotData.slots.filter(s => !s.isFull).length}</div>
                                            <div className="text-xs text-emerald-500 font-medium">Available</div>
                                        </div>
                                    </div>

                                    {/* Slot cards grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {slotData.slots.map(slot => {
                                            const fillPct = Math.round((slot.booked / slot.capacity) * 100);
                                            const isFull = slot.isFull;
                                            return (
                                                <div key={slot.time} className={`rounded-xl border p-3 text-center transition-all ${isFull ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                                    <div className="flex items-center justify-center gap-1 mb-2">
                                                        <Clock className={`h-3.5 w-3.5 ${isFull ? 'text-rose-500' : 'text-emerald-600'}`} />
                                                        <span className="text-sm font-bold text-slate-800">{slot.time}</span>
                                                    </div>
                                                    <div className={`text-xl font-black mb-1 ${isFull ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                        {slot.available}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-medium">of {slot.capacity} free</div>
                                                    {/* Fill bar */}
                                                    <div className="w-full h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                                            style={{ width: `${fillPct}%` }} />
                                                    </div>
                                                    {slot.booked > 0 && (
                                                        <div className="flex items-center justify-center gap-0.5 mt-1.5">
                                                            <Users className="h-3 w-3 text-slate-400" />
                                                            <span className="text-[10px] text-slate-400">{slot.booked} booked</span>
                                                        </div>
                                                    )}
                                                    {isFull && (
                                                        <span className="text-[10px] font-bold text-rose-600 mt-1 block">FULL</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* ===== MODALS ===== */}
            {(showModal === 'add' || showModal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-7 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                {showModal === 'add' ? '➕ Add New Doctor' : '✏️ Edit Doctor'}
                            </h2>
                            <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="px-7 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Smith" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Specialization *</label>
                                    <select value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select...</option>
                                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Experience (yrs) *</label>
                                    <input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: Number(e.target.value) }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Consultation Fee (₹) *</label>
                                    <input type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: Number(e.target.value) }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Max Patients / Slot *</label>
                                    <input type="number" value={form.maxPatientsPerSlot} onChange={e => setForm(f => ({ ...f, maxPatientsPerSlot: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Phone *</label>
                                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 00001" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="doctor@hospital.com" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-2">Manual Time Slots (HH:MM) *</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="time" value={form.newSlot} onChange={e => setForm(f => ({ ...f, newSlot: e.target.value }))}
                                        className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={() => {
                                        if (form.newSlot && !form.manualSlots.includes(form.newSlot)) {
                                            setForm(f => ({ ...f, manualSlots: [...f.manualSlots, form.newSlot].sort(), newSlot: '' }));
                                        }
                                    }} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                                        Add Slot
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.manualSlots.length === 0 ? <span className="text-xs text-slate-400">No slots added. Add slots above.</span> : null}
                                    {form.manualSlots.map(slot => (
                                        <div key={slot} className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold">
                                            {slot}
                                            <button type="button" onClick={() => setForm(f => ({ ...f, manualSlots: f.manualSlots.filter(s => s !== slot) }))}
                                                className="text-rose-500 hover:bg-rose-100 rounded-full p-0.5 ml-1 cursor-pointer"><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-2">Available Days *</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button key={day} type="button" onClick={() => toggleDay(day)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${form.availableDays.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Avatar URL (optional)</label>
                                <input value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                            </div>

                            {showModal === 'edit' && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="px-7 pb-6 flex gap-3 justify-end">
                            <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {showModal === 'add' ? 'Add Doctor' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {showModal === 'delete' && selectedDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                        <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-7 w-7 text-rose-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Deactivate Doctor?</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Dr. <strong>{selectedDoctor.name}</strong> will be set to inactive. Their appointments remain but no new bookings will be possible.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={saving}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
