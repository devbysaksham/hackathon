'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import API from '@/lib/api';
import MedicineRoutineTable from '@/components/MedicineRoutineTable';
import { Badge } from '@/components/ui/badge';
import { Pill, Loader2, Bell, Sparkles, Search, X, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MedicineResult {
    id?: string;
    name?: string;
    generic_name?: string;
    manufacturer?: string;
    dosage_form?: string;
    strength?: string;
    type?: string;
    [key: string]: any;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function AppMedicinesPage() {
    const router = useRouter();
    const { user, token } = useAppStore();
    const [routines, setRoutines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicineResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<MedicineResult | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
            return;
        }
        loadRoutines();
    }, [user, token]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length >= 2) {
            performSearch(debouncedQuery.trim());
        } else {
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError('');
        }
    }, [debouncedQuery]);

    const performSearch = async (q: string) => {
        setIsSearching(true);
        setSearchError('');
        try {
            const res = await API.get(`/medicines/search?q=${encodeURIComponent(q)}&limit=10`);
            if (res.data.success) {
                setSearchResults(res.data.data || []);
                setShowDropdown(true);
            } else {
                setSearchError(res.data.message || 'Search failed');
                setSearchResults([]);
            }
        } catch (err: any) {
            setSearchError(err.response?.data?.message || 'Search temporarily unavailable');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const loadRoutines = async () => {
        if (!user) return;
        try {
            const res = await API.get(`/patients/${user.id}/file`);
            setRoutines(res.data.data.medicineRoutines || []);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load medicine routines.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectMedicine = (med: MedicineResult) => {
        setSelectedMedicine(med);
        setSearchQuery(med.name || med.generic_name || '');
        setShowDropdown(false);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedMedicine(null);
        setShowDropdown(false);
        setSearchError('');
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysRoutines = routines.filter((r: any) => r.routine_date === todayStr);
    const takenToday = todaysRoutines.filter((r: any) => r.status === 'taken' || r.status === 'completed').length;
    const activeRoutines = routines.filter((r: any) => r.status === 'pending' || r.status === 'missed');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-amber-200/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Checking prescriptions & dose routines...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 animate-fade-in-up">
            {/* Gradient Header Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white shadow-xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-lg pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Pill className="h-5 w-5 text-amber-100" />
                            <span className="text-[11px] font-bold text-amber-100/90 uppercase tracking-widest">Prescription Adherence</span>
                        </div>
                        <h2 className="text-[22px] font-extrabold leading-tight tracking-tight">Rx Schedule</h2>
                        <p className="text-xs text-amber-100 font-medium mt-1">
                            {todaysRoutines.length > 0 ? `${takenToday} of ${todaysRoutines.length} taken today` : 'No doses scheduled for today'}
                        </p>
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-bold text-xs px-3 py-1 rounded-xl shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-200" />
                        {activeRoutines.length} Active
                    </Badge>
                </div>
            </div>

            {/* Medicine Search Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-4" ref={searchRef}>
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Search Medicines</span>
                    <span className="text-[10px] text-slate-400 ml-auto">Powered by Eka Care</span>
                </div>
                <div className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            placeholder="Type medicine name (e.g. Paracetamol, Metformin...)"
                            className="w-full pl-9 pr-10 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 h-4 w-4 text-amber-500 animate-spin" />
                        )}
                        {!isSearching && searchQuery && (
                            <button onClick={handleClearSearch} className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Error state */}
                    {searchError && (
                        <div className="mt-2 flex items-center gap-2 text-rose-500 text-xs">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {searchError}
                        </div>
                    )}

                    {/* Dropdown results */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                            {searchResults.map((med, idx) => (
                                <button
                                    key={med.id || idx}
                                    onClick={() => handleSelectMedicine(med)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                        <Pill className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                            {med.name || med.generic_name || 'Unknown'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {[med.dosage_form, med.strength, med.manufacturer].filter(Boolean).join(' · ') || med.type || 'Medication'}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {showDropdown && searchResults.length === 0 && !isSearching && debouncedQuery.length >= 2 && !searchError && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 text-center">
                            <p className="text-sm text-slate-500">No medicines found for &quot;<span className="font-medium text-slate-700 dark:text-slate-300">{debouncedQuery}</span>&quot;</p>
                        </div>
                    )}
                </div>

                {/* Selected Medicine Detail Card */}
                {selectedMedicine && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/50">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{selectedMedicine.name || selectedMedicine.generic_name}</p>
                                {selectedMedicine.generic_name && selectedMedicine.name !== selectedMedicine.generic_name && (
                                    <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70 mt-0.5">Generic: {selectedMedicine.generic_name}</p>
                                )}
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {selectedMedicine.dosage_form && (
                                        <span className="text-[10px] font-semibold bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">{selectedMedicine.dosage_form}</span>
                                    )}
                                    {selectedMedicine.strength && (
                                        <span className="text-[10px] font-semibold bg-orange-200/60 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-md">{selectedMedicine.strength}</span>
                                    )}
                                    {selectedMedicine.manufacturer && (
                                        <span className="text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">{selectedMedicine.manufacturer}</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedMedicine(null)} className="text-amber-400 hover:text-amber-600 mt-0.5 shrink-0">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Reminder / Adherence Alert */}
            {todaysRoutines.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                                Today&apos;s Medication Schedule
                            </h4>
                            <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                                {takenToday}/{todaysRoutines.length} Done
                            </span>
                        </div>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium mt-0.5">
                            {takenToday === todaysRoutines.length
                                ? '🎉 All prescribed doses for today are logged! Great job keeping up.'
                                : 'Tap the checkboxes below to log each dosage on time.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Time of Day Windows */}
            {routines.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-3 text-center border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="text-xl mb-1">🌅</div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">Morning</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">6 AM – 12 PM</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-3 text-center border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="text-xl mb-1">☀️</div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">Afternoon</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">12 PM – 5 PM</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-3 text-center border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="text-xl mb-1">🌙</div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-100">Night</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">After 5 PM</p>
                    </div>
                </div>
            )}

            {/* Medicine routines interactive list */}
            {routines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
                        <Pill className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">No Active Rx Routines</p>
                    <p className="text-xs text-slate-400 max-w-[260px]">
                        Prescriptions generated during your consultations will automatically populate your daily dose schedule here.
                    </p>
                </div>
            ) : (
                <MedicineRoutineTable routines={routines} onRefresh={loadRoutines} />
            )}
        </div>
    );
}
