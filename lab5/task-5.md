# **Kriptografija i mrežna sigurnost - Lab 5**

## Asymmetric cryptography: RSA signatures and DH key exchange

Student će realizirati sigurnosni protokol prikazan u nastavku. Protokol u osnovi implementira autenticirani _Diffie-Hellman key exchange protocol_ i omogućava studentu uspostavu dijeljenog simetričnog ključa sa serverom. Uspostavljeni ključ se u konačnici koristi za zaštitu _challenge_-a (studentovog _challenge_-a koji je i ovaj put vic o Chuck Norrisu).

> **Disclaimer:** _Prikazani protokol služi isključivo za edukativne svrhe. Ukoliko želite nešto slično primjeniti u realnom sustavu predlažemo da se prethodno konzultirate s nekim tko ima više iskustva s navedenom problematikom. U ovoj formi prikazani protokol nije siguran._

### Opis protokola

U opisu protokola koristimo sljedeće oznake:

| Oznaka                                 | Opis                                                              |
| -------------------------------------- | :---------------------------------------------------------------- |
| C                                      | klijent (student/ovo računalo)                                    |
| S                                      | server (_crypto oracle_)                                          |
| RSA<sub>priv</sub>                     | privatni RSA key                                                  |
| RSA<sub>priv,C</sub>                   | klijentov privatni RSA ključ                                      |
| RSA<sub>pub</sub>                      | javni RSA ključ                                                   |
| DH<sub>priv</sub>                      | privatni DH ključ                                                 |
| DH<sub>priv,C</sub>                    | klijentov privatni DH ključ                                       |
| DH<sub>pub</sub>                       | javni DH ključ                                                    |
| **Sig**(RSA<sub>priv</sub></sub>, _m_) | RSA digitalno potpisana poruka _m_                                |
| K<sub>DH</sub>                         | dijeljeni DH ključ (i.e., g<sup>xy</sup> mod p)                   |
| K                                      | AES simetrični ključ izveden iz K<sub>DH</sub>                    |
| **AES-256-CTR**(K, _m_)                | enkripcija poruke _m_ u CTR modu s AES šifrom i 256-bit ključem K |
| _a_ \|\| _b_                           | konkatenacija (spajanje) poruka _a_ i _b_                         |

#### Protokol:

| Tko šalje  | Poruka koja se šalje                                                                                                                                   |
| :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| C &rarr; S | RSA<sub>pub,C</sub>                                                                                                                                    |
| S &rarr; C | RSA<sub>pub,S</sub>                                                                                                                                    |
| C &rarr; S | DH<sub>pub,C</sub> \|\| **Sig**(RSA<sub>priv,C</sub></sub> , DH<sub>pub,C</sub>)                                                                       |
| S &rarr; C | DH<sub>pub,S</sub> \|\| **Sig**(RSA<sub>priv,S</sub></sub> , DH<sub>pub,S</sub> \|\| DH<sub>pub,C</sub>) \|\| **AES-256-CTR**(K, "...Chuck Norris...") |

Obje strane, klijent C i server S, po uspješnom prijemu odgovarajućih poruka provjeravaju digitalne potpise izvode najprije dijeljeni Diffie-Hellman ključ K<sub>DH</sub> a zatim 256-bitni AES ključ. Ključem K enkriptira se studentova šala/vic. Ključ K izvodi se iz K<sub>DH</sub> kako je prikazano u nastavku:

```js
const K = crypto.pbkdf2Sync(K_DH, "ServerClient", 1, 32, "sha512");
```

> Primjetite da šala u posljednjoj poruci nije autenticirana; ne štitimo njen integritet. U praksi, uz povjerljivost želite zaštititi i integritet poruke.

### Opis REST API-ja

Detaljan opis REST API-ja za ovu vježbu dostupan je na _root_ stranici vašeg _crypto oracle_-a/virtualnog servera.

### Kratki savjeti

1. Za realizaciju ove vježbe student treba generirati vlastiti par RSA ključeva. Za ovo možete koristiti npr. `openssl`. Alternativno, možete koristiti izvrsnu kripto biblioteku za Python (https://cryptography.io). Instalirajte istu kao `pip install cryptography` a zatim izvršite sljedeću Python skriptu; privatni i javni RSA ključevi bit će pohranjeni i odgovarajućem formatu u nazančenim datotekama:

   ```Python
   from cryptography.hazmat.backends import default_backend
   from cryptography.hazmat.primitives.asymmetric import rsa
   from cryptography.hazmat.primitives import serialization

   # Generating RSA keys
   PRIVATE_KEY = rsa.generate_private_key(
       public_exponent=65537,
       key_size=2048,
       backend=default_backend()
   )

   # Extracting a public key
   PUBLIC_KEY = PRIVATE_KEY.public_key()

   with open("private.pem", "wb") as f:
       f.write(PRIVATE_KEY.private_bytes(
           encoding=serialization.Encoding.PEM,
           format=serialization.PrivateFormat.TraditionalOpenSSL,
           encryption_algorithm=serialization.NoEncryption()
       ))

   with open("public.pem", "wb") as f:
       f.write(PUBLIC_KEY.public_bytes(
           encoding=serialization.Encoding.PEM,
           format=serialization.PublicFormat.SubjectPublicKeyInfo
       ))
   ```

2. Uspostava Diffie-Hellman dijeljenog ključa sa serverom pretpostavlja da koristite odgovarajuće DH parametre (multipikativnu grupu i odgovarajući generator grupe). Server koristi tzv. `modp15` Diffie-Helman grupu; ova grupa definirana je u [RFC3526](https://www.rfc-editor.org/rfc/rfc3526.txt). Preporučamo da za generiranje DH ključeva koristite Node.js kako je prikazano u nastavku. Za više detalja pogledajte [dokumentaciju Node.js `crypto` modula](https://nodejs.org/api/crypto.html#crypto_crypto_getdiffiehellman_groupname):

   ```JavaScript
   const DH = crypto.getDiffieHellman('modp15')
   DH.generateKeys()

   // To get DH public key (hex encoding)
   DH.getPublicKey('hex')
   ```
