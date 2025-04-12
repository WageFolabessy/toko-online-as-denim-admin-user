import { handleApiResponse } from "../utils/apiUtils";

const API_BASE_URL = "/api/admin/shipments";

export const getShipments = async (authFetch, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${queryParams ? `?${queryParams}` : ""}`;

  try {
    const response = await authFetch(url, { method: "GET" });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("API call failed: getShipments", error);
    throw error;
  }
};

export const getShipmentDetail = async (authFetch, shipmentId) => {
  const url = `${API_BASE_URL}/${shipmentId}`;
  try {
    const response = await authFetch(url, { method: "GET" });
    const responseData = await handleApiResponse(response);
    return responseData?.data || responseData;
  } catch (error) {
    console.error("API call failed: getShipmentDetail", error);
    throw error;
  }
};

export const updateShipment = async (authFetch, shipmentId, shipmentData) => {
  const url = `${API_BASE_URL}/${shipmentId}`;
  try {
    const response = await authFetch(url, {
      method: "PUT",
      body: JSON.stringify(shipmentData),
    });
    const responseData = await handleApiResponse(response);
    if (responseData.shipment && responseData.shipment.data) {
      responseData.shipment = responseData.shipment.data;
    } else if (responseData.data) {
      responseData.shipment = responseData.data;
      delete responseData.data;
    }
    return responseData;
  } catch (error) {
    console.error("API call failed: updateShipment", error);
    throw error;
  }
};
