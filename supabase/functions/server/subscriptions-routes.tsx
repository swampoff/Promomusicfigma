/**
 * SUBSCRIPTIONS ROUTES
 * Управление подписками пользователей
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const subscriptions = new Hono();

const SUBSCRIPTION_PREFIX = 'subscription:';

/**
 * КАНОНИЧНАЯ СИСТЕМА ПОДПИСОК АРТИСТА (v19)
 * 
 * Кредитная модель: подписка даёт кредиты на рассылки + скидки на услуги.
 * Годовая оплата = 10 месяцев по цене (экономия ~17%).
 * 
 * | ID     | Название    | Мес.      | Год.        | Кредитов | Доп. рассылка |
 * |--------|-------------|-----------|-------------|----------|---------------|
 * | spark  | Тест-драйв  | 0 ₽       | -           | 0        | 7 000 ₽       |
 * | start  | Старт       | 8 990 ₽   | 89 900 ₽    | 1        | 5 000 ₽       |
 * | pro    | Про         | 39 990 ₽  | 399 900 ₽   | 3        | 4 000 ₽       |
 * | elite  | Бизнес      | 149 990 ₽ | 1 499 900 ₽ | 10       | 3 000 ₽       |
 */
const SUBSCRIPTION_PLANS = {
  spark: {
    name: 'Тест-драйв',
    price_month: 0,
    price_year: 0,
    credits_per_month: 0,
    extra_mailing_price: 7000,
    discounts: {
      pitching: 0,
      marketing: 0,
      track_test: 0,
      banners: 0,
    },
    donation_fee: 0.10,
    coins_bonus: 0,
    description: 'Тест-драйв платформы. Профиль, загрузка треков, пресс-релиз для 1 трека, база знаний.',
  },
  start: {
    name: 'Старт',
    price_month: 8990,
    price_year: 89900,
    credits_per_month: 1,
    extra_mailing_price: 5000,
    discounts: {
      pitching: 0.05,
      marketing: 0.05,
      track_test: 0,
      banners: 0.05,
    },
    donation_fee: 0.07,
    coins_bonus: 0.05,
    description: 'Для старта и редких релизов. 1 рассылка в месяц + скидки на услуги.',
  },
  pro: {
    name: 'Про',
    price_month: 39990,
    price_year: 399900,
    credits_per_month: 3,
    extra_mailing_price: 4000,
    discounts: {
      pitching: 0.10,
      marketing: 0.15,
      track_test: 0.10,
      banners: 0.10,
    },
    donation_fee: 0.05,
    coins_bonus: 0.15,
    description: 'Для активных артистов. 3 рассылки в месяц, лучшая цена за рассылку.',
  },
  elite: {
    name: 'Бизнес',
    price_month: 149990,
    price_year: 1499900,
    credits_per_month: 10,
    extra_mailing_price: 3000,
    discounts: {
      pitching: 0.15,
      marketing: 0.25,
      track_test: 0.20,
      banners: 0.15,
    },
    donation_fee: 0.03,
    coins_bonus: 0.25,
    description: 'Для лейблов, менеджеров и агентств. 10 рассылок, максимальные скидки.',
  },
};

/**
 * GET /subscriptions/:userId
 * Получить подписку пользователя
 */
subscriptions.get('/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    // Если подписки нет, создаём Тест-драйв (spark)
    if (!subscription) {
      const sparkSubscription = {
        user_id: userId,
        tier: 'spark',
        tierName: SUBSCRIPTION_PLANS.spark.name,
        price: 0,
        interval: 'month',
        expires_at: null,
        status: 'active',
        credits_remaining: 0,
        credits_per_month: 0,
        extra_mailing_price: SUBSCRIPTION_PLANS.spark.extra_mailing_price,
        discounts: SUBSCRIPTION_PLANS.spark.discounts,
        donation_fee: SUBSCRIPTION_PLANS.spark.donation_fee,
        coins_bonus: SUBSCRIPTION_PLANS.spark.coins_bonus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await kv.set(key, sparkSubscription);
      return c.json({ success: true, data: sparkSubscription });
    }
    
    // Проверяем истечение подписки
    if (subscription.tier !== 'spark' && subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      
      if (now > expiresAt && subscription.status === 'active') {
        subscription.status = 'expired';
        subscription.tier = 'spark';
        subscription.tierName = SUBSCRIPTION_PLANS.spark.name;
        subscription.credits_remaining = 0;
        subscription.credits_per_month = 0;
        subscription.extra_mailing_price = SUBSCRIPTION_PLANS.spark.extra_mailing_price;
        subscription.discounts = SUBSCRIPTION_PLANS.spark.discounts;
        subscription.donation_fee = SUBSCRIPTION_PLANS.spark.donation_fee;
        subscription.coins_bonus = SUBSCRIPTION_PLANS.spark.coins_bonus;
        subscription.updated_at = new Date().toISOString();
        await kv.set(key, subscription);
      }
    }
    
    return c.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error loading subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load subscription' 
    }, 500);
  }
});

