import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getOne);
router.patch("/:id", OrderController.update);
router.delete("/:id", OrderController.remove);

export const OrderRoutes = router;
