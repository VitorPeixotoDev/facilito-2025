import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_CONFIG } from "@/lib/constants/dashboard";
import Image from "next/image";

interface LogoCardProps {
    variant?: "mobile" | "desktop";
}

export function LogoCard({ variant = "mobile" }: LogoCardProps) {
    const sizeClasses = variant === "mobile"
        ? "h-24 sm:h-32"
        : "h-32 xl:h-40";

    const cardPadding = variant === "mobile"
        ? "p-3 sm:p-4"
        : "p-3";

    return (
        <Card className="border-2 border-transparent shadow-lg bg-[#5e9ea0] mb-5 sm:mb-6 inline-block">
            <CardContent className={cardPadding}>
                <div className="flex justify-center">
                    <Image
                        src={DASHBOARD_CONFIG.logo.src}
                        alt={DASHBOARD_CONFIG.logo.alt}
                        width={variant === "mobile" ? 128 : 160}
                        height={variant === "mobile" ? 128 : 160}
                        className={`${sizeClasses} w-auto object-contain drop-shadow-2xl`}
                        priority
                    />
                </div>
            </CardContent>
        </Card>
    );
}

