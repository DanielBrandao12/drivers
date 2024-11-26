import React from 'react';
import styles from './style.module.css'; // Importa o módulo de estilo

interface MapProps {
  mapUrl: string; // A URL do mapa estático recebida como prop
}

export const MapEstatic: React.FC<MapProps> = ({ mapUrl }) => {
  return (
    <div className={styles.containerM}>
      <h3 className={styles.title}>Mapa da Rota</h3>
      <img src={mapUrl} alt="Mapa da Rota" className={styles.image} />
    </div>
  );
};
