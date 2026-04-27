---
title: "Install n8n in Minutes – Your Automation Journey Starts Here"
published: 2025-05-28T02:43:44.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "n8n-docker-install"
featuredImage: "/content/images/2025/05/n8n-twnb-1.png"
excerpt: "n8n adalah alat otomatisasi alur kerja (workflow automation) yang kuat dan fleksibel. Ini memungkinkan untuk menghubungkan berbagai aplikasi dan service, otomasi tugas, dan membangun alur kerja yang..."
---

`n8n` adalah alat otomatisasi alur kerja (workflow automation) yang kuat dan fleksibel. Ini memungkinkan untuk menghubungkan berbagai aplikasi dan service, otomasi tugas, dan membangun alur kerja yang kompleks tanpa perlu menulis kode. Dengan n8n, Anda dapat membuat integrasi kustom, memproses data, dan mengotomatiskan hampir semua hal yang dapat Anda bayangkan.

## Installasi dengan docker

1.  Create compose file

```sh
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Asia/Jakarta
      - TZ=Asia/Jakarta
      - NODE_ENV=production
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.id/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:

```

2.  Compose Up!

```sh
sudo docker compose up -d

```

3.  Akses di `<ip-server>:5678`

![](/content/images/2025/05/image.png)

## Reverse Proxy di nginx

### Menggunakan Nginx Proxy Manager

1.  **Login ke Nginx Proxy Manager (NPM)**: .
2.  **Tambahkan Proxy Host Baru**:
    -   Klik `Add Proxy Host`.
    -   **Details**:
        -   `Domain Names`: Masukkan domain yang akan Anda gunakan untuk n8n (misalnya, `n8n.yourdomain.id`).
        -   `Scheme`: `http` (karena n8n di dalam Docker berjalan di http, NPM akan menangani HTTPS).
        -   `Forward Hostname / IP`: Masukkan IP lokal server Docker Anda atau nama layanan Docker jika NPM berjalan di jaringan Docker yang sama (misalnya, `n8n` jika Anda menggunakan nama layanan Docker).
        -   `Forward Port`: `5678` (port n8n di dalam container).
        -   `Websockets Support`: Centang untuk mengaktifkan websocket
    -   **SSL**:
        -   Pilih `Request a new SSL Certificate`.
        -   Centang `Force SSL`, `HTTP/2 Support`.
        -   Masukkan alamat email Anda untuk notifikasi.
        -   Setujui persyaratan Let's Encrypt.
3.  **Save**: Simpan konfigurasi Proxy Host Anda.
4.  **Verifikasi**: Setelah sertifikat SSL diterbitkan, Anda seharusnya bisa mengakses n8n melalui domain Anda dengan HTTPS (misalnya, `https://n8n.yourdomain.id/`).