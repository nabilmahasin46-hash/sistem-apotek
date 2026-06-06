import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Obat, TransaksiObat, User } from "./src/types";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// DB helper functions
const DB_PATH = path.join(process.cwd(), "data", "db.json");

interface DBStructure {
  users: User[];
  obat: Obat[];
  transaksi: TransaksiObat[];
}

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Re-create if missing
      const defaultData: DBStructure = { users: [], obat: [], transaksi: [] };
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf8");
      return defaultData;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw) as DBStructure;
  } catch (error) {
    console.error("Error reading database file", error);
    return { users: [], obat: [], transaksi: [] };
  }
}

function writeDB(data: DBStructure) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database file", error);
  }
}

// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------

// 1. Authentication
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  // Real login simulation supporting different apotek personnel roles
  const db = readDB();
  const foundUser = db.users.find(u => u.username === username.toLowerCase());
  
  if (foundUser && password === "rahasiagudang123") {
    return res.json({
      success: true,
      user: foundUser,
      token: `token-${foundUser.id}-${Date.now()}`
    });
  }
  
  if (username === "admin" && password === "admin123") {
    const adminUser = db.users.find(u => u.username === "admin") || {
      id: "u3",
      username: "admin",
      nama: "Administrator",
      role: "Admin" as const
    };
    return res.json({
      success: true,
      user: adminUser,
      token: `token-admin-${Date.now()}`
    });
  }

  if (username === "apoteker" && password === "apoteker123") {
    const apoUser = db.users.find(u => u.username === "apoteker") || {
      id: "u1",
      username: "apoteker",
      nama: "apoteker",
      role: "Apoteker" as const
    };
    return res.json({
      success: true,
      user: apoUser,
      token: `token-apoteker-${Date.now()}`
    });
  }

  if (username === "gudang" && password === "gudang123") {
    const gudUser = db.users.find(u => u.username === "gudang") || {
      id: "u2",
      username: "gudang",
      nama: "orang gudang",
      role: "Petugas Gudang" as const
    };
    return res.json({
      success: true,
      user: gudUser,
      token: `token-gudang-${Date.now()}`
    });
  }

  return res.status(401).json({
    success: false,
    message: "Username atau password salah! (Pilihan: apoteker/apoteker123, gudang/gudang123, admin/admin123)"
  });
});

// Helper for generating custom IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

// 2. Medicine Stok CRUD and Transaction Sync
app.get("/api/obat", (req, res) => {
  const db = readDB();
  res.json(db.obat);
});

