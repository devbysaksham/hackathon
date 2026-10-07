'use client';
import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'sonner';
import { Building2, Plus, Mail, Phone, MapPin, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OrgHospitalsPage() {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingHospital, setEditingHospital] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '', category: 'private', address: '', contactEmail: '', contactPhone: '', latitude: '', longitude: '', googleMapsLink: '', 
        adminName: '', adminEmail: '', adminPassword: '',
        receptionName: '', receptionEmail: '', receptionPassword: ''
    });
    const [editData, setEditData] = useState({
        name: '', category: 'private', address: '', contactEmail: '', contactPhone: '', latitude: '', longitude: '', googleMapsLink: '',
        receiptHeaderText: '', receiptHeaderSubtext: '', receiptColor: '#2e7d32'
    });
    const [receptionEdit, setReceptionEdit] = useState({ receptionName: '', receptionEmail: '', receptionPassword: '' });

    const fetchHospitals = async () => {
        try {
            const res = await API.get('/hospitals');
            if (res.data.success) {
                setHospitals(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null
            };
            const res = await API.post('/hospitals', dataToSubmit);
            if (res.data.success) {
                toast.success('Hospital registered successfully');
                setIsCreating(false);
                setFormData({ 
                    name: '', category: 'private', address: '', contactEmail: '', contactPhone: '', latitude: '', longitude: '', googleMapsLink: '', 
                    adminName: '', adminEmail: '', adminPassword: '',
                    receptionName: '', receptionEmail: '', receptionPassword: ''
                });
                fetchHospitals();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to register hospital');
        }
    };

    const startEditing = (hospital: any) => {
        setEditingHospital(hospital);
        setEditData({
            name: hospital.name,
            category: hospital.category,
            address: hospital.address || '',
            contactEmail: hospital.contact_email || '',
            contactPhone: hospital.contact_phone || '',
            latitude: hospital.latitude ? hospital.latitude.toString() : '',
            longitude: hospital.longitude ? hospital.longitude.toString() : '',
            googleMapsLink: hospital.google_maps_link || '',
            receiptHeaderText: hospital.receipt_header_text || '',
            receiptHeaderSubtext: hospital.receipt_header_subtext || '',
            receiptColor: hospital.receipt_color || '#2e7d32'
        });
        setReceptionEdit({ receptionName: '', receptionEmail: '', receptionPassword: '' });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...editData,
                latitude: editData.latitude ? parseFloat(editData.latitude) : null,
                longitude: editData.longitude ? parseFloat(editData.longitude) : null
            };
            const res = await API.put(`/hospitals/${editingHospital.id}`, dataToSubmit);
            if (res.data.success) {
                // Also update receptionist credentials if email is provided
                if (receptionEdit.receptionEmail) {
                    await API.put(`/hospitals/${editingHospital.id}/receptionist`, receptionEdit);
                }
                toast.success('Hospital updated successfully');
                setEditingHospital(null);
                fetchHospitals();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update hospital');
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hospitals Directory</h1>
                    <p className="text-slate-500 mt-1">Manage network hospitals and their admin accounts.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                    <Plus className="h-4 w-4" /> {isCreating ? 'Cancel' : 'Register Hospital'}
                </Button>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
                    <h2 className="text-lg font-semibold mb-4">Register New Hospital</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hospital Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Apollo Hospital" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={formData.category || ''} onValueChange={v => setFormData({...formData, category: v || 'private'})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="govt">Government (Govt)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <Input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder="info@hospital.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact Phone</label>
                                <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} placeholder="+91..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Latitude</label>
                                <Input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="e.g. 28.7041" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Longitude</label>
                                <Input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="e.g. 77.1025" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Google Maps Link</label>
                                <Input value={formData.googleMapsLink} onChange={e => setFormData({...formData, googleMapsLink: e.target.value})} placeholder="https://maps.google.com/..." />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                            <h3 className="text-md font-semibold mb-3">Initial Admin Account</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Name</label>
                                    <Input required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} placeholder="Dr. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Email (Login)</label>
                                    <Input required type="email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} placeholder="admin@hospital.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Input required type="password" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                            <h3 className="text-md font-semibold mb-3">Receipt Screen Login (Receptionist)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input required value={formData.receptionName} onChange={e => setFormData({...formData, receptionName: e.target.value})} placeholder="e.g. Front Desk" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input type="email" required value={formData.receptionEmail} onChange={e => setFormData({...formData, receptionEmail: e.target.value})} placeholder="reception@hospital.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Input type="password" required value={formData.receptionPassword} onChange={e => setFormData({...formData, receptionPassword: e.target.value})} placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl">Register</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {hospitals.map(h => (
                    <div key={h.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-indigo-600"
                            onClick={() => startEditing(h)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 pr-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{h.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${h.category === 'govt' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                        {h.category.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                                {h.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {h.address}</div>}
                                {(h.latitude || h.longitude) && <div className="flex items-center gap-2 text-indigo-500"><MapPin className="h-4 w-4" /> {h.latitude}, {h.longitude}</div>}
                                {h.contact_email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {h.contact_email}</div>}
                                {h.contact_phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {h.contact_phone}</div>}
                            </div>
                        </div>
                    </div>
                ))}
                {hospitals.length === 0 && !isCreating && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No hospitals registered yet.
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingHospital && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Edit Hospital Details</h2>
                            <Button variant="ghost" size="icon" onClick={() => setEditingHospital(null)}><X className="h-5 w-5" /></Button>
                        </div>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hospital Name</label>
                                    <Input required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={editData.category || ''} onValueChange={v => setEditData({...editData, category: v || 'private'})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="govt">Government (Govt)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <Input type="email" value={editData.contactEmail} onChange={e => setEditData({...editData, contactEmail: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Phone</label>
                                    <Input value={editData.contactPhone} onChange={e => setEditData({...editData, contactPhone: e.target.value})} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Input value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Latitude</label>
                                    <Input type="number" step="any" value={editData.latitude} onChange={e => setEditData({...editData, latitude: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Longitude</label>
                                    <Input type="number" step="any" value={editData.longitude} onChange={e => setEditData({...editData, longitude: e.target.value})} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Google Maps Link</label>
                                    <Input value={editData.googleMapsLink} onChange={e => setEditData({...editData, googleMapsLink: e.target.value})} placeholder="https://maps.google.com/..." />
                                </div>
                            </div>


                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                                <h3 className="text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Receipt Screen Login (Receptionist)</h3>
                                <p className="text-xs text-slate-400 mb-3">Leave email blank to keep existing credentials unchanged. Fill any field to update.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input value={receptionEdit.receptionName} onChange={e => setReceptionEdit({...receptionEdit, receptionName: e.target.value})} placeholder="e.g. Front Desk" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Email</label>
                                        <Input type="email" value={receptionEdit.receptionEmail} onChange={e => setReceptionEdit({...receptionEdit, receptionEmail: e.target.value})} placeholder="new@hospital.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input type="password" value={receptionEdit.receptionPassword} onChange={e => setReceptionEdit({...receptionEdit, receptionPassword: e.target.value})} placeholder="Leave blank to keep current" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setEditingHospital(null)}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
