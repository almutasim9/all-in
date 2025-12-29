import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, RefreshCw, ArrowUpRight, AlertCircle } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

export function CompactKPIBar() {
    const { clients, subscriptions } = useData();
    const { user } = useAuth();

    // Filter data based on role
    const myClients = user?.role === 'admin'
        ? clients
        : clients.filter(c => c.assignedTo === user?.id);

    // Calculate metrics
    const totalRevenue = myClients
        .filter(c => c.status === 'won')
        .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const activeClients = myClients.filter(c =>
        ['new', 'qualifying', 'proposal'].includes(c.status)
    ).length;

    const wonCount = myClients.filter(c => c.status === 'won').length;
    const lostCount = myClients.filter(c => c.status === 'lost').length;
    const totalClosed = wonCount + lostCount;
    const conversionRate = totalClosed > 0
        ? ((wonCount / totalClosed) * 100).toFixed(1)
        : '0.0';

    // Subscriptions ending within 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const pendingRenewals = subscriptions.filter(s => {
        const endDate = new Date(s.endDate);
        return endDate >= today && endDate <= thirtyDaysFromNow;
    }).length;

    const kpis = [
        {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            change: '+0%', // Dynamic change requires historical data not yet available
            trend: 'up',
            icon: DollarSign,
            color: 'text-emerald-600 bg-emerald-50',
        },
        {
            title: 'Active Clients',
            value: activeClients.toString(),
            change: 'Active',
            trend: 'up',
            icon: Users,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            title: 'Conversion Rate',
            value: `${conversionRate}%`,
            change: 'Win Rate',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-purple-600 bg-purple-50',
        },
        {
            title: 'Pending Renewals',
            value: pendingRenewals.toString(),
            change: pendingRenewals > 0 ? 'Urgent' : 'None',
            trend: pendingRenewals > 0 ? 'warning' : 'up',
            icon: RefreshCw,
            color: 'text-amber-600 bg-amber-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
                <Card key={kpi.title} className="border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                                {kpi.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
                                {kpi.trend === 'warning' && <AlertCircle className="h-3 w-3 text-amber-600" />}
                                <span className={`text-xs font-medium ${kpi.trend === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {kpi.change}
                                </span>
                            </div>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                            <kpi.icon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
