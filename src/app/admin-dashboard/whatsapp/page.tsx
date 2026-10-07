'use client';

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import {
    MessageSquare, Send, CheckCircle2, XCircle, Loader2,
    Smartphone, Info, RefreshCw, Bell, Clock, QrCode, ExternalLink
} from 'lucide-react';

type ReminderLog = {
    id: string;
    reminder_type: string;
    message: string;
    scheduled_time: string;
    status: 'pending' | 'sent' | 'failed';
    sent_via: string;
    patient_name: string;
    patient_phone: string;
};

export default function WhatsAppSandboxPage() {
    const [phone, setPhone] = useState('');
    const [messageType, setMessageType] = useState<'freeform' | 'template' | 'appointment' | 'sms'>('freeform');
    const [customMessage, setCustomMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
    const [logs, setLogs] = useState<ReminderLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [sandboxInfo, setSandboxInfo] = useState<any>(null);

    useEffect(() => {
        loadSandboxInfo();
        loadLogs();
    }, []);

    const loadSandboxInfo = async () => {
        try {
            const res = await API.get('/whatsapp/sandbox-info');
            setSandboxInfo(res.data.data);
        } catch { /* silent */ }
    };

    const loadLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const res = await API.get('/whatsapp/reminder-logs');
            setLogs(res.data.data || []);
        } catch { /* silent */ }
        finally { setIsLoadingLogs(false); }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) { toast.error('Enter a phone number first.'); return; }
        setIsSending(true);
        setLastResult(null);
        try {
            const res = await API.post('/whatsapp/send-test', {
                phone: phone.trim(),
                messageType,
                customMessage: customMessage.trim() || undefined,
            });
            const { success, message } = res.data;
            setLastResult({ success, message });
            if (success) toast.success('Message sent!');
            else toast.error('Send failed — see details below.');
            loadLogs();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Request failed.';
            setLastResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setIsSending(false);
        }
    };

    const msgTypeOptions = [
        { value: 'freeform', label: 'Freeform WhatsApp', icon: '💬', desc: 'Rich text message (requires 24h session)' },
        { value: 'template', label: 'Pre-approved Template', icon: '✅', desc: 'Appointment template — works anytime' },
        { value: 'appointment', label: 'Appointment Confirmation', icon: '📅', desc: 'Full appointment confirmation message' },
        { value: 'sms', label: 'SMS Fallback', icon: '📱', desc: 'Plain SMS via Twilio phone number' },
    ];

    const statusColor = (status: string) => {
        if (status === 'sent') return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (status === 'failed') return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    };

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
                    <MessageSquare className="h-7 w-7 text-green-400" />
                    WhatsApp Sandbox
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Test and monitor your Twilio WhatsApp sandbox notifications.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* ─── LEFT: Setup Guide ─────────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Sandbox Setup Card */}
                    <div className="rounded-[20px] bg-green-500/5 border border-green-500/20 p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <QrCode className="h-4 w-4 text-green-400" />
                            </div>
                            <h2 className="font-bold text-foreground text-sm">Sandbox Setup</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-xl bg-background/50 border border-white/8 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sandbox Number</p>
                                <p className="font-mono font-bold text-green-400 text-sm">+1 415 523 8886</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Twilio WhatsApp Sandbox</p>
                            </div>

                            {sandboxInfo && (
                                <div className="rounded-xl bg-background/50 border border-white/8 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Account</p>
                                    <p className="font-mono text-xs text-foreground">{sandboxInfo.accountSid}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-foreground">How to Opt-In:</p>
                            {[
                                'Open WhatsApp on your phone',
                                'Add +14155238886 as a contact',
                                'Send the exact message: join <keyword>',
                                'You\'ll receive a confirmation reply',
                                'Now you can receive test messages!',
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <span className="h-4 w-4 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" /> Open Twilio Console
                        </a>
                    </div>

                    {/* Template Info */}
                    <div className="rounded-[20px] bg-primary/5 border border-primary/20 p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-primary" />
                            <p className="text-xs font-bold text-foreground">Pre-approved Template</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Template <span className="font-mono text-primary text-[10px]">HXb5b62575e...</span>
                        </p>
                        <p className="text-[11px] text-foreground font-medium bg-background/50 border border-white/8 rounded-lg p-2">
                            "Hello! <em>{'{{1}}'}</em> is your appointment on <em>{'{{2}}'}</em>"
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            ✅ Works even outside the 24-hour sandbox conversation window.
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT: Test Panel ─────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-[20px] bg-card border border-white/8 p-5 space-y-5">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Send className="h-4 w-4 text-primary" /> Send Test Message
                        </h2>

                        <form onSubmit={handleSendTest} className="space-y-4">
                            {/* Phone Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                    Recipient Phone Number
                                </label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="9876543210 or +919876543210"
                                        className="w-full h-[48px] pl-11 pr-4 rounded-2xl bg-background border border-white/8 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">10-digit Indian number or full E.164 format (+91...)</p>
                            </div>

                            {/* Message Type */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                    Message Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {msgTypeOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setMessageType(opt.value as any)}
                                            className={`text-left p-3 rounded-xl border transition-all ${
                                                messageType === opt.value
                                                    ? 'bg-primary/20 border-primary/40 text-foreground'
                                                    : 'bg-background border-white/8 text-muted-foreground hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-base">{opt.icon}</span>
                                            <p className="text-[11px] font-bold mt-1">{opt.label}</p>
                                            <p className="text-[9px] opacity-70 leading-tight mt-0.5">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Message (for freeform/sms) */}
                            {(messageType === 'freeform' || messageType === 'sms') && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                        Custom Message <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={e => setCustomMessage(e.target.value)}
                                        placeholder="Leave blank to send the default test message..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-2xl bg-background border border-white/8 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full h-[48px] rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-bold text-sm hover:bg-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Send className="h-4 w-4" /> Send Test Message</>
                                )}
                            </button>
                        </form>

                        {/* Result */}
                        {lastResult && (
                            <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
                                lastResult.success
                                    ? 'bg-green-500/10 border-green-500/25'
                                    : 'bg-red-500/10 border-red-500/25'
                            }`}>
                                {lastResult.success
                                    ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                    : <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                }
                                <p className={`text-sm font-medium leading-relaxed ${lastResult.success ? 'text-green-300' : 'text-red-300'}`}>
                                    {lastResult.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ─── Reminder Logs ──────────────────────────────── */}
                    <div className="rounded-[20px] bg-card border border-white/8 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-foreground flex items-center gap-2">
                                <Bell className="h-4 w-4 text-accent" /> Recent Notification Logs
                            </h2>
                            <button
                                onClick={loadLogs}
                                className="h-8 w-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {isLoadingLogs ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground font-semibold">No reminder logs yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Reminders will appear here when sent by the scheduler</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-none">
                                {logs.map(log => (
                                    <div key={log.id} className="rounded-xl bg-background/50 border border-white/5 p-3 flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColor(log.status)}`}>
                                                {log.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-xs font-bold text-foreground">{log.patient_name}</p>
                                                <span className="text-[9px] text-muted-foreground font-mono">{log.patient_phone}</span>
                                                <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full border border-accent/20">
                                                    {log.reminder_type}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{log.message}</p>
                                            <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                                                {new Date(log.scheduled_time).toLocaleString('en-IN')} · via {log.sent_via}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
