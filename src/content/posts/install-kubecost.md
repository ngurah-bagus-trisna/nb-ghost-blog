---
title: "Install Kubecost"
published: 2025-06-09T01:13:00.000Z
updated: 2025-06-21T01:13:24.000Z
tags: 
  - "catatan"
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "install-kubecost"
featuredImage: "https://photoby.nbtrisna.my.id/f93f74c8-4c16-4abe-b636-ee096b89a021.jpg"
excerpt: "Kubecost merupakan tools yang digunakan untuk tracing, monitoring biaya dari sebuah on-premises kubernetes cluster. Installasi Refrensi : https://www.kubecost.com/install#show-instructions Installasi..."
---

Kubecost merupakan tools yang digunakan untuk tracing, monitoring biaya dari sebuah on-premises kubernetes cluster.

## Installasi

Refrensi : https://www.kubecost.com/install#show-instructions

Installasi kubecost menggunakan helm, disini ketika melakukan installasi kubecost, secara otomatis akan terinstall prometheus dan grafana.

1.  Get helm values

```sh
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm show values kubecost kubecost/cost-analyzer -n kubecost > values.yaml

```

2.  Sesuaikan values

Disini saya menyesuaikan mata uang yang digunakan dalam dashboard Kubecost

```yaml
kubecostProductConfigs:
    currencyCode: IDR

```

Untuk service yang sebelumnya `ClusterIP`, saya set ke `NodePort` agar dapat mudah diakses.

```yaml
service:
  type: NodePort 
  nodePort: 30003

```

3.  Installasi

```sh
helm upgrade --install kubecost \
  --repo https://kubecost.github.io/cost-analyzer/ cost-analyzer \
  --namespace kubecost --create-namespace -f values.yaml

```

Result, pastikan pod running semua.

![Pasted image 20241108195027](https://img.nbtrisna.my.id/Pasted%20image%2020241108195027.png)

Url dapat diakses dengan nodeport :30003

![Pasted image 20241108195822](https://img.nbtrisna.my.id/Pasted%20image%2020241108195822.png)