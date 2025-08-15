-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100)
);

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    maternal_surname VARCHAR(50),
    phone VARCHAR(15),
    profile_picture VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Create user_roles table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create courses table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    credits INT,
    academic_period VARCHAR(20),
    group_number VARCHAR(10),
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    instructor_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create course_units table
CREATE TABLE course_units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    unit_order INT NOT NULL,
    course_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create course enrollments table
CREATE TABLE course_enrollments (
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date TIMESTAMP NOT NULL,
    max_points INT,
    submission_type ENUM('FILE', 'TEXT', 'BOTH') NOT NULL DEFAULT 'FILE',
    max_file_size BIGINT DEFAULT 10485760,
    allowed_extensions VARCHAR(200),
    status ENUM('ACTIVE', 'INACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    course_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create assignment_submissions table
CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_text TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(200),
    grade DOUBLE,
    feedback TEXT,
    status ENUM('SUBMITTED', 'GRADED', 'LATE') NOT NULL DEFAULT 'SUBMITTED',
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create exams table
CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    exam_type ENUM('PARCIAL', 'FINAL', 'SUSTITUTORIO', 'EXTRAORDINARIO') NOT NULL DEFAULT 'PARCIAL',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    max_points INT,
    passing_grade DOUBLE,
    instructions TEXT,
    status ENUM('DRAFT', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    course_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create exam_grades table
CREATE TABLE exam_grades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grade DOUBLE,
    feedback TEXT,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'GRADED') NOT NULL DEFAULT 'NOT_STARTED',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create forums table
CREATE TABLE forums (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    forum_type ENUM('GENERAL', 'ACADEMIC', 'TECHNICAL', 'SOCIAL') NOT NULL DEFAULT 'GENERAL',
    status ENUM('ACTIVE', 'INACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    course_id BIGINT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity TIMESTAMP NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create forum_posts table
CREATE TABLE forum_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    forum_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    parent_post_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
);

-- Create calendar_events table
CREATE TABLE calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_type ENUM('CLASS', 'EXAM', 'ASSIGNMENT_DUE', 'MEETING', 'OTHER') NOT NULL DEFAULT 'OTHER',
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(200),
    is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
    meeting_url VARCHAR(500),
    course_id BIGINT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create video_conferences table
CREATE TABLE video_conferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    scheduled_time TIMESTAMP NOT NULL,
    duration INT NOT NULL,
    platform ENUM('ZOOM', 'MEET', 'TEAMS', 'CUSTOM') NOT NULL DEFAULT 'ZOOM',
    meeting_url VARCHAR(500) NOT NULL,
    meeting_id VARCHAR(50),
    meeting_password VARCHAR(50),
    recording_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    waiting_room BOOLEAN NOT NULL DEFAULT TRUE,
    max_participants INT DEFAULT 100,
    status ENUM('SCHEDULED', 'LIVE', 'ENDED') NOT NULL DEFAULT 'SCHEDULED',
    course_id BIGINT,
    host_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create announcements table
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(300),
    priority ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    views_count INT DEFAULT 0,
    course_id BIGINT,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Administrador del sistema'),
('INSTRUCTOR', 'Instructor/Profesor'),
('STUDENT', 'Estudiante'),
('COORDINATOR', 'Coordinador académico');

-- Insert default admin user (password is 'admin123')
INSERT INTO users (user_code, username, email, password, first_name, last_name) VALUES 
('ADMIN001', 'admin', 'admin@aulavirtual.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Administrador', 'Sistema');

-- Assign admin role to default admin user
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_code ON users(user_code);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_exams_course ON exams(course_id);
CREATE INDEX idx_exams_start_time ON exams(start_time);
CREATE INDEX idx_forums_course ON forums(course_id);
CREATE INDEX idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_datetime);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_published ON announcements(published_at);
