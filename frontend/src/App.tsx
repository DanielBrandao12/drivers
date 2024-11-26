import React from 'react';

import { Home } from './view/home';

interface ApiResponse {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: string;
}

const App: React.FC = () => {
  

  return (
  

  
          <Home/>

   

    
  );
};

export default App;
