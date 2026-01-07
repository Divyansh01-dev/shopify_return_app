import axios from "axios";

export const shopifyRequest = (shop: string, accessToken: string) => {
  return axios.create({
    baseURL: `https://${shop}/admin/api/2024-01`,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });
};
