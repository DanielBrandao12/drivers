import dotenv from 'dotenv';


import express, { Application } from 'express'; 


import cors from 'cors';
import userRouter from './routes/userRoute'; 
import rideRouter from './routes/ridesRoute';
import driverRuter from './routes/driverRoute'

dotenv.config({ path: './.env' }); 



const app: Application = express();


app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost', // Permite requisições do frontend (ajuste para a porta correta)
    methods: ['GET', 'POST','PATCH', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
    credentials: true, // Permite o envio de cookies
  })
);



app.use('/user', userRouter);
app.use('/ride', rideRouter)

const port: number = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
