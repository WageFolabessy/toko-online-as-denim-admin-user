import { handleApiResponse } from "../utils/apiUtils"; // Import handler

const API_BASE_URL = "/api/admin";

export const getAdmins = async (authFetch) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/admin`, {
      method: "GET",
    });
    const responseData = await handleApiResponse(response);
    return Array.isArray(responseData?.data) ? responseData.data : [];
  } catch (error) {
    console.error("API call failed: getAdmins", error);
    throw error;
  }
};

export const createAdmin = async (authFetch, adminData) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/admin`, {
      method: "POST",
      body: JSON.stringify(adminData),
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: createAdmin", error);
    throw error;
  }
};

export const updateOwnAdminProfile = async (authFetch, profileData) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/admin`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    const responseData = await handleApiResponse(response);
    
    if (responseData.user && responseData.user.data) {
      responseData.user = responseData.user.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: updateOwnAdminProfile", error);
    throw error;
  }
};

export const deleteAdmin = async (authFetch, adminId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/admin/${adminId}`, {
      method: "DELETE",
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: deleteAdmin", error);
    throw error;
  }
};

export const getSelectedAdmin = async (authFetch, adminId) => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/show_selected_admin/${adminId}`,
      {
        method: "GET",
      }
    );
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getSelectedAdmin", error);
    throw error;
  }
};

export const updateSelectedAdmin = async (authFetch, adminId, adminData) => {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/update_selected_admin/${adminId}`,
      {
        method: "PUT",
        body: JSON.stringify(adminData),
      }
    );
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: updateSelectedAdmin", error);
    throw error;
  }
};
