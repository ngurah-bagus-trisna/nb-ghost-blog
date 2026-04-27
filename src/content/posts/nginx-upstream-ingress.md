---
title: "nginx-upstream ingress"
published: 2025-06-07T01:18:00.000Z
updated: 2025-06-21T01:19:00.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "nginx-upstream-ingress"
featuredImage: "https://photoby.nbtrisna.my.id/970b8a66-2d6c-49e9-bbf7-b0b72a1d5c7e.jpg"
excerpt: "Berbeda dengan k8s-ingress, by default ingress-nginx memerlukan Custom Resource Definitions untuk bisa up. Jika memang tidak memerlukan CRD, bisa skip dengan set beberapa values berikut."
---

Refrensi : https://docs.nginx.com/nginx-ingress-controller/installation/installation-with-helm/

Untuk mengetahui values dari helm, bisa mengunjungi link [ArtifactHub](https://artifacthub.io/packages/helm/?ref=dev.nbtrisna.my.id)

Berbeda dengan k8s-ingress, by default ingress-nginx memerlukan `Custom Resource Definitions` untuk bisa up. Jika memang tidak memerlukan CRD, bisa skip dengan set beberapa values berikut.

> `controller.enableCustomResources` set to `false` and `controller.appprotect.enable` set to `false` and `controller.appprotectdos.enable` set to `false`), the installation of the CRDs can be skipped by specifying `--skip-crds` for the helm install command.

