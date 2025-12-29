'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { PipelineView } from '@/components/clients/pipeline-view';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PipelineTab() {
    const { clients, teamMembers } = useData();
    const [selectedRep, setSelectedRep] = useState<string>('all');

    // Only show sales reps in the filter
    const salesReps = teamMembers.filter(m => m.role === 'sales_rep');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Pipeline Overview</h2>
                    <p className="text-sm text-slate-500">
                        Track work progress across all team members
                    </p>
                </div>

                <Select value={selectedRep} onValueChange={setSelectedRep}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-white">
                        <SelectValue placeholder="Filter by Representative" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Representatives</SelectItem>
                        {salesReps.map(rep => (
                            <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <PipelineView clients={clients} repId={selectedRep} />
        </div>
    );
}
