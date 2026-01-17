import React, { useState } from 'react';
import { Navbar, Button, Card, Input, Badge } from '@/components/ui-custom';
import { useAuthStore } from '@/hooks/use-auth';
import { useVehicles } from '@/hooks/use-vehicles';
import { Link } from 'wouter';
import { Filter, Search } from 'lucide-react';

export default function Catalog() {
    const { user, logout } = useAuthStore();
    const { data: vehicles, isLoading } = useVehicles();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    const filteredVehicles = vehicles?.filter(v => {
        const matchesSearch = v.vehicleName.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter ? v.type === typeFilter : true;
        return matchesSearch && matchesType;
    });

    const vehicleTypes = Array.from(new Set(vehicles?.map(v => v.type) || []));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar user={user} onLogout={logout} />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Vehicle Catalog</h1>
                        <p className="text-slate-500 mt-1">Find the perfect vehicle for your needs</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search vehicles..." 
                                className="pl-10 h-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                             <Button 
                                variant={typeFilter === null ? 'primary' : 'secondary'} 
                                size="sm" 
                                onClick={() => setTypeFilter(null)}
                            >
                                All
                            </Button>
                            {vehicleTypes.map(type => (
                                <Button 
                                    key={type}
                                    variant={typeFilter === type ? 'primary' : 'secondary'} 
                                    size="sm" 
                                    onClick={() => setTypeFilter(type)}
                                    className="capitalize"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
                        ))
                    ) : filteredVehicles && filteredVehicles.length > 0 ? (
                        filteredVehicles.map(vehicle => (
                            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`} className="block h-full">
                                <Card className="h-full flex flex-col hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div className="relative h-48 bg-slate-100">
                                         {/* Unsplash placeholder car image */}
                                        <img 
                                            src={vehicle.imageUrl || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"} 
                                            alt={vehicle.vehicleName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge variant={vehicle.availabilityStatus === 'available' ? 'success' : 'warning'}>
                                                {vehicle.availabilityStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{vehicle.vehicleName}</h3>
                                            <p className="text-slate-500 text-sm capitalize">{vehicle.type}</p>
                                        </div>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div>
                                                <span className="text-lg font-bold text-primary">${vehicle.dailyRentPrice}</span>
                                                <span className="text-xs text-slate-500 ml-1">/ day</span>
                                            </div>
                                            <Button size="sm" variant="outline">View</Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No vehicles found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