![Pasted image 20230621032858](https://img.nbtrisna.my.id/Pasted%20image%2020230621032858.png)

Untuk disini saya akan menggunakan default setting yaitu dengan crd

```sh
helm install nginx-ingress oci://ghcr.io/nginxinc/charts/nginx-ingress --version 3.1.1 --namespace nginx-ingress --create-namespace --set controller.ingressClass=nginx-ingress 

```

Setelah installasi, secara otomatis CRD akan terdeploy juga

![Pasted image 20230621035659](https://img.nbtrisna.my.id/Pasted%20image%2020230621035659.png)

Verifikasi, Pastikan semua running dan coba untuk expos nginx-deployment dengan ingress-class nginx-ingress

![Pasted image 20230621035741](https://img.nbtrisna.my.id/Pasted%20image%2020230621035741.png)

```sh
kubectl create ingress nginx-ingress --rule="nginx-ingress.ok/*=nginx:80" --class nginx-ingress

```

Works

![Pasted image 20230621040351](https://img.nbtrisna.my.id/Pasted%20image%2020230621040351.png)

### Monitoring using servicemonitors

Create svc port `prometheus`

```yaml
kubectl edit svc -n nginx-ingress nginx-ingress
---
spec: 
  ports:
    - name: prometheus
      port: 9113
      protocol: TCP
      targetPort: 9113

```

Create service-monitors

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: ingress-nginx
  namespace: nginx-ingress
  labels:
    release: nb
    jobLabel: ingress-nginx
spec:
  selector:
    matchLabels:
      app.kubernetes.io/instance: nginx-ingress
      app.kubernetes.io/name: nginx-ingress
  endpoints:
  - port: prometheus 
    scheme: http

```

# VirtualServer

Refrensi : https://docs.nginx.com/nginx-ingress-controller/configuration/virtualserver-and-virtualserverroute-resources/#upstream

The VirtualServer resource defines load balancing configuration for a domain name, such as `example.com`. Virtual server ini dalam penerapannya memungkinkan dalam satu ingress memiliki 2 service berbeda dengan path yang berbeda juga. Misal `/coffe` -> `svc:coffe:80` atau `/milk` -> `svc:milk:8080`

## Basic Create Ingress Using VirtualServer

Refrensi : https://github.com/nginxinc/kubernetes-ingress/tree/v3.1.1/examples/custom-resources/basic-configuration

Selain membuat ingress menggunakan kind `Ingress`, di nginx-ingress bisa memanfaatkan fitur VirtualServer.

> The VirtualServer and VirtualServerRoute resources are load balancing configurations recommended as an alternative to the Ingress resource.

Dari dokumentasi, disini VIrtualServer dapat sebagai alternatif konfigurasi dari Ingress Resource.

Basic yaml file dari VIrtualServer

```yaml
apiVersion: k8s.nginx.org/v1
kind: VirtualServer
metadata:
  name: 
spec: 

```

### Basic ingress.

-   Expose svc nginx:80 -> virtual-svc.nginx.local dengan VirtualServer

```yaml
apiVersion: k8s.nginx.org/v1
kind: VirtualServer
metadata:
  name: nginx-test
spec:
  host: virtual-svc.nginx.local
  upstreams:
  - name: nginx
    service: nginx
    port: 80
  routes:
  - path: /
    action:
      pass: nginx # name dari upstreams

```

Setelah apply coba cek

![Pasted image 20230624201239](https://img.nbtrisna.my.id/Pasted%20image%2020230624201239.png)

Coba hit : \`curl -v http://localhost:31105 -H 'Host: virtual-svc.nginx.local'

![Pasted image 20230624201433](https://img.nbtrisna.my.id/Pasted%20image%2020230624201433.png)

# VirtualServer separate service by path

Refrensi : https://github.com/nginxinc/kubernetes-ingress/tree/v3.1.1/examples/custom-resources/basic-configuration

Di virtualserver sama seperti k8s-ingress, kita dapat membuat 2 service dalam satu ingress dengan path yang berbeda. Misal `/coffe` -> `svc:coffe:80` atau `/milk` -> `svc:milk:8080`

1.  Buat deployment coffe & tea

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coffee
spec:
  replicas: 2
  selector:
    matchLabels:
      app: coffee
  template:
    metadata:
      labels:
        app: coffee
    spec:
      containers:
      - name: coffee
        image: nginxdemos/nginx-hello:plain-text
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: coffee-svc
spec:
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: coffee
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tea
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tea
  template:
    metadata:
      labels:
        app: tea
    spec:
      containers:
      - name: tea
        image: nginxdemos/nginx-hello:plain-text
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: tea-svc
spec:
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: tea

```

2.  Buat VirtualServer

```yaml
apiVersion: k8s.nginx.org/v1
kind: VirtualServer
metadata:
  name: cafe-testing
spec:
  host: cafe.nginx.local
  upstreams:
  - name: tea
    service: tea-svc
    port: 80
  - name: coffee
    service: coffee-svc
    port: 80
  routes:
  - path: /tea
    action:
      pass: tea
  - path: /coffee
    action:
      pass: coffee

```

3.  Verifikasi

![Pasted image 20230624204053](https://img.nbtrisna.my.id/Pasted%20image%2020230624204053.png)

```sh
# Testing curl
curl http://localhost:31105/tea -H 'Host: cafe.nginx.local'
curl http://localhost:31105/coffe -H 'Host: cafe.nginx.local'

```

![Pasted image 20230624204300](https://img.nbtrisna.my.id/Pasted%20image%2020230624204300.png)

# Mencoba lb\_method

Dilihat dari refrensi [berikut](https://docs.nginx.com/nginx-ingress-controller/configuration/virtualserver-and-virtualserverroute-resources/?ref=dev.nbtrisna.my.id#upstream), kita bisa menambahkan `lb-method` di upstream section. Untuk metode yang di support bisa ke refrensi [berikut](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/?ref=dev.nbtrisna.my.id#choosing-a-load-balancing-method)

Defaul algortihm yang digunakan nginx-ingress adalah yang tertera dalam configmaps nginx-ingress. Hanya saja tidak ada data yaml yang terdefine di cm ingress.

```sh
k get cm -n nginx-ingress nginx-ingress -o yaml

```

![Pasted image 20230624205128](https://img.nbtrisna.my.id/Pasted%20image%2020230624205128.png)

Oke Gas dicoba.

Ketika tidak mendefinisikan algoritma lb di upstream, dicoba hit 5 kali dan hasilnya seperti berikut

![Pasted image 20230624205245](https://img.nbtrisna.my.id/Pasted%20image%2020230624205245.png)

Pod Name

Jumlah Hit

coffee-7dd75bc79b-9f8l7

4

coffee-7dd75bc79b-2grss

6

Dari hasil hit, nginx memilih pod secara random selama hit.

Saya coba dengan `lb-method: roundrobin`, harusnya akan hit secara bergantian

```yaml
apiVersion: k8s.nginx.org/v1
kind: VirtualServer
metadata:
  name: cafe-testing
spec:
  host: cafe-round.nginx.local
  upstreams:
  - name: tea
    service: tea-svc
    port: 80
  - name: coffee
    service: coffee-svc
    port: 80
    lb-method: round_robin # add spesific on coffe path
  routes:
  - path: /tea
    action:
      pass: tea
  - path: /coffee
    action:
      pass: coffee


```

![Pasted image 20230624205607](https://img.nbtrisna.my.id/Pasted%20image%2020230624205607.png)

Pod Name

Jumlah Hit

coffee-7dd75bc79b-9f8l7

5

coffee-7dd75bc79b-2grss

5

Yup hasilnya akan di loadbalance secara "roundrobin" ke masing" pod. :)