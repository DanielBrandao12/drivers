import React, { useEffect } from 'react';
import style from './style.module.css';

interface PopupProps {
  openPopup: boolean; // Agora é booleano para simplificar
  onClose: () => void; // Callback para fechar o popup
  children: React.ReactNode; // Conteúdo do popup
  autoCloseTime?: number; // Tempo em milissegundos para fechar automaticamente
}

export const Popup: React.FC<PopupProps> = ({ openPopup, onClose, children, autoCloseTime }) => {
  useEffect(() => {
    if (openPopup && autoCloseTime) {
      const timer = setTimeout(onClose, autoCloseTime);
      return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente ou se o estado mudar
    }
  }, [openPopup, autoCloseTime, onClose]);

  if (!openPopup) return null; // Não renderiza o popup se não estiver aberto

  return (
    <div className={style.popupOverlay} onClick={onClose}>
      <div className={style.popupContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
