import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "outline" | "secondary";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                    {
                        "bg-[#5e9ea0] text-white": variant === "default",
                        "border border-[#5e9ea0] text-[#4a8b8f] bg-white": variant === "outline",
                        "bg-slate-100 text-slate-700": variant === "secondary",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };

