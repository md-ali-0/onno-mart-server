import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../../config/multer.config";
import { ShopController } from "./shop.controller";

const router = Router();

router.get("/", ShopController.getAll);
router.get("/:id", ShopController.getOne);

router.patch(
    "/:id",
    upload.fields([
        { name: "logoUrl", maxCount: 1 }
    ]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    ShopController.update
);

router.delete("/:id", ShopController.remove);

export const ShopRoutes = router;
