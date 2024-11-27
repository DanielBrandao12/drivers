// src/routes/googleMapsRoute.ts
import { Router } from 'express';

import * as controller from '../controllers/ridesController';

const router = Router();
// Rota para buscar todos os motoristas
router.get('/:id', controller.getAll, controller.getById);

router.post('/estimate', controller.verifyRoute);

router.patch('/confirm', controller.confirmRide);

//router.get('/:user_id/driver_id',)





export default router;