import { Router } from "express";
import { CouponController } from "./coupon.controller";

const router = Router();

router.get("/", CouponController.getAll);
router.get("/:id", CouponController.getOne);
router.post("/", CouponController.create);
router.patch("/:id", CouponController.update);
router.delete("/:id", CouponController.remove);

export const CouponRoutes = router;
