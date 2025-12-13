"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, CheckCircle2, X, Loader2 } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";

interface AddressStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
    enderecoManual: string;
    setEnderecoManual: (value: string) => void;
    isLocating: boolean;
    buscandoEndereco: boolean;
    onObterLocalizacao: () => void;
    onBuscarEndereco: () => void;
}

export function AddressStep({
    formData,
    updateFormField,
    enderecoManual,
    setEnderecoManual,
    isLocating,
    buscandoEndereco,
    onObterLocalizacao,
    onBuscarEndereco,
}: AddressStepProps) {
    const homeAddress = formData.home_address;

    return (
        <Card className="p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#5e9ea0]" />
                Endereço Residencial
            </h2>

            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3">
                        Escolha uma das opções abaixo para definir seu endereço:
                    </p>

                    <div className="space-y-3">
                        <div>
                            <Button
                                type="button"
                                onClick={onObterLocalizacao}
                                disabled={isLocating}
                                className="w-full bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white h-12"
                            >
                                {isLocating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Obtendo localização...
                                    </>
                                ) : (
                                    <>
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Usar minha localização atual
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-600">ou</div>

                        <div className="space-y-2">
                            <Input
                                placeholder="Digite seu endereço completo"
                                value={enderecoManual}
                                onChange={(e) => setEnderecoManual(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={onBuscarEndereco}
                                disabled={buscandoEndereco || !enderecoManual.trim()}
                                className="w-full bg-slate-600 hover:bg-slate-700 text-white h-11"
                            >
                                {buscandoEndereco ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Buscando...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Buscar Endereço
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {homeAddress && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-green-800 mb-1">
                                    Endereço definido:
                                </p>
                                <p className="text-sm text-green-700">{homeAddress.description}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    updateFormField("home_address", null);
                                    setEnderecoManual("");
                                }}
                                className="text-red-600 hover:text-red-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
