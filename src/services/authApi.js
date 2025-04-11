import { handleApiResponse } from "../utils/apiUtils"; // Import handler

const API_BASE_URL = "/api/admin";

export const loginAdmin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const responseData = await handleApiResponse(response);
    if (responseData.user && responseData.user.data) {
      responseData.user = responseData.user.data;
    }
    return responseData;
  } catch (error) {
    console.error("Login API call failed:", error);
    if (!(error instanceof Error && "status" in error)) {
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }
    throw error;
  }
};

export const logoutAdmin = async (authFetch) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/logout`, {
      method: "POST",
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error("Logout API call failed:", error);
    if (!(error instanceof Error && "status" in error)) {
      throw new Error("Gagal melakukan logout.");
    }
    throw error;
  }
};

export const getAuthenticatedAdminProfile = async (authFetch) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/get_admin`, {
      method: "GET",
    });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("Get profile API call failed:", error);
    if (!(error instanceof Error && "status" in error)) {
      throw new Error("Gagal mengambil data profil.");
    }
    throw error;
  }
};
