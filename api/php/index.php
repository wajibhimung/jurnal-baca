<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

define('LOG_FILE', __DIR__ . '/api_log.txt');

function write_log($message) {
    file_put_contents(LOG_FILE, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
}

if (file_exists(LOG_FILE) && filesize(LOG_FILE) > 5 * 1024 * 1024) {
    unlink(LOG_FILE);
}

write_log("--- REQUEST RECEIVED --- METHOD: " . $_SERVER['REQUEST_METHOD']);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    write_log("Pre-flight OPTIONS request handled.");
    exit(0);
}

function send_json_response($status, $dataOrMessage) {
    if (!headers_sent()) {
        $responseBody = '';
        if ($status === 'success') {
            http_response_code(200);
            $responseBody = json_encode(['status' => 'success', 'data' => $dataOrMessage], JSON_NUMERIC_CHECK);
        } else {
            http_response_code(500);
            $responseBody = json_encode(['status' => 'error', 'message' => $dataOrMessage]);
        }
        write_log("RESPONSE SENT: " . $responseBody);
        echo $responseBody;
    } else {
        write_log("ERROR: Headers already sent. Could not send JSON response.");
    }
    exit();
}

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return;
    $logMessage = "PHP ERROR: [{$severity}] {$message} in {$file} on line {$line}";
    write_log($logMessage);
    throw new ErrorException($message, 0, $severity, $file, $line);
});

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        $message = "FATAL ERROR: [{$error['type']}] {$error['message']} in {$error['file']} on line {$error['line']}";
        write_log($message);
        if (!headers_sent()) {
             send_json_response('error', $message);
        }
    }
});

// --- KONFIGURASI DATABASE (WAJIB DIUBAH) ---
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'jurnal_baca');

$conn = null;

$ALL_BADGES = [
  'PEMBACA_PEMULA' => [ 'name' => 'Langkah Pertama', 'description' => 'Membuat jurnal pertamamu.', 'icon' => 'fa-shoe-prints' ],
  'BACA_100_HALAMAN' => [ 'name' => 'Pemanasan', 'description' => 'Mencapai total 100 halaman.', 'icon' => 'fa-fire' ],
  'PENJELAJAH_AWAL' => [ 'name' => 'Kolektor Awal', 'description' => 'Membaca 3 buku unik.', 'icon' => 'fa-layer-group' ],
  'KUTU_BUKU' => [ 'name' => 'Kutu Buku', 'description' => 'Membaca 5 buku unik.', 'icon' => 'fa-book-reader' ],
  'MARATON_500' => [ 'name' => 'Pelari Maraton', 'description' => 'Membaca total 500 halaman.', 'icon' => 'fa-running' ],
  'KONSISTEN_3_HARI' => [ 'name' => 'Mulai Terbiasa', 'description' => 'Membuat jurnal 3 hari berturut-turut.', 'icon' => 'fa-calendar-check' ]
];

