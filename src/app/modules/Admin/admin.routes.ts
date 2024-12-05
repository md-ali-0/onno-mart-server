import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdminController } from './admin.controller';
import { adminValidationSchemas } from './admin.validations';

const router = express.Router();

router.get(
    '/',
    auth(Role.ADMIN),
    AdminController.getAllFromDB
);

router.get(
    '/:id',
    auth(Role.ADMIN),
    AdminController.getByIdFromDB
);

router.patch(
    '/:id',
    auth(Role.ADMIN),
    validateRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);

router.delete(
    '/:id',
    auth(Role.ADMIN),
    AdminController.deleteFromDB
);

router.delete(
    '/soft/:id',
    auth(Role.ADMIN),
    AdminController.softDeleteFromDB
);

export const AdminRoutes = router;