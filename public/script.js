const API_URL = '${window.location.origin}/api';
let lastId = 0;

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
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const webpBase64 = canvas.toDataURL('image/webp', 0.7);
        resolve(webpBase64);
      };
      
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
  });
}

document.getElementById('lapor-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const nama = document.getElementById('nama').value;
  const lokasi = document.getElementById('lokasi').value;
  const isi = document.getElementById('isi').value;
  const file = document.getElementById('gambar').files[0] || null;
  
  try {
    const gambar = await convertToWebPBase64(file);
    
    const response = await fetch(`${API_URL}/laporan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nama, lokasi, isi, gambar })
    });
    
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('output').innerHTML = `
        <p style="color:green;">Laporan berhasil dikirim!</p>
      `;
      document.getElementById('lapor-form').reset();
      loadLaporan();
    } else {
      throw new Error('Gagal mengirim laporan');
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('output').innerHTML = `
      <p style="color:red;">❌ Terjadi kesalahan saat mengirim laporan.</p>
    `;
  }
});

async function loadLaporan() {
  try {
    const response = await fetch(`${API_URL}/laporan`);
    const laporan = await response.json();
    
    const container = document.getElementById('laporan-container');
    container.innerHTML = '';
    
    if (laporan.length === 0) {
      container.innerHTML = '<p class="no-data">Belum ada laporan masuk.</p>';
      return;
    }
    
    laporan.forEach((data) => {
      if (data.id > lastId) {
        lastId = data.id;
      }
      
      const card = document.createElement('div');
      card.classList.add('card');
      
      const imgElement = data.gambar
        ? `<img src="${data.gambar}" alt="Gambar laporan" class="thumbnail">`
        : '';
      
      card.innerHTML = `
        <p class="nama"><strong>Oleh:</strong> ${data.nama}</p>
        <p class="lokasi"><strong>Lokasi:</strong> ${data.lokasi}</p>
        <p>${data.isi}</p>
        ${imgElement}
        <p class="tanggal"><strong>Tanggal:</strong> ${new Date().toLocaleString()}</p>
      `;
      
      if (data.gambar) {
        const img = card.querySelector('.thumbnail');
        img.addEventListener('click', () => {
          openModal(data.gambar);
        });
      }
      
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading laporan:', error);
  }
}

async function pollNewLaporan() {
  try {
    const response = await fetch(`${API_URL}/laporan/latest?lastId=${lastId}`);
    const newLaporan = await response.json();
    
    if (newLaporan.length > 0) {
      const container = document.getElementById('laporan-container');
      
      newLaporan.forEach((data) => {
        lastId = data.id;
        
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.animation = 'slideIn 0.5s ease';
        
        const imgElement = data.gambar
          ? `<img src="${data.gambar}" alt="Gambar laporan" class="thumbnail">`
          : '';
        
        card.innerHTML = `
          <p class="nama"><strong>Oleh:</strong> ${data.nama}</p>
          <p class="lokasi"><strong>Lokasi:</strong> ${data.lokasi}</p>
          <p>${data.isi}</p>
          ${imgElement}
          <p class="tanggal"><strong>Tanggal:</strong> ${new Date().toLocaleString()}</p>
        `;
        
        if (data.gambar) {
          const img = card.querySelector('.thumbnail');
          img.addEventListener('click', () => {
            openModal(data.gambar);
          });
        }
        
        container.insertBefore(card, container.firstChild);
      });
    }
  } catch (error) {
    console.error('Error polling new laporan:', error);
  }
}

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.querySelector('.modal-close');

function openModal(imageSrc) {
  modalImg.src = imageSrc;
  modal.classList.add('active');
}

closeBtn.onclick = () => modal.classList.remove('active');
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.remove('active');
};

loadLaporan();

setInterval(pollNewLaporan, 3000);