try {
    global $ALL_BADGES;

    write_log("Connecting to database...");
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) throw new ErrorException('Koneksi Database Gagal: ' . $conn->connect_error);
    $conn->set_charset('utf8mb4');
    write_log("Database connection successful.");

    $json_data = file_get_contents('php://input');
    write_log("REQUEST BODY: " . $json_data);
    $request = json_decode($json_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) throw new Exception("Invalid JSON format");

    $action = $request['action'] ?? '';
    $data = $request['data'] ?? [];
    write_log("ACTION: '{$action}'");
    $result = null;

    switch ($action) {
        case 'login': $result = login($conn, $data); break;
        case 'getStudentDashboardData': $result = getStudentDashboardData($conn, $data); break;
        case 'getTeacherDashboardData': $result = getTeacherDashboardData($conn); break;
        case 'addJournal': $result = addJournalAndCheck($conn, $data); break;
        case 'updateJournal': $result = updateJournal($conn, $data); break;
        case 'deleteJournal': $result = deleteJournal($conn, $data); break;
        case 'addClass': $result = addClass($conn, $data); break;
        case 'deleteClass': $result = deleteClass($conn, $data); break;
        case 'addStudent': $result = addStudent($conn, $data); break;
        case 'updateStudent': $result = updateStudent($conn, $data); break;
        case 'deleteStudent': $result = deleteStudent($conn, $data); break;
        case 'addTarget': $result = addTarget($conn, $data); break;
        case 'updateTargetStatus': $result = updateTargetStatus($conn, $data); break;
        case 'deleteTarget': $result = deleteTarget($conn, $data); break;
        case 'getAllTargets': $result = getAllTargets($conn); break;
        case 'getAllStudentBadges': $result = getAllStudentBadges($conn); break;
        case 'getCouponManagementData': $result = getCouponManagementData($conn); break;
        case 'addCouponType': $result = addCouponType($conn, $data); break;
        case 'addPrize': $result = addPrize($conn, $data); break;
        case 'deleteCouponType': $result = deleteRowById($conn, 'kupon', $data['id'] ?? null, 'id_kupon_tipe'); break;
        case 'deletePrize': $result = deleteRowById($conn, 'hadiah', $data['id'] ?? null, 'id_hadiah'); break;
        case 'giveCoupons': $result = giveCoupons($conn, $data); break;
        case 'redeemPrize': $result = redeemPrize($conn, $data); break;
        case 'updateRedemptionStatus': $result = updateRedemptionStatus($conn, $data); break;
        case 'getStudentListOnly': $result = getStudentListOnly($conn); break;
        default: throw new Exception("Aksi tidak valid: " . htmlspecialchars($action));
    }
    
    send_json_response('success', $result);

} catch (Exception $e) {
    $errorMessage = $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine();
    write_log("EXCEPTION CAUGHT: " . $errorMessage);
    send_json_response('error', $errorMessage);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
        write_log("Database connection closed.");
    }
}

function generate_id($prefix) { return $prefix . round(microtime(true) * 1000); }

function login($conn, $data) {
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;
    $role = $data['role'] ?? null;
    if (!$email || !$password || !$role) throw new Exception("Email, password, dan role dibutuhkan.");

    $table = ($role === 'siswa') ? 'siswa' : 'guru';
    $stmt = $conn->prepare("SELECT * FROM `$table` WHERE `email` = ? AND `password` = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($user = $result->fetch_assoc()) {
        $userData = ($role === 'siswa') 
            ? ['idSiswa' => $user['id_siswa'], 'nama' => $user['nama_siswa'], 'email' => $user['email'], 'kelas' => $user['kelas']] 
            : ['nama' => $user['nama'], 'email' => $user['email']];
        return ['status' => "success", 'role' => $role, 'user' => $userData];
    }
    return ['status' => "error", 'message' => "Email atau password salah."];
}

function getStudentDashboardData($conn, $data) {
    $emailSiswa = $data['emailSiswa'] ?? null;
    if (!$emailSiswa) throw new Exception("Email siswa dibutuhkan.");
    return [
        'journals' => getStudentJournals($conn, $emailSiswa),
        'leaderboard' => getLeaderboardData($conn),
        'targets' => getStudentTargets($conn, $emailSiswa),
        'badges' => getStudentBadges($conn, $emailSiswa)
    ];
}

function addJournalAndCheck($conn, $journalData) {
    write_log("Executing addJournalAndCheck...");
    addJournal($conn, $journalData);
    $emailSiswa = $journalData['emailSiswa'] ?? null;
    updateTargetProgress($conn, $emailSiswa);
    $newBadges = checkAllAchievements($conn, $emailSiswa);
    write_log("addJournalAndCheck completed successfully.");
    return ["message" => "Jurnal berhasil ditambahkan.", "newBadges" => $newBadges];
}

