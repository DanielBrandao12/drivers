import { Request, Response } from 'express';
import { Op } from 'sequelize';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../services/googleMaps';
import Driver from '../models/drivers'; // Certifique-se de que o caminho do modelo esteja correto

interface RideRequestBody {
    origin: string;  // Endereço ou coordenada de origem
    destination: string; // Endereço ou coordenada de destino
}

// Função para obter as coordenadas (latitude e longitude) de um endereço
const geocode = async (address: string) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        console.log('Resposta da API de geocodificação:', response.data);  // Log da resposta
        
        if (response.data.status !== 'OK' || response.data.results.length === 0) {
            throw new Error('Endereço não encontrado');
        }
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error.message || error);
        throw new Error('Erro ao obter coordenadas');
    }
};



const getDriversByDistance = async (distance: number) => {
    try {
        // Converte a distância para quilômetros
        const convertDistance = distance / 1000;

        // Busca os motoristas com km_min <= convertDistance
        const drivers = await Driver.findAll({
            where: {
                km_min: {
                    [Op.lte]: convertDistance, // km_min deve ser menor ou igual à distância fornecida
                },
            },
            attributes: ['id', 'm_name', 'vehicle', 'tax_km', 'km_min'], // Seleciona apenas os campos necessários
        });

        // Retorna a lista de motoristas encontrados
        return drivers;
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        throw error; // Propaga o erro para ser tratado pelo chamador
    }
};


export const verifyRoute = async (req: Request<{}, {}, RideRequestBody>, res: Response): Promise<void> => {
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

        const requestBody = {
            origin: {
                address: origin,  // Agora passando os endereços diretamente
            },
            destination: {
                address: destination, // Destino como endereço
            },
            travelMode: 'DRIVE',
        };

        // Cabeçalho FieldMask
        const headers = {
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration', // Ajustado para incluir os campos específicos
        };

        // URL para a API de rotas
        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`;

        // Chamada para a API de rotas com cabeçalhos
        const response = await axios.post(url, requestBody, { headers });

        // Verificando se a resposta contém rotas
        if (response.data &&  response.data.routes.length > 0) {
            const route = response.data.routes[0]; // Primeira rota
            const distance = route.distanceMeters; // Distância em metros
            const duration = route.duration; // Duração em segundos


            const drivers_options = getDriversByDistance(distance)
            console.log(drivers_options, 'oi')
            // Respondendo com os dados necessários
            res.status(200).json({
                origin: {
                    latitude: originCoords.latitude,
                    longitude: originCoords.longitude,
                },
                destination: {
                    latitude: destinationCoords.latitude,
                    longitude: destinationCoords.longitude,
                },
                distance: distance,
                duration: duration, // Em segundos
            });
            
        } else {
            console.error('Erro ao calcular a rota: resposta sem rotas válidas.');
            res.status(404).json({ error: 'Nenhuma rota encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao calcular a rota:', error.message || error);
        res.status(500).json({ error: 'Erro interno ao calcular a rota. Tente novamente mais tarde.' });
    }
};
