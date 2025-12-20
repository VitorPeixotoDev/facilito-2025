'use client';

import { Briefcase } from 'lucide-react';

interface VagasEmptyStateProps {
    activeTab: 'vagas' | 'candidaturas';
}

/**
 * Estado vazio quando não há vagas/candidaturas
 */
export function VagasEmptyState({ activeTab }: VagasEmptyStateProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                        {activeTab === 'vagas' ? 'Nenhuma vaga encontrada' : 'Nenhuma candidatura'}
                    </h3>
                    <p className="text-sm text-slate-600">
                        {activeTab === 'vagas'
                            ? 'Tente ajustar os filtros ou buscar por outros termos.'
                            : 'Você ainda não se candidatou a nenhuma vaga.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
