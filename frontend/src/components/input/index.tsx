import React from 'react';
import style from './style.module.css'
interface InputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ id, name, value, onChange, placeholder, required }) => {
  return (
    <input
    className={style.inputGlobal}
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      
    />
  );
};

