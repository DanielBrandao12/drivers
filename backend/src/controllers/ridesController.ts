import { Request, Response } from 'express';
import { Op } from 'sequelize';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../services/googleMaps';
import Driver from '../models/drivers';
import Review from '../models/reviews';
import Ride from '../models/rides';
import User from '../models/users';


interface RideRequestBody {
    id: number;
    origin: string; // Endereço ou coordenada de origem
    destination: string; // Endereço ou coordenada de destino
}

// Função para obter as coordenadas (latitude e longitude) de um endereço
const geocode = async (address: string) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status !== 'OK' || response.data.results.length === 0) {
            throw new Error('Endereço não encontrado');
        }

        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error(`Erro ao obter coordenadas para o endereço "${address}":`, error.message || error);
        throw new Error('Erro ao obter coordenadas');
    }
};

export const getUser = async (id: number) => {
    
  
    try {
      const user = await User.findOne({
        where: { id }, // Condição personalizada
      });
  
      if (!user) {
        console.error('Usuário não encontrado.')
        return;
      }
  
      return user
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      
    }
  };


// Função para buscar motoristas com base na distância
const getDriversByDistance = async (distance: number) => {
    try {
        const convertDistance = distance / 1000; // Converte para quilômetros
        const drivers = await Driver.findAll({
            where: {
                km_min: { [Op.lte]: convertDistance },
            },
            order: [['tax_km', 'ASC']], // Ordena pela menor taxa
        });
        return drivers;
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        throw error;
    }
};

// Função para buscar reviews por ID do motorista
const getReviewsByDriverId = async (driverId: number) => {
    try {
        const reviews = await Review.findAll({
            where: { driver_id: driverId },
            attributes: ['rating', 'r_comment'], // Seleciona apenas os campos necessários
        });
        return reviews;
    } catch (error) {
        console.error(`Erro ao buscar reviews para o motorista ${driverId}:`, error);
        throw error;
    }
};

// Função principal para verificar a rota
export const verifyRoute = async (req: Request<{}, {}, RideRequestBody>, res: Response): Promise<void> => {
    try {
        const { id, origin, destination } = req.body;

        // Verificar se o usuário existe
        const user = await getUser(id);  // A função getUser agora retorna o usuário ou undefined

        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        // Validação básica de origem e destino
        if (!origin || !destination) {
            res.status(400).json({ error: 'Origem e destino são obrigatórios.' });
            return;
        }

        if (origin === destination) {
            res.status(400).json({ error: 'Origem e destino não podem ser iguais!' });
            return;
        }

        // Obter coordenadas de origem e destino
        const [originCoords, destinationCoords] = await Promise.all([
            geocode(origin),
            geocode(destination),
        ]);

        // Configuração para a chamada à API de rotas
        const requestBody = {
            origin: { address: origin },
            destination: { address: destination },
            travelMode: 'DRIVE',
        };

        const headers = { 'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration' };
        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`;

        // Chamada à API de rotas
        const response = await axios.post(url, requestBody, { headers });

        if (response.data && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const distance = route.distanceMeters; // Distância em metros
            const duration = route.duration; // Duração em segundos

            // Buscar motoristas disponíveis com base na distância
            const drivers = await getDriversByDistance(distance);

            // Construir as opções com os valores calculados e reviews
            const options = await Promise.all(
                drivers.map(async (driver) => {
                    const reviews = await getReviewsByDriverId(driver.id);
                    const value = (distance / 1000) * driver.tax_km; // Cálculo do valor

                    return {
                        id: driver.id,
                        name: driver.m_name,
                        description: driver.m_description,
                        vehicle: driver.vehicle,
                        review: reviews,
                        value: parseFloat(value.toFixed(2)), // Arredondar para duas casas decimais
                    };
                })
            );

            // Responder com os dados processados
            res.status(200).json({
                origin: originCoords,
                destination: destinationCoords,
                distance,
                duration,
                options,
                routeResponse: route, // Incluindo a rota completa, caso necessário
            });
        } else {
            console.warn('Nenhuma rota encontrada na resposta da API.');
            res.status(404).json({ error: 'Nenhuma rota encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao verificar a rota:', error.message || error);
        res.status(500).json({ error: 'Erro interno ao verificar a rota. Tente novamente mais tarde.' });
    }
};



export const confirmRide = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extrair os campos do corpo da requisição
        const { user_id, origin, destination, distance, duration, driver_id, value } = req.body;

        // Validação básica dos campos obrigatórios
        if (!user_id || !origin || !destination || !distance || !duration || !driver_id || !value) {
            res.status(400).json({ 
                error: 'Todos os campos obrigatórios devem ser fornecidos: user_id, origin, destination, distance, duration, driver_id, value.' 
            });
            return;
        }

        // Criação do registro da corrida
        const ride = await Ride.create({
            origin,
            destination,
            distance,
            duration,
            user_id,
            driver_id,
            r_value: value,
            r_date: new Date(), // Data/hora atual
        });

        // Retornar a confirmação da criação com os dados da corrida
        res.status(201).json({
            message: 'Corrida confirmada com sucesso.',
            ride: {
                id: ride.id,
                origin: ride.origin,
                destination: ride.destination,
                distance: ride.distance,
                duration: ride.duration,
                user_id: ride.user_id,
                driver_id: ride.driver_id,
                value: ride.r_value,
                date: ride.r_date,
            },
        });
    } catch (error) {
        console.error('Erro ao confirmar a corrida:', error.message || error);
        res.status(500).json({ error: 'Erro interno ao confirmar a corrida. Tente novamente mais tarde.' });
    }
};