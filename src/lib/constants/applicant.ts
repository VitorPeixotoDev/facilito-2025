import { Home, ShoppingBag, Briefcase, User, Trophy, Rocket } from "lucide-react";

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
        label: "Carreira",
        href: "/applicant/shop",
        icon: Rocket,
        ariaLabel: "Ir para Carreira",
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

