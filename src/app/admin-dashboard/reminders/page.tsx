'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, Bell, CheckCircle2, Search, ChevronRight, User } from 'lucide-react';

interface Patient {
    id: number;
    name: string;
    phone: string;
    email: string;
}

interface Reminder {
    id: number;
    patient_id: number;
    reminder_type: string;
    message: string;
    scheduled_time: string;
    status: string;
}

export default function AdminRemindersPage() {
    const { token } = useAppStore();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loadingReminders, setLoadingReminders] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPatients = async () => {
        setLoadingPatients(true);
        try {
            const res = await fetch(`http://localhost:5000/api/admin/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPatients(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch patients');
            }
        } catch (error) {
            toast.error('Error fetching patients');
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchReminders = async (patientId: number) => {
        setLoadingReminders(true);
        try {
            const res = await fetch(`http://localhost:5000/api/admin/reminders/pending/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReminders(data.data);
            } else {
                toast.error('Failed to fetch reminders');
            }
        } catch (error) {
            toast.error('Error fetching reminders');
        } finally {
            setLoadingReminders(false);
        }
    };

    useEffect(() => {
        if (token) fetchPatients();
    }, [token]);

    useEffect(() => {
        if (selectedPatientId) {
            fetchReminders(selectedPatientId);
        } else {
            setReminders([]);
        }
    }, [selectedPatientId]);

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="h-6 w-6 text-blue-600" />
                    Reminders Explorer
                </h1>
                <p className="text-slate-500 mt-1">Select a patient to view their upcoming and pending reminders.</p>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
                {/* Left Panel: Patients List */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 lg:shrink max-h-[40vh] lg:max-h-none">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingPatients ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="text-center p-8 text-sm text-slate-500">No patients found.</div>
                        ) : (
                            <div className="space-y-1">
                                {filteredPatients.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPatientId(p.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                            selectedPatientId === p.id 
                                            ? 'bg-blue-50 border border-blue-200' 
                                            : 'hover:bg-slate-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedPatientId === p.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-semibold text-sm ${selectedPatientId === p.id ? 'text-blue-900' : 'text-slate-700'}`}>{p.name}</div>
                                                <div className="text-xs text-slate-500">{p.phone}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 ${selectedPatientId === p.id ? 'text-blue-500' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Reminders List */}
                <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
                    {!selectedPatientId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Bell className="h-12 w-12 mb-3 text-slate-200" />
                            <p className="font-medium text-slate-500">Select a patient</p>
                            <p className="text-sm">Choose a patient from the list to view reminders.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-5 border-b border-slate-100 bg-slate-50">
                                <h2 className="font-bold text-slate-800">Pending Reminders</h2>
                                <p className="text-xs text-slate-500 mt-1">These reminders will be sent automatically at the scheduled time.</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5">
                                {loadingReminders ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                                ) : reminders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                                        <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-400" />
                                        <p className="text-lg font-medium text-slate-600">All caught up!</p>
                                        <p className="text-sm">This patient has no pending reminders.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reminders.map(reminder => {
                                            const isWarning = reminder.message.includes('WARNING');
                                            return (
                                                <div key={reminder.id} className={`p-4 rounded-2xl border flex gap-4 ${isWarning ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                                    <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center mt-1 ${isWarning ? 'bg-amber-100' : 'bg-blue-50'}`}>
                                                        <Bell className={`h-5 w-5 ${isWarning ? 'text-amber-600' : 'text-blue-500'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isWarning ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                                {isWarning ? 'Warning Reminder' : reminder.reminder_type}
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                                Scheduled: {new Date(reminder.scheduled_time).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm mt-2 font-medium leading-relaxed ${isWarning ? 'text-amber-900' : 'text-slate-700'}`}>
                                                            {reminder.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
