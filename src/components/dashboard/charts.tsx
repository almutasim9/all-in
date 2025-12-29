'use client';

import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';

const barChartConfig = {
    activities: {
        label: 'Activities',
        color: 'hsl(221.2 83.2% 53.3%)',
    },
};

const pieChartConfig = {
    new: { label: 'New', color: 'hsl(217, 91%, 60%)' },
    qualifying: { label: 'Qualifying', color: 'hsl(38, 92%, 50%)' },
    proposal: { label: 'Proposal', color: 'hsl(270, 95%, 65%)' },
    won: { label: 'Won', color: 'hsl(142, 71%, 45%)' },
    lost: { label: 'Lost', color: 'hsl(0, 72%, 51%)' },
};

const statusColors = {
    new: 'hsl(217, 91%, 60%)',
    qualifying: 'hsl(38, 92%, 50%)',
    proposal: 'hsl(270, 95%, 65%)',
    won: 'hsl(142, 71%, 45%)',
    lost: 'hsl(0, 72%, 51%)',
};

export function DashboardCharts() {
    const { user } = useAuth();
    const { clients, getClientActivities } = useData();

    const isAdmin = user?.role === 'admin';

    // Filter clients based on user role
    const myClients = isAdmin
        ? clients
        : clients.filter(c => c.assignedTo === user?.id);

    // Calculate activity data for the last 6 months
    const getMonthlyActivityData = () => {
        const data = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            let activityCount = 0;
            myClients.forEach(client => {
                const activities = getClientActivities(client.id);
                activities.forEach(activity => {
                    const actDate = new Date(activity.timestamp);
                    if (actDate.getMonth() === date.getMonth() &&
                        actDate.getFullYear() === date.getFullYear()) {
                        if (isAdmin || activity.user === user?.name) {
                            activityCount++;
                        }
                    }
                });
            });

            data.push({ month: monthName, activities: activityCount });
        }

        return data;
    };

    // Calculate client status distribution
    const getStatusDistribution = () => {
        const statusCount = { new: 0, qualifying: 0, proposal: 0, won: 0, lost: 0 };

        myClients.forEach(client => {
            if (statusCount[client.status as keyof typeof statusCount] !== undefined) {
                statusCount[client.status as keyof typeof statusCount]++;
            }
        });

        return [
            { name: 'New', value: statusCount.new, fill: statusColors.new },
            { name: 'Qualifying', value: statusCount.qualifying, fill: statusColors.qualifying },
            { name: 'Proposal', value: statusCount.proposal, fill: statusColors.proposal },
            { name: 'Won', value: statusCount.won, fill: statusColors.won },
            { name: 'Lost', value: statusCount.lost, fill: statusColors.lost },
        ].filter(item => item.value >= 0); // Show all potential statuses or filter > 0
    };

    const activityData = getMonthlyActivityData();
    const statusData = getStatusDistribution();

    const chartTitle = isAdmin ? 'Company Overview' : 'My Performance';

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Activities Bar Chart */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {isAdmin ? 'Team Activities' : 'My Activities'}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {isAdmin ? 'All activities over the last 6 months' : 'My logged activities over the last 6 months'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                        <BarChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                            />
                            <Bar
                                dataKey="activities"
                                fill="hsl(221.2 83.2% 53.3%)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Client Status Pie Chart */}
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {isAdmin ? 'All Clients Status' : 'My Clients Status'}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {isAdmin
                            ? `Status distribution of all ${clients.length} clients`
                            : `Status distribution of my ${myClients.length} clients`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {statusData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            No clients assigned yet
                        </div>
                    ) : (
                        <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    paddingAngle={2}
                                    strokeWidth={2}
                                    stroke="#fff"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
