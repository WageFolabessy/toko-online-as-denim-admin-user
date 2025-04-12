import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/dashboard";

export const getDashboardSummary = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/summary${queryParams ? `?${queryParams}` : ""}`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || {};
  } catch (error) {
    console.error("API call failed: getDashboardSummary", error);
    throw error;
  }
};

export const getDashboardOrdersData = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/orders_data${
    queryParams ? `?${queryParams}` : ""
  }`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || [];
  } catch (error) {
    console.error("API call failed: getDashboardOrdersData", error);
    throw error;
  }
};

export const getDashboardSalesData = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/sales_data${
    queryParams ? `?${queryParams}` : ""
  }`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || [];
  } catch (error) {
    console.error("API call failed: getDashboardSalesData", error);
    throw error;
  }
};

export const getDashboardRecentOrders = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/recent_orders${
    queryParams ? `?${queryParams}` : ""
  }`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || [];
  } catch (error) {
    console.error("API call failed: getDashboardRecentOrders", error);
    throw error;
  }
};
