'use client';

import {
    UserPlus,
    MapPin,
    Phone,
    MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
    onAddLead: () => void;
}

export function QuickActions({ onAddLead }: QuickActionsProps) {
    const actions = [
        {
            label: 'Add Lead',
            icon: UserPlus,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            action: onAddLead
        },
        {
            label: 'Check In',
            icon: MapPin,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            action: () => console.log('Check In clicked') // Placeholder for now
        },
        {
            label: 'Call List',
            icon: Phone,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            action: () => console.log('Call List clicked')
        },
        {
            label: 'WhatsApp',
            icon: MessageCircle,
            color: 'text-green-600',
            bg: 'bg-green-100',
            action: () => window.open('https://wa.me/', '_blank') // Generic WA open for now
        }
    ];

    return (
        <div className="grid grid-cols-4 gap-2 mb-6">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.action}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className={`
                        flex items-center justify-center w-14 h-14 rounded-2xl 
                        ${action.bg} shadow-sm transition-transform group-hover:scale-105 group-active:scale-95
                    `}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
