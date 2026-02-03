'use client';

import { useState, useMemo, useEffect } from 'react';
import { VagasHeader, type SearchMode } from './VagasHeader';
import { VagaCard } from './VagaCard';
import { VagaDetailsModal } from './VagaDetailsModal';
import { VagasEmptyState } from './VagasEmptyState';
import { MissingDataModal } from './MissingDataModal';
import type { JobDisplay } from '@/lib/vacancies/types';
import { getCandidaturasFromStorage, addCandidaturaToStorage, removeCandidaturaFromStorage } from '@/lib/vacancies/clientVacancyService';
import { applyToJob, removeApplication, getJobsByLocationCode } from '@/app/applicant/vacancies/actions';
import { calculateDistance } from '@/lib/ranking/utils/distance';

/** Tipo para vaga exibida com distância aproximada (km) quando aplicável */
export type JobWithDistance = JobDisplay & { distanceKm?: number };

interface VagasPageClientProps {
    initialJobs: JobDisplay[];
    initialCandidaturas: string[];
    /** Coordenadas do endereço do candidato para ordenação e exibição da distância (raio 30 km) */
    userHomeAddress: { latitude: number; longitude: number } | null;
    /** Raio limite em metros (ex.: 30_000 = 30 km) para vagas presenciais/híbridas */
    radiusM: number;
}

/**
 * Componente client da página de vagas
 * Gerencia estado, filtros, busca e candidaturas
 */
type WorkModelFilter = 'todos' | 'presencial' | 'remoto' | 'hibrido';

