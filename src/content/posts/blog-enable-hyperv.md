---
title: "Mengaktifkan Hyper-v di Windows 11 untuk lab."
published: 2024-01-30T12:51:14.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "blog-enable-hyperv"
featuredImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80"
excerpt: "Home-lab series #1 Lab sehari-hari sebelum saya migrasi full windows, dengan alasan \"Malas dualboot\" adalah menggunakan KVM (Kernel-based Virtual Machine). Alternatif di windows sendiri Microsoft..."
---

> *Home-lab series #1*

Lab sehari-hari sebelum saya migrasi full windows, dengan alasan *"Malas dualboot"* adalah menggunakan KVM [(Kernel-based Virtual Machine).](https://en.wikipedia.org/wiki/Kernel-based_Virtual_Machine?ref=dev.nbtrisna.my.id) Alternatif di windows sendiri Microsoft menyediakan teknologi Hyper-V sebagai tools virtualisasi yang dapat digunakan untuk menjalankan OS [(Operating system](https://en.wikipedia.org/wiki/Operating_system?ref=dev.nbtrisna.my.id)) secara virtual**.**

## Enable Hyper-V

Refrensi: [https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/about/](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/about/?ref=dev.nbtrisna.my.id)

> Untuk windows yang support dengan hyper-v adalah Windows 10 Pro, Enterprise, and Education.

Pastikan Processor support untuk virtualization. Untuk cek bisa ke Task Manager > Performance > CPU

![](/content/images/2024/01/image-1.png)

1.  Cari *Turn Windows features on or off* di search-bar

![](/content/images/2024/01/image.png)

2.  Aktifkan hyper-v dengan checklist box berikut

![](/content/images/2024/01/image-2.png)

3.  Setelah aktif, reboot. Dan akses hyper-v manager

![](/content/images/2024/01/image-3.png)

Dengan begini sekarang dapat menggunakan hyper-v sebagai tools virtualisasi bawaan di windows-11.