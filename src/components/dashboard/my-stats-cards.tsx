'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, Calendar, Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';

export function MyStatsCards() {
    const { user } = useAuth();
    const { clients, getClientActivities } = useData();

    if (!user) return null;

    // Calculate personal stats
    const myClients = clients.filter(c => c.assignedTo === user.id);
    const myWonDeals = myClients.filter(c => c.status === 'won').length;
    const myActiveLeads = myClients.filter(c => c.status === 'new' || c.status === 'qualifying' || c.status === 'proposal').length;
    const myConversionRate = myClients.length > 0
        ? Math.round((myWonDeals / myClients.length) * 100)
        : 0;

    // Pending follow-ups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const myPendingFollowUps = myClients.filter(c => {
        if (!c.followUpDate) return false;
        const followUp = new Date(c.followUpDate);
        followUp.setHours(0, 0, 0, 0);
        return followUp <= today && c.status !== 'won' && c.status !== 'lost';
    }).length;

    // Monthly target
    const monthlyTarget = 5;
    const targetProgress = Math.min((myWonDeals / monthlyTarget) * 100, 100);
    const dealsRemaining = Math.max(monthlyTarget - myWonDeals, 0);

    // Calculate streak (consecutive days with activity)
    let activityStreak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        let hasActivity = false;
        myClients.forEach(client => {
            const activities = getClientActivities(client.id);
            activities.forEach(activity => {
                if (activity.timestamp.startsWith(dateStr) && activity.user === user.name) {
                    hasActivity = true;
                }
            });
        });
        if (hasActivity) {
            activityStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return (
        <div className="space-y-4 mb-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* My Clients */}
                <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">My Clients</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{myClients.length}</div>
                        <p className="text-xs text-slate-500">{myActiveLeads} active leads</p>
                    </CardContent>
                </Card>

                {/* Conversion Rate */}
                <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Conversion Rate</CardTitle>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${myConversionRate >= 30 ? 'bg-emerald-100' : myConversionRate >= 20 ? 'bg-amber-100' : 'bg-red-100'
                            }`}>
                            <TrendingUp className={`h-4 w-4 ${myConversionRate >= 30 ? 'text-emerald-600' : myConversionRate >= 20 ? 'text-amber-600' : 'text-red-600'
                                }`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{myConversionRate}%</div>
                        <p className="text-xs text-slate-500">
                            {myConversionRate >= 30 ? 'Great job!' : myConversionRate >= 20 ? 'Keep pushing!' : 'Needs improvement'}
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Follow-ups */}
                <Card className={`rounded-lg border-slate-200 shadow-sm ${myPendingFollowUps > 0 ? 'ring-2 ring-amber-300' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Follow-ups</CardTitle>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${myPendingFollowUps > 0 ? 'bg-amber-100' : 'bg-emerald-100'
                            }`}>
                            <Calendar className={`h-4 w-4 ${myPendingFollowUps > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">{myPendingFollowUps}</span>
                            {myPendingFollowUps > 0 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                    Action needed
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            {myPendingFollowUps === 0 ? 'All caught up!' : 'pending today'}
                        </p>
                    </CardContent>
                </Card>

                {/* Activity Streak */}
                <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Activity Streak</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                            <Zap className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{activityStreak}</span>
                            <span className="text-sm text-slate-500">days</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            {activityStreak >= 7 ? '🔥 On fire!' : activityStreak >= 3 ? 'Keep it up!' : 'Start your streak!'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
