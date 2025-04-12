import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/reviews";

export const getReviews = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ""}`;

  try {
    const response = await authFetch(url, { method: "GET" });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: getReviews", error);
    throw error;
  }
};

export const getReviewDetail = async (authFetch, reviewId) => {
  const url = `${API_BASE_URL}/${reviewId}`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getReviewDetail", error);
    throw error;
  }
};
