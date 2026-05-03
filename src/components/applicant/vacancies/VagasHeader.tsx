'use client';

import { Search, X, ChevronDown, Keyboard, ArrowLeft } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

type WorkModelFilter = 'todos' | 'presencial' | 'remoto' | 'hibrido';

export type SearchMode = 'text' | 'code';

interface VagasHeaderProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    /** Modo de busca: texto (padrão) ou código de 6 dígitos */
    searchMode: SearchMode;
    onSearchModeChange: (mode: SearchMode) => void;
    /** Código de 6 dígitos (apenas quando searchMode === 'code') */
    codeDigits: string;
    onCodeDigitsChange: (value: string) => void;
    activeTab: 'vagas' | 'candidaturas';
    onTabChange: (tab: 'vagas' | 'candidaturas') => void;
    candidaturasCount: number;
    workModelFilter: WorkModelFilter;
    onWorkModelFilterChange: (filter: WorkModelFilter) => void;
}

/**
 * Header fixo da página de vagas com busca e tabs
 */
const CODE_LENGTH = 6;

export function VagasHeader({
    searchTerm,
    onSearchChange,
    searchMode,
    onSearchModeChange,
    codeDigits,
    onCodeDigitsChange,
    activeTab,
    onTabChange,
    candidaturasCount,
    workModelFilter,
    onWorkModelFilterChange,
}: VagasHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCandidaturasInfo, setShowCandidaturasInfo] = useState(false);
    const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const filterOptions: { value: WorkModelFilter; label: string }[] = [
        { value: 'todos', label: 'Todos os tipos' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'remoto', label: 'Remoto' },
        { value: 'hibrido', label: 'Híbrido' },
    ];

    const currentFilterLabel = filterOptions.find((opt) => opt.value === workModelFilter)?.label || 'Todos os tipos';

    const digitsArray = Array.from({ length: CODE_LENGTH }, (_, i) => codeDigits[i] ?? '');

    const handleCodeDigitChange = useCallback(
        (index: number, value: string) => {
            const digit = value.replace(/\D/g, '').slice(-1);
            const next = codeDigits.slice(0, index) + digit + codeDigits.slice(index + 1);
            onCodeDigitsChange(next.slice(0, CODE_LENGTH));
            if (digit && index < CODE_LENGTH - 1) {
                codeInputRefs.current[index + 1]?.focus();
            }
        },
        [codeDigits, onCodeDigitsChange]
    );

    const handleCodeKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !digitsArray[index] && index > 0) {
                codeInputRefs.current[index - 1]?.focus();
            }
        },
        [digitsArray]
    );

    const handleRevertToText = useCallback(() => {
        onCodeDigitsChange('');
        onSearchModeChange('text');
    }, [onCodeDigitsChange, onSearchModeChange]);

    return (
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm pt-2 sm:pt-4 lg:top-20">
            <div className="p-4">
                <div className="mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Vagas
                        </h1>
                        <button
                            type="button"
                            onClick={() => setShowCandidaturasInfo((prev) => !prev)}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#5f9ea0]/40 text-xs font-bold text-[#2f6668] hover:bg-[#5f9ea0]/10 transition-colors"
                            aria-label="Informação sobre candidaturas e contador"
                            title="Ajuda"
                        >
                            ?
                        </button>
                    </div>
                    {showCandidaturasInfo && (
                        <div className="mt-3 rounded-md border border-[#5f9ea0]/30 bg-[#5f9ea0]/10 p-3">
                            <p className="text-sm text-[#334155] leading-relaxed">
                                Sua lista de candidaturas foca no que importa: vagas que ainda estão valendo!
                                Quando uma vaga para de receber candidatos, ela é limpa do seu histórico visual
                                para não gerar confusão, mas o total de vezes que você se candidatou continua
                                aparecendo no contador ao lado.
                            </p>
                        </div>
                    )}
                </div>
                <p className="text-slate-600 text-sm mb-4">
                    Encontre oportunidades de emprego personalizadas para você.
                </p>

                {/* Campo de busca e filtro */}
                <div className="flex gap-2 mb-4">
                    {/* Campo de busca (texto ou 6 dígitos) */}
                    <div className="relative flex-1 min-w-0">
                        {searchMode === 'text' ? (
                            <>
                                <label htmlFor="vagas-search" className="sr-only">
                                    Buscar vagas
                                </label>
                                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-2.5">
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
                                    <input
                                        id="vagas-search"
                                        type="search"
                                        placeholder="Buscar vagas, empresas ou requisitos..."
                                        className="w-full min-w-0 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onSearchModeChange('code')}
                                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
                                        aria-label="Buscar por código de 6 dígitos"
                                        title="Buscar por código"
                                    >
                                        <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                                    </button>
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => onSearchChange('')}
                                            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                            aria-label="Limpar busca"
                                        >
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-2.5">
                                <div className="flex gap-1 sm:gap-1.5 flex-1 min-w-0 justify-center">
                                    {digitsArray.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => {
                                                codeInputRefs.current[i] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            aria-label={`Dígito ${i + 1} do código`}
                                            className="w-8 h-10 sm:w-9 sm:h-11 text-center text-lg font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-[#5e9ea0]"
                                            value={d}
                                            onChange={(e) => handleCodeDigitChange(i, e.target.value)}
                                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRevertToText}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors touch-manipulation shrink-0"
                                    aria-label="Voltar para busca por texto"
                                    title="Voltar para busca por texto"
                                >
                                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dropdown de filtro */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 sm:px-4 sm:py-2.5 text-sm sm:text-base text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                            aria-label="Filtrar por tipo de trabalho"
                        >
                            <span className="hidden sm:inline">{currentFilterLabel}</span>
                            <span className="sm:hidden">Tipo</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Menu dropdown */}
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                                    <div className="py-1">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    onWorkModelFilterChange(option.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${workModelFilter === option.value
                                                    ? 'bg-[#5e9ea0] text-white'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
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
