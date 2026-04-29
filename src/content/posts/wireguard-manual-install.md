---
title: "Wireguard-manual install"
published: 2024-12-25T05:14:46.000Z
tags: []
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "wireguard-manual-install"
featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80"
excerpt: "Refrensi : https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-22-04 Install wireguard apt install wireguard Create private key wg genkey | sudo tee..."
---

Refrensi : https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-22-04

Install wireguard

```sh
apt install wireguard

```

Create private key

```sh
wg genkey | sudo tee /etc/wireguard/private.key
sudo chmod go= /etc/wireguard/private.key

```

Create public key

```sh
sudo cat /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key

```

## Setup Wireguard Server

```sh
sudo nano /etc/wireguard/wg0.conf

```

```conf
[Interface]
PrivateKey = base64_encoded_private_key_goes_here
Address = 10.8.0.1/24, fd24:609a:6c18::1/64
ListenPort = 51820
SaveConfig = true

```

## Setup Wireguard Client

Create Private Key & pubkey

```sh
wg genkey | sudo tee /etc/wireguard/private.key
sudo chmod go= /etc/wireguard/private.key
sudo cat /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key

```

Create config /etc/wireguard/wg0.conf

```sh
[Interface]
PrivateKey = base64_encoded_peer_private_key_goes_here
Address = 10.8.0.2/24
Address = fd24:609a:6c18::2/64

[Peer]
PublicKey = 
AllowedIPs = 10.8.0.0/24, fd24:609a:6c18::/64
Endpoint = 

```