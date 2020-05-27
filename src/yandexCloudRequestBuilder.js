// Модуль для построения запросов к Яндекс.Облаку

/**
 * Аккаунт для Яндекс.Облака
 * @typedef {{backetName: string, serviceAccountKeyID: string, serviceAccountKey: string}} YandexCloudAccount 
 */

var fs = require('fs');
var http = require('http');

const Write = require('./color_write');
var consts = require('./consts');
const Crypt = require('./crypt');

/**
 * Конструктор
 * @param {consts} Consts Константы
 */
function YandexCloudRequestBuilder (Consts) {

    /**
     * Отправить GET запрос
     * @param {string} path Путь к запрашиваемому ресурсу (без указания бакета, т.е. /<project>)
     * @param {{[paramName: string]: string}} queryParams Параметры запроса
     * @param {(error: bool, responce: http.IncomingMessage, data: string) => void} callback Функция обратного вызова
     */
    var SendGetRequest = (path, queryParams, callback) => {
        if (typeof callback !== 'function') {
            return;
        }
        GetYandexCloudAccount((error, yandexCloudAccount) => {
            if (error) {
                Write.file.error('Ошибка чтения yandexCloudAccount');
                callback(true);
                return;
            }

            let host = 'storage.yandexcloud.net';
            path = '/' + yandexCloudAccount.backetName + path;
            let dateWithTime = GetDateStringWithTime();
            let payloadHash = Crypt.sha256_changeEncode('', 'utf8', 'hex');;
            let headers = {
                'x-amz-date': dateWithTime,
                'x-amz-content-sha256': payloadHash
            };

            let signHeaders = headers;
            signHeaders['host'] = host;
            let authorizationHeader = BuildAuthHeader(yandexCloudAccount, 'GET', path, queryParams, signHeaders, payloadHash, dateWithTime);
            headers['Authorization'] = authorizationHeader;

            if (Object.keys(queryParams).length > 0) {
                path += '?' + queryParams.join('&');
            }
            let request = http.request({
                method: 'GET',
                host: host,
                path: path,
                headers: headers
            }, (response) => {
                // Чтение тела ответа
                let body = '';
                response.setEncoding('utf-8');
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    callback(false, response, body);
                });
            });
    
            request.on('error', error => {
                Write.file.error(error.message);
                callback(true);
            });

            request.end();
        });
    }

    /**
     * Отправить PUT запрос
     * @param {string} path Путь к запрашиваемому ресурсу (без указания бакета, т.е. /<project>)
     * @param {{[paramName: string]: string}} queryParams Параметры запроса
     * @param {string} data Передаваемые данные
     * @param {(error: bool, responce: http.IncomingMessage) => void} callback Функция обратного вызова
     */
    var SendPutRequest = (path, queryParams, data, callback) => {
        if (typeof callback !== 'function') {
            return;
        }
        GetYandexCloudAccount((error, yandexCloudAccount) => {
            if (error) {
                Write.file.error('Ошибка чтения yandexCloudAccount');
                callback(true);
                return;
            }

            let host = 'storage.yandexcloud.net';
            path = '/' + yandexCloudAccount.backetName + path;
            let dateWithTime = GetDateStringWithTime();
            let payloadHash = Crypt.sha256_changeEncode(data, 'binary', 'hex');
            let headers = {
                'x-amz-date': dateWithTime,
                'x-amz-content-sha256': payloadHash,
                'x-amz-storage-class': 'COLD'
            };

            let signHeaders = headers;
            signHeaders['host'] = host;
            let authorizationHeader = BuildAuthHeader(yandexCloudAccount, 'PUT', path, queryParams, signHeaders, payloadHash, dateWithTime);
            headers['Authorization'] = authorizationHeader;

            if (Object.keys(queryParams).length > 0) {
                path += '?' + queryParams.join('&');
            }
            let request = http.request({
                method: 'PUT',
                host: host,
                path: path,
                headers: headers
            }, (response) => {
                callback(false, response);
            });

            request.on('error', function (error) {
                Write.file.error(error.message);
                callback(true);
            });

            request.write(data, (error) => {
                if (error) {
                    Write.file.error('Ошибка добавления данных в запрос');
                    callback(true);
                    return;
                }

                request.end();
            });
        });
    }

    /**
     * Проверка наличия аккаунта для Яндекс.Облака
     * @returns {boolean} Файл существует
     */
    var CheckYandexCloudAccount = () => {
        return fs.existsSync(Consts.pathYandexCloudAccount);
    }
    /**
     * Получить аккаунт для Яндекс.Облака
     * @param {(error: boolean, account: YandexCloudAccount) => void} callback Функция обратного вызова
     */
    var GetYandexCloudAccount = (callback) => {
        if ((typeof callback !== 'function') || !CheckYandexCloudAccount()) {
            Write.file.error('Отсутствует yandexCloudAccount');
            callback(true);
            return;
        }

        fs.readFile(Consts.pathYandexCloudAccount, (error, data) => {
            if (error) {
                Write.file.error(error.message, error.code);
                callback(true);
                return;
            }

            data = JSON.parse(data);
            if (data.backetName && data.serviceAccountKeyID && data.serviceAccountKey) {
                callback(false, data);
            }
            else {
                Write.file.error('Неверный формат yandexCloudAccount');
                callback(true);
            }
        });
    }

    var GetDateString = () => {
        // Формат - yyyymmdd по UTC
        let currentDate = new Date();
        return String(currentDate.getUTCFullYear()).padStart(4, '0') + 
            String(currentDate.getUTCMonth() + 1).padStart(2, '0') +
            String(currentDate.getUTCDate()).padStart(2, '0');
    }
    var GetDateStringWithTime = () => {
        // Формат - yyyymmddThhmmssZ по UTC
        let currentDate = new Date();
        return GetDateString() + 'T' +
            String(currentDate.getUTCHours()).padStart(2, '0') +
            String(currentDate.getUTCMinutes()).padStart(2, '0') +
            String(currentDate.getUTCSeconds()).padStart(2, '0') + 'Z';
    }

    /**
     * Сгенерировать заголовок Authorization
     * @param {YandexCloudAccount} yandexCloudAccount Данные аккаунта для Яндекс.Облака
     * @param {'GET' | 'PUT'} method Методы запроса
     * @param {string} path Путь к запрашиваемому ресурсу
     * @param {{[paramName: string]: string}} queryParams Параметры запроса
     * @param {{[headerName: string]: string}} headers Заголовки
     * @param {string} payloadHash Хэш данных
     * @param {string} time Время отправки запроса
     * @returns {string} Значение заголовка Authorization
     */
    var BuildAuthHeader = (yandexCloudAccount, method, path, queryParams, headers, payloadHash, time) => {
        let sortedQueryParams = SortMap(queryParams);
        for (let paramIndex = 0; paramIndex < sortedQueryParams.length; paramIndex++) {
            sortedQueryParams[paramIndex] = encodeURI(sortedQueryParams[paramIndex].name) + '=' + encodeURI(sortedQueryParams[paramIndex].value);
        }
        sortedQueryParams = sortedQueryParams.join('&');

        let sortedHeaders = SortMap(headers);
        let sortedHeadersStr = [];
        for (let headerIndex = 0; headerIndex < sortedHeaders.length; headerIndex++) {
            sortedHeadersStr.push(sortedHeaders[headerIndex].name.toLowerCase());
            sortedHeaders[headerIndex] = sortedHeaders[headerIndex].name.toLowerCase() + ':' + sortedHeaders[headerIndex].value.trim();
        }
        sortedHeaders = sortedHeaders.join('\n') + '\n';
        sortedHeadersStr = sortedHeadersStr.join(';');

        let canonicalRequest = method + '\n' +
            path + '\n' +
            sortedQueryParams + '\n' +
            sortedHeaders + '\n' +
            sortedHeadersStr + '\n' +
            payloadHash;
        let hashedCanonicalRequest = Crypt.sha256_changeEncode(canonicalRequest, 'utf8', 'hex');

        let date = time.substr(0, time.indexOf('T'));
        let stringToSign = 'AWS4-HMAC-SHA256\n' +
            time + '\n' +
            date + '/ru-central1/s3/aws4_request\n' +
            hashedCanonicalRequest;

        let signingKey = Crypt.changeEncode('AWS4' + yandexCloudAccount.serviceAccountKey, 'binary', 'utf8');
        signingKey = Crypt.hmacsha256_changeEncode(date, signingKey, 'utf8', 'binary');
        signingKey = Crypt.hmacsha256_changeEncode('ru-central1', signingKey, 'utf8', 'binary');
        signingKey = Crypt.hmacsha256_changeEncode('s3', signingKey, 'utf8', 'binary');
        signingKey = Crypt.hmacsha256_changeEncode('aws4_request', signingKey, 'utf8', 'binary');
        let signature = Crypt.hmacsha256_changeEncode(stringToSign, signingKey, 'utf8', 'hex');
        
        let authHeader = 'AWS4-HMAC-SHA256 ' + 
            'Credential=' + yandexCloudAccount.serviceAccountKeyID + '/' + date + '/ru-central1/s3/aws4_request,' +
            'SignedHeaders=' + sortedHeadersStr + ',' +
            'Signature=' + signature;
        return authHeader;
    }
    /**
     * Сортировать данные
     * @param {{[key: string]: string}} map Входящие данные
     * @returns {{name: string, value: string}[]} Отсортированные данные
     */
    var SortMap = (map) => {
        let sortedMap = [];
        for (let mapValue in map) {
            sortedMap.push({
                name: mapValue,
                value: map[mapValue]
            });
        }
        sortedMap.sort(function(firstParam, secondParam) {
            return firstParam.name.localeCompare(secondParam.name);
        });
        return sortedMap;
    }

    this.sendGetRequest = SendGetRequest;
    this.sendPutRequest = SendPutRequest;
}
module.exports = YandexCloudRequestBuilder;