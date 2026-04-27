---
title: "Docker Registry Mirror"
published: 2025-06-08T01:14:00.000Z
updated: 2025-06-21T01:15:04.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "docker-registry-mirror"
featuredImage: "https://photoby.nbtrisna.my.id/9239f368-b5a0-44d7-baa4-c06ae1572937.jpg"
excerpt: "Refrensi : * https://stackoverflow.com/questions/74595635/how-to-configure-containerd-to-use-a-registry-mirror * https://docs.docker.com/registry/recipes/mirror/ *..."
---

### Refrensi :

-   https://stackoverflow.com/questions/74595635/how-to-configure-containerd-to-use-a-registry-mirror
-   https://docs.docker.com/registry/recipes/mirror/
-   https://docs.docker.com/registry/deploying/#deploy-your-registry-using-a-compose-file
-   https://d7y.io/docs/setup/runtime/containerd/mirror/

Ketika sebuah ip terus"an pull ke registry docker, akan menyebabkan sebuah peringatan limit pull telah terpakai. Biasanya akan reset setelah 6 jam. Untuk menyiasati, dicoba riset install registry mirror di gns3.

### Common issue

-   Tidak bisa login dengan auth htpasswd. syntax docker login bisa, hanya saja ketika pull tidak menggunakan registry-mirror
-   Hanya bisa 1 Registry per registry-mirror. Jadi ketika ingin cache image selain docker.io, harus membuat kembali docker-registry dengan port yang berbeda
-   Bisa untuk containerd, dan docker

![Pasted image 20230529004247](https://img.nbtrisna.my.id/Pasted%20image%2020230529004247.png)

Simple topology

hostname

IP

regis-server

192.168.122.10/24

docker-client

192.168.122.11/24

## Setup registry server

Metode yang dipakai adalah yang paling simple, menggunakan docker compose

Create self-signed certificate (For https)

```sh
mkdir -p registry/{cert,auth,data}
cd registry

openssl req \
  -newkey rsa:4096 -nodes -sha256 -keyout certs/domain.key \
  -addext "subjectAltName = DNS:registry.ngurah.local" \
  -x509 -days 365 -out certs/ca.crt

sudo mkdir -p /etc/docker/certs.d/registry.ngurah.local:5000
sudo cp certs/ca.crt /etc/docker/certs.d/registry.ngurah.local:5000/

```

Or create letsencrypt certificate using dns challange.

```sh
certbot certonly --preferred-challenges=dns --dns-cloudflare \
--server https://acme-v02.api.letsencrypt.org/directory \
--dns-cloudflare-credentials ~/.cloudflare.ini \
--agree-tos -d registry.ngurahbagus.my.id

```

Create User & auth

```sh
docker run \
  --entrypoint htpasswd \
  httpd:2 -Bbn ngurah wait > auth/htpasswd

```

Create docker compose (if self-signed certificate)

```yaml
version: '2'
services:
  registry:
    restart: always
    image: registry:2
    ports:
      - 5000:5000
    volumes:
      - /home/ubuntu/registry/data:/var/lib/registry
      - /home/ubuntu/registry/certs:/certs
      - /home/ubuntu/registry/auth:/auth
      - ./config.yml:/etc/docker/registry/config.yml

```

Create docker compose (if using lets-encrypt)

```yaml
ersion: '2'
services:
  registry:
    restart: always
    image: registry:2
    ports:
      - 5000:5000
    volumes:
      - ./data:/var/lib/registry
      - /etc/letsencrypt/live/example.com/fullchain.pem:/etc/letsencrypt/live/example.com/fullchain.pem
      - /etc/letsencrypt/live/example.com/privkey.pem:/etc/letsencrypt/live/example.com/privkey.pem
      - ./auth:/auth
      - ./config.yml:/etc/docker/registry/config.yml

```

Create config.yml

```yaml
version: 0.1
log:
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
http:
  addr: :5000
  host: https://example.com
  headers:
    X-Content-Type-Options: [nosniff]
  tls:
    certificate: # your certificate
    key: # your cert key

health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3
proxy:
  remoteurl: https://registry.k8s.io # mirroring k8s.io


```

Running docker container

```sh
docker-compose up -d

```

Try login

```sh
docker login registry.ngurah.local:5000
---
Login Succeeded # Berhasil

```

## Setup mirror registry client Docker

> Using Docker-client first

Setup insecure registry

```sh
# Skip if you not using self-signed cert
sudo mkdir -p /etc/docker/certs.d/registry.ngurah.local:5000
sudo cp ca.crt /etc/docker/certs.d/registry.ngurah.local:5000/

```

Configure mirror,

```sh
sudo vi /etc/docker/daemon.json
---
{
  "registry-mirrors": ["https://registry.ngurah.local:5000"]
}

```

Restart docker, & try pull private image using credentials on registry-server

```sh
sudo systemctl restart docker
docker pull hello-world 

# Check registry catalog
curl https://example.com:5000/v2/_catalog
---
{"repositories":["kube-proxy","library/hello-world"]} # makesure image availible

```

Sekarang image akan tercache di registry server

## Setup mirror registry client containerd

Setup mirror first

```sh
mkdir /etc/containerd/certs.d/registry.k8s.io
sudo vi /etc/containerd/certs.d/registry.k8s.io/hosts.toml
---
server = "https://registry.k8s.io"

[host."https://example:5000"]
  capabilities = ["pull", "resolve"]

```

Konfigurasi /etc/containerd/config.toml untuk membaca registry di certs.d

```yaml
    [plugins."io.containerd.grpc.v1.cri".registry] 
      config_path = "/etc/containerd/certs.d" # enable

```

Restart containerd & try pull registry.k8s.io

```sh
sudo systemctl restart containerd.io
sudo crictl pull registry.k8s.io/kube-proxy:v1.27.2

```