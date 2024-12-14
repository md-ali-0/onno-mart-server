import { Router } from "express";
import { ReviewController } from "./review.controller";

const router = Router();

router.get("/", ReviewController.getAll);
router.get("/:id", ReviewController.getOne);
router.post("/", ReviewController.create);
router.patch("/:id", ReviewController.update);
router.delete("/:id", ReviewController.remove);

export const ReviewRoutes = router;
