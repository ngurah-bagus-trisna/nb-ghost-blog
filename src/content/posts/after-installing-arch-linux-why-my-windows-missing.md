---
title: "Habis install Archlinux, windows saya hilang dari grub :("
published: 2023-12-28T11:19:34.000Z
updated: 2023-12-28T14:55:19.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "after-installing-arch-linux-why-my-windows-missing"
featuredImage: "https://images.unsplash.com/photo-1622487354742-3e4b4de29e75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDIzfHxmb3JnZXR8ZW58MHx8fHwxNzAzNzYxODczfDA&ixlib=rb-4.0.3&q=80&w=2000"
excerpt: "Beberapa waktu lalu saya mencoba menginstall arch-linux di laptop kerja saya. Tetapi saat installasi usai, windows 10 saya hilang saat memilih os di grub :(. Jika anda mengalami hal serupa, mungkin..."
---

Beberapa waktu lalu saya mencoba menginstall arch-linux di laptop kerja saya. Tetapi saat installasi usai, windows 10 saya hilang saat memilih os di grub :(.

Jika anda mengalami hal serupa, mungkin catatan berikut dapat membantu anda 😄

> Missing windows on grub

1.  Install `os-prober`

```shell
sudo pacman -S os-prober

```

2.  Edit `/etc/default/grub`

```shell
sudo vi /etc/default/grub

```

```vim
# end line
GRUB_DISABLE_OS_PROBER=false # Set ke false

```

3.  Reconfig grub

```shell
sudo grub-mkconfig -o /boot/grub/grub.cfg

```