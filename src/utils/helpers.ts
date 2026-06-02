/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Format currency or decimal numbers
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

// Convert ISO date or YYYY-MM-DD to Indonesian human-friendly date
export function formatDate(dateStr: string, includeTime = false): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    
    // Check invalid date
    if (isNaN(d.getTime())) return dateStr;

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    let formatted = `${date} ${month} ${year}`;
    
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      formatted += ` pukul ${hours}:${minutes} WIB`;
    }
    
    return formatted;
  } catch (e) {
    return dateStr;
  }
}

// Calculate days remaining until expiry from 2026-06-02
export function getDaysToExpiry(expiryDateStr: string): { days: number; isUnder3Months: boolean; statusLabel: string; isExpired: boolean } {
  const currentDate = new Date("2026-06-02T12:53:18Z");
  const expDate = new Date(expiryDateStr);
  
  const timeDiff = expDate.getTime() - currentDate.getTime();
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  const isUnder3Months = days >= 0 && days <= 90;
  const isExpired = days < 0;
  
  let statusLabel = "Aman";
  if (isExpired) {
    statusLabel = "Kedaluwarsa";
  } else if (days <= 30) {
    statusLabel = "Sangat Kritis (< 30 Hari)";
  } else if (days <= 90) {
    statusLabel = "Hampir Kedaluwarsa (< 3 Bulan)";
  }
  
  return {
    days,
    isUnder3Months,
    statusLabel,
    isExpired
  };
}

// Generate code block formatted string
export const folderStructureTree = `
├── / (Direktori Utama Proyek Node.js/Express)
│   ├── package.json               # Konfigurasi dependensi, build & start script
│   ├── server.ts                  # Backend Server (Node.js Express / Entry-point)
│   ├── tsconfig.json              # Konfigurasi compiler TypeScript
│   ├── .env                       # File rahasia berisi Port, DB credentials, JWT secret
│   ├── /data                      # Folder penyimpanan lokal (File DB imitasi JSON)
│   │   └── db.json                # Storage file JSON state database
│   ├── /src                       # Folder Utama Frontend (React.js SPA)
│   │   ├── main.tsx               # Point masuk rendering React
│   │   ├── App.tsx                # Komponen Utama Layout & Manajemen State
│   │   ├── index.css              # Entrypoint file stylesheet Tailwind CSS
│   │   ├── types.ts               # Interface Typescript untuk DB Models & API
│   │   ├── /components            # Komponen modular UI yang dapat digunakan kembali
│   │   │   ├── Login.tsx          # Komponen Form login Multi-Role
│   │   │   ├── AlertBannerList.tsx# Penampil Alert Stok < 5 & Expired < 3 Bulan
│   │   │   ├── MedicineTable.tsx  # Komponen Grid Inventori & action button CRUD
│   │   │   ├── MedicineFormModal.tsx # Modal popup penambahan & sunting obat
│   │   │   ├── TransactionLogs.tsx# List log transaksi inventarisasi obat
│   │   │   └── ArchitectureGuide.tsx # Dashboard Panduan Migrasi SQL & Code Controller
│   │   └── /utils
│   │       └── helpers.ts         # Utility pemformatan tanggal, rupiah, dan status
`;

export const sqlMigrationSchema = `-- Skema Migrasi Database Relasional (MySQL / PostgreSQL)
-- Sistem Informasi Penyimpanan dan Stok Obat

-- 1. Tabel Pengguna (Admin/Apoteker/Petugas Gudang)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Menyimpan hash bcrypt/argon2
  nama VARCHAR(100) NOT NULL,
  role ENUM('Apoteker', 'Petugas Gudang', 'Admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Master Data Obat
CREATE TABLE IF NOT EXISTS obat (
  id VARCHAR(50) PRIMARY KEY,
  kode_obat VARCHAR(30) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  produsen VARCHAR(100) NOT NULL,
  jumlah INT NOT NULL DEFAULT 0 CHECK (jumlah >= 0),
  satuan ENUM('Tablet', 'Botol', 'Kapsul', 'Pcs', 'Kaplet', 'Salep') NOT NULL,
  tanggal_expired DATE NOT NULL,
  rak_penyimpanan VARCHAR(100) DEFAULT 'Belum Ditentukan',
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Log Transaksi Obat (Masuk/Keluar)
CREATE TABLE IF NOT EXISTS transaksi_obat (
  id VARCHAR(50) PRIMARY KEY,
  obat_id VARCHAR(50) NOT NULL,
  kode_obat VARCHAR(30) NOT NULL,
  nama_obat VARCHAR(150) NOT NULL,
  tipe ENUM('Masuk', 'Keluar') NOT NULL,
  jumlah INT NOT NULL CHECK (jumlah > 0),
  keterangan VARCHAR(255) NOT NULL,
  petugas VARCHAR(100) NOT NULL,
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (obat_id) REFERENCES obat(id) ON DELETE CASCADE
);

-- Indexing untuk optimasi query pencarian dan validasi expired
CREATE INDEX idx_obat_kode ON obat(kode_obat);
CREATE INDEX idx_obat_expired ON obat(tanggal_expired);
CREATE INDEX idx_transaksi_tanggal ON transaksi_obat(tanggal);

-- Penambahan Data Awal (Seeder) Pengguna default (Password terenkripsi asli)
-- Untuk login demo: bcrypt('rahasiagudang123') = '$2b$10$vY3P8/E3j...'
INSERT INTO users (id, username, password, nama, role) VALUES 
('u1', 'apoteker', '$2b$10$7v59nF56Cis.BfW4Fz7Rve1T21v/Kj3A8d9D98gG9K72oZqU/Z6R2', 'Apt. Naura Almira, S.Farm.', 'Apoteker'),
('u2', 'gudang', '$2b$10$7v59nF56Cis.BfW4Fz7Rve1T21v/Kj3A8d9D98gG9K72oZqU/Z6R2', 'Budi Santoso', 'Petugas Gudang'),
('u3', 'admin', '$2b$10$7v59nF56Cis.BfW4Fz7Rve1T21v/Kj3A8d9D98gG9K72oZqU/Z6R2', 'Drs. Hendrawan, M.Si.', 'Admin');
`;

