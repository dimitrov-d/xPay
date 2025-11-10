import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage, generateText } from 'ai';
import { Request, Response, Router } from 'express';
import {
  generateImageSchema,
  generateTextSchema,
  type GenerateImageDto,
  type GenerateTextDto,
} from '../dto/ai.dto';
import { validateBody } from '../middleware/validation';
import { saveImageLocally } from '../services/storage';

const router = Router();

/**
 * Generate text using AI
 */
router.post('/text', validateBody(generateTextSchema), async (req: Request, res: Response) => {
  try {
    const { prompt, temperature } = req.body as GenerateTextDto;

    const result = await generateText({
      model: openai('gpt-4o'),
      prompt,
      temperature,
    });

    return res.json({
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return res.status(500).json({
      error: 'Failed to generate text',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

/**
 * Generate image using AI, save locally, and return public URLs
 */
router.post('/image', validateBody(generateImageSchema), async (req: Request, res: Response) => {
  try {
    const { prompt, size, n } = req.body as GenerateImageDto;

    const result = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      size,
      n,
    });

    const imageUrls = await Promise.all(
      (result.images || []).map(async (img: any) => {
        try {
          return await saveImageLocally(img.base64, img.mediaType);
        } catch (saveError: any) {
          console.error('Error saving image:', saveError);
          throw new Error(`Failed to save image: ${saveError.message}`);
        }
      }),
    );

    return res.json({
      success: true,
      images: imageUrls,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

export default router;
