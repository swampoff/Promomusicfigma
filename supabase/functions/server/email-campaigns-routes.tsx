/**
 * EMAIL CAMPAIGNS ROUTES — Система массовых рассылок (аналог SendPulse)
 * CRUD кампаний, сегментация, отправка через SMTP, статистика
 */

import { Hono } from 'npm:hono@4';
import { emailHistoryStore, emailTemplatesStore } from './db.tsx';
import { upsertEmailCampaign, getEmailCampaigns } from './db.tsx';
import { smtpSendEmail, smtpSendBatch } from './smtp-sender.tsx';
import { getAdminClient } from './supabase-client.tsx';
import { vpsListProfiles } from './vps-userdata.tsx';

const app = new Hono();

// ── Store for campaigns (using jsonb KV) ──
// We use the existing email_campaigns table via db.tsx helpers

interface Campaign {
  id: string;
  name: string;
  subject: string;
  html: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused';
  segment: CampaignSegment;
  stats: CampaignStats;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface CampaignSegment {
  roles?: string[];           // artist, dj, venue, producer, radio_station
  registered_after?: string;  // ISO date
  registered_before?: string;
  has_tracks?: boolean;
  has_subscription?: boolean;
  email_verified?: boolean;
  custom_emails?: string[];   // manual list
}

interface CampaignStats {
  total_recipients: number;
  sent: number;
  failed: number;
  opened: number;
  errors: string[];
}

// ── Helpers ──

async function getCampaignById(id: string): Promise<Campaign | null> {
  const campaigns = await getEmailCampaigns('admin');
  return campaigns.find((c: any) => c.id === id) || null;
}

async function saveCampaign(campaign: Campaign): Promise<void> {
  await upsertEmailCampaign(campaign.id, { ...campaign, artist_id: 'admin' });
}

/**
 * Build recipient list based on segment filters
 */
async function getRecipientsBySegment(segment: CampaignSegment): Promise<{ email: string; name: string; role: string }[]> {
  const recipients: { email: string; name: string; role: string }[] = [];

  // If custom emails specified, use them directly
  if (segment.custom_emails && segment.custom_emails.length > 0) {
    for (const email of segment.custom_emails) {
      recipients.push({ email, name: email.split('@')[0], role: 'custom' });
    }
    return recipients;
  }

  // Get users from Supabase Auth
  try {
    const supabase = getAdminClient();
    const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const users = usersData?.users || [];

    // Also get VPS profiles for richer data
    let profiles: Record<string, any> = {};
    try {
      const allProfiles = await vpsListProfiles();
      for (const p of allProfiles) {
        if (p.id) profiles[p.id] = p;
      }
    } catch { /* profiles optional */ }

    for (const user of users) {
      const email = user.email;
      if (!email) continue;

      const meta = user.user_metadata || {};
      const profile = profiles[user.id] || {};
      const role = profile.role || meta.role || 'artist';
      const name = profile.name || meta.name || email.split('@')[0];

      // Apply filters
      if (segment.roles && segment.roles.length > 0) {
        if (!segment.roles.includes(role)) continue;
      }

      if (segment.registered_after) {
        if (new Date(user.created_at) < new Date(segment.registered_after)) continue;
      }

      if (segment.registered_before) {
        if (new Date(user.created_at) > new Date(segment.registered_before)) continue;
      }

      if (segment.email_verified === true) {
        if (!user.email_confirmed_at) continue;
      }

      recipients.push({ email, name, role });
    }
  } catch (err) {
    console.error('[Campaigns] Error fetching users:', err);
  }

  return recipients;
}

// ============================================
// GET /campaigns — List all campaigns
// ============================================
app.get('/campaigns', async (c) => {
  try {
    const campaigns = await getEmailCampaigns('admin');
    // Sort by created_at desc
    campaigns.sort((a: any, b: any) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    return c.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('[Campaigns] List error:', error);
    return c.json({ success: true, data: [] });
  }
});

// ============================================
// GET /campaigns/:id — Get single campaign
// ============================================
app.get('/campaigns/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return c.json({ success: false, error: 'Campaign not found' }, 404);
    return c.json({ success: true, data: campaign });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load campaign' }, 500);
  }
});

