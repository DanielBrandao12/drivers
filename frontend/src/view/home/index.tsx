import React, { useState, useEffect } from 'react';
import { Input } from '../../components/input';
import { Button } from '../../components/button';

import style from './style.module.css';
import { EstimateForm } from '../estimateform';

import { Map } from '../../components/maps';


export const Home: React.FC = () => {
  const [formData, setFormData] = useState({ id: '', origin: '', destination: '' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCalculate = () => {
    console.log('Calculando rota:', formData);
    // Lógica para calcular a rota
  };

  return (
    <div className={style.containerHome}>
      <div className={style.containerMaps}>
     
            <Map /> 
        
      </div>
      <EstimateForm />
    </div>
  );
};
