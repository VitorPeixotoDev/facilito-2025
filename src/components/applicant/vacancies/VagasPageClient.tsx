'use client';

import { useState, useMemo, useEffect } from 'react';
import { VagasHeader } from './VagasHeader';
import { VagaCard } from './VagaCard';
import { VagaDetailsModal } from './VagaDetailsModal';
import { VagasEmptyState } from './VagasEmptyState';
import { MissingDataModal } from './MissingDataModal';
import type { JobDisplay } from '@/lib/vacancies/types';
import { getCandidaturasFromStorage, addCandidaturaToStorage, removeCandidaturaFromStorage } from '@/lib/vacancies/clientVacancyService';
import { applyToJob, removeApplication } from '@/app/applicant/vacancies/actions';

interface VagasPageClientProps {
    initialJobs: JobDisplay[];
    initialCandidaturas: string[];
}

/**
 * Componente client da página de vagas
 * Gerencia estado, filtros, busca e candidaturas
 */
type WorkModelFilter = 'todos' | 'presencial' | 'remoto' | 'hibrido';

export default function VagasPageClient({ initialJobs, initialCandidaturas }: VagasPageClientProps) {
    const [activeTab, setActiveTab] = useState<'vagas' | 'candidaturas'>('vagas');
    const [candidaturas, setCandidaturas] = useState<string[]>(initialCandidaturas);
    const [vagaSelecionada, setVagaSelecionada] = useState<JobDisplay | null>(null);
    const [showModalDetalhes, setShowModalDetalhes] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [workModelFilter, setWorkModelFilter] = useState<WorkModelFilter>('todos');
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

    // Obter vagas candidatadas
    const vagasCandidatadas = useMemo(() => {
        return initialJobs.filter((job) => candidaturas.includes(job.id));
    }, [initialJobs, candidaturas]);

    // Filtrar vagas por busca, tab e tipo de trabalho
    const vagasFiltradas = useMemo(() => {
        let filtradas = activeTab === 'vagas'
            ? initialJobs.filter((v) => !candidaturas.includes(v.id))
            : vagasCandidatadas;

        // Filtro por tipo de trabalho (work_model)
        if (workModelFilter !== 'todos') {
            filtradas = filtradas.filter((vaga) => {
                // Compara diretamente o work_model (já está no formato correto)
                return vaga.work_model === workModelFilter;
            });
        }

        // Filtro por busca
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

        return filtradas;
    }, [activeTab, candidaturas, vagasCandidatadas, searchTerm, workModelFilter, initialJobs]);

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
                        {vagasFiltradas.length} {vagasFiltradas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
                    </span>
                </div>

                {/* Lista de vagas */}
                {vagasFiltradas.length > 0 ? (
                    <div className="space-y-4">
                        {vagasFiltradas.map((vaga) => (
                            <VagaCard
                                key={vaga.id}
                                vaga={vaga}
                                isCandidatada={candidaturas.includes(vaga.id)}
                                onToggleCandidatura={handleToggleCandidatura}
                                onVerDetalhes={handleVerDetalhes}
                            />
                        ))}
                    </div>
                ) : (
                    <VagasEmptyState activeTab={activeTab} />
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
