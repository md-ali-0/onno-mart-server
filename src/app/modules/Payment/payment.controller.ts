import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";

import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.create(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Payment Intent Created",
        data: result,
    });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {

    const result = await PaymentService.paymentSuccess(req.body);
    if (result) {
        res.redirect(`${config.client_url}/payment/success`)
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Payment Success",
        data: result,
    });
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {

    const result = await PaymentService.paymentFail(req.body);
    if (result) {
        res.redirect(`${config.client_url}/payment/failed`)
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Payment failed",
        data: result,
    });
});
const paymentCancel = catchAsync(async (req: Request, res: Response) => {

    const result = await PaymentService.paymentCancel(req.body);
    if (result) {
        res.redirect(`${config.client_url}/payment/cancel`)
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Payment canceled",
        data: result,
    });
});

export const PaymentController = {
    create,
    paymentSuccess,
    paymentFail,
    paymentCancel,
};
