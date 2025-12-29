'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Target, Calendar, Save, Copy, ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useData } from '@/lib/data-context';

interface TargetFormData {
    [memberId: string]: {
        dealsTarget: string;
        visitsTarget: string;
    };
}

export function TargetsTab() {
    const { teamMembers, clients, activities, getMonthlyTarget, setMonthlyTarget, getMonthlyTargetsForMonth } = useData();

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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Monthly Targets Management</h2>
                    <p className="text-sm text-slate-500">
                        Set sales and visit goals for each representative
                    </p>
                </div>
            </div>

            {/* Sticky Header with Month Selection and Actions */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm sticky top-0 z-10 transition-all">
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Month Navigator */}
                    <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 hover:bg-white hover:shadow-sm">
                            <ChevronLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                        <div className="flex items-center gap-2 min-w-[140px] justify-center">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="font-semibold text-slate-900">
                                {monthNames[currentMonth - 1]} {currentYear}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 hover:bg-white hover:shadow-sm">
                            <ChevronRight className="h-4 w-4 text-slate-600" />
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleCopyFromPreviousMonth}
                            className="flex-1 md:flex-none gap-2 text-slate-600 border-slate-200"
                            size="sm"
                        >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Copy Previous</span>
                            <span className="sm:hidden">Copy</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm"
                        >
                            <Save className="h-3.5 w-3.5" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Target Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 border border-blue-200">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{salesReps.length}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active Reps</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalDealsTarget}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Deals Goal</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-lg border-slate-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 border border-purple-200">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalVisitsTarget}</p>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Visits Goal</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {saveMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in">
                    <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <div className="bg-white/20 p-1 rounded-full">
                            <Save className="h-3 w-3" />
                        </div>
                        {saveMessage}
                    </div>
                </div>
            )}

            {/* Targets Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {salesReps.map(rep => {
                    const achievements = getRepAchievements(rep.id);
                    const dealsTarget = parseInt(formData[rep.id]?.dealsTarget) || 0;
                    const visitsTarget = parseInt(formData[rep.id]?.visitsTarget) || 0;

                    const dealsProgress = dealsTarget > 0 ? Math.min(Math.round((achievements.wonDeals / dealsTarget) * 100), 100) : 0;
                    const visitsProgress = visitsTarget > 0 ? Math.min(Math.round((achievements.visits / visitsTarget) * 100), 100) : 0;

                    return (
                        <Card key={rep.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                                            {rep.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-slate-900">{rep.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {rep.allowedProvinces && rep.allowedProvinces.length > 0
                                                ? rep.allowedProvinces.slice(0, 2).join(', ') + (rep.allowedProvinces.length > 2 ? ` +${rep.allowedProvinces.length - 2}` : '')
                                                : 'All Provinces'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4  space-y-6">
                                {/* Deals Target Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
                                                <Target className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Deals Goal</span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dealsProgress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {achievements.wonDeals} / {dealsTarget} achieved
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="pl-9 font-medium text-slate-900"
                                                value={formData[rep.id]?.dealsTarget || ''}
                                                onChange={(e) => handleInputChange(rep.id, 'dealsTarget', e.target.value)}
                                            />
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {dealsTarget > 0 && (
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${dealsProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${dealsProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Visits Target Section */}
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Visits Goal</span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visitsProgress >= 100 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {achievements.visits} / {visitsTarget} achieved
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="pl-9 font-medium text-slate-900"
                                                value={formData[rep.id]?.visitsTarget || ''}
                                                onChange={(e) => handleInputChange(rep.id, 'visitsTarget', e.target.value)}
                                            />
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {visitsTarget > 0 && (
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${visitsProgress >= 100 ? 'bg-purple-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${visitsProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {salesReps.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No Active Representatives</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1">
                            Add sales representatives in the Members tab to start setting monthly targets.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
