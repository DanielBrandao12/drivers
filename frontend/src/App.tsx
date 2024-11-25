import React, { useState } from 'react';
import api from './services/api';

interface ApiResponse {
  // Defina a estrutura de resposta esperada, por exemplo:
  message: string;
}

const App: React.FC = () => {
  const [origin, setOrigin] = useState<string>(''); // Estado para armazenar o valor do input de origem
  const [destination, setDestination] = useState<string>(''); // Estado para armazenar o valor do input de destino
  const [loading, setLoading] = useState<boolean>(false); // Estado para controle de loading
  const [message, setMessage] = useState<string>(''); // Estado para mensagem de sucesso ou erro

  // Função para enviar o POST
  const handleSubmit = async () => {
    if (!origin || !destination) {
      alert('Origem e destino são necessários');
      return;
    }

    setLoading(true); // Ativa o loading

    try {
      const response = await api.post<ApiResponse>('/ride/estimate', { origin, destination });

      // Verifica se a resposta foi bem-sucedida
      if (response.status === 200) {
        setMessage(response.data.message || 'Rota calculada com sucesso!');
        setOrigin(''); // Limpar o campo após o envio
        setDestination(''); // Limpar o campo após o envio
      } else {
        setMessage('Ocorreu um erro ao calcular a rota.');
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setMessage('Ocorreu um erro ao enviar os dados.');
    } finally {
      setLoading(false); // Desativa o loading após a requisição
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calculadora de Rota</h1>

        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)} // Atualiza o estado com o valor do input
          placeholder="Digite o ponto de origem"
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)} // Atualiza o estado com o valor do input
          placeholder="Digite o ponto de destino"
        />
        
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Calcular Rota'}
        </button> {/* Botão com feedback de loading */}

        {message && <p>{message}</p>} {/* Exibe a mensagem de sucesso ou erro */}
      </header>
    </div>
  );
};

export default App;
