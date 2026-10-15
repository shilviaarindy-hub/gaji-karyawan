
/* =========================================================
   PT COSMETIKA NUSANTARA
   APLIKASI DAFTAR GAJI KARYAWAN
   File: script.js
   ========================================================= */

"use strict";

/* =========================================================
   1. KONFIGURASI DAN PENYIMPANAN
   ========================================================= */

const STORAGE_KEY = "cosmetica_karyawan_v1";

const PERSENTASE_ANAK = 0.07;
const PERSENTASE_PREMI = 0.05;
const PERSENTASE_TAMBAHAN = 0.03;
const PERSENTASE_PPH = 0.13;

const GOLONGAN_PENDIDIKAN = {
  SMP: "I",
  SMA: "II",
  SMK: "III",
  S1: "IV",
  S2: "V",
  S3: "VI"
};

const GAJI_POKOK = {
  "5-10": 3000000,
  "11-15": 4500000,
  "16+": 6000000
};

let karyawan = muatData();
let idSedangDiedit = null;


/* =========================================================
   2. FUNGSI DASAR
   ========================================================= */

// Mengambil elemen HTML berdasarkan ID.
function elemen(id) {
  return document.getElementById(id);
}

// Format angka menjadi Rupiah.
function rupiah(nilai) {
  const angka = Number(nilai) || 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

// Format angka biasa.
function angkaIndonesia(nilai) {
  return new Intl.NumberFormat("id-ID").format(
    Number(nilai) || 0
  );
}

// Menghindari HTML berbahaya ketika menampilkan input pengguna.
function aman(teks) {
  return String(teks ?? "").replace(/[&<>"']/g, function (karakter) {
    const pengganti = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return pengganti[karakter];
  });
}

// Membuat ID unik sederhana untuk data karyawan.
function buatId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9)
  );
}

// Menyimpan data ke browser.
function simpanData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(karyawan)
    );
  } catch (error) {
    console.error("Data tidak dapat disimpan:", error);
    alert(
      "Data tidak berhasil disimpan. Periksa penyimpanan browser Anda."
    );
  }
}

// Membaca data dari browser.
function muatData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const hasil = JSON.parse(data);

    return Array.isArray(hasil) ? hasil : [];
  } catch (error) {
    console.error("Data tidak dapat dibaca:", error);
    return [];
  }
}


/* =========================================================
   3. PERHITUNGAN GAJI
   ========================================================= */

// Menentukan gaji pokok berdasarkan lama bekerja.
function hitungGajiPokok(masaKerja) {
  const tahun = Number(masaKerja) || 0;

  if (tahun >= 5 && tahun <= 10) {
    return GAJI_POKOK["5-10"];
  }

  if (tahun >= 11 && tahun <= 15) {
    return GAJI_POKOK["11-15"];
  }

  if (tahun >= 16) {
    return GAJI_POKOK["16+"];
  }

  return 0;
}

// Menentukan tunjangan masa kerja.
function hitungTunjanganMasaKerja(masaKerja) {
  const tahun = Number(masaKerja) || 0;

  if (tahun > 15) {
    return 300000;
  }

  return 150000;
}

// Tunjangan anak diberikan jika memiliki minimal 3 anak.
function hitungTunjanganAnak(jumlahAnak, gajiPokok) {
  const anak = Number(jumlahAnak) || 0;

  if (anak >= 3) {
    return gajiPokok * PERSENTASE_ANAK;
  }

  return 0;
}

// Menghitung seluruh komponen gaji karyawan.
function hitungGaji(data) {
  const pokok = hitungGajiPokok(data.masaKerja);

  const tunjanganMasaKerja =
    hitungTunjanganMasaKerja(data.masaKerja);

  const tunjanganAnak = hitungTunjanganAnak(
    data.anak,
    pokok
  );

  const premi = pokok * PERSENTASE_PREMI;

  const tambahanKaryawan =
    pokok * PERSENTASE_TAMBAHAN;

  // Total pendapatan sebelum potongan PPh.
  const bruto =
    pokok +
    tunjanganMasaKerja +
    tunjanganAnak +
    premi +
    tambahanKaryawan;

  // Asumsi PPh 13% dipotong dari total pendapatan bruto.
  const pph = bruto * PERSENTASE_PPH;

  const bersih = bruto - pph;

  return {
    pokok,
    tunjanganMasaKerja,
    tunjanganAnak,
    premi,
    tambahanKaryawan,
    bruto,
    pph,
    bersih
  };
}

