---
title: "Pod Security Standards"
published: 2024-09-26T23:13:46.000Z
tags: []
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "pod-security-standards"
featuredImage: "/content/images/2024/09/pss-1.png"
excerpt: "Refrensi : https://kubernetes.io/docs/concepts/security/pod-security-standards Dalam pembuatan pod dalam kubernetes, secara default semua user akan dapat membuat sebuah pod yang dapat mengkases..."
---

Refrensi : https://kubernetes.io/docs/concepts/security/pod-security-standards

Dalam pembuatan pod dalam kubernetes, secara default semua user akan dapat membuat sebuah pod yang dapat mengkases segalanya karena disini secara default, kubernetes tidak membatasi pembuatan pod sesuai ketentuan yang berlaku. Misalnya user dapat membuat sebuah `pod-debug` yang dapat digunakan untuk eksploitasi cluster k8s.

### Policy Levels

Terdapat 3 kebijakan yang dapat diterapkan

Profile

Deskripsi

**Privileged** *(Default)*

Memberikan tingkat izin seluas mungkin. *(Unrestricted).* Biasanya profile ini digunakan untuk system dan infrastruktur level workload. Jika deploy pod dalam policy privileged, pod akan bisa bypass mekanisme isolasi sebuah container. Misalnya kita bisa mengakses `hostNetwork`

**Baseline**

Kebijakan `Baseline` bertujuan untuk penggunaan container secara umum, dan melindungi sistem dari celah keamanan yang bisa membuat pengguna mendapatkan akses yang lebih tinggi dari seharusnya. Kebijakan ini ditujukan bagi mereka yang menangani aplikasi yang tidak terlalu penting atau krusial, seperti pengembang atau operator aplikasi biasa.

**Restricted**

Kebijakan *Restricted* berfokus pada penerapan langkah-langkah keamanan terbaik untuk melindungi Pod. Artinya, keamanan diprioritaskan, bahkan jika beberapa kebutuhan kompabilitas tidak dapat dipenuhi

Selengkapnya untuk melihat apa saja yang diabatasi dalam setiap profile, dapat dilihat di refrensi berikut https://kubernetes.io/docs/concepts/security/pod-security-standards/#profile-details

### Namespace level

Untuk testing. Disini misal untuk setiap pod diseluruh namespace diharuskan mengikuti policy `restricted`

Untuk melihat apa saja yang dibatasi dalam restricted : https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted

```sh
kubectl label --dry-run=server --overwrite ns --all pod-security.kubernetes.io/enforce=restricted

```

![](/content/images/2024/09/image.png)

Disini saya mencoba membuat namespace baru, dengan menerapkan,

-   `pod-security.kubernetes.io/audit=baseline` = Untuk yang tidak mematuhi policy `baseline` maka akan dicatat audit
-   `pod-security.kubernetes.io/warn=restricted` = Untuk yang tidak mematuhi policy `restricted` ataupun `baseline` maka akan diberi warning
-   `pod-security.kubernetes.io/enforce=restricted` = Untuk yang tidak mematuhi `restricted` maka akan dilarang membuat pod tersebut.

```sh
kubectl create ns test-pss
kubectl label --overwrite namespace test-pss \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/enforce=restricted

```

lalu coba deploy pod yang disini terlihat menggunakan `securityContext[*]` yang dalam implementasi kita dilarang, jadinya seperti berikut

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: testytest
spec:
  selector:
    matchLabels:
      app: nginxdeployment
  replicas: 2
  template:
    metadata:
      namespace: webapp
      labels:
        app: nginxdeployment
    spec:
      containers:
      - name: nginxdeployment
        image: nginx:latest
        securityContext:
          allowPrivilegeEscalation: true
          readOnlyRootFilesystem: false
          privileged: true
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
        ports:
        - containerPort: 80

```

Resultnya seperti berikut, dari pengujian pod tidak akan di deploy karena tidak memenuhi policy `restricted`

![](/content/images/2024/09/image-1.png)

Untuk melihat audit, dapat dilihat dengan `kubectl get events -n <namespace>`

![](/content/images/2024/09/image-2.png)

Selanjutnya mencoba membuat pod dengan command `kubectl run -n test-pss --image nginx`, disini dilarang oleh `pss` karena pod yang baru dibuat, berjalan menggunakan user root. Hasilnya pod tidak akan dischedule

![](/content/images/2024/09/image-3.png)

Dicoba dengan manifest, mengikuti beberapa policy yang harus dipatuhi sesuai dengan warning

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: testing-pss
  name: testing-pss
  namespace: test-pss
spec:
  containers:
  - image: nginx
    name: testing-pss
    resources: {}
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop: ["ALL"]
      runAsNonRoot: true
      seccompProfile:
        type: RuntimeDefault
  dnsPolicy: ClusterFirst
  nodeName: lab-k8s-ebpf-worker-01
  restartPolicy: Always
status: {}

```

Pod tersebut `error`. dengan keterangan describe berikut,

```
Warning  Failed     10s (x4 over 39s)  kubelet            Error: container has runAsNonRoot and image will run as root (pod: "testing-pss_test-pss(7a747c1b-8a38-4c5a-aa2f-4a05a9b0989e)", container: testing-pss)

```

Disini terdapat error berikut karena image dari `nginx` mengharuskan hak akses tertinggi yaitu `root`. Dalam refrensi lain, menerangkan bahwa jika menggunakan `runAsNonRoot=true` diwajibkan untuk mendefinisikan `runAsUser` agar dapat berjalan di spesifik user, hasilnya pod `clbo` dan log nya sebagai berikut

![](/content/images/2024/09/image-4.png)

Terdapat alternatif dalam mengatasi hal tersebut, yaitu mendefinisikan `runAsUser: 1000` agar pod berjalan di spesifik user, dan menggunakan `unprivileged` image, disini saya mendapatkan image nginx `nginxinc/nginx-unprivileged:perl`. Berikut manifest setelah diubah,

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: testing-pss
  name: testing-pss
  namespace: test-pss
spec:
  containers:
  - image: nginxinc/nginx-unprivileged:perl
    name: testing-pss
    resources: {}
    securityContext:
      runAsUser: 1000
      allowPrivilegeEscalation: false
      capabilities:
        drop: ["ALL"]
      runAsNonRoot: true
      seccompProfile:
        type: RuntimeDefault
  dnsPolicy: ClusterFirst
  nodeName: lab-k8s-ebpf-worker-01
  restartPolicy: Always
status: {}

```

Hasilnya, pod dapat berjalan dengan normal

![](/content/images/2024/09/image-5.png)

## Kesimpulan.

Setelah di test menerapkan di spesifik namespace, beberapa hal yang mungkin terjadi jika memang menerapkan `restricted`

-   Beberapa image yang mengharuskan `root` tidak dapat di deploy. Dikarenakan `runAsNonRoot` , disini sudah dicontohkan menggunakan image `nginx`
-   Port dibawah 1024 di forbidden (beberapa image unprivilage menggunakan port > 1024)