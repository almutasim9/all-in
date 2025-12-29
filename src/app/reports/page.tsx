import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Target, Clock } from 'lucide-react';

const reportMetrics = [
    {
        title: 'Monthly Revenue',
        value: '$34,500',
        change: '+18.2%',
        trend: 'up',
        icon: DollarSign,
        description: 'vs last month',
    },
    {
        title: 'New Clients',
        value: '12',
        change: '+4',
        trend: 'up',
        icon: Users,
        description: 'this month',
    },
    {
        title: 'Conversion Rate',
        value: '32.5%',
        change: '+2.1%',
        trend: 'up',
        icon: Target,
        description: 'vs last month',
    },
    {
        title: 'Avg. Sales Cycle',
        value: '14 days',
        change: '-3 days',
        trend: 'up',
        icon: Clock,
        description: 'faster than before',
    },
];

const recentReports = [
    {
        id: '1',
        name: 'Monthly Sales Report',
        date: 'December 2024',
        type: 'Sales',
        status: 'Ready',
    },
    {
        id: '2',
        name: 'Lead Conversion Analysis',
        date: 'December 2024',
        type: 'Analytics',
        status: 'Ready',
    },
    {
        id: '3',
        name: 'Team Performance Report',
        date: 'December 2024',
        type: 'Team',
        status: 'Ready',
    },
    {
        id: '4',
        name: 'Revenue Forecast Q1 2025',
        date: 'December 2024',
        type: 'Forecast',
        status: 'Processing',
    },
];

export default function ReportsPage() {
    return (
        <MainLayout>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reports</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View analytics and generate reports for your sales data
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
                                <span
                                    className={`flex items-center font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                                        }`}
                                >
                                    {metric.trend === 'up' ? (
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="mr-1 h-3 w-3" />
                                    )}
                                    {metric.change}
                                </span>
                                <span className="text-slate-500">{metric.description}</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Reports */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Recent Reports</CardTitle>
                    <CardDescription className="text-slate-500">
                        Download or view your generated reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentReports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                            >
                                <div>
                                    <p className="font-medium text-slate-900">{report.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {report.date} • {report.type}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${report.status === 'Ready'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                            }`}
                                    >
                                        {report.status}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={report.status !== 'Ready'}
                                        className="gap-1"
                                    >
                                        <Download className="h-3 w-3" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
