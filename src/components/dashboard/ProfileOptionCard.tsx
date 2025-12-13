"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ProfileOption } from "@/lib/constants/dashboard";

interface ProfileOptionCardProps {
    option: ProfileOption;
    variant?: "mobile" | "desktop";
}

export function ProfileOptionCard({ option, variant = "mobile" }: ProfileOptionCardProps) {
    const router = useRouter();
    const Icon = option.icon;

    const isExternalUrl = option.href.startsWith("http://") || option.href.startsWith("https://");

    const handleClick = () => {
        if (isExternalUrl) {
            window.location.href = option.href;
        } else {
            router.push(option.href);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isExternalUrl) {
                window.location.href = option.href;
            } else {
                router.push(option.href);
            }
        }
    };

    // Mobile styles
    const mobileCardClasses = `border-2 border-transparent ${option.colorClasses.borderHover} ${option.colorClasses.borderActive} transition-all duration-200 cursor-pointer active:scale-[0.97] shadow-lg hover:shadow-xl bg-white`;
    const mobileContentPadding = "p-6 sm:p-7";
    const mobileIconSize = "w-16 h-16 sm:w-20 sm:h-20";
    const mobileIconInnerSize = "w-8 h-8 sm:w-10 sm:h-10";
    const mobileTitleSize = "text-xl sm:text-2xl";
    const mobileTextSize = "text-sm sm:text-base";
    const mobileArrowSize = "w-4 h-4 sm:w-5 sm:h-5";
    const mobileGap = "gap-4 sm:gap-5";

    // Desktop styles
    const desktopCardClasses = `border-2 border-transparent ${option.colorClasses.borderHover} transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-lg hover:shadow-2xl bg-white group`;
    const desktopContentPadding = "p-8 xl:p-10";
    const desktopIconSize = "w-20 h-20 xl:w-24 xl:h-24";
    const desktopIconInnerSize = "w-10 h-10 xl:w-12 xl:h-12";
    const desktopTitleSize = "text-2xl xl:text-3xl";
    const desktopTextSize = "text-base xl:text-lg";
    const desktopArrowSize = "w-5 h-5 xl:w-6 xl:h-6";
    const desktopGap = "gap-6 xl:gap-8";

    const isMobile = variant === "mobile";

    return (
        <Card
            className={isMobile ? mobileCardClasses : desktopCardClasses}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={option.ariaLabel}
        >
            <CardContent className={isMobile ? mobileContentPadding : desktopContentPadding}>
                <div className={`flex items-start ${isMobile ? mobileGap : desktopGap}`}>
                    <div
                        className={`flex-shrink-0 ${isMobile ? mobileIconSize : desktopIconSize} ${option.colorClasses.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${!isMobile ? "group-hover:scale-110 transition-transform duration-200" : ""}`}
                    >
                        <Icon className={`${isMobile ? mobileIconInnerSize : desktopIconInnerSize} text-white`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h2 className={`${isMobile ? mobileTitleSize : desktopTitleSize} font-bold text-slate-900 ${isMobile ? "mb-2" : "mb-3"}`}>
                            {option.title}
                        </h2>
                        <p className={`${isMobile ? mobileTextSize : desktopTextSize} text-slate-600 ${isMobile ? "mb-4" : "mb-5"} leading-relaxed`}>
                            {option.description}
                        </p>
                        <div className={`flex items-center ${option.colorClasses.text} ${option.colorClasses.textHover || ""} font-semibold ${isMobile ? mobileTextSize : desktopTextSize} ${!isMobile ? "transition-colors" : "group"}`}>
                            Acessar
                            <ArrowRight
                                className={`${isMobile ? mobileArrowSize : desktopArrowSize} ml-2 transition-transform ${isMobile ? "group-hover:translate-x-1" : "group-hover:translate-x-2"}`}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

