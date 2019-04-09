/**
 * Pad the given plaintext according to PKCS#7;
 * please note that this implementation supports
 * only plaintexts of length up to 16 bytes.
 */
function addPadding(plaintext) {
  const pad = 16 - plaintext.length;
  const sourceBuffer = Buffer.from(plaintext);
  const targetBuffer = pad > 0 ? Buffer.alloc(16, pad) : Buffer.alloc(32, 16);
  sourceBuffer.copy(targetBuffer, 0, 0);

  return targetBuffer.toString("hex");
}

module.exports = addPadding;
