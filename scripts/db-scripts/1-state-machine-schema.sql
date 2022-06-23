
CREATE TABLE context (
    context_id VARCHAR(512) PRIMARY KEY,
    context_type VARCHAR(128),
    description TEXT,
    last_update_time TIMESTAMPTZ default now()
);
comment on table context is 'context definition';

CREATE TABLE context_property (
    context_id VARCHAR(512) NOT NULL REFERENCES context(context_id),
    property_name VARCHAR(512) NOT NULL,
    property_value TEXT,
    last_update_time TIMESTAMPTZ default now(),
    PRIMARY KEY (context_id, property_name)
);
comment on table context_property is 'context properties';

CREATE OR REPLACE FUNCTION update_last_update_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update_time = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_context_property_timestamp BEFORE UPDATE ON context_property FOR EACH ROW EXECUTE PROCEDURE update_last_update_time();

CREATE TRIGGER update_context_timestamp BEFORE UPDATE ON context FOR EACH ROW EXECUTE PROCEDURE update_last_update_time();

