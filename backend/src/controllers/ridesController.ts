import { Request, Response } from 'express';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../services/googleMaps';

interface RideRequestBody {
    origin: string;
    destination: string;
}

// Função para obter as coordenadas (latitude e longitude) de um endereço
const geocode = async (address: string) => {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.results.length === 0) {
        throw new Error('Endereço não encontrado');
    }
    const { lat, lng } = response.data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
};

export const verifyRide = async (req: Request<{}, {}, RideRequestBody>, res: Response): Promise<void> => {
    try {
        const { origin, destination } = req.body;
        
        // Validação básica dos parâmetros
        if (!origin || !destination) {
            res.status(400).json({ error: 'Origem e destino são obrigatórios.' });
            return;
        }

        // Obtenção das coordenadas de origem e destino
        const originCoords = await geocode(origin);
        const destinationCoords = await geocode(destination);

        // Montagem da URL para a API Directions
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.latitude},${originCoords.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

        // Requisição para a Directions API
        const response = await axios.get(url);

        // Verifique se a resposta contém rotas
        if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0].legs[0]; // Primeira rota e primeiro "leg" (parte da viagem)
            const distance = route.distance.text; // Distância formatada
            const duration = route.duration.text; // Duração formatada
            
            console.log('Distância:', distance);
            console.log('Duração:', duration);

            // Retorna as informações para o cliente
            res.status(200).json({
                distance,
                duration,
                route: response.data.routes[0], // Você também pode retornar a rota completa, se desejar
            });
        } else {
            console.error('Nenhuma rota encontrada:', response.data);
            res.status(404).json({ error: 'Nenhuma rota encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao calcular a rota:', error.message || error);
        res.status(500).json({ error: 'Erro interno ao calcular a rota. Tente novamente mais tarde.' });
    }
};
