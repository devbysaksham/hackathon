'use client';

import React, { useState } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Search, Printer, FileText, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReceiptsPage() {
    const [appointmentCode, setAppointmentCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointmentCode.trim()) return;

        setIsLoading(true);
        try {
            const res = await API.get(`/admin/appointments/code/${appointmentCode.trim().toUpperCase()}`);
            setAppointment(res.data.data);
            toast.success('Record found! Ready to print.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Appointment not found');
            setAppointment(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        if (!appointment) return;

        const printWindow = window.open('', '', 'height=1000,width=800');
        if (!printWindow) return;

        const dateObj = new Date(appointment.appointment_date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Print Documents - ${appointment.appointment_code}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #000;
                        font-size: 11px;
                        line-height: 1.3;
                    }
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        position: relative;
                        page-break-after: always;
                        background: #fff;
                    }
                    @media print {
                        body { background: #fff; }
                        .page { margin: 0; box-shadow: none; padding: 10mm; }
                    }

                    /* Header Styles */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid ${appointment.receipt_color || '#2e7d32'};
                        padding-bottom: 10px;
                    }
                    .logo-section h1 {
                        color: ${appointment.receipt_color || '#2e7d32'};
                        margin: 0;
                        font-size: 32px;
                        font-weight: 900;
                        letter-spacing: -1px;
                        text-transform: lowercase;
                    }
                    .logo-section p {
                        margin: 0;
                        font-size: 10px;
                        font-weight: bold;
                        color: #333;
                    }
                    .header-right {
                        text-align: right;
                    }
                    
                    /* Tables */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 4px 6px;
                        text-align: left;
                    }
                    .patient-table td {
                        width: 25%;
                    }
                    .label {
                        font-weight: bold;
                        font-size: 10px;
                    }
                    
                    /* Sections */
                    .section-title {
                        font-weight: bold;
                        font-size: 11px;
                        margin: 10px 0 5px 0;
                        text-transform: uppercase;
                        background: #f0f0f0;
                        padding: 3px;
                        border: 1px solid #000;
                    }
                    .content-box {
                        border: 1px solid #000;
                        min-height: 100px;
                        padding: 5px;
                        margin-bottom: 10px;
                    }
                    
                    /* Footer */
                    .footer {
                        position: absolute;
                        bottom: 15mm;
                        left: 15mm;
                        right: 15mm;
                        text-align: center;
                        border-top: 3px solid ${appointment.receipt_color || '#2e7d32'};
                        padding-top: 10px;
                        font-size: 10px;
                        font-weight: bold;
                    }

                    .checklist {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .checklist li {
                        padding: 2px 0;
                        border-bottom: 1px solid #eee;
                    }
                </style>
            </head>
            <body>
                <!-- PAGE 1: PAYMENT RECEIPT -->
                <div class="page">
                    <div class="header">
                        <div class="logo-section">
                            <h1>${appointment.receipt_header_text || 'ahrc'}</h1>
                            <p>${appointment.receipt_header_subtext || 'अरिहंत हॉस्पिटल एंड रिसर्च सेंटर'}</p>
                        </div>
                        <div class="header-right">
                            <h3>PAYMENT RECEIPT</h3>
                            <p><strong>Receipt No:</strong> RCPT-${appointment.id}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                        </div>
                    </div>
                    
                    <h3 style="text-align: center; text-decoration: underline;">FEE RECEIPT</h3>
                    
                    <table>
                        <tr>
                            <td class="label">Patient Name:</td>
                            <td>${appointment.patient_name}</td>
                            <td class="label">Age/Gender:</td>
                            <td>${appointment.patient_age} Y / ${appointment.patient_gender}</td>
                        </tr>
                        <tr>
                            <td class="label">Mobile:</td>
                            <td>${appointment.patient_phone}</td>
                            <td class="label">Appt Code:</td>
                            <td>${appointment.appointment_code}</td>
                        </tr>
                        <tr>
                            <td class="label">Consulting Doctor:</td>
                            <td>Dr. ${appointment.doctor_name}</td>
                            <td class="label">Department:</td>
                            <td>${appointment.department || 'General'}</td>
                        </tr>
                    </table>

                    <table style="margin-top: 30px;">
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="width: 10%;">S.No.</th>
                                <th style="width: 60%;">Description</th>
                                <th style="width: 30%;">Amount (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align: center;">1</td>
                                <td>Consultation Fee</td>
                                <td style="text-align: right;">₹ ${parseFloat(appointment.amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: right; font-weight: bold;">Total Amount Paid:</td>
                                <td style="text-align: right; font-weight: bold;">₹ ${parseFloat(appointment.amount).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top: 40px; text-align: right;">
                        <p>_______________________</p>
                        <p>Authorized Signatory</p>
                    </div>

                    <div class="footer">
                        283-A, Gumasta Nagar, Near Shiv Mandir, Indore-452009 (M.P.)<br>
                        Phone: 0731-4725100 | Email: arihanthosp@yahoo.com<br>
                        Emergency No.: 9179015176
                    </div>
                </div>

                <!-- PAGE 2: INITIAL ASSESSMENT -->
                <div class="page">
                    <div class="header">
                        <div class="logo-section">
                            <h1>${appointment.receipt_header_text || 'ahrc'}</h1>
                            <p>${appointment.receipt_header_subtext || 'अरिहंत हॉस्पिटल एंड रिसर्च सेंटर'}</p>
                        </div>
                    </div>
                    
                    <div class="section-title">PATIENT DETAILS:-</div>
                    <table class="patient-table">
                        <tr>
                            <td class="label">Appt No.</td>
                            <td>${appointment.appointment_code}</td>
                            <td class="label">Date & Time</td>
                            <td>${formattedDate} ${appointment.appointment_time}</td>
                        </tr>
                        <tr>
                            <td class="label">Patient's Name</td>
                            <td>${appointment.patient_name}</td>
                            <td class="label">Gender</td>
                            <td>${appointment.patient_gender}</td>
                        </tr>
                        <tr>
                            <td class="label">Age</td>
                            <td>${appointment.patient_age} Y</td>
                            <td class="label">Category</td>
                            <td>CASH/SELF</td>
                        </tr>
                        <tr>
                            <td class="label">Contact No.</td>
                            <td>${appointment.patient_phone}</td>
                            <td class="label">Identity No.</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td class="label">Address</td>
                            <td colspan="3">${appointment.patient_address || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Department Name</td>
                            <td>${appointment.department || 'General'}</td>
                            <td class="label">Consultant Name</td>
                            <td>Dr. ${appointment.doctor_name}</td>
                        </tr>
                    </table>

                    <div class="section-title">VITALS FOR INITIAL ASSESSMENT:-</div>
                    <table>
                        <tr>
                            <td class="label">Heart rate -</td>
                            <td></td>
                            <td class="label">Weight -</td>
                            <td></td>
                            <td class="label">BMI -</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td class="label">Respiratory Rate -</td>
                            <td></td>
                            <td class="label">Blood Pressure -</td>
                            <td></td>
                            <td class="label">Pulse rate -</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td class="label">SPO2 -</td>
                            <td></td>
                            <td class="label">Pain score (0-10) -</td>
                            <td></td>
                        </tr>
                    </table>

                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 2;">
                            <div class="section-title">CHIEF COMPLAINTS & HISTORY OF PRESENT ILLNESS:-</div>
                            <div class="content-box" style="min-height: 400px; border: 1px solid #000;"></div>
                        </div>
                        <div style="flex: 1;">
                            <div class="section-title">PAST MEDICAL HISTORY & SURGICAL HISTORY:-</div>
                            <table style="font-size: 9px;">
                                <tr><td>Diabetes Mellitus</td><td></td></tr>
                                <tr><td>Hypertension</td><td></td></tr>
                                <tr><td>Coronary Heart Disease</td><td></td></tr>
                                <tr><td>Thyroidism (Hypo/Hyper)</td><td></td></tr>
                                <tr><td>Congestive Heart Failure</td><td></td></tr>
                                <tr><td>Stroke</td><td></td></tr>
                                <tr><td>Asthma/ COPD</td><td></td></tr>
                                <tr><td>Jaundice/ Hepatitis</td><td></td></tr>
                                <tr><td>Tuberculosis</td><td></td></tr>
                                <tr><td>Epilepsy/ Seizure</td><td></td></tr>
                                <tr><td>Cancer</td><td></td></tr>
                                <tr><td>Allergies</td><td></td></tr>
                                <tr><td>Surgery if any</td><td></td></tr>
                            </table>
                        </div>
                    </div>

                    <div class="footer">
                        283-A, Gumasta Nagar, Near Shiv Mandir, Indore-452009 (M.P.)<br>
                        Phone: 0731-4725100 | Email: arihanthosp@yahoo.com<br>
                        Emergency No.: 9179015176
                    </div>
                </div>

                <!-- PAGE 3: PRESCRIPTION & PLAN OF CARE -->
                <div class="page">
                    <div class="header">
                        <div class="logo-section">
                            <h1>${appointment.receipt_header_text || 'ahrc'}</h1>
                            <p>${appointment.receipt_header_subtext || 'अरिहंत हॉस्पिटल एंड रिसर्च सेंटर'}</p>
                        </div>
                    </div>

                    <div class="section-title">SYSTEMIC EXAMINATION:-</div>
                    <div class="content-box" style="min-height: 80px;"></div>

                    <div class="section-title">PROVISIONAL DIAGNOSIS:-</div>
                    <div class="content-box" style="min-height: 60px;"></div>

                    <div class="section-title">INVESTIGATIONS:-</div>
                    <div class="content-box" style="min-height: 100px;"></div>

                    <div class="section-title">TREATMENT / PRESCRIPTION:-</div>
                    <table>
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="width: 35%;">Drug Name</th>
                                <th style="width: 10%;">Dose</th>
                                <th style="width: 10%;">Route</th>
                                <th style="width: 15%;">Frequency</th>
                                <th style="width: 15%;">Duration</th>
                                <th style="width: 15%;">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                            <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>
                        </tbody>
                    </table>

                    <div class="section-title">PLAN OF CARE:-</div>
                    <div class="content-box" style="min-height: 100px;"></div>

                    <div class="section-title">DIET INSTRUCTIONS:-</div>
                    <div class="content-box" style="min-height: 60px;"></div>

                    <div class="footer">
                        283-A, Gumasta Nagar, Near Shiv Mandir, Indore-452009 (M.P.)<br>
                        Phone: 0731-4725100 | Email: arihanthosp@yahoo.com<br>
                        Emergency No.: 9179015176
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            // Optional: auto-close after print dialog closes
                            // window.close();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="p-6 md:p-8 h-full max-w-5xl mx-auto flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="h-6 w-6 text-indigo-600" />
                    Receipts & Forms Generator
                </h1>
                <p className="text-slate-500 mt-1">Print payment receipts and clinical assessment templates for patients.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter Appointment Code</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. SV-1234-ABCD"
                                value={appointmentCode}
                                onChange={(e) => setAppointmentCode(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        disabled={!appointmentCode || isLoading}
                        className="w-full md:w-auto px-8 py-3 h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Fetch Details'}
                    </Button>
                </form>
            </div>

            {appointment && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Preview details</h2>
                        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl shadow-lg shadow-emerald-600/20">
                            <Printer className="h-4 w-4" />
                            Print 3-Page Document
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Patient Name</span>
                            <p className="font-semibold text-slate-900">{appointment.patient_name}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Appointment Code</span>
                            <p className="font-mono font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">{appointment.appointment_code}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Demographics</span>
                            <p className="font-medium text-slate-700">{appointment.patient_age} Years / {appointment.patient_gender}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Doctor</span>
                            <p className="font-medium text-slate-700">Dr. {appointment.doctor_name}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Amount Paid</span>
                            <p className="font-semibold text-emerald-600">₹ {appointment.amount}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed">
                            <p className="font-semibold text-slate-900 mb-1">Document Contents</p>
                            <p>Clicking the print button will generate a 3-page A4 document consisting of:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500">
                                <li>Payment Fee Receipt</li>
                                <li>Initial Clinical Assessment Form</li>
                                <li>Systemic Examination & Prescription Form</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
