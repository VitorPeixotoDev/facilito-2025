/**
 * Funções utilitárias para geocodificação e manipulação de endereços
 */

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface AddressComponents {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
}

/**
 * Calcula a distância em quilômetros entre duas coordenadas (fórmula de Haversine)
 */
function calcularDistanciaKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Obtém a descrição do endereço a partir de coordenadas geográficas
 * @param latitude - Latitude do local
 * @param longitude - Longitude do local
 * @returns Descrição do endereço (formato de endereço completo)
 */
export async function getLocationDescription(
    latitude: number,
    longitude: number
): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "FacilitoVagas/1.0",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar endereço");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Monta o endereço completo
        const address = data.address;
        const parts: string[] = [];

        if (address.road) parts.push(address.road);
        if (address.house_number) parts.push(address.house_number);
        if (address.neighbourhood || address.suburb) {
            parts.push(address.neighbourhood || address.suburb);
        }
        if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village);
        }
        if (address.state) parts.push(address.state);
        if (address.postcode) parts.push(address.postcode);

        return parts.join(", ") || data.display_name || "Endereço não encontrado";
    } catch (error) {
        console.error("Erro ao obter descrição do endereço:", error);
        throw new Error("Não foi possível obter o endereço desta localização");
    }
}

/**
 * Extrai componentes do endereço a partir de uma string
 * Formato esperado: "logradouro, numero - complemento, bairro, cidade, estado, cep"
 */
function extrairComponentesEndereco(endereco: string): AddressComponents {
    const partes = endereco.split(',').map((p) => p.trim()).filter(Boolean);

    const componentes: AddressComponents = {};

    if (partes.length === 0) return componentes;

    // Primeira parte: logradouro, número e complemento
    const primeiraParte = partes[0];
    // Tenta encontrar número: "Rua X, 123" ou "Rua X 123" ou "Rua X, 123 - Apto"
    const matchNumero = primeiraParte.match(/(.+?)(?:,\s*|\s+)(\d+)(?:\s*-\s*(.+))?$/);

    if (matchNumero) {
        componentes.logradouro = matchNumero[1].trim();
        componentes.numero = matchNumero[2];
        if (matchNumero[3]) {
            componentes.complemento = matchNumero[3].trim();
        }
    } else {
        // Tenta separar por " - " (complemento sem número)
        const matchComplemento = primeiraParte.match(/(.+?)\s*-\s*(.+)/);
        if (matchComplemento) {
            componentes.logradouro = matchComplemento[1].trim();
            componentes.complemento = matchComplemento[2].trim();
        } else {
            componentes.logradouro = primeiraParte;
        }
    }

    // Processa do final para o início (mais confiável)
    // Última parte pode ser CEP ou estado
    if (partes.length > 0) {
        const ultimaParte = partes[partes.length - 1];
        // Verifica se é CEP (formato 00000-000 ou 00000000)
        const cepMatch = ultimaParte.match(/^(\d{5}-?\d{3})$/);

        if (cepMatch) {
            componentes.cep = ultimaParte;

            // Se tem CEP, penúltima parte provavelmente é estado
            if (partes.length > 1) {
                const penultimaParte = partes[partes.length - 2];
                const estadoMatch = penultimaParte.match(/^([A-Z]{2})$/);
                if (estadoMatch) {
                    componentes.estado = estadoMatch[1];

                    // Antepenúltima parte é a cidade
                    if (partes.length > 2) {
                        componentes.cidade = partes[partes.length - 3];

                        // Se tem mais partes, a primeira após logradouro é o bairro
                        if (partes.length > 3) {
                            componentes.bairro = partes[1];
                        }
                    } else if (partes.length === 3) {
                        // Formato: logradouro, cidade, estado, CEP (sem bairro)
                        componentes.cidade = partes[1];
                    }
                } else {
                    // Sem estado, penúltima pode ser cidade
                    if (partes.length > 1) {
                        componentes.cidade = penultimaParte;
                        if (partes.length > 2) {
                            componentes.bairro = partes[1];
                        }
                    }
                }
            }
        } else {
            // Última parte não é CEP, pode ser estado
            const estadoMatch = ultimaParte.match(/^([A-Z]{2})$/);
            if (estadoMatch) {
                componentes.estado = estadoMatch[1];

                // Penúltima parte é cidade
                if (partes.length > 1) {
                    componentes.cidade = partes[partes.length - 2];

                    // Se tem mais partes, primeira após logradouro é bairro
                    if (partes.length > 2) {
                        componentes.bairro = partes[1];
                    }
                }
            } else {
                // Última parte pode ser cidade (sem estado/CEP)
                if (partes.length > 1) {
                    componentes.cidade = ultimaParte;
                    if (partes.length > 2) {
                        componentes.bairro = partes[1];
                    }
                }
            }
        }
    }

    return componentes;
}

