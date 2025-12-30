"use client";

import { CourseFilters } from "./CourseFilters";
import { AssessmentFilters } from "./AssessmentFilters";

const TABS = [
    { id: "avaliacoes" as const, label: "Avaliações" },
    { id: "ed-profissional" as const, label: "Ed. Profissional" },
];

type TabId = (typeof TABS)[number]["id"];

interface ShopTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    initialSearchTerm?: string;
}

export function ShopTabs({ activeTab, onTabChange, initialSearchTerm }: ShopTabsProps) {
    return (
        <div className="space-y-6 sm:space-y-7">
            {/* Top Tabs */}
            <div className="flex rounded-full bg-white border border-slate-200 shadow-sm p-1.5 sm:p-1.5">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 py-3 sm:py-2.5 px-4 sm:px-4 rounded-full text-sm sm:text-sm font-semibold transition-all ${isActive
                                ? "bg-[#5e9ea0] text-white shadow-md"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Conteúdo por aba */}
            <div>
                {activeTab === "avaliacoes" ? (
                    <AssessmentFilters initialSearchTerm={initialSearchTerm} />
                ) : (
                    <CourseFilters initialSearchTerm={initialSearchTerm} />
                )}
            </div>
        </div>
    );
}

export type { TabId };
