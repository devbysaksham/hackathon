'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, Users, Search } from 'lucide-react';

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

export default function AdminPatientsPage() {
    const { token } = useAppStore();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Registered Patients
                    </h1>
                    <p className="text-slate-500 mt-1">View patients registered in the hospital system.</p>
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
                        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
                            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No patients found.
                                        </td>
                                    </tr>
                                ) : (
                                    patients.map(patient => (
                                        <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">#{patient.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{patient.name}</div>
                                                <div className="text-xs text-slate-500">{patient.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{patient.phone}</div>
                                                {patient.emergency_contact && (
                                                    <div className="text-xs text-rose-500 mt-0.5">Emergency: {patient.emergency_contact}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {patient.age} yrs • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
