import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { emitSSE } from './sse-routes.tsx';

const app = new Hono();

// =====================================================
// TRACK TEST SYSTEM - PROFESSIONAL EXPERT REVIEWS
// =====================================================

// Типы данных
interface TrackTestRequest {
  id: string;
  user_id: string | null; // null для гостей
  track_id: string | null; // null для гостей
  guest_email?: string;
  guest_name?: string;
  guest_track_url?: string;
  guest_cover_url?: string;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: 'pending_payment' | 'payment_succeeded' | 'pending_moderation' | 'moderation_rejected' | 
          'pending_expert_assignment' | 'experts_assigned' | 'in_review' | 'review_in_progress' |
          'analysis_generated' | 'pending_admin_approval' | 'pending_admin_review' |
          'completed' | 'rejected';
  payment_status: 'pending' | 'completed' | 'refunded';
  payment_amount: number; // 1000 RUB
  payment_transaction_id?: string;
  required_expert_count: number; // до 10
  completed_reviews_count: number;
  assigned_experts: string[]; // email эксперта
  average_rating?: number; // средняя оценка (1-10)
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  final_analysis?: string; // сгенерированный общий анализ
  consolidated_feedback?: string;
  consolidated_recommendations?: string;
  admin_approval_status?: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  rejection_reason?: string;
  feedback_sent_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ExpertReview {
  id: string;
  request_id: string;
  expert_email: string;
  expert_name: string;
  expert_role?: string;
  status: 'assigned' | 'in_progress' | 'completed';
  
  // Оценки (1-10)
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  overall_score: number;
  
  // Фидбек
  mixing_mastering_feedback: string;
  arrangement_feedback: string;
  originality_feedback: string;
  commercial_potential_feedback: string;
  general_feedback: string;
  recommendations: string;
  
  // Замечания по таймкодам
  audio_notes?: { id: string; timestamp: string; comment: string; category: string }[];
  
  reward_points: number; // 50 коинов
  reward_paid: boolean;
  
  created_at: string;
  completed_at?: string;
}

// =====================================================
// 1. СОЗДАНИЕ ЗАЯВКИ (для артистов и гостей)
// =====================================================

app.post('/submit', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      user_id, 
      track_id,
      guest_email,
      guest_name,
      guest_track_url,
      guest_cover_url,
      track_title,
      artist_name,
      genre 
    } = body;

    // Валидация
    if (!track_title || !artist_name) {
      return c.json({ error: 'Track title and artist name are required' }, 400);
    }

    if (!user_id && !guest_email) {
      return c.json({ error: 'User ID or guest email required' }, 400);
    }

    const requestId = crypto.randomUUID();
    const now = new Date().toISOString();

    const trackTestRequest: TrackTestRequest = {
      id: requestId,
      user_id: user_id || null,
      track_id: track_id || null,
      guest_email,
      guest_name,
      guest_track_url,
      guest_cover_url,
      track_title,
      artist_name,
      genre,
      status: 'pending_payment',
      payment_status: 'pending',
      payment_amount: 1000,
      required_expert_count: 5, // по умолчанию 5 экспертов
      completed_reviews_count: 0,
      assigned_experts: [],
      created_at: now,
      updated_at: now
    };

    // Сохранить заявку
    await kv.set(`track_test:requests:${requestId}`, trackTestRequest);

    // Добавить в список заявок пользователя
    if (user_id) {
      const userRequests = await kv.get(`track_test:user:${user_id}:requests`) || [];
      userRequests.unshift(requestId);
      await kv.set(`track_test:user:${user_id}:requests`, userRequests);
    }

    // Добавить в общий список (для администратора)
    const allRequests = await kv.get('track_test:all_requests') || [];
    allRequests.unshift(requestId);
    await kv.set('track_test:all_requests', allRequests);

    console.log(`✅ Track test request created: ${requestId}`);

    return c.json({
      success: true,
      request_id: requestId,
      status: 'pending_payment',
      payment_amount: 1000,
      message: 'Track test request created. Please proceed with payment.'
    });

  } catch (error) {
    console.error('❌ Error creating track test request:', error);
    return c.json({ error: 'Failed to create track test request' }, 500);
  }
});

// =====================================================
// 2. ОБРАБОТКА ОПЛАТЫ
// =====================================================

