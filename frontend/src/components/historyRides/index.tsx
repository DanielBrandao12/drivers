import React, { useState } from 'react';
import api from '../../services/api';
import style from './style.module.css';
import { Input } from '../input';
import { Button } from '../button';

interface Ride {
  id: number;
  date: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  driver: {
    id: number;
    name: string;
  };
  value: number;
}

interface HistoryRidesProps {
  isOpen: string; // Altere para boolean
  onClose: () => void;
}

export const HistoryRides: React.FC<HistoryRidesProps> = ({ isOpen, onClose }) => {
  const [customerId, setCustomerId] = useState<string>(''); // ID do usuário
  const [driverId, setDriverId] = useState<string>(''); // ID do motorista (opcional)
  const [rides, setRides] = useState<Ride[]>([]); // Lista de viagens
  const [errorMessage, setErrorMessage] = useState<string>(''); // Mensagem de erro
  const [loading, setLoading] = useState<boolean>(false); // Controle de carregamento

  const handleSearch = async () => {
    if (!customerId) {
      setErrorMessage('Por favor, insira o ID do cliente.');
      return;
    }

    setLoading(true);
    setErrorMessage(''); // Limpa mensagens de erro anteriores
    try {
      const response = await api.get(`/ride/${customerId}`, {
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
      if (error.response) {
        const { error_code, error_description } = error.response.data;
        if (error_code === 'INVALID_DRIVER') {
          setErrorMessage('Motorista inválido.');
        } else if (error_code === 'NO_RIDES_FOUND') {
          setErrorMessage('Nenhum registro encontrado.');
        } else {
          setErrorMessage('Erro ao buscar as viagens. Tente novamente mais tarde.');
        }
      } else {
        setErrorMessage('Erro ao conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.containerRides} style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className={style.rides}>
        <h3>Histórico de Viagens</h3>

        <div className={style.filterSection}>
          <Input
            id="customer_id"
            name="customer_id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Digite seu ID"
            required
          />

          <select
            className={style.selectDriver}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          >
            <option value="">Mostrar todos</option>
            {/* Substitua por motoristas reais da API */}
            <option value="1">Motorista João</option>
            <option value="2">Motorista Maria</option>
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
                <span>Motorista: {ride.driver.name}</span>
                <span>Data e Hora: {new Date(ride.date).toLocaleString()}</span>
              </div>
              <div>
                <span>Origem: {ride.origin}</span>
                <span>Destino: {ride.destination}</span>
              </div>
              <div>
                <span>Distância: {ride.distance} km</span>
                <span>Duração: {ride.duration}</span>
                <span>Valor: R${ride.value.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        <Button text="Fechar" onClick={onClose} />
      </div>
    </div>
  );
};
