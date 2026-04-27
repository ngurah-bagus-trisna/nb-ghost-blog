---
title: "nginx-upstream Transport Server"
published: 2025-06-03T01:19:00.000Z
updated: 2025-06-21T01:20:05.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "nginx-upstream-transport-server"
featuredImage: "https://photoby.nbtrisna.my.id/57b51ded-ccf3-4a5c-a32c-7b219e769ea9.jpg"
excerpt: "TransportServer resource memungkinkan untuk conifgurasi TCP, UDP dan TLS Passtrough melalui nginx-upstream. Fitur ini berfungsi jika installasi dengan CRD."
---

Refrensi :

-   https://docs.nginx.com/nginx-ingress-controller/configuration/transportserver-resource/

TransportServer resource memungkinkan untuk conifgurasi TCP, UDP dan TLS Passtrough melalui nginx-upstream. Fitur ini berfungsi jika installasi dengan CRD.

## Persyaratan

-   Untuk tcp dan udp, perlu membuat globalresources terlebih dahulu. [Refrensi](https://docs.nginx.com/nginx-ingress-controller/configuration/global-configuration/globalconfiguration-resource?ref=dev.nbtrisna.my.id)
-   Untuk TLS Passtrough, perlu menambahkan `-enable-tls-passthrough` di command line argument ingress-controller

## Simple Testing, Access ssh to pod using tcp passtrough port 22

Untuk mencoba saya membuat pod `openssh-server`. Nantinya akan expose port 22 dari container, dan coba akses mengggukana ip dari ingress-nginx.

Refrensi dari percobaan : https://stackoverflow.com/questions/68046576/exposing-tcp-service-using-nginx-ingress-controller-operator-on-openshift

1.  Create deployment + service openssh-server, expose port 22.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: ssh-server
  name: ssh-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ssh-server
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: ssh-server
    spec:
      containers:
      - image: linuxserver/openssh-server
        name: openssh-server
        ports:
        - name: ssh-port
          containerPort: 2222
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: ssh-server
  name: ssh-server
spec:
  ports:
  - name: ssh-port
    port: 22
    protocol: TCP
    targetPort: 2222
  selector:
    app: ssh-server
  type: ClusterIP
			

```

Hit port 2222. (Default container)

![Pasted image 20230705050341](https://img.nbtrisna.my.id/Pasted%20image%2020230705050341.png)

Hit port 22 pakai clusterIP

![Pasted image 20230705050432](https://img.nbtrisna.my.id/Pasted%20image%2020230705050432.png)

2.  Buat `GlobalConfiguration`

GlobalConfiguration berfungsi untuk membuat listen port 2250 di ingress-controler. Nantinya port 2250 berfungsi untuk meneruskan port 22 dari deployment `ssh-test`

```yaml
apiVersion: k8s.nginx.org/v1alpha1
kind: GlobalConfiguration
metadata:
  name: nginx-ingress-config
  namespace: nginx-ingress
spec:
  listeners:
  - name: ssh-tcp
    port: 2250 # port yang akan di expose
    protocol: TCP

```

![Pasted image 20230705051345](https://img.nbtrisna.my.id/Pasted%20image%2020230705051345.png)

Setelah apply global-config, edit deployment nginx-ingress, tambahkan `-global-configuration=<namespace>/name` di command section.

```yaml
kubectl edit deployments.apps -n nginx-ingress nginx-ingress-controller
---
spec:
  containers:
  - args:
    - -global-configuration=nginx-ingress/nginx-ingress-config

```

3.  Buat TransportServer

```yaml
```yaml
apiVersion: k8s.nginx.org/v1alpha1
kind: TransportServer
metadata:
  name: ssh-tcp
spec:
  listener:
    name: ssh-tcp
    protocol: TCP
  upstreams:
  - name: ssh-app
    service: ssh-server
    port: 22
  action:
    pass: ssh-app

```

## Verifikasi

Pastikan transportserver sudah valid

![Pasted image 20230705052139](https://img.nbtrisna.my.id/Pasted%20image%2020230705052139.png)

Coba hit port 2250 sesuai dari `port listeners` yang dibuat. Dicoba terlebih dahulu dengan IP Port `ingress-controller`

![Pasted image 20230705052338](https://img.nbtrisna.my.id/Pasted%20image%2020230705052338.png)

Coba hit dengan `ClusterIP` nginx-controller

![Pasted image 20230705052444](https://img.nbtrisna.my.id/Pasted%20image%2020230705052444.png)

Hal tersebut tidak bisa, karena belum mapping port 2250 ke service dari `nginx-ingress`. Selanjutnya dicoba menambahkan port 2250

```yaml
kubectl edit svc -n nginx-ingress nginx-ingress-controller
---
spec:
  ports:
  - name: http
    nodePort: 32551
    port: 80
    protocol: TCP
    targetPort: 80
  - name: https
    nodePort: 31435
    port: 443
    protocol: TCP
    targetPort: 443
  - name: ssh-port
    port: 2250 # tambahkan port 2250
    protocol: TCP
    targetPort: 2250

```

Setelah diedit, bisa di hit menggunakan `ClusterIP` maupun `IPLoadbalancer`

![Pasted image 20230705052822](https://img.nbtrisna.my.id/Pasted%20image%2020230705052822.png)