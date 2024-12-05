import { Request, RequestHandler, Response } from "express";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { BrandService } from "./brand.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const result = await BrandService.create(req.files, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Brand data fetched by id!",
        data: result,
    });
});

const getAll: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query,  ['name', 'searchTerm']);
        const options = pick(req.query, [
            "limit",
            "page",
            "sortBy",
            "sortOrder",
        ]);
        const result = await BrandService.getAll(filters, options);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Brand data fetched!",
            meta: result.meta,
            data: result.data,
        });
    }
);

const getOne = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandService.getOne(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Brand data fetched by id!",
        data: result,
    });
});

const update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandService.update(id, req.files, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Brand data updated!",
        data: result,
    });
});

const remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandService.remove(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Brand data deleted!",
        data: result,
    });
});

export const BrandController = {
    create,
    getAll,
    getOne,
    update,
    remove,
};
