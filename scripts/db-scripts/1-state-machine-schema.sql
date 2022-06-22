
create type CONTEXT_TYPE as enum (
    'state-machine',
    'state',
    'activity'
);

CREATE TABLE context (
    context_id VARCHAR(512) PRIMARY KEY,
    context_type CONTEXT_TYPE,
    description TEXT
);
comment on table context is 'context definition';

CREATE TABLE context_property (
    context_id VARCHAR(512) NOT NULL,
    property_name VARCHAR(512) NOT NULL,
    property_value TEXT,
    PRIMARY KEY (context_id, property_name)
);
comment on table context_property is 'context properties';


