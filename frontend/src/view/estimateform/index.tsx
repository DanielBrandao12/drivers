import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { ModalDrives } from '../../components/modaldrivers';
import style from './style.module.css';
import { HistoryRides } from '../../components/historyRides';

interface ApiResponse {
      origin: {
        latitude: number;
        longitude: number;
      };
      destination: {
        latitude: number;
        longitude: number;
      };
      distance: number;
      duration: string;
      options: Array<{
        id: number;
        name: string;
        vehicle: string;
        description: string;
        review: string;
        value: number;
      }>;
      mapUrl: string;
      rideId: number;
      error: string;
}

export const EstimateForm: React.FC = () => {
    const [formData, setFormData] = useState({ id: '', origin: '', destination: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
      text: '',
      type: '',
    });
    const [drivers, setDrivers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<string>('');
    const [showHistory, setShowHistory] = useState<string>('');
    const [rideId, setRideId] = useState<number>(0);
    const [mapUrlState, setMapUrlState] = useState<string>('');

  // Limpar localStorage ao iniciar o componente
  useEffect(() => {
    localStorage.removeItem('mapUrl');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const { id, origin, destination } = formData;

    if (!id || !origin || !destination) {
      setMessage({ text: 'Por favor, preencha todos os campos.', type: 'error' });
      return;
    }

    if(origin === destination){
      setMessage({text: 'Origem e destino não podem ser iguais', type:'error'})
        return
      
    }
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Limpa o mapa antes de fazer a requisição
      setMapUrlState('');
      localStorage.removeItem('mapUrl');

      const response = await api.post<ApiResponse>('/ride/estimate', { id, origin, destination });
      if(response.status === 404){

        setMessage({text: response.data.error, type:'error'})
        return

      } else if (response.status === 200 && response.data) {

        console.log('Resposta da API:', response.data);

        setDrivers(response.data.options); // Atualiza os motoristas
        setRideId(response.data.rideId);
        setMapUrlState(response.data.mapUrl); // Atualiza o mapa
        setShowModal('flex');
        setMessage({ text: 'Rota calculada com sucesso!', type: 'success' });
        setFormData({ id: '', origin: '', destination: '' });

      } else if(response.status === 500){

        setMessage({ text: 'Ocorreu um erro ao calcular a rota.', type: 'error' });
        return

      }
    } catch (error) {

      console.error('Erro ao enviar dados:', error);
      setMessage({ text: 'Erro ao conectar ao servidor.', type: 'error' });

    } finally {

      setLoading(false);
      
    }
  };

  return (
    <div className={style.containerForms}>
      <div className={style.forms}>
        <h1>Planeje sua Viagem com Facilidade!</h1>
        <p>Preencha as informações abaixo para calcular a rota e estimar sua viagem.</p>

        <div className={style.inputGroup}>
          <label htmlFor="id">ID:</label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Digite seu ID"
            required
          />
        </div>

        <div className={style.inputGroup}>
          <label htmlFor="origin">Origem:</label>
          <Input
            id="origin"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            placeholder="Digite a Origem"
            required
          />
        </div>

        <div className={style.inputGroup}>
          <label htmlFor="destination">Destino:</label>
          <Input
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Digite o Destino"
            required
          />
        </div>

        <div className={style.feedback}>
          {message.text && (
            <p className={message.type === 'success' ? style.success : style.error}>
              {message.text}
            </p>
          )}
        </div>

        <Button
          text={loading ? 'Calculando...' : 'Calcular viagem'}
          onClick={handleSubmit}
          disabled={loading}
        />
      </div>

      <ModalDrives
        isOpen={showModal}
        onClose={() => setShowModal('none')}
        drivers={drivers}
        rideId={rideId}
        mapUrl={mapUrlState}
        onRideConfirmed={() => {
          setShowModal('none');
          setShowHistory('flex');
          setMapUrlState(''); // Limpa o mapa após confirmar a viagem
        }}
      />
      <HistoryRides isOpen={showHistory} onClose={() => setShowHistory('none')} />


    </div>
  );
};
