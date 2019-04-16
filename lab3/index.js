const axios = require("axios");

const incrementIv = require("./incrementIv");
const addPadding = require("./addPadding");

let challengeCiphertext = "";
let challengeIV = "";
let wordList = [];
let iv = null;

// get ciphertext that needs to be decrypted
// server reponds with ciphertext and iv used in CBC
async function GetChallenge() {
  const response = await axios.get("http://localhost:3000/cbc/iv/challenge");
  challengeIV = response.data.iv;
  challengeCiphertext = response.data.ciphertext;
  console.log(response.data);
}
GetChallenge();

// all words (including one that needs to be decrypted from challengeCiphertext)
// are stored in wordlist.txt file
async function GetWordList() {
  const response = await axios.get("http://localhost:3000/wordlist.txt");
  wordList = response.data;
  // try \n instead of \r\n
  wordList = wordList.split("\r\n");

  // server will reposnd with chipertext and used iv (data.iv)
  // iv will be predictibly incremented for each future post request
  const initalIV = await axios.post("http://localhost:3000/cbc/iv", {
    plaintext: "test"
  });
  iv = initalIV.data.iv;

  iv = Buffer.from(iv, "hex");
  IterateWordList();
}
GetWordList();

function IterateWordList() {
  for (let selectedWord of wordList) {
    // incrementing iv by 4, as server does
    incrementIv(iv, 4);

    // add padding as server does
    // server adds padding beacuse AES uses 16 bytes blocks
    let wordWithPadding = addPadding(selectedWord);

    // creating buffer for xor operation
    let wordHex = Buffer.from(wordWithPadding, "hex");
    challengeIV = Buffer.from(challengeIV, "hex");

    xorResult = Buffer.alloc(16);

    // plainText XOR challengeIV XOR iv(incrementing iv by 4 in ervery iteration)
    // kad server jos doda XOR iv, ponistit ce se, i u enkripcijski algoritam
    // ulazi plainText XOR challengeIV
    for (let i = 0; i < challengeIV.length; i++) {
      xorResult[i] = wordHex[i] ^ challengeIV[i] ^ iv[i];
    }

    xorResult = Buffer.from(xorResult).toString("hex");

    PostPlaintext(xorResult, selectedWord);
  }
}

async function PostPlaintext(word, wantedWord) {
  const response = await axios.post("http://localhost:3000/cbc/iv", {
    plaintext: word
  });
  let cipher = response.data.ciphertext.slice(0, 32);
  if (challengeCiphertext == cipher) {
    console.log(wantedWord);
    console.log(challengeCiphertext);
    console.log(cipher);
  }
}
