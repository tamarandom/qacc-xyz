-- Step 1: Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'regular';
    END IF;
END
$$;

-- Step 2: Update all existing users with 'regular' role and reset password
UPDATE users SET role = 'regular', password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy';

-- Step 3: Set the 'admin' user to admin role (or create if doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        UPDATE users SET role = 'admin', password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy' 
        WHERE username = 'admin';
    ELSE
        INSERT INTO users (username, email, password, role, wallet_balance) 
        VALUES ('admin', 'admin@qacc.io', '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', 'admin', 50000);
    END IF;
END
$$;

-- Step 4: Create project owner users for each project
DO $$
DECLARE
    project_record RECORD;
    owner_username TEXT;
BEGIN
    FOR project_record IN SELECT id, name FROM projects LOOP
        owner_username := LOWER(REGEXP_REPLACE(project_record.name, '[^a-zA-Z0-9]', '', 'g')) || '_owner';

        IF EXISTS (SELECT 1 FROM users WHERE username = owner_username) THEN
            UPDATE users SET role = 'project_owner', password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy'
            WHERE username = owner_username;
        ELSE
            INSERT INTO users (username, email, password, role, wallet_balance)
            VALUES (
                owner_username, 
                owner_username || '@qacc.io', 
                '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy',
                'project_owner',
                50000
            );
        END IF;
    END LOOP;
END
$$;

-- Step 5: Create three regular users if they don't exist
DO $$
BEGIN
    -- User 1
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1') THEN
        INSERT INTO users (username, email, password, role, wallet_balance)
        VALUES ('user1', 'user1@qacc.io', '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', 'regular', 50000);
    ELSE
        UPDATE users SET password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', role = 'regular'
        WHERE username = 'user1';
    END IF;

    -- User 2
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'user2') THEN
        INSERT INTO users (username, email, password, role, wallet_balance)
        VALUES ('user2', 'user2@qacc.io', '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', 'regular', 50000);
    ELSE
        UPDATE users SET password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', role = 'regular'
        WHERE username = 'user2';
    END IF;

    -- User 3
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'user3') THEN
        INSERT INTO users (username, email, password, role, wallet_balance)
        VALUES ('user3', 'user3@qacc.io', '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', 'regular',
        50000);
    ELSE
        UPDATE users SET password = '$2a$10$JjfWdN9dBYRVHC.XYw1bZe8O/kT3rDuygJt4xUJHqMECnlRSAu2wy', role = 'regular'
        WHERE username = 'user3';
    END IF;
END
$$;

-- List all users with their roles
SELECT id, username, email, role FROM users ORDER BY role, username;