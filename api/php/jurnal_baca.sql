-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2025 at 07:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jurnal_baca`
--

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

CREATE TABLE `guru` (
  `email` varchar(255) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`email`, `nama`, `password`) VALUES
('guru@kelastkj.online', 'Game Master', 'gurukusayang');

-- --------------------------------------------------------

--
-- Table structure for table `hadiah`
--

CREATE TABLE `hadiah` (
  `id_hadiah` varchar(50) NOT NULL,
  `nama_hadiah` varchar(255) DEFAULT NULL,
  `kupon_dibutuhkan` int(11) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hadiah`
--

INSERT INTO `hadiah` (`id_hadiah`, `nama_hadiah`, `kupon_dibutuhkan`, `deskripsi`) VALUES
('a', 'Makan Camilan di Kelas', 2, 'Makan camilan ringan (biskuit, permen) 10 menit di kelas.'),
('b', 'Istirahat Ekstra 5 Menit', 2, '5 menit istirahat tambahan untuk mengobrol/bersantai.'),
('c', 'Pilih Lagu Pembuka Kelas', 3, 'Pilih lagu untuk diputar 5 menit sebelum pelajaran.'),
('d', 'Tunjuk Teman Maju', 4, 'Pilih teman untuk presentasi jurnal atau jawab pertanyaan TKJ.'),
('e', 'Waktu Kreatif Teknologi', 4, '15 menit buat meme/poster/video pendek TKJ.'),
('f', 'Pamer Jurnal Keren', 5, 'Presentasi jurnal favorit (5 menit) di kelas.'),
('g', 'Pilih Tugas Kreatif TKJ', 6, 'Pilih tugas TKJ (poster, program Python).'),
('h', 'Stiker Teknologi', 3, 'Stiker laptop/kode atau permen “Pembaca Hebat”.'),
('H-1752334528969', 'Merubah Alpa Jadi Hadir', 18, 'Satu catatan absen alpa pelajaran diubah menjadi hadir'),
('H-1752334587316', 'Merubah Sakit Jadi Hadir', 16, 'Satu catatan absen sakit diubah menjadi hadir'),
('H-1752334644300', 'Uang Saku Rp10.000', 20, 'Siswa mendapat uang saku Rp10.000 dari guru'),
('i', 'Sertifikat Literasi TKJ', 6, 'Sertifikat sederhana, diumumkan di kelas.'),
('j', 'Open Book Saat Ujian', 10, 'Gunakan catatan saat ulangan TKJ (bukan ujian semester).'),
('k', 'Melihat Teman Saat Ujian', 15, 'Lihat pekerjaan teman saat ulangan, dengan pengawasan.'),
('l', 'Tidur Sebentar (10 Menit)', 12, 'Istirahat kepala di meja 10 menit, saat diskusi.'),
('m', 'Jadi DJ Kelas (15 Menit)', 8, 'Pilih playlist 15 menit saat praktikum, sesuai aturan.'),
('n', 'Pilih Tempat Duduk Bebas', 10, 'Pilih tempat duduk satu hari, tanpa ganggu pelajaran.'),
('o', 'Izin Telat Masuk (5 Menit)', 12, 'Masuk kelas 5 menit terlambat tanpa sanksi, sekali pakai.');

-- --------------------------------------------------------

--
-- Table structure for table `jurnal`
--