function addJournal($conn, $d) {
    write_log("Executing addJournal with data: " . json_encode($d));
    $stmt = $conn->prepare("INSERT INTO `jurnal` (`id_jurnal`, `id_siswa`, `email_siswa`, `timestamp_input`, `tanggal_baca`, `judul_buku`, `penulis`, `jumlah_halaman_dibaca`, `ringkasan`, `mood`) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)");
    if ($stmt === false) throw new Exception("Gagal mempersiapkan statement INSERT Jurnal: " . $conn->error);
    
    $idSiswa = $d['idSiswa'] ?? null;
    $emailSiswa = $d['emailSiswa'] ?? null;
    $judulBuku = $d['judulBuku'] ?? '';
    $penulis = $d['penulis'] ?? '';
    $halaman = (int)($d['halaman'] ?? 0);
    $ringkasan = $d['ringkasan'] ?? '';
    $mood = $d['mood'] ?? '';
    $tanggalBacaInput = $d['tanggalBaca'] ?? null;

    if (!$idSiswa || !$emailSiswa || !$tanggalBacaInput) throw new Exception("Data idSiswa, emailSiswa, dan tanggalBaca tidak boleh kosong.");
    
    $date = DateTime::createFromFormat('Y-m-d', $tanggalBacaInput);
    if (!$date) throw new Exception("Format tanggal tidak valid. Harap gunakan YYYY-MM-DD. Tanggal diterima: " . $tanggalBacaInput);
    $tanggalBacaMySQL = $date->format('Y-m-d H:i:s');
    
    write_log("Binding parameters for addJournal...");
    $newId = generate_id('JRNL-');
    $stmt->bind_param("ssssssiss", $newId, $idSiswa, $emailSiswa, $tanggalBacaMySQL, $judulBuku, $penulis, $halaman, $ringkasan, $mood);
    
    if (!$stmt->execute()) throw new Exception("Gagal mengeksekusi statement INSERT Jurnal: " . $stmt->error);
    write_log("addJournal executed. Rows affected: " . $stmt->affected_rows);
    return ['status' => "success"];
}

function updateJournal($conn, $d) {
    write_log("Executing updateJournal with data: " . json_encode($d));
    $stmt = $conn->prepare("UPDATE `jurnal` SET `tanggal_baca` = ?, `judul_buku` = ?, `penulis` = ?, `jumlah_halaman_dibaca` = ?, `ringkasan` = ?, `mood` = ? WHERE `id_jurnal` = ?");
    if ($stmt === false) throw new Exception("Gagal mempersiapkan statement UPDATE Jurnal: " . $conn->error);
    
    $judulBuku = $d['judulBuku'] ?? '';
    $penulis = $d['penulis'] ?? '';
    $halaman = (int)($d['halaman'] ?? 0);
    $ringkasan = $d['ringkasan'] ?? '';
    $mood = $d['mood'] ?? '';
    $idJurnal = $d['idJurnal'] ?? null;
    $tanggalBacaInput = $d['tanggalBaca'] ?? null;

    if (!$idJurnal || !$tanggalBacaInput) throw new Exception("Data idJurnal dan tanggalBaca tidak boleh kosong untuk update.");
    
    $date = DateTime::createFromFormat('Y-m-d', $tanggalBacaInput) ?: DateTime::createFromFormat('d/m/Y', $tanggalBacaInput);
    if (!$date) throw new Exception("Format tanggal tidak valid. Harap gunakan YYYY-MM-DD. Tanggal diterima: " . $tanggalBacaInput);
    $tanggalBacaMySQL = $date->format('Y-m-d H:i:s');
    
    write_log("Binding parameters for updateJournal...");
    $stmt->bind_param("sssisss", $tanggalBacaMySQL, $judulBuku, $penulis, $halaman, $ringkasan, $mood, $idJurnal);
    
    if (!$stmt->execute()) throw new Exception("Gagal mengeksekusi statement UPDATE Jurnal: " . $stmt->error);
    write_log("updateJournal executed. Rows affected: " . $stmt->affected_rows);
    return ['status' => "success"];
}

function deleteJournal($conn, $d) {
    $idJurnal = $d['idJurnal'] ?? null;
    if (!$idJurnal) throw new Exception("ID Jurnal dibutuhkan untuk menghapus.");
    $stmt = $conn->prepare("DELETE FROM `jurnal` WHERE `id_jurnal` = ?");
    $stmt->bind_param("s", $idJurnal);
    $stmt->execute();
    return ['status' => "success", "message" => "Jurnal berhasil dihapus."];
}

function getStudentJournals($conn, $emailSiswa, $full_data = false) {
    $journals = [];
    $stmt = $conn->prepare("SELECT * FROM `jurnal` WHERE `email_siswa` = ? ORDER BY `timestamp_input` DESC");
    $stmt->bind_param("s", $emailSiswa);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($full_data) {
             $journals[] = $row;
        } else {
            $journals[] = [
                'idJurnal' => $row['id_jurnal'], 'tanggalBaca' => date('d/m/Y', strtotime($row['tanggal_baca'])),
                'judulBuku' => $row['judul_buku'] ?? '', 'penulis' => $row['penulis'], 'halaman' => $row['jumlah_halaman_dibaca'],
                'ringkasan' => $row['ringkasan'], 'mood' => $row['mood']
            ];
        }
    }
    return $journals;
}

