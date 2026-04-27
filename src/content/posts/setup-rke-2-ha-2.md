---
title: "Setup RKE-2 HA"
published: 2025-01-02T04:18:03.000Z
updated: 2025-06-18T19:52:04.000Z
tags: 
  - "about"
  - "linux"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "setup-rke-2-ha-2"
featuredImage: "/content/images/2025/01/RKE-twnb.png"
excerpt: "Jadi di lab kubernetes saya pribadi menggunakan rke2/rke-goverment sebagai cluster utama. Alasan dipilihnya rke2 karena kemudahanya provisioning, dan tidak perlu banyak setup"
---

Jadi di lab kubernetes saya pribadi menggunakan `rke2/rke-goverment` sebagai cluster utama. Alasan dipilihnya `rke2` karena kemudahanya provisioning, dan tidak perlu banyak setup. Selain itu, **RKE2** (Rancher Kubernetes Engine 2) dirancang untuk memenuhi kebutuhan Kubernetes di lingkungan produksi dengan fokus pada keamanan dan kinerja. Proses instalasinya cukup sederhana dan kompatibel dengan berbagai distribusi Linux, seperti Ubuntu, CentOS, maupun RHEL.

Saya menggunakaan `lxc` untuk mengatur virtual machine dalam lab. Untuk file provisioning automation vm di lxd dengan `opentofu`, dapat melihat github saya di tautan berikut,

https://github.com/ngurah-bagus-trisna/rke2-lxc-tf-provisioning

Hasil dari provisioning

```sh
shezen@nb-ubuntu-desk:~/lab/tf-coreos-lxd$ lxc list rke
+---------------+---------+-----------------------+------+-----------------+-----------+
|     NAME      |  STATE  |         IPV4          | IPV6 |      TYPE       | SNAPSHOTS |
+---------------+---------+-----------------------+------+-----------------+-----------+
| rke-master-01 | RUNNING | 10.10.214.10 (enp5s0) |      | VIRTUAL-MACHINE | 0         |
+---------------+---------+-----------------------+------+-----------------+-----------+
| rke-master-02 | RUNNING | 10.10.214.11 (enp5s0) |      | VIRTUAL-MACHINE | 0         |
+---------------+---------+-----------------------+------+-----------------+-----------+
| rke-master-03 | RUNNING | 10.10.214.12 (enp5s0) |      | VIRTUAL-MACHINE | 0         |
+---------------+---------+-----------------------+------+-----------------+-----------+
| rke-worker-01 | RUNNING | 10.10.214.21 (enp5s0) |      | VIRTUAL-MACHINE | 0         |
+---------------+---------+-----------------------+------+-----------------+-----------+
| rke-worker-02 | RUNNING | 10.10.214.22 (enp5s0) |      | VIRTUAL-MACHINE | 0         |
+---------------+---------+-----------------------+------+-----------------+-----------+

```

## Installing RKE2

Refrensi : https://docs.rke2.io/install/quickstart

Setelah vm sudah siap, lanjut install rke2 binary dan service.

> Eksekusi kode dengan sudo/root permission Secara otomatis jika tidak memilih versi akan terinstall versi latest. Untuk memilih spesifik versi dari RKE2, bisa menambahkan variable `INSTALL_RKE2_CHANNEL=<versi>`.

#### Master/control-plane node

```sh
curl -sfL https://get.rke2.io | sh -

```

#### Worker node

```sh
curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sh -

```

Setelah binary & service sudah terinstall, selanjutnya kita setup HA dengan menggunakan daemonset `kube-vip`.

## Setup Cluster

Refrensi : https://docs.rke2.io/install/ha

## all node

1.  Konfigurasi `/etc/hosts`. Tambahkan `rke-vrrp` dengan ip yang nantinya digunakan sebagai virtualip

```sh
sudo vim /etc/hosts
---
10.10.214.5 rke-vrrp

```

### First Master/Control-Plane

1.  Mengaktifkan `rke-master-01` terlebih dahulu sebagai server node pertama

```sh
mkdir -p /etc/rancher/rke2/
cat << EOF | tee /etc/rancher/rke2/config.yaml 
tls-san:  
- rke-vrrp
- 10.10.214.5
node-taint:  
- "CriticalAddonsOnly=true:NoExecute"
EOF

```

> node-taint berfungsi jika objek deployment/daemonset/pod tidak memiliki toleration yang tepat, objek tersebut tidak akan tersechedule ke node tersebut.

2.  Start service `rke-server.service`

```sh
systemctl enable --now rke2-server.service

```

> KUBECONFIG akan tertulis di `/etc/rancher/rke2/rke2.yaml`

3.  Verifikasi bahwa `rke-master-01` sudah aktif

```sh
/var/lib/rancher/rke2/bin/kubectl get pod -A --kubeconfig=/etc/rancher/rke2/rke2.yaml

```

```
root@rke-master-01:~# /var/lib/rancher/rke2/bin/kubectl get node --kubeconfig=/etc/rancher/rke2/rke2.yaml
NAME            STATUS   ROLES                       AGE     VERSION
rke-master-01   Ready    control-plane,etcd,master   3m13s   v1.31.4+rke2r1

```

