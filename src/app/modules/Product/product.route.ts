import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../../config/multer.config";
import { ProductController } from "./product.controller";

const router = Router();

router.get("/", ProductController.getAll);
router.get("/sellers-product", ProductController.getAll);
router.get("/:slug", ProductController.getOne);
router.post(
    "/",
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    ProductController.create
);

router.post(
    "/duplicate/:productId",
    ProductController.duplicate
);

router.patch(
    "/:id",
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    ProductController.update
);

router.delete("/:id", ProductController.remove);

export const ProductRoutes = router;
