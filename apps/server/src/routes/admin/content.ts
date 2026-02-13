import { Hono } from 'hono';
import { z } from 'zod';
import { createAuditLog, getRequestMetadata } from '../../lib/audit-log';
import { getHomepageConfig, updateHomepageConfig } from '../../lib/homepage-config';

const app = new Hono();

const homepageConfigSchema = z.object({
  heroTitle: z.string().min(3).max(140).optional(),
  heroSubtitle: z.string().min(3).max(260).optional(),
  sectionVisibility: z
    .object({
      hero: z.boolean().optional(),
      flashDeals: z.boolean().optional(),
      specialOffers: z.boolean().optional(),
      trendingListings: z.boolean().optional(),
      browseCategories: z.boolean().optional(),
      featuredDestinations: z.boolean().optional(),
      popularServices: z.boolean().optional(),
      seasonalPackages: z.boolean().optional(),
      testimonials: z.boolean().optional(),
      blogPreview: z.boolean().optional(),
      faq: z.boolean().optional(),
      newsletter: z.boolean().optional(),
    })
    .optional(),
});

/**
 * GET /api/admin/content/homepage
 * Get homepage configuration
 */
app.get('/homepage', async (c) => {
  try {
    const config = await getHomepageConfig();

    return c.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get homepage config error:', error);
    return c.json({ success: false, error: 'Failed to fetch homepage config' }, 500);
  }
});

/**
 * PATCH /api/admin/content/homepage
 * Update homepage configuration
 */
app.patch('/homepage', async (c) => {
  try {
    const adminUserId = c.get('userId') as string;
    const body = await c.req.json();
    const updates = homepageConfigSchema.parse(body);
    const oldConfig = await getHomepageConfig();
    const updatedConfig = await updateHomepageConfig(updates, adminUserId);

    await createAuditLog({
      userId: adminUserId,
      action: 'content.homepage.update',
      entityType: 'content',
      entityId: 'homepage',
      oldValue: oldConfig,
      newValue: updatedConfig,
      metadata: getRequestMetadata(c.req.raw.headers),
    });

    return c.json({
      success: true,
      message: 'Homepage configuration updated successfully',
      data: updatedConfig,
    });
  } catch (error) {
    console.error('Update homepage config error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ success: false, error: 'Failed to update homepage config' }, 500);
  }
});

export default app;
