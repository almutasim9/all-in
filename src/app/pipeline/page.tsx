'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PipelineView } from '@/components/clients/pipeline-view';
import { TodaySchedule } from '@/components/dashboard/today-schedule';
import { ClientSheet } from '@/components/clients/client-sheet';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { type Client } from '@/lib/types';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CalendarCheck2 } from "lucide-react";

export default function PipelinePage() {
    const { clients } = useData();
    const { user } = useAuth();

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
        setSheetOpen(true);
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Pipeline</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your daily tasks and track deal progress
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2 rounded-full border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 shadow-sm">
                                <CalendarCheck2 className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">Tasks</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Today's Schedule</SheetTitle>
                                <SheetDescription>
                                    Your prioritized tasks and follow-ups for today.
                                </SheetDescription>
                            </SheetHeader>
                            <TodaySchedule onClientClick={(client) => {
                                handleClientClick(client);
                            }} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="h-[calc(100vh-140px)]">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-full p-4 overflow-hidden">
                    <PipelineView
                        clients={clients}
                        repId={user?.id}
                        allowedProvinces={user?.allowedProvinces}
                        onClientClick={handleClientClick}
                    />
                </div>
            </div>

            <ClientSheet
                client={selectedClient}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </MainLayout>
    );
}