function getStudentTargets($conn, $emailSiswa) {
    $targets = [];
    $stmt = $conn->prepare("SELECT * FROM `target` WHERE `email_siswa` = ?");
    $stmt->bind_param("s", $emailSiswa);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $targets[] = [
            'idTarget' => $row['id_target'], 'email' => $row['email_siswa'], 'title' => $row['judul_target'],
            'type' => $row['tipe_target'], 'targetValue' => $row['nilai_target'], 'status' => $row['status']
        ];
    }
    return $targets;
}

function addTarget($conn, $data) {
    $newId = generate_id('TGT-');
    $stmt = $conn->prepare("INSERT INTO `target` (`id_target`, `email_siswa`, `judul_target`, `tipe_target`, `nilai_target`, `status`) VALUES (?, ?, ?, ?, ?, 'Aktif')");
    $stmt->bind_param("ssssi", $newId, $data['email'], $data['title'], $data['type'], $data['targetValue']);
    $stmt->execute();
    return ['status' => 'success'];
}

function updateTargetStatus($conn, $data) {
    $stmt = $conn->prepare("UPDATE `target` SET `status` = ? WHERE `id_target` = ?");
    $stmt->bind_param("ss", $data['status'], $data['idTarget']);
    $stmt->execute();
    return ['status' => 'success'];
}

function deleteTarget($conn, $data) {
    $stmt = $conn->prepare("DELETE FROM `target` WHERE `id_target` = ?");
    $stmt->bind_param("s", $data['idTarget']);
    $stmt->execute();
    return ['status' => 'success'];
}

function updateTargetProgress($conn, $emailSiswa) {
    $journals = getStudentJournals($conn, $emailSiswa, true);
    $targets = getStudentTargets($conn, $emailSiswa);
    $activeTargets = array_filter($targets, fn($t) => $t['status'] === 'Aktif');
    if (empty($activeTargets)) return;
    
    $totalPages = array_reduce($journals, fn($sum, $j) => $sum + (int)($j['jumlah_halaman_dibaca'] ?? 0), 0);
    $uniqueBooks = array_unique(array_map(fn($j) => trim((string)($j['judul_buku'] ?? "")), $journals));
    $uniqueBooksCount = count(array_filter($uniqueBooks));

    foreach ($activeTargets as $target) {
        $currentProgress = ($target['type'] === 'halaman') ? $totalPages : $uniqueBooksCount;
        if ($currentProgress >= $target['targetValue']) {
            updateTargetStatus($conn, ['idTarget' => $target['idTarget'], 'status' => 'Selesai']);
        }
    }
}

function getStudentBadges($conn, $emailSiswa) {
    $badges = [];
    $stmt = $conn->prepare("SELECT `id_lencana` FROM `lencana_siswa` WHERE `email_siswa` = ?");
    $stmt->bind_param("s", $emailSiswa);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) $badges[] = $row['id_lencana'];
    return $badges;
}

function giveBadge($conn, $emailSiswa, $badgeId) {
    $stmt = $conn->prepare("INSERT IGNORE INTO `lencana_siswa` (`email_siswa`, `id_lencana`, `tanggal_didapat`) VALUES (?, ?, NOW())");
    $stmt->bind_param("ss", $emailSiswa, $badgeId);
    $stmt->execute();
}

