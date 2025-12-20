'use client';

import { Search, X } from 'lucide-react';

interface VagasHeaderProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    activeTab: 'vagas' | 'candidaturas';
    onTabChange: (tab: 'vagas' | 'candidaturas') => void;
    candidaturasCount: number;
}

/**
 * Header fixo da página de vagas com busca e tabs
 */
export function VagasHeader({
    searchTerm,
    onSearchChange,
    activeTab,
    onTabChange,
    candidaturasCount,
}: VagasHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm pt-2 sm:pt-4">
            <div className="p-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Vagas
                </h1>
                <p className="text-slate-600 text-sm mb-4">
                    Encontre oportunidades de emprego personalizadas para você.
                </p>

                {/* Campo de busca */}
                <div className="relative mb-4">
                    <label htmlFor="vagas-search" className="sr-only">
                        Buscar vagas
                    </label>
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-2.5">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                            id="vagas-search"
                            type="search"
                            placeholder="Buscar vagas, empresas ou requisitos..."
                            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                aria-label="Limpar busca"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Top Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => onTabChange('vagas')}
                        className={`flex-1 py-3 px-4 text-center font-semibold transition-colors relative ${activeTab === 'vagas'
                            ? 'text-[#5e9ea0]'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Vagas
                        {activeTab === 'vagas' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e9ea0]" />
                        )}
                    </button>
                    <button
                        onClick={() => onTabChange('candidaturas')}
                        className={`flex-1 py-3 px-4 text-center font-semibold transition-colors relative ${activeTab === 'candidaturas'
                            ? 'text-[#5e9ea0]'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Candidaturas
                        {candidaturasCount > 0 && (
                            <span className="ml-2 bg-[#5e9ea0] text-white text-xs px-2 py-0.5 rounded-full">
                                {candidaturasCount}
                            </span>
                        )}
                        {activeTab === 'candidaturas' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5e9ea0]" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
