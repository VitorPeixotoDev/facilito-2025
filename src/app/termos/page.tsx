import Link from "next/link";

export const metadata = {
    title: "Termos de uso | Facilitô! Vagas",
    description: "Termos de uso da plataforma Facilitô! Vagas.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 sm:px-6 lg:px-8">
            <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
                <Link href="/" className="text-sm font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                    Voltar para o início
                </Link>

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                    Termos de uso
                </h1>
                <p className="mt-3 text-sm text-slate-500">Última atualização: maio de 2026</p>

                <div className="mt-8 space-y-6 leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">1. Aceitação dos termos</h2>
                        <p className="mt-2">
                            Ao acessar ou usar o Facilitô! Vagas, você declara que leu, compreendeu e concorda com estes
                            Termos de uso e com a nossa Política de privacidade.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">2. Uso da plataforma</h2>
                        <p className="mt-2">
                            A plataforma conecta candidatos, estudantes, oportunidades profissionais, avaliações e cursos.
                            Você se compromete a fornecer informações verdadeiras e manter seus dados atualizados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">3. Conta e segurança</h2>
                        <p className="mt-2">
                            O acesso a áreas restritas depende de autenticação. Você é responsável por proteger suas
                            credenciais e por informar qualquer uso não autorizado da sua conta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">4. Avaliações, cursos e recomendações</h2>
                        <p className="mt-2">
                            Resultados de avaliações, rankings e recomendações são recursos de apoio à jornada profissional
                            e podem ser atualizados conforme novos dados ou critérios da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">5. Cookies e funcionamento técnico</h2>
                        <p className="mt-2">
                            Utilizamos cookies essenciais para autenticação, segurança e funcionamento da sessão. O uso da
                            plataforma pressupõe a aceitação desses recursos necessários.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">6. Contato</h2>
                        <p className="mt-2">
                            Para dúvidas sobre estes termos, entre em contato pelo e-mail{" "}
                            <a href="mailto:contato@facilitovagas.com" className="font-medium text-[#5e9ea0]">
                                contato@facilitovagas.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </article>
        </main>
    );
}