function checkAllAchievements($conn, $emailSiswa) {
    global $ALL_BADGES;
    $earnedBadges = getStudentBadges($conn, $emailSiswa);
    $journals = getStudentJournals($conn, $emailSiswa, true);
    $newBadges = [];

    $giveBadgeIfNotExist = function($badgeId) use ($conn, $emailSiswa, &$earnedBadges, &$newBadges, $ALL_BADGES) {
        if (isset($ALL_BADGES[$badgeId]) && !in_array($badgeId, $earnedBadges)) {
            giveBadge($conn, $emailSiswa, $badgeId);
            $newBadges[] = $ALL_BADGES[$badgeId];
            $earnedBadges[] = $badgeId;
        }
    };
    
    if (empty($journals)) return [];
    if (count($journals) >= 1) $giveBadgeIfNotExist('PEMBACA_PEMULA');
    
    $totalPages = array_reduce($journals, fn($sum, $j) => $sum + (int)($j['jumlah_halaman_dibaca'] ?? 0), 0);
    $uniqueBooks = array_unique(array_map(fn($j) => trim((string)($j['judul_buku'] ?? "")), $journals));
    $uniqueBooksCount = count(array_filter($uniqueBooks));
    
    if ($totalPages >= 100) $giveBadgeIfNotExist('BACA_100_HALAMAN');
    if ($totalPages >= 500) $giveBadgeIfNotExist('MARATON_500');
    if ($uniqueBooksCount >= 3) $giveBadgeIfNotExist('PENJELAJAH_AWAL');
    if ($uniqueBooksCount >= 5) $giveBadgeIfNotExist('KUTU_BUKU');
    if (count($journals) >= 3) {
        usort($journals, fn($a, $b) => strtotime($b['tanggal_baca']) - strtotime($a['tanggal_baca']));
        if(count($journals) >= 3){
            $d1 = new DateTime(date('Y-m-d', strtotime($journals[0]['tanggal_baca'])));
            $d2 = new DateTime(date('Y-m-d', strtotime($journals[1]['tanggal_baca'])));
            $d3 = new DateTime(date('Y-m-d', strtotime($journals[2]['tanggal_baca'])));
            if ($d1->diff($d2)->days <= 1 && $d2->diff($d3)->days <= 1) $giveBadgeIfNotExist('KONSISTEN_3_HARI');
        }
    }
    return $newBadges;
}

function getLeaderboardData($conn) {
    $sql = "SELECT s.nama_siswa as nama, SUM(j.jumlah_halaman_dibaca) as totalHalaman FROM jurnal j JOIN siswa s ON j.id_siswa = s.id_siswa GROUP BY s.id_siswa HAVING totalHalaman > 0 ORDER BY totalHalaman DESC";
    return $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
}

function getTeacherDashboardData($conn) {
    $students_result = $conn->query("SELECT id_siswa, nama_siswa, email, password, kelas FROM siswa");
    $students = []; $studentMap = [];
    while($row = $students_result->fetch_assoc()) {
        $student_data = ['idSiswa' => $row['id_siswa'], 'nama' => $row['nama_siswa'], 'email' => $row['email'], 'password' => $row['password'], 'kelas' => $row['kelas']];
        $students[] = $student_data; $studentMap[$row['id_siswa']] = $student_data;
    }
    $classes = array_column($conn->query("SELECT nama_kelas FROM kelas")->fetch_all(MYSQLI_ASSOC), 'nama_kelas');
    $journals_result = $conn->query("SELECT * FROM jurnal ORDER BY timestamp_input DESC");
    $journals = [];
    while($row = $journals_result->fetch_assoc()) {
        $studentInfo = $studentMap[$row['id_siswa']] ?? null;
        $journals[] = [
            'idJurnal' => $row['id_jurnal'], 'timestamp' => $row['timestamp_input'], 'tanggalBaca' => date('d/m/Y', strtotime($row['tanggal_baca'])),
            'judulBuku' => $row['judul_buku'] ?? '', 'penulis' => $row['penulis'], 'halaman' => $row['jumlah_halaman_dibaca'], 'ringkasan' => $row['ringkasan'], 'mood' => $row['mood'],
            'namaSiswa' => $studentInfo['nama'] ?? 'Siswa Dihapus', 'kelasSiswa' => $studentInfo['kelas'] ?? 'N/A'
        ];
    }
    return compact('students', 'classes', 'journals');
}

function getAllTargets($conn) { return $conn->query("SELECT id_target as idTarget, email_siswa as email, judul_target as title, tipe_target as type, nilai_target as targetValue, status as status FROM target")->fetch_all(MYSQLI_ASSOC); }
function getAllStudentBadges($conn) { return $conn->query("SELECT email_siswa as email, id_lencana as badgeId, tanggal_didapat as date FROM lencana_siswa")->fetch_all(MYSQLI_ASSOC); }

function addClass($conn, $d) { $stmt = $conn->prepare("INSERT INTO `kelas` (`nama_kelas`) VALUES (?)"); $stmt->bind_param("s", $d['className']); $stmt->execute(); return ['status' => "success"]; }
function deleteClass($conn, $d) { $stmt = $conn->prepare("DELETE FROM `kelas` WHERE `nama_kelas` = ?"); $stmt->bind_param("s", $d['className']); $stmt->execute(); return ['status' => "success"]; }

