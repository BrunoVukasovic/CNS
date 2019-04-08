const axios = require("axios");
const incrementIv = require("./increment-bigint");

const CBC_IV_INCREMENT = 4;
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
      wordList = wordList.split("\r");
    })
    .catch(function(error) {
      console.log(error);
    });
}
GetWordList();

function Timeout() {
  setTimeout(function() {
    console.log(challengeCiphertext);
    console.log(challengeIV);
    console.log(wordList[4]);
  }, 2000);
}
// Timeout();

async function PostPlaintext(word, wantedWord) {
  const response = await axios.post("http://localhost:3000/cbc/iv", {
    plaintext: word
  });
  if (
    challengeCiphertext[0] == response.data.ciphertext[0] &&
    challengeCiphertext[1] == response.data.ciphertext[1]
  ) {
    console.log(wantedWord);
  }
}

function Proba() {
  setTimeout(function() {
    // inkremetirat iv za 4
    console.log(incrementIv(iv, parseInt(CBC_IV_INCREMENT, 10)));

    let wantedWord = wordList[0];
    let word = addPadding(wantedWord);

    // kreiranje buffera za xor
    word = Buffer.from(word, "hex");
    challengeIV = Buffer.from(challengeIV, "hex");

    xorResult = Buffer.alloc(16);

    // xor operacija plain teksta i pocetnog iv-ija
    for (let i = 0; i < word.length; i++) {
      xorResult[i] = word[i] ^ challengeIV[i];
    }

    // xor prethodnog rezultat i inkrementiranog iv-ja
    for (let i = 0; i < word.length; i++) {
      xorResult[i] = xorResult[i] ^ iv[i];
    }

    xorResult = Buffer.from(xorResult).toString("hex");

    // PostPlaintext(xorResult, wantedWord);
  }, 2000);
}
Proba();

function IterateWordList() {
  setTimeout(function() {
    wordList.forEach(selectedWord => {
      // inkremetirat iv za 4
      incrementIv(iv, parseInt(CBC_IV_INCREMENT, 10));

      let wantedWord = selectedWord;
      let word = addPadding(selectedWord);

      // kreiranje buffera za xor
      word = Buffer.from(word, "hex");
      challengeIV = Buffer.from(challengeIV, "hex");

      xorResult = Buffer.alloc(16);

      // xor operacija plain teksta i pocetnog iv-ija
      for (let i = 0; i < word.length; i++) {
        xorResult[i] = word[i] ^ challengeIV[i];
      }

      // xor prethodnog rezultat i inkrementiranog iv-ja
      for (let i = 0; i < word.length; i++) {
        xorResult[i] = xorResult[i] ^ iv[i];
      }

      xorResult = Buffer.from(xorResult).toString("hex");

      console.log(parseInt("F", 16));
      console.log(String.fromCharCode(65));

      // PostPlaintext(xorResult, wantedWord);
    });
  }, 2000);
}
// IterateWordList();

/**
 * Pad the given plaintext according to PKCS#7;
 * please note that this implementation supports
 * only plaintexts of length up to 16 bytes.
 */
function addPadding(plaintext) {
  // assert(
  //   plaintext.length <= 16,
  //   `Plaintext block exceeds 16 bytes (${plaintext.length})`
  // );

  const pad = 16 - plaintext.length;
  const sourceBuffer = Buffer.from(plaintext);
  const targetBuffer = pad > 0 ? Buffer.alloc(16, pad) : Buffer.alloc(32, 16);
  sourceBuffer.copy(targetBuffer, 0, 0);

  return targetBuffer.toString("hex");
}
