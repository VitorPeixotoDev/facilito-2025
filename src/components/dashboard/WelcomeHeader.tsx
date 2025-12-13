import { DASHBOARD_CONFIG } from "@/lib/constants/dashboard";

interface WelcomeHeaderProps {
    variant?: "mobile" | "desktop";
}

export function WelcomeHeader({ variant = "mobile" }: WelcomeHeaderProps) {
    const titleClasses = variant === "mobile"
        ? "text-2xl sm:text-3xl"
        : "text-4xl xl:text-5xl";

    const descriptionClasses = variant === "mobile"
        ? "text-sm sm:text-base px-4"
        : "text-lg xl:text-xl";

    const marginBottom = variant === "mobile"
        ? "mb-2"
        : "mb-4";

    return (
        <>
            <h1 className={`${titleClasses} font-bold text-slate-900 ${marginBottom}`}>
                {DASHBOARD_CONFIG.welcome.title} <br /> {DASHBOARD_CONFIG.welcome.subtitle}
            </h1>
            <p className={`${descriptionClasses} text-slate-600 ${variant === "mobile" ? "" : "leading-relaxed"}`}>
                {DASHBOARD_CONFIG.welcome.description}
            </p>
        </>
    );
}

