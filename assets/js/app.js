// Global Loader Functions
function showLoader() {
  document.getElementById('global-loader')?.classList.remove('hidden');
}
function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => loader.style.display = 'none', 600);
  }
}

// Inject Global Loader HTML on Load
(function injectLoader() {
  if (document.getElementById('global-loader')) return;
  const loaderHTML = `
    <div id="global-loader" class="global-loader">
      <div class="loader-content">
        <img src="${window.location.origin.includes('github.io') || window.location.origin.includes('vercel.app') ? '/assets/img/logo.png' : '../assets/img/logo.png'}" 
             onerror="this.src='/assets/img/logo.png'"
             class="loader-logo" alt="SATNusa">
        <div class="loader-spinner"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', loaderHTML);
  
  // Auto-hide after page is fully loaded
  window.addEventListener('load', () => setTimeout(hideLoader, 800));
  // Fallback
  setTimeout(hideLoader, 3000);
})();

// ============================================================

// ===== Constants =====
const ROLES = { ADMIN: 'admin', GURU: 'guru', MURID: 'murid' };
const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

// ===== School Location Config =====
const SCHOOL_LOCATION = {
  // Koordinat sekolah - ganti sesuai lokasi asli
  lat: -6.200000,
  lng: 106.816666,
  radius: 500, // meter - radius absensi yang diizinkan
  name: 'SMK AbsensiPro',
};

// ===== LocalStorage Helpers =====
const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem(key),

  getUsers: () => DB.get('abs_users') || [],
  setUsers: (u) => DB.set('abs_users', u),
  getStudents: () => DB.get('abs_students') || [],
  setStudents: (s) => DB.set('abs_students', s),
  getClasses: () => DB.get('abs_classes') || [],
  setClasses: (c) => DB.set('abs_classes', c),
  getSchedules: () => DB.get('abs_schedules') || [],
  setSchedules: (s) => DB.set('abs_schedules', s),
  getSessions: () => DB.get('abs_sessions') || [],
  setSessions: (s) => DB.set('abs_sessions', s),
  getAttendances: () => DB.get('abs_attendances') || [],
  setAttendances: (a) => DB.set('abs_attendances', a),
  getPermits: () => DB.get('abs_permits') || [],
  setPermits: (p) => DB.set('abs_permits', p),
  // Guru self-attendance
  getGuruAttendances: () => DB.get('abs_guru_attendances') || [],
  setGuruAttendances: (a) => DB.set('abs_guru_attendances', a),
  // Guru permits (validated by Admin)
  getGuruPermits: () => DB.get('abs_guru_permits') || [],
  setGuruPermits: (p) => DB.set('abs_guru_permits', p),

  getSession: () => DB.get('abs_session_user'),
  setSession: (u) => DB.set('abs_session_user', u),
  clearSession: () => DB.del('abs_session_user'),
};

// ===== Seed Default Data =====
function seedData() {
  if (DB.get('abs_seeded')) return;

  const users = [
    { id: 'u1', role: ROLES.ADMIN, username: 'admin', password: 'admin123', name: 'Administrator', nim: null },
    { id: 'u2', role: ROLES.GURU, username: 'eko.prasetyo', password: 'guru123', name: 'Eko Prasetyo, S.Pd', nim: null, mata_pelajaran: ['Matematika','Fisika'] },
    { id: 'u3', role: ROLES.GURU, username: 'sari.dewi', password: 'guru123', name: 'Sari Dewi, S.Kom', nim: null, mata_pelajaran: ['Pemrograman Web','Basis Data'] },
    { id: 'u4', role: ROLES.GURU, username: 'budi.santoso', password: 'guru123', name: 'Budi Santoso, M.Pd', nim: null, mata_pelajaran: ['Bahasa Indonesia','PKN'] },
  ];

  const classes = [
    { id: 'cls1', name: 'X RPL 1', grade: 'X', jurusan: 'RPL', studentIds: [] },
    { id: 'cls2', name: 'XI RPL 1', grade: 'XI', jurusan: 'RPL', studentIds: [] },
    { id: 'cls3', name: 'XII RPL 1', grade: 'XII', jurusan: 'RPL', studentIds: [] },
    { id: 'cls4', name: 'X TKJ 1', grade: 'X', jurusan: 'TKJ', studentIds: [] },
  ];

  const students = [
    { id: 's1', nim: '2024001', name: 'Ahmad Fauzi', classId: 'cls1', photo: '', createdAt: new Date().toISOString() },
    { id: 's2', nim: '2024002', name: 'Bunga Citra', classId: 'cls1', photo: '', createdAt: new Date().toISOString() },
    { id: 's3', nim: '2024003', name: 'Cahyo Dwi', classId: 'cls2', photo: '', createdAt: new Date().toISOString() },
    { id: 's4', nim: '2024004', name: 'Diana Putri', classId: 'cls2', photo: '', createdAt: new Date().toISOString() },
  ];

  // Add student users
  students.forEach(s => {
    users.push({ id: 'u_' + s.id, role: ROLES.MURID, username: s.nim, password: s.nim, name: s.name, nim: s.nim, studentId: s.id });
  });

  // Update classes with studentIds
  classes[0].studentIds = ['s1','s2'];
  classes[1].studentIds = ['s3','s4'];

  // Schedules: {id, classId, guruId, mapel, day (0-6), jamMulai, jamSelesai}
  const schedules = [
    { id: 'sch1', classId: 'cls1', guruId: 'u2', mapel: 'Matematika', day: 1, jamMulai: '07:00', jamSelesai: '08:30', room: 'R.01' },
    { id: 'sch2', classId: 'cls1', guruId: 'u3', mapel: 'Pemrograman Web', day: 1, jamMulai: '08:30', jamSelesai: '10:00', room: 'Lab 1' },
    { id: 'sch3', classId: 'cls1', guruId: 'u2', mapel: 'Fisika', day: 2, jamMulai: '07:00', jamSelesai: '08:30', room: 'R.01' },
    { id: 'sch4', classId: 'cls1', guruId: 'u4', mapel: 'Bahasa Indonesia', day: 2, jamMulai: '08:30', jamSelesai: '10:00', room: 'R.02' },
    { id: 'sch5', classId: 'cls1', guruId: 'u3', mapel: 'Basis Data', day: 3, jamMulai: '07:00', jamSelesai: '09:00', room: 'Lab 2' },
    { id: 'sch6', classId: 'cls1', guruId: 'u2', mapel: 'Matematika', day: 4, jamMulai: '10:00', jamSelesai: '11:30', room: 'R.01' },
    { id: 'sch7', classId: 'cls2', guruId: 'u2', mapel: 'Fisika', day: 1, jamMulai: '10:00', jamSelesai: '11:30', room: 'R.03' },
    { id: 'sch8', classId: 'cls2', guruId: 'u3', mapel: 'Pemrograman Web', day: 3, jamMulai: '09:00', jamSelesai: '11:00', room: 'Lab 1' },
    { id: 'sch9', classId: 'cls2', guruId: 'u4', mapel: 'PKN', day: 5, jamMulai: '07:00', jamSelesai: '08:30', room: 'R.03' },
  ];

  DB.setUsers(users);
  DB.setStudents(students);
  DB.setClasses(classes);
  DB.setSchedules(schedules);
  DB.setSessions([]);
  DB.setAttendances([]);
  DB.setPermits([]);
  DB.set('abs_seeded', true);
}

// ===== Auth =====
const Auth = {
  login(username, password, role) {
    const users = DB.getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    if (!user) return null;
    DB.setSession(user);
    return user;
  },
  logout() {
    DB.clearSession();
    window.location.href = '/index.html';
  },
  current() { return DB.getSession(); },
  require(role) {
    const user = DB.getSession();
    if (!user) { window.location.href = '../index.html'; return null; }
    if (role && user.role !== role) { window.location.href = '../index.html'; return null; }
    return user;
  },
  requireRoot(role) {
    const user = DB.getSession();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (role && user.role !== role) { window.location.href = 'index.html'; return null; }
    return user;
  }
};

// ===== ID Generator =====
function genId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ===== Toast =====
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div'); el.id = 'toast-container'; document.body.appendChild(el); return el;
  })();
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span>${icons[type] || '●'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; el.style.transition = '0.3s ease'; setTimeout(() => el.remove(), 300); }, 3000);
}

// ===== Date Helpers =====
const DateUtils = {
  today: () => new Date().toISOString().split('T')[0],
  now: () => new Date().toLocaleString('id-ID'),
  format: (iso) => new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }),
  dayName: (d) => DAYS[d],
  currentDay: () => new Date().getDay(),
  currentTime: () => new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
};

// ===== Student Helpers =====
const Students = {
  getAll: () => DB.getStudents(),
  getById: (id) => DB.getStudents().find(s => s.id === id),
  getByNim: (nim) => DB.getStudents().find(s => s.nim === nim),
  getByClass: (classId) => DB.getStudents().filter(s => s.classId === classId),
  add(data) {
    const students = DB.getStudents();
    const student = { id: genId('s'), nim: data.nim, name: data.name, classId: data.classId, photo: data.photo || '', createdAt: new Date().toISOString() };
    students.push(student);
    DB.setStudents(students);
    // Add user account
    const users = DB.getUsers();
    users.push({ id: genId('u'), role: ROLES.MURID, username: student.nim, password: student.nim, name: student.name, nim: student.nim, studentId: student.id });
    DB.setUsers(users);
    // Add to class
    const classes = DB.getClasses();
    const cls = classes.find(c => c.id === data.classId);
    if (cls) { cls.studentIds.push(student.id); DB.setClasses(classes); }
    return student;
  },
  update(id, data) {
    const students = DB.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return false;
    Object.assign(students[idx], data);
    DB.setStudents(students);
    return true;
  },
  delete(id) {
    let students = DB.getStudents();
    const s = students.find(s => s.id === id);
    if (!s) return false;
    students = students.filter(stu => stu.id !== id);
    DB.setStudents(students);
    let users = DB.getUsers();
    users = users.filter(u => u.studentId !== id);
    DB.setUsers(users);
    const classes = DB.getClasses();
    const cls = classes.find(c => c.id === s.classId);
    if (cls) { cls.studentIds = cls.studentIds.filter(sid => sid !== id); DB.setClasses(classes); }
    return true;
  },
  initials: (name) => name ? name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() : '?',
};

// ===== Class Helpers =====
const Classes = {
  getAll: () => DB.getClasses(),
  getById: (id) => DB.getClasses().find(c => c.id === id),
  add(data) {
    const classes = DB.getClasses();
    const cls = { id: genId('cls'), name: data.name, grade: data.grade, jurusan: data.jurusan, studentIds: [] };
    classes.push(cls);
    DB.setClasses(classes);
    return cls;
  },
  delete(id) {
    let classes = DB.getClasses();
    classes = classes.filter(c => c.id !== id);
    DB.setClasses(classes);
  },
};

// ===== Schedule Helpers =====
const Schedules = {
  getAll: () => DB.getSchedules(),
  getByClass: (classId) => DB.getSchedules().filter(s => s.classId === classId),
  getByGuru: (guruId) => DB.getSchedules().filter(s => s.guruId === guruId),
  getByDay: (day) => DB.getSchedules().filter(s => s.day === day),
  add(data) {
    const schedules = DB.getSchedules();
    const sch = { id: genId('sch'), ...data };
    schedules.push(sch);
    DB.setSchedules(schedules);
    return sch;
  },
  update(id, data) {
    const schedules = DB.getSchedules();
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) return false;
    Object.assign(schedules[idx], data);
    DB.setSchedules(schedules);
    return true;
  },
  delete(id) {
    let schedules = DB.getSchedules();
    schedules = schedules.filter(s => s.id !== id);
    DB.setSchedules(schedules);
  },
  todayForGuru: (guruId) => Schedules.getByGuru(guruId).filter(s => s.day === DateUtils.currentDay()).sort((a,b) => a.jamMulai.localeCompare(b.jamMulai)),
};

// ===== Session (Attendance Session) Helpers =====
const Sessions = {
  getAll: () => DB.getSessions(),
  getActive: () => DB.getSessions().filter(s => s.status === 'open'),
  getById: (id) => DB.getSessions().find(s => s.id === id),
  getByClass: (classId) => DB.getSessions().filter(s => s.classId === classId),
  add(data) {
    const sessions = DB.getSessions();
    const session = { id: genId('ses'), status: 'open', createdAt: new Date().toISOString(), ...data };
    sessions.push(session);
    DB.setSessions(sessions);
    return session;
  },
  close(id) {
    const sessions = DB.getSessions();
    const s = sessions.find(s => s.id === id);
    if (s) { s.status = 'closed'; DB.setSessions(sessions); }
  },
};

// ===== Attendance Helpers =====
const Attendances = {
  getAll: () => DB.getAttendances(),
  getBySession: (sessionId) => DB.getAttendances().filter(a => a.sessionId === sessionId),
  getByStudent: (studentId) => DB.getAttendances().filter(a => a.studentId === studentId),
  getByStudentDate: (studentId, date) => DB.getAttendances().filter(a => a.studentId === studentId && a.date === date),
  mark(data) {
    const att = DB.getAttendances();
    const exist = att.findIndex(a => a.sessionId === data.sessionId && a.studentId === data.studentId);
    const record = { id: genId('att'), ...data, markedAt: new Date().toISOString() };
    if (exist >= 0) att[exist] = record;
    else att.push(record);
    DB.setAttendances(att);
    return record;
  },
  summary(studentId) {
    const all = Attendances.getByStudent(studentId);
    return {
      total: all.length,
      hadir: all.filter(a => a.status === 'hadir').length,
      alpha: all.filter(a => a.status === 'alpha').length,
      izin: all.filter(a => a.status === 'izin').length,
      sakit: all.filter(a => a.status === 'sakit').length,
    };
  },
};

// ===== Permit Helpers =====
const Permits = {
  getAll: () => DB.getPermits(),
  getByStudent: (studentId) => DB.getPermits().filter(p => p.studentId === studentId),
  getPending: () => DB.getPermits().filter(p => p.status === 'pending'),
  add(data) {
    const permits = DB.getPermits();
    const permit = { id: genId('per'), status: 'pending', createdAt: new Date().toISOString(), ...data };
    permits.push(permit);
    DB.setPermits(permits);
    return permit;
  },
  approve(id, guruId, guruName) {
    const permits = DB.getPermits();
    const p = permits.find(p => p.id === id);
    if (p) { p.status = 'approved'; p.reviewedBy = guruName; p.reviewedAt = new Date().toISOString(); DB.setPermits(permits); }
  },
  reject(id, guruId, guruName, reason) {
    const permits = DB.getPermits();
    const p = permits.find(p => p.id === id);
    if (p) { p.status = 'rejected'; p.reviewedBy = guruName; p.reviewedAt = new Date().toISOString(); p.rejectReason = reason; DB.setPermits(permits); }
  },
};

// ===== UI Helpers =====
function renderSidebarUser(user) {
  const avatar = user.studentId ? (Students.getById(user.studentId)?.photo || '') : '';
  return `
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">
        ${avatar ? `<img src="${avatar}" alt="">` : Students.initials(user.name)}
      </div>
      <div>
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">${user.role === ROLES.ADMIN ? 'Administrator' : user.role === ROLES.GURU ? 'Guru' : 'Murid'}</div>
      </div>
    </div>
    <button class="btn btn-outline btn-sm btn-logout mt-2" onclick="Auth.logout()">🚪 Keluar</button>
  `;
}

function renderAvatarOrInitials(student, size = '') {
  if (student.photo) return `<img src="${student.photo}" alt="${student.name}" class="avatar ${size}" style="border-radius:50%">`;
  return `<div class="avatar ${size}">${Students.initials(student.name)}</div>`;
}

function updateTopbarDate() {
  const el = document.getElementById('topbar-date');
  if (el) el.textContent = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function confirmDialog(msg, title = 'Konfirmasi') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99999';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.innerHTML = `
      <div class="modal" style="max-width:380px; text-align:center; padding:30px 24px;">
        <div style="font-size:48px; margin-bottom:16px; line-height:1">❓</div>
        <div class="modal-title" style="margin-bottom:8px; font-size:20px">${title}</div>
        <div style="color:var(--text-muted); font-size:14px; margin-bottom:24px; line-height:1.5;">${msg}</div>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button class="btn btn-secondary" id="btn-confirm-no" style="flex:1">Batal</button>
          <button class="btn btn-primary" id="btn-confirm-yes" style="flex:1">Ya, Lanjutkan</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = (val) => {
      overlay.style.opacity = '0';
      overlay.style.transition = '0.2s ease';
      setTimeout(() => overlay.remove(), 200);
      resolve(val);
    };

    overlay.querySelector('#btn-confirm-no').addEventListener('click', () => close(false));
    overlay.querySelector('#btn-confirm-yes').addEventListener('click', () => close(true));
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMapelColor(mapel) {
  const colors = { 
    'Matematika': 'indigo', 'Fisika': 'cyan', 'Pemrograman Web': 'green', 
    'Basis Data': 'yellow', 'Bahasa Indonesia': 'purple', 'PKN': 'red', 
    'Kimia': 'info' 
  };
  return colors[mapel] || 'info';
}

// ===== Guru Self-Attendance Helpers =====
const GuruAttendances = {
  getAll: () => DB.getGuruAttendances(),
  getByGuru: (guruId) => DB.getGuruAttendances().filter(a => a.guruId === guruId),
  getByDate: (date) => DB.getGuruAttendances().filter(a => a.date === date),
  getTodayByGuru: (guruId) => DB.getGuruAttendances().find(a => a.guruId === guruId && a.date === DateUtils.today()),
  checkIn(data) {
    const all = DB.getGuruAttendances();
    const record = {
      id: genId('gatt'),
      guruId: data.guruId,
      guruName: data.guruName,
      date: DateUtils.today(),
      time: DateUtils.currentTime(),
      photo: data.photo || '',
      lat: data.lat || null,
      lng: data.lng || null,
      distance: data.distance || null,
      locationName: data.locationName || '',
      status: 'hadir',
      createdAt: new Date().toISOString(),
    };
    all.push(record);
    DB.setGuruAttendances(all);
    return record;
  },
  summary(guruId) {
    const today = DateUtils.today();
    const currentMonth = today.substring(0, 7);
    const all = GuruAttendances.getByGuru(guruId).filter(a => a.date.startsWith(currentMonth));
    const permits = GuruPermits.getByGuru(guruId).filter(p => p.status === 'approved' && p.dateStart.startsWith(currentMonth));
    const izinDays = permits.reduce((acc, p) => {
      let d = new Date(p.dateStart);
      while (d <= new Date(p.dateEnd)) {
        acc.add(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
      return acc;
    }, new Set());
    return {
      hadir: all.length,
      izin: izinDays.size,
    };
  },
};

// ===== Guru Permit Helpers (validated by Admin) =====
const GuruPermits = {
  getAll: () => DB.getGuruPermits(),
  getByGuru: (guruId) => DB.getGuruPermits().filter(p => p.guruId === guruId),
  getPending: () => DB.getGuruPermits().filter(p => p.status === 'pending'),
  add(data) {
    const permits = DB.getGuruPermits();
    const permit = { id: genId('gper'), status: 'pending', createdAt: new Date().toISOString(), ...data };
    permits.push(permit);
    DB.setGuruPermits(permits);
    return permit;
  },
  approve(id, adminName) {
    const permits = DB.getGuruPermits();
    const p = permits.find(p => p.id === id);
    if (p) { p.status = 'approved'; p.reviewedBy = adminName; p.reviewedAt = new Date().toISOString(); DB.setGuruPermits(permits); }
  },
  reject(id, adminName, reason) {
    const permits = DB.getGuruPermits();
    const p = permits.find(p => p.id === id);
    if (p) { p.status = 'rejected'; p.reviewedBy = adminName; p.reviewedAt = new Date().toISOString(); p.rejectReason = reason; DB.setGuruPermits(permits); }
  },
};

// ===== Geolocation Helpers =====
const GeoUtils = {
  // Haversine formula - calculate distance in meters
  distance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  },
  isInSchoolArea(lat, lng) {
    const dist = GeoUtils.distance(lat, lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
    return { inArea: dist <= SCHOOL_LOCATION.radius, distance: Math.round(dist) };
  },
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation tidak didukung browser ini')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });
  },
};

// ===== Run on load =====
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  updateTopbarDate();
  setInterval(updateTopbarDate, 60000);

  // Setup Responsive Mobile Menu Toggle
  const topbar = document.querySelector('.topbar');
  const sidebar = document.querySelector('.sidebar');
  if (topbar && sidebar) {
    // Inject Hamburger Button
    const btn = document.createElement('button');
    btn.className = 'btn-menu-toggle';
    btn.innerHTML = '☰';
    topbar.insertBefore(btn, topbar.firstChild);

    // Inject Overlay for Mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Event Listeners
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
    
    // Auto-close sidebar on nav click in mobile
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('show');
        }
      });
    });
  }

  // Setup Theme Toggle (Dark/Light Mode)
  if (topbar) {
    const themeBtn = document.createElement('button');
    themeBtn.className = 'btn-theme-toggle';
    themeBtn.innerHTML = '☀️';
    themeBtn.style.cssText = 'background:transparent; border:none; font-size:22px; cursor:pointer; margin-left:12px; transition:0.3s;';
    themeBtn.title = 'Ubah Tema';
    topbar.appendChild(themeBtn);

    // Initial Check
    const savedTheme = localStorage.getItem('abs_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
      themeBtn.innerHTML = '🌙';
    }

    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      themeBtn.innerHTML = isLight ? '🌙' : '☀️';
      localStorage.setItem('abs_theme', isLight ? 'light' : 'dark');
      
      // Animasi muter kecil hehe
      themeBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => themeBtn.style.transform = 'none', 300);
    });
  }
});
