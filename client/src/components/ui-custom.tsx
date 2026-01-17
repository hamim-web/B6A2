import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

// === Button ===
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
      secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
      outline: 'bg-transparent border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg font-semibold'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// === Input ===
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => (
        <div className="w-full space-y-1.5">
            {label && <label className="text-sm font-medium text-slate-700 ml-1">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    "flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
        </div>
    )
);
Input.displayName = 'Input';

// === Card ===
export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden", className)}>
        {children}
    </div>
);

// === Badge ===
export const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "destructive", className?: string }) => {
    const variants = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        destructive: "bg-red-100 text-red-700",
    };
    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
            {children}
        </span>
    );
}

// === Navbar ===
export const Navbar = ({ user, onLogout }: { user: any, onLogout: () => void }) => (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">
                DriveWave
            </Link>
            <div className="flex items-center gap-4">
                <Link href="/catalog" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                    Vehicles
                </Link>
                {user ? (
                    <>
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-slate-200 mx-2" />
                        <span className="text-sm font-medium text-slate-800">Hi, {user.name}</span>
                        <Button variant="ghost" size="sm" onClick={onLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="primary" size="sm">Get Started</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    </nav>
);
