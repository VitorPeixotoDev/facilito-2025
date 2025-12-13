"use client";

import { LogoCard } from "./LogoCard";
import { WelcomeHeader } from "./WelcomeHeader";
import { ProfileOptionCard } from "./ProfileOptionCard";
import { TermsFooter } from "./TermsFooter";
import { PROFILE_OPTIONS } from "@/lib/constants/dashboard";

export function DashboardMobileLayout() {
    return (
        <div className="w-full max-w-md lg:hidden">
            <div className="text-center mb-8 sm:mb-10">
                <LogoCard variant="mobile" />
                <WelcomeHeader variant="mobile" />
            </div>

            <div className="space-y-4 sm:space-y-5">
                {PROFILE_OPTIONS.map((option) => (
                    <ProfileOptionCard
                        key={option.id}
                        option={option}
                        variant="mobile"
                    />
                ))}
            </div>

            <TermsFooter variant="mobile" />
        </div>
    );
}

