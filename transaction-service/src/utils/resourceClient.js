const axios = require("axios");

const RESOURCE_SERVICE_URL = process.env.RESOURCE_SERVICE_URL || "http://127.0.0.1:3002";

exports.checkAvailability = async (resourceId, buyerId) => {
  try {
    const response = await axios.get(
      `${RESOURCE_SERVICE_URL}/internal/${resourceId}/availability`,
      { params: { buyerId } }
    );

    return response.data.available;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // resource not found
    }
    throw error;
  }
};
