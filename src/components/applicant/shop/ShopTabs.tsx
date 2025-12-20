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
        <div className="space-y-4 sm:space-y-5">
            {/* Top Tabs */}
            <div className="flex rounded-full bg-white border border-slate-200 shadow-sm p-1 text-xs sm:text-sm">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 py-2 px-3 rounded-full font-medium transition-colors ${isActive
                                ? "bg-[#5e9ea0] text-white"
                                : "text-slate-600 hover:text-slate-900"
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
