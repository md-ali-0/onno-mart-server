import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../../config/multer.config";
import { CategoryController } from "./category.controller";

const router = Router();

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getOne);
router.post(
    "/",
    upload.fields([{ name: "image", maxCount: 1 }]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    CategoryController.create
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
    CategoryController.update
);
router.delete("/:id", CategoryController.remove);

export const CategoryRoutes = router;
