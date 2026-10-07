'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Activity, ShieldCheck, UserCheck, Loader2, Sparkles, Eye, EyeOff, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = zod.object({
    email: zod.string().email('Please enter a valid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = zod.infer<typeof loginSchema>;

const DEMO_CREDENTIALS = {
    patient: { email: 'patient@swasthsetu.health', password: 'patient123' },
    admin: { email: 'saksham@gmail.com', password: 'admin123' },
    org: { email: 'org@swasthstu.com', password: 'orgadmin123' },
} as const;

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeRole, setActiveRole] = useState<'patient' | 'admin' | 'org'>('patient');
    // Receipt screen login state
    const [receiptEmail, setReceiptEmail] = useState('');
    const [receiptPassword, setReceiptPassword] = useState('');
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [showReceiptPassword, setShowReceiptPassword] = useState(false);
    const [showReceiptLogin, setShowReceiptLogin] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: DEMO_CREDENTIALS.patient.email,
            password: DEMO_CREDENTIALS.patient.password,
        }
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        try {
            const res = await API.post('/auth/login', values);
            const { token, user } = res.data.data;

            setToken(token);
            setUser(user);

            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            if (user.role === 'org_admin') {
                router.push('/org-dashboard');
            } else if (user.role === 'admin' || user.role === 'receptionist') {
                router.push('/admin-dashboard');
            } else if (user.role === 'doctor') {
                router.push('/doctor/dashboard');
            } else {
                router.push('/app/home');
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const onReceiptLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setReceiptLoading(true);
        try {
            const res = await API.post('/auth/login', { email: receiptEmail, password: receiptPassword });
            const { token, user } = res.data.data;
            if (user.role !== 'receptionist') {
                toast.error('These credentials are not for the Receipt Screen. Please use the correct login.');
                return;
            }
            setToken(token);
            setUser(user);
            toast.success(`Receipt screen unlocked — Welcome, ${user.name}!`);
            router.push('/admin-dashboard/receipts');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid Receipt Screen credentials.');
        } finally {
            setReceiptLoading(false);
        }
    };

    // Fill the form with demo credentials for the selected role
    const handleRoleSelect = (role: 'patient' | 'admin' | 'org') => {
        setActiveRole(role);
        setValue('email', DEMO_CREDENTIALS[role].email, { shouldValidate: true });
        setValue('password', DEMO_CREDENTIALS[role].password, { shouldValidate: true });
        toast.info(`Demo credentials loaded for ${role.toUpperCase()}`);
    };

    return (
        <div className="flex-1 overflow-y-auto w-full relative">
            <div className="min-h-full flex flex-col items-center justify-center py-8 px-4">
                {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full filter blur-[80px] animate-float" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-accent/8 rounded-full filter blur-[100px] animate-float-delayed" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/8 rounded-full filter blur-[60px] animate-float" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                {/* Logo and branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-[72px] w-[72px] rounded-[22px] bg-primary/20 border border-primary/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] mb-5 relative">
                        <Activity className="h-8 w-8 text-primary" />
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-t from-white/5 to-transparent" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
                    <p className="text-[15px] text-muted-foreground mt-2 font-medium">Sign in to continue to SwasthSetu</p>
                </div>

                {/* Main card */}
                <div className="glass-panel rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-white/10 p-7">

                    {/* Role selector */}
                    <div className="mb-6">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-3">
                            Quick Demo Access
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => handleRoleSelect('patient')}
                                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                                    activeRole === 'patient'
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_16px_rgba(0,255,255,0.1)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'patient' ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-white/5 border border-white/10 text-muted-foreground'}`}>
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'patient' ? 'text-primary' : 'text-foreground'}`}>Patient</span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block truncate">
                                    patient@...
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleRoleSelect('admin')}
                                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                                    activeRole === 'admin'
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_16px_rgba(0,255,255,0.1)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'admin' ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-white/5 border border-white/10 text-muted-foreground'}`}>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'admin' ? 'text-primary' : 'text-foreground'}`}>Hospital</span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block truncate">
                                    admin@...
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleRoleSelect('org')}
                                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                                    activeRole === 'org'
                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_16px_rgba(0,255,255,0.1)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'org' ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-white/5 border border-white/10 text-muted-foreground'}`}>
                                    <Activity className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'org' ? 'text-primary' : 'text-foreground'}`}>Organization</span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block truncate">
                                    org@...
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center"><span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">or enter manually</span></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[13px] font-semibold text-foreground">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email')}
                                className="glass-panel border-white/10 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground text-foreground"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[13px] font-semibold text-foreground">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className="glass-panel border-white/10 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-11 placeholder:text-muted-foreground text-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-bold rounded-xl h-[52px] text-[15px] shadow-[0_0_20px_rgba(0,255,255,0.15)] cursor-pointer transition-all active:scale-[0.98] hover:shadow-[0_0_30px_rgba(0,255,255,0.25)]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In
                                    <Sparkles className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Demo hint */}
                    <div className="mt-5 p-3.5 rounded-2xl bg-primary/10 border border-primary/10">
                        <p className="text-[11px] text-primary/70 text-center font-medium leading-relaxed">
                            💡 Click a role card above to auto-fill demo credentials
                        </p>
                    </div>
                </div>

                {/* Receipt Screen Login */}
                <div className="mt-4 relative z-10">
                    <button
                        type="button"
                        onClick={() => setShowReceiptLogin(v => !v)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-secondary/30 bg-secondary/10 text-secondary text-sm font-semibold hover:border-secondary/50 hover:bg-secondary/20 transition-all"
                    >
                        <Printer className="h-4 w-4" />
                        {showReceiptLogin ? 'Hide' : 'Login as Receipt Screen / Form Generator'}
                    </button>

                    {showReceiptLogin && (
                        <div className="mt-3 glass-panel rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-secondary/20 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-10 w-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                                    <Printer className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm">Receipt & Form Generator</p>
                                    <p className="text-xs text-muted-foreground">Hospital receipt desk access only</p>
                                </div>
                            </div>
                            <form onSubmit={onReceiptLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[13px] font-semibold text-foreground">Receipt Screen Email</Label>
                                    <Input
                                        type="email"
                                        required
                                        placeholder="reception@hospital.com"
                                        value={receiptEmail}
                                        onChange={e => setReceiptEmail(e.target.value)}
                                        className="glass-panel border-white/10 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[13px] font-semibold text-foreground">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showReceiptPassword ? 'text' : 'password'}
                                            required
                                            placeholder="••••••••"
                                            value={receiptPassword}
                                            onChange={e => setReceiptPassword(e.target.value)}
                                            className="glass-panel border-white/10 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all pr-11 text-foreground"
                                        />
                                        <button type="button" onClick={() => setShowReceiptPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showReceiptPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={receiptLoading}
                                    className="w-full bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-secondary font-bold rounded-xl h-[52px] text-[15px] shadow-[0_0_20px_rgba(0,255,255,0.1)]"
                                >
                                    {receiptLoading ? (
                                        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Unlocking...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Printer className="h-4 w-4" />Open Receipt Screen</span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-7 text-[14px] text-muted-foreground">
                    <span>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
                            Create one
                        </Link>
                    </span>
                </div>

                {/* Doctor Portal Link */}
                <div className="mt-4 text-center">
                    <Link
                        href="/doctor/login"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-accent transition-colors border border-white/8 rounded-xl px-4 py-2 hover:border-accent/30 hover:bg-accent/5"
                    >
                        <span>🩺</span> Doctor Portal Login
                    </Link>
                </div>
                </div>
            </div>
        </div>
    );
}
