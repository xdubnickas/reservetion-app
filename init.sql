-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS reservation2_db;
USE reservation2_db;

-- Grant privileges to root user from any host (needed for Docker connections)
GRANT ALL PRIVILEGES ON reservation2_db.* TO 'root'@'%' IDENTIFIED BY 'strongpassworduiqwei89';
FLUSH PRIVILEGES;