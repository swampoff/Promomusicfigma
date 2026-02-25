-- =====================================================
-- SECURITY FIX #7: Add admin role checks to settings functions
-- All writable settings functions now require admin role.
-- get_setting and get_settings_by_category are read-only
-- but still restricted to admin to prevent config leaks.
-- =====================================================

-- get_setting — admin only (may contain sensitive config)
CREATE OR REPLACE FUNCTION get_setting(p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE v_value TEXT;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  SELECT setting_value INTO v_value FROM admin_settings WHERE setting_key = p_key;
  RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- set_setting — admin only
CREATE OR REPLACE FUNCTION set_setting(
  p_key VARCHAR, p_value TEXT, p_changed_by UUID DEFAULT NULL, p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE v_old_value TEXT; v_setting_id UUID;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  SELECT id, setting_value INTO v_setting_id, v_old_value FROM admin_settings WHERE setting_key = p_key;
  IF v_setting_id IS NULL THEN RETURN FALSE; END IF;
  UPDATE admin_settings SET setting_value = p_value, updated_at = NOW() WHERE id = v_setting_id;
  INSERT INTO admin_settings_history (setting_id, old_value, new_value, changed_by, change_reason)
  VALUES (v_setting_id, v_old_value, p_value, COALESCE(p_changed_by, auth.uid()), p_reason);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_settings_by_category — admin only
CREATE OR REPLACE FUNCTION get_settings_by_category(p_category VARCHAR)
RETURNS TABLE (
  setting_key VARCHAR, setting_name VARCHAR, setting_value TEXT,
  setting_type VARCHAR, default_value TEXT, description TEXT,
  is_sensitive BOOLEAN, validation_regex TEXT
) AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  RETURN QUERY SELECT s.setting_key, s.setting_name, s.setting_value,
    s.setting_type, s.default_value, s.description, s.is_sensitive, s.validation_regex
  FROM admin_settings s WHERE s.category = p_category ORDER BY s.sort_order, s.setting_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- export_all_settings — admin only
CREATE OR REPLACE FUNCTION export_all_settings()
RETURNS JSONB AS $$
DECLARE v_settings JSONB;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  SELECT jsonb_object_agg(setting_key, setting_value) INTO v_settings FROM admin_settings;
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- import_settings — admin only
CREATE OR REPLACE FUNCTION import_settings(p_settings JSONB, p_changed_by UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE v_key TEXT; v_value TEXT; v_count INTEGER := 0;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_settings)
  LOOP
    IF set_setting(v_key, v_value, COALESCE(p_changed_by, auth.uid())) THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- apply_preset — admin only
CREATE OR REPLACE FUNCTION apply_preset(p_preset_id UUID, p_changed_by UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE v_settings JSONB;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  SELECT settings INTO v_settings FROM admin_settings_presets WHERE id = p_preset_id;
  IF v_settings IS NULL THEN RAISE EXCEPTION 'Preset not found'; END IF;
  RETURN import_settings(v_settings, COALESCE(p_changed_by, auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reset_settings_to_default — admin only
CREATE OR REPLACE FUNCTION reset_settings_to_default(p_category VARCHAR DEFAULT NULL, p_changed_by UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE v_setting RECORD; v_count INTEGER := 0;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  FOR v_setting IN
    SELECT setting_key, default_value FROM admin_settings
    WHERE (p_category IS NULL OR category = p_category) AND setting_value != default_value
  LOOP
    PERFORM set_setting(v_setting.setting_key, v_setting.default_value, COALESCE(p_changed_by, auth.uid()), 'Reset to default');
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- clear_settings_cache — admin only
CREATE OR REPLACE FUNCTION clear_settings_cache()
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  DELETE FROM admin_settings_cache;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- validate_setting — admin only
CREATE OR REPLACE FUNCTION validate_setting(p_key VARCHAR, p_value TEXT)
RETURNS TABLE (is_valid BOOLEAN, error_message TEXT) AS $$
DECLARE v_setting RECORD;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Unauthorized: admin role required'; END IF;
  SELECT setting_type, validation_regex INTO v_setting FROM admin_settings WHERE setting_key = p_key;
  IF v_setting IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Setting not found'::TEXT;
    RETURN;
  END IF;
  IF v_setting.validation_regex IS NOT NULL AND p_value !~ v_setting.validation_regex THEN
    RETURN QUERY SELECT FALSE, 'Value does not match validation pattern'::TEXT;
    RETURN;
  END IF;
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
