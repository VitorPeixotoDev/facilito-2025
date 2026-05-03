import { DASHBOARD_CONFIG } from "@/lib/constants/dashboard";
import Link from "next/link";

interface TermsFooterProps {
    variant?: "mobile" | "desktop";
}

export function TermsFooter({ variant = "mobile" }: TermsFooterProps) {
    if (variant === "desktop") {
        return (
            <div className="hidden lg:block fixed bottom-6 left-1/2 transform -translate-x-1/2">
                <p className="text-sm text-slate-500 text-center">
                    {DASHBOARD_CONFIG.terms.text}{" "}
                    <Link href="/termos" className="font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                        termos de uso
                    </Link>
                    .
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 sm:mt-10 text-center px-4">
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {DASHBOARD_CONFIG.terms.text}{" "}
                <Link href="/termos" className="font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                    termos de uso
                </Link>
                .
            </p>
        </div>
    );
}

