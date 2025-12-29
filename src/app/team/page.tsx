'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MembersTab } from './members-tab';
import { TargetsTab } from './targets-tab';
import { AssignmentsTab } from './assignments-tab';
import { PipelineTab } from './pipeline-tab';
import { Users, Target, KanbanSquare, GripVertical } from 'lucide-react';

export default function TeamPage() {
    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Team Management</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage Representatives, Targets, and Workflow
                </p>
            </div>

            <Tabs defaultValue="members" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Members
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4" />
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="targets" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Targets
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="flex items-center gap-2">
                        <KanbanSquare className="h-4 w-4" />
                        Pipeline
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="outline-none">
                    <MembersTab />
                </TabsContent>

                <TabsContent value="assignments" className="outline-none">
                    <AssignmentsTab />
                </TabsContent>

                <TabsContent value="targets" className="outline-none">
                    <TargetsTab />
                </TabsContent>

                <TabsContent value="pipeline" className="outline-none">
                    <PipelineTab />
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
}
