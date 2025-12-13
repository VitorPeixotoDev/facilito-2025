import { DashboardMobileLayout } from "@/components/dashboard/DashboardMobileLayout";
import { DashboardDesktopLayout } from "@/components/dashboard/DashboardDesktopLayout";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <DashboardMobileLayout />
            <DashboardDesktopLayout />
        </div>
    );
} 