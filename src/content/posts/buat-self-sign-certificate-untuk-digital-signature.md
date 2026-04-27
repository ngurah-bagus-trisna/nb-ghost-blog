---
title: "Buat Self-sign Certificate untuk Digital Signature"
published: 2024-07-31T09:16:54.000Z
tags: []
author: "I Gusti Ngurah Bagus Trisna Andika"
authorSlug: ngurah
slug: "buat-self-sign-certificate-untuk-digital-signature"
featuredImage: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDF8fENlcnRpZmljYXRlfGVufDB8fHx8MTcyMjQxNzM5N3ww&ixlib=rb-4.0.3&q=80&w=2000"
excerpt: "1. Buat openssl.cnf [req] default_bits = 2048 distinguished_name = req_distinguished_name req_extensions = req_ext prompt = no [req_distinguished_name] C = ID ST = Bali L = Denpasar O = Your..."
---

1.  Buat `openssl.cnf`

```cnf
[req]
default_bits       = 2048
distinguished_name = req_distinguished_name
req_extensions     = req_ext
prompt             = no

[req_distinguished_name]
C  = ID
ST = Bali
L  = Denpasar
O  = Your Organization
OU = Your Department
CN = Your Name
emailAddress = your.email@example.com


[req_ext]
keyUsage = critical, digitalSignature, nonRepudiation
extendedKeyUsage = clientAuth, emailProtection
subjectAltName = @alt_names

[alt_names]
email = your.email@example.com
```

2.  Generate key & CSR

```shell
openssl req -new -keyout my_private_key.pem -out my_certificate_request.csr -config openssl.cnf
```

3.  Self-sign csr yang sudah dibuat

```shell
openssl x509 -req -days 365 -in my_certificate_request.csr -signkey my_private_key.pem -out my_certificate.pem -extensions req_ext -extfile openssl.cnf

```

4.  Verifikasi

```shell
openssl x509 -in my_certificate.pem -text -noout
```

5.  Convert ke .p12

```shell
openssl pkcs12 -export -out my_certificate.p12 -inkey my_private_key.pem -in my_certificate.pem
```

Dan certificate ini bisa digunakan misal ingin membuat selfhosted digital signature dengan `DocuSeal`