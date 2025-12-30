"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, CheckCircle2, X, Loader2, Search, HouseIcon } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { buscarCEP, formatCEP, validarCEP } from "@/utils/viacep";
import { getCoordsFromAddress } from "@/utils/geocoding";

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

interface AddressFormData {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
}

const ESTADOS_BRASIL = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
];

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

    // Estados do formulário de endereço
    const [addressForm, setAddressForm] = useState<AddressFormData>({
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
    });

    const [buscandoCEP, setBuscandoCEP] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);
    const [usandoFormulario, setUsandoFormulario] = useState(false);
    const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false);

    // Preencher formulário se já há endereço salvo
    useEffect(() => {
        if (homeAddress?.description) {
            const partes = homeAddress.description.split(',');
            // Tenta extrair informações básicas do endereço salvo
            if (partes.length > 0) {
                setAddressForm((prev) => ({
                    ...prev,
                    logradouro: partes[0].trim(),
                }));
            }
        }
    }, []);

    // Função para aplicar máscara de CEP
    const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove não numéricos
        if (value.length > 8) value = value.slice(0, 8);

        // Aplica máscara
        if (value.length > 5) {
            value = `${value.slice(0, 5)}-${value.slice(5)}`;
        }

        setAddressForm((prev) => ({ ...prev, cep: value }));
        setCepError(null);

        // Busca automática quando CEP está completo
        if (value.replace(/\D/g, '').length === 8) {
            buscarEnderecoPorCEP(value);
        }
    };

    // Buscar endereço por CEP
    const buscarEnderecoPorCEP = useCallback(async (cep: string) => {
        if (!validarCEP(cep)) {
            setCepError('CEP inválido');
            return;
        }

        setBuscandoCEP(true);
        setCepError(null);

        try {
            const dados = await buscarCEP(cep);

            if (dados) {
                setAddressForm((prev) => ({
                    ...prev,
                    logradouro: dados.logradouro || prev.logradouro,
                    bairro: dados.bairro || prev.bairro,
                    cidade: dados.localidade || prev.cidade,
                    estado: dados.uf || prev.estado,
                }));
                setUsandoFormulario(true);
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setCepError(error instanceof Error ? error.message : 'Erro ao buscar CEP');
        } finally {
            setBuscandoCEP(false);
        }
    }, []);

    // Construir endereço completo a partir do formulário
    const construirEnderecoCompleto = (): string => {
        const partes: string[] = [];

        if (addressForm.logradouro) {
            partes.push(addressForm.logradouro);
            if (addressForm.numero) {
                partes[partes.length - 1] += `, ${addressForm.numero}`;
            }
            if (addressForm.complemento) {
                partes[partes.length - 1] += ` - ${addressForm.complemento}`;
            }
        }

        if (addressForm.bairro) partes.push(addressForm.bairro);
        if (addressForm.cidade) partes.push(addressForm.cidade);
        if (addressForm.estado) partes.push(addressForm.estado);
        if (addressForm.cep) partes.push(formatCEP(addressForm.cep));

        return partes.join(', ') || enderecoManual;
    };

    // Salvar endereço do formulário
    const salvarEnderecoDoFormulario = async () => {
        // Valida campos obrigatórios
        if (!addressForm.logradouro || !addressForm.cidade || !addressForm.estado) {
            alert('Preencha pelo menos: Logradouro, Cidade e Estado');
            return;
        }

        const enderecoCompleto = construirEnderecoCompleto();

        if (!enderecoCompleto || enderecoCompleto.trim().length === 0) {
            alert('Erro ao montar endereço. Verifique os campos preenchidos.');
            return;
        }

        // Define o endereço manual
        setEnderecoManual(enderecoCompleto);
        setBuscandoCoordenadas(true);

        // Busca coordenadas diretamente
        try {
            const coords = await getCoordsFromAddress(enderecoCompleto);
            updateFormField("home_address", {
                latitude: coords.latitude,
                longitude: coords.longitude,
                description: enderecoCompleto.trim(),
            });
        } catch (error) {
            console.error('Erro ao buscar coordenadas:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível encontrar o endereço. Verifique se está correto.";
            alert(errorMessage);
            throw error;
        } finally {
            setBuscandoCoordenadas(false);
        }
    };

    return (
        <Card className="p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#5e9ea0]" />
                Endereço Residencial
            </h2>

            <div className="space-y-6">
                {/* Opção 1: Localização atual */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3 font-medium">
                        Opção 1: Se você estiver em casa, clique em "Usar minha localização atual"
                    </p>
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
                                <HouseIcon className="w-4 h-4 mr-2" />
                                Usar minha localização atual
                            </>
                        )}
                    </Button>
                </div>

                {/* Divisor */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-600 font-medium">ou</span>
                    </div>
                </div>

                {/* Opção 2: Preencher endereço manualmente */}
                {!usandoFormulario && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 mb-3 font-medium">
                            Opção 2: Preencher endereço manualmente
                        </p>
                        <p className="text-xs text-slate-600 mb-4">
                            Preencha os campos do formulário com seu endereço completo. Você pode usar o CEP para preencher automaticamente os campos.
                        </p>
                        <Button
                            type="button"
                            onClick={() => setUsandoFormulario(true)}
                            className="w-full bg-slate-600 hover:bg-slate-700 text-white h-11"
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            Preencher Formulário
                        </Button>
                    </div>
                )}

                {/* Opção 3: Formulário completo */}
                {usandoFormulario && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-green-800 font-medium">
                                Opção 3: Formulário completo
                            </p>
                            <button
                                type="button"
                                onClick={() => setUsandoFormulario(false)}
                                className="text-sm text-slate-600 hover:text-slate-800"
                            >
                                Usar busca simples
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* CEP */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    CEP <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        placeholder="00000-000"
                                        value={addressForm.cep}
                                        onChange={handleCEPChange}
                                        maxLength={9}
                                        className={`pr-10 ${cepError ? 'border-red-500' : ''}`}
                                    />
                                    {buscandoCEP && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                {cepError && (
                                    <p className="mt-1 text-xs text-red-600">{cepError}</p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">
                                    Digite o CEP para preencher automaticamente
                                </p>
                            </div>

                            {/* Logradouro e Número */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Logradouro <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Rua, Avenida, etc."
                                        value={addressForm.logradouro}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({ ...prev, logradouro: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Número
                                    </label>
                                    <Input
                                        placeholder="123"
                                        value={addressForm.numero}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({ ...prev, numero: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Complemento */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Complemento
                                </label>
                                <Input
                                    placeholder="Apto, Bloco, etc."
                                    value={addressForm.complemento}
                                    onChange={(e) =>
                                        setAddressForm((prev) => ({ ...prev, complemento: e.target.value }))
                                    }
                                />
                            </div>

                            {/* Bairro */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Bairro <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Bairro"
                                    value={addressForm.bairro}
                                    onChange={(e) =>
                                        setAddressForm((prev) => ({ ...prev, bairro: e.target.value }))
                                    }
                                />
                            </div>

                            {/* Cidade e Estado */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Cidade <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Cidade"
                                        value={addressForm.cidade}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({ ...prev, cidade: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Estado <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={addressForm.estado}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({ ...prev, estado: e.target.value }))
                                        }
                                        className="text-slate-700 w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:border-transparent"
                                    >
                                        <option value="">Selecione...</option>
                                        {ESTADOS_BRASIL.map((estado) => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Botão de salvar */}
                            <Button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await salvarEnderecoDoFormulario();
                                    } catch (error) {
                                        // Erro já foi tratado na função
                                    }
                                }}
                                disabled={buscandoCoordenadas || !addressForm.logradouro || !addressForm.cidade || !addressForm.estado}
                                className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                            >
                                {buscandoCoordenadas ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Buscando coordenadas...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar e Salvar Endereço
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Endereço salvo */}
                {homeAddress && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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
                                    setAddressForm({
                                        cep: "",
                                        logradouro: "",
                                        numero: "",
                                        complemento: "",
                                        bairro: "",
                                        cidade: "",
                                        estado: "",
                                    });
                                    setUsandoFormulario(false);
                                }}
                                className="text-red-600 hover:text-red-800 flex-shrink-0"
                                aria-label="Remover endereço"
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
