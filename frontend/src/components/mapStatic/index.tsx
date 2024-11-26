// components/Map.tsx
import React from 'react';

interface MapProps {
  mapUrl: string; // A URL do mapa estático recebida como prop
}

export const MapEstatic: React.FC<MapProps> = ({ mapUrl }) => {
  return (
    <div>
      <h3>Mapa da Rota</h3>
      <img src={mapUrl} alt="Mapa da Rota" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};
