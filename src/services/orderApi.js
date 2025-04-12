import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/orders";

export const getOrders = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ""}`;
  try {
    const response = await authFetch(url, { method: "GET" });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: getOrders", error);
    throw error;
  }
};

export const getOrderDetail = async (authFetch, orderId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/${orderId}`, {
      method: "GET",
    });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getOrderDetail", error);
    throw error;
  }
};

export const updateOrderStatus = async (authFetch, orderId, status) => {
  const url = `${API_BASE_URL}/${orderId}`;
  try {
    const response = await authFetch(url, {
      method: "PUT",
      body: JSON.stringify({ status: status }),
    });
    const responseData = await handleApiResponse(response);
    if (responseData.order && responseData.order.data) {
      responseData.order = responseData.order.data;
    } else if (responseData.data) {
      responseData.order = responseData.data;
      delete responseData.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: updateOrderStatus", error);
    throw error;
  }
};
