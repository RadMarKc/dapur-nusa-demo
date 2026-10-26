(function () {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const orderForm = document.getElementById("orderForm");
  const paketSelect = document.getElementById("paket");
  const jumlahInput = document.getElementById("jumlah");
  const totalHarga = document.getElementById("totalHarga");
  const modal = document.getElementById("paymentModal");
  const orderSummary = document.getElementById("orderSummary");

  const steps = {
    method: document.getElementById("stepMethod"),
    qris: document.getElementById("stepQris"),
    transfer: document.getElementById("stepTransfer"),
    ewallet: document.getElementById("stepEwallet"),
    success: document.getElementById("stepSuccess"),
  };

  let currentTotal = 0;
  let currentOrder = null;

  const packagePrices = {
    "Paket Hemat - Rp 25.000/pax": 25000,
    "Paket Spesial - Rp 45.000/pax": 45000,
    "Paket Prasmanan - Rp 65.000/pax": 65000,
  };

  function formatRupiah(n) {
    return "Rp " + n.toLocaleString("id-ID");
  }

  navToggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
    });
  });

  function calculateTotal() {
    const paket = paketSelect.value;
    const jumlah = parseInt(jumlahInput.value, 10) || 0;
    const price = packagePrices[paket] || 0;
    currentTotal = price * jumlah;
    totalHarga.textContent = formatRupiah(currentTotal);
  }

  paketSelect.addEventListener("change", calculateTotal);
  jumlahInput.addEventListener("input", calculateTotal);

  document.querySelectorAll("[data-paket]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      paketSelect.value = btn.getAttribute("data-paket");
      calculateTotal();
      document.getElementById("pesan").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () {
        document.getElementById("nama").focus();
      }, 600);
    });
  });

  function showStep(name) {
    Object.keys(steps).forEach(function (key) {
      steps[key].hidden = key !== name;
    });
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  function generateQrisSvg() {
    const size = 25;
    const cell = 7;
    const quiet = 2;
    const total = (size + quiet * 2) * cell;
    let rects = "";

    function finder(x, y) {
      rects += '<rect x="' + (x + quiet) * cell + '" y="' + (y + quiet) * cell + '" width="' + 7 * cell + '" height="' + 7 * cell + '" fill="#000"/>';
      rects += '<rect x="' + (x + quiet + 1) * cell + '" y="' + (y + quiet + 1) * cell + '" width="' + 5 * cell + '" height="' + 5 * cell + '" fill="#fff"/>';
      rects += '<rect x="' + (x + quiet + 2) * cell + '" y="' + (y + quiet + 2) * cell + '" width="' + 3 * cell + '" height="' + 3 * cell + '" fill="#000"/>';
    }

    finder(0, 0);
    finder(size - 7, 0);
    finder(0, size - 7);

    let seed = 987654321;
    function rand() {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    }

    function inFinderZone(x, y) {
      return (
        (x < 8 && y < 8) ||
        (x >= size - 8 && y < 8) ||
        (x < 8 && y >= size - 8)
      );
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (inFinderZone(x, y)) continue;
        if (rand() > 0.52) {
          rects += '<rect x="' + (x + quiet) * cell + '" y="' + (y + quiet) * cell + '" width="' + cell + '" height="' + cell + '" fill="#000"/>';
        }
      }
    }

    const logoX = total / 2 - 3.5 * cell;
    rects += '<rect x="' + logoX + '" y="' + (total / 2 - 3.5 * cell) + '" width="' + 7 * cell + '" height="' + 7 * cell + '" fill="#fff"/>';
    rects += '<rect x="' + (logoX + 0.6 * cell) + '" y="' + (total / 2 - 2.9 * cell) + '" width="' + 5.8 * cell + '" height="' + 5.8 * cell + '" rx="4" fill="#f4610b"/>';
    rects += '<text x="' + total / 2 + '" y="' + (total / 2 + 1.4 * cell) + '" text-anchor="middle" font-size="' + 3 * cell + '" fill="#fff" font-family="Arial" font-weight="bold">QR</text>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" role="img" aria-label="Kode QRIS simulasi">' + rects + "</svg>";
  }

  document.getElementById("qrisCode").innerHTML = generateQrisSvg();

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (currentTotal <= 0) {
      alert("Silakan pilih paket dan isi jumlah pax terlebih dahulu.");
      return;
    }

    const nama = document.getElementById("nama").value;
    const hp = document.getElementById("hp").value;
    const paket = paketSelect.value;
    const jumlah = jumlahInput.value;
    const tanggal = document.getElementById("tanggal").value;
    const alamat = document.getElementById("alamat").value;

    currentOrder = { nama: nama, hp: hp, paket: paket, jumlah: jumlah, tanggal: tanggal, alamat: alamat };

    orderSummary.innerHTML =
      "<strong>" + paket + "</strong><br>" +
      jumlah + " pax • " + formatRupiah(currentTotal) +
      "<br>Acara: " + tanggal + "<br>Atas nama: " + nama;

    document.getElementById("qrisAmount").textContent = formatRupiah(currentTotal);
    document.getElementById("transferAmount").textContent = formatRupiah(currentTotal);
    document.getElementById("transferTotal").textContent = formatRupiah(currentTotal);
    document.getElementById("ewalletAmount").textContent = formatRupiah(currentTotal);

    showStep("method");
  });

  document.querySelectorAll(".pay__method").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showStep(btn.getAttribute("data-method"));
    });
  });

  function successPayment() {
    const code = "DN-" + Date.now().toString().slice(-8);
    document.getElementById("orderCode").textContent =
      "Kode Pesanan: " + code + " • Total: " + formatRupiah(currentTotal);
    showStep("success");
  }

  document.getElementById("simulateQris").addEventListener("click", successPayment);
  document.getElementById("simulateTransfer").addEventListener("click", successPayment);
  document.getElementById("simulateEwallet").addEventListener("click", successPayment);

  const tanggalInput = document.getElementById("tanggal");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tanggalInput.min = tomorrow.toISOString().split("T")[0];
})();
