---
title: "Firewalld On Lab"
published: 2024-07-10T09:21:07.000Z
updated: 2024-07-10T10:49:55.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "port-forward-firewalld"
featuredImage: "https://images.unsplash.com/photo-1615309662472-4ca77a77a189?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDN8fGZpcmV3YWxsfGVufDB8fHx8MTcyMDYwMzI0NXww&ixlib=rb-4.0.3&q=80&w=2000"
excerpt: "Beberapa catetan penggunaan firewalld di lab saya. Port Forward Untuk port forward mengunakan Firewalld, dapat dengan berikut. Skenarionya saya ingin port forward, jika mengakses ip x.x.x.x port 80..."
---

*Beberapa catetan penggunaan firewalld di lab saya.*

## Port Forward

Untuk port forward mengunakan `Firewalld`, dapat dengan berikut.

> Skenarionya saya ingin port forward, jika mengakses ip x.x.x.x port 80 di zone wg, maka di redirect ke a.a.a.a port 80.

1.  Aktifkan masqurade di zone `wg`

```sh
sudo firewall-cmd --add-masqurade --permanent

```

2.  Port forward, di zone `wg`

```sh
sudo firewall-cmd --add-forward-port=port=80:proto=tcp:toaddr=a.a.a.a --zone=wg --permanent

```

3.  Reload firewalld

```sh
sudo firewall-cmd --reload

```

## Libvirt Network Mode Routed, Agar Instance Terkoneksi Internet

Setelah provisioning libvirt-network dengan metode routed, kadang instance tidak dapat mengakses internet karena subnet local dari vm tidak di nat untuk mengakses internet. Berikut caranya

```sh
sudo firewall-cmd --zone=public --add-masquerade --permanent
sudo firewall-cmd --reload

```

Ya intinya untuk zone public kita tambahin `masqurade`