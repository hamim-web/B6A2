import React from 'react';
import { Navbar, Button, Card } from '@/components/ui-custom';
import { useAuthStore } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { useVehicles } from '@/hooks/use-vehicles';

export default function Home() {
    const { user, logout } = useAuthStore();
    const { data: vehicles, isLoading } = useVehicles();

    // Limit to 3 featured vehicles
    const featuredVehicles = vehicles?.slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar user={user} onLogout={logout} />

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-80" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                        Drive the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Extraordinary</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Premium vehicle rentals for every journey. From city commuters to luxury weekenders, find your perfect ride today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/catalog">
                            <Button size="lg" className="rounded-full px-8">
                                Browse Fleet <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Fully Insured</h3>
                            <p className="text-slate-500">Every booking comes with comprehensive insurance coverage for your peace of mind.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
                            <p className="text-slate-500">Our dedicated team is always available to assist you, anytime, anywhere.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-16 w-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Anywhere Delivery</h3>
                            <p className="text-slate-500">We'll bring the car to you. Choose your location and we'll handle the rest.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Vehicles */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Featured Vehicles</h2>
                            <p className="text-slate-500 mt-2">Hand-picked selections just for you</p>
                        </div>
                        <Link href="/catalog">
                            <Button variant="ghost" className="hidden sm:inline-flex">View All</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
                            ))
                        ) : featuredVehicles && featuredVehicles.length > 0 ? (
                            featuredVehicles.map((vehicle) => (
                                <Card key={vehicle.id} className="group cursor-pointer h-full flex flex-col">
                                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                                        {/* Unsplash placeholder image based on vehicle type */}
                                        <img 
                                            src={vehicle.imageUrl ? vehicle.imageUrl : `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80`} 
                                            alt={vehicle.vehicleName}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                                            {vehicle.type}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{vehicle.vehicleName}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{vehicle.registrationNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">${vehicle.dailyRentPrice}</div>
                                                <div className="text-xs text-slate-500">/day</div>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                vehicle.availabilityStatus === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {vehicle.availabilityStatus === 'available' ? 'Available Now' : 'Booked'}
                                            </span>
                                            <Link href={`/vehicles/${vehicle.id}`}>
                                                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No vehicles available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
