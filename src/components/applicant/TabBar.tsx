"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPLICANT_NAV_ITEMS } from "@/lib/constants/applicant";
import { cn } from "@/lib/utils";

export function TabBar() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 z-50">
            <div className="flex items-center justify-around h-16 px-2">
                {APPLICANT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            aria-label={item.ariaLabel}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-all duration-200",
                                isActive
                                    ? "text-[#5e9ea0]"
                                    : "text-slate-600"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-lg transition-all duration-200",
                                    isActive ? "bg-[#5e9ea0]/10" : ""
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-xs font-medium", isActive ? "text-[#5e9ea0]" : "text-slate-600")}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

