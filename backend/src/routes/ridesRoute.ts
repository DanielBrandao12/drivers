// src/routes/googleMapsRoute.ts
import { Router } from 'express';

import * as controller from '../controllers/ridesController';

const router = Router();
// Rota para buscar todos os motoristas
router.get('/alldrivers', controller.getAllDrivers);

router.post('/estimate', controller.verifyRoute);

router.patch('/confirm', controller.confirmRide);

router.get('/:id', controller.getRides)





export default router;