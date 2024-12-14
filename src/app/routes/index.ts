import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { BrandRoutes } from '../modules/Brand/brand.route';
import { CategoryRoutes } from '../modules/Category/category.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { ShopRoutes } from '../modules/Shop/shop.route';
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
    {
        path: '/product',
        route: ProductRoutes
    },
    {
        path: '/shop',
        route: ShopRoutes
    },
    {
        path: '/order',
        route: OrderRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;