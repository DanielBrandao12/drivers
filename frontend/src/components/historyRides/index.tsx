import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import style from './style.module.css';
import { Input } from '../input';
import { Button } from '../button';

interface Ride {
  id: number;
  r_date: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver_name: string;
  r_value: number;
}

interface Driver {
  id: number;
  m_name: string;
}

interface HistoryRidesProps {
  isOpen: string; // Alterado para boolean para facilitar o controle
  onClose: () => void;
}

export const HistoryRides: React.FC<HistoryRidesProps> =({ isOpen, onClose }) => {
  const [userId, setUserId] = useState<string>(''); // ID do usuário
  const [driverId, setDriverId] = useState<string>(''); // ID do motorista (opcional)
  const [rides, setRides] = useState<Ride[]>([]); // Lista de viagens
  const [drivers, setDrivers] = useState<Driver[]>([]); // Lista de motoristas
  const [errorMessage, setErrorMessage] = useState<string>(''); // Mensagem de erro
  const [loading, setLoading] = useState<boolean>(false); // Controle de carregamento

  // Função para buscar motoristas
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get<Driver[]>('/ride/alldrivers');
      if (response.status === 200) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      setErrorMessage('Erro ao carregar motoristas. Tente novamente.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen, fetchDrivers]);

  // Função para buscar viagens
  const handleSearch = async () => {
    if (!userId) {
      setErrorMessage('Por favor, insira o ID do cliente.');
      return;
    }

    setLoading(true);
    setErrorMessage(''); // Limpa mensagens de erro anteriores

    try {
      // Se driverId estiver vazio, retorna todas as viagens. Caso contrário, filtra pelas viagens do motorista selecionado.
      const response = await api.get(`/ride/${userId}`, {
        params: driverId ? { driver_id: driverId } : {},
      });

      if (response.status === 200 && response.data) {
        setRides(response.data.rides); // Atualiza a lista de viagens
        if (response.data.rides.length === 0) {
          setErrorMessage('Nenhum registro encontrado.');
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar viagens:', error);
      setErrorMessage(
        error.response?.data?.error_description ||
          'Erro ao buscar as viagens. Tente novamente mais tarde.'
      );
      setRides([])
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a mudança do filtro de motoristas
  const handleDriverSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDriverId(value); // Quando selecionar "Mostrar todos", o driverId ficará vazio, e todas as corridas serão mostradas
  };

  return (
    <div className={style.containerRides} style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className={style.rides}>
        <h3>Histórico de Viagens</h3>

        <div className={style.filterSection}>
          <Input
            id="user_id"
            name="user_id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Digite seu ID"
            required
          />

          <select
            className={style.selectDriver}
            value={driverId}
            onChange={handleDriverSelectChange}
          >
            <option value="">Mostrar todos</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.m_name}
              </option>
            ))}
          </select>

          <Button
            text={loading ? 'Buscando...' : 'Aplicar Filtro'}
            onClick={handleSearch}
            disabled={loading}
          />
        </div>

        <div className={style.feedback}>
          {errorMessage && <p className={style.error}>{errorMessage}</p>}
        </div>

        <div className={style.myRides}>
          {rides.map((ride) => (
            <div key={ride.id} className={style.cardRide}>
              <div>
                <span>Motorista: {ride.driver_name}</span>
                <span>Data e Hora: {new Date(ride.r_date).toLocaleString()}</span>
              </div>
              <div>
                <span>Origem: {ride.origin}</span>
                <span>Destino: {ride.destination}</span>
              </div>
              <div>
                <span>Distância: {(ride.distance / 100).toFixed(2)} km</span>
                <span>Duração: {ride.duration}</span>
                <span>Valor: R${ride.r_value}</span>
              </div>
            </div>
          ))}
        </div>

        <Button text="Fechar" onClick={onClose} />
      </div>
    </div>
  );
};