CREATE TABLE `jurnal` (
  `id_jurnal` varchar(50) NOT NULL,
  `id_siswa` varchar(50) DEFAULT NULL,
  `email_siswa` varchar(255) DEFAULT NULL,
  `timestamp_input` datetime DEFAULT NULL,
  `tanggal_baca` datetime DEFAULT NULL,
  `judul_buku` varchar(255) DEFAULT NULL,
  `penulis` varchar(255) DEFAULT NULL,
  `jumlah_halaman_dibaca` int(11) DEFAULT NULL,
  `ringkasan` text DEFAULT NULL,
  `mood` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jurnal`
--

INSERT INTO `jurnal` (`id_jurnal`, `id_siswa`, `email_siswa`, `timestamp_input`, `tanggal_baca`, `judul_buku`, `penulis`, `jumlah_halaman_dibaca`, `ringkasan`, `mood`) VALUES
('JRNL-1752687932504', 'S-1751881109759', 'utuh@gmail.com', '2025-07-17 01:45:32', '2025-07-17 19:45:32', '1000 lembar', 'Utuh Karbit', 1000, '1000', '🤔');

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `nama_kelas` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`nama_kelas`) VALUES
('X-TKJ-1'),
('X-TKJ-2'),
('XI-TKJ-1'),
('XI-TKJ-2');

-- --------------------------------------------------------

--
-- Table structure for table `kupon`
--

CREATE TABLE `kupon` (
  `id_kupon_tipe` varchar(10) NOT NULL,
  `capaian` varchar(255) DEFAULT NULL,
  `jumlah_kupon` int(11) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kupon`
--

INSERT INTO `kupon` (`id_kupon_tipe`, `capaian`, `jumlah_kupon`, `deskripsi`) VALUES
('a', 'Lencana Langkah Pertama', 1, 'Membuat jurnal pertamamu.'),
('b', 'Lencana Mulai Terbiasa', 2, 'Mencatat jurnal 3 hari berturut-turut.'),
('c', 'Lencana Pemanasan', 3, 'Mencapai total 100 halaman.'),
('d', 'Lencana Kutu Buku', 3, 'Membaca 5 buku berbeda.'),
('e', 'Lencana Pelari Maraton', 4, 'Total 100 halaman dibaca (kumulatif).'),
('f', '10 Jurnal dalam Sebulan', 5, 'Tulis 20 jurnal dalam sebulan — laporkan ke guru untuk klaim kupon.'),
('g', 'Membaca 3 Buku Berbeda', 5, 'Buat target di menu Target Bacaan dan selesaikan!'),
('h', 'Membaca Artikel TKJ', 3, 'Tulis jurnal teknologi (pemrograman/jaringan) — dinilai guru untuk kupon.'),
('i', 'Membaca 200 Halaman', 7, 'Buat target di menu Target Bacaan dan selesaikan!'),
('j', 'Ringkasan Jurnal Kreatif', 3, 'Ringkasan jurnal kreatif, dinilai guru.'),
('k', 'Membaca 500 Halaman', 10, 'Buat target di menu Target Bacaan dan selesaikan!');

-- --------------------------------------------------------

--
-- Table structure for table `kupon_siswa`
--

CREATE TABLE `kupon_siswa` (
  `id_kupon_siswa` varchar(50) NOT NULL,
  `email_siswa` varchar(255) DEFAULT NULL,
  `id_kupon_tipe` varchar(10) DEFAULT NULL,
  `tanggal_dapat` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kupon_siswa`
--

INSERT INTO `kupon_siswa` (`id_kupon_siswa`, `email_siswa`, `id_kupon_tipe`, `tanggal_dapat`, `status`) VALUES
('SK-1752334091450', 'utuh@gmail.com', 'c', '2025-07-12 23:28:11', 'Ditukar'),
('SK-1752334091987', 'utuh@gmail.com', 'c', '2025-07-12 23:28:12', 'Ditukar'),
('SK-1752334092463', 'utuh@gmail.com', 'c', '2025-07-12 23:28:12', 'Ditukar'),
('SK-1752334692671', 'utuh@gmail.com', 'k', '2025-07-12 23:38:13', 'Ditukar'),
('SK-1752334692826', 'utuh@gmail.com', 'k', '2025-07-12 23:38:13', 'Ditukar'),
('SK-1752334693820', 'utuh@gmail.com', 'k', '2025-07-12 23:38:14', 'Ditukar'),
('SK-1752334694075', 'utuh@gmail.com', 'k', '2025-07-12 23:38:14', 'Ditukar'),
('SK-1752334694323', 'utuh@gmail.com', 'k', '2025-07-12 23:38:14', 'Ditukar'),
('SK-1752334694555', 'utuh@gmail.com', 'k', '2025-07-12 23:38:15', 'Ditukar'),
('SK-1752334694791', 'utuh@gmail.com', 'k', '2025-07-12 23:38:15', 'Ditukar'),
('SK-1752334695613', 'utuh@gmail.com', 'k', '2025-07-12 23:38:16', 'Ditukar'),
('SK-1752334696757', 'utuh@gmail.com', 'k', '2025-07-12 23:38:17', 'Ditukar'),
('SK-1752334696991', 'utuh@gmail.com', 'k', '2025-07-12 23:38:17', 'Ditukar'),
('SK-1752334707188', 'utuh@gmail.com', 'k', '2025-07-12 23:38:27', 'Ditukar'),
('SK-1752334707335', 'utuh@gmail.com', 'k', '2025-07-12 23:38:27', 'Ditukar'),
('SK-1752334707616', 'utuh@gmail.com', 'k', '2025-07-12 23:38:28', 'Ditukar'),
('SK-1752334707826', 'utuh@gmail.com', 'k', '2025-07-12 23:38:28', 'Ditukar'),
('SK-1752334708860', 'utuh@gmail.com', 'k', '2025-07-12 23:38:29', 'Ditukar'),
('SK-1752334709415', 'utuh@gmail.com', 'k', '2025-07-12 23:38:29', 'Ditukar'),
('SK-1752334709679', 'utuh@gmail.com', 'k', '2025-07-12 23:38:30', 'Ditukar'),
('SK-1752334709924', 'utuh@gmail.com', 'k', '2025-07-12 23:38:30', 'Ditukar'),
('SK-1752334710210', 'utuh@gmail.com', 'k', '2025-07-12 23:38:30', 'Ditukar'),
('SK-1752334711164', 'utuh@gmail.com', 'k', '2025-07-12 23:38:31', 'Ditukar');

-- --------------------------------------------------------

--
-- Table structure for table `lencana_siswa`
--

CREATE TABLE `lencana_siswa` (
  `email_siswa` varchar(255) NOT NULL,
  `id_lencana` varchar(50) NOT NULL,
  `tanggal_didapat` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lencana_siswa`
--

INSERT INTO `lencana_siswa` (`email_siswa`, `id_lencana`, `tanggal_didapat`) VALUES
('utuh@gmail.com', 'BACA_100_HALAMAN', '2025-07-17 01:43:39'),
('utuh@gmail.com', 'MARATON_500', '2025-07-17 01:45:32'),
('utuh@gmail.com', 'PEMBACA_PEMULA', '2025-07-17 01:43:39');

-- --------------------------------------------------------

--
-- Table structure for table `riwayat_penukaran`
--

CREATE TABLE `riwayat_penukaran` (
  `id_penukaran` varchar(50) NOT NULL,
  `email_siswa` varchar(255) DEFAULT NULL,
  `id_hadiah` varchar(50) DEFAULT NULL,
  `kupon_dikeluarkan` int(11) DEFAULT NULL,
  `tanggal_tukar` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `riwayat_penukaran`
--

INSERT INTO `riwayat_penukaran` (`id_penukaran`, `email_siswa`, `id_hadiah`, `kupon_dikeluarkan`, `tanggal_tukar`, `status`) VALUES
('R-1752334223520', 'utuh@gmail.com', 'h', 3, '2025-07-12 23:30:24', 'Digunakan'),
('R-1752334809542', 'utuh@gmail.com', 'H-1752334644300', 20, '2025-07-12 23:40:10', 'Digunakan');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `id_siswa` varchar(50) NOT NULL,
  `nama_siswa` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `kelas` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id_siswa`, `nama_siswa`, `email`, `password`, `kelas`) VALUES
('S-1751881109759', 'DIAN LESTARI', 'utuh@gmail.com', 'a12345678', 'XI-TKJ-1');

-- --------------------------------------------------------

--
-- Table structure for table `target`
--

CREATE TABLE `target` (
  `id_target` varchar(50) NOT NULL,
  `email_siswa` varchar(255) DEFAULT NULL,
  `judul_target` varchar(255) DEFAULT NULL,
  `tipe_target` varchar(50) DEFAULT NULL,
  `nilai_target` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `target`
--

INSERT INTO `target` (`id_target`, `email_siswa`, `judul_target`, `tipe_target`, `nilai_target`, `status`) VALUES
('TGT-1752687907674', 'utuh@gmail.com', '100 lembar', 'halaman', 1000, 'Selesai');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `hadiah`
--
ALTER TABLE `hadiah`
  ADD PRIMARY KEY (`id_hadiah`);

--
-- Indexes for table `jurnal`
--
ALTER TABLE `jurnal`
  ADD PRIMARY KEY (`id_jurnal`),
  ADD KEY `idx_id_siswa` (`id_siswa`),
  ADD KEY `idx_email_siswa` (`email_siswa`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`nama_kelas`);

--
-- Indexes for table `kupon`
--
ALTER TABLE `kupon`
  ADD PRIMARY KEY (`id_kupon_tipe`);

--
-- Indexes for table `kupon_siswa`
--
ALTER TABLE `kupon_siswa`
  ADD PRIMARY KEY (`id_kupon_siswa`),
  ADD KEY `idx_email_siswa` (`email_siswa`),
  ADD KEY `idx_id_kupon_tipe` (`id_kupon_tipe`);

--
-- Indexes for table `lencana_siswa`
--
ALTER TABLE `lencana_siswa`
  ADD PRIMARY KEY (`email_siswa`,`id_lencana`);

--
-- Indexes for table `riwayat_penukaran`
--
ALTER TABLE `riwayat_penukaran`
  ADD PRIMARY KEY (`id_penukaran`),
  ADD KEY `idx_email_siswa` (`email_siswa`),
  ADD KEY `idx_id_hadiah` (`id_hadiah`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id_siswa`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `idx_kelas` (`kelas`);

--
-- Indexes for table `target`
--
ALTER TABLE `target`
  ADD PRIMARY KEY (`id_target`),
  ADD KEY `idx_email_siswa` (`email_siswa`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `jurnal`
--
ALTER TABLE `jurnal`
  ADD CONSTRAINT `fk_jurnal_email_siswa` FOREIGN KEY (`email_siswa`) REFERENCES `siswa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_jurnal_id_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kupon_siswa`
--
ALTER TABLE `kupon_siswa`
  ADD CONSTRAINT `fk_kupon_siswa_email` FOREIGN KEY (`email_siswa`) REFERENCES `siswa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_kupon_tipe` FOREIGN KEY (`id_kupon_tipe`) REFERENCES `kupon` (`id_kupon_tipe`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lencana_siswa`
--
ALTER TABLE `lencana_siswa`
  ADD CONSTRAINT `fk_lencana_siswa_email` FOREIGN KEY (`email_siswa`) REFERENCES `siswa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `riwayat_penukaran`
--
ALTER TABLE `riwayat_penukaran`
  ADD CONSTRAINT `fk_riwayat_email_siswa` FOREIGN KEY (`email_siswa`) REFERENCES `siswa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_riwayat_id_hadiah` FOREIGN KEY (`id_hadiah`) REFERENCES `hadiah` (`id_hadiah`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `fk_siswa_kelas` FOREIGN KEY (`kelas`) REFERENCES `kelas` (`nama_kelas`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `target`
--
ALTER TABLE `target`
  ADD CONSTRAINT `fk_target_email_siswa` FOREIGN KEY (`email_siswa`) REFERENCES `siswa` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;