function addStudent($conn, $d) {
    $newId = generate_id('SISWA-');
    $stmt = $conn->prepare("INSERT INTO `siswa` (`id_siswa`, `nama_siswa`, `email`, `password`, `kelas`) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $newId, $d['nama'], $d['email'], $d['password'], $d['kelas']);
    $stmt->execute();
    return ['status' => "success"];
}

function updateStudent($conn, $d) {
    if (!empty($d['password'])) {
        $stmt = $conn->prepare("UPDATE `siswa` SET `nama_siswa` = ?, `email` = ?, `password` = ?, `kelas` = ? WHERE `id_siswa` = ?");
        $stmt->bind_param("sssss", $d['nama'], $d['email'], $d['password'], $d['kelas'], $d['idSiswa']);
    } else {
        $stmt = $conn->prepare("UPDATE `siswa` SET `nama_siswa` = ?, `email` = ?, `kelas` = ? WHERE `id_siswa` = ?");
        $stmt->bind_param("ssss", $d['nama'], $d['email'], $d['kelas'], $d['idSiswa']);
    }
    $stmt->execute();
    return ['status' => "success"];
}

function deleteStudent($conn, $d) { $stmt = $conn->prepare("DELETE FROM `siswa` WHERE `id_siswa` = ?"); $stmt->bind_param("s", $d['idSiswa']); $stmt->execute(); return ['status' => "success"]; }

function queryToJSON($conn, $sql) { return $conn->query($sql)->fetch_all(MYSQLI_ASSOC); }
function deleteRowById($conn, $tableName, $id, $idColumnName) {
    if ($id === null) throw new Exception("ID untuk dihapus tidak boleh kosong.");
    $stmt = $conn->prepare("DELETE FROM `$tableName` WHERE `$idColumnName` = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    if ($stmt->affected_rows > 0) return ['message' => 'Data berhasil dihapus.'];
    throw new Exception('Data tidak ditemukan untuk dihapus.');
}

function getCouponManagementData($conn) {
    $historySql = "SELECT rp.id_penukaran, rp.email_siswa, rp.id_hadiah, rp.kupon_dikeluarkan, rp.tanggal_tukar, rp.status, s.nama_siswa, h.nama_hadiah FROM riwayat_penukaran rp LEFT JOIN siswa s ON rp.email_siswa = s.email LEFT JOIN hadiah h ON rp.id_hadiah = h.id_hadiah ORDER BY rp.tanggal_tukar DESC";
    $historyRaw = queryToJSON($conn, $historySql);
    $historyWithStudentNames = array_map(function($h) {
        return [
            'idPenukaran' => $h['id_penukaran'], 'emailSiswa' => $h['email_siswa'], 'idHadiah' => $h['id_hadiah'], 
            'kuponDikeluarkan' => $h['kupon_dikeluarkan'], 'tanggalTukar' => $h['tanggal_tukar'], 'status' => $h['status'], 
            'namaSiswa' => $h['nama_siswa'] ?? 'Siswa Dihapus', 'namaHadiah' => $h['nama_hadiah'] ?? 'Hadiah Dihapus'
        ];
    }, $historyRaw);
    return [
        'couponTypes' => queryToJSON($conn, "SELECT id_kupon_tipe AS idKuponTipe, capaian, jumlah_kupon AS jumlahKupon, deskripsi FROM kupon"), 
        'prizes' => queryToJSON($conn, "SELECT id_hadiah AS idHadiah, nama_hadiah AS namaHadiah, kupon_dibutuhkan AS kuponDibutuhkan, deskripsi FROM hadiah"),
        'studentCoupons' => queryToJSON($conn, "SELECT id_kupon_siswa AS idKuponSiswa, email_siswa AS emailSiswa, id_kupon_tipe AS idKuponTipe, tanggal_dapat AS tanggalDapat, status FROM kupon_siswa"), 
        'redemptionHistory' => $historyWithStudentNames,
        'students' => queryToJSON($conn, "SELECT id_siswa as idSiswa, nama_siswa as nama, email as email, password as password, kelas as kelas FROM siswa"),
        'classes' => array_column(queryToJSON($conn, "SELECT nama_kelas FROM kelas"), 'nama_kelas')
    ];
}

function addCouponType($conn, $data) {
    $newId = $data['idKuponTipe'] ?? generate_id('CT-');
    $stmt = $conn->prepare("INSERT INTO `kupon` (`id_kupon_tipe`, `capaian`, `jumlah_kupon`, `deskripsi`) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $newId, $data['capaian'], $data['jumlahKupon'], $data['deskripsi']);
    $stmt->execute();
    return ['message' => "Tipe kupon berhasil ditambahkan."];
}

function addPrize($conn, $data) {
    $newId = $data['idHadiah'] ?? generate_id('H-');
    $stmt = $conn->prepare("INSERT INTO `hadiah` (`id_hadiah`, `nama_hadiah`, `kupon_dibutuhkan`, `deskripsi`) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $newId, $data['namaHadiah'], $data['kuponDibutuhkan'], $data['deskripsi']);
    $stmt->execute();
    return ['message' => "Hadiah berhasil ditambahkan."];
}

function giveCoupons($conn, $data) {
    $jumlahKupon = (int)($data['jumlah'] ?? 1);
    $stmt = $conn->prepare("INSERT INTO `kupon_siswa` (`id_kupon_siswa`, `email_siswa`, `id_kupon_tipe`, `tanggal_dapat`, `status`) VALUES (?, ?, ?, NOW(), 'Tersedia')");
    for ($i = 0; $i < $jumlahKupon; $i++) {
        $newId = generate_id('SK-') . $i;
        $stmt->bind_param("sss", $newId, $data['emailSiswa'], $data['idKuponTipe']);
        $stmt->execute();
    }
    return ['message' => "Kupon berhasil diberikan."];
}

function redeemPrize($conn, $data) {
    $emailSiswa = $data['emailSiswa'] ?? null;
    $idHadiah = $data['idHadiah'] ?? null;
    $kuponDibutuhkan = (int)($data['kuponDibutuhkan'] ?? 0);
    $conn->begin_transaction();
    try {
        $stmt_check = $conn->prepare("SELECT `id_kupon_siswa` FROM `kupon_siswa` WHERE `email_siswa` = ? AND `status` = 'Tersedia' LIMIT ? FOR UPDATE");
        $stmt_check->bind_param("si", $emailSiswa, $kuponDibutuhkan);
        $stmt_check->execute();
        $result = $stmt_check->get_result();
        if ($result->num_rows < $kuponDibutuhkan) throw new Exception("Kupon siswa tidak mencukupi.");
        $coupon_ids = array_column($result->fetch_all(MYSQLI_ASSOC), 'id_kupon_siswa');
        $placeholders = implode(',', array_fill(0, count($coupon_ids), '?'));
        $stmt_update = $conn->prepare("UPDATE `kupon_siswa` SET `status` = 'Ditukar' WHERE `id_kupon_siswa` IN ($placeholders)");
        $stmt_update->bind_param(str_repeat('s', count($coupon_ids)), ...$coupon_ids);
        $stmt_update->execute();
        $newId = generate_id('R-');
        $stmt_history = $conn->prepare("INSERT INTO `riwayat_penukaran` (`id_penukaran`, `email_siswa`, `id_hadiah`, `kupon_dikeluarkan`, `tanggal_tukar`, `status`) VALUES (?, ?, ?, ?, NOW(), 'Ditukar')");
        $stmt_history->bind_param("sssi", $newId, $emailSiswa, $idHadiah, $kuponDibutuhkan);
        $stmt_history->execute();
        $conn->commit();
        return ['message' => 'Kupon berhasil ditukar!'];
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

function updateRedemptionStatus($conn, $data) {
    $stmt = $conn->prepare("UPDATE `riwayat_penukaran` SET `status` = ? WHERE `id_penukaran` = ?");
    $stmt->bind_param("ss", $data['status'], $data['idPenukaran']);
    $stmt->execute();
    if ($stmt->affected_rows > 0) return ['message' => 'Status hadiah berhasil diperbarui.'];
    throw new Exception("ID Penukaran tidak ditemukan.");
}

function getStudentListOnly($conn) {
    $sql = "SELECT id_siswa as idSiswa, nama_siswa as nama, email as email, kelas as kelas FROM siswa WHERE nama_siswa IS NOT NULL AND nama_siswa != ''";
    return $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
}