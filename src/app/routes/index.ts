import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { BrandRoutes } from '../modules/Brand/brand.route';
import { CategoryRoutes } from '../modules/Category/category.route';
import { userRoutes } from '../modules/User/user.routes';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/brand',
        route: BrandRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/category',
        route: CategoryRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;