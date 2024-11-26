import React, { useState } from 'react';
import api from '../../services/api';
import { Input } from '../../components/input';
import { Button } from '../../components/button';
import { ModalDrives } from '../../components/modaldrivers';
import style from './style.module.css';

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
    name: string;
    vehicle: string;
    description: string;
    review: string;
    value: number;
  }>;
  mapUrl: string;
}

export const EstimateForm: React.FC = () => {
  const [formData, setFormData] = useState({ id: '', origin: '', destination: '' }); // Estado para os dados do formulário
  const [loading, setLoading] = useState<boolean>(false); // Estado para controle de loading
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  }); // Mensagens de feedback
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<string>('');


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

    setLoading(true);
    setMessage({ text: '', type: '' }); // Limpa mensagens anteriores

    try {
      const response = await api.post<ApiResponse>('/ride/estimate', { id, origin, destination });

      if (response.status === 200 && response.data) {
        console.log('Resposta da API:', response.data);
        setDrivers(response.data.options); // Armazena os motoristas
        setShowModal('flex');
        setMessage({ text: 'Rota calculada com sucesso!', type: 'success' });
        setFormData({ id: '', origin: '', destination: '' }); // Limpa os campos do formulário
        localStorage.setItem('mapUrl', response.data.mapUrl);
      } else {
        setMessage({ text: 'Ocorreu um erro ao calcular a rota.', type: 'error' });
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
      />
      
    </div>
  );
};
