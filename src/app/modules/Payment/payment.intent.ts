import axios from "axios";
import SSLCommerz from "sslcommerz-lts";
import config from "../../../config";

const SSLIntent = async (
    tran_id: string,
    customer: any,
    currency: string,
    totalAmount: string
) => {
    const is_live = false;

    const data = {
        store_id: config.ssl.storeId as string,
        store_passwd: config.ssl.storePass as string,
        total_amount: Number(totalAmount),
        currency,
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
        return GatewayPageURL;
    });

    return GatewayPageURL;
};

const AmarPayIntent = async (
    tran_id: string,
    customer: any,
    currency: string,
    totalAmount: string
) => {
    const formData = {
        store_id: config.AmarPay.store_id,
        signature_key: config.AmarPay.signature_key,
        cus_name: `${customer.firstName} ${customer.lastName}`,
        cus_email: customer.email,
        cus_phone: customer.phone,
        amount: Number(totalAmount),
        tran_id,
        currency,
        desc: "T-Shirt",
        cus_add1: customer.address,
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        success_url: config.ssl.successUrl as string,
        fail_url: config.ssl.failUrl as string,
        cancel_url: `${config.client_url}/payment/cancel` as string,
        type: "json", //This is must required for JSON request
    };

    const { data } = await axios.post(
        "https://sandbox.aamarpay.com/jsonpost.php",
        formData
      );

    return data.payment_url;
};

export const PaymentIntent = {
    SSLIntent,
    AmarPayIntent
};
