'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Target, Calendar, Save, Copy, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';

interface TargetFormData {
    [memberId: string]: {
        dealsTarget: string;
        visitsTarget: string;
    };
}

export default function TargetsPage() {
    const { teamMembers, clients, activities, getMonthlyTarget, setMonthlyTarget, getMonthlyTargetsForMonth } = useData();
    const { user } = useAuth();

    // Only admin can access
    if (user?.role !== 'admin') {
        redirect('/');
    }

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState<TargetFormData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const salesReps = teamMembers.filter(m => m.role === 'sales_rep' && m.status === 'active');

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Load existing targets when month changes
    useEffect(() => {
        const newFormData: TargetFormData = {};
        salesReps.forEach(rep => {
            const target = getMonthlyTarget(rep.id, currentMonth, currentYear);
            newFormData[rep.id] = {
                dealsTarget: target?.dealsTarget?.toString() || '',
                visitsTarget: target?.visitsTarget?.toString() || '',
            };
        });
        setFormData(newFormData);
    }, [currentMonth, currentYear, salesReps.length]);

    // Calculate achievements for each rep
    const getRepAchievements = (repId: string) => {
        const repClients = clients.filter(c => c.assignedTo === repId);
        const wonDeals = repClients.filter(c => c.status === 'won').length;

        // Count visits this month (activities of type 'visit')
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0);
        const visits = activities.filter(a =>
            a.type === 'visit' &&
            repClients.some(c => c.id === a.clientId) &&
            new Date(a.timestamp) >= monthStart &&
            new Date(a.timestamp) <= monthEnd
        ).length;

        return { wonDeals, visits };
    };

    const handleInputChange = (memberId: string, field: 'dealsTarget' | 'visitsTarget', value: string) => {
        setFormData(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Save all targets
        Object.entries(formData).forEach(([memberId, data]) => {
            const deals = parseInt(data.dealsTarget) || 0;
            const visits = parseInt(data.visitsTarget) || 0;
            if (deals > 0 || visits > 0) {
                setMonthlyTarget(memberId, currentMonth, currentYear, deals, visits);
            }
        });

        setSaveMessage('✅ Targets saved successfully!');
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleCopyFromPreviousMonth = () => {
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear -= 1;
        }

        const previousTargets = getMonthlyTargetsForMonth(prevMonth, prevYear);
        if (previousTargets.length === 0) {
            setSaveMessage('⚠️ No targets found in previous month');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        const newFormData: TargetFormData = { ...formData };
        previousTargets.forEach(target => {
            newFormData[target.memberId] = {
                dealsTarget: target.dealsTarget.toString(),
                visitsTarget: target.visitsTarget.toString(),
            };
        });
        setFormData(newFormData);
        setSaveMessage('📋 Targets copied from previous month');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    // Calculate totals
    const totalDealsTarget = Object.values(formData).reduce((sum, d) => sum + (parseInt(d.dealsTarget) || 0), 0);
    const totalVisitsTarget = Object.values(formData).reduce((sum, d) => sum + (parseInt(d.visitsTarget) || 0), 0);

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">🎯 Monthly Targets Management</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Set and manage sales and visit targets for each representative
                    </p>
                </div>
            </div>

            {/* Month Selector */}
            <Card className="mb-6 rounded-lg border-slate-200 bg-white shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                            <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                {monthNames[currentMonth - 1]} {currentYear}
                            </div>
                        </div>
                        <Button variant="outline" size="icon" onClick={goToNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{salesReps.length}</p>
                                <p className="text-xs text-blue-700">active reps</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-900">{totalDealsTarget}</p>
                                <p className="text-xs text-emerald-700">Total Deals Target</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-900">{totalVisitsTarget}</p>
                                <p className="text-xs text-purple-700">Total Visits Target</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
                <Button
                    variant="outline"
                    onClick={handleCopyFromPreviousMonth}
                    className="gap-2"
                >
                    <Copy className="h-4 w-4" />
                    Copy from Previous Month
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Targets'}
                </Button>
                {saveMessage && (
                    <span className="text-sm font-medium text-emerald-600">{saveMessage}</span>
                )}
            </div>

            {/* Targets Table */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Representative Targets</CardTitle>
                    <CardDescription>Set required deal and visit counts for each rep</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 font-medium text-sm text-slate-600">
                            <div className="col-span-4">Representative</div>
                            <div className="col-span-2 text-center">Deals Target</div>
                            <div className="col-span-2 text-center">Achieved</div>
                            <div className="col-span-2 text-center">Visits Target</div>
                            <div className="col-span-2 text-center">Achieved</div>
                        </div>

                        {/* Rows */}
                        {salesReps.map(rep => {
                            const achievements = getRepAchievements(rep.id);
                            const dealsTarget = parseInt(formData[rep.id]?.dealsTarget) || 0;
                            const visitsTarget = parseInt(formData[rep.id]?.visitsTarget) || 0;
                            const dealsProgress = dealsTarget > 0 ? Math.round((achievements.wonDeals / dealsTarget) * 100) : 0;
                            const visitsProgress = visitsTarget > 0 ? Math.round((achievements.visits / visitsTarget) * 100) : 0;

                            return (
                                <div key={rep.id} className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 items-center">
                                    <div className="col-span-4 flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-slate-200">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                                                {rep.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-slate-900">{rep.name}</p>
                                            {rep.allowedProvinces && rep.allowedProvinces.length > 0 && (
                                                <p className="text-xs text-slate-500">{rep.allowedProvinces.join(', ')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={formData[rep.id]?.dealsTarget || ''}
                                            onChange={(e) => handleInputChange(rep.id, 'dealsTarget', e.target.value)}
                                            className="text-center"
                                        />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <Badge
                                            variant="outline"
                                            className={`${dealsProgress >= 100
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : dealsProgress >= 70
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}
                                        >
                                            {achievements.wonDeals} {dealsTarget > 0 && `(${dealsProgress}%)`}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={formData[rep.id]?.visitsTarget || ''}
                                            onChange={(e) => handleInputChange(rep.id, 'visitsTarget', e.target.value)}
                                            className="text-center"
                                        />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <Badge
                                            variant="outline"
                                            className={`${visitsProgress >= 100
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : visitsProgress >= 70
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}
                                        >
                                            {achievements.visits} {visitsTarget > 0 && `(${visitsProgress}%)`}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}

                        {salesReps.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                No active representatives. Add members from Team page.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
