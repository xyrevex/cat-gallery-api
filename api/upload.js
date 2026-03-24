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
    const { filename, type } = req.method === "POST" ? req.body : req.query;
    if (!filename || !type) {
      console.log("Received filename:", filename, "type:", type);
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
