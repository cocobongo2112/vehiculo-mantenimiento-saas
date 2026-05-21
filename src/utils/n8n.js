const axios = require("axios");

exports.notifyN8N = async (payload) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("N8N_WEBHOOK_URL no está configurado");
  }

  const response = await axios.post(webhookUrl, payload, {
    headers: {
      "Content-Type": "application/json"
    },
    timeout: 10000
  });

  return response.data;
};