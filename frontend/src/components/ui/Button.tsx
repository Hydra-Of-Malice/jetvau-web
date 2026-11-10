import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, asChild = false, ...props }, ref) => {

        const variants = {
            primary: "bg-[var(--color-primary)] text-white hover:bg-opacity-90 shadow-md",
            secondary: "bg-[var(--color-secondary)] text-white hover:bg-opacity-90 shadow-md",
            outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
            ghost: "text-[var(--color-primary)] hover:bg-slate-100",
            danger: "bg-red-600 text-white hover:bg-red-700",
        }

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg",
            icon: "h-10 w-10 p-0 flex items-center justify-center",
        }

        const buttonClasses = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            variants[variant],
            sizes[size],
            className
        );

        if (asChild) {
            return (
                <Slot className={buttonClasses} ref={ref} {...props}>
                    {props.children}
                </Slot>
            )
        }

        return (
            <button
                className={buttonClasses}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <span className="animate-spin mr-2">⏳</span>
                )}
                {props.children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
