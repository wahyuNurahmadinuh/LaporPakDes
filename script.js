import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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

function convertToWebPBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 600; // batasi ukuran agar file kecil
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const webpBase64 = canvas.toDataURL("image/webp", 0.6);

        const compressed = btoa(
          unescape(encodeURIComponent(webpBase64)).slice(0, 30000)
        );

        resolve(compressed);
      };

      img.onerror = () => reject("Gagal memproses gambar.");
    };

    reader.onerror = () => reject("Gagal membaca file gambar.");
  });
}

document.getElementById("laporForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const nama = document.getElementById("nama").value;
  const lokasi = document.getElementById("lokasi").value;
  const isi = document.getElementById("isi").value;
  const file = document.getElementById("gambar").files[0] || null;

  try {
    const base64Webp = await convertToWebPBase64(file);

    await addDoc(collection(db, "laporan"), {
      nama: nama,
      lokasi: lokasi,
      isi: isi,
      tanggal: new Date().toLocaleString(),
      gambar: base64Webp || null
    });

    document.getElementById("output").innerHTML = `
      <p style="color:green;">Laporan berhasil dikirim!</p>`;
    document.getElementById("laporForm").reset();
  } catch (error) {
    console.error("Gagal mengirim laporan: ", error);
    document.getElementById("output").innerHTML = `
      <p style="color:red;">Terjadi kesalahan saat mengirim laporan.</p>
    `;
  }
});

const laporanContainer = document.getElementById("laporanContainer");
const q = query(collection(db, "laporan"), orderBy("tanggal", "desc"));

onSnapshot(q, (snapshot) => {
  laporanContainer.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <p class="nama">Oleh\t: ${data.nama}</p>
      <p class="lokasi">Di : ${data.lokasi}</p>
      <p>${data.isi}</p>
      <p class="tanggal">Tanggal\t: ${data.tanggal}</p>
    `;

    laporanContainer.appendChild(card);
  });
});