-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS reservation2_db;
USE reservation2_db;

-- Create user if it doesn't exist and set password
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'strongpassworduiqwei89';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON reservation2_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