app.post('/payment', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, payment_method, transaction_id } = body;

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Симуляция успешной оплаты
    // В production здесь будет интеграция с платежной системой

    request.payment_status = 'completed';
    request.payment_transaction_id = transaction_id || crypto.randomUUID();
    request.status = 'payment_succeeded';
    request.updated_at = new Date().toISOString();

    await kv.set(`track_test:requests:${request_id}`, request);

    // Создать транзакцию оплаты
    const paymentTx = {
      id: crypto.randomUUID(),
      user_id: request.user_id,
      amount: request.payment_amount,
      currency: 'RUB',
      type: 'track_test',
      status: 'completed',
      payment_method,
      description: `Track test: ${request.track_title}`,
      related_entity_type: 'track_test_request',
      related_entity_id: request_id,
      created_at: new Date().toISOString()
    };

    await kv.set(`payments:${request.user_id}:tx:${paymentTx.id}`, paymentTx);

    // SSE: уведомить администраторов о новой оплаченной заявке
    emitSSE('admin-1', {
      type: 'notification',
      data: {
        newStatus: 'in_review',
        orderTitle: request.track_title,
        comment: `Оплачен тест трека: ${request.track_title} - ${request.artist_name} (1000 ₽)`,
      },
    });

    console.log(`💰 Payment completed for request: ${request_id}`);

    return c.json({
      success: true,
      status: 'payment_succeeded',
      message: 'Payment completed. Your request is now under moderation.'
    });

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

// =====================================================
// 3. МОДЕРАЦИЯ (администратор)
// =====================================================

app.post('/moderate', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, action, notes } = body;
    // action: 'approve' | 'reject'

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'payment_succeeded' && request.status !== 'pending_moderation') {
      return c.json({ error: 'Request is not pending moderation' }, 400);
    }

    if (action === 'approve') {
      request.status = 'pending_expert_assignment';
      request.moderation_notes = notes;
      console.log(`✅ Request approved: ${request_id}`);

      // SSE: уведомить всех онлайн-экспертов о новом доступном тесте
      const expertIds = (await kv.get('track_test:registered_experts') || []) as string[];
      for (const eid of expertIds) {
        emitSSE(eid, {
          type: 'track_test_available',
          data: {
            requestId: request_id,
            trackTitle: request.track_title,
            artistName: request.artist_name,
            genre: request.genre,
            message: `Новый трек для тестирования: ${request.track_title} - ${request.artist_name}`,
          },
        });
      }
    } else if (action === 'reject') {
      request.status = 'moderation_rejected';
      request.rejection_reason = notes;
      
      // Возврат средств
      request.payment_status = 'refunded';

      // SSE: уведомить артиста об отклонении + возврате
      if (request.user_id) {
        emitSSE(request.user_id, {
          type: 'notification',
          data: {
            newStatus: 'rejected',
            orderTitle: request.track_title,
            comment: `Заявка на тест трека "${request.track_title}" отклонена. Средства возвращены на баланс.`,
          },
        });
      }

      console.log(`❌ Request rejected: ${request_id}`);
    }

    request.updated_at = new Date().toISOString();
    await kv.set(`track_test:requests:${request_id}`, request);

    return c.json({
      success: true,
      status: request.status,
      message: action === 'approve' ? 'Request approved' : 'Request rejected and refunded'
    });

  } catch (error) {
    console.error('❌ Error moderating request:', error);
    return c.json({ error: 'Failed to moderate request' }, 500);
  }
});

// =====================================================
// 4. НАЗНАЧЕНИЕ ЭКСПЕРТОВ (администратор)
// =====================================================

app.post('/assign-experts', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, expert_emails, required_count } = body;

    if (!expert_emails || expert_emails.length === 0) {
      return c.json({ error: 'At least one expert required' }, 400);
    }

    if (expert_emails.length > 10) {
      return c.json({ error: 'Maximum 10 experts allowed' }, 400);
    }

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'pending_expert_assignment') {
      return c.json({ error: 'Request is not ready for expert assignment' }, 400);
    }

    // Создать ExpertReview для каждого эксперта
    const expertReviews: string[] = [];
    const now = new Date().toISOString();

    for (const expertEmail of expert_emails) {
      const reviewId = crypto.randomUUID();
      
      const expertReview: ExpertReview = {
        id: reviewId,
        request_id,
        expert_email: expertEmail,
        expert_name: expertEmail.split('@')[0], // temporary
        status: 'assigned',
        mixing_mastering_score: 0,
        arrangement_score: 0,
        originality_score: 0,
        commercial_potential_score: 0,
        overall_score: 0,
        mixing_mastering_feedback: '',
        arrangement_feedback: '',
        originality_feedback: '',
        commercial_potential_feedback: '',
        general_feedback: '',
        recommendations: '',
        reward_points: 50,
        reward_paid: false,
        created_at: now
      };

      await kv.set(`track_test:reviews:${reviewId}`, expertReview);
      expertReviews.push(reviewId);

      // Отправить уведомление эксперту
      console.log(`📧 Notification sent to expert: ${expertEmail}`);
    }

    // Обновить заявку
    request.assigned_experts = expert_emails;
    request.required_expert_count = required_count || expert_emails.length;
    request.status = 'experts_assigned';
    request.updated_at = now;

    await kv.set(`track_test:requests:${request_id}`, request);
    await kv.set(`track_test:request:${request_id}:reviews`, expertReviews);

    console.log(`✅ Assigned ${expert_emails.length} experts to request: ${request_id}`);

    return c.json({
      success: true,
      assigned_experts: expert_emails.length,
      status: 'experts_assigned',
      message: `Successfully assigned ${expert_emails.length} experts`
    });

  } catch (error) {
    console.error('❌ Error assigning experts:', error);
    return c.json({ error: 'Failed to assign experts' }, 500);
  }
});

