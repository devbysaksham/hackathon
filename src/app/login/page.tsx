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
import { Activity, ShieldCheck, UserCheck, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
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
    admin: { email: 'admin@swasthsetu.health', password: 'admin123' },
    org: { email: 'org@swasthstu.com', password: 'orgadmin123' },
} as const;

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setToken } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeRole, setActiveRole] = useState<'patient' | 'admin' | 'org'>('patient');

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
            } else if (user.role === 'admin') {
                router.push('/admin-dashboard');
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
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/12 to-purple-500/8 rounded-full filter blur-3xl animate-float" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/8 to-rose-400/6 rounded-full filter blur-3xl animate-float-delayed" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-violet-400/6 to-indigo-400/4 rounded-full filter blur-2xl animate-float" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                {/* Logo and branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-[72px] w-[72px] rounded-[22px] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-500/25 mb-5 relative">
                        <Activity className="h-8 w-8 text-white" />
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-t from-white/10 to-transparent" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
                    <p className="text-[15px] text-slate-500 mt-2 font-medium">Sign in to continue to SwasthSetu</p>
                </div>

                {/* Main card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-200/60 dark:border-slate-800 p-7">

                    {/* Role selector */}
                    <div className="mb-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-3">
                            Quick Demo Access
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => handleRoleSelect('patient')}
                                className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${activeRole === 'patient'
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'patient' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'patient' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Patient</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block truncate">
                                    patient@swasthsetu.health
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleRoleSelect('admin')}
                                className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${activeRole === 'admin'
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'admin' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'admin' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Hospital</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block truncate">
                                    admin@...
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleRoleSelect('org')}
                                className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${activeRole === 'org'
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-all ${activeRole === 'org' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Activity className="h-5 w-5" />
                                </div>
                                <span className={`text-sm font-bold block ${activeRole === 'org' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>Organization</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block truncate">
                                    org@...
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                        <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or enter manually</span></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email')}
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                            {errors.email && (
                                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-12 text-[14px] font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-11 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl h-[52px] text-[15px] shadow-lg shadow-indigo-500/25 cursor-pointer transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-indigo-500/30"
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
                    <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-800/20">
                        <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 text-center font-medium leading-relaxed">
                            💡 Click a role card above to auto-fill demo credentials
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-7 text-[14px] text-slate-500">
                    <span>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Create one
                        </Link>
                    </span>
                </div>
                </div>
            </div>
        </div>
    );
}