export default function VagasPageClient({
    initialJobs,
    initialCandidaturas,
    userHomeAddress,
    radiusM,
}: VagasPageClientProps) {
    const [activeTab, setActiveTab] = useState<'vagas' | 'candidaturas'>('vagas');
    const [candidaturas, setCandidaturas] = useState<string[]>(initialCandidaturas);
    const [vagaSelecionada, setVagaSelecionada] = useState<JobDisplay | null>(null);
    const [showModalDetalhes, setShowModalDetalhes] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [workModelFilter, setWorkModelFilter] = useState<WorkModelFilter>('todos');
    const [searchMode, setSearchMode] = useState<SearchMode>('text');
    const [codeDigits, setCodeDigits] = useState('');
    const [locationCodeJobs, setLocationCodeJobs] = useState<JobDisplay[] | null>(null);
    const [locationCodeLoading, setLocationCodeLoading] = useState(false);
    const [showMissingDataModal, setShowMissingDataModal] = useState(false);
    const [missingFields, setMissingFields] = useState<{
        whatsapp?: boolean;
        email?: boolean;
        address?: boolean;
    }>({});

    // Sincronizar com localStorage (fallback)
    useEffect(() => {
        const stored = getCandidaturasFromStorage();
        if (stored.length > 0) {
            setCandidaturas(stored);
        }
    }, []);

    // Listener para mudanças no localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = getCandidaturasFromStorage();
            setCandidaturas(stored);
        };

        const handleCandidaturasChanged = () => {
            handleStorageChange();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('candidaturasChanged', handleCandidaturasChanged);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('candidaturasChanged', handleCandidaturasChanged);
        };
    }, []);

    // Busca por código de 6 dígitos: dispara quando o usuário preenche os 6 dígitos
    useEffect(() => {
        if (searchMode !== 'code' || codeDigits.replace(/\D/g, '').length !== 6) {
            setLocationCodeJobs(null);
            return;
        }
        const code = codeDigits.replace(/\D/g, '');
        let cancelled = false;
        setLocationCodeLoading(true);
        getJobsByLocationCode(code)
            .then(({ jobs }) => {
                if (!cancelled) {
                    setLocationCodeJobs(jobs);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLocationCodeLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [searchMode, codeDigits]);

    // Obter vagas candidatadas
    const vagasCandidatadas = useMemo(() => {
        return initialJobs.filter((job) => candidaturas.includes(job.id));
    }, [initialJobs, candidaturas]);

    // Filtrar, ordenar por distância (raio 30 km) e anexar distanceKm quando houver endereço do candidato
    const vagasFiltradas = useMemo((): JobWithDistance[] => {
        // Busca por código: usa resultado da action (lista já filtrada por código)
        if (searchMode === 'code') {
            const base = locationCodeJobs ?? [];
            let filtradas = activeTab === 'vagas'
                ? base.filter((v) => !candidaturas.includes(v.id))
                : base.filter((v) => candidaturas.includes(v.id));
            if (workModelFilter === 'todos') {
                filtradas = filtradas.filter((v) => v.work_model !== 'remoto');
            } else {
                filtradas = filtradas.filter((vaga) => vaga.work_model === workModelFilter);
            }
            return applyDistanceAndSort(filtradas, userHomeAddress, radiusM);
        }

        // Busca por texto
        let filtradas = activeTab === 'vagas'
            ? initialJobs.filter((v) => !candidaturas.includes(v.id))
            : vagasCandidatadas;

        if (workModelFilter === 'todos') {
            filtradas = filtradas.filter((v) => v.work_model !== 'remoto');
        } else {
            filtradas = filtradas.filter((vaga) => vaga.work_model === workModelFilter);
        }

        if (searchTerm.trim()) {
            const termoLower = searchTerm.toLowerCase();
            filtradas = filtradas.filter(
                (vaga) =>
                    vaga.titulo.toLowerCase().includes(termoLower) ||
                    vaga.localizacao.toLowerCase().includes(termoLower) ||
                    vaga.tipo.toLowerCase().includes(termoLower) ||
                    (vaga.requisitos || []).some((r) => r.toLowerCase().includes(termoLower)) ||
                    (vaga.habilidadesPreferidas || []).some((r) => r.toLowerCase().includes(termoLower))
            );
        }

        return applyDistanceAndSort(filtradas, userHomeAddress, radiusM);
    }, [searchMode, locationCodeJobs, activeTab, candidaturas, vagasCandidatadas, searchTerm, workModelFilter, initialJobs, userHomeAddress, radiusM]);

    function applyDistanceAndSort(
        list: JobDisplay[],
        userCoords: { latitude: number; longitude: number } | null,
        radiusM: number
    ): JobWithDistance[] {
        if (!userCoords) {
            return list.map((v) => ({ ...v }));
        }
        const radiusKm = radiusM / 1000;
        const withDistance: JobWithDistance[] = list.map((vaga) => {
            if (vaga.work_model === 'remoto') {
                return { ...vaga };
            }
            if (!hasCoords(vaga)) {
                return { ...vaga };
            }
            const distM = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                vaga.latitude!,
                vaga.longitude!
            );
            const distanceKm = Math.round((distM / 1000) * 10) / 10;
            return { ...vaga, distanceKm };
        });

        return withDistance
            .filter((v) => {
                if (v.work_model === 'remoto') return true;
                if (v.distanceKm == null) return true;
                return v.distanceKm <= radiusKm;
            })
            .sort((a, b) => {
                if (a.work_model === 'remoto' && b.work_model === 'remoto') return 0;
                if (a.work_model === 'remoto') return 1;
                if (b.work_model === 'remoto') return -1;
                const da = a.distanceKm ?? Infinity;
                const db = b.distanceKm ?? Infinity;
                return da - db;
            });
    }

    function hasCoords(v: JobDisplay): boolean {
        return (
            v.latitude != null &&
            v.longitude != null &&
            Number.isFinite(v.latitude) &&
            Number.isFinite(v.longitude)
        );
    }

    // Toggle candidatura (tenta no servidor, fallback para localStorage)
    const handleToggleCandidatura = async (jobId: string) => {
        const isCurrentlyApplied = candidaturas.includes(jobId);

        // Se for remover candidatura, não precisa validar dados
        if (isCurrentlyApplied) {
            // Atualiza UI imediatamente (otimistic update)
            const updated = candidaturas.filter((id) => id !== jobId);
            setCandidaturas(updated);

            try {
                const result = await removeApplication(jobId);
                if (result.success) {
                    removeCandidaturaFromStorage(jobId);
                } else {
                    addCandidaturaToStorage(jobId);
                    console.warn('Falha ao remover candidatura no servidor, usando localStorage:', result.error);
                }
            } catch (error) {
                addCandidaturaToStorage(jobId);
                console.error('Erro ao remover candidatura:', error);
            }
            return;
        }

        // Para candidatar-se, precisa validar dados primeiro
        try {
            const result = await applyToJob(jobId);

            // Verifica se é erro de dados faltantes
            if (!result.success && 'error' in result && result.error === 'MISSING_DATA' && 'missingFields' in result) {
                // Reverte o optimistic update (não havia feito ainda, mas garantindo)
                setCandidaturas(candidaturas);
                // Mostra modal de dados faltantes
                setMissingFields(result.missingFields);
                setShowMissingDataModal(true);
                return;
            }

            if (!result.success) {
                // Se falhar no servidor com outro erro, usa localStorage como fallback
                const updated = [...candidaturas, jobId];
                setCandidaturas(updated);
                addCandidaturaToStorage(jobId);
                console.warn('Falha ao processar candidatura no servidor, usando localStorage:', result.error);
            } else {
                // Se sucesso no servidor, atualiza estado e sincroniza localStorage
                const updated = [...candidaturas, jobId];
                setCandidaturas(updated);
                addCandidaturaToStorage(jobId);
            }
        } catch (error) {
            // Em caso de erro, reverte qualquer mudança
            setCandidaturas(candidaturas);
            console.error('Erro ao processar candidatura:', error);
        }
    };

    const handleVerDetalhes = (vaga: JobDisplay) => {
        setVagaSelecionada(vaga);
        setShowModalDetalhes(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#e3f2f3] to-slate-100 pb-24">
            <VagasHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
                codeDigits={codeDigits}
                onCodeDigitsChange={setCodeDigits}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                candidaturasCount={candidaturas.length}
                workModelFilter={workModelFilter}
                onWorkModelFilterChange={setWorkModelFilter}
            />

            <div className="p-4 space-y-4">
                {/* Estatísticas */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                    <span>
                        {locationCodeLoading
                            ? 'Buscando vagas pelo código...'
                            : `${vagasFiltradas.length} ${vagasFiltradas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}`}
                    </span>
                </div>

                {/* Lista de vagas */}
                {vagasFiltradas.length > 0 ? (
                    <div className="space-y-4">
                        {vagasFiltradas.map((vaga) => (
                            <VagaCard
                                key={vaga.id}
                                vaga={vaga}
                                distanceKm={vaga.distanceKm}
                                isCandidatada={candidaturas.includes(vaga.id)}
                                onToggleCandidatura={handleToggleCandidatura}
                                onVerDetalhes={handleVerDetalhes}
                            />
                        ))}
                    </div>
                ) : (
                    <VagasEmptyState
                        activeTab={activeTab}
                        isCodeSearch={searchMode === 'code' && codeDigits.replace(/\D/g, '').length === 6}
                    />
                )}
            </div>

            {/* Modal de Detalhes */}
            <VagaDetailsModal
                vaga={vagaSelecionada}
                isOpen={showModalDetalhes}
                isCandidatada={vagaSelecionada ? candidaturas.includes(vagaSelecionada.id) : false}
                onClose={() => setShowModalDetalhes(false)}
                onToggleCandidatura={handleToggleCandidatura}
            />

            {/* Modal de Dados Faltantes */}
            <MissingDataModal
                isOpen={showMissingDataModal}
                missingFields={missingFields}
                onClose={() => setShowMissingDataModal(false)}
            />
        </div>
    );
}
