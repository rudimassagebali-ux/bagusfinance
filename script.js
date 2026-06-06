const APP_PIN = "1708";
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

/* ── LOGIN ── */
function checkPin() {
  const pin = document.getElementById("pin-input").value;
  if (pin === APP_PIN) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    render();
  } else {
    document.getElementById("login-error").innerText = "PIN Salah";
  }
}

// Tekan Enter untuk login
document.getElementById("pin-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") checkPin();
});

function logout() {
  document.getElementById("app").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("pin-input").value = "";
  document.getElementById("login-error").innerText = "";
}

/* ── DATA ── */
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction() {
  const date        = document.getElementById("date").value;
  const type        = document.getElementById("type").value;
  const category    = document.getElementById("category").value;
  const amount      = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;

  if (!date || !category || !amount) {
    alert("Lengkapi data terlebih dahulu");
    return;
  }

  transactions.push({ id: Date.now(), date, type, category, amount, description });
  saveData();

  document.getElementById("category").value    = "";
  document.getElementById("amount").value      = "";
  document.getElementById("description").value = "";

  render();
}

function deleteTransaction(id) {
  if (!confirm("Hapus transaksi ini?")) return;
  transactions = transactions.filter(item => item.id !== id);
  saveData();
  render();
}

/* ── FILTER & RENDER ── */
function getFilteredData() {
  const monthFilter = document.getElementById("monthFilter")?.value || "";
  const search      = document.getElementById("search")?.value.toLowerCase() || "";

  return transactions.filter(item => {
    const matchMonth  = monthFilter ? item.date.startsWith(monthFilter) : true;
    const matchSearch = search
      ? item.category.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      : true;
    return matchMonth && matchSearch;
  });
}

function render() {
  const tableBody = document.getElementById("transaction-list");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  let income  = 0;
  let expense = 0;

  getFilteredData().forEach(item => {
    if (item.type === "income") income  += item.amount;
    else                        expense += item.amount;

    const label = item.type === "income" ? "Pemasukan" : "Pengeluaran";

    tableBody.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td>${label}</td>
        <td>${item.category}</td>
        <td>Rp ${item.amount.toLocaleString("id-ID")}</td>
        <td>${item.description}</td>
        <td>
          <button onclick="deleteTransaction(${item.id})">Hapus</button>
        </td>
      </tr>`;
  });

  document.getElementById("income").innerText  = "Rp " + income.toLocaleString("id-ID");
  document.getElementById("expense").innerText = "Rp " + expense.toLocaleString("id-ID");
  document.getElementById("balance").innerText = "Rp " + (income - expense).toLocaleString("id-ID");
}

/* ── EXPORT / BACKUP / RESTORE ── */
function exportCSV() {
  let csv = "Tanggal,Jenis,Kategori,Nominal,Keterangan\n";
  transactions.forEach(item => {
    csv += `${item.date},${item.type},${item.category},${item.amount},${item.description}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href     = URL.createObjectURL(blob);
  link.download = "bagus-medrika-finance.csv";
  link.click();
}

function backupData() {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href     = URL.createObjectURL(blob);
  link.download = "backup-keuangan.json";
  link.click();
}

function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      transactions = JSON.parse(e.target.result);
      saveData();
      render();
      alert("Restore berhasil");
    } catch {
      alert("File tidak valid");
    }
  };
  reader.readAsText(file);
}
