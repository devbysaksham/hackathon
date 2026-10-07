'use client';

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Settings, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HospitalSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        receipt_header_text: 'ahrc',
        receipt_header_subtext: 'अरिहंत हॉस्पिटल एंड रिसर्च सेंटर',
        receipt_color: '#2e7d32'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const res = await API.get('/admin/settings');
                if (res.data.success && res.data.data) {
                    setFormData({
                        receipt_header_text: res.data.data.receipt_header_text || 'ahrc',
                        receipt_header_subtext: res.data.data.receipt_header_subtext || 'अरिहंत हॉस्पिटल एंड रिसर्च सेंटर',
                        receipt_color: res.data.data.receipt_color || '#2e7d32'
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load settings.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await API.put('/admin/settings', formData);
            if (res.data.success) {
                toast.success('Hospital settings updated successfully.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 h-full max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-indigo-600" />
                    Hospital Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage your hospital's custom receipts, forms, and colors.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
                <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Receipt Template Details</h2>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Receipt Header Text (Main Logo/Abbreviation)</label>
                            <Input 
                                required
                                value={formData.receipt_header_text} 
                                onChange={e => setFormData({...formData, receipt_header_text: e.target.value})} 
                                placeholder="e.g. ahrc" 
                            />
                            <p className="text-[11px] text-slate-400">This appears in large bold letters on the top left of receipts.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Receipt Subtext (Full Name)</label>
                            <Input 
                                value={formData.receipt_header_subtext} 
                                onChange={e => setFormData({...formData, receipt_header_subtext: e.target.value})} 
                                placeholder="e.g. अरिहंत हॉस्पिटल..." 
                            />
                            <p className="text-[11px] text-slate-400">This appears below the main text in a smaller font.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Theme Color</label>
                            <div className="flex gap-4 items-center">
                                <input 
                                    type="color" 
                                    required
                                    value={formData.receipt_color} 
                                    onChange={e => setFormData({...formData, receipt_color: e.target.value})} 
                                    className="h-10 w-20 cursor-pointer rounded border border-slate-200 bg-white"
                                />
                                <Input 
                                    type="text" 
                                    value={formData.receipt_color} 
                                    onChange={e => setFormData({...formData, receipt_color: e.target.value})} 
                                    className="font-mono"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">Used for the top and bottom borders on the receipts.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 px-8"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
            
            {/* Live Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Header Preview</h3>
                <div style={{ borderBottom: `2px solid ${formData.receipt_color}`, paddingBottom: '10px' }}>
                    <h1 style={{ color: formData.receipt_color, margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', textTransform: 'lowercase' }}>
                        {formData.receipt_header_text || '...'}
                    </h1>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', color: '#333' }}>
                        {formData.receipt_header_subtext || '...'}
                    </p>
                </div>
                <div style={{ marginTop: '20px', borderTop: `3px solid ${formData.receipt_color}`, opacity: 0.6, paddingTop: '10px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    Footer Preview Line
                </div>
            </div>
        </div>
    );
}
