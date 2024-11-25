// src/routes/googleMapsRoute.ts
import { Router } from 'express';

import * as controller from '../controllers/ridesController';

const router = Router();

router.post('/estimate', controller.verifyRide);
export default router;