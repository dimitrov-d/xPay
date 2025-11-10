import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'ai-generated');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save a base64 image to local storage and return the public URL
 */
export async function saveImageLocally(base64Data: string, mediaType: string): Promise<string> {
  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const buffer = Buffer.from(base64Content, 'base64');

  const extension = mediaType.includes('png')
    ? 'png'
    : mediaType.includes('jpeg') || mediaType.includes('jpg')
      ? 'jpg'
      : 'png';

  const filename = `${uuidv4()}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);

  return `${process.env.BASE_URL}/uploads/ai-generated/${filename}`;
}
