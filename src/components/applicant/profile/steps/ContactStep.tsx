"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Facebook, Instagram, Linkedin, Globe } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";

interface ContactStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function ContactStep({ formData, updateFormField }: ContactStepProps) {
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
                        Email para Contato
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
                        WhatsApp
                    </label>
                    <Input
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp || ""}
                        onChange={(e) => updateFormField("whatsapp", e.target.value)}
                    />
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
