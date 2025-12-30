/**
 * Serviço para busca de endereço por CEP usando ViaCEP
 * API gratuita: https://viacep.com.br
 */

export interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string; // Cidade
    uf: string; // Estado
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

/**
 * Busca endereço completo por CEP usando ViaCEP
 * @param cep - CEP no formato 00000000 ou 00000-000
 * @returns Dados do endereço ou null se não encontrado
 */
export async function buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
    try {
        // Remove caracteres não numéricos
        const cepLimpo = cep.replace(/\D/g, '');

        // Valida formato do CEP (8 dígitos)
        if (cepLimpo.length !== 8) {
            throw new Error('CEP deve conter 8 dígitos');
        }

        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar CEP');
        }

        const data: ViaCEPResponse = await response.json();

        // ViaCEP retorna { erro: true } quando não encontra
        if (data.erro === true) {
            throw new Error('CEP não encontrado');
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Não foi possível buscar o CEP. Tente novamente.');
    }
}

/**
 * Formata CEP para exibição (00000-000)
 */
export function formatCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
        return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    }
    return cepLimpo;
}

/**
 * Valida se um CEP está no formato correto
 */
export function validarCEP(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
}

/**
 * Busca coordenadas geográficas por CEP usando BrasilAPI
 * A BrasilAPI retorna latitude e longitude para CEPs
 * @param cep - CEP no formato 00000000 ou 00000-000
 * @returns Coordenadas (latitude e longitude) ou null se não encontrado
 */
export async function buscarCoordenadasPorCEP(cep: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
        // Remove caracteres não numéricos
        const cepLimpo = cep.replace(/\D/g, '');

        // Valida formato do CEP (8 dígitos)
        if (cepLimpo.length !== 8) {
            return null;
        }

        // Tenta BrasilAPI primeiro (retorna coordenadas)
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // BrasilAPI retorna coordenadas no formato location.coordinates
                if (data.location?.coordinates) {
                    const { latitude, longitude } = data.location.coordinates;
                    if (latitude && longitude) {
                        return {
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude),
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('Erro ao buscar coordenadas na BrasilAPI:', error);
        }

        // Fallback: tenta AwesomeAPI (também retorna coordenadas)
        try {
            const response = await fetch(`https://cep.awesomeapi.com.br/json/${cepLimpo}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // AwesomeAPI retorna lat e lon diretamente
                if (data.lat && data.lng) {
                    const lat = parseFloat(data.lat);
                    const lng = parseFloat(data.lng);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        return {
                            latitude: lat,
                            longitude: lng,
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('Erro ao buscar coordenadas na AwesomeAPI:', error);
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar coordenadas por CEP:', error);
        return null;
    }
}
