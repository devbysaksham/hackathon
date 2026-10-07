'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Stethoscope, Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function DoctorLoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            const { token, user } = res.data.data;
            if (user.role !== 'doctor') {
                toast.error('These credentials do not belong to a doctor account.');
                return;
            }
            setToken(token);
            setUser(user);
            toast.success(`Welcome, Dr. ${user.name}!`);
            router.push('/doctor/dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#03111F] flex items-center justify-center px-5 py-10">
            {/* Background glows */}
            <div className="fixed -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed -bottom-32 -left-32 w-80 h-80 bg-accent/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-primary/20 border border-primary/30 mb-5 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
                        <Stethoscope className="h-9 w-9 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Doctor Portal</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">SwasthSetu</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Sign in to your doctor account</p>
                </div>

                {/* Card */}
                <div className="rounded-[28px] bg-[#060F1C] border border-white/8 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="doctor@hospital.com"
                                className="w-full h-[52px] px-4 rounded-2xl bg-white/5 border border-white/8 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-[52px] px-4 pr-12 rounded-2xl bg-white/5 border border-white/8 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(0,255,255,0.3)] mt-2"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                            ) : (
                                <><ShieldCheck className="h-4 w-4" /> Sign In to Doctor Portal</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/5 text-center">
                        <p className="text-xs text-muted-foreground">
                            Default password for new doctors is{' '}
                            <span className="text-primary font-bold font-mono">doctor123</span>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    <a href="/login" className="text-primary hover:underline font-medium">← Back to main login</a>
                </p>
            </div>
        </div>
    );
}