// =====================================================
// 5. ОТПРАВКА ОЦЕНКИ ЭКСПЕРТОМ
// =====================================================

app.post('/submit-review', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      review_id,
      mixing_mastering_score,
      arrangement_score,
      originality_score,
      commercial_potential_score,
      overall_score,
      mixing_mastering_feedback,
      arrangement_feedback,
      originality_feedback,
      commercial_potential_feedback,
      general_feedback,
      recommendations,
      audio_notes
    } = body;

    // Валидация оценок
    const scores = [
      mixing_mastering_score,
      arrangement_score,
      originality_score,
      commercial_potential_score,
      overall_score
    ];

    for (const score of scores) {
      if (score < 1 || score > 10) {
        return c.json({ error: 'All scores must be between 1 and 10' }, 400);
      }
    }

    const review = await kv.get(`track_test:reviews:${review_id}`);
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }

    // Обновить оценку
    review.status = 'completed';
    review.mixing_mastering_score = mixing_mastering_score;
    review.arrangement_score = arrangement_score;
    review.originality_score = originality_score;
    review.commercial_potential_score = commercial_potential_score;
    review.overall_score = overall_score;
    review.mixing_mastering_feedback = mixing_mastering_feedback;
    review.arrangement_feedback = arrangement_feedback;
    review.originality_feedback = originality_feedback;
    review.commercial_potential_feedback = commercial_potential_feedback;
    review.general_feedback = general_feedback;
    review.recommendations = recommendations;
    review.audio_notes = audio_notes || [];
    review.completed_at = new Date().toISOString();

    // Выплатить награду эксперту (50 коинов)
    review.reward_paid = true;
    await kv.set(`track_test:reviews:${review_id}`, review);

    // Обновить статистику эксперта в KV
    const expertStatsKey = `track_test:expert_stats:${review.expert_email}`;
    const expertStats: any = (await kv.get(expertStatsKey)) || {
      expert_id: review.expert_email,
      total_assigned: 0,
      total_completed: 0,
      total_coins: 0,
      rating_bonus: 0,
    };
    expertStats.total_completed += 1;
    expertStats.total_coins += review.reward_points || 50;
    expertStats.rating_bonus = Number((expertStats.total_completed * 0.05).toFixed(2));
    await kv.set(expertStatsKey, expertStats);

    console.log(`💰 Reward (${review.reward_points} coins) paid to expert: ${review.expert_email}`);

    // Обновить статус заявки
    const request = await kv.get(`track_test:requests:${review.request_id}`);
    if (request) {
      request.completed_reviews_count += 1;
      
      // Если это первая завершенная оценка — статус in_review
      if (request.completed_reviews_count === 1 && request.status === 'experts_assigned') {
        request.status = 'in_review';
      }

      // Если все оценки собраны — генерация анализа
      if (request.completed_reviews_count >= request.required_expert_count) {
        await consolidateReviews(request);
        // Формируем final_analysis
        request.final_analysis = `${request.consolidated_feedback}\n\n${request.consolidated_recommendations}`;
        request.status = 'analysis_generated';
        request.admin_approval_status = 'pending';

        // SSE: уведомить администратора, что анализ готов
        emitSSE('admin-1', {
          type: 'notification',
          data: {
            newStatus: 'approved',
            orderTitle: request.track_title,
            comment: `Анализ трека "${request.track_title}" готов. Все ${request.required_expert_count} экспертов завершили рецензирование.`,
          },
        });
      }

      request.updated_at = new Date().toISOString();
      await kv.set(`track_test:requests:${review.request_id}`, request);
    }

    console.log(`✅ Expert review submitted: ${review_id}`);

    return c.json({
      success: true,
      message: 'Review submitted successfully',
      reward: 50
    });

  } catch (error) {
    console.error('❌ Error submitting review:', error);
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// =====================================================
// 6. КОНСОЛИДАЦИЯ РЕЗУЛЬТАТОВ (автоматическая)
// =====================================================

async function consolidateReviews(request: TrackTestRequest) {
  try {
    const reviewIds = await kv.get(`track_test:request:${request.id}:reviews`) || [];
    const reviews: ExpertReview[] = [];

    for (const reviewId of reviewIds) {
      const review = await kv.get(`track_test:reviews:${reviewId}`);
      if (review && review.status === 'completed') {
        reviews.push(review);
      }
    }

    if (reviews.length === 0) return;

    // Рассчитать средние оценки
    const averages = {
      mixing_mastering: 0,
      arrangement: 0,
      originality: 0,
      commercial_potential: 0,
      overall: 0
    };

    for (const review of reviews) {
      averages.mixing_mastering += review.mixing_mastering_score;
      averages.arrangement += review.arrangement_score;
      averages.originality += review.originality_score;
      averages.commercial_potential += review.commercial_potential_score;
      averages.overall += review.overall_score;
    }

    const count = reviews.length;
    request.category_averages = {
      mixing_mastering: Number((averages.mixing_mastering / count).toFixed(1)),
      arrangement: Number((averages.arrangement / count).toFixed(1)),
      originality: Number((averages.originality / count).toFixed(1)),
      commercial_potential: Number((averages.commercial_potential / count).toFixed(1))
    };
    request.average_rating = Number((averages.overall / count).toFixed(1));

    // Генерация консолидированного фидбека через Anthropic Claude
    const aiResult = await generateConsolidatedAnalysis(request, reviews);
    request.consolidated_feedback = aiResult.feedback;
    request.consolidated_recommendations = aiResult.recommendations;

    console.log(`📊 Reviews consolidated for request: ${request.id}`);

  } catch (error) {
    console.error('❌ Error consolidating reviews:', error);
  }
}

// ── Anthropic Claude Integration ──

async function generateConsolidatedAnalysis(
  request: TrackTestRequest,
  reviews: ExpertReview[]
): Promise<{ feedback: string; recommendations: string }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.log('⚠️ ANTHROPIC_API_KEY not set, falling back to template consolidation');
    return {
      feedback: templateConsolidatedFeedback(reviews),
      recommendations: templateConsolidatedRecommendations(reviews),
    };
  }

  try {
    // Формируем контекст для Claude
    const reviewsSummary = reviews.map((r, i) => {
      let summary = `Эксперт ${i + 1} (${r.expert_name}, ${r.expert_role || 'эксперт'}):\n`;
      summary += `  Сведение/мастеринг: ${r.mixing_mastering_score}/10\n`;
      summary += `  Аранжировка: ${r.arrangement_score}/10\n`;
      summary += `  Оригинальность: ${r.originality_score}/10\n`;
      summary += `  Коммерческий потенциал: ${r.commercial_potential_score}/10\n`;
      summary += `  Общая оценка: ${r.overall_score}/10\n`;
      if (r.general_feedback) summary += `  Комментарий: ${r.general_feedback}\n`;
      if (r.recommendations) summary += `  Рекомендации: ${r.recommendations}\n`;
      if (r.audio_notes && r.audio_notes.length > 0) {
        summary += `  Замечания по таймкодам:\n`;
        r.audio_notes.forEach(n => {
          summary += `    [${n.timestamp}] (${n.category}) ${n.comment}\n`;
        });
      }
      return summary;
    }).join('\n');

    const prompt = `Ты - музыкальный аналитик платформы Promo.music. Проанализируй рецензии экспертов на трек и составь консолидированный отчёт.

Трек: "${request.track_title}" - ${request.artist_name}
Жанр: ${request.genre || 'не указан'}
Средняя оценка: ${request.average_rating}/10
Количество экспертов: ${reviews.length}

Средние оценки по критериям:
- Сведение и мастеринг: ${request.category_averages?.mixing_mastering}/10
- Аранжировка: ${request.category_averages?.arrangement}/10
- Оригинальность: ${request.category_averages?.originality}/10
- Коммерческий потенциал: ${request.category_averages?.commercial_potential}/10

Рецензии экспертов:
${reviewsSummary}

Составь два раздела в формате JSON:
1. "feedback" - развёрнутый анализ трека (3-5 абзацев). Разбери каждый критерий, отметь сильные стороны и зоны роста. Обобщи мнения экспертов, выявляя общие тенденции и различия во мнениях. Пиши на русском языке, профессионально но доступно. Используй эмодзи для заголовков разделов (🎵 🎯 🏆 📈). Используй **жирный текст** для ключевых выводов.
2. "recommendations" - конкретные рекомендации артисту (нумерованный список из 3-7 пунктов). Каждая рекомендация должна быть действенной и конкретной. Начни с заголовка "📝 **Рекомендации экспертов:**".

ВАЖНО: Используй только короткие тире (-), длинные тире (—) запрещены. Ответ строго в формате JSON: {"feedback": "...", "recommendations": "..."}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Anthropic API error (${response.status}): ${errorText}`);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || '';

    // Парсим JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Anthropic consolidation successful');
      return {
        feedback: parsed.feedback || templateConsolidatedFeedback(reviews),
        recommendations: parsed.recommendations || templateConsolidatedRecommendations(reviews),
      };
    }

    throw new Error('Could not parse JSON from Anthropic response');
  } catch (error) {
    console.error('⚠️ Anthropic consolidation failed, using template fallback:', error);
    return {
      feedback: templateConsolidatedFeedback(reviews),
      recommendations: templateConsolidatedRecommendations(reviews),
    };
  }
}

