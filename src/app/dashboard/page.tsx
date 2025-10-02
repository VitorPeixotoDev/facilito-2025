import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">NEXO Dashboard</h1>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <Image
                                src="/images/logo_without_bg_g.png"
                                alt="NEXO Logo"
                                width={140}
                                height={60}
                                className="h-50 w-auto mb-4 mx-auto"
                            />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Bem-vindo ao NEXO!
                            </h2>
                            <p className="text-gray-600">
                                Seu dashboard está em desenvolvimento. Em breve você poderá gerenciar seus QR codes e visualizar os feedbacks dos seus clientes.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
