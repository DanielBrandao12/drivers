
import dotenv from 'dotenv';

dotenv.config();  // Carregar as variáveis de ambiente do arquivo .env

if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('A chave da API do Google Maps não foi configurada no arquivo .env');
}

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;  // A chave da API do Google Maps



