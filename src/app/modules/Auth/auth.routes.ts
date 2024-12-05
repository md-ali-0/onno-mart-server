import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
    '/signin',
    AuthController.loginUser
);
router.post(
    '/signup',
    AuthController.signupUser
);

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.post(
    '/change-password',
    AuthController.changePassword
);

router.post(
    '/forgot-password',
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    AuthController.resetPassword
)

export const AuthRoutes = router;