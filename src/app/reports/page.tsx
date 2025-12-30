'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Target, Clock, AlertCircle } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useMemo } from 'react';

export default function ReportsPage() {
    const { clients } = useData();

    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter this month's data
        const newClientsThisMonth = clients.filter(c => {
            if (!c.createdAt) return false;
            const d = new Date(c.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const wonClients = clients.filter(c => c.status === 'won');
        const wonClientsThisMonth = wonClients.filter(c => {
            if (!c.createdAt) return false; // Ideally use 'wonAt' date if available, fallback to createdAt or lastInteraction
            const d = new Date(c.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 1. Monthly Revenue (Sum of dealValue for won clients this month)
        // Using dealValue if present, otherwise 0
        const monthlyRevenue = wonClientsThisMonth.reduce((sum, c) => sum + (c.dealValue || 0), 0);

        // 2. New Clients Count
        const newClientsCount = newClientsThisMonth.length;

        // 3. Conversion Rate (Won / Total) - Overall or Monthly? Let's do Overall for stability
        const totalClients = clients.length;
        const conversionRate = totalClients > 0 ? (wonClients.length / totalClients) * 100 : 0;

        return {
            revenue: monthlyRevenue,
            newClients: newClientsCount,
            conversionRate: conversionRate.toFixed(1),
        };
    }, [clients]);

    const reportMetrics = [
        {
            title: 'Monthly Revenue',
            value: `$${metrics.revenue.toLocaleString()}`,
            change: '+0%', // Placeholder as we don't have last month history yet
            trend: 'up',
            icon: DollarSign,
            description: 'this month',
        },
        {
            title: 'New Clients',
            value: metrics.newClients.toString(),
            change: '+0',
            trend: 'up',
            icon: Users,
            description: 'this month',
        },
        {
            title: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            change: '+0%',
            trend: 'up',
            icon: Target,
            description: 'overall',
        },
        {
            title: 'Avg. Sales Cycle',
            value: 'N/A', // Data not available yet
            change: '0 days',
            trend: 'neutral',
            icon: Clock,
            description: 'needs more data',
        },
    ];

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reports</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Real-time analytics for your sales data
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Reports
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {reportMetrics.map((metric) => (
                    <Card key={metric.title} className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {metric.title}
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                                <metric.icon className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                            <p className="mt-1 flex items-center gap-1 text-xs">
                                <span className="flex items-center font-medium text-slate-600">
                                    {/* Trend icons simplified for now */}
                                    {metric.change}
                                </span>
                                <span className="text-slate-500">{metric.description}</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Reports Placeholder */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Recent Reports</CardTitle>
                    <CardDescription className="text-slate-500">
                        Generated reports will appear here
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                        <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                        <p>No reports generated yet.</p>
                        <p className="text-xs mt-1">System is collecting data...</p>
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