// Menghitung total gaji seluruh karyawan.
function hitungTotalGaji() {
  return karyawan.reduce(function (total, pegawai) {
    return total + hitungGaji(pegawai).bersih;
  }, 0);
}


/* =========================================================
   4. INFORMASI GOLONGAN PENDIDIKAN
   ========================================================= */

function golonganPendidikan(pendidikan) {
  return GOLONGAN_PENDIDIKAN[pendidikan] || "-";
}

function tampilkanGolongan() {
  const pendidikan = elemen("pendidikan");
  const infoGolongan = elemen("info-golongan");

  if (!pendidikan || !infoGolongan) {
    return;
  }

  const golongan = golonganPendidikan(pendidikan.value);

  infoGolongan.textContent =
    golongan === "-"
      ? "Pilih pendidikan untuk melihat golongan."
      : "Golongan pendidikan: " + golongan;
}


/* =========================================================
   5. PREVIEW GAJI PADA FORM
   ========================================================= */

function perbaruiPreviewGaji() {
  const masaKerja = elemen("masa-kerja");
  const anak = elemen("anak");
  const preview = elemen("preview-gaji");

  if (!masaKerja || !anak || !preview) {
    return;
  }

  const dataSementara = {
    masaKerja: Number(masaKerja.value) || 0,
    anak: Number(anak.value) || 0
  };

  const hasil = hitungGaji(dataSementara);

  preview.textContent = rupiah(hasil.bersih);
}


/* =========================================================
   6. VALIDASI FORM
   ========================================================= */

function ambilDataForm() {
  const nama = elemen("nama");
  const pendidikan = elemen("pendidikan");
  const masaKerja = elemen("masa-kerja");
  const anak = elemen("anak");
  const status = elemen("status");

  if (
    !nama ||
    !pendidikan ||
    !masaKerja ||
    !anak ||
    !status
  ) {
    alert("Form karyawan tidak ditemukan. Periksa index.html.");
    return null;
  }

  const namaNilai = nama.value.trim();
  const pendidikanNilai = pendidikan.value;
  const masaKerjaNilai = Number(masaKerja.value);
  const anakNilai = Number(anak.value);
  const statusNilai = status.value;

  if (!namaNilai) {
    alert("Nama karyawan wajib diisi.");
    nama.focus();
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(
    GOLONGAN_PENDIDIKAN,
    pendidikanNilai
  )) {
    alert("Silakan pilih pendidikan karyawan.");
    pendidikan.focus();
    return null;
  }

  if (
    !Number.isInteger(masaKerjaNilai) ||
    masaKerjaNilai < 5 ||
    masaKerjaNilai > 60
  ) {
    alert("Masa kerja harus berupa angka antara 5 sampai 60 tahun.");
    masaKerja.focus();
    return null;
  }

  if (
    !Number.isInteger(anakNilai) ||
    anakNilai < 0 ||
    anakNilai > 30
  ) {
    alert("Jumlah anak harus berupa angka antara 0 sampai 30.");
    anak.focus();
    return null;
  }

  if (!statusNilai) {
    alert("Silakan pilih status karyawan.");
    status.focus();
    return null;
  }

  return {
    nama: namaNilai,
    pendidikan: pendidikanNilai,
    masaKerja: masaKerjaNilai,
    anak: anakNilai,
    status: statusNilai
  };
}


/* =========================================================
   7. TAMBAH DAN EDIT KARYAWAN
   ========================================================= */

function simpanKaryawan(event) {
  event.preventDefault();

  const dataForm = ambilDataForm();

  if (!dataForm) {
    return;
  }

  if (idSedangDiedit) {
    const indeks = karyawan.findIndex(function (pegawai) {
      return pegawai.id === idSedangDiedit;
    });

    if (indeks === -1) {
      alert("Data karyawan yang akan diedit tidak ditemukan.");
      resetForm();
      return;
    }

    karyawan[indeks] = {
      ...karyawan[indeks],
      ...dataForm
    };

    alert("Data karyawan berhasil diperbarui.");
  } else {
    karyawan.push({
      id: buatId(),
      ...dataForm,
      dibuatPada: new Date().toISOString()
    });

    alert("Karyawan berhasil ditambahkan.");
  }

  simpanData();
  resetForm();
  renderSemua();
}

