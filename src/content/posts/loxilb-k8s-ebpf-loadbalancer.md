---
title: "LoxiLB-k8s Ebpf Loadbalancer"
published: 2024-08-29T07:04:00.000Z
updated: 2024-08-29T07:15:53.000Z
tags: []
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "loxilb-k8s-ebpf-loadbalancer"
featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80"
excerpt: "Loxilb adalah aplikasi loadbalancer hyper-scale untuk cloud-native, menggunakan teknologi eBPF dengan berabasis golang. Didesain untuk on-premises, edge, dan public cloud Kubernetes Cluster..."
---

Loxilb adalah aplikasi loadbalancer hyper-scale untuk cloud-native, menggunakan teknologi eBPF dengan berabasis golang. Didesain untuk on-premises, edge, dan public cloud Kubernetes Cluster Deployment.

Dalam kubernetes, agar bisa aplikasi/deployment dapat diakses dari luar, diperlukan sebuah `loadbalancer`. Kubernetes sendiri tidak mempunyai fitur untuk mengatur service `loadbalancer` jadinya ketika kita memberikan sebuah `service` dengan value `loadbalancer`, service tersebut akan stuck di `pending` state.

**Metallb** sebelumnya dapat menjadi solusi dari hal tersebut, tetapi ada beberapa hal yang tidak dipunyai metallb, menurut dari dokumentasi [loxilb](https://loxilb-io.github.io/loxilbdocs/?ref=dev.nbtrisna.my.id) beberapa protokol tidak disupport oleh metallb, jadinya loxilb hadir mengatasi hal tersebut.

## Try kube-loxilb

> Di deploy dalam k8s-onpremises

Refrensi : https://loxilb-io.github.io/loxilbdocs/kube-loxilb/

Kube-loxilb adalah loxilb yang diimplementasika untuk kubenrnetes `service` `loadbalancer` spec dimana sudah terdapat support untuk load-balancer class, IPAM (IP Address Management), dll. kube-loxilb running sebagai `deployment` di ns kube-system. Deployment hanya mengambil informasi mengenai komponen k8s di cluster tersebut, dan tidak mengimplementasikan packet/session loadbalancer. Untuk loadbalancer akan diambil tugasnya oleh `loxilb` yang berada di luar cluster, sebagai external loadbalancer.

1.  Buat instance diluar cluster k8s, disini saya memakai nama `nb-loxi-lb` sebagai docker-engine. Nantinya akan diinstal docker yang akan running service `loxilb`. Setup docker-engine, dan lanjut ke next step
2.  Pull image

```sh
docker pull ghcr.io/loxilb-io/loxilb:latestu22

```

Buat network `mac-vlan`

```sh
docker network create -d macvlan -o parent=enp0s3   --subnet 172.10.10.0/24   --gateway 172.10.10.1 --aux-address 'host=172.10.10.50' llbnet

```

Running docker container

```sh
docker run -u root --cap-add SYS_ADMIN --restart unless-stopped --privileged -dit -v /dev/log:/dev/log --net=llbnet --ip=172.10.10.55 --name loxilb ghcr.io/loxilb-io/loxilb:latestu22

```

Pastikan dari cluster k8s, bisa ping ke loxilb container

![](/content/images/2024/08/Pasted-image-20230916022025-2-1.png)
*Ping ke loxi*

Telnet ke port `11111`

![](/content/images/2024/08/Pasted-image-20230916022122.png)

3\. Install kube-loxilb di cluster-k8s. Step:

```sh
wget https://github.com/loxilb-io/kube-loxilb/raw/main/manifest/kube-loxilb.yaml

```

Edit manifest, dibagian `args:`

```sh
args:
        - --loxiURL=http://172.10.10.55:11111 
        - --externalCIDR=172.10.10.55/32
        - --setLBMode=2 # mode ini menggunakan metode One-ARM Nat

```

Keterangan nat : https://github.com/loxilb-io/loxilbdocs/blob/main/docs/nat.md#nat-modes-in-loxilb

Keterangan:

-   loxiURL : API server address of loxilb. This is the docker IP address loxilb docker of Step 1. If unspecified, kube-loxilb assumes loxilb is running in-cluster mode and autoconfigures this.
-   externalCIDR : CIDR or IPAddress range to allocate addresses from. By default address allocated are shared for different services(shared Mode)
-   setLBMode : Specifies the NAT mode of the load balancer. There are currently 3 modes supported. Read more [here](https://github.com/loxilb-io/loxilbdocs/blob/main/docs/nat.md?ref=dev.nbtrisna.my.id#nat-modes-in-loxilb).

Pastikan Running

![](/content/images/2024/08/Pasted-image-20230916024755.png)

Coba buat pod

```yaml
cat << EOF | tee nginx-liveness.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service1
  labels:
    app: loxilb
spec:
  selector:
    app: loxilb
  ports:
    - port: 8765
      targetPort: 80
  type: LoadBalancer
  loadBalancerClass: "loxilb.io/loxilb"
---
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: loxilb
spec:
  containers:
  - name: nginx
    image: nginx:stable
    ports:
      - containerPort: 80
        name: http-web-svc
EOF

```

![](/content/images/2024/08/Pasted-image-20230917023526.png)

> Jadi ketika hit external ip, dia bakal nerusin ke ip si worker-node dengan menggunakan nodeport

![](/content/images/2024/08/Pasted-image-20230917023600.png)