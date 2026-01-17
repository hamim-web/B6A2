import React, { useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Navbar, Card, Button, Input, Badge } from '@/components/ui-custom';
import { useVehicles, useDeleteVehicle, useCreateVehicle } from '@/hooks/use-vehicles';
import { useBookings, useUpdateBookingStatus } from '@/hooks/use-bookings';
import { insertVehicleSchema } from '@shared/routes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calendar, Car, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const [, setLocation] = useLocation();

    if (!user) {
        setLocation('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar user={user} onLogout={logout} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">
                            {user.role === 'admin' ? 'Manage fleet and bookings' : 'Track your rentals'}
                        </p>
                    </div>
                    {user.role === 'admin' && (
                        <AddVehicleDialog />
                    )}
                </div>

                {user.role === 'admin' ? <AdminView /> : <CustomerView userId={user.id} />}
            </main>
        </div>
    );
}

function AdminView() {
    return (
        <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="mb-8 p-1 bg-white border border-slate-200 rounded-xl">
                <TabsTrigger value="bookings" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">All Bookings</TabsTrigger>
                <TabsTrigger value="vehicles" className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Fleet Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings">
                <BookingsList />
            </TabsContent>
            
            <TabsContent value="vehicles">
                <VehiclesList />
            </TabsContent>
        </Tabs>
    );
}

function CustomerView({ userId }: { userId: number }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
            <BookingsList userId={userId} />
        </div>
    );
}

function VehiclesList() {
    const { data: vehicles, isLoading } = useVehicles();
    const { mutate: deleteVehicle } = useDeleteVehicle();

    if (isLoading) return <div className="text-center py-12">Loading fleet...</div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            {vehicles?.map(vehicle => (
                <Card key={vehicle.id} className="flex flex-col md:flex-row items-center p-4 gap-6">
                    <div className="h-24 w-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img 
                            src={vehicle.imageUrl ? vehicle.imageUrl : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200&q=80"} 
                            className="w-full h-full object-cover" 
                            alt={vehicle.vehicleName} 
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-lg text-slate-900">{vehicle.vehicleName}</h3>
                        <p className="text-slate-500 text-sm">{vehicle.type} • {vehicle.registrationNumber}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="font-bold">${vehicle.dailyRentPrice}</div>
                            <div className={`text-xs font-medium ${vehicle.availabilityStatus === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                                {vehicle.availabilityStatus}
                            </div>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                                if(confirm('Are you sure you want to delete this vehicle?')) {
                                    deleteVehicle(vehicle.id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function BookingsList({ userId }: { userId?: number }) {
    const { data: bookings, isLoading } = useBookings();
    const { mutate: updateStatus } = useUpdateBookingStatus();
    const { data: vehicles } = useVehicles();
    
    // In a real app we'd fetch users too to show customer names for admin
    
    const filteredBookings = userId 
        ? bookings?.filter(b => b.customerId === userId) 
        : bookings;

    if (isLoading) return <div className="text-center py-12">Loading bookings...</div>;
    if (!filteredBookings?.length) return <div className="text-center py-12 text-slate-500">No bookings found.</div>;

    return (
        <div className="space-y-4">
            {filteredBookings.map(booking => {
                const vehicle = vehicles?.find(v => v.id === booking.vehicleId);
                return (
                    <Card key={booking.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                    booking.status === 'active' ? 'bg-blue-100 text-blue-600' : 
                                    booking.status === 'returned' ? 'bg-green-100 text-green-600' : 
                                    'bg-red-100 text-red-600'
                                }`}>
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        Booking #{booking.id} - {vehicle?.vehicleName || 'Unknown Vehicle'}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                        {new Date(booking.rentStartDate).toLocaleDateString()} — {new Date(booking.rentEndDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-lg">${booking.totalPrice}</div>
                                    <Badge variant={
                                        booking.status === 'active' ? 'default' : 
                                        booking.status === 'returned' ? 'success' : 'destructive'
                                    }>{booking.status}</Badge>
                                </div>
                                
                                {!userId && booking.status === 'active' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => updateStatus({ id: booking.id, status: 'returned' })}>
                                            Return
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => updateStatus({ id: booking.id, status: 'cancelled' })}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function AddVehicleDialog() {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();
    const { mutate: create, isPending } = useCreateVehicle();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof insertVehicleSchema>>({
        resolver: zodResolver(insertVehicleSchema)
    });

    const onSubmit = async (data: z.infer<typeof insertVehicleSchema>) => {
        let imageUrl = '';
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            try {
                const uploadResponse = await fetch('/api/v1/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                    imageUrl = uploadData.data.filePath;
                } else {
                    toast({
                        title: "Image Upload Failed",
                        description: uploadData.message,
                        variant: "destructive"
                    });
                    return;
                }
            } catch (uploadError: any) {
                toast({
                    title: "Image Upload Error",
                    description: uploadError.message,
                    variant: "destructive"
                });
                return;
            }
        }

        create({ ...data, imageUrl }, {
            onSuccess: () => {
                setOpen(false);
                reset();
                setSelectedFile(null); // Clear selected file
                toast({
                    title: "Vehicle Created",
                    description: "The new vehicle has been added to the fleet.",
                });
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <Input label="Vehicle Name" {...register('vehicleName')} error={errors.vehicleName?.message} />
                    
                    <div>
                        <label className="text-sm font-medium text-slate-700 ml-1">Vehicle Image</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                            className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Type</label>
                            <select 
                                {...register('type')} 
                                className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                            >
                                <option value="car">Car</option>
                                <option value="SUV">SUV</option>
                                <option value="van">Van</option>
                                <option value="bike">Bike</option>
                            </select>
                        </div>
                        <Input label="Registration No." {...register('registrationNumber')} error={errors.registrationNumber?.message} />
                    </div>

                    <Input 
                        label="Daily Price ($)" 
                        type="number" 
                        {...register('dailyRentPrice', { valueAsNumber: true })} 
                        error={errors.dailyRentPrice?.message} 
                    />

                    <Button type="submit" className="w-full" isLoading={isPending}>Create Vehicle</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
