document.getElementById("laporForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const lokasi = document.getElementById("lokasi").value;
  const isi = document.getElementById("isi").value;

  const laporan = {
    nama,
    lokasi,
    isi,
    tanggal: new Date().toLocaleString()
  };

  // Simpan ke localStorage
  let daftarLaporan = JSON.parse(localStorage.getItem("laporan")) || [];
  daftarLaporan.push(laporan);
  localStorage.setItem("laporan", JSON.stringify(daftarLaporan));

  // Tampilkan pesan sukses
  document.getElementById("output").innerHTML = `
    <p style="color:green;">Laporan berhasil dikirim!</p>
  `;

  // Reset form
  document.getElementById("laporForm").reset();
});
