import { StatusCodes } from "http-status-codes";
import SSLCommerz from "sslcommerz-lts";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";

const create = async (payload: any) => {
    const { userId, shopId, products, customer, totalAmount } = payload;
    const tran_id = `${userId}_${Date.now()}`;
    const is_live = false;

    try {
        const data = {
            store_id: config.ssl.storeId as string,
            store_passwd: config.ssl.storePass as string,
            total_amount: Number(totalAmount),
            currency: "BDT",
            tran_id: tran_id,
            success_url: config.ssl.successUrl as string,
            fail_url: config.ssl.failUrl as string,
            cancel_url: config.ssl.cancelUrl as string,
            ipn_url: "http://localhost:3030/ipn",
            shipping_method: "Courier",
            product_name: "payload.products",
            product_category: "Electronic",
            product_profile: "general",
            cus_name: `${customer.firstName} ${customer.lastName}`,
            cus_email: customer.email,
            cus_add1: customer.address,
            cus_phone: customer.phone,
            cus_fax: customer.phone,
            ship_name: customer.address,
            ship_add1: "Dhaka",
            ship_add2: "Dhaka",
            ship_city: "Dhaka",
            ship_state: "Dhaka",
            ship_postcode: 1000,
            ship_country: "Bangladesh",
        };

        const sslcz = new SSLCommerz(
            config.ssl.storeId as string,
            config.ssl.storePass as string,
            is_live
        );
        const GatewayPageURL = sslcz.init(data).then((apiResponse) => {
            // Redirect the user to payment gateway
            let GatewayPageURL = apiResponse.GatewayPageURL;
            return GatewayPageURL
        });

        await prisma.$transaction(async (tx) => {
            // Validate inventory availability

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

            // Create the Order
            const order = await tx.order.create({
                data: {
                    userId,
                    tranId: tran_id,
                    shopId,
                    totalAmount : Number(totalAmount),
                },
            });

            // Create OrderItems and update product inventory
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
        console.log("error:", error);
    }
};

const paymentSuccess = async (payload: any) => {
    if (payload.status !== "VALID") {
        throw new ApiError(StatusCodes.NOT_FOUND, "Invalid payment");
    }

    const result = await prisma.order.update({
        where: {
            tranId: payload.tran_id,
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
    const result = await prisma.order.update({
        where: {
            tranId: payload.tran_id,
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