export const controllerBoilerplate = `/**
 * Controller utama penyimpanan stok obat menggunakan Node.js (Express) & SQL (Knex / Sequelize)
 * Lokasi Penulisan: /controllers/obatController.js atau /controllers/obatController.ts
 */

import { Request, Response } from "express";
import databaseConnection from "../config/database"; // Koneksi database pool pool-mysql / pg

export class ObatController {
  
  // 1. Ambil List Data Obat (Mendukung Pencarian & Filter)
  public static async getAll(req: Request, res: Response) {
    try {
      const { search, unit, statusAlert } = req.query;
      let query = databaseConnection("obat").select("*");

      if (search) {
        query = query.where(function() {
          this.where("nama", "like", \`%\${search}%\`)
              .orWhere("kode_obat", "like", \`%\${search}%\`);
        });
      }

      if (unit) {
        query = query.where("satuan", unit as string);
      }

      const currentDateStr = "2026-06-02"; // Tanggal patokan/current timezone
      const listObat = await query;

      // Filter status di level controller/DB
      let filteredObat = [...listObat];
      if (statusAlert === "low") {
        filteredObat = filteredObat.filter(o => o.jumlah < 5);
      } else if (statusAlert === "expired_soon") {
        filteredObat = filteredObat.filter(o => {
          const expDate = new Date(o.tanggal_expired);
          const currDate = new Date(currentDateStr);
          const diffDays = Math.ceil((expDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));
          return diffDays >= 0 && diffDays <= 90;
        });
      }

      return res.status(200).json(filteredObat);
    } catch (error: any) {
      return res.status(500).json({ message: "Gagal mengambil data obat", error: error.message });
    }
  }

  // 2. Tambah Data Obat Baru & Auto-Log Transaksi
  public static async create(req: Request, res: Response) {
    const { kode_obat, nama, produsen, jumlah, satuan, tanggal_expired, rak_penyimpanan, deskripsi, petugas_nama } = req.body;

    if (!kode_obat || !nama || !produsen || jumlah === undefined || !satuan || !tanggal_expired) {
      return res.status(400).json({ message: "Field wajib data obat tidak lengkap!" });
    }

    const transaction = await databaseConnection.transaction();
    try {
      // Periksa duplikasi kode obat
      const [existingObat] = await transaction("obat").where("kode_obat", kode_obat);
      if (existingObat) {
        await transaction.rollback();
        return res.status(400).json({ message: \`Kode obat \${kode_obat} sudah pernah didaftarkan!\` });
      }

      const uuidObat = \`ob-\${Math.random().toString(36).substring(2, 9)}\`;
      const uuidTx = \`tr-\${Math.random().toString(36).substring(2, 9)}\`;

      // Simpan data obat baru
      await transaction("obat").insert({
        id: uuidObat,
        kode_obat: kode_obat.toUpperCase(),
        nama,
        produsen,
        jumlah,
        satuan,
        tanggal_expired,
        rak_penyimpanan: rak_penyimpanan || "Belum Ditentukan",
        deskripsi: deskripsi || ""
      });

      // Auto Insert Log Transaksi Obat Masuk Pertama kali
      await transaction("transaksi_obat").insert({
        id: uuidTx,
        obat_id: uuidObat,
        kode_obat: kode_obat.toUpperCase(),
        nama_obat: nama,
        tipe: "Masuk",
        jumlah: jumlah,
        keterangan: "Inventarisasi obat baru / Stok Masuk Pertama.",
        petugas: petugas_nama || "Sistem Otomatis"
      });

      await transaction.commit();
      return res.status(201).json({
        success: true,
        message: "Data obat dan log transaksi baru berhasil disimpan!",
        id: uuidObat
      });

    } catch (error: any) {
      await transaction.rollback();
      return res.status(500).json({ message: "Gagal menyimpan data obat baru", error: error.message });
    }
  }

  // 3. Sunting Data Obat & Auto-Log Transaksi Selisih Stok
  public static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { kode_obat, nama, produsen, jumlah, satuan, tanggal_expired, rak_penyimpanan, deskripsi, petugas_nama } = req.body;

    const transaction = await databaseConnection.transaction();
    try {
      const [currentObat] = await transaction("obat").where("id", id).forUpdate();
      if (!currentObat) {
        await transaction.rollback();
        return res.status(404).json({ message: "Data obat tidak ditemukan di gudang!" });
      }

      // Validasi kode obat duplikat
      if (kode_obat) {
        const [duplicateCode] = await transaction("obat").where("kode_obat", kode_obat).whereNot("id", id);
        if (duplicateCode) {
          await transaction.rollback();
          return res.status(400).json({ message: "Kode obat sudah dipakai di obat lain!" });
        }
      }

      const originalJumlah = currentObat.jumlah;
      const targetJumlah = jumlah !== undefined ? Number(jumlah) : originalJumlah;

      // Update data obat
      await transaction("obat").where("id", id).update({
        kode_obat: kode_obat ? kode_obat.toUpperCase() : currentObat.kode_obat,
        nama: nama || currentObat.nama,
        produsen: produsen || currentObat.produsen,
        jumlah: targetJumlah,
        satuan: satuan || currentObat.satuan,
        tanggal_expired: tanggal_expired || currentObat.tanggal_expired,
        rak_penyimpanan: rak_penyimpanan !== undefined ? rak_penyimpanan : currentObat.rak_penyimpanan,
        deskripsi: deskripsi !== undefined ? deskripsi : currentObat.deskripsi
      });

      // Bandingkan selisih stok untuk auto-log transaksi
      if (originalJumlah !== targetJumlah) {
        const selisih = targetJumlah - originalJumlah;
        const tipeTx = selisih > 0 ? "Masuk" : "Keluar";
        const absSelisih = Math.abs(selisih);
        const uuidTx = \`tr-\${Math.random().toString(36).substring(2, 9)}\`;

        await transaction("transaksi_obat").insert({
          id: uuidTx,
          obat_id: id,
          kode_obat: (kode_obat || currentObat.kode_obat).toUpperCase(),
          nama_obat: nama || currentObat.nama,
          tipe: tipeTx,
          jumlah: absSelisih,
          keterangan: selisih > 0 
            ? "Penambahan stok obat (Penerimaan Restock)" 
            : "Pengurangan stok obat (Resep / Terjual / Rusak)",
          petugas: petugas_nama || "Sistem Otomatis"
        });
      }

      await transaction.commit();
      return res.status(200).json({ success: true, message: "Data obat berhasil di-update!" });

    } catch (error: any) {
      await transaction.rollback();
      return res.status(500).json({ message: "Gagal memperbaharui data obat", error: error.message });
    }
  }

  // 4. Hapus Data Obat dan Catat Log Keluar Kosong
  public static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const { petugas_nama } = req.query;

    const transaction = await databaseConnection.transaction();
    try {
      const [currentObat] = await transaction("obat").where("id", id);
      if (!currentObat) {
        await transaction.rollback();
        return res.status(404).json({ message: "Data obat tidak ditemukan!" });
      }

      const uuidTx = \`tr-\${Math.random().toString(36).substring(2, 9)}\`;

      // Catat pengeluaran total sebelum dihapus dari tabel utama
      await transaction("transaksi_obat").insert({
        id: uuidTx,
        obat_id: id,
        kode_obat: currentObat.kode_obat,
        nama_obat: currentObat.nama,
        tipe: "Keluar",
        jumlah: currentObat.jumlah,
        keterangan: "Penghapusan data obat dari sistem (Stok akhir dikosongkan).",
        petugas: (petugas_nama as string) || "Sistem Otomatis"
      });

      // Hapus dari database
      await transaction("obat").where("id", id).delete();

      await transaction.commit();
      return res.status(200).json({ success: true, message: \`Obat \${currentObat.nama} berhasil dihapus dari sistem.\` });

    } catch (error: any) {
      await transaction.rollback();
      return res.status(500).json({ message: "Gagal menghapus data obat", error: error.message });
    }
  }
}
`;
