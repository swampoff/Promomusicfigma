/**
 * BANNER ROUTES - Маршруты для баннерной рекламы
 * Использует KV Store для прототипа
 */

import { Hono } from 'npm:hono@4';
import * as db from './db.tsx';
import { uploadFile, BUCKET_NAMES } from './storage-setup.tsx';

const bannerRoutes = new Hono();

// Mock функция для получения баннеров пользователя
async function getUserBannerAds(userId: string) {
  try {
    const banners = await db.kvGetByPrefix(`banner_ad_${userId}_`);
    return banners || [];
  } catch (error) {
    console.error('Error getting user banners:', error);
    return [];
  }
}

// Mock функция для создания баннера
async function createBannerAd(userId: string, bannerData: any) {
  try {
    const bannerId = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = `banner_ad_${userId}_${bannerId}`;
    
    const banner = {
      id: bannerId,
      user_id: userId,
      ...bannerData,
      status: 'pending_moderation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await db.kvSet(key, banner);
    return banner;
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
}

/**
 * GET /server/banner/user/:userId
 * Получить все банн��ры пользователя
 */
bannerRoutes.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'User ID is required',
      }, 400);
    }

    const banners = await getUserBannerAds(userId);

    return c.json({
      success: true,
      data: banners,
      count: banners.length,
    });

  } catch (error) {
    console.error('Error in /banner/user:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * GET /server/banner/my-ads?userId=xxx
 * Альтернативный endpoint для получения баннеров пользователя (query params)
 */
bannerRoutes.get('/my-ads', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'User ID is required as query parameter',
      }, 400);
    }

    const banners = await getUserBannerAds(userId);

    return c.json({
      success: true,
      data: banners,
      count: banners.length,
    });

  } catch (error) {
    console.error('Error in /banner/my-ads:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /server/banner/create
 * Создать новый ��аннер
 */
bannerRoutes.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, ...bannerData } = body;
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'User ID is required',
      }, 400);
    }

    const banner = await createBannerAd(userId, bannerData);

    return c.json({
      success: true,
      data: banner,
    });

  } catch (error) {
    console.error('Error in /banner/create:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * GET /server/banner/stats/:userId
 * Получить статистику баннеров пользователя
 */
bannerRoutes.get('/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'User ID is required',
      }, 400);
    }

    const banners = await getUserBannerAds(userId);
    
    // Подсчитываем статистику
    const stats = {
      total_banners: banners.length,
      active_banners: banners.filter((b: any) => b.status === 'active').length,
      total_views: banners.reduce((sum: number, b: any) => sum + (b.views || 0), 0),
      total_clicks: banners.reduce((sum: number, b: any) => sum + (b.clicks || 0), 0),
      total_spent: banners.reduce((sum: number, b: any) => sum + (b.spent || 0), 0),
    };

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error in /banner/stats:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

/**
 * POST /server/banner/upload
 * Загрузить изображение баннера
 */
bannerRoutes.post('/upload', async (c) => {
  try {
    console.log('Banner upload request received');
    
    // Get form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file in upload request');
      return c.json({
        success: false,
        error: 'No file provided',
      }, 400);
    }
    
    console.log('File received:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      }, 400);
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        error: 'File size exceeds 5MB limit',
      }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop();
    const fileName = `banner_${timestamp}_${random}.${extension}`;
    const filePath = `banners/${fileName}`;
    
    console.log('Uploading to storage:', filePath);
    
    // Upload to storage
    const fileBuffer = await file.arrayBuffer();
    const uploadResult = await uploadFile(
      BUCKET_NAMES.BANNER_IMAGES,
      filePath,
      fileBuffer,
      file.type
    );
    
    if (!uploadResult.success) {
      console.error('Storage upload failed:', uploadResult.error);
      return c.json({
        success: false,
        error: uploadResult.error || 'Failed to upload file to storage',
      }, 500);
    }
    
    console.log('File uploaded successfully:', uploadResult.url);
    
    return c.json({
      success: true,
      data: {
        url: uploadResult.url,
        fileName,
        filePath,
      },
    });
    
  } catch (error) {
    console.error('Error in /banner/upload:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }, 500);
  }
});

/**
 * POST /server/banner/submit
 * Отправить баннер на модерацию
 */
bannerRoutes.post('/submit', async (c) => {
  try {
    console.log('Banner submission request received');
    
    const body = await c.req.json();
    const {
      user_id,
      user_email,
      campaign_name,
      banner_type,
      image_url,
      target_url,
      duration_days,
      dimensions,
    } = body;
    
    // Validation
    if (!user_id || !campaign_name || !banner_type || !image_url) {
      return c.json({
        success: false,
        error: 'Missing required fields',
      }, 400);
    }
    
    console.log('Creating banner campaign:', campaign_name);
    
    // Calculate cost (mock pricing)
    const basePrices: Record<string, number> = {
      'player': 5000,
      'sidebar': 3000,
      'header': 4000,
      'footer': 2500,
      'mobile': 3500,
    };
    
    const basePrice = basePrices[banner_type] || 3000;
    const totalCost = basePrice * duration_days;
    
    // Create banner ad
    const bannerId = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = `banner_ad_${user_id}_${bannerId}`;
    
    const banner = {
      id: bannerId,
      user_id,
      user_email,
      campaign_name,
      banner_type,
      image_url,
      target_url,
      duration_days,
      dimensions,
      status: 'pending_payment', // Ожидает оплаты
      cost: totalCost,
      views: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start_date: null,
      end_date: null,
    };
    
    await db.kvSet(key, banner);
    
    console.log('Banner campaign created:', bannerId, 'Status:', banner.status);
    
    return c.json({
      success: true,
      data: banner,
      message: 'Banner campaign created successfully',
    });
    
  } catch (error) {
    console.error('Error in /banner/submit:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Submission failed',
    }, 500);
  }
});

export default bannerRoutes;