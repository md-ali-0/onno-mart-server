import { Role } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { upload } from "../../../config/multer.config";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = express.Router();

router.get("/", auth(Role.ADMIN), userController.getAllFromDB);

router.get(
    "/me",
    auth(Role.ADMIN, Role.VENDOR, Role.USER),
    userController.getMyProfile
);

router.put(
    "/update-my-profile",
    auth(Role.ADMIN, Role.VENDOR, Role.USER),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        return userController.updateMyProfie(req, res, next);
    }
);

router.patch(
    "/:id",
    auth(Role.ADMIN),
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    userController.update
);

export const userRoutes = router;
