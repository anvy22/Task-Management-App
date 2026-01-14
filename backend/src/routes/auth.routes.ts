import { Router } from "express"
import { firebaseAuth } from "../middlewares/firebaseAuth"
import { syncUser } from "../controllers/auth.controller"


const router = Router();

router.post('/sync',firebaseAuth,syncUser);

export default router;