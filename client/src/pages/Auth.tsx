import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useSignup } from '@/hooks/use-auth';
import { Button, Input, Card } from '@/components/ui-custom';
import { Link, useLocation } from 'wouter';
import { api, loginSchema, insertUserSchema } from '@shared/routes';
import { ArrowLeft, Car } from 'lucide-react';

export function Login() {
    const { mutate: login, isPending, error } = useLogin();
    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: z.infer<typeof loginSchema>) => {
        login(data);
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input 
                    label="Email" 
                    type="email" 
                    placeholder="you@example.com" 
                    {...register('email')}
                    error={errors.email?.message}
                />
                <Input 
                    label="Password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register('password')}
                    error={errors.password?.message}
                />
                
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                        {error.message}
                    </div>
                )}

                <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
                    Sign In
                </Button>

                <div className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Create account
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export function Register() {
    const { mutate: signup, isPending, error } = useSignup();
    // Use the full signup schema but refine confirmation if needed
    // For simplicity, we'll use the API input schema directly
    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof insertUserSchema>>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            role: 'customer'
        }
    });

    const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
        signup(data);
    };

    return (
        <AuthLayout title="Create an account" subtitle="Start your journey with us">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input 
                    label="Full Name" 
                    placeholder="John Doe" 
                    {...register('name')}
                    error={errors.name?.message}
                />
                <Input 
                    label="Email" 
                    type="email" 
                    placeholder="you@example.com" 
                    {...register('email')}
                    error={errors.email?.message}
                />
                 <Input 
                    label="Phone" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    {...register('phone')}
                    error={errors.phone?.message}
                />
                <Input 
                    label="Password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register('password')}
                    error={errors.password?.message}
                />

                {/* Hidden role field, defaults to customer */}
                <input type="hidden" {...register('role')} />
                
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                        {error.message}
                    </div>
                )}

                <Button type="submit" className="w-full mt-2" size="lg" isLoading={isPending}>
                    Create Account
                </Button>

                <div className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

// Layout Wrapper
function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel: Form */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12 bg-white">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-10">
                        <Link href="/">
                            <div className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 cursor-pointer transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                        <p className="mt-2 text-slate-500">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Right Panel: Visual */}
            <div className="hidden lg:block relative bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90" />
                {/* Unsplash abstract luxury car detail */}
                <img 
                    src="https://pixabay.com/get/g9c5da8ed0000b977cd884fc142abbf0efc4958283aafb2b5311212fa6741b8acc3ab60a64833cf02165d7871a055b3a1ee1a05f0844937c5638175b4be9aaee4_1280.png" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    alt="Background"
                />
                <div className="relative z-10 flex flex-col justify-center h-full px-12 text-white">
                    <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                        <Car className="h-6 w-6" />
                    </div>
                    <blockquote className="text-2xl font-medium leading-relaxed">
                        "The freedom of the open road is just a click away. Experience premium service and reliable vehicles for every occasion."
                    </blockquote>
                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500" />
                        <div>
                            <div className="font-bold">DriveWave Team</div>
                            <div className="text-blue-200 text-sm">Premium Rentals</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
