/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  nama: string;
  role: 'Apoteker' | 'Petugas Gudang' | 'Admin';
}

export interface Obat {
  id: string;
  kodeObat: string;
  nama: string;
  produsen: string;
  jumlah: number;
  satuan: 'Tablet' | 'Botol' | 'Kapsul' | 'Pcs' | 'Kaplet' | 'Salep';
  tanggalExpired: string; // Format: YYYY-MM-DD
  rakPenyimpanan?: string; // Additional professional touch: Storage rack loc
  deskripsi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransaksiObat {
  id: string;
  obatId: string;
  kodeObat: string;
  namaObat: string;
  tipe: 'Masuk' | 'Keluar'; // Masuk (Restock), Keluar (Digunakan/Terjual)
  jumlah: number;
  keterangan: string;
  petugas: string;
  tanggal: string; // Format ISO string or YYYY-MM-DD HH:mm
}

export interface DashboardStats {
  totalObat: number;
  stokMenipis: number;
  hampirExpired: number;
  totalMasuk: number;
  totalKeluar: number;
}
