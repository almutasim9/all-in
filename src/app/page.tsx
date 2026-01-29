'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardCharts } from '@/components/dashboard/charts';
import { FollowUpReminders } from '@/components/dashboard/follow-up-reminders';
import { MyStatsCards } from '@/components/dashboard/my-stats-cards';
import { TodaySchedule } from '@/components/dashboard/today-schedule';
import { UnassignedLeadsCard } from '@/components/dashboard/unassigned-leads-card';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { MyTargetCard } from '@/components/dashboard/my-target-card';
import { CompactKPIBar } from '@/components/dashboard/compact-kpi-bar';
import { CompactAlertBar } from '@/components/dashboard/compact-alert-bar';
import { ClientSheet } from '@/components/clients/client-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { AddLeadDialog } from '@/components/clients/add-lead-dialog';
import { Button } from '@/components/ui/button';
import { type Client } from '@/lib/types';
import { Users, Trophy, Calendar, BarChart3, LayoutDashboard, KanbanSquare, Plus, Map as MapIcon } from 'lucide-react';
import { PipelineView } from '@/components/clients/pipeline-view';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ClientMapView } from '@/components/clients/client-map-view';

export default function DashboardPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const { user } = useAuth();
  const { clients } = useData(); // Get clients for Pipeline

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setSheetOpen(true);
  };

  const isAdmin = user?.role === 'admin';
  const isSalesRep = user?.role === 'sales_rep';

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leads', label: 'Clients', icon: Users },
    { id: 'followups', label: 'Follow-ups', icon: Calendar },
    { id: 'team', label: 'Team', icon: Trophy },
  ];

  return (
    <MainLayout>
      <DashboardHeader />

      <div className="space-y-4">
        {/* ===== Admin Dashboard ===== */}
        {isAdmin && (
          <>
            {/* Compact Alert Bar */}
            <CompactAlertBar />

            {/* KPI Cards */}
            <CompactKPIBar />

            {/* Dashboard Tabs */}
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-[400px]">
                <TabsContent value="analytics" className="mt-0">
                  <DashboardCharts />
                </TabsContent>

                <TabsContent value="leads" className="mt-0">
                  <UnassignedLeadsCard />
                </TabsContent>

                <TabsContent value="followups" className="mt-0">
                  <FollowUpReminders onClientClick={handleClientClick} />
                </TabsContent>

                <TabsContent value="team" className="mt-0">
                  <Leaderboard />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}

        {/* ===== Sales Rep Dashboard ===== */}
        {isSalesRep && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-[400px] h-11 bg-slate-100/80 p-1 border border-slate-200">
              <TabsTrigger
                value="overview"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="pipeline"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-medium"
              >
                <KanbanSquare className="h-4 w-4" />
                Pipeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
              {/* Quick Actions (Mobile First) */}
              <div className="md:hidden">
                <QuickActions onAddLead={() => setAddLeadOpen(true)} />
              </div>

              {/* Target Card - Full Width (Slim) */}
              <MyTargetCard />

              {/* Today's Schedule (Priority) */}
              <TodaySchedule onClientClick={handleClientClick} />

              {/* Stats */}
              <MyStatsCards />

              {/* Charts */}
              <DashboardCharts />
            </TabsContent>

            <TabsContent value="pipeline" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="h-[calc(100vh-180px)]">
                <PipelineView
                  clients={clients}
                  repId={user.id}
                  onClientClick={handleClientClick}
                />
              </div>
            </TabsContent>

          </Tabs>
        )}
      </div>

      <ClientSheet
        client={selectedClient}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Floating Action Button (FAB) for adding leads */}
      <Button
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white z-50 transition-transform hover:scale-105"
        onClick={() => setAddLeadOpen(true)}
      >
        <Plus className="h-8 w-8" />
      </Button>

      <AddLeadDialog open={addLeadOpen} onOpenChange={setAddLeadOpen} />
    </MainLayout>
  );
}
