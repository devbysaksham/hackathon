'use client';

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { QrCode, Search, CheckCircle2, Clock, User, AlertCircle, FileText } from 'lucide-react';

export default function TodayQueuePage() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [verifyCode, setVerifyCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [tempRecords, setTempRecords] = useState<Record<string, string[]>>({});
    const [scanModal, setScanModal] = useState<{isOpen: boolean, patientId: string | null, progress: number, isScanning: boolean, currentPages: string[]}>({
        isOpen: false, patientId: null, progress: 0, isScanning: false, currentPages: []
    });

    const fetchTodayQueue = async () => {
        try {
            const res = await API.get('/admin/appointments/today');
            setAppointments(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load today's queue");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayQueue();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode.trim()) return;

        setIsVerifying(true);
        try {
            const res = await API.post('/admin/queue/verify', { code: verifyCode.trim().toUpperCase() });
            toast.success(`Success! Token #${res.data.data.token_no} assigned to ${res.data.data.patient_name}`);
            setVerifyCode('');
            fetchTodayQueue();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid or expired code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGenerateQueue = async () => {
        setIsGenerating(true);
        try {
            const res = await API.post('/admin/queue/generate');
            toast.success(res.data.message);
            fetchTodayQueue();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate queue");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUploadRecordClick = (patientId: string) => {
        setScanModal({ isOpen: true, patientId, progress: 0, isScanning: false, currentPages: tempRecords[patientId] || [] });
    };

    const handleStartScan = () => {
        // Since direct hardware scanner access isn't possible via standard web APIs without a local client,
        // we trigger a file upload. Receptionists can scan from the printer to their PC, then select the files here.
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,application/pdf';
        fileInput.multiple = true;
        
        fileInput.onchange = async (e: any) => {
            const files = Array.from(e.target.files) as File[];
            if (files.length === 0) return;

            setScanModal(prev => ({ ...prev, isScanning: true, progress: 0 }));

            const newPages: string[] = [];
            let processed = 0;

            for (const file of files) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newPages.push(event.target.result as string);
                    }
                    processed++;
                    setScanModal(prev => ({ ...prev, progress: Math.round((processed / files.length) * 100) }));
                    
                    if (processed === files.length) {
                        setScanModal(prev => ({ 
                            ...prev, 
                            progress: 100, 
                            isScanning: false, 
                            currentPages: [...prev.currentPages, ...newPages]
                        }));
                        toast.success(`${files.length} document(s) uploaded successfully!`);
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        
        fileInput.click();
    };

    const handleSaveModal = () => {
        if (scanModal.patientId) {
            setTempRecords(prev => ({ ...prev, [scanModal.patientId!]: scanModal.currentPages }));
        }
        setScanModal({ isOpen: false, patientId: null, progress: 0, isScanning: false, currentPages: [] });
    };

    const handleDeletePage = (index: number) => {
        setScanModal(prev => ({
            ...prev,
            currentPages: prev.currentPages.filter((_, i) => i !== index)
        }));
    };

    const handleFinalSave = async (appointmentId: string, patientId: string) => {
        try {
            const pages = tempRecords[patientId] || [];
            if (pages.length > 0) {
                await API.post('/medical-records', {
                    patientId: patientId,
                    visitSummary: `General Record - Scanned Physical Document (${pages.length} page(s))`,
                    reportFile: JSON.stringify(pages)
                });
            }
            
            // Use correct field name: 'appointmentStatus' (not 'status')
            await API.put(`/appointments/${appointmentId}/status`, { appointmentStatus: 'completed' });

            // Clear temp records for this patient
            setTempRecords(prev => {
                const next = { ...prev };
                delete next[patientId];
                return next;
            });

            toast.success("Visit finalized and records saved successfully!");
            fetchTodayQueue();
        } catch (error: any) {
            console.error('Final save error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to finalize visit.");
        }
    };

    if (isLoading) {
        return <div className="p-8">Loading queue...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Queue Manager</h1>
                    <p className="text-slate-500 mt-1">Manage today's patient flow and verify check-ins.</p>
                    <Button 
                        onClick={handleGenerateQueue} 
                        disabled={isGenerating}
                        className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                        size="sm"
                    >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Queue'}
                    </Button>
                </div>

                <form onSubmit={handleVerify} className="flex items-center gap-2 max-w-sm w-full">
                    <div className="relative flex-1">
                        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Enter Appt Code (e.g. SV-2505-XXXX)"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                        />
                    </div>
                    <Button type="submit" disabled={isVerifying || !verifyCode} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                        Verify & Assign
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Today's Check-ins & Queue</h3>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                            {appointments.length} Patients
                        </span>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                            <thead className="bg-slate-50/50 border-b">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Queue #</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Appt Code</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Patient</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Doctor</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Slot</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                                    <th className="px-5 py-3 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                                            No patients have checked in yet today.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((app: any) => (
                                        <tr key={app.id} className="hover:bg-slate-50/50">
                                            <td className="px-5 py-3 font-black text-blue-600 text-base">
                                                {app.token_no ? `#${app.token_no}` : '-'}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-sm text-slate-500">
                                                {app.appointment_status === 'checked_in' || app.appointment_status === 'completed' 
                                                    ? app.appointment_code 
                                                    : <span className="text-slate-400">••••••••••</span>}
                                            </td>
                                            <td className="px-5 py-3 font-medium text-slate-800">
                                                <div>{app.account_name}</div>
                                                {app.patient_name !== app.account_name && (
                                                    <div className="text-xs text-slate-500 font-medium bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-0.5">Patient: {app.patient_name}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">Dr. {app.doctor_name}</td>
                                            <td className="px-5 py-3 text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {app.appointment_time}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                                                    app.appointment_status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' :
                                                    app.appointment_status === 'completed' ? 'bg-slate-100 text-slate-600' :
                                                    app.appointment_status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {app.appointment_status === 'confirmed' 
                                                        ? 'Awaiting Check-in' 
                                                        : app.appointment_status === 'completed' 
                                                            ? 'Finalized' 
                                                            : app.appointment_status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {app.appointment_status === 'checked_in' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="text-xs h-8 bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                                                            onClick={() => window.location.href = `/admin-dashboard/medicines?patientId=${app.patient_id}`}
                                                        >
                                                            Allot Medicines
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="text-xs h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                            onClick={() => handleUploadRecordClick(app.patient_id)}
                                                        >
                                                            Upload Record
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            className="text-xs h-8 bg-green-600 text-white hover:bg-green-700"
                                                            onClick={() => handleFinalSave(app.id, app.patient_id)}
                                                        >
                                                            Close & Final Save
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100/50 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" /> Waitlist Rules
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">1.</span>
                            Patients must present their Appt Code at the desk.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">2.</span>
                            Enter the code to mark them as Checked In.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-blue-600">3.</span>
                            The system assigns a sequential Queue Token automatically.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Scan Modal */}
            {scanModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <QrCode className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Physical Record</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Scan the document using your printer/scanner and select the file(s) below.
                        </p>

                        <div className="w-full mb-6">
                            {scanModal.currentPages.length > 0 && (
                                <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl max-h-48 overflow-y-auto mb-4 border border-slate-200">
                                    {scanModal.currentPages.map((page, idx) => {
                                        const isPdf = page.startsWith('data:application/pdf') || page.endsWith('.pdf');
                                        return (
                                            <div key={idx} className="relative w-20 h-24 border border-slate-300 rounded shadow-sm group bg-white flex flex-col items-center justify-center">
                                                {isPdf ? (
                                                    <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                                                        <FileText className="h-8 w-8 mb-1" />
                                                        <span className="text-[8px] font-bold">PDF</span>
                                                    </div>
                                                ) : (
                                                    <img src={page} className="w-full h-full object-cover rounded opacity-80" alt={`Scanned page ${idx + 1}`} />
                                                )}
                                                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">{idx + 1}</span>
                                                <button 
                                                    onClick={() => handleDeletePage(idx)} 
                                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    x
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {scanModal.isScanning ? (
                                <div className="w-full space-y-2">
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-200"
                                            style={{ width: `${scanModal.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-blue-600">
                                        Scanning... {scanModal.progress}%
                                    </p>
                                </div>
                            ) : (
                                <Button 
                                    onClick={handleStartScan}
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-12 border-dashed border-2"
                                >
                                    <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    {scanModal.currentPages.length > 0 ? "Upload More Documents" : "Upload Scanned Documents"}
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button 
                                variant="ghost" 
                                className="flex-1"
                                onClick={() => setScanModal({ isOpen: false, patientId: null, progress: 0, isScanning: false, currentPages: [] })}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={handleSaveModal}
                            >
                                Save Documents
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
