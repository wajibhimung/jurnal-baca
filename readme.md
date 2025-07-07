# Aplikasi Jurnal Baca Siswa


Aplikasi Jurnal Baca Siswa adalah sebuah web app modern dan responsif yang dirancang untuk meningkatkan minat baca siswa, khususnya di lingkungan sekolah kejuruan (TKJ). Aplikasi ini memungkinkan siswa untuk mencatat (CRUD) jurnal baca mereka, sementara guru dapat memantau aktivitas membaca, mengelola data siswa dan kelas, serta melihat statistik membaca secara keseluruhan.

Aplikasi ini dibangun dengan arsitektur modern yang memisahkan frontend dan backend:
-   **Frontend:** HTML, CSS, dan JavaScript (menggunakan Bootstrap 5) yang di-hosting secara statis.
-   **Backend:** Google Sheets sebagai database yang dikelola oleh Google Apps Script sebagai API.

---

## ✨ Fitur Utama

### Untuk Siswa:
-   🔐 **Login Aman:** Halaman login untuk masuk ke dasbor pribadi.
-   📖 **CRUD Jurnal:** Siswa dapat membuat, membaca, memperbarui, dan menghapus entri jurnal baca mereka.
-   🎨 **Tampilan Modern:** Antarmuka yang penuh warna, responsif, dan menarik dengan komponen modern seperti modal dan efek visual.
-   😍 **Ekspresi Mood:** Siswa dapat menambahkan emoji mood untuk setiap buku yang dibaca.
-   🏆 **Papan Peringkat (Leaderboard):** Menampilkan peringkat siswa berdasarkan total halaman yang dibaca untuk memotivasi kompetisi yang sehat.
-   📤 **Bagikan ke Instagram:** Fitur untuk mengubah entri jurnal menjadi gambar yang menarik dan siap untuk dibagikan ke media sosial.

### Untuk Guru:
-   🔐 **Dasbor Guru:** Halaman login terpisah untuk guru dengan akses penuh ke data.
-   📊 **Statistik Visual:** Menampilkan grafik statistik siswa yang paling aktif membaca.
-   🏫 **Manajemen Kelas:** Guru dapat menambah dan menghapus data kelas.
-   👨‍🎓 **Manajemen Siswa:** Guru dapat menambah, mengedit, dan menghapus data siswa.
-   📚 **Monitoring Jurnal:**
    -   Melihat semua jurnal yang di-input oleh siswa.
    -   Melihat detail lengkap setiap jurnal.
    -   Menghapus entri jurnal jika diperlukan.
    -   Memfilter jurnal berdasarkan kelas.
-   📈 **Laporan per Kelas:** Fitur untuk melihat rekapitulasi aktivitas membaca dari setiap siswa dalam satu kelas tertentu.



## 🚀 Instalasi dan Konfigurasi

Untuk menjalankan aplikasi ini di lingkungan Anda sendiri, ikuti langkah-langkah berikut:

### 1. Konfigurasi Backend (Google Sheets & Apps Script)

1.  **Buat Salinan Google Sheet:**
    -   Buka [template Google Sheet berikut](https://docs.google.com/spreadsheets/d/1fjIdB8Px8fZNRMexu_v8iKbAtJKopYprvYD7H8GT8LE/copy).
    -   Klik "Make a copy". Ini akan membuat salinan spreadsheet di Google Drive Anda.
    -   Buka spreadsheet baru tersebut dan catat **ID Spreadsheet** dari URL-nya. Contoh: `https://docs.google.com/spreadsheets/d/INI_ADALAH_ID_NYA/edit`.

2.  **Siapkan Apps Script:**
    -   Di dalam spreadsheet yang baru Anda salin, buka **Extensions > Apps Script**.
    -   Hapus semua kode default di editor.
    -   Salin seluruh isi file `Code.gs` dari repositori ini dan tempelkan ke editor Apps Script.
    -   Di dalam file `Code.gs`, ganti nilai variabel `SPREADSHEET_ID` dengan ID Spreadsheet Anda dari langkah 1.
    
    ```javascript
    const SPREADSHEET_ID = "ID_SPREADSHEET_ANDA_YANG_BARU";
    ```

3.  **Deploy sebagai Web App (API):**
    -   Di editor Apps Script, klik **Deploy > New deployment**.
    -   Klik ikon roda gigi (⚙️) dan pilih **Web app**.
    -   Konfigurasi sebagai berikut:
        -   **Description:** `API Jurnal Baca`
        -   **Execute as:** `Me` (Akun Google Anda)
        -   **Who has access:** `Anyone` (Penting agar frontend bisa mengakses API)
    -   Klik **Deploy**.
    -   Izinkan akses (authorize) saat diminta. Anda mungkin perlu mengklik "Advanced" dan "Go to (unsafe)" karena aplikasi ini belum diverifikasi oleh Google (ini aman).
    -   Salin **Web app URL** yang diberikan. Ini adalah alamat API Anda.

### 2. Konfigurasi Frontend

1.  **Unduh File Frontend:**
    -   Clone atau unduh repositori ini. Anda akan membutuhkan file `index.html`, `siswa.html`, dan `guru.html`.

2.  **Masukkan URL API:**
    -   Buka setiap file HTML (`index.html`, `siswa.html`, `guru.html`) dengan editor teks.
    -   Cari variabel `API_URL` di dalam tag `<script>`.
    -   Ganti URL placeholder dengan **Web app URL** yang Anda dapatkan dari langkah deployment Apps Script.

    ```javascript
    const API_URL = "https://script.google.com/macros/s/URL_API_ANDA_YANG_BARU/exec";
    ```

3.  **Hosting Frontend:**
    -   Upload ketiga file HTML yang sudah diperbarui ke penyedia hosting statis pilihan Anda, seperti:
        -   [Netlify](https://www.netlify.com/)
        -   [Vercel](https://vercel.com/)
        -   [GitHub Pages](https://pages.github.com/)
        -   Firebase Hosting

### 3. Selesai!

Setelah file-file di-hosting, buka URL `index.html` Anda dan aplikasi siap digunakan. Jangan lupa untuk mengisi beberapa data awal di Google Sheet (1 data guru, 1 data kelas, 1 data siswa) untuk pengujian.

