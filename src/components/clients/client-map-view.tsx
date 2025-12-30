'use client';

import { useData } from '@/lib/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ClientMapView() {
    const { clients } = useData();

    // Group clients by province
    const clientsByProvince = clients.reduce((acc, client) => {
        const province = client.province || 'Unknown';
        if (!acc[province]) {
            acc[province] = [];
        }
        acc[province].push(client);
        return acc;
    }, {} as Record<string, typeof clients>);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Client Map Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-100 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                        <MapPin className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">Map View Placeholder</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                            Google Maps integration requires an API Key.
                            For now, browse clients by location below.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(clientsByProvince).map(([province, provinceClients]) => (
                    <Card key={province}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex justify-between">
                                {province}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {provinceClients.length} clients
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {provinceClients.map(client => (
                                    <div key={client.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                                        <span className="truncate max-w-[150px] font-medium">{client.name}</span>
                                        <div className="flex gap-1">
                                            {client.googleMapsUrl && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-blue-600"
                                                    onClick={() => window.open(client.googleMapsUrl, '_blank')}
                                                >
                                                    <Navigation className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