function editKaryawan(id) {
  const pegawai = karyawan.find(function (item) {
    return item.id === id;
  });

  if (!pegawai) {
    alert("Data karyawan tidak ditemukan.");
    return;
  }

  idSedangDiedit = id;

  elemen("edit-id").value = id;
  elemen("nama").value = pegawai.nama;
  elemen("pendidikan").value = pegawai.pendidikan;
  elemen("masa-kerja").value = pegawai.masaKerja;
  elemen("anak").value = pegawai.anak;
  elemen("status").value = pegawai.status;

  const tombolSimpan = elemen("btn-simpan");

  if (tombolSimpan) {
    tombolSimpan.textContent = "Perbarui Karyawan";
  }

  tampilkanGolongan();
  perbaruiPreviewGaji();

  elemen("employee-form").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  elemen("nama").focus();
}

function resetForm() {
  const form = elemen("employee-form");

  if (form) {
    form.reset();
  }

  idSedangDiedit = null;

  const editId = elemen("edit-id");
  const tombolSimpan = elemen("btn-simpan");

  if (editId) {
    editId.value = "";
  }

  if (tombolSimpan) {
    tombolSimpan.textContent = "Simpan Karyawan";
  }

  tampilkanGolongan();
  perbaruiPreviewGaji();
}


/* =========================================================
   8. HAPUS KARYAWAN
   ========================================================= */

function hapusKaryawan(id) {
  const pegawai = karyawan.find(function (item) {
    return item.id === id;
  });

  if (!pegawai) {
    alert("Data karyawan tidak ditemukan.");
    return;
  }

  const yakin = confirm(
    "Apakah Anda yakin ingin menghapus data karyawan " +
    pegawai.nama +
    "?"
  );

  if (!yakin) {
    return;
  }

  karyawan = karyawan.filter(function (item) {
    return item.id !== id;
  });

  if (idSedangDiedit === id) {
    resetForm();
  }

  simpanData();
  renderSemua();

  alert("Data karyawan berhasil dihapus.");
}


/* =========================================================
   9. MENAMPILKAN TABEL KARYAWAN
   ========================================================= */

