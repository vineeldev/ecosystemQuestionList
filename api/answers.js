// One shared master record for all respondents.
// Storage: Upstash Redis via Vercel Marketplace (env vars are auto-injected
// when you connect a Redis database to this project in the Vercel dashboard).

const MASTER_KEY = "sal-pass-master-v1";

async function redis(cmdPath, body) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis env vars missing — connect an Upstash Redis database to this project in Vercel → Storage.");
  const r = await fetch(`${url}/${cmdPath}`, {
    method: body !== undefined ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}` },
    body: body !== undefined ? body : undefined,
  });
  if (!r.ok) throw new Error(`Redis error ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  // Optional shared-link access key: set ACCESS_KEY in Vercel env vars,
  // then share the page as https://your-app.vercel.app/?k=THATKEY
  const required = process.env.ACCESS_KEY;
  if (required && req.headers["x-access-key"] !== required) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const r = await redis(`get/${MASTER_KEY}`);
      const answers = r.result ? JSON.parse(r.result) : {};
      return res.status(200).json({ answers });
    }

    if (req.method === "POST") {
      const { patches } = req.body || {};
      if (!patches || typeof patches !== "object") {
        return res.status(400).json({ error: "expected { patches: { qid: {...} } }" });
      }
      // read-merge-write (fine for a handful of concurrent users)
      const cur = await redis(`get/${MASTER_KEY}`);
      const data = cur.result ? JSON.parse(cur.result) : {};
      for (const [qid, val] of Object.entries(patches)) {
        if (val && typeof val === "object") data[qid] = { ...data[qid], ...val };
      }
      await redis(`set/${MASTER_KEY}`, JSON.stringify(data));
      return res.status(200).json({ ok: true, answers: data });
    }

    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
