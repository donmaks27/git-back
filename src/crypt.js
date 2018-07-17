// Модуль для шифрования

const crypto = require('crypto');



/**
 * Шифрование AES
 * @param {string} str Исходная строка
 * @param {{key: string, iv: string}} key Ключ шифрования
 * @returns {string} Зашифрованная строка
 */
var AES_Encrypt = (str, key) => {
    let result;
    try {
        result = AES_Crypt(true, str, key);
    }
    catch (error) {
        result = null;
    }
    return result;
}
/**
 * Дешифрование AES
 * @param {string} str Исходная строка
 * @param {{key: string, iv: string}} key Ключ шифрования
 * @returns {string} Дешифрованная строка
 */
var AES_Decrypt = (str, key) => {
    let result;
    try {
        result = AES_Crypt(false, str, key);
    }
    catch (error) {
        result = null;
    }
    return result;
}



/**
 * Шифрование/Дешифрование AES
 * @param {boolean} isEncrypt Шифровать или дешифровать
 * @param {string} str Исходная строка
 * @param {{key: string, iv: string}} key Ключ шифрования
 * @returns {string} Зашифрованная/Дешифрованная строка
 */
var AES_Crypt = (isEncrypt, str, key) => {
    let aesKey = Buffer.from(key.key, 'binary');
    let aesIv = Buffer.from(key.iv, 'binary');
    let cipher = isEncrypt ? crypto.createCipheriv('aes-256-cbc', aesKey, aesIv)
                           : crypto.createDecipheriv('aes-256-cbc', aesKey, aesIv);
    cipher.setAutoPadding(true);
    str = cipher.update(str, 'binary', 'binary') + cipher.final('binary');
    return str;
}



/**
 * Хэш
 * @param {string} str Исходная строка
 * @returns {string} Хэш строки
 */
var SHA256 = str => {
    let result;
    try {
        let crypter = crypto.createHash('sha256');
        crypter.update(Buffer.from(str, 'binary'));
        result = crypter.digest();
        result = result.toString('binary');
    }
    catch (error) {
        result = null;
    }
    return result;
}



/**
 * Сменить кодировку строки
 * @param {string} source Исходная строка
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка исходной строки
 * @param {"binary" | "utf8" | "base64" | "hex"} [encodeSource] Кодировка результирующей строки
 * @returns {string} Результирующая строка
 */
var ChangeEncode = (source, encodeTarget, encodeSource) => {
    switch (encodeTarget) {
        case 'binary': case 'utf8': case 'base64': case 'hex': break;
        default: encodeTarget = 'binary';
    }
    switch (encodeSource) {
        case 'binary': case 'utf8': case 'base64': case 'hex': break;
        default: encodeSource = 'binary';
    }
    if (encodeSource !== encodeTarget)
        source = source ? Buffer.from(source, encodeSource).toString(encodeTarget) : '';
    return source;
}



module.exports.aes = {
    generateKey: AES_GenerateKey,
    encrypt: AES_Encrypt,
    decrypt: AES_Decrypt
}
module.exports.sha256 = SHA256;
module.exports.changeEncode = ChangeEncode;