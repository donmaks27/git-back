// Модуль для шифрования

const crypto = require('crypto');



/**
 * Генерация ключа для AES шифрования
 * @returns {{key: string, iv: string}} Ключ AES
 */
var AES_GenerateKey = () => {
    let result;
    try {
        let key = Random(48);
        result = {
            key: ChangeEncode(key.substr(0, 32), 'binary'),
            iv: ChangeEncode(key.substr(32, 48), 'binary')
        };
    }
    catch (error) {
        result = null;
    }
    return result;
}
/**
 * Генерация ключа для AES шифрования
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @returns {{key: string, iv: string}} Ключ AES
 */
var AES_GenerateKey_ChangeEncode = (encodeTarget) => {
    let key = AES_GenerateKey();
    key.key = ChangeEncode(key.key, encodeTarget, 'binary');
    key.iv = ChangeEncode(key.iv, encodeTarget, 'binary');
    return key;
}

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
 * Шифрование AES
 * @param {string} str Исходная строка
 * @param {{key: string, iv: string}} key Ключ шифрования
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeSource Кодировка исходной строки
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @returns {string} Зашифрованная строка
 */
var AES_Encrypt_ChangeEncode = (str, key, encodeSource, encodeTarget) => {
    let result = ChangeEncode(str, 'binary', encodeSource);
    result = AES_Encrypt(result, key);
    result = ChangeEncode(result, encodeTarget, 'binary');
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
 * Дешифрование AES
 * @param {string} str Исходная строка
 * @param {{key: string, iv: string}} key Ключ шифрования
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeSource Кодировка исходной строки
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @returns {string} Дешифрованная строка
 */
var AES_Decrypt_ChangeEncode = (str, key, encodeSource, encodeTarget) => {
    let result = ChangeEncode(str, 'binary', encodeSource);
    result = AES_Decrypt(result, key);
    result = ChangeEncode(result, encodeTarget, 'binary');
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
 * Хэш SHA256
 * @param {string} str Исходная строка
 * @returns {string} Хэш строки
 */
var SHA256 = str => {
    let result;
    try {
        let crypter = crypto.createHash('sha256');
        crypter.update(Buffer.from(str, 'binary'));
        result = crypter.digest().toString('binary');
    }
    catch (error) {
        result = null;
    }
    return result;
}
/**
 * Хэш SHA256 со сменой кодировки
 * @param {string} str Исходная строка
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeSource Кодировка исходной строки
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @returns {string} Хэш строки
 */
var SHA256_ChangeEncode = (str, encodeSource, encodeTarget) => {
    let result = ChangeEncode(str, 'binary', encodeSource);
    result = SHA256(result);
    return ChangeEncode(result, encodeTarget, 'binary');
}



/**
 * Хэш HMAC-SHA256
 * @param {string} str Исходная строка
 * @param {string} key Ключ для хэша
 * @returns {string} Хэш строки
 */
var HMACSHA256 = (str, key) => {
    let result;
    try {
        let hmacKey = Buffer.from(key, 'binary');
        let crypter = crypto.createHmac('sha256', hmacKey);
        crypter.update(Buffer.from(str, 'binary'));
        result = crypter.digest().toString('binary');
    }
    catch (error) {
        result = null;
    }
    return result;
}
/**
 * Хэш HMAC-SHA256 со сменой кодировки
 * @param {string} str Исходная строка
 * @param {string} key Ключ для хэша
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeSource Кодировка исходной строки
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @returns {string} Хэш строки
 */
var HMACSHA256_ChangeEncode = (str, key, encodeSource, encodeTarget) => {
    let result = ChangeEncode(str, 'binary', encodeSource);
    result = HMACSHA256(result, key);
    return ChangeEncode(result, encodeTarget, 'binary');
}



/**
 * Генерация рандомной строки
 * @param {number} bytes Количество байт
 * @returns {string} Рандомная строка (binary)
 */
var Random = bytes => {
    let data = crypto.randomBytes(bytes);
    data = data.toString('binary');
    return data;
}
/**
 * Сменить кодировку строки
 * @param {string} source Исходная строка
 * @param {"binary" | "utf8" | "base64" | "hex"} encodeTarget Кодировка результирующей строки
 * @param {"binary" | "utf8" | "base64" | "hex"} [encodeSource] Кодировка исходной строки
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
    encrypt: AES_Encrypt,
    encrypt_changeEncode: AES_Encrypt_ChangeEncode,
    decrypt: AES_Decrypt,
    decrypt_changeEncode: AES_Decrypt_ChangeEncode,
    generateKey: AES_GenerateKey,
    generateKey_changeEncode: AES_GenerateKey_ChangeEncode
}
module.exports.sha256 = SHA256;
module.exports.sha256_changeEncode = SHA256_ChangeEncode;
module.exports.hmacsha256 = HMACSHA256;
module.exports.hmacsha256_changeEncode = HMACSHA256_ChangeEncode;
module.exports.changeEncode = ChangeEncode;