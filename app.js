// Pengaturan tiap halaman (kunci penyimpanan & data awal) diisi oleh file HTML
const { kunciPenyimpanan, barangDefault } = window.HALAMAN;

// Mengambil data dari LocalStorage
let dataBarang = JSON.parse(localStorage.getItem(kunciPenyimpanan)) || barangDefault;

const productForm = document.getElementById('productForm');
const searchInput = document.getElementById('searchInput');
const sortInput = document.getElementById('sortInput');
const productList = document.getElementById('productList');
const editIndexInput = document.getElementById('editIndex');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');

const formCard = document.getElementById('formCard');

// Mencegah nama barang dibaca sebagai HTML
function escapeHtml(teks) {
    return String(teks).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Format angka ke mata uang Rupiah
function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString('id-ID');
}

// Fungsi Utama: Mengolah Filter, Sort, dan Menampilkan Data
function prosesDanTampilkanData() {
    const kataKunci = searchInput.value.toLowerCase();
    const tipeSort = sortInput.value;

    // Tambahkan index asli ke tiap barang agar posisi data tidak tertukar saat difilter/disort
    let hasil = dataBarang.map((barang, index) => ({ ...barang, indexAsli: index }));

    // 1. Proses Filter Pencarian
    hasil = hasil.filter(barang => {
        return barang.nama.toLowerCase().includes(kataKunci);
    });

    // 2. Proses Pengurutan (Sorting)
    if (tipeSort === 'cheap') {
        hasil.sort((a, b) => a.harga - b.harga); 
    } else if (tipeSort === 'expensive') {
        hasil.sort((a, b) => b.harga - a.harga); 
    }

    // Perbarui ringkasan di kepala halaman
    document.getElementById('statCount').innerText = dataBarang.length;
    document.getElementById('statTotal').innerText = formatRupiah(dataBarang.reduce((total, b) => total + b.harga, 0));

    // 3. Tampilkan ke HTML
    productList.innerHTML = ""; 

    if (hasil.length === 0) {
        productList.innerHTML = `<li class="no-result">Barang tidak ditemukan<small>Coba kata kunci lain atau tambahkan barang baru.</small></li>`;
        return;
    }

    hasil.forEach((barang, urutan) => {
        const li = document.createElement('li');
        li.className = 'product-item';
        li.style.animationDelay = `${Math.min(urutan, 10) * 40}ms`;
        li.innerHTML = `
            <div class="product-info">
                <span class="product-name">${escapeHtml(barang.nama)}</span>
                <span class="product-price">${formatRupiah(barang.harga)}</span>
            </div>
            <div class="action-buttons">
                <button class="btn-edit" onclick="aktifkanModeEdit(${barang.indexAsli})">Edit</button>
                <button class="btn-delete" onclick="hapusBarang(${barang.indexAsli})">Hapus</button>
            </div>
        `;
        productList.appendChild(li);
    });
}

// Fungsi FITUR 1: Aksi Hapus Barang
function hapusBarang(index) {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
        dataBarang.splice(index, 1); // Hapus 1 data pada index terpilih
        simpanKeLocalStorage();
        prosesDanTampilkanData();
        resetForm(); // Reset jika sedang mengedit data yang dihapus
    }
}

// Fungsi FITUR 2: Masuk ke Mode Edit Barang
function aktifkanModeEdit(index) {
    const barang = dataBarang[index];

    // Masukkan data barang yang dipilih ke kolom input form
    editIndexInput.value = index;
    document.getElementById('newPriceName').value = barang.nama;
    document.getElementById('newPriceValue').value = barang.harga;

    // Ubah tampilan teks judul form dan tombol
    formTitle.innerText = "Edit Barang";
    submitBtn.innerText = "Perbarui";
    formCard.classList.add('editing');

    // Scroll otomatis ke area form agar nyaman di perangkat mobile
    productForm.scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk mengembalikan form ke kondisi tambah baru
function resetForm() {
    productForm.reset();
    editIndexInput.value = "";
    formTitle.innerText = "Tambah Barang Baru";
    submitBtn.innerText = "Simpan";
    formCard.classList.remove('editing');
}

// Fungsi menyimpan struktur array ke LocalStorage browser
function simpanKeLocalStorage() {
    localStorage.setItem(kunciPenyimpanan, JSON.stringify(dataBarang));
}

// Event listener ketik & ganti pengurutan
searchInput.addEventListener('input', prosesDanTampilkanData);
sortInput.addEventListener('change', prosesDanTampilkanData);

// Event listener saat Form di-submit (Bisa Tambah Baru atau Update Edit)
productForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nama = document.getElementById('newPriceName').value;
    const harga = parseInt(document.getElementById('newPriceValue').value);
    const indexEdit = editIndexInput.value;

    if (indexEdit === "") {
        // Mode Tambah Barang Baru
        dataBarang.push({ nama: nama, harga: harga });
    } else {
        // Mode Update / Edit Barang Lama
        dataBarang[indexEdit] = { nama: nama, harga: harga };
    }

    simpanKeLocalStorage();
    prosesDanTampilkanData();
    resetForm();
});

// Tampilkan data saat halaman pertama kali dibuka.
prosesDanTampilkanData();