/**
 * Faz busca estruturada no Nominatim
 */
async function buscarEstruturado(
    componentes: AddressComponents
): Promise<Coordinates | null> {
    try {
        const params = new URLSearchParams();

        // Monta o parâmetro street (número + logradouro ou apenas logradouro)
        if (componentes.logradouro) {
            if (componentes.numero) {
                params.append('street', `${componentes.numero} ${componentes.logradouro}`);
            } else {
                params.append('street', componentes.logradouro);
            }
        }

        if (componentes.cidade) {
            params.append('city', componentes.cidade);
        }

        if (componentes.estado) {
            params.append('state', componentes.estado);
        }

        params.append('country', 'Brasil');
        params.append('format', 'json');
        params.append('limit', '5');
        params.append('addressdetails', '1');

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
                headers: {
                    "User-Agent": "FacilitoVagas/1.0",
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return null;
        }

        // Prioriza resultados com número de casa se foi fornecido
        if (componentes.numero) {
            const comNumero = data.find((item: any) =>
                item.address?.house_number === componentes.numero
            );
            if (comNumero) {
                return {
                    latitude: parseFloat(comNumero.lat),
                    longitude: parseFloat(comNumero.lon),
                };
            }
        }

        // Prioriza resultados do Brasil e com melhor rank
        const resultadoBR = data
            .filter((item: any) =>
                item.address?.country_code === 'br' ||
                item.address?.country === 'Brasil'
            )
            .sort((a: any, b: any) => {
                // Prioriza por importance (maior é melhor) ou place_rank (menor é melhor)
                const rankA = a.importance || (1000 - (a.place_rank || 0));
                const rankB = b.importance || (1000 - (b.place_rank || 0));
                return rankB - rankA;
            })[0];

        const resultado = resultadoBR || data[0];

        const lat = parseFloat(resultado.lat);
        const lon = parseFloat(resultado.lon);

        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            return null;
        }

        return { latitude: lat, longitude: lon };
    } catch (error) {
        console.warn('Erro na busca estruturada:', error);
        return null;
    }
}

/**
 * Busca coordenadas por CEP usando BrasilAPI ou AwesomeAPI
 * Essas APIs retornam coordenadas geográficas para CEPs
 */
