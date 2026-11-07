import { StatusCodes } from "http-status-codes";
import config from "../../../config";

import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { PaymentIntent } from "./payment.intent";

const create = async (paymentMethod: string, payload: any) => {
    // The storefront posts { orderData: {...}, paymentMethod }; accept a flat
    // body too so scripts and older clients keep working.
    const { userId, shopId, products, customer, totalAmount } =
        payload?.orderData ?? payload ?? {};
    const tran_id = `${userId ?? "guest"}_${Date.now()}`;
    const currency = "BDT"

    if (paymentMethod !== "SSLCommerz" && paymentMethod !== "AmarPay") {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Invalid Payment Method Selected"
        );
    }

    // Fail loudly when a deployment is missing gateway credentials. Without this
    // the gateway library returns nothing and the client sees a generic 400.
    if (paymentMethod === "SSLCommerz" && (!config.ssl.storeId || !config.ssl.storePass)) {
        throw new ApiError(
            StatusCodes.SERVICE_UNAVAILABLE,
            "Payment is not configured on this deployment: STORE_ID and STORE_PASS are missing."
        );
    }

    if (paymentMethod === "AmarPay" && (!config.AmarPay.store_id || !config.AmarPay.signature_key)) {
        throw new ApiError(
            StatusCodes.SERVICE_UNAVAILABLE,
            "Payment is not configured on this deployment: AMARPAY_STORE_ID and AMARPAY_SIGNATURE_KEY are missing."
        );
    }

    try {
        let GatewayPageURL

        if (paymentMethod === "SSLCommerz") {
            GatewayPageURL = await PaymentIntent.SSLIntent(tran_id, customer, currency, totalAmount)
        }
        if (paymentMethod === "AmarPay") {
            GatewayPageURL = await PaymentIntent.AmarPayIntent(tran_id, customer, currency, totalAmount)
        }
        if (!GatewayPageURL) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Create Payment Intent")
        }
        await prisma.$transaction(async (tx) => {

            for (const product of products) {
                const productData = await tx.product.findUnique({
                    where: { id: product.id },
                    select: { inventory: true, shopId: true },
                });
                if (!productData || productData.inventory < product.quantity) {
                    throw new Error(
                        `Product with ID ${product.name} is out of stock or insufficient inventory`
                    );
                }
            }

            const order = await tx.order.create({
                data: {
                    userId: userId ?? null,
                    tranId: tran_id,
                    shopId,
                    paymentMethod,
                    totalAmount : Number(totalAmount),
                },
            });

            for (const product of products) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: product.id,
                        quantity: product.quantity,
                        price: product.price,
                    },
                });

                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        inventory: {
                            decrement: product.quantity,
                        },
                    },
                });
            }
        });

        return GatewayPageURL
    } catch (error) {
        console.error("payment intent failed:", error);
        throw error instanceof ApiError
            ? error
            : new ApiError(
                  StatusCodes.INTERNAL_SERVER_ERROR,
                  "Could not start the payment"
              );
    }
};

const paymentSuccess = async (payload: any) => {

    if (payload.status !== "VALID" && payload.pay_status !== "Successful") {
        throw new ApiError(StatusCodes.NOT_FOUND, "Invalid payment");
    }

    const result = await prisma.order.update({
        where: {
            tranId: payload.tran_id || payload.mer_txnid,
        },
        data: {
            status: "COMPLETED",
        },
    });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }
    return result;
};
const paymentFail = async (payload: any) => {
    
    if (payload.status !== "FAILED" && payload.pay_status !== "Failed") {
        throw new ApiError(StatusCodes.NOT_FOUND, "Invalid payment");
    }
    
    const result = await prisma.order.update({
        where: {
            tranId: payload.tran_id || payload.mer_txnid,
        },
        data: {
            status: "FAILED",
        },
    });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }
    return result;
};

const paymentCancel = async (payload: any) => {

    const result = await prisma.order.update({
        where: {
            tranId: payload.tran_id,
        },
        data: {
            status: "CANCELED",
        },
    });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }
    return result;
};

export const PaymentService = {
    create,
    paymentSuccess,
    paymentFail,
    paymentCancel,
};
