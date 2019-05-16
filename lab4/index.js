const axios = require("axios");

let challengeCiphertext = "";
let length = null;

async function Main() {
  // dohvaćanje challenge
  const challenge = await axios.get("http://10.0.15.6/ctr/challenge");
  challengeCiphertext = challenge.data.ciphertext;

  // jer je challengeCiphertext u hex formatu
  // 2 hex znaka = 1 ascii
  length = challengeCiphertext.length / 2;

  // generiranje random rijeci duljine length u hex zapisu
  // chosen-plaintext mora bit iste duljine kao onaj koji zelimo otkrit
  const wordHex = generate_random_hex_string(length);

  while (1) {
    const response = await axios.post("http://10.0.15.6/ctr", {
      plaintext: wordHex
    });
    let cipher = response.data.ciphertext;

    // xor priprema
    cipher = Buffer.from(cipher, "hex");
    challengeCiphertext = Buffer.from(challengeCiphertext, "hex");
    let word = Buffer.from(wordHex, "hex");
    xorResult = Buffer.alloc(length);

    // xor
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
Main();

function generate_random_hex_string(string_length) {
  let random_string = "";
  let random_ascii;
  for (let i = 0; i < string_length; i++) {
    random_ascii = Math.floor(Math.random() * 25 + 97);
    random_string += String.fromCharCode(random_ascii);
  }
  return Buffer.from(random_string).toString("hex");
}