/**
 * POST /subscriptions/subscribe
 * Оформить/изменить подписку
 */
subscriptions.post('/subscribe', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, tier, interval: requestedInterval } = body;
    
    if (!user_id || !tier) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }
    
    const plan = SUBSCRIPTION_PLANS[tier as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return c.json({ 
        success: false, 
        error: 'Invalid subscription tier' 
      }, 400);
    }
    
    const interval = requestedInterval === 'year' ? 'year' : 'month';
    const daysToAdd = interval === 'year' ? 365 : 30;
    
    // Рассчитываем дату истечения
    const expiresAt = tier === 'spark' 
      ? null 
      : new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    
    const subscription = {
      user_id,
      tier,
      tierName: plan.name,
      price: interval === 'year' ? plan.price_year : plan.price_month,
      interval,
      expires_at: expiresAt,
      status: 'active',
      credits_remaining: plan.credits_per_month,
      credits_per_month: plan.credits_per_month,
      extra_mailing_price: plan.extra_mailing_price,
      discounts: plan.discounts,
      donation_fee: plan.donation_fee,
      coins_bonus: plan.coins_bonus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const key = `${SUBSCRIPTION_PREFIX}${user_id}`;
    await kv.set(key, subscription);
    
    return c.json({ 
      success: true, 
      data: subscription 
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to subscribe' 
    }, 500);
  }
});

/**
 * POST /subscriptions/:userId/cancel
 * Отменить подписку
 */
subscriptions.post('/:userId/cancel', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      return c.json({ 
        success: false, 
        error: 'Subscription not found' 
      }, 404);
    }
    
    subscription.status = 'cancelled';
    subscription.updated_at = new Date().toISOString();
    await kv.set(key, subscription);
    
    return c.json({ 
      success: true, 
      data: subscription 
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to cancel subscription' 
    }, 500);
  }
});

/**
 * GET /subscriptions/:userId/limits
 * Получить лимиты подписки (discounts, donation_fee, coins_bonus, credits)
 */
subscriptions.get('/:userId/limits', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      const sparkPlan = SUBSCRIPTION_PLANS.spark;
      return c.json({ 
        success: true, 
        data: {
          credits_per_month: sparkPlan.credits_per_month,
          extra_mailing_price: sparkPlan.extra_mailing_price,
          discounts: sparkPlan.discounts,
          donation_fee: sparkPlan.donation_fee,
          coins_bonus: sparkPlan.coins_bonus,
        }
      });
    }
    
    return c.json({ 
      success: true, 
      data: {
        credits_per_month: subscription.credits_per_month,
        credits_remaining: subscription.credits_remaining,
        extra_mailing_price: subscription.extra_mailing_price,
        discounts: subscription.discounts,
        donation_fee: subscription.donation_fee,
        coins_bonus: subscription.coins_bonus,
      }
    });
  } catch (error) {
    console.error('Error loading limits:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load limits' 
    }, 500);
  }
});

/**
 * POST /subscriptions/:userId/check-limit
 * Проверить доступные кредиты рассылок
 */
subscriptions.post('/:userId/check-limit', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const body = await c.req.json();
    const { feature } = body;
    
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription || subscription.tier === 'spark') {
      return c.json({ 
        success: true, 
        allowed: false,
        credits_remaining: 0,
        message: 'Для рассылок необходима подписка Старт или выше'
      });
    }
    
    const creditsRemaining = subscription.credits_remaining || 0;
    
    return c.json({ 
      success: true, 
      allowed: creditsRemaining > 0,
      credits_remaining: creditsRemaining,
      credits_per_month: subscription.credits_per_month,
      extra_mailing_price: subscription.extra_mailing_price,
    });
  } catch (error) {
    console.error('Error checking limit:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to check limit' 
    }, 500);
  }
});

/**
 * GET /subscriptions/:userId/current
 * Получить текущую подписку пользователя
 */
