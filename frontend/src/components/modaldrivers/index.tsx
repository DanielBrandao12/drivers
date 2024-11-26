import React, { useState, useEffect } from 'react';
import style from './style.module.css';
import { Button } from '../button';
import { MapEstatic } from '../mapStatic';

interface Driver {
  id: number,
  name: string;
  vehicle: string;
  description: string;
  value: number;
  mapUrl: string;
}

interface ModalDrivesProps {
  isOpen: string; // Altere para booleano
  onClose: () => void;
  drivers: Driver[];
}

export const ModalDrives: React.FC<ModalDrivesProps> = ({ isOpen, onClose, drivers }) => {
  const [mapUrl, setMapUrl] = useState<string | null>(null); // Inicialize com null
  useEffect(() => {
    // Recuperar a URL do mapa armazenada no localStorage
    const storedMapUrl = localStorage.getItem('mapUrl');
    if (storedMapUrl) {
      setMapUrl(storedMapUrl); // Atualiza o estado quando o mapa for encontrado
    }
  }, []); // O array vazio faz com que o efeito seja executado apenas uma vez, ao carregar o componente
  
  if (!isOpen) return null; // Não exibe o modal se não estiver aberto


  return (
    <div className={style.container} style={{ display: isOpen ? 'flex' : 'none' }}>
      {/* Renderiza o mapa estático apenas se mapUrl estiver disponível */}
      {mapUrl && <MapEstatic mapUrl={mapUrl} />}
      <div className={style.containerModal}>
        <h1 className={style.title}>Motoristas Disponíveis</h1>
        {drivers.map((driver, index) => (
          <div key={index} className={style.driverCard}>
            <div className={style.driverHeader}>
              <div className={style.containerPicture}>
                <span></span>
              </div>

              <div className={style.driverInfo}>
                <span className={style.driverName}>{driver.name}</span>
                <span className={style.driverCar}>{driver.vehicle}</span>
              </div>
            </div>

            <div className={style.containerInfo}>
              <span className={style.sectionTitle}>Descrição</span>
              <p>{driver.description}</p>
              <span className={style.sectionTitle}>Avaliação</span>
              <p></p>
            </div>

            <div className={style.containerPriceConfirm}>
              <span className={style.price}>R${driver.value}</span>
              <Button text="Escolher" onClick={() => console.log(`${driver.id} escolhido`)} />
            </div>
          </div>
        ))}
        <Button text="Fechar" onClick={onClose} />
      </div>
    </div>
  );
};
