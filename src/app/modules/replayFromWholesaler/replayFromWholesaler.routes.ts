import { Router } from "express";
import { replayFromWholesalerController } from "./replayFromWholesaler.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();

router.get("/all", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler), replayFromWholesalerController.getAllReceivedRequestFromWholesaler);




export const replayFromWholesalerRoutes = router