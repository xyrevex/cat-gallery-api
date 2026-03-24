import AWS from "aws-sdk";

const r2 = new AWS.S3({
  accessKeyId: process.env.R2_TOKEN,
  secretAccessKey: process.env.R2_TOKEN,
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  signatureVersion: "v4",
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // pls
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const filename = req.query.filename;
    const type = req.query.type;
    if (!filename || !type) return res.status(400).json({ error: "Missing filename or type" });

    const key = `cats/${Date.now()}-${filename}`;
    const signedUrl = await r2.getSignedUrlPromise("putObject", {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Expires: 60 * 60,
      ContentType: type,
    });

    const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${key}`;

    res.status(200).json({ url: signedUrl, key, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
}
