'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, X } from 'lucide-react';

interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    appointment_status: string;
    payment_status: string;
    urgency_level: string;
    amount: number;
    doctor_name: string;
    doctor_specialization: string;
    patient_name: string;
    patient_phone: string;
}

export default function AdminAppointmentsPage() {
    const { token } = useAppStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPendingModal, setShowPendingModal] = useState(false);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/appointments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();

                if (data.success) {
                    setAppointments(data.data);
                } else {
                    toast.error(data.message || 'Failed to fetch appointments');
                }
            } catch (error) {
                console.error("Error fetching appointments:", error);
                toast.error('Error fetching appointments');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAppointments();
    }, [token]);

    const confirmedAppointments = appointments.filter(app => app.appointment_status === 'confirmed');
    const pendingAppointments = appointments.filter(app => app.appointment_status === 'pending');

    const renderTableRows = (apps: Appointment[]) => {
        if (apps.length === 0) {
            return (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        No appointments found.
                    </td>
                </tr>
            );
        }

        return apps.map(app => (
            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">#{app.id}</td>
                <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{app.patient_name}</div>
                    <div className="text-xs text-slate-500">{app.patient_phone}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">Dr. {app.doctor_name}</div>
                    <div className="text-xs text-slate-500">{app.doctor_specialization}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="font-medium">{new Date(app.appointment_date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{app.appointment_time}</div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${app.urgency_level === 'emergency' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            app.urgency_level === 'urgent' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                        {app.urgency_level.charAt(0).toUpperCase() + app.urgency_level.slice(1)}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${app.appointment_status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.appointment_status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                app.appointment_status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {app.appointment_status.charAt(0).toUpperCase() + app.appointment_status.slice(1)}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${app.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {app.payment_status.charAt(0).toUpperCase() + app.payment_status.slice(1)}
                    </span>
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        Appointments Management
                    </h1>
                    <p className="text-slate-500 mt-1">View and manage all system appointments.</p>
                </div>
                <button
                    onClick={() => setShowPendingModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 font-semibold rounded-xl transition-colors cursor-pointer border border-amber-200"
                >
                    <Clock className="h-4 w-4" />
                    Pending Appointments ({pendingAppointments.length})
                </button>
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
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Doctor</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Urgency</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {renderTableRows(confirmedAppointments)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pending Appointments Modal */}
            {showPendingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="bg-white px-7 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    Pending Appointments
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Appointments awaiting payment or confirmation.</p>
                            </div>
                            <button onClick={() => setShowPendingModal(false)} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[800px]">
                                        <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3">ID</th>
                                                <th className="px-6 py-3">Patient</th>
                                                <th className="px-6 py-3">Doctor</th>
                                                <th className="px-6 py-3">Date & Time</th>
                                                <th className="px-6 py-3">Urgency</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Payment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {renderTableRows(pendingAppointments)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-7 py-4 border-t border-slate-100 flex justify-end shrink-0">
                            <button onClick={() => setShowPendingModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 cursor-pointer transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
