const axios = require("axios");

const incrementIv = require("./incrementIv");
const addPadding = require("./addPadding");

let challengeCiphertext = "";
let challengeIV = "";
let wordList = [];
let iv = null;

async function GetChallenge() {
  const response = await axios
    .get("http://localhost:3000/cbc/iv/challenge")
    .then(function(response) {
      challengeIV = response.data.iv;
      challengeCiphertext = response.data.ciphertext;
      console.log(response.data);
      // copy of challengeIV that will be incremented
      iv = Buffer.from(challengeIV, "hex");
    })
    .catch(function(error) {
      console.log(error);
    });
}
GetChallenge();

async function GetWordList() {
  const response = await axios
    .get("http://localhost:3000/wordlist.txt")
    .then(function(response) {
      wordList = response.data;
      wordList = wordList.split("\r\n");
      // GetInitialIv();
      IterateWordList();
    })
    .catch(function(error) {
      console.log(error);
    });
}
GetWordList();

function IterateWordList() {
  setTimeout(function() {
    wordList.forEach(selectedWord => {
      // inkremetirat iv za 4
      incrementIv(iv, 4);

      let wordWithPadding = addPadding(selectedWord);

      // kreiranje buffera za xor
      let wordHex = Buffer.from(wordWithPadding, "hex");
      challengeIV = Buffer.from(challengeIV, "hex");

      xorResult = Buffer.alloc(16);

      // plainText XOR challengeIV XOR iv(svakom iteracijom se uvecava za 4)
      // kad server jos doda XOR iv, ponistit ce se, i u enkripcijski algoritam
      // ulazi plainText XOR challengeIV
      for (let i = 0; i < challengeIV.length; i++) {
        xorResult[i] = wordHex[i] ^ challengeIV[i] ^ iv[i];
      }

      xorResult = Buffer.from(xorResult).toString("hex");

      PostPlaintext(xorResult, selectedWord);
    });
  }, 2000);
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

async function GetInitialIv() {
  const response = await axios.post("http://localhost:3000/cbc/iv", {
    plaintext: "test"
  });
  iv = response.data.iv;
  console.log(iv);
}