function renderTabel() {
  const tabel = elemen("tabel-karyawan");
  const inputCari = elemen("cari");
  const jumlahHasil = elemen("jumlah-hasil");

  if (!tabel) {
    return;
  }

  const kataKunci = inputCari
    ? inputCari.value.trim().toLowerCase()
    : "";

 

const hasilFilter = karyawan.filter(function (pegawai) {
  const golongan = golonganPendidikan(pegawai.pendidikan);

  const teksPencarian = [
    pegawai.nama,
    pegawai.pendidikan,
    golongan,
    "Golongan " + golongan,
    pegawai.masaKerja,
    pegawai.masaKerja + " tahun",
    pegawai.status,
    pegawai.anak,
    pegawai.anak + " anak",
    pegawai.namaAnak,
    pegawai.anakNama,
    pegawai.namaAnak1,
    pegawai.namaAnak2,
    pegawai.namaAnak3,
    ...(Array.isArray(pegawai.daftarAnak)
      ? pegawai.daftarAnak.map(function (anak) {
          return typeof anak === "string"
            ? anak
            : anak && anak.nama
              ? anak.nama
              : "";
        })
      : [])
  ]
    .filter(function (nilai) {
      return nilai !== null && nilai !== undefined;
    })
    .join(" ")
    .toLowerCase();

  return teksPencarian.includes(kataKunci);
});


  if (jumlahHasil) {
    jumlahHasil.textContent =
      hasilFilter.length +
      " dari " +
      karyawan.length +
      " karyawan";
  }

  if (hasilFilter.length === 0) {
    tabel.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <strong>Belum ada data karyawan</strong>
          <span>
            Tambahkan karyawan melalui formulir atau ubah kata pencarian.
          </span>
        </td>
      </tr>
    `;

    return;
  }

  tabel.innerHTML = hasilFilter.map(function (pegawai, indeks) {
    const gaji = hitungGaji(pegawai);
    const golongan = golonganPendidikan(pegawai.pendidikan);

    const statusClass =
      pegawai.status === "Aktif"
        ? "badge-success"
        : "badge-neutral";

    return `
      <tr>
        <td>${indeks + 1}</td>

        <td>
          <span class="employee-name">
            ${aman(pegawai.nama)}
          </span>
          <span class="employee-subtitle">
            ${aman(pegawai.status)}
          </span>
        </td>

        <td>
          ${aman(pegawai.pendidikan)}
          <span class="employee-subtitle">
            Golongan ${aman(golongan)}
          </span>
        </td>

        <td>${angkaIndonesia(pegawai.masaKerja)} tahun</td>

        <td>
          <span class="badge ${statusClass}">
            ${aman(pegawai.status)}
          </span>
        </td>

        <td class="salary-cell">
          ${rupiah(gaji.bersih)}
        </td>

        <td>
          <div class="table-actions">
            <button
              type="button"
              class="btn btn-secondary btn-small"
              data-action="detail"
              data-id="${aman(pegawai.id)}"
              title="Lihat detail gaji"
            >
              Detail
            </button>

            <button
              type="button"
              class="btn btn-secondary btn-small"
              data-action="edit"
              data-id="${aman(pegawai.id)}"
              title="Edit karyawan"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn btn-danger btn-small"
              data-action="hapus"
              data-id="${aman(pegawai.id)}"
              title="Hapus karyawan"
            >
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}


/* =========================================================
   10. DASHBOARD
   ========================================================= */

function renderDashboard() {
  const totalKaryawan = elemen("total-karyawan");
  const totalGaji = elemen("total-gaji");
  const totalAktif = elemen("total-aktif");
  const totalNonaktif = elemen("total-nonaktif");

  const aktif = karyawan.filter(function (pegawai) {
    return pegawai.status === "Aktif";
  }).length;

  const nonaktif = karyawan.length - aktif;

  if (totalKaryawan) {
    totalKaryawan.textContent = angkaIndonesia(karyawan.length);
  }

  if (totalGaji) {
    totalGaji.textContent = rupiah(hitungTotalGaji());
  }

  if (totalAktif) {
    totalAktif.textContent = angkaIndonesia(aktif);
  }

  if (totalNonaktif) {
    totalNonaktif.textContent = angkaIndonesia(nonaktif);
  }
}


/* =========================================================
   11. MODAL DETAIL GAJI
   ========================================================= */

function bukaModal() {
  const modal = elemen("modal-detail");

  if (!modal) {
    return;
  }

  if (typeof modal.showModal === "function") {
    if (!modal.open) {
      modal.showModal();
    }
  } else {
    modal.setAttribute("open", "");
    modal.style.display = "block";
  }
}

function tutupModal() {
  const modal = elemen("modal-detail");

  if (!modal) {
    return;
  }

  if (typeof modal.close === "function" && modal.open) {
    modal.close();
  } else {
    modal.removeAttribute("open");
    modal.style.display = "";
  }
}

function tampilkanDetailGaji(id) {
  const pegawai = karyawan.find(function (item) {
    return item.id === id;
  });

  if (!pegawai) {
    alert("Data karyawan tidak ditemukan.");
    return;
  }

  const hasil = hitungGaji(pegawai);
  const isiDetail = elemen("isi-detail");

  if (!isiDetail) {
    alert("Bagian detail gaji tidak ditemukan di index.html.");
    return;
  }

  isiDetail.innerHTML = `
    <div class="slip-header">
      <h2>PT Cosmetika Nusantara</h2>
      <p>Perusahaan Produk Kosmetik</p>
      <p>Laporan Rincian Gaji Karyawan</p>
    </div>

    <div class="slip-title">Rincian Gaji</div>

    <div class="slip-employee-info">
      <div class="slip-info-item">
        <span>Nama Karyawan</span>
        <strong>${aman(pegawai.nama)}</strong>
      </div>

      <div class="slip-info-item">
        <span>Status Karyawan</span>
        <strong>${aman(pegawai.status)}</strong>
      </div>

      <div class="slip-info-item">
        <span>Pendidikan</span>
        <strong>
          ${aman(pegawai.pendidikan)} —
          Golongan ${aman(golonganPendidikan(pegawai.pendidikan))}
        </strong>
      </div>

      <div class="slip-info-item">
        <span>Masa Kerja</span>
        <strong>${angkaIndonesia(pegawai.masaKerja)} tahun</strong>
      </div>

      <div class="slip-info-item">
        <span>Jumlah Anak</span>
        <strong>${angkaIndonesia(pegawai.anak)} anak</strong>
      </div>

      <div class="slip-info-item">
        <span>Periode</span>
        <strong>${aman(
          new Intl.DateTimeFormat("id-ID", {
            month: "long",
            year: "numeric"
          }).format(new Date())
        )}</strong>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="slip-table">
        <thead>
          <tr>
            <th>Komponen Gaji</th>
            <th>Jumlah</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Gaji Pokok</td>
            <td>${rupiah(hasil.pokok)}</td>
          </tr>

          <tr>
            <td>Tunjangan Masa Kerja</td>
            <td>${rupiah(hasil.tunjanganMasaKerja)}</td>
          </tr>

          <tr>
            <td>Tunjangan Anak</td>
            <td>${rupiah(hasil.tunjanganAnak)}</td>
          </tr>

          <tr>
            <td>Premi (5%)</td>
            <td>${rupiah(hasil.premi)}</td>
          </tr>

          <tr>
            <td>Tambahan Karyawan (3%)</td>
            <td>${rupiah(hasil.tambahanKaryawan)}</td>
          </tr>

          <tr class="slip-total">
            <td>Total Pendapatan Bruto</td>
            <td>${rupiah(hasil.bruto)}</td>
          </tr>

          <tr>
            <td>Potongan PPh (13%)</td>
            <td>− ${rupiah(hasil.pph)}</td>
          </tr>

          <tr class="slip-total">
            <td>Gaji Bersih</td>
            <td>${rupiah(hasil.bersih)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slip-net">
      <div class="slip-net-label">Total Gaji Bersih Diterima</div>
      <div class="slip-net-value">${rupiah(hasil.bersih)}</div>
    </div>

    <div class="slip-signature">
      <div>
        <p>Karyawan,</p>
        <div class="signature-space"></div>
        <p><strong>${aman(pegawai.nama)}</strong></p>
      </div>

      <div>
        <p>Bagian Keuangan,</p>
        <div class="signature-space"></div>
        <p><strong>PT Cosmetika Nusantara</strong></p>
      </div>
    </div>
  `;

  bukaModal();
}


/* =========================================================
   12. CETAK SLIP GAJI
   ========================================================= */

function cetakSlipGaji() {
  const modal = elemen("modal-detail");

  if (!modal) {
    alert("Modal slip gaji tidak ditemukan.");
    return;
  }

  // Aktifkan mode khusus cetak yang didefinisikan di style.css.
  document.body.classList.add("print-slip");

  // Pastikan isi slip dapat dicetak.
  const modalSebelumnyaTerbuka = modal.open;

  if (!modalSebelumnyaTerbuka) {
    bukaModal();
  }

  // Tunggu layout diperbarui sebelum membuka dialog cetak.
  requestAnimationFrame(function () {
    window.print();
  });
}

// Hapus kelas khusus setelah dialog cetak ditutup.
window.addEventListener("afterprint", function () {
  document.body.classList.remove("print-slip");
});


/* =========================================================
   13. CETAK LAPORAN KARYAWAN
   ========================================================= */

function cetakLaporan() {
  document.body.classList.remove("print-slip");
  window.print();
}


/* =========================================================
   14. EVENT LISTENER TABEL
   ========================================================= */

function pasangEventTabel() {
  const tabel = elemen("tabel-karyawan");

  if (!tabel) {
    return;
  }

  tabel.addEventListener("click", function (event) {
    const tombol = event.target.closest("button[data-action]");

    if (!tombol) {
      return;
    }

    const id = tombol.dataset.id;
    const aksi = tombol.dataset.action;

    if (aksi === "detail") {
      tampilkanDetailGaji(id);
    } else if (aksi === "edit") {
      editKaryawan(id);
    } else if (aksi === "hapus") {
      hapusKaryawan(id);
    }
  });
}


/* =========================================================
   15. RENDER SELURUH HALAMAN
   ========================================================= */

function renderSemua() {
  renderTabel();
  renderDashboard();
  perbaruiPreviewGaji();
}


/* =========================================================
   16. NAVIGASI MENU
   ========================================================= */


function pasangNavigasi() {
  const tautan = document.querySelectorAll(".nav-item");

  const halaman = {
    "#dashboard": [
      document.getElementById("dashboard"),
      document.querySelector(".stats")
    ],
    "#form-karyawan": [
      document.getElementById("form-karyawan")
    ],
    "#daftar-karyawan": [
      document.getElementById("daftar-karyawan")
    ],
    "#aturan-gaji": [
      document.getElementById("aturan-gaji")
    ]
  };

  function tampilkanHalaman(target) {
    Object.values(halaman).flat().filter(Boolean).forEach(function (bagian) {
      bagian.style.display = "none";
    });

    (halaman[target] || halaman["#dashboard"])
      .filter(Boolean)
      .forEach(function (bagian) {
        bagian.style.display = "";
      });

    tautan.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === target
      );
    });

    window.scrollTo(0, 0);
  }

  tautan.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      tampilkanHalaman(link.getAttribute("href"));
    });
  });

  tampilkanHalaman("#dashboard");
}



