import { Router } from "express";
import { packageController } from "./package.controller";
import validateRequest from "../../middlewares/validateRequest";
import { packageValidation } from "./package.validation";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const route = Router()

// create a new package
route.post("/packages", auth(USER_ROLES.Wholesaler), validateRequest(packageValidation.createProductZodSchema), packageController.createPackage);


// get all packages
route.get("/packages", auth(USER_ROLES.Admin), packageController.getAllPackages);
route.get("/packages/:id", auth(USER_ROLES.Admin), packageController.getSinglePackage);


// export the route
export const packageRoutes = route;