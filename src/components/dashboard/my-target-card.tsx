'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target, Trophy, ChevronRight, MapPin } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

export function MyTargetCard() {
    const { user } = useAuth();
    const { clients, activities, getMonthlyTarget, teamMembers, monthlyTargets } = useData();

    if (!user || user.role !== 'sales_rep') {
        return null;
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysRemaining = lastDayOfMonth - today.getDate();

    // Get my target
    const myTarget = getMonthlyTarget(user.id, currentMonth, currentYear) || { dealsTarget: 10, visitsTarget: 50 };

    // Calculate Deals achievements
    const myClients = clients.filter(c => c.assignedTo === user.id);
    const wonDeals = myClients.filter(c => c.status === 'won').length;
    const dealsProgress = myTarget.dealsTarget > 0
        ? Math.round((wonDeals / myTarget.dealsTarget) * 100)
        : 0;

    // Calculate Visits achievements
    const visitsThisMonth = activities.filter(a => {
        const date = new Date(a.timestamp);
        return a.user === user.name && // Using name as simplified check (ideally ID)
            a.type === 'visit' &&
            date.getMonth() + 1 === currentMonth &&
            date.getFullYear() === currentYear;
    }).length;

    const visitsProgress = myTarget.visitsTarget > 0
        ? Math.round((visitsThisMonth / myTarget.visitsTarget) * 100)
        : 0;

    // Calculate rank (based on deals for now)
    const salesReps = teamMembers.filter(m => m.role === 'sales_rep' && m.status === 'active');
    const repScores = salesReps.map(rep => {
        const repClients = clients.filter(c => c.assignedTo === rep.id);
        const repWonDeals = repClients.filter(c => c.status === 'won').length;
        const repTarget = monthlyTargets.find(t =>
            t.memberId === rep.id && t.month === currentMonth && t.year === currentYear
        );
        const progress = repTarget?.dealsTarget
            ? (repWonDeals / repTarget.dealsTarget) * 100
            : 0;
        return { id: rep.id, progress };
    }).sort((a, b) => b.progress - a.progress);

    const myRank = repScores.findIndex(r => r.id === user.id) + 1;

    return (
        <Card className="rounded-xl border-none shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden mb-6">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: General Status */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Trophy className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-lg font-bold text-white">
                                Rank #{myRank}
                            </h3>
                            <span className="text-sm text-slate-400">of {salesReps.length} Reps</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            {daysRemaining} days left in {new Date().toLocaleString('default', { month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Right: Progress Bars */}
                <div className="w-full sm:max-w-md space-y-4">
                    {/* Deals Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                                <Target className="h-3 w-3" /> Deals
                            </span>
                            <span>{wonDeals} / {myTarget.dealsTarget} ({dealsProgress}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(dealsProgress, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Visits Progress */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 font-medium text-blue-300">
                                <MapPin className="h-3 w-3" /> Visits
                            </span>
                            <span>{visitsThisMonth} / {myTarget.visitsTarget} ({visitsProgress}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(visitsProgress, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
