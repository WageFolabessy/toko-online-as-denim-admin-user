import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin";

export const getSiteUsers = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/site_user${
    queryParams ? `?${queryParams}` : ""
  }`;

  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData;
  } catch (error) {
    console.error("API call failed: getSiteUsers", error);
    throw error;
  }
};

export const getSiteUserDetail = async (authFetch, userId) => {
  const url = `${API_BASE_URL}/site_user/${userId}`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getSiteUserDetail", error);
    throw error;
  }
};

export const updateSiteUserStatus = async (authFetch, userId, isActive) => {
  const url = `${API_BASE_URL}/update_siteuser_status/${userId}`;
  try {
    const response = await authFetch(url, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    });
    const responseData = await handleApiResponse(response);
    if (responseData.user && responseData.user.data) {
      responseData.user = responseData.user.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: updateSiteUserStatus", error);
    throw error;
  }
};
