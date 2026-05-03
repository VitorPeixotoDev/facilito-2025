"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApplicantNavigation } from "@/components/applicant/ApplicantNavigation";
import { ApplicantTopNav } from "@/components/applicant/ApplicantTopNav";
import { useAuth } from "@/components/AuthClientProvider";
import { hasMeaningfulWorkExperienceFromDb } from "@/lib/workExperience";

const PROFILE_ONBOARDING_SEEN_KEY = "facilito.profile_onboarding_seen.v1";

function isFirstTimeProfile(profile: ReturnType<typeof useAuth>["profile"]) {
    if (!profile) return true;

    return (
        (!profile.description || profile.description.trim() === "") &&
        (!profile.birth_date || profile.birth_date === "") &&
        (!profile.skills || profile.skills.length === 0) &&
        (!profile.courses || profile.courses.length === 0) &&
        (!profile.freelancer_services || profile.freelancer_services.length === 0) &&
        !hasMeaningfulWorkExperienceFromDb(profile.experience) &&
        (!profile.academic_background || profile.academic_background.trim() === "") &&
        (!profile.home_address)
    );
}

export default function ApplicantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, loading, profileLoading } = useAuth();

    const isProfileOnboardingRoute = pathname === "/applicant/profile-onboarding";

    useEffect(() => {
        if (loading || profileLoading) return;
        if (!user) return;
        if (isProfileOnboardingRoute) return;
        if (pathname === "/applicant/profile") return;

        const firstTime = isFirstTimeProfile(profile);
        if (!firstTime) return;

        try {
            const seen = typeof window !== "undefined" && localStorage.getItem(PROFILE_ONBOARDING_SEEN_KEY) === "1";
            if (!seen) {
                router.replace("/applicant/profile-onboarding");
            }
        } catch {
            router.replace("/applicant/profile-onboarding");
        }
    }, [loading, profileLoading, user, profile, pathname, router, isProfileOnboardingRoute]);

    return (
        <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
            <ApplicantTopNav />
            {!isProfileOnboardingRoute && <ApplicantNavigation />}
            <main className={isProfileOnboardingRoute ? "" : "lg:pl-20 xl:pl-24 pb-16 lg:pb-0"}>
                {children}
            </main>
        </div>
    );
}

