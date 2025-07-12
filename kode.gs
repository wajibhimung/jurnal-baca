// =================================================================
//          APLIKASI JURNAL BACA - BACKEND FINAL v4.7 (FIXED & STABLE)
// =================================================================

const SPREADSHEET_ID = "1fjIdB8Px8fZNRMexu_v8iKbAtJKopYprvYD7H8GT8LE"; 
const SHEET_GURU = "Guru"; 
const SHEET_SISWA = "Siswa"; 
const SHEET_KELAS = "Kelas";
const SHEET_JURNAL = "Jurnal"; 
const SHEET_TARGET = "Target"; 
const SHEET_LENCANA_SISWA = "LencanaSiswa";
// ▼▼▼ Konstanta Baru untuk Kupon ▼▼▼
const SHEET_KUPON = "Kupon";
const SHEET_HADIAH = "Hadiah";
const SHEET_KUPON_SISWA = "KuponSiswa";
const SHEET_RIWAYAT_PENUKARAN = "RiwayatPenukaran";


const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

const ALL_BADGES = {
  'PEMBACA_PEMULA': { name: 'Langkah Pertama', description: 'Membuat jurnal pertamamu.', icon: 'fa-shoe-prints' },
  'BACA_100_HALAMAN': { name: 'Pemanasan', description: 'Mencapai total 100 halaman.', icon: 'fa-fire' },
  'PENJELAJAH_AWAL': { name: 'Kolektor Awal', description: 'Membaca 3 buku unik.', icon: 'fa-layer-group' },
  'KUTU_BUKU': { name: 'Kutu Buku', description: 'Membaca 5 buku unik.', icon: 'fa-book-reader' },
  'MARATON_500': { name: 'Pelari Maraton', description: 'Membaca total 500 halaman.', icon: 'fa-running' },
  'KONSISTEN_3_HARI': { name: 'Mulai Terbiasa', description: 'Membuat jurnal 3 hari berturut-turut.', icon: 'fa-calendar-check' }
};

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const data = request.data;
    let result;
    switch (action) {
      // --- Fungsi Original ---
      case 'login': result = login(data.email, data.password, data.role); break;
      case 'getStudentDashboardData': result = getStudentDashboardData(data.emailSiswa); break;
      case 'getTeacherDashboardData': result = getTeacherDashboardData(); break;
      case 'addJournal': result = addJournalAndCheck(data); break;
      case 'updateJournal': result = updateJournal(data); break;
      case 'deleteJournal': result = deleteJournal(data.idJurnal); break;
      case 'addClass': result = addClass(data.className); break;
      case 'deleteClass': result = deleteClass(data.className); break;
      case 'addStudent': result = addStudent(data); break;
      case 'updateStudent': result = updateStudent(data); break;
      case 'deleteStudent': result = deleteStudent(data.idSiswa); break;
      case 'addTarget': result = addTarget(data); break;
      case 'updateTargetStatus': result = updateTargetStatus(data.idTarget, data.status); break;
      case 'deleteTarget': result = deleteTarget(data.idTarget); break;
      
      // --- Fungsi Halaman Guru ---
      case 'getAllTargets': result = getAllTargets(); break;
      case 'getAllStudentBadges': result = getAllStudentBadges(); break;

      // ▼▼▼ Fungsi Baru untuk Kupon ▼▼▼
      case 'getCouponManagementData': result = getCouponManagementData(); break;
      case 'addCouponType': result = addCouponType(data); break;
      case 'addPrize': result = addPrize(data); break;
      case 'deleteCouponType': result = deleteRowById(SHEET_KUPON, data.id, 'idKuponTipe'); break;
      case 'deletePrize': result = deleteRowById(SHEET_HADIAH, data.id, 'idHadiah'); break;
      case 'giveCoupons': result = giveCoupons(data.emailSiswa, data.idKuponTipe, data.jumlah); break; 
      case 'redeemPrize': result = redeemPrize(data.emailSiswa, data.idHadiah, data.kuponDibutuhkan); break;
      case 'getStudentListOnly': result = getStudentListOnly(); break;
      // ▲▲▲ Akhir Fungsi Kupon ▲▲▲

      default: throw new Error("Aksi tidak valid: " + action);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doPost: " + error.toString() + " at " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: "Terjadi kesalahan di server: " + error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
//          FUNGSI ORIGINAL (v4.4 STABLE)
// =================================================================

function login(email, password, role) { const sheetName = (role === 'siswa') ? SHEET_SISWA : SHEET_GURU; const sheet = ss.getSheetByName(sheetName); if (!sheet) return { status: "error", message: `Sheet ${sheetName} tidak ditemukan.`}; const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { const row = data[i]; const userEmail = (role === 'siswa') ? row[2] : row[0]; const userPassword = (role === 'siswa') ? row[3] : row[2]; if (userEmail && userEmail.toLowerCase() === email.toLowerCase() && userPassword == password) { let userData = (role === 'siswa') ? { idSiswa: row[0], nama: row[1], email: row[2], kelas: row[4] } : { nama: row[1], email: row[0] }; return { status: "success", role: role, user: userData }; } } return { status: "error", message: "Email atau password salah." }; }
function getStudentDashboardData(emailSiswa) { return { journals: getStudentJournals(emailSiswa), leaderboard: getLeaderboardData(), targets: getStudentTargets(emailSiswa), badges: getStudentBadges(emailSiswa) }; }
function addJournalAndCheck(journalData) { addJournal(journalData); const newBadges = checkAllAchievements(journalData.emailSiswa); updateTargetProgress(journalData.emailSiswa); return { status: "success", message: "Jurnal berhasil ditambahkan.", newBadges: newBadges }; }
function updateJournalAndCheck(journalData) { updateJournal(journalData); const newBadges = checkAllAchievements(journalData.emailSiswa); updateTargetProgress(journalData.emailSiswa); return { status: "success", message: "Jurnal berhasil diperbarui.", newBadges: newBadges }; }
function getStudentJournals(emailSiswa) { const sheet = ss.getSheetByName(SHEET_JURNAL); if (!sheet) return []; const data = sheet.getDataRange().getValues(); const journals = []; for (let i = data.length - 1; i > 0; i--) { if (data[i][2] === emailSiswa) { journals.push({ idJurnal: data[i][0], tanggalBaca: new Date(data[i][4]).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }), judulBuku: String(data[i][5] || ''), penulis: data[i][6], halaman: data[i][7], ringkasan: data[i][8], mood: data[i][9] }); } } return journals; }
function getStudentTargets(emailSiswa) { const sheet = ss.getSheetByName(SHEET_TARGET); if (!sheet) return []; const data = sheet.getDataRange().getValues(); const targets = []; for (let i = 1; i < data.length; i++) { if (data[i][1] === emailSiswa) { targets.push({ idTarget: data[i][0], email: data[i][1], title: data[i][2], type: data[i][3], targetValue: data[i][4], status: data[i][5] }); } } return targets; }
function addTarget(targetData) { const sheet = ss.getSheetByName(SHEET_TARGET); const newId = `TGT-${new Date().getTime()}`; sheet.appendRow([newId, targetData.email, targetData.title, targetData.type, targetData.targetValue, 'Aktif']); return { status: 'success' }; }
function updateTargetStatus(idTarget, status) { const sheet = ss.getSheetByName(SHEET_TARGET); const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0] === idTarget) { sheet.getRange(i + 1, 6).setValue(status); return { status: 'success' }; } } }
function deleteTarget(idTarget) { const sheet = ss.getSheetByName(SHEET_TARGET); const data = sheet.getDataRange().getValues(); for (let i = data.length - 1; i > 0; i--) { if (data[i][0] === idTarget) { sheet.deleteRow(i + 1); return { status: 'success' }; } } }
function updateTargetProgress(emailSiswa) { const journals = getStudentJournals(emailSiswa); const targets = getStudentTargets(emailSiswa); const activeTargets = targets.filter(t => t.status === 'Aktif'); if (activeTargets.length === 0) return; const totalPages = journals.reduce((sum, j) => sum + (parseInt(j.halaman) || 0), 0); const uniqueBooks = new Set(journals.map(j => String(j.judulBuku || "").trim()).filter(Boolean)); activeTargets.forEach(target => { let currentProgress = (target.type === 'halaman') ? totalPages : uniqueBooks.size; if (currentProgress >= target.targetValue) { updateTargetStatus(target.idTarget, 'Selesai'); } }); }
function getStudentBadges(emailSiswa) { const sheet = ss.getSheetByName(SHEET_LENCANA_SISWA); if (!sheet) return []; const data = sheet.getDataRange().getValues(); const studentBadges = new Set(); for (let i = 1; i < data.length; i++) { if (data[i][0] === emailSiswa) { studentBadges.add(data[i][1]); } } return Array.from(studentBadges); }
function giveBadge(emailSiswa, badgeId) { const sheet = ss.getSheetByName(SHEET_LENCANA_SISWA); sheet.appendRow([emailSiswa, badgeId, new Date()]); }
function checkAllAchievements(emailSiswa) { const earnedBadges = getStudentBadges(emailSiswa); const journals = getStudentJournals(emailSiswa); const newBadges = []; const giveBadgeIfNotExist = (badgeId) => { if (!earnedBadges.includes(badgeId)) { giveBadge(emailSiswa, badgeId); newBadges.push(ALL_BADGES[badgeId]); earnedBadges.push(badgeId); } }; if (journals.length === 0) return []; if (journals.length >= 1) giveBadgeIfNotExist('PEMBACA_PEMULA'); const totalPages = journals.reduce((sum, j) => sum + (parseInt(j.halaman) || 0), 0); const uniqueBooks = new Set(journals.map(j => String(j.judulBuku || "").trim()).filter(Boolean)); if (totalPages >= 100) giveBadgeIfNotExist('BACA_100_HALAMAN'); if (totalPages >= 500) giveBadgeIfNotExist('MARATON_500'); if (uniqueBooks.size >= 3) giveBadgeIfNotExist('PENJELAJAH_AWAL'); if (uniqueBooks.size >= 5) giveBadgeIfNotExist('KUTU_BUKU'); if (journals.length >= 3) { try { const sortedDates = journals.map(j => new Date(j.tanggalBaca.split('/').reverse().join('-'))).sort((a,b) => b.getTime() - a.getTime()); if (sortedDates.length >= 3) { const dayDiff1 = (sortedDates[0].getTime() - sortedDates[1].getTime()) / 86400000; const dayDiff2 = (sortedDates[1].getTime() - sortedDates[2].getTime()) / 86400000; if (dayDiff1 <= 1 && dayDiff2 <= 1) { giveBadgeIfNotExist('KONSISTEN_3_HARI'); } } } catch(e) { Logger.log("Error parsing date for consistency badge: " + e.toString()); } } return newBadges; }
function getLeaderboardData() { const jurnalData = ss.getSheetByName(SHEET_JURNAL).getDataRange().getValues().slice(1); const siswaData = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues().slice(1); const siswaMap = {}; siswaData.forEach(row => { siswaMap[row[0]] = { nama: row[1], totalHalaman: 0 }; }); jurnalData.forEach(row => { const siswaId = row[1]; const halaman = parseInt(row[7]) || 0; if (siswaMap[siswaId]) { siswaMap[siswaId].totalHalaman += halaman; } }); return Object.values(siswaMap).filter(s => s.totalHalaman > 0).sort((a, b) => b.totalHalaman - a.totalHalaman); }
function getTeacherDashboardData() { const students = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues().slice(1).map(r => ({ idSiswa: r[0], nama: r[1], email: r[2], password: r[3], kelas: r[4] })); const classes = ss.getSheetByName(SHEET_KELAS).getDataRange().getValues().slice(1).map(r => r[0]); const journals = ss.getSheetByName(SHEET_JURNAL).getDataRange().getValues().slice(1).map(r => ({ idJurnal: r[0], timestamp: r[3], tanggalBaca: new Date(r[4]).toLocaleDateString('id-ID'), judulBuku: String(r[5] || ''), penulis: r[6], halaman: r[7], ringkasan: r[8], mood: r[9], namaSiswa: (students.find(s => s.idSiswa === r[1]) || {}).nama || 'Siswa Dihapus', kelasSiswa: (students.find(s => s.idSiswa === r[1]) || {}).kelas || 'N/A' })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); return { students, classes, journals }; }
function getAllTargets() { const sheet = ss.getSheetByName(SHEET_TARGET); if(!sheet) return []; return sheet.getDataRange().getValues().slice(1).map(r => ({idTarget: r[0], email: r[1], title: r[2], type: r[3], targetValue: r[4], status: r[5]})); }
function getAllStudentBadges() { const sheet = ss.getSheetByName(SHEET_LENCANA_SISWA); if(!sheet) return []; return sheet.getDataRange().getValues().slice(1).map(r => ({email: r[0], badgeId: r[1], date: r[2]})); }
function addJournal(d) { const sheet = ss.getSheetByName(SHEET_JURNAL); const newId = `JRNL-${new Date().getTime()}`; sheet.appendRow([newId, d.idSiswa, d.emailSiswa, new Date(), new Date(d.tanggalBaca), d.judulBuku, d.penulis, d.halaman, d.ringkasan, d.mood]); return { status: "success" }; }
function updateJournal(d) { const sheet = ss.getSheetByName(SHEET_JURNAL); const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0] === d.idJurnal) { sheet.getRange(i + 1, 5, 1, 6).setValues([[new Date(d.tanggalBaca), d.judulBuku, d.penulis, d.halaman, d.ringkasan, d.mood]]); return { status: "success" }; } } }
function deleteJournal(idJurnal) { const sheet = ss.getSheetByName(SHEET_JURNAL); const data = sheet.getDataRange().getValues(); for (let i = data.length - 1; i > 0; i--) { if (data[i][0] === idJurnal) { sheet.deleteRow(i + 1); return { status: "success" }; } } }
function addClass(className) { ss.getSheetByName(SHEET_KELAS).appendRow([className]); return { status: "success" }; }
function deleteClass(className) { const sheet = ss.getSheetByName(SHEET_KELAS); const data = sheet.getDataRange().getValues(); for (let i = data.length - 1; i > 0; i--) { if (data[i][0] === className) { sheet.deleteRow(i + 1); return { status: "success" }; } } }
function addStudent(d) { const sheet = ss.getSheetByName(SHEET_SISWA); const newId = `SISWA-${new Date().getTime()}`; sheet.appendRow([newId, d.nama, d.email, d.password, d.kelas, new Date()]); return { status: "success" }; }
function updateStudent(d) { const sheet = ss.getSheetByName(SHEET_SISWA); const data = sheet.getDataRange().getValues(); for (let i = 1; i < data.length; i++) { if (data[i][0] === d.idSiswa) { let row = data[i]; row[1] = d.nama; row[2] = d.email; if(d.password) row[3] = d.password; row[4] = d.kelas; sheet.getRange(i+1, 1, 1, row.length).setValues([row]); return { status: "success" }; } } }
function deleteStudent(idSiswa) { const sheet = ss.getSheetByName(SHEET_SISWA); const data = sheet.getDataRange().getValues(); for (let i = data.length - 1; i > 0; i--) { if (data[i][0] === idSiswa) { sheet.deleteRow(i + 1); return { status: "success" }; } } }
function keepAlive() { Logger.log("Pinged at " + new Date()); }


