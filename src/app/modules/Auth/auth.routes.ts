import express, { NextFunction, Request, Response } from "express";
import { upload } from "../../../config/multer.config";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/signin", AuthController.loginUser);
router.post("/signup", AuthController.signupUser);
router.post(
    "/vendor-signup",
    upload.fields([
        { name: "shopLogo", maxCount: 1 },
    ]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    AuthController.vendorSignup
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/change-password", AuthController.changePassword);

router.post("/forget-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
