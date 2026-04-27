---
title: "Masuk Recovery Mode Ubuntu Untuk Repair Ubuntu Broken Package"
published: 2024-07-28T08:53:40.000Z
updated: 2024-08-29T07:05:18.000Z
tags: []
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "repair-ubuntu-broken-package"
featuredImage: "/content/images/2024/08/recovery-mode.webp"
excerpt: "Hampir install ulang karena ubuntu broken setelah install package tambahan buat jalanin suatu aplikasi. Booting ga bisa, terminal ga bisa. Disini saya coba buat masuk ke recovery mode Awalnya Saya..."
---

Hampir install ulang karena ubuntu broken setelah install package tambahan buat jalanin suatu aplikasi. Booting ga bisa, terminal ga bisa. Disini saya coba buat masuk ke recovery mode

## Awalnya

Saya mau install beberapa package tambahan nih buat software edit video `Davinci Resolve` mengikuti video youtube, hanya saja hal apes terjadi.

```sh
➜  DaVinci_Resolve_18.6.6_Linux sudo dpkg --configure -a
dpkg: error processing package libpango-1.0-0:i386 (--configure):
 package libpango-1.0-0:i386 1.52.1+ds-1build1 cannot be configured because libpango-1.0-0:amd64 is at a different version (1.50.6+ds-2ubuntu1)
dpkg: error processing package libgdk-pixbuf-2.0-0:i386 (--configure):
 package libgdk-pixbuf-2.0-0:i386 2.42.10+dfsg-3ubuntu3.1 cannot be configured because libgdk-pixbuf-2.0-0:amd64 is at a different version (2.42.8+dfsg-1ubuntu0.3)
dpkg: error processing package libpangoft2-1.0-0:i386 (--configure):
 package libpangoft2-1.0-0:i386 1.52.1+ds-1build1 cannot be configured because libpangoft2-1.0-0:amd64 is at a different version (1.50.6+ds-2ubuntu1)
dpkg: error processing package libpangocairo-1.0-0:i386 (--configure):
 package libpangocairo-1.0-0:i386 1.52.1+ds-1build1 cannot be configured because libpangocairo-1.0-0:amd64 is at a different version (1.50.6+ds-2ubuntu1)
Processing triggers for libc-bin (2.39-0ubuntu8.2) ...
Errors were encountered while processing:
 libpango-1.0-0:i386
 libgdk-pixbuf-2.0-0:i386
 libpangoft2-1.0-0:i386
 libpangocairo-1.0-0:i386
```

Erroorr mulu, saya coba restart anddd. Ga bisa boot, white screen of death

![White Screen Of Death - Feedback - Zorin Forum](https://forum.zorin.com/uploads/default/original/2X/8/80abbe9d7ced76c708044e52ef837b0b2495f7c3.jpeg)

Dan kepikiran mau install ulang, coba beberapa hal possible buat di coba yaitu booting ke recovery mode

## Recovery Mode

1.  Reboot
2.  Setelah pop-up bios, langsung tahan `shift + esc`
3.  Masuk ke Advanced -> pilih versi kernel yang ada `(recovery mode)`
4.  Setelah booting, pilih `dpkg`
5.  Nantinya akan ada pengecekan & penyelsaian masalah untuk kesalahan installasi.