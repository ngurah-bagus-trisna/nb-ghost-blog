---
title: "Setup SSTP Softehter Docker"
published: 2024-07-27T20:30:11.000Z
tags: 
  - "catatan"
  - "linux"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "setup-sstp-softehter-docker"
featuredImage: "https://images.unsplash.com/photo-1603985529862-9e12198c9a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDJ8fFZQTnxlbnwwfHx8fDE3MjIxMTIyMDN8MA&ixlib=rb-4.0.3&q=80&w=2000"
excerpt: "A softether VPN can be hosted on docker"
---

## Setup

1.  Create docker-compose

```yaml
version: '3'

services:
  softether:
    image: softethervpn/vpnserver:stable
    cap_add:
      - NET_ADMIN
    restart: always
    container_name: vpn-softether
    ports:
      - 8443:443
    volumes:
      - "./softether_data:/mnt"

```

1.  Compose Up

```sh
docker compose up -d

```

## Create User

1.  Akses `vpncmd` dengan command dibawah

```sh
docker exec -it vpn-softether vpncmd

```

1.  Ikuti yang dibawah

```
root@nb-srv-contabo:~# docker exec -it vpn-softether vpncmd
vpncmd command - SoftEther VPN Command Line Management Utility
SoftEther VPN Command Line Management Utility (vpncmd command)
Version 4.39 Build 9772   (English)
Compiled 2022/04/26 17:40:01 by buildsan at crosswin
Copyright (c) SoftEther VPN Project. All Rights Reserved.

By using vpncmd program, the following can be achieved. 

1. Management of VPN Server or VPN Bridge 
2. Management of VPN Client
3. Use of VPN Tools (certificate creation and Network Traffic Speed Test Tool)

Select 1, 2 or 3: 1  < == PILIH SATU


```

```sh
Specify the host name or IP address of the computer that the destination VPN Server or VPN Bridge is operating on. 
By specifying according to the format 'host name:port number', you can also specify the port number. 
(When the port number is unspecified, 443 is used.)
If nothing is input and the Enter key is pressed, the connection will be made to the port number 8888 of localhost (this computer).
Hostname of IP Address of Destination: ENTER


```

```

If connecting to the server by Virtual Hub Admin Mode, please input the Virtual Hub name. 
If connecting by server admin mode, please press Enter without inputting anything.
Specify Virtual Hub Name: ENTER

```

> Jika pertama kali akses, klik enter saja tanpa memasukan password

```
Password: < Masukan password

```

### Setup Softether SSTP

1.  Set password untuk nantinya akses vpncmd

```sh
ServerPasswordSet

```

1.  Buat virtualHUB. Disini virtual hub berfungsi seperti switch virtual

```sh
HubCreate VPN

# masuk ke hub VPN
Hub VPN

```

1.  Aktifkan Secure NAT

```
SecureNatEnable

```

1.  Buat user vpn

```sh
UserCreate test
UserPasswordSet test

```

1.  Jalankan berikut untuk mengaktifkan SSTP

```sh
IPsecEnable
**Enable L2TP over IPsec Server Function** yes
**Enable Raw L2TP Server Function** yes
**Enable EtherIP / L2TPv3 over IPsec Server Function** yes
**Pre Shared Key for IPsec** <masukan-password>
**Default Virtual HUB in a case of omitting the HUB on the Username** VPN

SstpEnable yes

```

1.  Generate root certificate

```sh
ServerCertRegenerate <public-ip>

```

1.  Export hasil certificate

```sh
ServerCertGet ~/cert.cer

```