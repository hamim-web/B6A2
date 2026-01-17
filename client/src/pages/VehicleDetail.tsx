import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useVehicle } from '@/hooks/use-vehicles';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useAuthStore } from '@/hooks/use-auth';
import { Navbar, Button, Card, Input, Badge } from '@/components/ui-custom';
import { differenceInDays, addDays, format } from 'date-fns';
import { Calendar, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VehicleDetail() {
    const [, params] = useRoute("/vehicles/:id");
    const id = parseInt(params?.id || '0');
    const { data: vehicle, isLoading } = useVehicle(id);
    const { user, logout } = useAuthStore();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));

    const { mutate: book, isPending } = useCreateBooking();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!vehicle) return <div className="min-h-screen flex items-center justify-center">Vehicle not found</div>;

    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    const totalPrice = days * vehicle.dailyRentPrice;

    const handleBooking = () => {
        if (!user) {
            setLocation('/login');
            return;
        }

        book({
            vehicleId: vehicle.id,
            rentStartDate: startDate,
            rentEndDate: endDate,
            customerId: user.id // Usually backend infers this from token, but schema allows passing it
        }, {
            onSuccess: () => {
                toast({
                    title: "Booking Successful!",
                    description: "Your vehicle has been reserved.",
                });
                setLocation('/dashboard');
            },
            onError: (err) => {
                toast({
                    title: "Booking Failed",
                    description: err.message,
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar user={user} onLogout={logout} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Images & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                            <img 
                                src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80'} 
                                alt={vehicle.vehicleName}
                                className="w-full h-[400px] object-cover"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-4xl font-bold text-slate-900">{vehicle.vehicleName}</h1>
                                <Badge className="text-lg px-4 py-1" variant={vehicle.availabilityStatus === 'available' ? 'success' : 'warning'}>
                                    {vehicle.availabilityStatus}
                                </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-slate-500 mb-6">
                                <span className="px-3 py-1 bg-slate-100 rounded-full">{vehicle.type}</span>
                                <span className="px-3 py-1 bg-slate-100 rounded-full">Reg: {vehicle.registrationNumber}</span>
                            </div>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Experience the road like never before. This {vehicle.vehicleName} offers premium comfort, exceptional handling, and the reliability you need for your journey. maintained to the highest standards.
                            </p>
                        </div>
                    </div>

                    {/* Right: Booking Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 p-6 border-slate-200 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Book this Vehicle</h3>
                            
                            <div className="flex items-baseline mb-8">
                                <span className="text-4xl font-bold text-primary">${vehicle.dailyRentPrice}</span>
                                <span className="text-slate-500 ml-2">/ day</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Pick-up Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="date" 
                                            className="w-full pl-10 h-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Return Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input 
                                            type="date" 
                                            className="w-full pl-10 h-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-8 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">${vehicle.dailyRentPrice} x {days} days</span>
                                    <span className="font-medium">${totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Service Fee</span>
                                    <span className="font-medium">$0</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>${totalPrice}</span>
                                </div>
                            </div>

                            {vehicle.availabilityStatus === 'available' ? (
                                <Button className="w-full py-6 text-lg" onClick={handleBooking} isLoading={isPending}>
                                    Confirm Booking
                                </Button>
                            ) : (
                                <Button className="w-full py-6 text-lg" disabled variant="secondary">
                                    Currently Unavailable
                                </Button>
                            )}
                            
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> Free cancellation up to 24h before
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
