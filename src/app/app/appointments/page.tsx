'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import AppointmentCard from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Clock, Loader2, Stethoscope, CheckCircle2, XCircle,
    CalendarCheck, Sparkles, Copy, Check, MapPin, CreditCard, User
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppAppointmentsPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            const res = await API.get('/appointments/my');
            setAppointments(res.data.data || []);
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to load appointments.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
            return;
        }
        loadAppointments();
    }, [user, token]);

    const handlePayAndConfirm = async (appointmentId: string) => {
        try {
            // Create Razorpay order
            const res = await API.post('/payments/create-order', { appointmentId });
            const orderData = res.data.data;
            if (!orderData || !orderData.order_id) {
                toast.error('Failed to generate payment order from server.');
                return;
            }

            // Load Razorpay script
            const loadScript = (src: string) => {
                return new Promise((resolve) => {
                    if (document.querySelector(`script[src="${src}"]`)) {
                        resolve(true);
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
            };

            const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!isLoaded || !(window as any).Razorpay) {
                toast.error('Failed to load payment gateway. Check network.');
                return;
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'SwasthSetu Health',
                description: 'Appointment Consultation Fee',
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    try {
                        await API.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId: orderData.appointment_id || appointmentId
                        });
                        toast.success('Payment completed successfully!');
                        router.push(`/confirmation?id=${orderData.appointment_id || appointmentId}`);
                    } catch (e: any) {
                        toast.error('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: '#2563EB' }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Payment checkout failed.');
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const confirmed = appointments.filter((a) => a.appointment_status === 'confirmed');
    const pending = appointments.filter((a) => a.appointment_status === 'pending');
    const cancelled = appointments.filter((a) => a.appointment_status === 'cancelled');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-blue-200/30 animate-ping" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Loading appointments...</p>
            </div>
        );
    }

    const renderEmpty = (icon: React.ReactNode, message: string, sub: string) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mb-4">
                {icon}
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{message}</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">{sub}</p>
        </div>
    );

    return (
        <div className="space-y-4 pb-6 w-full max-w-full animate-fade-in-up">
            {/* Gradient Header Banner */}
            <div className="relative overflow-hidden rounded-[24px] glass-card p-5 border border-white/5 w-full max-w-full">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full filter blur-[40px]" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/15 rounded-full filter blur-[30px]" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <CalendarCheck className="h-[18px] w-[18px] shrink-0 text-primary" />
                            <span className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">My Appointments</span>
                        </div>
                        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">Your Visits</h2>
                        <p className="text-[13px] font-medium text-muted-foreground mt-1">{appointments.length} total &middot; {confirmed.length} confirmed</p>
                    </div>
                    <Button asChild size="sm" className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary text-[13px] font-bold border border-primary/20 rounded-xl shadow-sm cursor-pointer h-9 px-4 transition-colors">
                        <Link href="/app/chat">
                            <Sparkles className="h-4 w-4 mr-1.5" />
                            Book via AI
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-full">
                <div className="glass-card rounded-[20px] p-3 text-center border border-white/5 min-w-0 flex flex-col items-center justify-center h-24 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-extrabold text-foreground leading-none">{confirmed.length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Confirmed</p>
                </div>
                <div className="glass-card rounded-[20px] p-3 text-center border border-white/5 min-w-0 flex flex-col items-center justify-center h-24 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto mb-1.5">
                        <Clock className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-lg font-extrabold text-foreground leading-none">{pending.length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Pending</p>
                </div>
                <div className="glass-card rounded-[20px] p-3 text-center border border-white/5 min-w-0 flex flex-col items-center justify-center h-24 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center mx-auto mb-1.5">
                        <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <p className="text-lg font-extrabold text-foreground leading-none">{cancelled.length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Cancelled</p>
                </div>
            </div>

            {/* Tabs / Filter Buttons */}
            <Tabs defaultValue="confirmed" className="w-full flex flex-col">
                <TabsList className="flex w-full h-[48px] glass-panel border border-white/5 p-1.5 rounded-[16px]">
                    <TabsTrigger value="confirmed" className="flex-1 rounded-[12px] text-[13px] font-bold h-full cursor-pointer data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all text-muted-foreground">
                        Confirmed {confirmed.length > 0 && `(${confirmed.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex-1 rounded-[12px] text-[13px] font-bold h-full cursor-pointer data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all text-muted-foreground">
                        Pending {pending.length > 0 && `(${pending.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="flex-1 rounded-[12px] text-[13px] font-bold h-full cursor-pointer data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all text-muted-foreground">
                        Cancelled {cancelled.length > 0 && `(${cancelled.length})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="confirmed" className="mt-4 space-y-4 animate-fade-in-up">
                    {confirmed.length === 0
                        ? renderEmpty(
                              <CheckCircle2 className="h-9 w-9 text-indigo-400" />,
                              'No confirmed appointments',
                              'Book a consultation with a specialist.'
                          )
                        : confirmed.map((app) => <AppointmentCard key={app.id} app={app} onViewDetails={(id) => router.push(`/confirmation?id=${id}`)} />)
                    }
                </TabsContent>

                <TabsContent value="pending" className="mt-4 space-y-4 animate-fade-in-up">
                    {pending.length === 0
                        ? renderEmpty(
                              <Clock className="h-9 w-9 text-amber-400" />,
                              'No pending appointments',
                              'Your requested appointments will appear here.'
                          )
                        : pending.map((app) => <AppointmentCard key={app.id} app={app} onAction={(id) => handlePayAndConfirm(id)} />)
                    }
                </TabsContent>

                <TabsContent value="cancelled" className="mt-4 space-y-4 animate-fade-in-up">
                    {cancelled.length === 0
                        ? renderEmpty(
                              <XCircle className="h-9 w-9 text-rose-400" />,
                              'No cancelled appointments',
                              'Good news! You haven\'t cancelled any appointments.'
                          )
                        : cancelled.map((app) => <AppointmentCard key={app.id} app={app} onViewDetails={(id) => router.push(`/confirmation?id=${id}`)} />)
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}


