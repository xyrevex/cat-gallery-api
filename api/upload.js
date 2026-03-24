import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_TOKEN,
    secretAccessKey: process.env.R2_TOKEN,
  },
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let filename, type;

    if (req.method === "POST") {
      const contentType = req.headers["content-type"] || "";

      if (contentType.includes("application/json")) {
        const body = req.body || {};
        filename = body.filename;
        type = body.type;
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const rawBody = await new Promise((resolve) => {
          let data = "";
          req.on("data", (chunk) => (data += chunk));
          req.on("end", () => resolve(data));
        });
        const params = new URLSearchParams(rawBody);
        filename = params.get("filename");
        type = params.get("type");
      }
    } else if (req.method === "GET") {
      filename = req.query.filename;
      type = req.query.type;
    }

    if (!filename || !type) {
      console.log("Missing filename or type", { filename, type, method: req.method });
      return res.status(400).json({ error: "Missing filename or type" });
    }
    const key = `cats/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: type,
    });
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`;

    res.status(200).json({ url: signedUrl, key, publicUrl });
  } catch (err) {
    console.error("upload.js error:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
}
