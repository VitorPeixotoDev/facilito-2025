/**
 * Configuração de graduações disponíveis no sistema
 * Cada graduação contém informações detalhadas para exibição em modal
 */

export interface GraduationInfo {
    key: string;
    label: string;
    imageSrc: string;
    description: {
        title: string;
        header: string;
        body: string;
    };
    developer: {
        name: string;
        url: string;
    };
}

export interface GraduationsConfig {
    [key: string]: GraduationInfo;
}

/**
 * Configuração completa de todas as graduações disponíveis
 */
export const graduationsConfig: GraduationsConfig = {
    serratec: {
        key: 'serratec',
        label: 'Serratec - Residência em TI',
        imageSrc: '/serratec_badge.png',
        description: {
            title: 'Residência em TIC/Software do Serratec',
            header: 'Programa ágil de imersão tecnológica, 100% gratuito e de alto impacto, que capacita novos profissionais para o mercado de TI em 5 meses, com alta taxa de contratação imediata.',
            body: `Visão Geral do Programa

O Programa de Residência em TIC/Software do Serratec é uma iniciativa de capacitação intensiva e imersiva, projetada para formar desenvolvedores fullstack prontos para o mercado de trabalho. Com uma metodologia que combina teoria e prática em projetos reais, o programa visa fortalecer o setor de tecnologia na Região Serrana do Rio de Janeiro

Principais Características:

    Gratuito e Inclusivo: Não há custos para os participantes e não é necessário conhecimento técnico prévio

Foco no Mercado: Currículo desenvolvido em parceria com o SENAI, alinhado às demandas atuais das empresas

Modelo de Sucesso: Mais de 1,000 residentes formados (até 2023) e um índice de contratação imediata de aproximadamente 50%

Impacto Social: Prioriza mulheres, PCDs, pessoas pretas, pessoas com mais de 45 anos e egressos de escola pública`
        },
        developer: {
            name: 'Serratec',
            url: 'serratec.org'
        }
    },
    ada: {
        key: 'ada',
        label: 'ADA - Advanced Data Analytics - Serratec',
        imageSrc: '/ada.png',
        description: {
            title: 'Distinção ADA: Um Selo de Excelência e Espírito Startup no Serratec',
            header: 'A Medalha ADA (Advanced Data Analytics) é a honraria máxima concedida às mulheres que, unindo excelência técnica e visão empreendedora, lideram suas "startups internas" na criação de soluções revolucionárias em dados durante a Residência em TIC do Serratec.',
            body: 'No modelo inovador do Serratec, onde residentes formam grupos empreendedores para competir e inovar, a Startup ADA destaca-se como um dos times de elite. Esta distinção singular é conferida às integrantes que personificam o legado de Ada Lovelace — não apenas na maestria técnica, mas na coragem de pensar como verdadeiras startupeiras, transformando problemas complexos das empresas parceiras em oportunidades de negócio e impacto real através da análise de dados.'
        },
        developer: {
            name: 'ADA',
            url: 'serratec.org'
        }
    }
};

/**
 * Obtém informações de uma graduação pelo seu key
 */
export function getGraduationInfo(key: string): GraduationInfo | null {
    return graduationsConfig[key] || null;
}

/**
 * Obtém informações de múltiplas graduações pelos seus keys
 */
export function getGraduationsInfo(keys: string[]): GraduationInfo[] {
    return keys
        .map(key => getGraduationInfo(key))
        .filter((info): info is GraduationInfo => info !== null);
}