// =================================================================
//          ▼▼▼ FUNGSI BARU UNTUK KUPON ▼▼▼
// =================================================================

/**
 * Helper function to convert sheet data to JSON array of objects.
 */
function sheetToJSON(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data.shift().map(h => h.toString().trim());
  return data.map(row => {
    if (row.every(cell => cell === "")) return null;
    let obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  }).filter(item => item !== null);
}

/**
 * Generic function to delete a row by its ID from any sheet.
 */
function deleteRowById(sheetName, idToDelete, idColumnName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet '${sheetName}' tidak ditemukan.`);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColumnIndex = headers.indexOf(idColumnName);

  if (idColumnIndex === -1) {
    throw new Error(`Kolom ID '${idColumnName}' tidak ditemukan di sheet '${sheetName}'`);
  }

  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][idColumnIndex] == idToDelete) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Data berhasil dihapus.' };
    }
  }
  return { status: 'error', message: 'Data tidak ditemukan.' };
}

function getCouponManagementData() {
  const couponTypes = sheetToJSON(ss.getSheetByName(SHEET_KUPON));
  const prizes = sheetToJSON(ss.getSheetByName(SHEET_HADIAH));
  const studentCoupons = sheetToJSON(ss.getSheetByName(SHEET_KUPON_SISWA));
  const redemptionHistory = sheetToJSON(ss.getSheetByName(SHEET_RIWAYAT_PENUKARAN));
  const studentsRaw = ss.getSheetByName(SHEET_SISWA).getDataRange().getValues().slice(1);
  const classesRaw = ss.getSheetByName(SHEET_KELAS).getDataRange().getValues().slice(1);

  // Menggunakan format siswa yang konsisten dengan getTeacherDashboardData
  const students = studentsRaw.map(r => ({ idSiswa: r[0], nama: r[1], email: r[2], password: r[3], kelas: r[4] })).filter(s => s.idSiswa);
  const classes = classesRaw.map(r => r[0]).filter(Boolean);

  const historyWithStudentNames = redemptionHistory.map(history => {
    const student = students.find(s => s.email === history.emailSiswa);
    const prize = prizes.find(p => p.idHadiah === history.idHadiah);
    return {
      ...history,
      namaSiswa: student ? student.nama : 'Siswa Dihapus',
      namaHadiah: prize ? prize.namaHadiah : 'Hadiah Dihapus'
    };
  }).sort((a,b) => new Date(b.tanggalTukar) - new Date(a.tanggalTukar));

  return { couponTypes, prizes, studentCoupons, redemptionHistory: historyWithStudentNames, students, classes };
}

function addCouponType(data) {
  const sheet = ss.getSheetByName(SHEET_KUPON);
  const newId = `CT-${new Date().getTime()}`;
  sheet.appendRow([newId, data.capaian, data.jumlahKupon, data.deskripsi]);
  return { status: "success", message: "Tipe kupon berhasil ditambahkan." };
}

function addPrize(data) {
  const sheet = ss.getSheetByName(SHEET_HADIAH);
  const newId = `H-${new Date().getTime()}`;
  sheet.appendRow([newId, data.namaHadiah, data.kuponDibutuhkan, data.deskripsi]);
  return { status: "success", message: "Hadiah berhasil ditambahkan." };
}

function giveCoupons(emailSiswa, idKuponTipe, jumlah) {
  const sheet = ss.getSheetByName(SHEET_KUPON_SISWA);
  const jumlahKupon = parseInt(jumlah) || 1;
  for (let i = 0; i < jumlahKupon; i++) {
    const newId = `SK-${new Date().getTime() + i}`;
    sheet.appendRow([newId, emailSiswa, idKuponTipe, new Date(), 'Tersedia']);
  }
  return { status: "success", message: "Kupon berhasil diberikan." };
}

function redeemPrize(emailSiswa, idHadiah, kuponDibutuhkan) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); 
  try {
    const couponSheet = ss.getSheetByName(SHEET_KUPON_SISWA);
    const couponData = couponSheet.getDataRange().getValues();
    const availableCoupons = [];
    for (let i = 1; i < couponData.length; i++) {
      if (couponData[i][1] === emailSiswa && couponData[i][4] === 'Tersedia') {
        availableCoupons.push({ rowIndex: i + 1, id: couponData[i][0] });
      }
    }

    if (availableCoupons.length < kuponDibutuhkan) {
      throw new Error("Kupon siswa tidak mencukupi.");
    }

    for (let i = 0; i < kuponDibutuhkan; i++) {
      couponSheet.getRange(availableCoupons[i].rowIndex, 5).setValue('Ditukar');
    }

    const historySheet = ss.getSheetByName(SHEET_RIWAYAT_PENUKARAN);
    const newId = `R-${new Date().getTime()}`;
    historySheet.appendRow([newId, emailSiswa, idHadiah, kuponDibutuhkan, new Date()]);
    
    return { status: 'success', message: 'Kupon berhasil ditukar!' };
  } catch (e) {
    Logger.log(e);
    throw new Error('Gagal menukar kupon: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}
/**
 * FUNGSI BARU UNTUK LAZY LOADING
 * Hanya mengambil daftar siswa (nama, email, kelas) agar pemuatan awal cepat.
 */
function getStudentListOnly() {
  const sheet = ss.getSheetByName(SHEET_SISWA);
  if (!sheet) return [];
  // Mengambil data dari kolom A, B, C, dan E
  const data = sheet.getRange("A2:E" + sheet.getLastRow()).getValues();
  return data.map(row => ({
    idSiswa: row[0],
    nama: row[1],
    email: row[2],
    kelas: row[4]
  })).filter(s => s.nama); // Filter siswa yang punya nama
}