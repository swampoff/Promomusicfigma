-- =====================================================
-- SECURITY FIX #4: Enable RLS on ALL unprotected tables
-- + basic policies for owner-based access
-- =====================================================

-- Helper reused from fix #3
-- CREATE OR REPLACE FUNCTION is_admin() already exists

-- =====================================================
-- FINANCIAL TABLES (CRITICAL)
-- =====================================================

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_methods_select_own ON payment_methods FOR SELECT USING (user_id = auth.uid());
CREATE POLICY payment_methods_insert_own ON payment_methods FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY payment_methods_update_own ON payment_methods FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY payment_methods_delete_own ON payment_methods FOR DELETE USING (user_id = auth.uid());
CREATE POLICY payment_methods_admin ON payment_methods FOR ALL USING (is_admin());

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_select_own ON invoices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY invoices_admin ON invoices FOR ALL USING (is_admin());

ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_select_own ON user_wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY wallets_admin ON user_wallets FOR ALL USING (is_admin());

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY payouts_select_own ON payout_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY payouts_insert_own ON payout_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY payouts_admin ON payout_requests FOR ALL USING (is_admin());

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY credits_select_own ON user_credits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY credits_admin ON user_credits FOR ALL USING (is_admin());

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY discount_codes_admin ON discount_codes FOR ALL USING (is_admin());
CREATE POLICY discount_codes_read ON discount_codes FOR SELECT USING (is_active = true);

ALTER TABLE discount_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY discount_usages_own ON discount_usages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY discount_usages_admin ON discount_usages FOR ALL USING (is_admin());

-- =====================================================
-- PITCHING TABLES
-- =====================================================

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY playlists_select_own ON playlists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY playlists_insert_own ON playlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY playlists_update_own ON playlists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY playlists_admin ON playlists FOR ALL USING (is_admin());

ALTER TABLE pitch_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY pitch_analytics_own ON pitch_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM pitches p WHERE p.id = pitch_id AND p.artist_id = auth.uid())
);
CREATE POLICY pitch_analytics_admin ON pitch_analytics FOR ALL USING (is_admin());

ALTER TABLE pitch_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY pitch_messages_own ON pitch_messages FOR SELECT USING (sender_id = auth.uid());
CREATE POLICY pitch_messages_insert ON pitch_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY pitch_messages_admin ON pitch_messages FOR ALL USING (is_admin());

ALTER TABLE pitch_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY pitch_reviews_own ON pitch_reviews FOR SELECT USING (
  reviewer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM pitches p WHERE p.id = pitch_id AND p.artist_id = auth.uid())
);
CREATE POLICY pitch_reviews_admin ON pitch_reviews FOR ALL USING (is_admin());

ALTER TABLE playlist_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY playlist_stats_own ON playlist_statistics FOR SELECT USING (
  EXISTS (SELECT 1 FROM playlists pl WHERE pl.id = playlist_id AND pl.user_id = auth.uid())
);
CREATE POLICY playlist_stats_admin ON playlist_statistics FOR ALL USING (is_admin());

-- =====================================================
-- USER MODULE TABLES
-- =====================================================

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_own ON user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY sessions_admin ON user_sessions FOR ALL USING (is_admin());

ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_own ON user_permissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY permissions_admin ON user_permissions FOR ALL USING (is_admin());

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_select_own ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY settings_update_own ON user_settings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY settings_insert_own ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY settings_admin ON user_settings FOR ALL USING (is_admin());

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_own ON user_activity_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY activity_insert ON user_activity_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY activity_admin ON user_activity_log FOR ALL USING (is_admin());

ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_own ON user_referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY referrals_admin ON user_referrals FOR ALL USING (is_admin());

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY badges_own ON user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY badges_admin ON user_badges FOR ALL USING (is_admin());

-- =====================================================
-- PARTNER/SUPPORT TABLES
-- =====================================================

ALTER TABLE partner_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY clicks_own ON partner_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid())
);
CREATE POLICY clicks_admin ON partner_clicks FOR ALL USING (is_admin());

ALTER TABLE support_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_admin ON support_templates FOR ALL USING (is_admin());
CREATE POLICY templates_read ON support_templates FOR SELECT USING (true);

