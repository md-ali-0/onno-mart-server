import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../../config/multer.config";
import { BrandController } from "./brand.controller";

const router = Router();

router.get("/", BrandController.getAll);
router.get("/:id", BrandController.getOne);
router.post(
    "/",
    upload.fields([{ name: "image", maxCount: 1 }]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    BrandController.create
);

router.patch(
    "/:id",
    upload.fields([{ name: "image", maxCount: 1 }]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    BrandController.update
);

router.delete("/:id", BrandController.remove);


export const BrandRoutes = router