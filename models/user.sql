CREATE TYPE role_enum AS ENUM ('user', 'admin');


CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    avatar VARCHAR(350) DEFAULT NULL,
    role role_enum DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    
);