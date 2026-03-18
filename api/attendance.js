const pool = require('./db');
const { sendTelegramMessage } = require('./telegram');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { username, lat, lng, image } = req.body;
        
        if (!username || !lat || !lng || !image) {
            return res.status(400).json({ status: false, message: 'Data tidak lengkap (username, lat, lng, image dibutuhkan).' });
        }

        // Cari user yang bersangkutan (cek apakah Guru/Admin)
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (users.length === 0) {
            return res.status(404).json({ status: false, message: 'User tidak ditemukan.' });
        }
        const user = users[0];

        // Koordinat default sekolah (contoh lokasi Monas/Jakarta, ganti di ENV nanti)
        const schoolLat = parseFloat(process.env.SCHOOL_LAT || '-6.200000');
        const schoolLng = parseFloat(process.env.SCHOOL_LNG || '106.816666');
        const allowedRadius = parseFloat(process.env.SCHOOL_RADIUS || '100'); // meters
        
        // Cek Geolocation Distance
        const distance = calculateDistance(lat, lng, schoolLat, schoolLng);
        let statusKeterangan = `Check-in berhasil (${distance.toFixed(2)}m dari sekolah).`;
        let statusValue = 'hadir';

        if (distance > allowedRadius) {
            // Bisa saja ditolak, namun di sini kita catat dengan status khusus.
            statusValue = 'hadir (luar radius)';
            statusKeterangan = `Check-in di luar radius sekolah (${distance.toFixed(2)}m).`;
        }

        // Insert ke tabel attendances
        const tanggalStr = new Date().toISOString().split('T')[0];
        const waktuStr = new Date().toTimeString().split(' ')[0];
        const koordinatStr = `${lat},${lng}`;

        await pool.query(
            'INSERT INTO attendances (user_id, tanggal, waktu_masuk, koordinat_masuk, foto_masuk, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, tanggalStr, waktuStr, koordinatStr, image, statusValue]
        );

        // Notifikasi ke Telegram ke semua grup admin atau admin secara personal
        const [admins] = await pool.query("SELECT telegram_chat_id FROM users WHERE role = 'admin' AND telegram_chat_id IS NOT NULL");
        
        const notificationText = `<b>[ABSENSI GURU]</b>\nNama: <b>${user.nama_lengkap}</b>\nWaktu: ${tanggalStr} ${waktuStr}\nStatus: ${statusValue}\nLokasi GPS: <a href="https://maps.google.com/?q=${lat},${lng}">Lihat Peta</a>`;
        
        for (const admin of admins) {
            if(admin.telegram_chat_id) {
                await sendTelegramMessage(admin.telegram_chat_id, notificationText);
            }
        }
        
        // Notifikasi ke user yg bersangkutan bila punya telegram
        if (user.telegram_chat_id) {
            await sendTelegramMessage(user.telegram_chat_id, `<b>Absensi Berhasil</b>\n${statusKeterangan}`);
        }

        res.status(200).json({ status: true, message: statusKeterangan, distance: distance });

    } catch (error) {
        console.error('Error in /api/attendance:', error);
        res.status(500).json({ status: false, message: 'Server error.', error: error.message });
    }
};

// Haversine formula to calculate meters
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in metres
    const rad = Math.PI / 180;
    const φ1 = lat1 * rad;
    const φ2 = lat2 * rad;
    const Δφ = (lat2 - lat1) * rad;
    const Δλ = (lon2 - lon1) * rad;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}
