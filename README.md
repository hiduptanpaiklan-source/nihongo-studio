# Nihongo Studio

Materi pembelajaran Bahasa Jepang untuk siswa SMK. Website statis dengan 6 halaman, 22 sesi latihan, dan 220 soal. Semua halaman memakai HTML, CSS, serta JavaScript biasa.

## Publikasi melalui GitHub Pages

1. Masuk ke GitHub dan buat repository baru bernama `nihongo-studio` dengan status **Public**.
2. Unggah **isi folder ini**, bukan file ZIP-nya, langsung ke root repository: `index.html`, lima HTML lainnya, folder `assets`, dan file pendukung.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Source: Deploy from a branch**; **Branch: main**; **Folder: / (root)**, lalu **Save**.
5. Buka situs di `https://USERNAME.github.io/nihongo-studio/` dengan mengganti USERNAME sesuai akun GitHub.

Situs bisa dibuka langsung dengan membuka `index.html` di browser. Audio mengandalkan fitur pembacaan Jepang di browser/perangkat (Web Speech API), **bukan audio MP3 bawaan**. Kualitas suara berbeda antarperangkat dan mungkin membutuhkan koneksi internet atau paket bahasa Jepang.

Nilai dan progres disimpan di `localStorage` browser pada perangkat pengunjung, bukan database online, dan tidak otomatis berpindah antarperangkat. Semua berkas dalam repo Public bisa diakses umum. Jangan mengunggah data pribadi siswa atau kunci API ke repository.
