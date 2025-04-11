export const handleApiResponse = async (response) => {
  if (response.ok && response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (response.ok) {
      return null;
    }
    const error = new Error(
      `HTTP error! status: ${response.status} - ${
        response.statusText || "No message"
      }`
    );
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `HTTP error! status: ${response.status}`
    );
    error.status = response.status;
    if (response.status === 422 && data.errors) {
      error.errors = data.errors;
    }
    error.data = data;
    throw error;
  }

  return data;
};
