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
    const user = await getUser(id);

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

      // Criar o registro da corrida
      const ride = await Ride.create({
        origin,
        destination,
        distance,
        duration,
        user_id: id,
        r_date: new Date()
      });



      // Gerar o URL do mapa estático
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:red%7Clabel:S%7C${originCoords.latitude},${originCoords.longitude}&markers=color:blue%7Clabel:D%7C${destinationCoords.latitude},${destinationCoords.longitude}&path=color:0x0000ff|weight:3|${originCoords.latitude},${originCoords.longitude}|${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      // Responder com os dados processados, incluindo o ID da corrida
      res.status(200).json({
        rideId: ride.id, // ID da corrida
        origin: originCoords,
        destination: destinationCoords,
        distance,
        duration,
        options,
        routeResponse: route,
        mapUrl: staticMapUrl,
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
    const { id, driver_id, value } = req.body;

    // Validação básica dos campos obrigatórios
    if (!id || !driver_id || !value) {
      res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Todos os campos obrigatórios devem ser fornecidos: id, driver_id, value."
      });
      return;
    }

    // Verificar se o motorista existe
    const driver = await Driver.findOne({ where: { id: driver_id } });
    if (!driver) {
      res.status(404).json({
        error_code: "DRIVER_NOT_FOUND",
        error_description: "Motorista não encontrado."
      });
      return;
    }

    // Validação adicional para quilometragem (exemplo fictício)
    if (value <= 0) {
      res.status(406).json({
        error_code: "INVALID_DISTANCE",
        error_description: "A quilometragem ou valor da corrida fornecido é inválido."
      });
      return;
    }

    // Atualizar o registro da corrida
    console
    const rideUpdateResult = await Ride.update(
      {
        driver_id,
        r_value: value,

      },
      { where: { id } }
    );

    if (rideUpdateResult[0] === 0) {
      res.status(404).json({
        error_code: "INVALID_DATA",
        error_description: "Corrida não encontrada para o ID fornecido."
      });
      return;
    }

    // Retornar a confirmação da atualização com os dados da corrida
    res.status(200).json({
      success: true,
      message: "Corrida confirmada com sucesso."
    });
  } catch (error) {
    console.error("Erro ao confirmar a corrida:", error.message || error);
    res.status(500).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Erro interno ao confirmar a corrida. Tente novamente mais tarde."
    });
  }
};


export const getAllDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const drivers = await Driver.findAll(); // Busca todos os motoristas
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({
      error_code: 'INTERNAL_SERVER_ERROR',
      error_description: 'Ocorreu um erro ao buscar os motoristas.',
    });
  }
};

export const getByIdDrivers = async (id: number) => {
  try {
    const driver = await Driver.findByPk(id); // Busca todos os motoristas
    return driver
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);

  }
};



export const getRides = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parâmetro da rota (ID do usuário)
    const userId = req.params.id;

    // Query string (opcional) para filtrar pelo motorista
    const driverId = req.query.driver_id as string | undefined;

    console.log(`Usuário ID: ${userId}`);
    if (driverId) {
      console.log(`Filtrando pelo Motorista ID: ${driverId}`);
    }

    // Busca todas as viagens associadas ao usuário
    const rides = await Ride.findAll({ where: { user_id: userId } });

    // Se não houver nenhuma viagem para o usuário
    if (rides.length === 0) {
      res.status(404).json({ message: 'Nenhuma viagem encontrada para esse usuário.' });

    }

    // Se um driverId foi fornecido, filtra as viagens pelo motorista
    let filteredRides = driverId
      ? rides.filter((ride) => ride.driver_id === parseInt(driverId))
      : rides;

    // Se um driverId foi fornecido e não houver corridas para esse motorista
    if (driverId && filteredRides.length === 0) {
      res.status(404).json({ message: `Nenhuma viagem encontrada para o motorista ID: ${driverId}.` });
    }

    // Adiciona o nome do motorista às viagens
    const ridesWithDriverNames = await Promise.all(
      filteredRides.map(async (ride) => {
        const driver = await getByIdDrivers(ride.driver_id);
        return {
          ...ride.toJSON(),
          driver_name: driver ? driver.m_name : 'Motorista não encontrado',
        };
      })
    );

    // Retorna as viagens com o nome do motorista
    res.status(200).json({ rides: ridesWithDriverNames });
  } catch (error) {
    console.error('Erro ao buscar viagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// Busca um motorista por ID
export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      error_code: 'INVALID_ID',
      error_description: 'O ID do motorista deve ser um número válido.',
    });
  }

  try {
    const driver = await Driver.findByPk(id); // Busca o motorista pelo ID

    if (!driver) {
      res.status(404).json({
        error_code: 'DRIVER_NOT_FOUND',
        error_description: 'Nenhum motorista encontrado com o ID fornecido.',
      });
    }

    res.status(200).json(driver);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    res.status(500).json({
      error_code: 'INTERNAL_SERVER_ERROR',
      error_description: 'Ocorreu um erro ao buscar o motorista.',
    });
  }
};