4.  Installasi `kube-vip` sebagai service yang ekspos virtual ip `10.10.214.5`. Nantinya kube-vip secara otomatis terdeploy di master node dengan menggunakan daemonset.

Refrensi : https://kube-vip.io/docs/installation/daemonset/

Install RBAC

```sh
kubectl apply -f https://kube-vip.io/manifests/rbac.yaml

```

Gunakan [refrensi berikut](https://kube-vip.io/docs/installation/daemonset/?ref=dev.nbtrisna.my.id#example-arp-manifest) untuk membuat manifest daemonset `kube-vip`. Sesuaikan,

-   `vip_interface` : Gunakan interface yang dapat terhubung ke node lain. Dalam lab saya, menggunakan interface `enp5s0`
-   `address` : Gunakan ip yang akan di ekspos sebagai virtual ip. Dalam lab saya, menggunakan alamat `10.10.214.5`

5.  Verifikasi `kube-vip`. Pastikan pod running, dan virtual IP sudah terdapat di interface yang kita assign

```sh
root@rke-master-01:~# kubectl  get pod -n kube-system
NAME                                                    READY   STATUS      RESTARTS   AGE
cloud-controller-manager-rke-master-01                  1/1     Running     0          10m
etcd-rke-master-01                                      1/1     Running     0          10m
helm-install-rke2-canal-sd92c                           0/1     Completed   0          10m
helm-install-rke2-coredns-jn9f6                         0/1     Completed   0          10m
helm-install-rke2-ingress-nginx-4bkrz                   0/1     Pending     0          10m
helm-install-rke2-metrics-server-ddnwc                  0/1     Pending     0          10m
helm-install-rke2-snapshot-controller-crd-fzfpb         0/1     Pending     0          10m
helm-install-rke2-snapshot-controller-nrc7w             0/1     Pending     0          10m
helm-install-rke2-snapshot-validation-webhook-9szsl     0/1     Pending     0          10m
kube-apiserver-rke-master-01                            1/1     Running     0          10m
kube-controller-manager-rke-master-01                   1/1     Running     0          10m
kube-proxy-rke-master-01                                1/1     Running     0          9m53s
kube-scheduler-rke-master-01                            1/1     Running     0          10m
kube-vip-ds-f6dsn                                       1/1     Running     0          29s
rke2-canal-cbtpp                                        2/2     Running     0          10m
rke2-coredns-rke2-coredns-55bdf87668-vswvg              1/1     Running     0          10m
rke2-coredns-rke2-coredns-autoscaler-65c8c6bd64-5bq6j   0/1     Pending     0          10m

root@rke-master-01:~# ip a show enp5s0
2: enp5s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:16:3e:d9:e7:e7 brd ff:ff:ff:ff:ff:ff
    inet 10.10.214.10/24 metric 100 brd 10.10.214.255 scope global dynamic enp5s0
       valid_lft 2299sec preferred_lft 2299sec
    inet 10.10.214.5/32 scope global enp5s0
       valid_lft forever preferred_lft forever
    inet6 fe80::216:3eff:fed9:e7e7/64 scope link
       valid_lft forever preferred_lft forever
root@rke-master-01:~#

```

Pastikan VIP dapat diakses disemua node

![](/content/images/2025/01/image.png)

## Join Control-plane lain.

Untuk menambahkan master/control-plane lain, berikut stepnya.

1.  Mendapatkan token dari control-plane pertama

> Eksekusi di node master yang sudah up.

```sh
cat /var/lib/rancher/rke2/server/node-token

```

2.  Membuat konfigurasi

> Eksekusi command di control-plane/master node yang akan dijoinkan.

```sh
mkdir -p /etc/rancher/rke2/

cat << EOF | tee /etc/rancher/rke2/config.yaml 
---
server: https://rke-vrrp:9345
token: <token-first-master-node>
tls-san:  
- rke-vrrp
- 10.10.214.5
node-taint:  
- "CriticalAddonsOnly=true:NoExecute"
EOF

```

3.  Start & enable `rke2-service`

```sh
sudo systemctl enable --now rke2-server.service

```

4.  Verifikasi

```sh
root@rke-master-01:~# kubectl  get node
NAME            STATUS   ROLES                       AGE     VERSION
rke-master-01   Ready    control-plane,etcd,master   61m     v1.31.4+rke2r1
rke-master-02   Ready    control-plane,etcd,master   2m37s   v1.31.4+rke2r1
rke-master-03   Ready    control-plane,etcd,master   2m9s    v1.31.4+rke2r1

```

## Join worker lain.

Untuk menambahkan worker ke cluster, bisa mengikuti step berikut

1.  Buat konfigurasi

```sh
mkdir -p /etc/rancher/rke2/
cat << EOF | tee /etc/rancher/rke2/config.yaml 
---
server: https://rke-vrrp:9345
token: <token-first-master-node>
EOF

```

2.  Enable & start `rke2-agent`

```sh
systemctl enable --now rke2-agent.service

```

## Verifikasi

1.  Pastikan seluruh node dalam keadaan `Ready`

![](/content/images/2025/01/image-1.png)

1.  Pastikan seluruh pod dalam keadaan `Running`

![](/content/images/2025/01/image-2.png)

## Refrensi Selengkapnya

-   https://docs.rke2.io/
-   https://kubernetes.io/
-   https://kube-vip.io/docs/