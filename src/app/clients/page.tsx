'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ClientsTable } from '@/components/clients/clients-table';
import { PipelineView } from '@/components/clients/pipeline-view';
import { ViewToggle } from '@/components/clients/view-toggle';
import { ClientSheet } from '@/components/clients/client-sheet';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

export default function ClientsPage() {
    const { clients } = useData();
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    const [selectedClient, setSelectedClient] = useState<any>(null); // Using any to avoid import issues for now
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleClientClick = (client: any) => {
        setSelectedClient(client);
        setSheetOpen(true);
    };

    return (
        <MainLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Clients</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your leads and track your pipeline progress
                    </p>
                </div>
                <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {viewMode === 'list' ? (
                <ClientsTable />
            ) : (
                <PipelineView
                    clients={clients}
                    repId={user?.id}
                    allowedProvinces={user?.allowedProvinces}
                    onClientClick={handleClientClick}
                />
            )}

            <ClientSheet
                client={selectedClient}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </MainLayout>
    );
}
