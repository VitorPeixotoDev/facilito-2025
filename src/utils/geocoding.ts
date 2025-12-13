/**
 * Funções utilitárias para geocodificação e manipulação de endereços
 */

interface Coordinates {
    latitude: number;
    longitude: number;
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
 * Obtém coordenadas geográficas a partir de um endereço
 * @param address - Endereço completo em formato de texto
 * @returns Coordenadas (latitude e longitude)
 */
export async function getCoordsFromAddress(address: string): Promise<Coordinates> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    "User-Agent": "FacilitoVagas/1.0",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar coordenadas");
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            throw new Error("Endereço não encontrado");
        }

        const result = data[0];

        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
        };
    } catch (error) {
        console.error("Erro ao obter coordenadas:", error);
        throw new Error("Não foi possível encontrar o endereço. Verifique se está correto.");
    }
}

