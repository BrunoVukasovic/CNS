const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const clientRSAPublic = fs.readFileSync(
  path.join(__dirname, "RSA_keys", "public.pem"),
  {
    encoding: "hex"
  }
);

const clientRSAPrivate = fs.readFileSync(
  path.join(__dirname, "RSA_keys", "private.pem")
);
// // // // // // // // // // // // // //
const clientPublicRSAKey = fs.readFileSync(
  path.join(__dirname, "RSA_keys", "public.pem"),
  {
    encoding: "hex"
  }
);

const clientPrivateRSAKey = fs.readFileSync(
  path.join(__dirname, "RSA_keys", "private.pem")
);

async function KeyExchange() {
  // RSA
  // send to server our RSA public key
  let postPublicRSA = await axios.post(
    "http://localhost:3000/asymm/rsa/client",
    {
      key: clientPublicRSAKey
    }
  );

  // get server's RSA public key
  let getPublicRSA = await axios.get("http://localhost:3000/asymm/rsa/server");
  console.log("Server's public RSA key:\n" + getPublicRSA.data.key);

  // DH
  // server uses modp15 Diffie-Hellman group
  const DH = crypto.getDiffieHellman("modp15");
  // generate client's Diffie-Hellman keys
  DH.generateKeys();

  // To get DH public key (hex encoding)
  let clientPublicDHKey = DH.getPublicKey("hex");
  console.log("\nClient's public DH key:\n" + clientPublicDHKey);

  // sign client's public DH key with private RSA key
  const sign = crypto.createSign("SHA256");
  sign.write(clientPublicDHKey);
  sign.end();
  const signature = sign.sign(clientPrivateRSAKey, "hex");

  // send singed public DH to server
  let postPublicDH = await axios.post("http://localhost:3000/asymm/dh/client", {
    key: clientPublicDHKey,
    signature: signature
  });

  let message = await axios.get("http://localhost:3000/asymm/challenge");
  const serverpublicDHKey = message.data.key;
  const ciphertext = message.data.challenge.ciphertext;

  console.log("\nServer's public DH key:\n" + serverpublicDHKey);
  console.log("\nCiphertext:\n" + ciphertext);

  const sharedDHKey = DH.computeSecret(serverpublicDHKey, "hex");
  const K = crypto.pbkdf2Sync(sharedDHKey, "ServerClient", 1, 32, "sha512");
  console.log("\nDjeljeni DH kljuc je:\n" + sharedDHKey.toString("hex"));
  console.log("\nKljuc kojim je enkriptiran vic je:\n" + K.toString("hex"));
}

KeyExchange();

async function RequestFunction() {
  let publicKeyRequest = await axios.get(
    "http://localhost:3000/asymm/rsa/server"
  );
  let publicKeyServer = await publicKeyRequest.data.key;
  console.log(publicKeyRequest.data);

  let rsaClientResult = await axios.post(
    "http://localhost:3000/asymm/rsa/client",
    {
      key: clientRSAPublic
    }
  );
  let rsaClient = await rsaClientResult.data.result;
  console.log(rsaClient);
  // // // // // // // // // // // // // // //// // // // // // // // // // // // // //
  const DHClientKey = crypto.getDiffieHellman("modp15");
  DHClientKey.generateKeys();

  const sign = crypto.createSign("RSA-SHA256");
  sign.write(DHClientKey.getPublicKey("hex"));
  sign.end();
  signature = sign.sign(clientRSAPrivate, "hex");

  let dhClientResult = await axios.post(
    "http://localhost:3000/asymm/dh/client",
    {
      key: DHClientKey.getPublicKey("hex"),
      signature: signature
    }
  );
  let dhClient = await dhClientResult.data.result;
  console.log(dhClient);

  let challenge = await axios.get("http://localhost:3000/asymm/challenge");
  let DHServerKey = await challenge.data.key;
  let myChallenge = await challenge.data.challenge;
  console.log("server dh je " + DHServerKey);
  console.log("CHALLENGE JE ", myChallenge);

  const dhSharedKey = DHClientKey.computeSecret(DHServerKey, "hex");
  const K = crypto.pbkdf2Sync(dhSharedKey, "ServerClient", 1, 32, "sha512");

  console.log("kluc je ", K.toString("hex"));

  // moje
  let ciphertext = challenge.data.challenge.ciphertext;
  console.log(ciphertext);
  ciphertext = Buffer.from(ciphertext, "hex");
  let key = Buffer.from(K, "hex");
  console.log(key); // ovo je kljuc za AES a ne key stream
  console.log(ciphertext);
  let length = ciphertext.length / 2;
  xorResult = Buffer.alloc(length);
  console.log(xorResult);
  for (let i = 0; i < ciphertext.length; i++) {
    xorResult[i] = ciphertext[i] ^ key[i];
  }
  xorResult = xorResult.toString("utf8");
  console.log(xorResult);
}
// RequestFunction();
