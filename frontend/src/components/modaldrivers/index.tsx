import React, { useState } from 'react';
import api from '../../services/api';
import style from './style.module.css';
import { Button } from '../button';
import { MapEstatic } from '../mapStatic';
import { Popup } from '../popup'; // Certifique-se de importar o Popup corretamente

interface Driver {
  id: number;
  name: string;
  vehicle: string;
  description: string;
  value: number;
  review: Array<{
    rating: number;
    r_comment: string;
  }>;
}

interface ModalDrivesProps {
  isOpen: string;
  onClose: () => void;
  drivers: Driver[];
  rideId: number;
  mapUrl: string;
  onRideConfirmed: () => void;
}

export const ModalDrives: React.FC<ModalDrivesProps> = ({
  isOpen,
  onClose,
  drivers,
  rideId,
  mapUrl,
  onRideConfirmed,
}) => {
  const [confirmRideVisible, setConfirmRideVisible] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isPopupOpen, setPopupOpen] = useState<boolean>(false);
  const [isPopupOpenSucess, setPopupOpenSucess] = useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  if (!isOpen) return null;

  const showConfirmRide = (driver: Driver) => {
    setSelectedDriver(driver);
    setConfirmRideVisible(true);
  };

  const handleConfirmRide = async () => {
    if (!selectedDriver) {
      console.log('Nenhum motorista selecionado');
      return;
    }

    try {
      const response = await api.patch('/ride/confirm', {
        id: rideId,
        driver_id: selectedDriver.id,
        value: selectedDriver.value,
      });

      if (response.status === 200) {
        setConfirmationMessage(`Viagem confirmada com ${selectedDriver.name}!`);
        setConfirmRideVisible(false);
        setPopupOpenSucess(true); // Abre o popup de sucesso
        onClose();
        onRideConfirmed();
      }
    } catch (error) {
      console.error('Erro ao confirmar a viagem:', error);
      setConfirmationMessage('Erro ao confirmar a viagem. Tente novamente mais tarde.');
      setConfirmRideVisible(false);
      setPopupOpen(true); // Abre o popup de erro
    }
  };

  return (
    <div className={style.container} style={{ display: isOpen === 'flex' ? 'flex' : 'none' }}>
      {mapUrl && <MapEstatic mapUrl={mapUrl} />}
      <div className={style.containerModal}>
        <h1 className={style.title}>Motoristas Disponíveis</h1>
        {drivers.map((driver) => (
          <div key={driver.id} className={style.driverCard}>
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
              <p>{driver.review[0]?.r_comment || 'Sem avaliações'}</p>
            </div>

            <div className={style.containerPriceConfirm}>
              <span className={style.price}>R${driver.value.toFixed(2)}</span>
              <Button text="Escolher" onClick={() => showConfirmRide(driver)} />
            </div>
          </div>
        ))}

     

        {confirmRideVisible && selectedDriver && (
          <Popup
            openPopup={true}
            onClose={() => setConfirmRideVisible(false)}
            autoCloseTime={5000} // Fecha automaticamente após 5 segundos
          >
            <h3>Confirmação</h3>
            <p>Deseja confirmar a viagem com {selectedDriver.name}?</p>
            <div className={style.popupActions}>
              <button className={style.cancelButton} onClick={() => setConfirmRideVisible(false)}>
                Cancelar
              </button>
              <button className={style.confirmButton} onClick={handleConfirmRide}>
                Confirmar
              </button>
            </div>
          </Popup>
        )}

        {/* Popup de Sucesso ou Erro */}
        {isPopupOpenSucess && (
          <Popup
            openPopup={true}
            onClose={() => setPopupOpen(false)}
            autoCloseTime={3000} // Fecha automaticamente após 3 segundos
          >
            <h3>{confirmationMessage}</h3>
          </Popup>
        )}
      </div>
    </div>
  );
};