// ============================================
// POST /campaigns — Create new campaign
// ============================================
app.post('/campaigns', async (c) => {
  try {
    const body = await c.req.json();
    const { name, subject, html, segment, scheduled_at } = body;

    if (!name || !subject) {
      return c.json({ success: false, error: 'name and subject required' }, 400);
    }

    const id = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const campaign: Campaign = {
      id,
      name,
      subject,
      html: html || '',
      status: scheduled_at ? 'scheduled' : 'draft',
      segment: segment || {},
      stats: { total_recipients: 0, sent: 0, failed: 0, opened: 0, errors: [] },
      scheduled_at,
      created_at: now,
      updated_at: now,
      created_by: 'admin',
    };

    await saveCampaign(campaign);
    return c.json({ success: true, data: campaign });
  } catch (error) {
    console.error('[Campaigns] Create error:', error);
    return c.json({ success: false, error: 'Failed to create campaign' }, 500);
  }
});

// ============================================
// PUT /campaigns/:id — Update campaign
// ============================================
app.put('/campaigns/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await getCampaignById(id);
    if (!existing) return c.json({ success: false, error: 'Campaign not found' }, 404);

    if (existing.status === 'sending') {
      return c.json({ success: false, error: 'Cannot edit campaign while sending' }, 400);
    }

    const body = await c.req.json();
    const updated: Campaign = {
      ...existing,
      ...body,
      id, // prevent id change
      updated_at: new Date().toISOString(),
    };

    await saveCampaign(updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update campaign' }, 500);
  }
});

// ============================================
// DELETE /campaigns/:id — Delete campaign
// ============================================
app.delete('/campaigns/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const existing = await getCampaignById(id);
    if (!existing) return c.json({ success: false, error: 'Campaign not found' }, 404);
    if (existing.status === 'sending') {
      return c.json({ success: false, error: 'Cannot delete while sending' }, 400);
    }

    // Mark as deleted by updating status
    existing.status = 'draft';
    existing.name = `[DELETED] ${existing.name}`;
    await saveCampaign(existing);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete campaign' }, 500);
  }
});

// ============================================
// POST /campaigns/:id/preview — Get recipient count for segment
// ============================================
app.post('/campaigns/:id/preview', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return c.json({ success: false, error: 'Campaign not found' }, 404);

    const recipients = await getRecipientsBySegment(campaign.segment);
    return c.json({
      success: true,
      data: {
        count: recipients.length,
        sample: recipients.slice(0, 10).map(r => ({ email: r.email, name: r.name, role: r.role })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to preview segment' }, 500);
  }
});

// ============================================
// POST /campaigns/:id/test — Send test email
// ============================================
app.post('/campaigns/:id/test', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return c.json({ success: false, error: 'Campaign not found' }, 404);

    const body = await c.req.json();
    const testEmail = body.email;
    if (!testEmail) return c.json({ success: false, error: 'email required' }, 400);

    // Replace template vars with test values
    let html = campaign.html;
    html = html.replace(/\{\{name\}\}/g, 'Тестовый Пользователь');
    html = html.replace(/\{\{email\}\}/g, testEmail);
    html = html.replace(/\{\{role\}\}/g, 'artist');

    const result = await smtpSendEmail({
      to: testEmail,
      subject: `[ТЕСТ] ${campaign.subject}`,
      html,
    });

    return c.json({ success: result.success, error: result.error });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to send test email' }, 500);
  }
});

