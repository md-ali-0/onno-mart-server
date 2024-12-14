declare module 'sslcommerz-lts' {
    type SSLCommerzConfig = {
      store_id: string;
      store_passwd: string;
      isSandbox?: boolean;
    };
  
    type InitData = {
      total_amount: number;
      currency: string;
      tran_id: string;
      success_url: string;
      fail_url: string;
      cancel_url: string;
      ipn_url?: string;
      product_name?: string;
      product_category?: string;
      product_profile?: string;
      cus_name?: string;
      cus_email?: string;
      cus_phone?: string;
      cus_add1?: string;
      cus_city?: string;
      cus_country?: string;
    };
  
    type InitResponse = {
      status: string;
      GatewayPageURL?: string;
      [key: string]: any;
    };
  
    class SSLCommerz {
      constructor(store_id: string, store_passwd: string, isSandbox?: boolean);
      init(data: InitData): Promise<InitResponse>;
    }
  
    export = SSLCommerz;
  }
  