/* =========================================================
   17. INISIALISASI APLIKASI
   ========================================================= */

function mulaiAplikasi() {
  const form = elemen("employee-form");
  const inputCari = elemen("cari");
  const pendidikan = elemen("pendidikan");
  const masaKerja = elemen("masa-kerja");
  const anak = elemen("anak");
  const tombolReset = elemen("btn-reset");
  const tombolCetak = elemen("btn-cetak");
  const tombolTutup = elemen("tutup-modal");
  const tombolCetakSlip = elemen("cetak-slip");
  const modal = elemen("modal-detail");

  if (form) {
    form.addEventListener("submit", simpanKaryawan);
  }

  if (inputCari) {
    inputCari.addEventListener("input", renderTabel);
  }

  if (pendidikan) {
    pendidikan.addEventListener("change", tampilkanGolongan);
  }

  if (masaKerja) {
    masaKerja.addEventListener("input", perbaruiPreviewGaji);
  }

  if (anak) {
    anak.addEventListener("input", perbaruiPreviewGaji);
  }

  if (tombolReset) {
    tombolReset.addEventListener("click", resetForm);
  }

  if (tombolCetak) {
    tombolCetak.addEventListener("click", cetakLaporan);
  }

  if (tombolTutup) {
    tombolTutup.addEventListener("click", tutupModal);
  }

  if (tombolCetakSlip) {
    tombolCetakSlip.addEventListener("click", cetakSlipGaji);
  }

  // Menutup modal jika pengguna mengklik area backdrop.
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        tutupModal();
      }
    });

    // Memastikan modal dibersihkan setelah ditutup.
    modal.addEventListener("close", function () {
      document.body.classList.remove("print-slip");
    });
  }

  pasangEventTabel();
  pasangNavigasi();

  tampilkanGolongan();
  renderSemua();
}

// Jalankan aplikasi setelah HTML selesai dibaca.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mulaiAplikasi);
} else {
  mulaiAplikasi();
}
/* TOMBOL TAMPILKAN / SEMBUNYIKAN STANDAR PENGGAJIAN */

function pasangTombolStandar() {
  const tombol = document.getElementById("btn-standar");
  const konten = document.getElementById("konten-standar");
  const teksTombol = document.getElementById("teks-btn-standar");

  if (!tombol || !konten || !teksTombol) {
    return;
  }

  // Standar disembunyikan ketika halaman pertama kali dibuka.
  konten.hidden = true;
  tombol.setAttribute("aria-expanded", "false");
  teksTombol.textContent = "Lihat Standar Penggajian";

  tombol.addEventListener("click", function () {
    const akanDitampilkan = konten.hidden;

    konten.hidden = !akanDitampilkan;
    tombol.setAttribute("aria-expanded", String(akanDitampilkan));

    teksTombol.textContent = akanDitampilkan
      ? "Sembunyikan Standar Penggajian"
      : "Lihat Standar Penggajian";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", pasangTombolStandar);
} else {
  pasangTombolStandar();
}

