import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import formidable, { File } from "formidable";

// 允許 FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

// API 處理上傳
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 限制 5MB
    multiples: false, // 只允許單檔案上傳
  });
  // form.keepExtensions = true;
  // form.maxFileSize = 5 * 1024 * 1024; // 限制 5MB
  // form.multiples = false; // 只允許單檔案上傳

  try {
    const [fields, files] = await form.parse(req);

    console.log("上傳檔案資訊:", files);

    if (!files.file) {
      return res.status(400).json({ error: "未選擇檔案" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    console.log("處理檔案:", file);

    // 產生新檔名
    const newFilename = `${Date.now()}_${file.originalFilename}`;
    const newPath = path.join(uploadDir, newFilename);

    // 重新命名 & 移動檔案
    await fs.promises.rename(file.filepath, newPath);

    console.log("圖片已成功上傳:", newPath);

    return res.status(200).json({ url: `/uploads/${newFilename}` });
  } catch (error) {
    console.error("圖片上傳錯誤:", error);
    return res.status(500).json({ error: "圖片上傳失敗" });
  }
}
