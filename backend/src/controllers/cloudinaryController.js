const { createHash } = require("crypto");

const FOLDER = "scooter-rental-products";

function createUploadSignature(config, timestamp) {
  const parameters = [`folder=${FOLDER}`, `timestamp=${timestamp}`].sort().join("&");
  const signature = createHash("sha1")
    .update(`${parameters}${config.apiSecret}`)
    .digest("hex");

  return {
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder: FOLDER,
    signature,
    timestamp,
  };
}

function getUploadSignature(req, res) {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } =
    process.env;

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(503).json({
      success: false,
      message: "Cloudinary upload is not configured",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const upload = createUploadSignature(
    {
      apiKey: CLOUDINARY_API_KEY,
      apiSecret: CLOUDINARY_API_SECRET,
      cloudName: CLOUDINARY_CLOUD_NAME,
    },
    timestamp,
  );

  return res.status(200).json({ success: true, upload });
}

module.exports = { createUploadSignature, getUploadSignature };
