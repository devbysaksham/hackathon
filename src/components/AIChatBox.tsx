'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Send, Sparkles, User, CalendarDays, CreditCard, Bot, Stethoscope, ChevronRight, Paperclip, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProfileAvatar } from '@/components/app/ProfileAvatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AIChatBox({ className }: { className?: string }) {
    const router = useRouter();
    const { user, token, chatMessages, addChatMessage, booking, updateBooking, clearChat, resetBooking } = useAppStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [skippedLocations, setSkippedLocations] = useState<number[]>([]);

    // States for booking sub-interfaces in chat
    const [slotsData, setSlotsData] = useState<any[]>([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);
    const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(undefined);

    // Auto Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isTyping]);

    // Fetch slots when doctor and date are selected
    const fetchSlots = async (doctorId: string, dateStr: string) => {
        setIsSlotsLoading(true);
        try {
            const res = await API.get(`/doctors/${doctorId}/slots?date=${dateStr}`);
            setSlotsData(res.data.data.slots || []);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load doctor slots.');
        } finally {
            setIsSlotsLoading(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent, locationData?: { latitude: number, longitude: number }) => {
        if (e) e.preventDefault();

        const userMsg = input.trim() || (locationData ? "Here is my location." : "");
        if (!userMsg && !locationData) return;

        if (input.trim()) {
            setInput('');
        }
        
        // Handle Cancel command
        if (userMsg.toLowerCase() === 'cancel') {
            clearChat();
            resetBooking();
            return;
        }

        if (!locationData) {
            addChatMessage({
                sender: 'user',
                text: userMsg,
                timestamp: new Date()
            });
        } else {
            addChatMessage({
                sender: 'user',
                text: "📍 Shared Location",
                timestamp: new Date()
            });
        }

        setIsTyping(true);
        try {
            // Include location data if available. For location sharing, we send the last symptoms.
            const messageToSend = locationData && booking.symptoms ? booking.symptoms : userMsg;
            
            const payload: any = { message: messageToSend };
            if (locationData) {
                payload.latitude = locationData.latitude;
                payload.longitude = locationData.longitude;
            }

            const res = await API.post('/ai/chat', payload);
            console.log('🟢 AI API response:', res.data);
            const aiData = res.data.data;

            // Prepare chat message with proper fields
            const newAiMessage = {
                sender: 'ai' as const,
                text: aiData.message,
                timestamp: new Date(),
                actionHint: aiData.actionHint,
                // Preserve any additional structured data for UI components
                data: aiData,
                requestLocation: aiData.requestLocation
            };
            addChatMessage(newAiMessage);

            // Update booking details if additional data is provided
            if (aiData.specialization || aiData.urgency || aiData.recommendedDoctors) {
                updateBooking({
                    symptoms: messageToSend,
                    ...(aiData.urgency && { urgency: aiData.urgency }),
                    ...(aiData.specialization && { specialization: aiData.specialization }),
                    ...(aiData.recommendedDoctors && { recommendedDoctors: aiData.recommendedDoctors })
                });
            }
        } catch (err) {
            console.error(err);
            toast.error('AI agent encountered a problem. Please try again.');
        } finally {
            setIsTyping(false);
        }
    };

    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.info("Requesting location access...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleSendMessage(undefined, { latitude, longitude });
            },
            (error) => {
                console.error("Location error:", error);
                toast.error("Failed to get location. Please allow location permissions.");
            }
        );
    };

    // Doctor Selection
    const handleSelectDoctor = (doctor: any) => {
        updateBooking({ selectedDoctor: doctor });
        
        addChatMessage({
            sender: 'user',
            text: `I want to book an appointment with Dr. ${doctor.name}.`,
            timestamp: new Date()
        });

        addChatMessage({
            sender: 'ai',
            text: `Perfect! Dr. ${doctor.name} is selected. Please pick a date and slot for your consultation:`,
            timestamp: new Date(),
            actionHint: 'select_slot'
        });
    };

    // Date Picker trigger
    const handleDateChange = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDateObj(date);
        const dateStr = format(date, 'yyyy-MM-dd');
        updateBooking({ selectedDate: dateStr, selectedSlot: '' }); // Reset slot
        
        if (booking.selectedDoctor) {
            fetchSlots(booking.selectedDoctor.id, dateStr);
        }
    };

    // Slot Selection
    const handleSelectSlot = (slotTime: string) => {
        updateBooking({ selectedSlot: slotTime });

        addChatMessage({
            sender: 'user',
            text: `I select the slot on ${booking.selectedDate} at ${slotTime}.`,
            timestamp: new Date()
        });

        addChatMessage({
            sender: 'ai',
            text: `Great. Please verify your contact details below to proceed with the booking:`,
            timestamp: new Date(),
            actionHint: 'patient_form'
        });
    };

    // Details Form Submit
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const age = formData.get('age') as string;
        const gender = formData.get('gender') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const address = formData.get('address') as string;
        
        if (!name || !age || !gender || !phone || !email) {
            toast.warning('Please fill all required fields');
            return;
        }

        const patientForm = { name, age, gender, phone, email, address, emergencyContact: '' };
        updateBooking({ patientForm });

        addChatMessage({
            sender: 'user',
            text: `My contact details: ${name}, ${age}yo ${gender}, Ph: ${phone}.`,
            timestamp: new Date()
        });

        // Trigger pending appointment creation
        createAppointment(patientForm);
    };

    const createAppointment = async (patientForm: any) => {
        if (!token) {
            addChatMessage({
                sender: 'ai',
                text: "Please sign in or register to complete your appointment booking. You will be redirected to the login page.",
                timestamp: new Date(),
                actionHint: 'redirect_login'
            });
            return;
        }

        setIsTyping(true);
        try {
            // Create pending appointment — include form details so backend updates patient profile
            const res = await API.post('/appointments', {
                doctorId: booking.selectedDoctor.id,
                appointmentDate: booking.selectedDate,
                appointmentTime: booking.selectedSlot,
                symptoms: booking.symptoms,
                urgencyLevel: booking.urgency,
                aiSummary: `AI diagnosed specialization: ${booking.specialization}. Symptoms: ${booking.symptoms}. Contact: ${patientForm.phone}.`,
                amount: booking.selectedDoctor.fee,
                // Patient details from the form — backend will update the patient profile
                patientName: patientForm.name,
                patientAge: patientForm.age,
                patientGender: patientForm.gender,
                patientPhone: patientForm.phone,
                patientEmail: patientForm.email,
            });

            const appDetails = res.data.data;
            updateBooking({ pendingAppointment: appDetails });

            setIsTyping(false);
            addChatMessage({
                sender: 'ai',
                text: `Pending appointment registered! Order receipt generated. Total fee: ₹${booking.selectedDoctor.fee}. Please click the button below to pay and confirm.`,
                timestamp: new Date(),
                actionHint: 'checkout_payment'
            });

        } catch (err: any) {
            console.error(err);
            setIsTyping(false);
            toast.error(err.response?.data?.message || 'Failed to create booking.');
        }
    };

    // Razorpay checkout
    const handleCheckout = async () => {
        console.log('--- handleCheckout Init ---');
        console.log('Pending Appointment State:', booking.pendingAppointment);

        const appointmentId = booking.pendingAppointment?.appointment?.id || 
                              booking.pendingAppointment?.razorpay?.appointment_id || 
                              booking.pendingAppointment?.id;
        
        console.log('Resolved appointmentId:', appointmentId);
        
        if (!appointmentId) {
            console.error('Checkout Error: appointmentId is missing from pendingAppointment object');
            toast.error('Invalid appointment context. Please try booking again.');
            return;
        }

        try {
            console.log('Calling API to create Razorpay order with appointmentId:', appointmentId);
            // 1. Create order
            const res = await API.post('/payments/create-order', { appointmentId });
            console.log('Create order API Response:', res.data);
            
            const orderData = res.data.data;
            if (!orderData || !orderData.order_id) {
                console.error('Checkout Error: API did not return valid order_id', orderData);
                toast.error('Failed to generate payment order from server.');
                return;
            }

            console.log('Loading Razorpay script...');
            // Load Razorpay script if not loaded
            const loadScript = (src: string) => {
                return new Promise((resolve) => {
                    if (document.querySelector(`script[src="${src}"]`)) {
                        console.log('Razorpay script already present in DOM.');
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
            console.log('Razorpay script loaded status:', isLoaded);

            if (!isLoaded) {
                console.error('Checkout Error: Razorpay script failed to load');
                toast.error('Failed to load payment gateway. Check network.');
                return;
            }

            if (!(window as any).Razorpay) {
                console.error('Checkout Error: window.Razorpay is undefined after script load');
                toast.error('Payment gateway initialization failed.');
                return;
            }

            console.log('Initializing Razorpay checkout window options...');
            // 2. Open checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'SwasthSetu Health',
                description: `Appointment Consultation Fee`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    console.log('Razorpay Payment Success Callback Triggered!');
                    console.log('Razorpay response:', response);
                    // 3. Verify Payment
                    try {
                        console.log('Calling API to verify payment signature...');
                        const verifyRes = await API.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId: orderData.appointment_id || appointmentId
                        });
                        console.log('Verification Response:', verifyRes.data);

                        toast.success('Payment completed successfully!');
                        
                        addChatMessage({
                            sender: 'ai',
                            text: `🎉 Payment successful! Your appointment is confirmed (Token No: ${verifyRes.data.data.tokenNo}). Check the details below or in your records.`,
                            timestamp: new Date()
                        });

                        resetBooking();

                        router.push(`/confirmation?id=${orderData.appointment_id || appointmentId}`);
                    } catch (e: any) {
                        console.error('Payment Verification API Error:', e);
                        toast.error('Payment verification failed.');
                    }
                },
                prefill: {
                    name: booking.patientForm?.name,
                    email: booking.patientForm?.email,
                    contact: booking.patientForm?.phone
                },
                theme: {
                    color: '#2563EB' // blue color theme
                }
            };

            console.log('Creating Razorpay instance with options:', options);
            const rzp = new (window as any).Razorpay(options);
            
            rzp.on('payment.failed', function (response: any) {
                console.error('Razorpay Payment Failed Event:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
            });

            console.log('Opening Razorpay UI...');
            rzp.open();

        } catch (err: any) {
            console.error('Checkout Exception caught:', err);
            toast.error(err.response?.data?.message || 'Payment checkout failed. Please try again.');
        }
    };

    return (
        <div className={cn("flex flex-col flex-1 min-h-0 bg-transparent overflow-hidden relative", className)}>
            {/* Stable Glass Header */}
            <div className="flex-none z-20 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[15px] text-foreground leading-none flex items-center gap-2">
                            Swasth Setu AI 
                            <span className="relative flex h-2.5 w-2.5 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(0,255,255,0.6)]"></span>
                            </span>
                        </h2>
                        <span className="text-[11px] text-muted-foreground font-medium">Always here to help</span>
                    </div>
                </div>
            </div>

            {/* Message Pane */}
            <ScrollArea className="flex-1 min-h-0 bg-transparent">
                <div className="space-y-6 max-w-3xl mx-auto py-6 px-4 md:px-6">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className={cn("flex items-end gap-3", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className="shrink-0 mb-1">
                                    {msg.sender === 'user' ? (
                                        <ProfileAvatar name={user?.name || 'User'} size="sm" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                                <div className={cn(
                                    "p-4 max-w-[85%] text-[14px] leading-relaxed shadow-sm transition-all relative overflow-hidden",
                                    msg.sender === 'user'
                                        ? "bg-primary/20 text-primary rounded-[1.5rem] rounded-tr-sm shadow-[0_0_15px_rgba(0,255,255,0.1)] border border-primary/20 font-medium"
                                        : "glass-card text-foreground rounded-[1.5rem] rounded-tl-sm border border-white/10"
                                )}>
                                    {msg.sender === 'user' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    )}
                                    <p className="whitespace-pre-line relative z-10">{msg.text}</p>
                                </div>
                            </div>

                            {/* Render Inline Interfaces depending on the Action Hint */}
                            {msg.sender === 'ai' && msg.actionHint === 'select_doctor' && msg.data?.recommendedDoctors && (
                                <div className="ml-11 mr-4 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden max-w-full flex flex-col">
                                    {(msg.requestLocation && !skippedLocations.includes(index)) ? (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-100 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-[14px]">Find nearest doctors?</h4>
                                                    <p className="text-[12px] text-blue-600/80 dark:text-blue-300">Share your location to sort by distance.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => setSkippedLocations(prev => [...prev, index])}
                                                    className="rounded-xl h-9 px-4 text-[13px] font-semibold flex-1 sm:flex-none border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900"
                                                >
                                                    Skip
                                                </Button>
                                                <Button 
                                                    onClick={handleShareLocation}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-[13px] font-semibold shadow-sm flex-1 sm:flex-none"
                                                >
                                                    Share Location
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto hide-scrollbar">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <tr>
                                                    <th className="font-semibold py-3 px-4">Doctor</th>
                                                    <th className="font-semibold py-3 px-4">Specialization</th>
                                                    <th className="font-semibold py-3 px-4">Hospital</th>
                                                    <th className="font-semibold py-3 px-4">Fees</th>
                                                    <th className="font-semibold py-3 px-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                {msg.data.recommendedDoctors.map((doc: any) => (
                                                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                        <td className="py-3 px-4 min-w-[200px]">
                                                            <div className="flex items-center gap-3">
                                                                <ProfileAvatar name={doc.name} size="sm" className="h-10 w-10 rounded-xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-800" />
                                                                <div>
                                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-[14px]">Dr. {doc.name}</div>
                                                                    <div className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                                        <Sparkles className="h-3 w-3 text-amber-500" /> {doc.experience} Years Exp
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-teal-600 dark:text-teal-400 font-medium text-[13px]">{doc.specialization}</td>
                                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[13px]">
                                                            {doc.hospital_name ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium truncate max-w-[150px]">{doc.hospital_name}</span>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        {doc.hospital_category && <span className="text-[11px] text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{doc.hospital_category}</span>}
                                                                        {doc.distance !== undefined && <span className="text-[11px] text-blue-500 font-medium">{doc.distance.toFixed(1)} km away</span>}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 italic">Independent</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 font-black text-slate-700 dark:text-slate-300">₹{doc.fee}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {doc.hospital_google_maps_link && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                                        onClick={() => window.open(doc.hospital_google_maps_link, '_blank')}
                                                                        title="View on Google Maps"
                                                                    >
                                                                        <MapPin className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleSelectDoctor(doc)}
                                                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl h-9 px-5 text-[13px] font-semibold shadow-sm transition-all group-hover:shadow-md"
                                                                >
                                                                    Book Now
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    )}
                                </div>
                            )}

                            {msg.sender === 'ai' && msg.actionHint === 'select_slot' && booking.selectedDoctor && (
                                <div className="ml-11 mr-4 mt-2 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-tight">Pick a Date & Time</h4>
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Dr. {booking.selectedDoctor.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Popover>
                                            <PopoverTrigger className="w-full flex items-center justify-between font-medium cursor-pointer bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-11 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 px-4">
                                                {selectedDateObj ? format(selectedDateObj, 'PPP') : <span className="text-slate-400">Select Date...</span>}
                                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDateObj}
                                                    onSelect={handleDateChange}
                                                    disabled={(date) => {
                                                        const today = new Date();
                                                        today.setHours(0,0,0,0);
                                                        return date < today;
                                                    }}
                                                    className="bg-white rounded-2xl"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {booking.selectedDate && (
                                        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-2 mb-2">Available Slots</span>
                                            {isSlotsLoading ? (
                                                <p className="text-xs text-slate-400 flex items-center gap-2"><Sparkles className="h-3 w-3 animate-spin"/> Loading...</p>
                                            ) : slotsData.length === 0 ? (
                                                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">No slots available for this day. Fully booked.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {slotsData.map((slot) => (
                                                        <Button
                                                            key={slot.time}
                                                            variant={slot.isFull ? "ghost" : "outline"}
                                                            disabled={slot.isFull}
                                                            onClick={() => handleSelectSlot(slot.time)}
                                                            className={cn(
                                                                "h-12 flex flex-col items-center justify-center cursor-pointer rounded-xl transition-all border",
                                                                slot.isFull 
                                                                    ? "opacity-30 line-through bg-slate-50" 
                                                                    : "border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
                                                            )}
                                                        >
                                                            <span className="text-[12px] font-bold">{slot.time}</span>
                                                            <span className="text-[9px] font-medium text-slate-500">{slot.available} Left</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {msg.sender === 'ai' && msg.actionHint === 'patient_form' && (
                                <form onSubmit={handleFormSubmit} className="ml-11 mr-4 mt-2 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-tight">Patient Details</h4>
                                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Please verify information</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                                            <Input name="name" defaultValue={user?.name || ''} className="h-11 text-[13px] font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500/20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Age</label>
                                                <Input name="age" defaultValue={user?.age?.toString() || ''} placeholder="e.g. 28" className="h-11 text-[13px] font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500/20" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Gender</label>
                                                <Input name="gender" defaultValue={user?.gender || ''} placeholder="e.g. Male" className="h-11 text-[13px] font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500/20" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mobile Number</label>
                                            <Input name="phone" defaultValue={user?.phone || ''} className="h-11 text-[13px] font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500/20" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                                            <Input name="email" type="email" defaultValue={user?.email || ''} className="h-11 text-[13px] font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500/20" />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold text-[13px] h-12 rounded-xl shadow-md transition-all active:scale-[0.98]">
                                        Confirm Details
                                    </Button>
                                </form>
                            )}

                            {msg.sender === 'ai' && msg.actionHint === 'redirect_login' && (
                                <div className="ml-11 mt-2">
                                    <Link href="/login" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-10 text-xs flex items-center justify-center px-4 w-fit">Go to Login</Link>
                                </div>
                            )}

                            {msg.sender === 'ai' && msg.actionHint === 'checkout_payment' && booking.pendingAppointment && (
                                <div className="ml-11 mr-4 mt-2 p-1 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="p-5 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-tight">Booking Summary</h4>
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Review and pay</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 pt-4 space-y-4">
                                        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800 space-y-3">
                                            <div className="flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-medium">Consultation Fee</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">₹{booking.selectedDoctor?.fee}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-medium">Doctor</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">Dr. {booking.selectedDoctor?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-medium">Slot</span>
                                                <span className="font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg">{booking.selectedSlot}</span>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleCheckout} 
                                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold text-[14px] h-14 rounded-2xl shadow-md group flex items-center justify-between px-6 transition-all active:scale-[0.98]"
                                        >
                                            <span>Pay ₹{booking.selectedDoctor?.fee}</span>
                                            <div className="bg-white/20 dark:bg-black/10 p-1.5 rounded-xl group-hover:translate-x-1 transition-transform">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* AI typing state */}
                    {isTyping && (
                        <div className="flex items-end gap-3 animate-in fade-in duration-300">
                            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)] shrink-0 mb-1">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="px-5 py-4 rounded-[1.5rem] rounded-tl-sm glass-card flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Form Pill */}
            <div className="flex-none px-4 pb-4 pt-2 z-20 flex justify-center bg-transparent">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center glass-card rounded-full p-2 pl-5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-full max-w-3xl">
                    <button type="button" className="text-muted-foreground hover:text-primary transition-colors shrink-0 flex items-center justify-center group">
                        <Paperclip className="h-[22px] w-[22px] group-hover:scale-110 transition-transform" />
                    </button>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your symptoms to Swasth Setu AI..."
                        disabled={isTyping}
                        className="flex-1 bg-transparent border-none h-12 px-3 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none font-medium text-foreground placeholder:text-muted-foreground/70 placeholder:font-normal"
                    />
                    <Button 
                        type="submit" 
                        disabled={isTyping || !input.trim()}
                        size="icon" 
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-full shrink-0 h-[42px] w-[42px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,255,255,0.2)] cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send className="h-[18px] w-[18px] ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
