import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/admin/product`;

export const getProducts = async (authFetch) => {
  try {
    const response = await authFetch(API_BASE_URL, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return Array.isArray(responseData?.data) ? responseData.data : [];
  } catch (error) {
    console.error("API call failed: getProducts", error);
    throw error;
  }
};

export const createProduct = async (authFetch, productData) => {
  try {
    const response = await authFetch(API_BASE_URL, {
      method: "POST",
      body: productData,
    });
    const responseData = await handleApiResponse(response);
    if (responseData.product && responseData.product.data) {
      responseData.product = responseData.product.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: createProduct", error);
    throw error;
  }
};

export const getProductDetail = async (authFetch, productId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/${productId}`, {
      method: "GET",
    });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getProductDetail", error);
    throw error;
  }
};

export const updateProduct = async (authFetch, productId, productData) => {
  try {
    productData.append("_method", "PUT");
    const response = await authFetch(`${API_BASE_URL}/${productId}`, {
      method: "POST",
      body: productData,
    });
    const responseData = await handleApiResponse(response);
    if (responseData.product && responseData.product.data) {
      responseData.product = responseData.product.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: updateProduct", error);
    throw error;
  }
};

export const deleteProduct = async (authFetch, productId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/${productId}`, {
      method: "DELETE",
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: deleteProduct", error);
    throw error;
  }
};
