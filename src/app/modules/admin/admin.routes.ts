import { NextFunction, Request, Response, Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { adminController } from "./admin.controller";

const route = Router()

route.post("/users",
    fileUploadHandler() as any,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.body;
            // @ts-ignore
            if (req.files && req.files['image']) {
                const image = getSingleFilePath(req.files, 'image' as any);
                req.body = {
                    image,
                    ...payload
                };
            }
            next();
        } catch (error) {
            // @ts-ignore
            res.status(400).json({ error: error.message || "Error in file upload" });
        }
    },
    auth(USER_ROLES.SUPER_ADMIN),
    adminController.createUser
);
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
    auth(USER_ROLES.SUPER_ADMIN), adminController.updateUser
);



route.delete("/users/:id",
    auth(USER_ROLES.SUPER_ADMIN), adminController.deleteUser);

export const AdminRoutes = route;