// ── Fallback template generators ──

function templateConsolidatedFeedback(reviews: ExpertReview[]): string {
  // Симуляция AI-генерации
  // В production здесь будет вызов OpenAI/Claude API
  
  let feedback = `На основе оценок ${reviews.length} экспертов:\n\n`;
  
  feedback += '🎵 **Сведение и мастеринг:** Эксперты отметили ';
  const mixingScores = reviews.map(r => r.mixing_mastering_score);
  const avgMixing = mixingScores.reduce((a, b) => a + b, 0) / mixingScores.length;
  
  if (avgMixing >= 8) {
    feedback += 'высокое качество звучания и профессиональный баланс частот.\n\n';
  } else if (avgMixing >= 6) {
    feedback += 'хорошее качество с некоторыми аспектами для улучшения.\n\n';
  } else {
    feedback += 'необходимость доработки сведения и мастеринга.\n\n';
  }

  feedback += '🎯 **Аранжировка:** ';
  const arrScores = reviews.map(r => r.arrangement_score);
  const avgArr = arrScores.reduce((a, b) => a + b, 0) / arrScores.length;
  
  if (avgArr >= 8) {
    feedback += 'Гармоничная структура и продуманная инструментовка.\n\n';
  } else if (avgArr >= 6) {
    feedback += 'Интересные идеи, есть возможности для улучшения структуры.\n\n';
  } else {
    feedback += 'Рекомендуется пересмотреть структуру и аранжировку.\n\n';
  }

  feedback += '🏆 **Оригинальность:** ';
  const origScores = reviews.map(r => r.originality_score);
  const avgOrig = origScores.reduce((a, b) => a + b, 0) / origScores.length;
  
  if (avgOrig >= 8) {
    feedback += 'Уникальное звучание, выделяется среди конкурентов.\n\n';
  } else if (avgOrig >= 6) {
    feedback += 'Приятное звучание с элементами оригинальности.\n\n';
  } else {
    feedback += 'Можно добавить больше уникальных элементов.\n\n';
  }

  feedback += '📈 **Коммерческий потенциал:** ';
  const commScores = reviews.map(r => r.commercial_potential_score);
  const avgComm = commScores.reduce((a, b) => a + b, 0) / commScores.length;
  
  if (avgComm >= 8) {
    feedback += 'Высокий потенциал успеха на рынке.';
  } else if (avgComm >= 6) {
    feedback += 'Хорошие шансы найти свою аудиторию.';
  } else {
    feedback += 'Рекомендуется доработка перед релизом.';
  }

  return feedback;
}

