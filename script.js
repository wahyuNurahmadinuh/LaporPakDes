import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js'
import { firebaseConfig } from './config.js'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

function convertToWebPBase64 (file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')

        const maxSize = 800
        let width = img.width
        let height = img.height

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const webpBase64 = canvas.toDataURL('image/webp', 0.7)

        resolve(webpBase64)
      }

      img.onerror = () => reject(new Error('Gagal memproses gambar.'))
    }

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
  })
}

document.getElementById('lapor-form').addEventListener('submit', async (event) => {
  event.preventDefault()

  const nama = document.getElementById('nama').value
  const lokasi = document.getElementById('lokasi').value
  const isi = document.getElementById('isi').value
  const file = document.getElementById('gambar').files[0] || null

  try {
    const base64Webp = await convertToWebPBase64(file)

    await addDoc(collection(db, 'laporan'), {
      nama,
      lokasi,
      isi,
      tanggal: new Date().toLocaleString(),
      gambar: base64Webp || null
    })

    document.getElementById('output').innerHTML = `
      <p style="color:green;">Laporan berhasil dikirim!</p>`
    document.getElementById('lapor-form').reset()
  } catch (error) {
    console.error('Gagal mengirim laporan: ', error)
    document.getElementById('output').innerHTML = `
      <p style="color:red;">Terjadi kesalahan saat mengirim laporan.</p>
    `
  }
})

const laporanContainer = document.getElementById('laporan-container')
const q = query(collection(db, 'laporan'), orderBy('tanggal', 'asc'))

const modal = document.createElement('div')
modal.classList.add('modal')
modal.innerHTML = `
  <span class="modal-close">&times;</span>
  <img src="" alt="Fullscreen">
`
document.body.appendChild(modal)

const modalImg = modal.querySelector('img')
const closeBtn = modal.querySelector('.modal-close')

closeBtn.onclick = () => modal.classList.remove('active')
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.remove('active')
}

onSnapshot(q, (snapshot) => {
  laporanContainer.innerHTML = ''
  snapshot.forEach((doc) => {
    const data = doc.data()
    const card = document.createElement('div')
    card.classList.add('card')

    const imgElement = data.gambar
      ? `<img src="${data.gambar}" alt="Gambar laporan" class="thumbnail">`
      : ''

    card.innerHTML = `
      <p class="nama"><strong>Oleh:</strong> ${data.nama}</p>
      <p class="lokasi"><strong>Lokasi:</strong> ${data.lokasi}</p>
      <p>${data.isi}</p>
      ${imgElement}
      <p class="tanggal"><strong>Tanggal:</strong> ${data.tanggal}</p>
    `

    if (data.gambar) {
      const img = card.querySelector('.thumbnail')
      img.addEventListener('click', () => {
        modalImg.src = data.gambar
        modal.classList.add('active')
      })
    }

    laporanContainer.appendChild(card)
  })
})
