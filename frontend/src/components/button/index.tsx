import React from 'react';
import style from './style.module.css';

interface ButtonProps {
  text: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset'; // Define o tipo do botão
  disabled?: boolean;

}

export const Button: React.FC<ButtonProps> = ({ text, onClick, type = 'button', disabled = false}) => {
  return (
    <button
      className={`${style.button} ${disabled ? style.buttonDisabled : ''}`}
     
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
};