app.post("/api/obat", (req, res) => {
  const { kodeObat, nama, produsen, jumlah, satuan, tanggalExpired, rakPenyimpanan, deskripsi, petugasNama } = req.body;
  
  if (!kodeObat || !nama || !produsen || jumlah === undefined || !satuan || !tanggalExpired) {
    return res.status(400).json({ message: "Parameter input stok obat tidak lengkap!" });
  }

  const db = readDB();
  
  // Check duplicate drug code
  const isDuplicate = db.obat.some(o => o.kodeObat.toUpperCase() === kodeObat.toUpperCase());
  if (isDuplicate) {
    return res.status(400).json({ message: `Kode Obat ${kodeObat} sudah terdaftar!` });
  }

  const timestamp = new Date().toISOString();
  const newObat: Obat = {
    id: generateId("ob"),
    kodeObat: kodeObat.toUpperCase(),
    nama,
    produsen,
    jumlah: Number(jumlah),
    satuan,
    tanggalExpired,
    rakPenyimpanan: rakPenyimpanan || "Belum Ditentukan",
    deskripsi: deskripsi || "",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  db.obat.push(newObat);

  // Auto record transaction log for drug storage introduction
  const newTransaction: TransaksiObat = {
    id: generateId("tr"),
    obatId: newObat.id,
    kodeObat: newObat.kodeObat,
    namaObat: newObat.nama,
    tipe: "Masuk",
    jumlah: Number(jumlah),
    keterangan: `Inventarisasi obat baru / Stok Masuk Pertama.`,
    petugas: petugasNama || "Sistem Otomatis",
    tanggal: timestamp
  };

  db.transaksi.unshift(newTransaction);
  writeDB(db);

  res.status(201).json({ success: true, count: newObat, transaction: newTransaction });
});

app.put("/api/obat/:id", (req, res) => {
  const { id } = req.params;
  const { kodeObat, nama, produsen, jumlah, satuan, tanggalExpired, rakPenyimpanan, deskripsi, petugasNama, tipeKustom, keteranganKustom } = req.body;
  
  const db = readDB();
  const obatIndex = db.obat.findIndex(o => o.id === id);
  if (obatIndex === -1) {
    return res.status(404).json({ message: "Obat tidak ditemukan!" });
  }

  const currentObat = db.obat[obatIndex];
  const originalJumlah = currentObat.jumlah;
  const targetJumlah = jumlah !== undefined ? Number(jumlah) : originalJumlah;

  // Check duplicate drug code (excluding self)
  if (kodeObat) {
    const isDuplicate = db.obat.some(o => o.id !== id && o.kodeObat.toUpperCase() === kodeObat.toUpperCase());
    if (isDuplicate) {
      return res.status(400).json({ message: `Kode Obat ${kodeObat} telah digunakan obat lain!` });
    }
  }

  const timestamp = new Date().toISOString();
  const updatedObat: Obat = {
    ...currentObat,
    kodeObat: kodeObat ? kodeObat.toUpperCase() : currentObat.kodeObat,
    nama: nama || currentObat.nama,
    produsen: produsen || currentObat.produsen,
    jumlah: targetJumlah,
    satuan: satuan || currentObat.satuan,
    tanggalExpired: tanggalExpired || currentObat.tanggalExpired,
    rakPenyimpanan: rakPenyimpanan !== undefined ? rakPenyimpanan : currentObat.rakPenyimpanan,
    deskripsi: deskripsi !== undefined ? deskripsi : currentObat.deskripsi,
    updatedAt: timestamp
  };

  db.obat[obatIndex] = updatedObat;

  // Auto stock transaction logging inside controller
  if (originalJumlah !== targetJumlah) {
    const diff = targetJumlah - originalJumlah;
    const tipe = diff > 0 ? "Masuk" : "Keluar";
    const absoluteDiff = Math.abs(diff);

    const defaultKeterangan = diff > 0 
      ? `Penambahan stok obat (Restock)` 
      : `Pengurangan stok obat (Digunakan / Terjual)`;

    const newTransaction: TransaksiObat = {
      id: generateId("tr"),
      obatId: id,
      kodeObat: updatedObat.kodeObat,
      namaObat: updatedObat.nama,
      tipe: tipeCustomOrDefault(),
      jumlah: absoluteDiff,
      keterangan: keteranganKustom || defaultKeterangan,
      petugas: petugasNama || "Sistem Otomatis",
      tanggal: timestamp
    };

    function tipeCustomOrDefault() {
      if (tipeKustom === "Masuk" || tipeKustom === "Keluar") {
        return tipeKustom;
      }
      return tipe;
    }

    db.transaksi.unshift(newTransaction);
  } else if (keteranganKustom) {
    // If quantities are edit-equivalent but there's a custom log
    const newTransaction: TransaksiObat = {
      id: generateId("tr"),
      obatId: id,
      kodeObat: updatedObat.kodeObat,
      namaObat: updatedObat.nama,
      tipe: (tipeKustom as "Masuk" | "Keluar") || "Masuk",
      jumlah: 0,
      keterangan: keteranganKustom,
      petugas: petugasNama || "Sistem Otomatis",
      tanggal: timestamp
    };
    db.transaksi.unshift(newTransaction);
  }

  writeDB(db);
  res.json({ success: true, updated: updatedObat });
});

app.delete("/api/obat/:id", (req, res) => {
  const { id } = req.params;
  const { petugasNama } = req.query; // Query param for logger
  
  const db = readDB();
  const obatIndex = db.obat.findIndex(o => o.id === id);
  if (obatIndex === -1) {
    return res.status(404).json({ message: "Obat tidak ditemukan!" });
  }

  const targetObat = db.obat[obatIndex];
  const timestamp = new Date().toISOString();

  // Log transaction about total removal
  const newTransaction: TransaksiObat = {
    id: generateId("tr"),
    obatId: targetObat.id,
    kodeObat: targetObat.kodeObat,
    namaObat: targetObat.nama,
    tipe: "Keluar",
    jumlah: targetObat.jumlah,
    keterangan: `Penghapusan data obat dari sistem (Stok akhir dikosongkan).`,
    petugas: (petugasNama as string) || "Sistem Otomatis",
    tanggal: timestamp
  };

  db.transaksi.unshift(newTransaction);

  // Remove obat
  db.obat.splice(obatIndex, 1);
  writeDB(db);

  res.json({ success: true, message: `Obat ${targetObat.nama} berhasil dihapus!` });
});

// 3. Transactions List
app.get("/api/transaksi", (req, res) => {
  const db = readDB();
  res.json(db.transaksi);
});

app.post("/api/transaksi", (req, res) => {
  const { obatId, tipe, jumlah, keterangan, petugasNama } = req.body;

  if (!obatId || !tipe || jumlah === undefined) {
    return res.status(400).json({ message: "Parameter transaksi tidak lengkap!" });
  }

  const db = readDB();
  const obatIndex = db.obat.findIndex(o => o.id === obatId);
  if (obatIndex === -1) {
    return res.status(404).json({ message: "Obat terkait tidak ditemukan!" });
  }

  const targetObat = db.obat[obatIndex];
  const numberJumlah = Number(jumlah);
  const timestamp = new Date().toISOString();

  // Enforce inventory rules inside controller
  if (tipe === "Keluar" && targetObat.jumlah < numberJumlah) {
    return res.status(400).json({ 
      message: `Jumlah pengeluaran (${numberJumlah} ${targetObat.satuan}) melebihi stok yang tersedia (${targetObat.jumlah} ${targetObat.satuan})!`
    });
  }

  // Adjust stock
  if (tipe === "Masuk") {
    targetObat.jumlah += numberJumlah;
  } else {
    targetObat.jumlah -= numberJumlah;
  }
  targetObat.updatedAt = timestamp;

  const newTransaction: TransaksiObat = {
    id: generateId("tr"),
    obatId: targetObat.id,
    kodeObat: targetObat.kodeObat,
    namaObat: targetObat.nama,
    tipe,
    jumlah: numberJumlah,
    keterangan: keterangan || (tipe === "Masuk" ? "Penerimaan barang masuk" : "Pengeluaran barang keluar"),
    petugas: petugasNama || "Sistem Otomatis",
    tanggal: timestamp
  };

  db.transaksi.unshift(newTransaction);
  writeDB(db);

  res.status(201).json({ success: true, obat: targetObat, transaction: newTransaction });
});

// 4. Alerts and dashboard stats calculation
app.get("/api/dashboard/stats", (req, res) => {
  const db = readDB();
  
  // Current date anchor for calculations (2026-06-02)
  const currentDate = new Date("2026-06-02T12:53:18Z");
  
  let stokMenipis = 0;
  let hampirExpired = 0;

  db.obat.forEach(o => {
    // 1. Stok menipis < 5 botol/tablet
    if (o.jumlah < 5) {
      stokMenipis++;
    }

    // 2. Expired dalam 3 bulan ke depan (90 hari)
    const expDate = new Date(o.tanggalExpired);
    const timeDiff = expDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff <= 90) {
      hampirExpired++;
    }
  });

  const totalMasuk = db.transaksi.filter(t => t.tipe === "Masuk").reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluar = db.transaksi.filter(t => t.tipe === "Keluar").reduce((sum, t) => sum + t.jumlah, 0);

  res.json({
    totalObat: db.obat.length,
    stokMenipis,
    hampirExpired,
    totalMasuk,
    totalKeluar
  });
});

// Front-end build serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
