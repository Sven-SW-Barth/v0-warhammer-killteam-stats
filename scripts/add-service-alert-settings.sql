-- Add service alert settings to system_settings table
INSERT INTO system_settings (key, value, updated_at)
VALUES 
  ('service_alert_enabled', 'false', NOW()),
  ('service_alert_severity', 'low', NOW())
ON CONFLICT (key) DO NOTHING;
