'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
    mode: 'list' | 'board';
    onChange: (mode: 'list' | 'board') => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange('list')}
                className={cn(
                    'h-7 px-3 text-xs font-medium rounded-md transition-all',
                    mode === 'list'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                )}
            >
                <List className="mr-2 h-3.5 w-3.5" />
                List
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange('board')}
                className={cn(
                    'h-7 px-3 text-xs font-medium rounded-md transition-all',
                    mode === 'board'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                )}
            >
                <LayoutGrid className="mr-2 h-3.5 w-3.5" />
                Board
            </Button>
        </div>
    );
}
