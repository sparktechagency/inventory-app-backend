import { NextFunction, Request, Response, Router } from "express";
import { adminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const route = Router()

route.post("/users",
    fileUploadHandler() as any,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Handle file upload only if it's present, otherwise proceed with form data
            const payload = req.body;

            // Only handle file upload if a file is present in req.files
            // @ts-ignore
            if (req.files && req.files['image']) {
                const image = getSingleFilePath(req.files, 'image' as any);
                req.body = {
                    image,
                    ...payload
                };
            }

            // Pass the request to the next middleware (adminController.createUser)
            next();
        } catch (error) {
            // Handle error in a way that returns a helpful message
            // @ts-ignore
            res.status(400).json({ error: error.message || "Error in file upload" });
        }
    },
    auth(USER_ROLES.SUPER_ADMIN), adminController.createUser);

route.patch("/users/:id",
    fileUploadHandler() as any,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            if (req.files && req.files['image']) {
                const image = getSingleFilePath(req.files, 'image' as any);

                req.body.image = image;
            }

            next();
        } catch (error) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid file upload");
        }
    },
    auth(USER_ROLES.SUPER_ADMIN), adminController.updateUser);



route.delete("/users/:id",
    auth(USER_ROLES.SUPER_ADMIN), adminController.deleteUser);

export const AdminRoutes = route;