subscriptions.get('/:userId/current', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const subscription = await kv.get(key);
    
    if (!subscription) {
      // Return spark (Тест-драйв) plan as default
      return c.json({
        success: true,
        subscription: {
          id: 'spark_default',
          planId: 'spark',
          planName: 'Тест-драйв',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          price: 0,
          currency: 'RUB',
          interval: 'month',
          credits_remaining: 0,
          credits_per_month: 0,
        }
      });
    }
    
    return c.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error loading subscription:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load subscription' 
    }, 500);
  }
});

/**
 * GET /subscriptions/plans
 * Получить все доступные планы подписок (каноничные)
 */
subscriptions.get('/plans', async (c) => {
  try {
    const plans = [
      {
        id: 'spark',
        name: 'Тест-драйв',
        price: 0,
        price_year: 0,
        currency: 'RUB',
        interval: 'month',
        credits_per_month: 0,
        extra_mailing_price: 7000,
        features: [
          'Профиль артиста',
          'Загрузка треков',
          'Пресс-релиз для 1 трека',
          'Доступ к базе знаний',
          'Комиссия 10% на донаты',
        ],
        color: 'gray',
      },
      {
        id: 'start',
        name: 'Старт',
        price: 8990,
        price_year: 89900,
        currency: 'RUB',
        interval: 'month',
        credits_per_month: 1,
        extra_mailing_price: 5000,
        features: [
          '1 рассылка/мес (экономия 28%)',
          'Скидка 5% на питчинг',
          'Скидка 5% на маркетинг',
          'Скидка 5% на баннеры',
          'Комиссия 7% на донаты',
          '+5% бонусных коинов',
        ],
        popular: false,
        color: 'green',
      },
      {
        id: 'pro',
        name: 'Про',
        price: 39990,
        price_year: 399900,
        currency: 'RUB',
        interval: 'month',
        credits_per_month: 3,
        extra_mailing_price: 4000,
        features: [
          '3 рассылки/мес (экономия 43%)',
          'Скидка 10% на питчинг',
          'Скидка 15% на маркетинг',
          'Скидка 10% на тест трека',
          'Скидка 10% на баннеры',
          'Комиссия 5% на донаты',
          '+15% бонусных коинов',
          'Приоритетная поддержка',
        ],
        popular: true,
        color: 'purple',
      },
      {
        id: 'elite',
        name: 'Бизнес',
        price: 149990,
        price_year: 1499900,
        currency: 'RUB',
        interval: 'month',
        credits_per_month: 10,
        extra_mailing_price: 3000,
        features: [
          '10 рассылок/мес (экономия 57%)',
          'Скидка 15% на питчинг',
          'Скидка 25% на маркетинг',
          'Скидка 20% на тест трека',
          'Скидка 15% на баннеры',
          'Комиссия 3% на донаты',
          '+25% бонусных коинов',
          'Персональный менеджер',
        ],
        popular: false,
        color: 'yellow',
      },
    ];
    
    return c.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error loading plans:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to load plans' 
    }, 500);
  }
});

/**
 * POST /subscriptions/:userId/change-plan
 * Изменить план подписки
 */
subscriptions.post('/:userId/change-plan', async (c) => {
  const userId = c.req.param('userId');
  
  try {
    const body = await c.req.json();
    const { planId, interval } = body;
    
    if (!planId || !interval) {
      return c.json({
        success: false,
        error: 'Plan ID and interval are required'
      }, 400);
    }
    
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      return c.json({
        success: false,
        error: 'Invalid plan ID'
      }, 400);
    }
    
    const key = `${SUBSCRIPTION_PREFIX}${userId}`;
    const currentDate = new Date();
    const nextBillingDate = new Date(currentDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + (interval === 'year' ? 12 : 1));
    
    const newSubscription = {
      id: `sub_${Date.now()}`,
      planId,
      planName: plan.name,
      status: 'active',
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: nextBillingDate.toISOString(),
      cancelAtPeriodEnd: false,
      price: interval === 'year' ? plan.price_year : plan.price_month,
      currency: 'RUB',
      interval,
      credits_per_month: plan.credits_per_month,
      credits_remaining: plan.credits_per_month,
      extra_mailing_price: plan.extra_mailing_price,
      discounts: plan.discounts,
      donation_fee: plan.donation_fee,
      coins_bonus: plan.coins_bonus,
    };
    
    await kv.set(key, newSubscription);
    
    return c.json({
      success: true,
      subscription: newSubscription
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to change plan' 
    }, 500);
  }
});

export default subscriptions;