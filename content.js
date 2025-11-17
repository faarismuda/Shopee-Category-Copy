// Fungsi untuk mencari container Kategori yang tepat
// Karena Shopee punya banyak filter group (Lokasi, Harga, dll) dengan class sama
function getShopeeCategoryContainer() {
  const filterGroups = document.querySelectorAll(".shopee-filter-group");

  for (const group of filterGroups) {
    const header = group.querySelector(".shopee-filter-group__header");
    // Cek apakah header mengandung kata "Kategori" (case insensitive)
    if (header && header.textContent.toLowerCase().includes("kategori")) {
      return group;
    }
  }
  return null;
}

// Fungsi untuk expand kategori (klik tombol "Lainnya")
async function expandShopeeCategories(container) {
  // Cari tombol "Lainnya" di dalam container kategori
  const toggleBtn = container.querySelector(".shopee-filter-group__toggle-btn");

  // Jika tombol ada dan attribute aria-expanded="false" (belum terbuka)
  if (toggleBtn && toggleBtn.getAttribute("aria-expanded") === "false") {
    toggleBtn.click();
    // Tunggu sebentar agar DOM ter-update
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

// Fungsi untuk mengambil teks kategori
function extractShopeeCategories(container) {
  const categories = [];

  // Ambil semua label checkbox di dalam container kategori
  const labels = container.querySelectorAll(".shopee-checkbox__label");

  labels.forEach((label) => {
    const text = label.textContent.trim();
    if (text) {
      categories.push(text);
    }
  });

  // Join dengan semicolon
  return categories.join("; ");
}

// Fungsi untuk menambahkan tombol Copy
function addCopyShopeeCategoryButton() {
  // Cek agar tidak duplikat
  if (document.getElementById("shopee-copy-category-btn")) {
    return;
  }

  const categoryContainer = getShopeeCategoryContainer();
  if (!categoryContainer) {
    // Container belum/tidak ditemukan (mungkin loading)
    return;
  }

  // Buat tombol
  const button = document.createElement("button");
  button.id = "shopee-copy-category-btn";
  button.textContent = "Copy Categories";
  button.style.display = "block";
  button.style.margin = "10px 0";
  button.style.padding = "8px 16px";
  button.style.backgroundColor = "#ee4d2d"; // Shopee Orange
  button.style.color = "white";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.width = "100%";

  // Event Listener
  button.addEventListener("click", async () => {
    button.textContent = "Expanding...";
    button.disabled = true;

    try {
      // 1. Expand dulu
      await expandShopeeCategories(categoryContainer);

      // 2. Extract
      button.textContent = "Copying...";
      const categoryText = extractShopeeCategories(categoryContainer);

      // 3. Copy ke clipboard
      await navigator.clipboard.writeText(categoryText);

      // 4. Feedback sukses
      button.textContent = "Copied!";
      button.style.backgroundColor = "#28a745"; // Green success

      setTimeout(() => {
        button.textContent = "Copy Categories";
        button.style.backgroundColor = "#ee4d2d";
        button.disabled = false;
      }, 2000);
    } catch (err) {
      console.error("Failed:", err);
      button.textContent = "Error!";
      setTimeout(() => {
        button.textContent = "Copy Categories";
        button.disabled = false;
      }, 2000);
    }
  });

  // Masukkan tombol di atas header kategori agar mudah diakses
  // atau bisa juga di appendChild ke dalam categoryContainer
  categoryContainer.insertBefore(button, categoryContainer.firstChild);
}

// --- Inisialisasi ---

// 1. Cek saat halaman pertama load
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hostname.includes("shopee")) {
    // Beri delay sedikit karena Shopee berat di client-side rendering
    setTimeout(addCopyShopeeCategoryButton, 1500);
  }
});

// 2. Gunakan MutationObserver karena Shopee adalah SPA (Single Page Application)
// Element sering berubah tanpa reload page
const observer = new MutationObserver((mutations) => {
  // Kita batasi frekuensi pengecekan agar tidak memberatkan browser
  if (!document.getElementById("shopee-copy-category-btn")) {
    addCopyShopeeCategoryButton();
  }
});

// Start observing
observer.observe(document.body, { childList: true, subtree: true });