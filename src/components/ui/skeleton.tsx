import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200/90", className)}
            {...props}
        />
    );
}

/** Tela cheia genérica (avaliação, fallback de dados). */
function FullPageSkeleton({ label }: { label?: string }) {
    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6"
            role="status"
            aria-busy="true"
            aria-label={label ?? "Carregando"}
        >
            <div className="w-full max-w-sm space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="mx-auto h-4 w-2/3 rounded" />
                <Skeleton className="h-36 w-full rounded-xl" />
            </div>
            {label ? <span className="sr-only">{label}</span> : null}
        </div>
    );
}

/** Layout aproximado da página de perfil (substitui spinner central). */
function ProfileShellSkeleton() {
    return (
        <div
            className="min-h-screen bg-slate-50 pb-24"
            role="status"
            aria-busy="true"
            aria-label="Carregando perfil"
        >
            <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto max-w-6xl space-y-3 px-4 py-4">
                    <Skeleton className="h-8 w-48 rounded-md" />
                    <Skeleton className="h-2 w-full max-w-md rounded-full" />
                </div>
            </div>
            <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <span className="sr-only">Carregando perfil</span>
        </div>
    );
}

function AssessmentShopGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
            ))}
        </div>
    );
}

function AssessmentDetailsModalSkeleton() {
    return (
        <div
            className="space-y-4 py-2"
            role="status"
            aria-busy="true"
            aria-label="Carregando detalhes da avaliação"
        >
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <span className="sr-only">Carregando detalhes da avaliação</span>
        </div>
    );
}

function VagasPageSkeleton() {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-[#e3f2f3] to-slate-100"
            role="status"
            aria-busy="true"
            aria-label="Carregando vagas"
        >
            <div className="w-full max-w-2xl space-y-4 px-4">
                <Skeleton className="mx-auto h-8 w-48 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
            <span className="sr-only">Carregando vagas</span>
        </div>
    );
}

function VagaCardListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                    <Skeleton className="mb-3 h-5 w-2/3 rounded" />
                    <Skeleton className="mb-2 h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                </div>
            ))}
        </div>
    );
}

function ApplicantNavBarSkeleton() {
    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm lg:h-20">
            <Skeleton className="h-8 w-36 rounded md:w-40" />
            <Skeleton className="h-9 w-9 rounded-full" />
        </header>
    );
}

/** Fallback compacto para verificação de sessão / Suspense em auth. */
function AuthLoadingCardSkeleton({ caption }: { caption: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-4 text-center">
                    <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                    <Skeleton className="mx-auto h-4 w-48 rounded" />
                </div>
                <span className="sr-only">{caption}</span>
            </div>
        </div>
    );
}

export {
    Skeleton,
    FullPageSkeleton,
    ProfileShellSkeleton,
    AssessmentShopGridSkeleton,
    AssessmentDetailsModalSkeleton,
    VagasPageSkeleton,
    VagaCardListSkeleton,
    ApplicantNavBarSkeleton,
    AuthLoadingCardSkeleton,
};
