import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/payments";

export const getPayments = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const response = await authFetch(url, { method: "GET" });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: getPayments", error);
    throw error;
  }
};

export const getPaymentDetail = async (authFetch, paymentId) => {
    const url = `${API_BASE_URL}/${paymentId}`;
    try {
      const response = await authFetch(url, { method: 'GET' });
      const responseData = await handleApiResponse(response);
      return responseData?.data || responseData;
    } catch (error) {
      console.error("API call failed: getPaymentDetail", error);
      throw error;
    }
  };
