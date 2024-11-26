import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import api from '../../services/api';
import style from './style.module.css'
const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: -23.55052, // Latitude do centro do mapa
  lng: -46.633308, // Longitude do centro do mapa
};

export const Map: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await api.get('/api/maps-key'); // URL do backend
        setApiKey(response.data.apiKey);
      } catch (error) {
        console.error('Erro ao buscar a chave da API:', error);
      }
    };

    fetchApiKey();
  }, []);

  if (!apiKey) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {/* O conteúdo do mapa vai aqui */}
        <div className={style.mapContainer}></div>
      </GoogleMap>
    </LoadScript>
  );
};
