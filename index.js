const axios = require("axios");

let challengeCiphertext = "";
let challengeIV = "";
let wordList = [];

async function GetChallenge() {
  const response = await axios
    .get("http://localhost:3000/cbc/iv/challenge")
    .then(function(response) {
      challengeIV = response.data.iv;
      challengeCiphertext = response.data.ciphertext;
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
Timeout();

async function PostPlaintext() {
  const response = await axios.post("http://localhost:3000/cbc/iv", {
    plaintext: "txt"
  });
  console.log(response.data);
}
// PostPlaintext();