// ============================================
// POST /campaigns/:id/send — Start campaign sending
// ============================================
app.post('/campaigns/:id/send', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return c.json({ success: false, error: 'Campaign not found' }, 404);

    if (campaign.status === 'sending') {
      return c.json({ success: false, error: 'Campaign already sending' }, 400);
    }
    if (!campaign.html || !campaign.subject) {
      return c.json({ success: false, error: 'Campaign needs subject and HTML body' }, 400);
    }

    // Get recipients
    const recipients = await getRecipientsBySegment(campaign.segment);
    if (recipients.length === 0) {
      return c.json({ success: false, error: 'No recipients match the segment' }, 400);
    }

    // Mark as sending
    campaign.status = 'sending';
    campaign.stats.total_recipients = recipients.length;
    campaign.updated_at = new Date().toISOString();
    await saveCampaign(campaign);

    // Send in background (non-blocking response)
    const sendInBackground = async () => {
      try {
        const result = await smtpSendBatch(
          recipients.map(r => ({
            email: r.email,
            vars: { name: r.name, email: r.email, role: r.role },
          })),
          campaign.subject,
          campaign.html,
          { batchSize: 50, delayMs: 2000 }
        );

        campaign.stats.sent = result.sent;
        campaign.stats.failed = result.failed;
        campaign.stats.errors = result.errors.slice(0, 50); // keep first 50 errors
        campaign.status = result.failed > 0 && result.sent === 0 ? 'failed' : 'sent';
        campaign.sent_at = new Date().toISOString();
        campaign.updated_at = new Date().toISOString();
        await saveCampaign(campaign);

        // Save to email history
        for (const r of recipients) {
          const emailId = `${campaign.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          await emailHistoryStore.set(emailId, {
            id: emailId,
            campaign_id: campaign.id,
            to_email: r.email,
            subject: campaign.subject,
            type: 'campaign',
            status: 'sent',
            sent_at: new Date().toISOString(),
            opened: false,
          });
        }

        console.log(`[Campaigns] Campaign ${id} completed: ${result.sent} sent, ${result.failed} failed`);
      } catch (err) {
        console.error(`[Campaigns] Campaign ${id} send error:`, err);
        campaign.status = 'failed';
        campaign.stats.errors = [String(err)];
        campaign.updated_at = new Date().toISOString();
        await saveCampaign(campaign);
      }
    };

    // Fire and forget
    sendInBackground();

    return c.json({
      success: true,
      data: {
        campaign_id: id,
        status: 'sending',
        recipients_count: recipients.length,
        message: `Отправка начата. ${recipients.length} получателей.`,
      },
    });
  } catch (error) {
    console.error('[Campaigns] Send error:', error);
    return c.json({ success: false, error: 'Failed to start campaign' }, 500);
  }
});

// ============================================
// GET /campaigns/:id/stats — Campaign statistics
// ============================================
app.get('/campaigns/:id/stats', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return c.json({ success: false, error: 'Campaign not found' }, 404);

    return c.json({
      success: true,
      data: {
        ...campaign.stats,
        status: campaign.status,
        open_rate: campaign.stats.sent > 0
          ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1) + '%'
          : '0%',
      },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load stats' }, 500);
  }
});

// ============================================
// GET /segment/preview — Preview segment without campaign
// ============================================
app.post('/segment/preview', async (c) => {
  try {
    const segment = await c.req.json() as CampaignSegment;
    const recipients = await getRecipientsBySegment(segment);
    return c.json({
      success: true,
      data: {
        count: recipients.length,
        sample: recipients.slice(0, 10).map(r => ({ email: r.email, name: r.name, role: r.role })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to preview segment' }, 500);
  }
});

// ============================================
// GET /stats — Overall campaign stats
// ============================================
app.get('/stats', async (c) => {
  try {
    const campaigns = await getEmailCampaigns('admin');
    const total = campaigns.length;
    const sent = campaigns.filter((c: any) => c.status === 'sent').length;
    const drafts = campaigns.filter((c: any) => c.status === 'draft').length;
    const totalEmails = campaigns.reduce((sum: number, c: any) => sum + (c.stats?.sent || 0), 0);
    const totalFailed = campaigns.reduce((sum: number, c: any) => sum + (c.stats?.failed || 0), 0);
    const totalOpened = campaigns.reduce((sum: number, c: any) => sum + (c.stats?.opened || 0), 0);

    return c.json({
      success: true,
      data: {
        total_campaigns: total,
        sent_campaigns: sent,
        draft_campaigns: drafts,
        total_emails_sent: totalEmails,
        total_failed: totalFailed,
        total_opened: totalOpened,
        avg_open_rate: totalEmails > 0 ? ((totalOpened / totalEmails) * 100).toFixed(1) + '%' : '0%',
      },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to load stats' }, 500);
  }
});

export default app;
