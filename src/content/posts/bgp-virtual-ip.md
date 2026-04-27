---
title: "BGP Virtual IP"
published: 2025-06-06T01:16:00.000Z
updated: 2025-06-21T01:16:32.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "bgp-virtual-ip"
featuredImage: "https://photoby.nbtrisna.my.id/8623c526-6ba6-4628-96f5-849a93399c17.jpg"
excerpt: "Jadi goals riset ini adalah bagaimana caranya membuat sebuah virtual ip yang bisa di reach oleh network kvm."
---

Refrensi : https://docs.vultr.com/high-availability-on-vultr-with-floating-ip-and-bgp

Jadi goals riset ini adalah bagaimana caranya membuat sebuah virtual ip yang bisa di reach oleh network kvm. VirtualIP disini masih belum sempurna, karena beberapa kali pengetestan dan tuning buat pindah ke vm lain masih terdapat jeda yang sangat lumayan > 1 menit.

## environment

Pakai OS Ubuntu 22.04 Server

VM Hostname

IP

rke-server-01

10.10.11.10

rke-server-02

10.10.11.11

rke-server-03

10.10.11.12

vip-rke

10.10.11.100

Kondisi awalnya terlihat kalau tidak terdapat ip `10.10.11.100` di dhcp-leases.

![Pasted image 20240805124052](https://img.nbtrisna.my.id/Pasted%20image%2020240805124052.png)

![Pasted image 20240805124110](https://img.nbtrisna.my.id/Pasted%20image%2020240805124110.png)

Di ping juga pastinya engga mau, karena belum di setup

## Setup

> Exec on all node

1.  Install bird

```sh
sudo apt install bird

```

2.  Add virtual ip di interface loopback.

```sh
sudo vim /etc/netplan/xx.yaml

```

```yaml
network:
    ethernets:
        lo:
            addresses:
              - 127.0.0.1/8
              - ::1/128
              - 10.10.11.100/32

```

```sh
sudo netplan apply 

```

Pastikan interface `lo` memiliki virtualip

![Pasted image 20240805125133](https://img.nbtrisna.my.id/Pasted%20image%2020240805125133.png)

### config rke-server-01

```sh
sudo vim /etc/bird/bird.conf

```

```fonfig
# This is a minimal configuration file, which allows the bird daemon to start
# but will not cause anything else to happen.
#
# Please refer to the documentation in the bird-doc package or BIRD User's
# Guide on http://bird.network.cz/ for more information on configuring BIRD and
# adding routing protocols.

# Change this into your BIRD router ID. It's a world-wide unique identification
# of your router, usually one of router's IPv4 addresses.
router id 10.10.11.10;

# The Kernel protocol is not a real routing protocol. Instead of communicating
# with other routers in the network, it performs synchronization of BIRD's
# routing tables with the OS kernel.
protocol kernel {
        scan time 60;
        import none;
#       export all;   # Actually insert routes into the kernel routing table
}

# The Device protocol is not a real routing protocol. It doesn't generate any
# routes and it only serves as a module for getting information about network
# interfaces from the kernel. 
protocol device {
        scan time 60;
}

protocol direct {
        interface "lo";
}

protocol bgp uplink_1 {
    local as 64512;
    source address 10.10.11.10;
    import none;
    export all;
    graceful restart on;
    neighbor 10.10.11.11 as 64512;
}


protocol bgp uplink_2 {
    local as 64512;
    source address 10.10.11.10;
    import none;
    export all;
    graceful restart on;
    neighbor 10.10.11.12 as 64512;
}

```

Enable bird

```sh
sudo enable --now bird

```

### config rke-server-02

```sh
sudo vim /etc/bird/bird.conf

```

```
# This is a minimal configuration file, which allows the bird daemon to start
# but will not cause anything else to happen.
#
# Please refer to the documentation in the bird-doc package or BIRD User's
# Guide on http://bird.network.cz/ for more information on configuring BIRD and
# adding routing protocols.

# Change this into your BIRD router ID. It's a world-wide unique identification
# of your router, usually one of router's IPv4 addresses.
router id 10.10.11.11;

# The Kernel protocol is not a real routing protocol. Instead of communicating
# with other routers in the network, it performs synchronization of BIRD's
# routing tables with the OS kernel.
protocol kernel {
        scan time 60;
        import none;
#       export all;   # Actually insert routes into the kernel routing table
}

# The Device protocol is not a real routing protocol. It doesn't generate any
# routes and it only serves as a module for getting information about network
# interfaces from the kernel. 
protocol device {
        scan time 60;
}

protocol direct {
        interface "lo";
}

protocol bgp uplink_1 {
    local as 64512;
    source address 10.10.11.11;
    import none;
    export all;
    graceful restart on; 
    neighbor 10.10.11.10 as 64512;
}


protocol bgp uplink_2 {
    local as 64512;
    source address 10.10.11.11;
    import none;
    export all;
    graceful restart on;
    neighbor 10.10.11.12 as 64512;
}  

```

Enable service bird

```sh
sudo systemctl enable --now bird

```

### config rke-server-03

```sh
sudo vim /etc/bird/bird.conf

```

```cfg
# This is a minimal configuration file, which allows the bird daemon to start
# but will not cause anything else to happen.
#
# Please refer to the documentation in the bird-doc package or BIRD User's
# Guide on http://bird.network.cz/ for more information on configuring BIRD and
# adding routing protocols.

# Change this into your BIRD router ID. It's a world-wide unique identification
# of your router, usually one of router's IPv4 addresses.
router id 10.10.11.12;

# The Kernel protocol is not a real routing protocol. Instead of communicating
# with other routers in the network, it performs synchronization of BIRD's
# routing tables with the OS kernel.
protocol kernel {
        scan time 60;
        import none;
#       export all;   # Actually insert routes into the kernel routing table
}

# The Device protocol is not a real routing protocol. It doesn't generate any
# routes and it only serves as a module for getting information about network
# interfaces from the kernel. 
protocol device {
        scan time 60;
}

protocol direct {
        interface "lo";
}

protocol bgp uplink_1 {
    local as 64512;
    source address 10.10.11.12;
    import none;
    export all;
    graceful restart on; 
    neighbor 10.10.11.10 as 64512;
}


protocol bgp uplink_2 {
    local as 64512;
    source address 10.10.11.12;
    import none;
    export all;
    graceful restart on;
    neighbor 10.10.11.11 as 64512;
}  

```

Enable service bgp

```sh
sudo enable --now bird

```

## Verifikasi

1.  Check bgp session tiap vm

```sh
birdc show proto all 

```

Pastikan bgp state udah Active

![Pasted image 20240805130136](https://img.nbtrisna.my.id/Pasted%20image%2020240805130136.png)

2.  Ping vip dari baremetal

![Pasted image 20240805130200](https://img.nbtrisna.my.id/Pasted%20image%2020240805130200.png)

3.  Install nginx masing", dan ubah index dengan hostname. Dan curl dari baremetal

```sh
curl 10.10.11.100

```

![Pasted image 20240805132151](https://img.nbtrisna.my.id/Pasted%20image%2020240805132151.png)

Coba curl terus menerus, sambil matikan instance rke-3

![Pasted image 20240805132506](https://img.nbtrisna.my.id/Pasted%20image%2020240805132506.png)

Dan ip berpindah ke rke-2. perpindahan cukup lama, dan memang bgp sepertinya tidak bestpractice sebagai vrrp dibandingkan keepalive.