import dotenv from 'dotenv';


import express, { Application } from 'express'; 


import cors from 'cors';
import userRouter from './routes/userRoute'; 
import rideRouter from './routes/ridesRoute';
import { GOOGLE_MAPS_API_KEY } from './services/googleMaps';

dotenv.config({ path: './.env' }); 

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost', // Permite requisições do frontend (ajuste para a porta correta)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
    credentials: true, // Permite o envio de cookies
  })
);


app.get('/api/maps-key', (req, res) => {
  res.json({ apiKey: GOOGLE_MAPS_API_KEY });
});
app.use('/user', userRouter);
app.use('/ride', rideRouter)

const port: number = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
