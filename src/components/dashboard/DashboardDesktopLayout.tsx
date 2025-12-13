"use client";

import { LogoCard } from "./LogoCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { ProfileOptionCard } from "./ProfileOptionCard";
import { TermsFooter } from "./TermsFooter";
import { PROFILE_OPTIONS } from "@/lib/constants/dashboard";

export function DashboardDesktopLayout() {
    return (
        <>
            <div className="hidden lg:flex w-full max-w-7xl mx-auto items-center justify-center gap-12 xl:gap-16">
                <div className="flex-1 max-w-md xl:max-w-lg">
                    <div className="text-center mb-8">
                        <LogoCard variant="desktop" />
                        <WelcomeHeader variant="desktop" />
                    </div>
                </div>

                <div className="flex-1 max-w-lg xl:max-w-xl space-y-6">
                    {PROFILE_OPTIONS.map((option) => (
                        <ProfileOptionCard
                            key={option.id}
                            option={option}
                            variant="desktop"
                        />
                    ))}
                </div>
            </div>

            <TermsFooter variant="desktop" />
        </>
    );
}

