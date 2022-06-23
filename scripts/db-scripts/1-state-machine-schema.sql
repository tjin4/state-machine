
CREATE TABLE context (
    context_id VARCHAR(512) PRIMARY KEY,
    context_type VARCHAR(128),
    description TEXT,
    last_update_time TIMESTAMP default now()
);
comment on table context is 'context definition';

CREATE TABLE context_property (
    context_id VARCHAR(512) NOT NULL REFERENCES context(context_id),
    property_name VARCHAR(512) NOT NULL,
    property_value TEXT,
    last_update_time TIMESTAMP default now(),
    PRIMARY KEY (context_id, property_name)
);
comment on table context_property is 'context properties';


