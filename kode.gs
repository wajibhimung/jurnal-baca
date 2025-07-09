// =================================================================
//          APLIKASI JURNAL BACA - BACKEND (Google Apps Script)
// =================================================================

// --- KONFIGURASI ---
// Ganti dengan ID Spreadsheet Anda jika berbeda
const SPREADSHEET_ID = "1fjIdB8Px8fZNRMexu_v8iKbAtJKopYprvYD7H8GT8LE"; 
const SHEET_GURU = "Guru";
const SHEET_SISWA = "Siswa";
const SHEET_KELAS = "Kelas";
const SHEET_JURNAL = "Jurnal";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// =================================================================
//          ROUTER UTAMA (Endpoint API)
// =================================================================

/**
 * Fungsi utama yang menangani semua permintaan POST dari frontend.
 * Berfungsi sebagai router API.
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const data = request.data;
    let result;

    // Router untuk menentukan fungsi mana yang akan dijalankan
    switch (action) {
      // --- Otentikasi ---
      case 'login':
        result = login(data.email, data.password, data.role);
        break;
      
      // --- Dasbor Siswa ---
      case 'getStudentDashboardData':
        result = getStudentDashboardData(data.emailSiswa);
        break;
      
      // --- Dasbor Guru ---
      case 'getTeacherDashboardData':
        result = getTeacherDashboardData();
        break;
      
      // --- CRUD Jurnal ---
      case 'addJournal': result = addJournal(data); break;
      case 'updateJournal': result = updateJournal(data); break;
      case 'deleteJournal': result = deleteJournal(data.idJurnal); break;
      
      // --- CRUD Kelas ---
      case 'addClass': result = addClass(data.className); break;
      case 'deleteClass': result = deleteClass(data.className); break;
      
      // --- CRUD Siswa ---
      case 'addStudent': result = addStudent(data); break;
      case 'updateStudent': result = updateStudent(data); break;
      case 'deleteStudent': result = deleteStudent(data.idSiswa); break;
      
      default:
        throw new Error("Aksi tidak valid: " + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: "Terjadi kesalahan di server: " + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
//          FUNGSI-FUNGSI HELPER
// =================================================================

/**
 * Fungsi untuk menangani login user (Guru atau Siswa).
 */
function login(email, password, role) {
  const sheetName = (role === 'siswa') ? SHEET_SISWA : SHEET_GURU;
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const userEmail = (role === 'siswa') ? row[2] : row[0]; // Kolom C untuk siswa, A untuk guru
    const userPassword = (role === 'siswa') ? row[3] : row[2]; // Kolom D untuk siswa, C untuk guru

    if (userEmail && userEmail.toLowerCase() === email.toLowerCase() && userPassword == password) {
      let userData = (role === 'siswa') 
        ? { idSiswa: row[0], nama: row[1], email: row[2], kelas: row[4] }
        : { nama: row[1], email: row[0] };
      return { status: "success", role: role, user: userData };
    }
  }
  return { status: "error", message: "Email atau password salah." };
}

/**
 * Mengambil semua jurnal untuk seorang siswa.
 */
function getStudentJournals(emailSiswa) {
  const sheet = ss.getSheetByName(SHEET_JURNAL);
  const data = sheet.getDataRange().getValues();
  const journals = [];
  for (let i = data.length - 1; i > 0; i--) { // Loop dari belakang agar data terbaru di atas
    if (data[i][2] === emailSiswa) {
      journals.push({
        idJurnal: data[i][0],
        tanggalBaca: new Date(data[i][4]).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        judulBuku: data[i][5], penulis: data[i][6], halaman: data[i][7],
        ringkasan: data[i][8], mood: data[i][9]
      });
    }
  }
  return journals;
}

/**
 * Menghitung dan mengurutkan data untuk papan peringkat.
 */
function getLeaderboardData() {
  const jurnalData = ss.getSheetByName(SHEET_JURNAL).getDataRange().getValues().slice(1);
  const siswaData = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues().slice(1);
  const siswaMap = {};
  siswaData.forEach(row => { siswaMap[row[0]] = { nama: row[1], totalHalaman: 0, totalBuku: 0 }; });
  
  jurnalData.forEach(row => {
    const siswaId = row[1];
    const halaman = parseInt(row[7]) || 0;
    if (siswaMap[siswaId]) { 
      siswaMap[siswaId].totalHalaman += halaman;
      siswaMap[siswaId].totalBuku += 1; 
    }
  });
  
  return Object.values(siswaMap).filter(s => s.totalBuku > 0).sort((a, b) => b.totalHalaman - a.totalHalaman);
}

