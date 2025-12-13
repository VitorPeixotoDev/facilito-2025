"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APPLICANT_NAV_ITEMS } from "@/lib/constants/applicant";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 xl:w-24 flex-col items-center py-6 bg-slate-50 border-r border-slate-200">
            <nav className="flex flex-col items-center gap-2 w-full">
                {APPLICANT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            aria-label={item.ariaLabel}
                            className={cn(
                                "w-full flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-[#5e9ea0] text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-[#5e9ea0]"
                            )}
                        >
                            <Icon className="w-5 h-5 xl:w-6 xl:h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

