import { Request, RequestHandler, Response } from "express";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { ProductService } from "./product.service";

const create = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductService.create(req.files, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product data created",
        data: result,
    });
});
const duplicate = catchAsync(async (req: Request, res: Response) => {
    const {productId} = req.params

    const result = await ProductService.duplicate(productId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product data created",
        data: result,
    });
});

const getAll: RequestHandler = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, [
            "name",
            "ProductId",
            "categoryId",
            "shopId",
            "searchTerm",
        ]);
        const options = pick(req.query, [
            "limit",
            "page",
            "sortBy",
            "sortOrder",
        ]);
        const result = await ProductService.getAll(filters, options);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Product data fetched!",
            meta: result.meta,
            data: result.data,
        });
    }
);

const getOne = catchAsync(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const result = await ProductService.getOne(slug);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product data fetched by id",
        data: result,
    });
});

const update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.update(id, req.files, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product data updated!",
        data: result,
    });
});

const remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductService.remove(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product data deleted!",
        data: result,
    });
});

export const ProductController = {
    create,
    duplicate,
    getAll,
    getOne,
    update,
    remove,
};
