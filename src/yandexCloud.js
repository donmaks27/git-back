// Модуль для общения с Яндекс.Облаком

var http = require('http');
var fs = require('fs');
var path = require('path');
var xml = require('xml2js');

const Write = require('./color_write');
var Consts = require('./consts');
var YandexCloudRequestBuilder = require('./yandexCloudRequestBuilder');

/**
 * Конструктор
 * @param {Consts} Consts Константы
 * @param {YandexCloudRequestBuilder} RequestBuilder Модуль для отправки запросов
 */
function YandexCloud (Consts, RequestBuilder) {

    /**
     * Отправить запакованную локальную копию репозитория на сервер
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var SendLocalRepoArchive = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        fs.readFile(Consts.pathLocalRepoArchive, {
            encoding: 'binary'
        }, (error, data) => {
            if (error) {
                Write.file.error(error.message, error.code);
                callback(true);
                return;
            }

            let path = '/' + Consts.nameLocalProject + '/' + Consts.nameLocalRepoArchive;
            RequestBuilder.sendPutRequest(path, {}, data, (error, response) => {
                if (error) {
                    Write.file.error('Ошибка отправки файла');
                    callback(false);
                    return;
                }

                if (!IsResponseCodeSuccess(response)) {
                    Write.file.error('Ошибка отправки файла', response.statusCode);
                    callback(true);
                }
                else {
                    Write.file.correct('Файл отправлен', response.statusCode);
                    callback(false);
                }
            });
        });
    }

    /**
     * Отправить запакованную локальную копию репозитория на сервер
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var ReceiveServerRepoArchive = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }
        
        let path = '/' + Consts.nameLocalProject + '/' + Consts.nameLocalRepoArchive;
        RequestBuilder.sendGetRequest(path, {}, (error, response, data) => {
            if (error) {
                Write.file.error('Ошибка получения файла');
                callback(true);
                return;
            }

            if (!IsResponseCodeSuccess(response)) {
                xml.parseString(data, (error, parsedData) => {
                    if (error) {
                        Write.file.error('Некорректный формат ответа. ' + error.message);
                        callback(true);
                        return;
                    }

                    Write.file.error('Ошибка получения файла. ' + parsedData.Error.Message[0], response.statusCode);
                    callback(true);
                });
                return;
            }

            // Извлечение файла
            response.pipe(fs.createWriteStream(Consts.pathLocalRepoArchive)).on('finish', () => {
                Write.file.correct('Файл получен', response.statusCode);
                callback(false);
            });
        });
    }

    /**
     * Получить список всех репозиториев
     * @param {(error: boolean, result: {[projectName: string]: string[]}) => void} callback Функция обратного вызова
     */
    var GetFullReposList = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        GetFullObjectsList((error, objectsList) => {
            if (error) {
                Write.file.error('Ошибка загрузки списка репозиториев');
                callback(true);
                return;
            }

            /**
             * @type {{[projectName: string]: string[]}}
             */
            let result = {};
            for (let objectIndex = 0; objectIndex < objectsList.length; objectIndex++) {
                let currentObject = objectsList[objectIndex];
                if (!currentObject.isFolder && (currentObject.name.match('^[^/]+/[^/]+\.git\.tar\.gz$') !== null)) {
                    let nameParts = currentObject.name.split('/');
                    result[nameParts[0]] = path.basename(nameParts[1], '.git.tar.gz');
                }
            }
            callback(false, result);
        });
    }
    /**
     * Получить список проектов на сервере
     * @param {(error: boolean, objects: {isFolder: boolean, name: string}[]) => void} callback Функция обратного вызова
     */
    var GetFullObjectsList = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        let resultList = [];
        /**
         * @param {boolean} error 
         * @param {{objects: {isFolder: boolean, name: string}[], isTrancated: boolean, nextMarker: string}} result 
         */
        let getObjectsListCallback = (error, result) => {
            if (error) {
                Write.file.error('Ошибка получения списка объектов');
                callback(true);
                return;
            }

            for (let objectIndex = 0; objectIndex < result.objects.length; objectIndex++) {
                resultList.push(result.objects[objectIndex]);
            }
            if (result.isTrancated) {
                GetObjectsList(result.nextMarker, getObjectsListCallback);
            }
            else {
                Write.file.correct('Список объектов загружен');
                callback(false, resultList);
            }
        };
        GetObjectsList('', getObjectsListCallback);
    }
    /**
     * Получить список проектов на сервере
     * @param {string} lastKey Имя предшествующего списку маркера
     * @param {(error: boolean, result: {objects: {isFolder: boolean, name: string}[], isTrancated: boolean, nextMarker: string}) => void} callback Функция обратного вызова
     */
    var GetObjectsList = (lastKey, callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        let queryParams = {};
        if (lastKey && (lastKey !== '')) {
            queryParams['marker'] = lastKey;
        }
        RequestBuilder.sendGetRequest('', queryParams, (error, response, data) => {
            if (error) {
                Write.file.error('Ошибка получения списка объектов после ключа \'' + lastKey + '\'');
                callback(true);
                return;
            }

            let parsedData = xml.parseString(data, (error, parsedData) => {
                if (error) {
                    Write.file.error('Некорректный формат ответа. ' + error.message);
                    callback(true);
                    return;
                }

                if (!IsResponseCodeSuccess(response)) {
                    Write.file.error('Ошибка получения списка объектов после ключа \'' + lastKey + '\'. ' + parsedData.Error.Message[0], response.statusCode);
                    callback(true);
                    return;
                }

                if (!parsedData.ListBucketResult) {
                    Write.file.error('Некорректный формат ответа, отсутсвует ключ ListBucketResult. ' + data);
                    callback(true);
                    return;
                }
                parsedData = parsedData.ListBucketResult;
                Write.file.correct('Часть списка объектов загружена', response.statusCode);
    
                let result = {
                    objects: []
                };
                result.isTrancated = parsedData.IsTruncated[0] === 'true';
                result.nextMarker = result.isTrancated ? parsedData.NextMarker[0] : '';
                for (let parsedDataContentIndex = 0; parsedDataContentIndex < parsedData.Contents.length; parsedDataContentIndex++) {
                    let objectName = parsedData.Contents[parsedDataContentIndex].Key[0];
                    let isFolder = objectName.endsWith('/');
                    result.objects.push({
                        isFolder: isFolder,
                        name: objectName
                    });
                }
    
                callback(false, result);
            });
        });
    }

    /**
     * Проверить код ответа
     * @param {http.IncomingMessage} response Ответ на запрос
     */
    var IsResponseCodeSuccess = (response) => {
        return response && (Math.floor(response.statusCode / 100) == 2);
    }

    this.sendLocalRepoArchive = SendLocalRepoArchive;
    this.receiveServerRepoArchive = ReceiveServerRepoArchive;
    this.getFullReposList = GetFullReposList;
}
module.exports = YandexCloud;