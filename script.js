import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZmkKMbsS2eeQhlABO_pch9HrkGVujGnk",
  authDomain: "laporpakdes.firebaseapp.com",
  projectId: "laporpakdes",
  storageBucket: "laporpakdes.firebasestorage.app",
  messagingSenderId: "558950220803",
  appId: "1:558950220803:web:dc2ff1914d7b6b6da03a36",
  measurementId: "G-ZMWMKTWQV4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("laporForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const lokasi = document.getElementById("lokasi").value;
  const isi = document.getElementById("isi").value;

  try {
    await addDoc(collection(db, "laporan"), {
      nama: nama,
      lokasi: lokasi,
      isi: isi,
      tanggal: new Date().toLocaleString()
    });

    document.getElementById("output").innerHTML = `
      <p style="color:green;">Laporan berhasil dikirim!</p>
    `;

    document.getElementById("laporForm").reset();
  } catch (error) {
    console.error("Gagal mengirim laporan: ", error);
    document.getElementById("output").innerHTML = `
      <p style="color:red;">Terjadi kesalahan saat mengirim laporan.</p>
    `;
  }
});
