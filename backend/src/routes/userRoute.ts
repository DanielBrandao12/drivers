import { Router } from "express";
import * as controller from '../controllers/userController';


const router = Router();

router.get('/', controller.getUser)
router.post('/createUser', controller.createUser);



export default router;