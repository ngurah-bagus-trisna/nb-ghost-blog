---
title: "Membuat VM Ubuntu di hyper-v"
published: 2024-02-01T14:31:56.000Z
updated: 2024-02-01T14:39:22.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "blog-membuat-vm-di-hyper-v"
featuredImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80"
excerpt: "Home-lab #2 Untuk membuat virtual-machine/VM di hyper-v, dapat menggunakan aplikasi hyper-v manager Preparation 1. Membuat switch External. Switch external disini berfungsi untuk vm agar dapat..."
---

> Home-lab #2

Untuk membuat virtual-machine/VM di hyper-v, dapat menggunakan aplikasi hyper-v manager

### Preparation

1.  Membuat switch *External.* Switch external disini berfungsi untuk vm agar dapat mengakses internet local. Jadi disini interface network dari VM akan terkoneksi langsung dengan physical interface dari hyper-v host atau komputer tempat menjalankan. Jadi nantinya, vm akan mendapat IP dari DHCP router

![](/content/images/2024/01/image-4.png)

Buka hyper-v manager, di menu sebelah kanan, pilih *Virtual Switch Manager* *\> External > Create Virtual Switch*

![](/content/images/2024/01/image-5.png)

2.  Sesuaikan nama dari switch, interface yang akan menjadi external network, dan jika sudah sesuai klik *OK* Untuk membuat virtual switch

![](/content/images/2024/01/image-6.png)

### Provisioning VM Ubuntu Server 22.04

1.  Unduh iso ubuntu-server di link [berikut](https://ubuntu.com/download/server?ref=dev.nbtrisna.my.id)

![](/content/images/2024/02/image.png)

2.  Jika iso ubuntu sudah terunduh, selanjutnya buka hyper-v manager, di menu "Actions" sebelah kanan klik *New > Virtual Machine*

![](/content/images/2024/02/image-1.png)

3.  Nantinya akan muncul popup wizard setup virtual machine yang akan di provisioing. Selanjutnya bisa klik *Next*

![](/content/images/2024/02/image-2.png)

4.  Selanjutnya masukan nama virtual machine, dan klik next.

![](/content/images/2024/02/image-3.png)

5.  Untuk menu berikutnya, disini saya memilih VM generasi ke 2 yang telah menggunakan UEFI-Based Firmware. Jika sudah, klik next

![](/content/images/2024/02/image-5.png)

6.  Di menu *Assign Memory*, sesuaikan jumlah memory yang akan dibutuhkan oleh VM. Secara default, vm dalam Hyper-v menggunakan *Dynamic Memory* yaitu memory dalam vm akan berubah secara dinamis tergantung load yang dijalankan dalam VM. Jika sudah diatur, klik *Next*

![](/content/images/2024/02/image-6.png)

7.  Di menu *Configure Networking*, disini pilih connection dengan switch yang tadi dibuat. Jika sudah klik next

![](/content/images/2024/02/image-7.png)

8.  Di menu *Connect Virtual Hard Disk,* pilih *Create a virtual hard disk.* Sesuaikan size dari disk VM. Disini saya memilih 30GB. Jika sudah, klik *Next*

![](/content/images/2024/02/image-8.png)

9.  Di menu *Summary*, jika dirasa tidak ada perubahan, klik *Finish.*

![](/content/images/2024/02/image-10.png)

Hyper-v akan membuat disk, dan VM dalam kondisi Off.

> Step tambahan!!!

Karena disini menggunakan VM generasi 2, perlu menonaktifkan secure boot, jika ingin booting ke ubuntu.

1.  Klik kanan di list VM, klik *Settings..*

![](/content/images/2024/02/image-11.png)

2.  Pilih menu *Security >* Unchecklist *Enable Secure boot*

![](/content/images/2024/02/image-12.png)

Disini juga secara default VM akan menggunakan semua vcpu yang ada dalam Hyper-v Host. Untuk membatasi vcpu bisa ke menu *Processor >* Sesuaikan *Number of virtual processor*

![](/content/images/2024/02/image-13.png)

Jika sudah, Klik *Apply.*

Kembali ke hyper-v manager, untuk menyalakan VM, bisa dengan *Klik kanan list VM > Start,* Atau dengan *Pilih VM > Sebelah kanan Start*

![](/content/images/2024/02/image-14.png)

Untuk mengakses VM, bisa dengan memilih *Connect..* Dan menyalakan VM dengan klik *Start*

![](/content/images/2024/02/image-15.png)

VM Sudah start, dan bisa melanjutkan setup hingga selesai

![](/content/images/2024/02/image-16.png)

* * *