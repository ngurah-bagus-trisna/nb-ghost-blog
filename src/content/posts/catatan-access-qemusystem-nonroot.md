---
title: "Akses qemu:///system dari nonroot user."
published: 2023-12-28T14:38:33.000Z
updated: 2023-12-28T14:53:35.000Z
tags: 
  - "catatan"
  - "linux"
  - "kvm"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "catatan-access-qemusystem-nonroot"
featuredImage: "https://images.unsplash.com/photo-1580983559367-0dc2f8934365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDQ5fHxWaXJ0dWFsaXphdGlvbnxlbnwwfHx8fDE3MDM3NzM5ODR8MA&ixlib=rb-4.0.3&q=80&w=2000"
excerpt: "Cara membuat nonroot user mengakses qemu::///system. Mengatasi error permmision ketika membuat network interface libvirt."
---

Berawal dari saya menggunakan arch-linux sebagai lab virtualisasi, saya menemukan error permission ketika menggunakan nonroot user untuk membuat interface baru dari network yang akan digunakan oleh kvm. Setelah searching, cara termudahnya adalah membuat konfigurasi libvirt untuk nonroot user agar dapat mengakases `qemu:///system`

### Step

1.  Create file `.config/libvirt/libvirt.conf`

```vim
uri_default = "qemu:///system"

```

### Verify

```shellsession
[shezento@nb-lab-pc ~]$ virsh net-list --all
 Name            State      Autostart   Persistent
----------------------------------------------------
 default         inactive   no          yes
 k8s-172.16.10   active     yes         yes
 net-172.18.10   active     yes         yes

[shezento@nb-lab-pc ~]$

```