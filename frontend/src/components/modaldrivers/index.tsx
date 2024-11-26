import React from 'react';
import style from './style.module.css';
import { Button } from '../button';

interface Driver {
  name: string;
  vehicle: string;
  description: string;
 // review: string;
  value: number;
}


interface ModalDrivesProps {
  isOpen: string;
  onClose: () => void;
  drivers: Driver[];
}


export const ModalDrives: React.FC<ModalDrivesProps> = ({ isOpen, onClose, drivers }) => {
  if (!isOpen) return null; // Não exibe o modal se não estiver aberto

  return (
    <div className={style.container} style={{display:isOpen}}>
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
              <Button text="Escolher" onClick={() => console.log(`${driver.name} escolhido`)} />
            </div>
          </div>
        ))}
        <Button text="Fechar" onClick={onClose} />
      </div>
    </div>
  );
};
