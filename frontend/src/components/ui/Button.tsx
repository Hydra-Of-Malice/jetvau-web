import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, asChild = false, disabled, children, ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-white hover:bg-slate-800 shadow-sm",
            secondary: "bg-secondary text-white hover:bg-orange-700 shadow-sm",
            outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
            ghost: "text-primary hover:bg-slate-100",
            danger: "bg-red-600 text-white hover:bg-red-700",
        }

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg",
            icon: "h-10 w-10 p-0 flex items-center justify-center",
        }

        const buttonClasses = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            variants[variant],
            sizes[size],
            className
        );

        if (asChild) {
            return (
                <Slot className={buttonClasses} ref={ref} {...props}>
                    {children}
                </Slot>
            )
        }

        return (
            <button
                {...props}
                className={buttonClasses}
                ref={ref}
                disabled={isLoading || disabled}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
