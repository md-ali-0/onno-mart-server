import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboardStatistics = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DashboardService.getDashboardStatistics();
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Statistics data fetched",
            data: result,
        });
    }
);

export const DashboardController = {
    getDashboardStatistics,
};
