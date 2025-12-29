'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, TrendingUp, Users, Target, Star, MapPin } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

interface RepStats {
    id: string;
    name: string;
    clientCount: number;
    wonDeals: number;
    conversionRate: number;
    activitiesThisMonth: number;
    dealsTarget: number;
    visitsTarget: number;
}

import { Progress } from '@/components/ui/progress';

export function Leaderboard() {
    const { user } = useAuth();
    const { clients, getSalesReps, getClientActivities, getMonthlyTarget } = useData();

    const isAdmin = user?.role === 'admin';
    if (!isAdmin) return null;

    const salesReps = getSalesReps();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Calculate stats for each rep
    const repStats: RepStats[] = salesReps.map(rep => {
        const repClients = clients.filter(c => c.assignedTo === rep.id);
        const wonDeals = repClients.filter(c => c.status === 'won').length;
        const conversionRate = repClients.length > 0
            ? Math.round((wonDeals / repClients.length) * 100)
            : 0;

        // Count activities this month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        let activitiesCount = 0;

        // Optimize: Fetch ALL activities once nicely or iterate carefully? 
        // Current context `getClientActivities` is per client.
        // Better: Context could give us "getAllActivities" or we iterate clients.
        // For now, iterate assigned clients + activities.
        repClients.forEach(client => {
            const activities = getClientActivities(client.id);
            activities.forEach(activity => {
                // Count 'visits' specifically if we want visit target?
                // Or just total activities?
                // Request said "Visits and Deals". Let's count "visit" type specifically.
                if (new Date(activity.timestamp) >= monthStart && activity.user === rep.name && activity.type === 'visit') {
                    activitiesCount++;
                }
            });
        });

        // Get Targets
        const target = getMonthlyTarget(rep.id, currentMonth, currentYear) || { dealsTarget: 0, visitsTarget: 0 };

        return {
            id: rep.id,
            name: rep.name,
            clientCount: repClients.length,
            wonDeals,
            conversionRate,
            activitiesThisMonth: activitiesCount, // Acting as "Visits" count
            dealsTarget: target.dealsTarget || 1, // Avoid div/0
            visitsTarget: target.visitsTarget || 1
        };
    }).sort((a, b) => b.wonDeals - a.wonDeals);

    const getRankIcon = (index: number) => {
        // ... (existing code)
        switch (index) {
            case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1: return <Medal className="h-5 w-5 text-slate-400" />;
            case 2: return <Medal className="h-5 w-5 text-amber-600" />;
            default: return <span className="text-sm font-bold text-slate-400">#{index + 1}</span>;
        }
    };

    const getRankBgColor = (index: number) => {
        // ... (existing code)
        switch (index) {
            case 0: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
            case 1: return 'bg-slate-50 border-slate-200';
            case 2: return 'bg-amber-50/50 border-amber-100';
            default: return 'bg-white border-slate-100';
        }
    };

    if (salesReps.length === 0) return null;

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500">
                        <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                            Create Impact & Targets
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Monthly performance vs Goals
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {repStats.map((rep, index) => {
                    const dealsPercent = Math.min(100, Math.round((rep.wonDeals / rep.dealsTarget) * 100));
                    const visitsPercent = Math.min(100, Math.round((rep.activitiesThisMonth / rep.visitsTarget) * 100));

                    return (
                        <div
                            key={rep.id}
                            className={`flex flex-col gap-3 rounded-lg border p-3 transition-all hover:shadow-sm ${getRankBgColor(index)}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Rank */}
                                <div className="flex h-8 w-8 items-center justify-center shrink-0">
                                    {getRankIcon(index)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-700">
                                        {rep.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-900 truncate">{rep.name}</p>
                                        {index === 0 && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 flex gap-2">
                                        <span>Rate: {rep.conversionRate}%</span>
                                        <span>•</span>
                                        <span>{rep.clientCount} Clients</span>
                                    </p>
                                </div>
                            </div>

                            {/* Targets Progress */}
                            <div className="space-y-3 px-1">
                                {/* Deals Progress */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-medium text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Target className="h-3 w-3 text-emerald-600" /> Deals
                                        </span>
                                        <span>{rep.wonDeals} <span className="text-slate-400">/ {rep.dealsTarget}</span></span>
                                    </div>
                                    <Progress value={dealsPercent} className="h-1.5 bg-slate-100" indicatorClassName={dealsPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'} />
                                </div>

                                {/* Visits Progress */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-medium text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-blue-600" /> Visits
                                        </span>
                                        <span>{rep.activitiesThisMonth} <span className="text-slate-400">/ {rep.visitsTarget}</span></span>
                                    </div>
                                    <Progress value={visitsPercent} className="h-1.5 bg-slate-100" indicatorClassName={visitsPercent >= 100 ? 'bg-blue-500' : 'bg-blue-600'} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
}
