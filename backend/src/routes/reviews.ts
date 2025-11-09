import { and, avg, eq, sql } from 'drizzle-orm';
import { Response, Router } from 'express';
import { db } from '../config/database';
import { endpoints, reviews } from '../db/schema';
import {
  createReviewSchema,
  getEndpointReviewsParamsSchema,
  type CreateReviewDto,
} from '../dto/reviews.dto';
import { AuthenticatedRequest, verifyAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

/**
 * POST /reviews
 * Create a review for an endpoint (requires authentication)
 */
router.post(
  '/',
  verifyAuth,
  validateBody(createReviewSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body as CreateReviewDto;
      const walletAddress = req.walletAddress!;

      const [endpoint] = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.id, data.endpointId))
        .limit(1);

      if (!endpoint) {
        return res.status(404).json({
          error: 'Endpoint not found',
        });
      }

      if (endpoint.userWallet === walletAddress) {
        return res.status(403).json({
          error: 'You cannot review your own endpoint',
        });
      }

      const [existingReview] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.endpointId, data.endpointId), eq(reviews.userWallet, walletAddress)))
        .limit(1);

      if (existingReview) {
        const [updatedReview] = await db
          .update(reviews)
          .set({
            rating: data.rating,
          })
          .where(eq(reviews.id, existingReview.id))
          .returning();

        return res.json({
          message: 'Review updated successfully',
          review: updatedReview,
        });
      }

      const [newReview] = await db
        .insert(reviews)
        .values({
          endpointId: data.endpointId,
          userWallet: walletAddress,
          rating: data.rating,
        })
        .returning();

      return res.status(201).json({
        message: 'Review created successfully',
        review: newReview,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * GET /reviews/endpoint/:endpointId/average
 * Get average rating for an endpoint
 */
router.get(
  '/endpoint/:endpointId/average',
  validateParams(getEndpointReviewsParamsSchema),
  async (req, res: Response) => {
    try {
      const { endpointId } = req.validatedParams;

      const result = await db
        .select({
          averageRating: avg(reviews.rating),
          totalReviews: sql<number>`count(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.endpointId, endpointId));

      const averageRating = result[0]?.averageRating ? parseFloat(result[0].averageRating) : 0;
      const totalReviews = result[0]?.totalReviews || 0;

      return res.json({
        averageRating,
        totalReviews,
      });
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * GET /reviews/endpoint/:endpointId
 * Get all reviews for an endpoint
 */
router.get(
  '/endpoint/:endpointId',
  validateParams(getEndpointReviewsParamsSchema),
  async (req, res: Response) => {
    try {
      const { endpointId } = req.validatedParams;

      const endpointReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.endpointId, endpointId))
        .orderBy(reviews.createdAt);

      return res.json({
        reviews: endpointReviews,
        count: endpointReviews.length,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

/**
 * GET /reviews/my-review/:endpointId
 * Get current user's review for an endpoint
 */
router.get(
  '/my-review/:endpointId',
  verifyAuth,
  validateParams(getEndpointReviewsParamsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { endpointId } = req.validatedParams;
      const walletAddress = req.walletAddress!;

      const [userReview] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.endpointId, endpointId), eq(reviews.userWallet, walletAddress)))
        .limit(1);

      if (!userReview) {
        return res.status(404).json({
          error: 'Review not found',
        });
      }

      return res.json(userReview);
    } catch (error) {
      console.error('Error fetching user review:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
);

export default router;
