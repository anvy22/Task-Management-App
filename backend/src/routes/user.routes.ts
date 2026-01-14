import Router from "express"
import { getUsers , setName, getDetails, getAssignedTicketsDetails } from "../controllers/user.controller"
import { authorize } from "../middlewares/rbac"
import { firebaseAuth } from "../middlewares/firebaseAuth"

const router = Router();

router.use(firebaseAuth);

router.get("/",authorize(["admin"]),getUsers);
router.patch("/update",setName);
router.get("/details",getDetails);
router.get("/userdetails",authorize(["admin"]),getAssignedTicketsDetails);



export default router;