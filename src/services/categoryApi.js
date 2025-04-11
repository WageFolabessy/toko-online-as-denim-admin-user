import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/admin/category`;

export const getCategories = async (authFetch) => {
  try {
    const response = await authFetch(API_BASE_URL, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return Array.isArray(responseData?.data) ? responseData.data : [];
  } catch (error) {
    console.error("API call failed: getCategories", error);
    throw error;
  }
};

export const createCategory = async (authFetch, categoryData) => {
  try {
    const response = await authFetch(API_BASE_URL, {
      method: "POST",
      body: categoryData, 
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: createCategory", error);
    throw error;
  }
};

export const getCategoryDetail = async (authFetch, categoryId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/${categoryId}`, {
      method: "GET",
    });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getCategoryDetail", error);
    throw error;
  }
};

export const updateCategory = async (authFetch, categoryId, categoryData) => {
  try {
    categoryData.append("_method", "PUT");

    const response = await authFetch(`${API_BASE_URL}/${categoryId}`, {
      method: "POST",
      body: categoryData,
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: updateCategory", error);
    throw error;
  }
};

export const deleteCategory = async (authFetch, categoryId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/${categoryId}`, {
      method: "DELETE",
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: deleteCategory", error);
    throw error;
  }
};
