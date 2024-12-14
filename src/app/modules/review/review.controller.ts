import { Request, RequestHandler, Response } from "express";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { ReviewService } from "./review.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.create(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review data Created!",
        data: result,
    });
});

const getAll: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query,  ['userId','productId', 'searchTerm']);
        const options = pick(req.query, [
            "limit",
            "page",
            "sortBy",
            "sortOrder",
        ]);
        const result = await ReviewService.getAll(filters, options);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Review data fetched!",
            meta: result.meta,
            data: result.data,
        });
    }
);

const getOne = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ReviewService.getOne(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review data fetched by id!",
        data: result,
    });
});

const update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ReviewService.update(id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review data updated!",
        data: result,
    });
});

const remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ReviewService.remove(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review data deleted!",
        data: result,
    });
});

export const ReviewController = {
    create,
    getAll,
    getOne,
    update,
    remove,
};
