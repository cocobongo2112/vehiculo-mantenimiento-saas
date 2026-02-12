async function notifyN8N(payload) {
  if (!process.env.N8N_WEBHOOK_URL) return;

  const res = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-token": process.env.N8N_WEBHOOK_TOKEN || ""
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`n8n webhook failed: ${res.status} ${txt}`);
  }
}

module.exports = { notifyN8N };
