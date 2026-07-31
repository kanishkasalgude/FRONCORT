-- Migration: enforce_append_only_audit
-- To rollback this migration during development, run the following SQL:
-- DROP TRIGGER IF EXISTS enforce_append_only_audit ON "AuditLog";
-- DROP FUNCTION IF EXISTS prevent_audit_update_delete();

CREATE OR REPLACE FUNCTION prevent_audit_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'AuditLog is append-only. Updates and deletions are not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_append_only_audit ON "AuditLog";

CREATE TRIGGER enforce_append_only_audit
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_update_delete();
