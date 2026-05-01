import Link from "next/link";

export const metadata = {
    title: "Política de privacidade | Facilitô! Vagas",
    description: "Política de privacidade da plataforma Facilitô! Vagas.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-700 sm:px-6 lg:px-8">
            <article className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
                <Link href="/" className="text-sm font-medium text-[#5e9ea0] hover:text-[#4a8b8f]">
                    Voltar para o início
                </Link>

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                    Política de privacidade
                </h1>
                <p className="mt-3 text-sm text-slate-500">Última atualização: maio de 2026</p>

                <div className="mt-8 space-y-6 leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">1. Dados que coletamos</h2>
                        <p className="mt-2">
                            Coletamos dados fornecidos por você, como nome, e-mail, dados de perfil, formação,
                            experiências, habilidades, avaliações realizadas e preferências informadas na plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">2. Como usamos seus dados</h2>
                        <p className="mt-2">
                            Usamos os dados para autenticar sua conta, personalizar sua experiência, sugerir vagas, cursos
                            e avaliações, gerar rankings e manter a segurança da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">3. Cookies</h2>
                        <p className="mt-2">
                            Utilizamos cookies essenciais para manter sua sessão ativa, proteger sua conta e lembrar o aceite
                            do aviso de cookies. Esses cookies são necessários para o funcionamento adequado do serviço.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">4. Compartilhamento</h2>
                        <p className="mt-2">
                            Podemos compartilhar dados com fornecedores necessários para operar a plataforma, como serviços
                            de autenticação, banco de dados e pagamento. Não vendemos seus dados pessoais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">5. Seus direitos</h2>
                        <p className="mt-2">
                            Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais, quando aplicável, pelo
                            canal de contato informado abaixo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900">6. Contato</h2>
                        <p className="mt-2">
                            Para dúvidas ou solicitações sobre privacidade, entre em contato pelo e-mail{" "}
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
