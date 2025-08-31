import { Router } from "express";
import { aboutUsContactUsTermsAndConditionsController } from "./about-us-contact-us-terms-and-conditions.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = Router();

router.post(
  "/:type",
  auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
  aboutUsContactUsTermsAndConditionsController.createAboutUsContactUsTermsAndConditionsIntoDBController
);
router.get(
  "/:type",
  aboutUsContactUsTermsAndConditionsController.getAllAboutUsContactUsTermsAndConditionsFromDBController
);
router.patch(
  "/:type/:id",
  auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
  aboutUsContactUsTermsAndConditionsController.updateAboutUsContactUsTermsAndConditionsIntoDBController
);
export const aboutUsContactUsTermsAndConditionsRoutes = router;
