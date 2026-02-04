/**
 * ELEVENLABS TTS INTEGRATION
 * Генерация аудио контента через ElevenLabs API
 * 
 * Endpoints:
 * - POST /generate - Генерация аудио из текста
 * - GET /voices - Список доступных голосов
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv-utils.tsx';

const app = new Hono();

// ElevenLabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice IDs (ElevenLabs voices)
const VOICE_IDS = {
  neutral: '21m00Tcm4TlvDq8ikWAM', // Rachel (neutral)
  professional: 'AZnzlk1XvdvUeBnXmlld', // Domi (professional)
  energetic: 'EXAVITQu4vr4xnSDxMaL', // Bella (energetic)
  calm: 'ErXwobaYiN019PkySvjV', // Antoni (calm)
  friendly: 'MF3mGyEYCl7XYWbV9V6O', // Elli (friendly)
};

// Voice settings for different styles
const STYLE_SETTINGS = {
  professional: {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
  },
  energetic: {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.7,
    use_speaker_boost: true,
  },
  calm: {
    stability: 0.9,
    similarity_boost: 0.7,
    style: 0.3,
    use_speaker_boost: true,
  },
  friendly: {
    stability: 0.65,
    similarity_boost: 0.75,
    style: 0.6,
    use_speaker_boost: true,
  },
};

/**
 * POST /generate
 * Генерирует аудио через ElevenLabs и сохраняет в Storage
 */
app.post('/generate', async (c) => {
  try {
    const { orderId, customText } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, error: 'Order ID is required' }, 400);
    }

    console.log('🎙️ Generating audio for order:', orderId);

    // Получаем заказ из KV
    const order = await kv.get(`content_order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    // Проверяем API ключ
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY secret.' 
      }, 500);
    }

    // Используем кастомный текст если передан, иначе текст из заказа
    const textToGenerate = customText || order.text;
    console.log('📝 Text to generate:', textToGenerate.slice(0, 100));

    // Определяем voice ID
    const voiceId = VOICE_IDS[order.voiceType] || VOICE_IDS.neutral;
    
    // Определяем настройки стиля
    const voiceSettings = STYLE_SETTINGS[order.style] || STYLE_SETTINGS.professional;

    console.log('🎵 Using voice:', voiceId, 'with style:', order.style);

    // Отправляем запрос в ElevenLabs
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: textToGenerate,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', errorText);
      return c.json({ 
        success: false, 
        error: `ElevenLabs API error: ${response.status} - ${errorText}` 
      }, 500);
    }

    // Получаем аудио данные
    const audioData = await response.arrayBuffer();
    console.log('✅ Audio generated, size:', audioData.byteLength, 'bytes');

    // Сохраняем в Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Создаем bucket если не существует
    const bucketName = 'make-84730125-content';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('📦 Creating storage bucket:', bucketName);
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    // Генерируем имя файла
    const timestamp = Date.now();
    const fileName = `${order.contentType}/${orderId}_${timestamp}.mp3`;

    console.log('💾 Uploading to storage:', fileName);

    // Загружаем файл
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      return c.json({ success: false, error: uploadError.message }, 500);
    }

    console.log('✅ File uploaded:', uploadData.path);

    // Создаем signed URL (действителен 1 год)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 365 days

    if (signedUrlError) {
      console.error('❌ Signed URL error:', signedUrlError);
      return c.json({ success: false, error: signedUrlError.message }, 500);
    }

    const audioUrl = signedUrlData.signedUrl;
    console.log('🔗 Signed URL created');

    // Обновляем заказ
    const updatedOrder = {
      ...order,
      status: 'processing',
      audioUrl,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`content_order:${orderId}`, updatedOrder);

    console.log('✅ Order updated with audio URL');

    return c.json({
      success: true,
      order: updatedOrder,
      audioUrl,
      message: 'Audio generated successfully',
    });

  } catch (error) {
    console.error('❌ Error generating audio:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * GET /voices
 * Получает список доступных голосов
 */
app.get('/voices', async (c) => {
  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'ElevenLabs API key not configured' 
      }, 500);
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    const data = await response.json();
    
    return c.json({
      success: true,
      voices: data.voices,
    });

  } catch (error) {
    console.error('❌ Error fetching voices:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;
