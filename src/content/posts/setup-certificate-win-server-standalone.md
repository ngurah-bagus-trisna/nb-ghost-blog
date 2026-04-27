---
title: "setup certificate win-server (standalone)"
published: 2025-06-05T01:17:00.000Z
updated: 2025-06-21T01:17:44.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "setup-certificate-win-server-standalone"
featuredImage: "https://photoby.nbtrisna.my.id/945c1a6c-9e71-4193-9156-6d23162f9776.jpg"
excerpt: "Intinya, untuk trafik TLS/SSL (Transport Layer Secure) dibutuhkan sebuah Certificate, biasanya terdiri dari CA Certificate, dan Client certifikate (Sertifikat yang akan dipakai)"
---

Refrensi : https://support.n4l.co.nz/s/article/How-to-install-Certificate-Authority-CA-server-and-create-certificates

Intinya, untuk trafik TLS/SSL (Transport Layer Secure) dibutuhkan sebuah Certificate, biasanya terdiri dari CA Certificate, dan Client certifikate (Sertifikat yang akan dipakai)

Prosedurnya :

-   CA Server akan membuat sebuah `ROOT CA`/ Certifikate tersebut harus diinstall di setiap server sebagai trusted root certifikate
-   Setelah itu, kita buat file request misal untuk web `helo.lks1.com`. Nanti nya akan kegenerate file .csr (certificate sign request). Nantinya si server CA akan diminta untuk menandatangani/Sign certifikate tersebut agar valid
-   Import file .csr, lalu akan di sign oleh CA Server, yang nantinya akan menjadi output .pfx/.crt
-   Certificate akan bisa digunakan untuk https.

> Common issue

Sering terjadi seperti `untrusted` padahal sudah `https`, itu bisa terjadi karena `ROOT_CA` tidak terimport secara sempurna di mesin Client. Contohnya,

![Pasted image 20231008155602](https://img.nbtrisna.my.id/Pasted%20image%2020231008155602.png)

## Install

1.  Lanjut pilih Role-based

Add Role & Features, Klik next di bagian `Before you begin`

![Pasted image 20231008155717](https://img.nbtrisna.my.id/Pasted%20image%2020231008155717.png)![Pasted image 20231008155840](https://img.nbtrisna.my.id/Pasted%20image%2020231008155840.png)

3.  di `Server Section` pilih server yang akan diinstall CA Server, Klik next

![Pasted image 20231008155936](https://img.nbtrisna.my.id/Pasted%20image%2020231008155936.png)

4.  Pilih `Active Directory Certificate Services`, Klik next. Next di features bisa skip langsung next ke bagian `AD CS`

![Pasted image 20231008160017](https://img.nbtrisna.my.id/Pasted%20image%2020231008160017.png)

5.  Di section AD CS Klik `next`, di Role Services pilih `Certificate Authority`

![Pasted image 20231008160137](https://img.nbtrisna.my.id/Pasted%20image%2020231008160137.png)

6.  Klik next dan Install..

## Setup

Setelah selesai install, biasanya akan ada notif untuk menyarankan setup seperti berikut, tinggal klik aja

![Pasted image 20231008160331](https://img.nbtrisna.my.id/Pasted%20image%2020231008160331.png)

1.  Credentials, bisa pake akun Administrator aja klik next.

![Pasted image 20231008160406](https://img.nbtrisna.my.id/Pasted%20image%2020231008160406.png)

2.  Role service bisa pilih `Certificate Authority`, klik next

![Pasted image 20231008160446](https://img.nbtrisna.my.id/Pasted%20image%2020231008160446.png)

3.  Karena win-server tidak dikonfigurasi domain, bisa langsung pilih `Standalone CA`. Poin positifnya, untuk CA Server tidak perlu di configurasi untuk ke internet

![Pasted image 20231008160611](https://img.nbtrisna.my.id/Pasted%20image%2020231008160611.png)

4.  Next, untuk CA Type, bisa pilih `ROOT CA`

![Pasted image 20231008160720](https://img.nbtrisna.my.id/Pasted%20image%2020231008160720.png)

5.  Private Key, bisa dibuat aja/Next aja

![Pasted image 20231008160746](https://img.nbtrisna.my.id/Pasted%20image%2020231008160746.png)

6.  Crypthograpy bisa next

![Pasted image 20231008160819](https://img.nbtrisna.my.id/Pasted%20image%2020231008160819.png)

7.  Di `CA Name`, bisa dikonfigurasi namanya untu `CN` nya apa. misal `ca.ngurah.local`/sesuaikan soal.

![Pasted image 20231008160916](https://img.nbtrisna.my.id/Pasted%20image%2020231008160916.png)

8.  Validity period sesuaikan dengan soal/biarkan default

![Pasted image 20231008161000](https://img.nbtrisna.my.id/Pasted%20image%2020231008161000.png)

9.  Di section `CA Database` bisa skip aja

![Pasted image 20231008161031](https://img.nbtrisna.my.id/Pasted%20image%2020231008161031.png)

10.  Di section `Confirmation` bisa cek kembali konfigurasi, dan jika sudah langsung `Configure`

![Pasted image 20231008161138](https://img.nbtrisna.my.id/Pasted%20image%2020231008161138.png)

Pastikan Result success. :) bisa di close aja.

## Install Root CA di all server

### Export Root CA first

1.  Cari `Certificate` di search

![Pasted image 20231008161420](https://img.nbtrisna.my.id/Pasted%20image%2020231008161420.png)

2.  Klik `Certificates - Local Computer` > `Personal` > Certificate

![Pasted image 20231008161936](https://img.nbtrisna.my.id/Pasted%20image%2020231008161936.png)

nanti akan muncul `ROOT CA` yang tadi telah dibuat, export root ca tersebut.

3.  Klik kanan di root ca yang udah dibuat tadi, pilih `All Tasks` > `Export`

![Pasted image 20231008162117](https://img.nbtrisna.my.id/Pasted%20image%2020231008162117.png)

4.  Klik Next

![Pasted image 20231008162215](https://img.nbtrisna.my.id/Pasted%20image%2020231008162215.png)

4.  Di `Export Private keys` Bisa pilih `yes/no` tergantung ingin si certificate + privkey/ Certificate doang. Tergantung kebutuhan, tapi saran pilih `no` aja biar universal bisa windows bisa linux

![Pasted image 20231008162359](https://img.nbtrisna.my.id/Pasted%20image%2020231008162359.png)

5.  Selanjutnya pilih next, sesuai soal

![Pasted image 20231008162433](https://img.nbtrisna.my.id/Pasted%20image%2020231008162433.png)

6.  Di file section, tinggal pilih dimana letak certificate akan di export

![Pasted image 20231008162531](https://img.nbtrisna.my.id/Pasted%20image%2020231008162531.png)

7.  Summary, kalo data udah bener, bisa langsung di finish

![Pasted image 20231008162601](https://img.nbtrisna.my.id/Pasted%20image%2020231008162601.png)