function templateConsolidatedRecommendations(reviews: ExpertReview[]): string {
  let recommendations = '📝 **Общие рекомендации экспертов:**\n\n';
  
  // Собираем ключевые рекомендации
  const allRecommendations = reviews
    .map(r => r.recommendations)
    .filter(r => r && r.trim().length > 0);
  
  if (allRecommendations.length > 0) {
    recommendations += allRecommendations
      .map((rec, index) => `${index + 1}. ${rec}`)
      .join('\n');
  } else {
    recommendations += 'Продолжайте развивать свой уникальный стиль и совершенствовать навыки производства.';
  }

  return recommendations;
}

// =====================================================
// 7. ФИНАЛИЗАЦИЯ И ОТПРАВКА РЕЗУЛЬТАТОВ (администратор)
// =====================================================

app.post('/finalize', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, action, rejection_reason } = body;
    // action: 'approve' | 'reject' (default: 'approve')

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Принимаем заявки в статусе analysis_generated или pending_admin_review (обратная совместимость)
    if (request.status !== 'analysis_generated' && request.status !== 'pending_admin_review') {
      return c.json({ error: `Request is not ready for finalization (current status: ${request.status})` }, 400);
    }

    const now = new Date().toISOString();

    if (action === 'reject') {
      // Админ отклоняет анализ — требует доработки
      request.admin_approval_status = 'rejected';
      request.rejection_reason = rejection_reason || 'Требуется доработка анализа';
      request.status = 'rejected';
      request.updated_at = now;
      await kv.set(`track_test:requests:${request_id}`, request);

      console.log(`❌ Track test analysis rejected: ${request_id}`);

      return c.json({
        success: true,
        status: 'rejected',
        message: 'Analysis rejected by admin',
      });
    }

    // Одобрение — финализация
    request.admin_approval_status = 'approved';
    request.status = 'completed';
    request.completed_at = now;
    request.updated_at = now;

    await kv.set(`track_test:requests:${request_id}`, request);

    console.log(`✅ Track test finalized: ${request_id}`);

    return c.json({
      success: true,
      status: 'completed',
      message: 'Analysis approved. Use /send-feedback to deliver results to artist.',
    });

  } catch (error) {
    console.error('❌ Error finalizing request:', error);
    return c.json({ error: 'Failed to finalize request' }, 500);
  }
});

