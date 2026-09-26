'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { Loader2, CreditCard, TrendingUp, IndianRupee } from 'lucide-react';

interface RevenueData {
    date: string;
    revenue: number;
}

export default function AdminRevenuePage() {
    const { token } = useAppStore();
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/revenue`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                
                if (data.success) {
                    setRevenueData(data.data);
                } else {
                    toast.error(data.message || 'Failed to fetch revenue');
                }
            } catch (error) {
                console.error("Error fetching revenue:", error);
                toast.error('Error fetching revenue');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchRevenue();
    }, [token]);

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        Revenue Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Review your earnings over the past 7 days.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col gap-6 max-w-4xl">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 font-medium mb-1">Total Revenue (Last 7 Days)</p>
                            <h2 className="text-4xl font-bold flex items-center">
                                <IndianRupee className="h-8 w-8 mr-1" />
                                {totalRevenue.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-white/20 p-4 rounded-xl">
                            <TrendingUp className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-800">Daily Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[600px]">
                                <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {revenueData.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                                                No revenue data available.
                                            </td>
                                        </tr>
                                    ) : (
                                        revenueData.map((data, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium">
                                                    {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                                    ₹{data.revenue.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
