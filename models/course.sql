CREATE TYPE level_enum AS ENUM ('easy', 'intermediate', 'expert');

CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(600) DEFAULT NULL,
    banner VARCHAR(300) DEFAULT NULL,
    url VARCHAR(300) DEFAULT NULL,
    rating FLOAT DEFAULT 0.0,
    level level_enum DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id VARCHAR(50) REFERENCES category(id),
    author VARCHAR(50) REFERENCES user(user_id)
)