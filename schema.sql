CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guru', 'murid') NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    telegram_chat_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tanggal DATE NOT NULL,
    waktu_masuk TIME NOT NULL,
    koordinat_masuk VARCHAR(255) NOT NULL,
    foto_masuk LONGTEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'hadir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipe ENUM('izin', 'sakit', 'cuti') NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NULL,
    alasan TEXT NOT NULL,
    bukti_lampiran LONGTEXT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default Admin
INSERT INTO users (username, password, role, nama_lengkap) 
VALUES ('admin', 'admin123', 'admin', 'Administrator Sistem')
ON DUPLICATE KEY UPDATE username=username;

-- Default Guru
INSERT INTO users (username, password, role, nama_lengkap) 
VALUES ('guru1', 'guru123', 'guru', 'Budi Santoso')
ON DUPLICATE KEY UPDATE username=username;
