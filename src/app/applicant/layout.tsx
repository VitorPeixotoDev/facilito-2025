import { ApplicantNavigation } from "@/components/applicant/ApplicantNavigation";
import { ApplicantTopNav } from "@/components/applicant/ApplicantTopNav";

export default function ApplicantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <ApplicantTopNav />
            <ApplicantNavigation />
            <main className="lg:pl-20 xl:pl-24 pb-16 lg:pb-0">
                {children}
            </main>
        </div>
    );
}