/**
 * Mengambil semua data yang dibutuhkan untuk dasbor siswa dalam satu panggilan.
 */
function getStudentDashboardData(emailSiswa) {
  const journals = getStudentJournals(emailSiswa);
  const leaderboard = getLeaderboardData();
  return {
    journals: journals,
    leaderboard: leaderboard
  };
}

/**
 * Mengambil semua data yang dibutuhkan untuk dasbor guru dalam satu panggilan.
 */
function getTeacherDashboardData() {
  const students = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues().slice(1).map(r => ({ idSiswa: r[0], nama: r[1], email: r[2], password: r[3], kelas: r[4] }));
  const classes = ss.getSheetByName(SHEET_KELAS).getDataRange().getValues().slice(1).map(r => r[0]);
  const journals = ss.getSheetByName(SHEET_JURNAL).getDataRange().getValues().slice(1).map(r => ({
      idJurnal: r[0], timestamp: r[3], tanggalBaca: new Date(r[4]).toLocaleDateString('id-ID'),
      judulBuku: r[5], penulis: r[6], halaman: r[7], ringkasan: r[8], mood: r[9],
      namaSiswa: (students.find(s => s.idSiswa === r[1]) || {}).nama || 'Siswa Dihapus',
      kelasSiswa: (students.find(s => s.idSiswa === r[1]) || {}).kelas || 'N/A'
  })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return { students, classes, journals };
}


// --- FUNGSI-FUNGSI CRUD ---

function addJournal(d) {
  const sheet = ss.getSheetByName(SHEET_JURNAL);
  const newId = `JRNL-${new Date().getTime()}`;
  sheet.appendRow([newId, d.idSiswa, d.emailSiswa, new Date(), new Date(d.tanggalBaca), d.judulBuku, d.penulis, d.halaman, d.ringkasan, d.mood]);
  return { status: "success", message: "Jurnal berhasil ditambahkan." };
}

function updateJournal(d) {
  const sheet = ss.getSheetByName(SHEET_JURNAL);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === d.idJurnal) {
      sheet.getRange(i + 1, 5, 1, 6).setValues([[new Date(d.tanggalBaca), d.judulBuku, d.penulis, d.halaman, d.ringkasan, d.mood]]);
      return { status: "success", message: "Jurnal berhasil diperbarui." };
    }
  }
  return { status: "error", message: "Jurnal tidak ditemukan." };
}

function deleteJournal(idJurnal) {
  const sheet = ss.getSheetByName(SHEET_JURNAL);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === idJurnal) { sheet.deleteRow(i + 1); return { status: "success" }; }
  }
  return { status: "error", message: "Jurnal tidak ditemukan." };
}

function addClass(className) { ss.getSheetByName(SHEET_KELAS).appendRow([className]); return { status: "success" }; }

function deleteClass(className) {
  const sheet = ss.getSheetByName(SHEET_KELAS);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === className) { sheet.deleteRow(i + 1); return { status: "success" }; }
  }
  return { status: "error", message: "Kelas tidak ditemukan." };
}

function addStudent(d) {
  const sheet = ss.getSheetByName(SHEET_SISWA);
  const newId = `SISWA-${new Date().getTime()}`;
  sheet.appendRow([newId, d.nama, d.email, d.password, d.kelas]);
  return { status: "success" };
}

function updateStudent(d) {
  const sheet = ss.getSheetByName(SHEET_SISWA);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === d.idSiswa) {
      sheet.getRange(i + 1, 2, 1, 4).setValues([[d.nama, d.email, d.password, d.kelas]]);
      return { status: "success" };
    }
  }
  return { status: "error", message: "Siswa tidak ditemukan." };
}

function deleteStudent(idSiswa) {
  const sheet = ss.getSheetByName(SHEET_SISWA);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][0] === idSiswa) { sheet.deleteRow(i + 1); return { status: "success" }; }
  }
  return { status: "error", message: "Siswa tidak ditemukan." };
}


// =================================================================
//          FUNGSI UNTUK MENJAGA SERVER TETAP HANGAT (OPTIONAL)
// =================================================================

/**
 * Fungsi ini bisa Anda panggil menggunakan trigger setiap 10-15 menit
 * untuk mengurangi kemungkinan cold start.
 */
function keepAlive() {
  Logger.log("Pinged at " + new Date());
}