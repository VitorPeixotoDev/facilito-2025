import { Home, ShoppingBag, Briefcase, User, Trophy } from "lucide-react";

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: typeof Home;
    ariaLabel: string;
}

export const APPLICANT_NAV_ITEMS: NavItem[] = [
    {
        id: "home",
        label: "Ranking",
        href: "/applicant",
        icon: Trophy,
        ariaLabel: "Ir para Ranking",
    },
    {
        id: "shop",
        label: "Loja",
        href: "/applicant/shop",
        icon: ShoppingBag,
        ariaLabel: "Ir para Loja",
    },
    {
        id: "vacancies",
        label: "Vagas",
        href: "/applicant/vacancies",
        icon: Briefcase,
        ariaLabel: "Ir para Vagas",
    },
    {
        id: "profile",
        label: "Perfil",
        href: "/applicant/profile",
        icon: User,
        ariaLabel: "Ir para Perfil",
    },
];

