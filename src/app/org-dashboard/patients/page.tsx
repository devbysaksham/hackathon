'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, Users, Search, Pencil, X } from 'lucide-react';

interface Patient {
    id: number;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    emergency_contact?: string;
    created_at: string;
}

const emptyForm = {
    name: '', age: '', gender: 'other', phone: '', email: '',
    address: '', emergency_contact: '', password: ''
};

export default function AdminPatientsPage() {
    const { token } = useAppStore();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchPatients = async (query: string = '') => {
        setLoading(true);
        try {
            const url = query 
                ? `http://localhost:5000/api/admin/patients?search=${encodeURIComponent(query)}`
                : `http://localhost:5000/api/admin/patients`;
                
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success) {
                setPatients(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch patients');
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error('Error fetching patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPatients();
    }, [token]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPatients(searchTerm);
    };

    const openEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setForm({
            name: patient.name,
            age: String(patient.age),
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email,
            address: patient.address || '',
            emergency_contact: patient.emergency_contact || '',
            password: '' // empty so we don't send unless changed
        });
        setIsEditOpen(true);
    };

    const handleSave = async () => {
        if (!selectedPatient) return;
        setSaving(true);
        try {
            const payload: any = {
                name: form.name,
                age: Number(form.age),
                gender: form.gender,
                phone: form.phone,
                email: form.email,
                address: form.address,
                emergency_contact: form.emergency_contact
            };
            if (form.password) payload.password = form.password;

            const res = await fetch(`http://localhost:5000/api/admin/patients/${selectedPatient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Patient updated successfully');
                setIsEditOpen(false);
                fetchPatients(searchTerm);
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            toast.error('Error updating patient');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Patient Database
                    </h1>
                    <p className="text-slate-500 mt-1">View registered patients and search their records.</p>
                </div>
                
                <form onSubmit={handleSearch} className="relative w-full sm:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                    />
                </form>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Demographics</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No patients found. Try adjusting your search.
                                        </td>
                                    </tr>
                                ) : (
                                    patients.map(patient => (
                                        <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">#{patient.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{patient.name}</td>
                                            <td className="px-6 py-4">
                                                <div>{patient.email}</div>
                                                <div className="text-xs text-slate-500">{patient.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {patient.age} years • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-[200px]">{patient.address || '—'}</td>
                                            <td className="px-6 py-4">{new Date(patient.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => openEdit(patient)}
                                                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors cursor-pointer" title="Edit Patient">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditOpen && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-7 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">✏️ Edit Patient</h2>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="px-7 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Age</label>
                                    <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
                                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Address</label>
                                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Emergency Contact</label>
                                    <input value={form.emergency_contact} onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name & Phone" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Reset Password</label>
                                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Leave blank to keep current" />
                                </div>
                            </div>
                        </div>
                        <div className="px-7 pb-6 flex gap-3 justify-end mt-4">
                            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
