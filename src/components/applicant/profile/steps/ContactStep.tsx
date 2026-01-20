"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Facebook, Instagram, Linkedin, Globe, AlertCircle } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { formatPhone, validatePhone } from "@/utils/phone";

interface ContactStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function ContactStep({ formData, updateFormField }: ContactStepProps) {
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [phoneValue, setPhoneValue] = useState(formData.whatsapp || "");

    // Sincroniza o estado local quando formData.whatsapp mudar (ex: carregamento do perfil)
    useEffect(() => {
        if (formData.whatsapp) {
            // Se já está formatado, usa diretamente, senão formata
            const cleaned = formData.whatsapp.replace(/\D/g, '');
            if (cleaned.length > 0) {
                setPhoneValue(formatPhone(cleaned));
            } else {
                setPhoneValue("");
            }
        } else {
            setPhoneValue("");
        }
    }, [formData.whatsapp]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Aplica a máscara
        const formatted = formatPhone(inputValue);
        setPhoneValue(formatted);

        // Valida apenas se o campo estiver completo (11 dígitos)
        const cleaned = formatted.replace(/\D/g, '');
        if (cleaned.length === 11) {
            const validation = validatePhone(formatted);
            if (validation.valid) {
                setPhoneError(null);
                updateFormField("whatsapp", formatted);
            } else {
                setPhoneError(validation.error || "Telefone inválido");
                updateFormField("whatsapp", formatted);
            }
        } else if (cleaned.length > 0) {
            // Campo preenchido mas incompleto - mostra erro
            setPhoneError("Complete o número de telefone");
            updateFormField("whatsapp", formatted);
        } else {
            // Campo vazio - limpa erro
            setPhoneError(null);
            updateFormField("whatsapp", "");
        }
    };

    return (
        <Card className="p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#5e9ea0]" />
                Contato e Redes Sociais
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Mail className="w-4 h-4 text-[#5e9ea0]" />
                        <span>
                            Email para Contato <span className="text-red-500">*</span>
                        </span>
                    </label>
                    <Input
                        type="email"
                        placeholder="contato@email.com"
                        value={formData.contact_email || ""}
                        onChange={(e) => updateFormField("contact_email", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Phone className="w-4 h-4 text-[#5e9ea0]" />
                        WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="tel"
                        placeholder="(00) 90000-0000"
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        className={phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    />
                    {phoneError && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>{phoneError}</span>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                        Formato: (DDD) 9XXXX-XXXX (apenas celular)
                    </p>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                        Facebook
                    </label>
                    <Input
                        type="url"
                        placeholder="https://www.facebook.com/seu-perfil"
                        value={formData.facebook || ""}
                        onChange={(e) => updateFormField("facebook", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Instagram className="w-4 h-4 text-[#E4405F]" />
                        Instagram
                    </label>
                    <Input
                        type="url"
                        placeholder="https://www.instagram.com/seu-perfil"
                        value={formData.instagram || ""}
                        onChange={(e) => updateFormField("instagram", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Linkedin className="w-4 h-4 text-[#0077B5]" />
                        LinkedIn
                    </label>
                    <Input
                        type="url"
                        placeholder="https://www.linkedin.com/in/seu-perfil"
                        value={formData.linkedin || ""}
                        onChange={(e) => updateFormField("linkedin", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Globe className="w-4 h-4 text-[#5e9ea0]" />
                        Portfolio / Website
                    </label>
                    <Input
                        type="url"
                        placeholder="https://www.seu-portfolio.com"
                        value={formData.portfolio || ""}
                        onChange={(e) => updateFormField("portfolio", e.target.value)}
                    />
                </div>
            </div>
        </Card>
    );
}
