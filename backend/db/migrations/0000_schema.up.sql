CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id uuid DEFAULT uuid_generate_v4(),
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR UNIQUE,
    password bytea NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE auth_tokens (
    id uuid DEFAULT uuid_generate_v4(),
    userID uuid NOT NULL,
    token VARCHAR NOT NULL,
    refresh_token VARCHAR NOT NULL,
    expiry timestamp NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userID) REFERENCES users(id)
);

CREATE TABLE leaderboards (
    id uuid DEFAULT uuid_generate_v4(),
    time timestamp NOT NULL,
    userid uuid NOT NULL,
    mode VARCHAR NOT NULL,
    number_of_questions int NOT NULL,
    score int NOT NULL,
    posts jsonb NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (userID) REFERENCES users(id)
);