// =====================================================
// 7a. ОТПРАВКА ОТЧЁТА АРТИСТУ (sendFeedbackToArtist)
// =====================================================

app.post('/send-feedback', async (c) => {
  try {
    const { request_id } = await c.req.json();

    const request = await kv.get(`track_test:requests:${request_id}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    if (request.status !== 'completed') {
      return c.json({ error: 'Request must be completed before sending feedback' }, 400);
    }

    if (request.feedback_sent_date) {
      return c.json({ error: 'Feedback already sent', feedback_sent_date: request.feedback_sent_date }, 400);
    }

    const now = new Date().toISOString();
    request.feedback_sent_date = now;
    request.updated_at = now;

    await kv.set(`track_test:requests:${request_id}`, request);

    // SSE: уведомить артиста о готовом отчёте
    const recipientId = request.user_id;
    if (recipientId) {
      emitSSE(recipientId, {
        type: 'notification',
        data: {
          newStatus: 'approved',
          orderTitle: request.track_title,
          comment: `Отчёт по тесту трека "${request.track_title}" готов! Средняя оценка: ${request.average_rating}/10`,
        },
      });
    }

    const recipient = request.guest_email || request.user_id;
    console.log(`📧 Feedback sent to: ${recipient} at ${now}`);

    return c.json({
      success: true,
      feedback_sent_date: now,
      message: `Feedback sent to ${recipient}`,
    });

  } catch (error) {
    console.error('❌ Error sending feedback:', error);
    return c.json({ error: 'Failed to send feedback' }, 500);
  }
});

// =====================================================
// 8. ПОЛУЧЕНИЕ ДАННЫХ
// =====================================================

// Получить список заявок пользователя
app.get('/requests', async (c) => {
  try {
    const userId = c.req.query('user_id');
    
    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    const requestIds = await kv.get(`track_test:user:${userId}:requests`) || [];
    const requests = [];

    for (const requestId of requestIds) {
      const request = await kv.get(`track_test:requests:${requestId}`);
      if (request) {
        requests.push(request);
      }
    }

    return c.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Получить детали заявки
app.get('/requests/:id', async (c) => {
  try {
    const requestId = c.req.param('id');
    
    const request = await kv.get(`track_test:requests:${requestId}`);
    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Получить все оценки экспертов
    const reviewIds = await kv.get(`track_test:request:${requestId}:reviews`) || [];
    const reviews = [];

    for (const reviewId of reviewIds) {
      const review = await kv.get(`track_test:reviews:${reviewId}`);
      if (review) {
        reviews.push(review);
      }
    }

    return c.json({
      success: true,
      request,
      reviews,
      reviews_count: reviews.length
    });

  } catch (error) {
    console.error('❌ Error fetching request details:', error);
    return c.json({ error: 'Failed to fetch request details' }, 500);
  }
});

// Получить все заявки (для администратора)
app.get('/admin/requests', async (c) => {
  try {
    const status = c.req.query('status');
    const allRequestIds = await kv.get('track_test:all_requests') || [];
    const requests = [];

    for (const requestId of allRequestIds) {
      const request = await kv.get(`track_test:requests:${requestId}`);
      if (request) {
        if (!status || request.status === status) {
          requests.push(request);
        }
      }
    }

    return c.json({
      success: true,
      requests,
      total: requests.length
    });

  } catch (error) {
    console.error('❌ Error fetching admin requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Получить назначенные оценки для эксперта
app.get('/expert/reviews', async (c) => {
  try {
    const expertEmail = c.req.query('email');
    
    if (!expertEmail) {
      return c.json({ error: 'Expert email required' }, 400);
    }

    // Поиск всех оценок для эксперта
    const allRequestIds = await kv.get('track_test:all_requests') || [];
    const expertReviews = [];

    for (const requestId of allRequestIds) {
      const reviewIds = await kv.get(`track_test:request:${requestId}:reviews`) || [];
      
      for (const reviewId of reviewIds) {
        const review = await kv.get(`track_test:reviews:${reviewId}`);
        if (review && review.expert_email === expertEmail) {
          const request = await kv.get(`track_test:requests:${requestId}`);
          expertReviews.push({
            review,
            request
          });
        }
      }
    }

    return c.json({
      success: true,
      reviews: expertReviews,
      total: expertReviews.length
    });

  } catch (error) {
    console.error('❌ Error fetching expert reviews:', error);
    return c.json({ error: 'Failed to fetch expert reviews' }, 500);
  }
});

// =====================================================
// 9. ДОСТУПНЫЕ ТЕСТЫ ДЛЯ ЭКСПЕРТОВ (DJ / Producer / Engineer)
// =====================================================

// Lazy-seed: создаёт демо-заявки на тестирование, если пока нет ни одной
async function ensureDemoTrackTests() {
  const existing = await kv.get('track_test:all_requests');
  if (existing && (existing as string[]).length > 0) return;

  const now = new Date().toISOString();
  const demoTests = [
    { id: 'tt-demo-1', track_title: 'Небо над нами', artist_name: 'Алиса Вокс', genre: 'Pop' },
    { id: 'tt-demo-2', track_title: 'Полёт', artist_name: 'IVAN', genre: 'Electronic' },
    { id: 'tt-demo-3', track_title: 'Midnight Rain', artist_name: 'NovaBeat', genre: 'Lo-Fi' },
    { id: 'tt-demo-4', track_title: 'Гром', artist_name: 'Артём Качер', genre: 'R&B' },
    { id: 'tt-demo-5', track_title: 'Дыши', artist_name: 'Мот', genre: 'Hip-Hop' },
  ];

  const ids: string[] = [];

  for (const t of demoTests) {
    const req = {
      id: t.id,
      user_id: `artist-${t.id}`,
      track_id: `track-${t.id}`,
      track_title: t.track_title,
      artist_name: t.artist_name,
      genre: t.genre,
      status: 'pending_expert_assignment',
      payment_status: 'completed',
      payment_amount: 1000,
      required_expert_count: 5,
      completed_reviews_count: 0,
      assigned_experts: [] as string[],
      created_at: now,
      updated_at: now,
    };
    await kv.set(`track_test:requests:${t.id}`, req);
    ids.push(t.id);
  }

  await kv.set('track_test:all_requests', ids);
  console.log(`✅ Demo track tests lazy-seeded: ${ids.length} items`);
}

app.get('/available-for-review', async (c) => {
  try {
    await ensureDemoTrackTests();

    const allIds = (await kv.get('track_test:all_requests') || []) as string[];
    const expertId = c.req.query('expert_id') || '';
    const available: any[] = [];

    for (const id of allIds) {
      const req: any = await kv.get(`track_test:requests:${id}`);
      if (!req) continue;

      // Тесты, которые ждут экспертов или ещё есть свободные слоты
      if (
        req.status === 'pending_expert_assignment' ||
        (req.status === 'experts_assigned' && (req.assigned_experts || []).length < req.required_expert_count)
      ) {
        // Не показывать тесты, где эксперт уже назначен
        if (expertId && (req.assigned_experts || []).includes(expertId)) continue;
        available.push(req);
      }
    }

    return c.json({ success: true, tests: available, total: available.length });
  } catch (error) {
    console.error('❌ Error fetching available tests:', error);
    return c.json({ error: 'Failed to fetch available tests' }, 500);
  }
});

// =====================================================
// 10. ЭКСПЕРТ БЕРЁТ ТЕСТ В РАБОТУ
// =====================================================

app.post('/claim-review', async (c) => {
  try {
    const { request_id, expert_id, expert_name, expert_role } = await c.req.json();

    if (!request_id || !expert_id) {
      return c.json({ error: 'request_id and expert_id are required' }, 400);
    }

    const req: any = await kv.get(`track_test:requests:${request_id}`);
    if (!req) return c.json({ error: 'Request not found' }, 404);

    if (
      req.status !== 'pending_expert_assignment' &&
      !(req.status === 'experts_assigned' && (req.assigned_experts || []).length < req.required_expert_count)
    ) {
      return c.json({ error: 'This test is not accepting new experts' }, 400);
    }

    if ((req.assigned_experts || []).includes(expert_id)) {
      return c.json({ error: 'You are already assigned to this test' }, 400);
    }

    // Создаём ExpertReview
    const reviewId = crypto.randomUUID();
    const now = new Date().toISOString();

    const expertReview = {
      id: reviewId,
      request_id,
      expert_email: expert_id,
      expert_name: expert_name || expert_id.split('@')[0],
      expert_role: expert_role || 'expert',
      status: 'assigned',
      mixing_mastering_score: 0,
      arrangement_score: 0,
      originality_score: 0,
      commercial_potential_score: 0,
      overall_score: 0,
      mixing_mastering_feedback: '',
      arrangement_feedback: '',
      originality_feedback: '',
      commercial_potential_feedback: '',
      general_feedback: '',
      recommendations: '',
      reward_points: 50,
      reward_paid: false,
      created_at: now,
    };

    await kv.set(`track_test:reviews:${reviewId}`, expertReview);

    // Обновляем список ревью для заявки
    const existingReviewIds = (await kv.get(`track_test:request:${request_id}:reviews`) || []) as string[];
    existingReviewIds.push(reviewId);
    await kv.set(`track_test:request:${request_id}:reviews`, existingReviewIds);

    // Обновляем заявку
    req.assigned_experts = [...(req.assigned_experts || []), expert_id];
    if (req.status === 'pending_expert_assignment') {
      req.status = 'experts_assigned';
    }
    req.updated_at = now;
    await kv.set(`track_test:requests:${request_id}`, req);

    // Обновляем статистику эксперта
    const statsKey = `track_test:expert_stats:${expert_id}`;
    const stats: any = (await kv.get(statsKey)) || {
      expert_id,
      total_assigned: 0,
      total_completed: 0,
      total_coins: 0,
      rating_bonus: 0,
      joined_at: now,
    };
    stats.total_assigned += 1;
    await kv.set(statsKey, stats);

    // Регистрируем эксперта для SSE-рассылок
    const registeredExperts = (await kv.get('track_test:registered_experts') || []) as string[];
    if (!registeredExperts.includes(expert_id)) {
      registeredExperts.push(expert_id);
      await kv.set('track_test:registered_experts', registeredExperts);
    }

    // SSE: уведомить артиста-автора о новом эксперте
    if (req.user_id) {
      emitSSE(req.user_id, {
        type: 'notification',
        data: {
          newStatus: 'in_review',
          orderTitle: req.track_title,
          comment: `Эксперт ${expert_name || 'Эксперт'} взял ваш трек на рецензию`,
        },
      });
    }

    console.log(`✅ Expert ${expert_id} claimed review for request ${request_id}`);

    return c.json({
      success: true,
      review_id: reviewId,
      message: 'Successfully claimed the test for review',
    });
  } catch (error) {
    console.error('❌ Error claiming review:', error);
    return c.json({ error: 'Failed to claim review' }, 500);
  }
});

// =====================================================
// 11. СТАТИСТИКА ЭКСПЕРТА
// =====================================================

app.get('/expert/stats', async (c) => {
  try {
    const expertId = c.req.query('expert_id');
    if (!expertId) return c.json({ error: 'expert_id required' }, 400);

    const statsKey = `track_test:expert_stats:${expertId}`;
    const stats: any = (await kv.get(statsKey)) || {
      expert_id: expertId,
      total_assigned: 0,
      total_completed: 0,
      total_coins: 0,
      rating_bonus: 0,
    };

    // Подсчёт реальных данных из ревью
    const allIds = (await kv.get('track_test:all_requests') || []) as string[];
    let assigned = 0;
    let completed = 0;
    let totalCoins = 0;

    for (const id of allIds) {
      const reviewIds = (await kv.get(`track_test:request:${id}:reviews`) || []) as string[];
      for (const rid of reviewIds) {
        const review: any = await kv.get(`track_test:reviews:${rid}`);
        if (review && review.expert_email === expertId) {
          assigned++;
          if (review.status === 'completed') {
            completed++;
            totalCoins += review.reward_points || 50;
          }
        }
      }
    }

    const ratingBonus = completed * 0.05; // +0.05 к рейтингу за каждый завершённый тест

    return c.json({
      success: true,
      stats: {
        expert_id: expertId,
        total_assigned: assigned,
        total_completed: completed,
        total_coins: totalCoins,
        rating_bonus: Number(ratingBonus.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching expert stats:', error);
    return c.json({ error: 'Failed to fetch expert stats' }, 500);
  }
});

// =====================================================
// 12. РЕВЬЮ ЭКСПЕРТА ПО expert_id (не email)
// =====================================================

app.get('/expert/my-reviews', async (c) => {
  try {
    const expertId = c.req.query('expert_id');
    if (!expertId) return c.json({ error: 'expert_id required' }, 400);

    const allIds = (await kv.get('track_test:all_requests') || []) as string[];
    const myReviews: any[] = [];

    for (const id of allIds) {
      const reviewIds = (await kv.get(`track_test:request:${id}:reviews`) || []) as string[];
      for (const rid of reviewIds) {
        const review: any = await kv.get(`track_test:reviews:${rid}`);
        if (review && review.expert_email === expertId) {
          const request: any = await kv.get(`track_test:requests:${id}`);
          myReviews.push({ review, request });
        }
      }
    }

    return c.json({ success: true, reviews: myReviews, total: myReviews.length });
  } catch (error) {
    console.error('❌ Error fetching my reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

export default app;