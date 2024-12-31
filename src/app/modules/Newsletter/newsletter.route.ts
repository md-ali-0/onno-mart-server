import { Router } from "express";
import { NewsletterController } from "./newsletter.controller";

const router = Router();

router.get("/", NewsletterController.getAll);
router.get("/:id", NewsletterController.getOne);
router.post("/", NewsletterController.create);
router.patch("/:id", NewsletterController.update);
router.delete("/:id", NewsletterController.remove);

export const NewsletterRoutes = router;