async function buscarCoordenadasPorCEP(cep: string): Promise<Coordinates | null> {
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
                        const lat = parseFloat(latitude);
                        const lng = parseFloat(longitude);

                        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                            return {
                                latitude: lat,
                                longitude: lng,
                            };
                        }
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

                // AwesomeAPI retorna lat e lng diretamente
                if (data.lat && data.lng && !data.status) {
                    const lat = parseFloat(data.lat);
                    const lng = parseFloat(data.lng);

                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
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

/**
 * Obtém coordenadas geográficas a partir de um endereço
 * Usa múltiplas estratégias para melhorar a precisão
 * PRIORIDADE: CEP > Busca estruturada > Busca livre
 * @param address - Endereço completo em formato de texto
 * @returns Coordenadas (latitude e longitude)
 */
export async function getCoordsFromAddress(address: string): Promise<Coordinates> {
    if (!address || address.trim().length === 0) {
        throw new Error("Endereço não pode estar vazio");
    }

    // Extrai componentes do endereço
    const componentes = extrairComponentesEndereco(address);

    // ESTRATÉGIA 0: Se temos CEP, buscar coordenadas por CEP primeiro (mais preciso)
    if (componentes.cep) {
        const coordsCEP = await buscarCoordenadasPorCEP(componentes.cep);
        if (coordsCEP) {
            // Se temos logradouro completo, tenta validar com Nominatim
            // Mas se não conseguir ou distância for aceitável, usa coordenadas do CEP
            if (componentes.logradouro && componentes.cidade && componentes.estado) {
                try {
                    // Tenta buscar no Nominatim para validar
                    const coordsNominatim = await buscarEstruturado(componentes);
                    if (coordsNominatim) {
                        // Calcula distância entre coordenadas do CEP e do Nominatim
                        const distancia = calcularDistanciaKm(
                            coordsCEP.latitude,
                            coordsCEP.longitude,
                            coordsNominatim.latitude,
                            coordsNominatim.longitude
                        );

                        // Se Nominatim está dentro de 1km do CEP, usa Nominatim (mais específico)
                        // Caso contrário, usa CEP (mais confiável)
                        if (distancia <= 1.0) {
                            return coordsNominatim;
                        } else {
                            // Distância muito grande, CEP é mais confiável
                            console.warn(`Distância entre CEP e Nominatim: ${distancia.toFixed(2)}km. Usando coordenadas do CEP.`);
                            return coordsCEP;
                        }
                    }
                } catch (error) {
                    // Se Nominatim falhar, usa CEP
                    console.warn('Erro ao validar com Nominatim, usando coordenadas do CEP:', error);
                }
            }

            // Retorna coordenadas do CEP (mais confiável)
            return coordsCEP;
        }
    }

    // Estratégia 1: Busca estruturada (mais precisa)
    if (componentes.logradouro && componentes.cidade && componentes.estado) {
        const resultado = await buscarEstruturado(componentes);
        if (resultado) {
            return resultado;
        }
    }

    // Estratégia 2: Busca estruturada sem número da casa (às vezes o número não está mapeado)
    if (componentes.logradouro && componentes.cidade && componentes.estado && componentes.numero) {
        const componentesSemNumero = { ...componentes };
        delete componentesSemNumero.numero;
        const resultado = await buscarEstruturado(componentesSemNumero);
        if (resultado) {
            return resultado;
        }
    }

    // Estratégia 3: Busca por logradouro + bairro + cidade + estado (sem número)
    if (componentes.logradouro && componentes.bairro && componentes.cidade && componentes.estado) {
        const componentesBairro = {
            logradouro: componentes.logradouro,
            bairro: componentes.bairro,
            cidade: componentes.cidade,
            estado: componentes.estado,
        };
        const resultado = await buscarEstruturado(componentesBairro);
        if (resultado) {
            return resultado;
        }
    }

    // Estratégia 4: Busca estruturada sem bairro
    if (componentes.logradouro && componentes.cidade && componentes.estado) {
        const componentesSemBairro = {
            logradouro: componentes.logradouro,
            cidade: componentes.cidade,
            estado: componentes.estado,
        };
        const resultado = await buscarEstruturado(componentesSemBairro);
        if (resultado) {
            return resultado;
        }
    }

    // Estratégia 5: Busca livre (fallback) - sem CEP
    // Remove CEP do endereço para melhorar resultados
    const enderecoSemCEP = address
        .replace(/\d{5}-?\d{3}/g, '') // Remove CEP
        .replace(/,\s*,/g, ',') // Remove vírgulas duplas
        .replace(/^,\s*|\s*,$/g, '') // Remove vírgulas no início/fim
        .trim();

    if (enderecoSemCEP) {
        try {
            const params = new URLSearchParams();
            params.append('q', enderecoSemCEP);
            params.append('countrycodes', 'br');
            params.append('format', 'json');
            params.append('limit', '5');
            params.append('addressdetails', '1');

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                {
                    headers: {
                        "User-Agent": "FacilitoVagas/1.0",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    // Prioriza resultados do Brasil e com melhor rank
                    const resultadoBR = data
                        .filter((item: any) =>
                            item.address?.country_code === 'br' ||
                            item.address?.country === 'Brasil'
                        )
                        .sort((a: any, b: any) => {
                            const rankA = a.importance || (1000 - (a.place_rank || 0));
                            const rankB = b.importance || (1000 - (b.place_rank || 0));
                            return rankB - rankA;
                        })[0];

                    const resultado = resultadoBR || data[0];
                    const lat = parseFloat(resultado.lat);
                    const lon = parseFloat(resultado.lon);

                    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                        return { latitude: lat, longitude: lon };
                    }
                }
            }
        } catch (error) {
            console.warn('Erro na busca livre:', error);
        }
    }

    // Estratégia 6: Busca apenas por cidade + estado (último recurso)
    if (componentes.cidade && componentes.estado) {
        try {
            const params = new URLSearchParams();
            params.append('city', componentes.cidade);
            params.append('state', componentes.estado);
            params.append('country', 'Brasil');
            params.append('format', 'json');
            params.append('limit', '1');
            params.append('addressdetails', '1');

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                {
                    headers: {
                        "User-Agent": "FacilitoVagas/1.0",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const resultado = data[0];
                    const lat = parseFloat(resultado.lat);
                    const lon = parseFloat(resultado.lon);

                    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                        return { latitude: lat, longitude: lon };
                    }
                }
            }
        } catch (error) {
            console.warn('Erro na busca por cidade:', error);
        }
    }

    // Se todas as tentativas falharam, lança erro
    throw new Error("Não foi possível encontrar o endereço. Verifique se está correto ou tente um formato diferente.");
}
