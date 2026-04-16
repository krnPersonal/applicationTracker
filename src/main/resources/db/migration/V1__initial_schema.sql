CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    title VARCHAR(255) NULL,
    profile_image_file_name VARCHAR(255) NULL,
    profile_image_storage_name VARCHAR(255) NULL,
    profile_image_path VARCHAR(255) NULL,
    profile_image_content_type VARCHAR(255) NULL,
    profile_image_size BIGINT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    applied_date DATE NULL,
    work_type VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    cover_letter VARCHAR(5000) NULL,
    years_experience INT NOT NULL,
    available_from DATE NULL,
    salary_expectation INT NULL,
    notes VARCHAR(5000) NULL,
    portfolio_url VARCHAR(1000) NULL,
    linkedin_url VARCHAR(1000) NULL,
    remote_ok BIT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    user_id BIGINT NOT NULL,
    resume_file_name VARCHAR(255) NULL,
    resume_storage_name VARCHAR(255) NULL,
    resume_path VARCHAR(255) NULL,
    resume_content_type VARCHAR(255) NULL,
    resume_size BIGINT NULL,
    resume_category VARCHAR(255) NULL,
    resume_subcategory VARCHAR(255) NULL,
    resume_uploaded_at DATETIME(6) NULL,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
