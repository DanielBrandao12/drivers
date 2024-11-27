import React from 'react';


import style from './style.module.css';
import { EstimateForm } from '../estimateform';


export const Home: React.FC = () => {

  return (
    <div className={style.containerHome}>

      <EstimateForm />
    </div>
  );
};
