const axios = require("axios");

let challengeCiphertext = "";
let length = null;

// get ciphertext that needs to be decrypted
// server reponds with ciphertext and iv used in CBC
async function GetChallenge() {
  const response = await axios.get("http://localhost:3000/ctr/challenge");
  challengeCiphertext = response.data.ciphertext;
  length = challengeCiphertext.length;
  console.log("challengeCiphertext: " + challengeCiphertext);
  console.log("length: " + cipherLength);
}
// GetChallenge();

async function PostPlaintext() {
  challengeCiphertext =
    "b4420e24f1f57ee0bce3f5835a0b26b176f3d33375361ba15c493c69c944c8004bacc1b01cf102acc1552d62e3";
  length = challengeCiphertext.length / 2;

  const wordHex = generate_random_hex_string(length);

  while (1) {
    const response = await axios.post("http://localhost:3000/ctr", {
      plaintext: wordHex
    });
    let cipher = response.data.ciphertext;
    cipher = Buffer.from(cipher, "hex");
    challengeCiphertext = Buffer.from(challengeCiphertext, "hex");
    let word = Buffer.from(wordHex, "hex");
    xorResult = Buffer.alloc(length);

    for (let i = 0; i < cipher.length; i++) {
      xorResult[i] = challengeCiphertext[i] ^ cipher[i] ^ word[i];
    }
    xorResult = xorResult.toString("utf8");
    if (xorResult.search("Chuck") != -1 || xorResult.search("Norris") != -1) {
      console.log(xorResult);
      break;
    }
  }
}
PostPlaintext();

function generate_random_hex_string(string_length) {
  let random_string = "";
  let random_ascii;
  for (let i = 0; i < string_length; i++) {
    random_ascii = Math.floor(Math.random() * 25 + 97);
    random_string += String.fromCharCode(random_ascii);
  }
  return Buffer.from(random_string).toString("hex");
}
