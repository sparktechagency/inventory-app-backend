import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { faqController } from "./faq.controller";
const router = Router()

router.post("/create", auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), faqController.createFaq)
router.get("/all", faqController.getAllFaq)
router.patch("/update/:id", auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), faqController.updateFaq)
router.delete("/delete/:id", auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), faqController.deleteFaq)

export const faqRoutes = router
 