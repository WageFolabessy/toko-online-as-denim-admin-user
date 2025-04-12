import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/reports";

export const getSalesReport = async (authFetch, params = {}) => {
  Object.keys(params).forEach(
    (key) =>
      (params[key] === "" ||
        params[key] === null ||
        params[key] === undefined) &&
      delete params[key]
  );

  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ""}`;

  try {
    const response = await authFetch(url, { method: "GET" });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: getSalesReport", error);
    throw error;
  }
};