ALTER TABLE support_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY kb_admin ON support_knowledge_base FOR ALL USING (is_admin());
CREATE POLICY kb_read ON support_knowledge_base FOR SELECT USING (true);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_admin ON email_queue FOR ALL USING (is_admin());

-- =====================================================
-- ANALYTICS/SYSTEM TABLES (admin-only)
-- =====================================================

ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_analytics_admin ON daily_analytics FOR ALL USING (is_admin());

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_analytics_own ON user_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_analytics_admin ON user_analytics FOR ALL USING (is_admin());

ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_metrics_admin ON platform_metrics FOR ALL USING (is_admin());

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_campaigns_admin ON email_campaigns FOR ALL USING (is_admin());

ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_recipients_admin ON campaign_recipients FOR ALL USING (is_admin());

ALTER TABLE marketing_automation ENABLE ROW LEVEL SECURITY;
CREATE POLICY marketing_automation_admin ON marketing_automation FOR ALL USING (is_admin());

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_logs_admin ON system_logs FOR ALL USING (is_admin());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_admin ON audit_logs FOR ALL USING (is_admin());

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_keys_own ON api_keys FOR SELECT USING (user_id = auth.uid());
CREATE POLICY api_keys_admin ON api_keys FOR ALL USING (is_admin());

ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_requests_admin ON api_requests FOR ALL USING (is_admin());

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_read ON feature_flags FOR SELECT USING (true);
CREATE POLICY feature_flags_admin ON feature_flags FOR ALL USING (is_admin());

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhooks_own ON webhooks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY webhooks_admin ON webhooks FOR ALL USING (is_admin());

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_deliveries_admin ON webhook_deliveries FOR ALL USING (is_admin());

-- =====================================================
-- RADIO TABLES
-- =====================================================

ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_stations_read ON radio_stations FOR SELECT USING (true);
CREATE POLICY radio_stations_own ON radio_stations FOR ALL USING (owner_id = auth.uid());
CREATE POLICY radio_stations_admin ON radio_stations FOR ALL USING (is_admin());

ALTER TABLE radio_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_playlists_read ON radio_playlists FOR SELECT USING (true);
CREATE POLICY radio_playlists_admin ON radio_playlists FOR ALL USING (is_admin());

ALTER TABLE radio_rotation ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_rotation_read ON radio_rotation FOR SELECT USING (true);
CREATE POLICY radio_rotation_admin ON radio_rotation FOR ALL USING (is_admin());

ALTER TABLE radio_track_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_requests_own ON radio_track_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY radio_requests_insert ON radio_track_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY radio_requests_admin ON radio_track_requests FOR ALL USING (is_admin());

ALTER TABLE radio_shows ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_shows_read ON radio_shows FOR SELECT USING (true);
CREATE POLICY radio_shows_admin ON radio_shows FOR ALL USING (is_admin());

ALTER TABLE radio_show_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_episodes_read ON radio_show_episodes FOR SELECT USING (true);
CREATE POLICY radio_episodes_admin ON radio_show_episodes FOR ALL USING (is_admin());

ALTER TABLE radio_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_stats_admin ON radio_statistics FOR ALL USING (is_admin());

ALTER TABLE radio_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_ads_admin ON radio_ads FOR ALL USING (is_admin());

ALTER TABLE radio_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY radio_reviews_read ON radio_reviews FOR SELECT USING (true);
CREATE POLICY radio_reviews_insert ON radio_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY radio_reviews_admin ON radio_reviews FOR ALL USING (is_admin());

-- =====================================================
-- VENUE TABLES
-- =====================================================

ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY venue_profiles_read ON venue_profiles FOR SELECT USING (true);
CREATE POLICY venue_profiles_own ON venue_profiles FOR ALL USING (owner_id = auth.uid());
CREATE POLICY venue_profiles_admin ON venue_profiles FOR ALL USING (is_admin());

ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY venue_staff_own ON venue_staff FOR SELECT USING (user_id = auth.uid());
CREATE POLICY venue_staff_admin ON venue_staff FOR ALL USING (is_admin());

ALTER TABLE venue_playback_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY venue_playback_read ON venue_playback_status FOR SELECT USING (true);
CREATE POLICY venue_playback_admin ON venue_playback_status FOR ALL USING (is_admin());

ALTER TABLE venue_analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY venue_analytics_admin ON venue_analytics_daily FOR ALL USING (is_admin());
