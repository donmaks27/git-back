// Модуль для общения с Яндекс.Диском

var fs = require('fs');
var path = require('path');
var https = require('https');
var url = require('url');

const Write = require('./color_write');
var Consts = require('./consts');
var YandexDiskToken = require('./yandexDiskToken');

/**
 * Конструктор
 * @param {Consts} Consts Константы
 * @param {YandexDiskToken} Token Модуль для работы с токенами
 */
function YandexDisk (Consts, Token) {

    /* РАБОТА С РЕПОЗИТОРИЯМИ */

    /**
     * Получить версию репозитория на сервере
     * @param {boolean} overrideFile Перезаписать файл
     * @param {(error: boolean) => void} callback 
     */
    var ReceiveServerRepoVersion = (overrideFile, callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        let path = Consts.pathReposServer + '/' + Consts.nameLocalProject + '/' + Consts.nameRepoVersionFile;
        GetReceiveFileURL(path, (error, href) => {
            if (error) {
                Write.file.error('Ошибка получения ссылки для получения .version файла');
                callback(true);
                return;
            }

            ReceiveFile(href, overrideFile ? Consts.pathLocalRepoVersionFile : Consts.pathLocalRepoVersionTempFile, callback);
        });
    }

    /**
     * Отправить версию репозитория на сервер
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var SendLocalRepoVersion = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        let path = Consts.pathReposServer + '/' + Consts.nameLocalProject + '/' + Consts.nameRepoVersionFile;
        GetSendFileURL(path, (error, href) => {
            if (error) {
                Write.file.error('Ошибка получения ссылки для отправки .version файла');
                callback(true);
                return;
            }

            SendFile(href, Consts.pathLocalRepoVersionFile, callback);
        });
    }

    /**
     * Отправить запакованную локальную копию репозитория на сервер
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var SendLocalRepoArchive = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        // Получить URL для отправки
        let path = Consts.pathReposServer + '/' + Consts.nameLocalProject + '/' + Consts.nameLocalRepoArchive;
        GetSendFileURL(path, (error, href) => {
            if (error) {
                Write.file.error('Ошибка получения ссылки для отправки файла');
                callback(true);
                return;
            }

            SendFile(href, Consts.pathLocalRepoArchive, callback);
        });
    }

    /**
     * Получить с сервера запакованный репозиторий
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var ReceiveServerRepoArchive = (callback) => {
        if (typeof callback !== 'function') {
            return;
        }

        // Получить ссылку для скачивания
        let path = Consts.pathReposServer + '/' + Consts.nameLocalProject + '/' + Consts.nameLocalRepoArchive;
        GetReceiveFileURL(path, (error, href) => {
            if (error) {
                Write.file.error('Ошибка получения ссылки для получения файла');
                callback(true);
                return;
            }

            ReceiveFile(href, Consts.pathLocalRepoArchive, callback);
        });
    }

    /**
     * Получить список всех репозиториев
     * @param {(error: boolean, list: Object.<string,string[]>) => void} callback Функция обратного вызова
     */
    var GetFullReposList = callback => {
        if (typeof callback === 'function') {
            // Получить список проектов
            GetProjectsList((error, projects) => {
                if (!error) {
                    let list = {};
                    let count = projects.length;
                    for (let i = 0; i < projects.length; i++) {
                        let project = projects[i];
                        // Получить список репозиториев проекта
                        GetProjectReposList(project, (error, repos) => {
                            if (!error) {
                                if (repos.length > 0)
                                    list[project] = repos;
                            }
                            else
                                Write.file.warning('Ошибка загрузки списка репозиториев для проекта ' + project);

                            count--;
                            if (count == 0)
                                callback(false, list);
                        });
                    }
                }
                else {
                    Write.file.error('Ошибка загрузки списка проектов');
                    callback(true);
                }
            });
        }
    }

    /**
     * Получить список проектов на сервере
     * @param {(error: boolean, projects: string[]) => void} callback Функция обратного вызова
     * @param {number} [offset] Смещение получаемого списка
     * @param {string[]} [list] Список уже полученных папок
     */
    var GetProjectsList = (callback, offset, list) => {
        if (typeof callback === 'function') {
            const PAGE_SIZE = 20;
            if (!offset) offset = 0;
            if (!list) list = [];

            Token.getToken((error, token) => {
                if (!error) {
                    let fields = [
                        '_embedded.items.name',
                        '_embedded.items.type',
                        '_embedded.total'
                    ];
                    let params = [
                        'path=' + Consts.pathReposServer,
                        'fields=' + fields.join(','),
                        'offset=' + offset,
                        'limit=' + PAGE_SIZE
                    ];
                    let url = '/v1/disk/resources?' + params.join('&');

                    let request = https.request({
                        method: 'GET',
                        host: 'cloud-api.yandex.net',
                        path: url,
                        headers: {
                            Authorization: 'OAuth ' + token
                        }
                    }, response => {
                        // Чтение тела ответа
                        response.setEncoding('utf-8');
                        let body = '';
                        response.on('data', function (chunk) {
                            body += chunk;
                        });
    
                        response.on('end', function () {
                            let json = JSON.parse(body);
                            if (response.statusCode == 200) {
                                let items = json._embedded.items;
                                for (let project = 0; project < items.length; project++)
                                    if (items[project].type === 'dir')
                                        list.push(items[project].name);
                                        
                                if (json._embedded.total <= offset+PAGE_SIZE) {
                                    Write.file.correct('Список проектов получен');
                                    callback(false, list);
                                }
                                else
                                    GetProjectsList(callback, offset+PAGE_SIZE, list);
                            }
                            else {
                                Write.file.error('Ошибка получения списка проектов. ' + json.message, response.statusCode);
                                callback(true);
                            }
                        });
                    });
    
                    request.on('error', error => {
                        Write.file.error(error.message);
                        callback(true);
                    });
    
                    request.end();
                }
                else {
                    Write.file.error('Ошибка получения токена');
                    callback(true);
                }
            });
        }
    }

    /**
     * Получить список репозиториев проекта
     * @param {string} project Проект
     * @param {(error: boolean, repos: string[]) => void} callback Функция обратного вызова
     * @param {number} [offset] Смещение получаемого списка
     * @param {string[]} [list] Список уже полученных файлов
     */
    var GetProjectReposList = (project, callback, offset, list) => {
        if (typeof callback === 'function') {
            const PAGE_SIZE = 20;
            if (!offset) offset = 0;
            if (!list) list = [];

            Token.getToken((error, token) => {
                if (!error) {
                    let fields = [
                        '_embedded.items.name',
                        '_embedded.items.type',
                        '_embedded.total'
                    ];
                    let params = [
                        'path=' + Consts.pathReposServer + '/' + project,
                        'fields=' + fields.join(','),
                        'offset=' + offset,
                        'limit=' + PAGE_SIZE
                    ];
                    let url = '/v1/disk/resources?' + params.join('&');

                    let request = https.request({
                        method: 'GET',
                        host: 'cloud-api.yandex.net',
                        path: url,
                        headers: {
                            Authorization: 'OAuth ' + token
                        }
                    }, response => {
                        // Чтение тела ответа
                        response.setEncoding('utf-8');
                        let body = '';
                        response.on('data', function (chunk) {
                            body += chunk;
                        });

                        response.on('end', function () {
                            let json = JSON.parse(body);
                            if (response.statusCode == 200) {
                                let items = json._embedded.items;
                                for (let repo = 0; repo < items.length; repo++)
                                    if (items[repo].type === 'file') {
                                        let name = items[repo].name;
                                        // Проверка на сжатый архив
                                        if (path.extname(name) != '.gz')
                                            continue;

                                        name = path.basename(name, '.gz');
                                        // Проверка на архив
                                        if (path.extname(name) != '.tar')
                                            continue;

                                        name = path.basename(name, '.tar');
                                        // Проверка на репозиторий
                                        if (path.extname(name) != '.git')
                                            continue;
                                        
                                        name = path.basename(name, '.git');
                                        // Проверка на существование имени
                                        if (name.length > 0)
                                            list.push(name);
                                    }
                                        
                                if (json._embedded.total <= offset+PAGE_SIZE) {
                                    Write.file.correct('Список репозиториев проекта ' + project + ' получен');
                                    callback(false, list);
                                }
                                else
                                    GetProjectReposList(project, callback, offset+PAGE_SIZE, list);
                            }
                            else {
                                Write.file.error('Ошибка получения списка репозиториев проекта ' + project + '. ' + json.message, response.statusCode);
                                callback(true);
                            }
                        });
                    });

                    request.on('error', error => {
                        Write.file.error(error.message);
                        callback(true);
                    });

                    request.end();
                }
                else {
                    Write.file.error('Ошибка получения токена');
                    callback(true);
                }
            });
        }
    }

    /* ПОЛУЧЕНИЕ ССЫЛОК */

    /**
     * Получить ссылку для отправки данных
     * @param {string} filePath Путь к файлу на сервере
     * @param {(error: boolean, href: string) => void} callback Функция обратного вызова
     */
    var GetSendFileURL = (filePath, callback) => {
        Write.file.info('Получение ссылки для отправки в ' + filePath + '...');

        if (typeof callback !== 'function') {
            return;
        }

        // Создать на сервере папку с проектом
        CreateProjectServerDirectory((error, token) => {
            if (!error) {
                let params = [
                    'path=' + filePath,
                    'overwrite=true'
                ];
                let url = '/v1/disk/resources/upload?' + params.join('&');

                let request = https.request({
                    method: 'GET',
                    host: 'cloud-api.yandex.net',
                    path: url,
                    headers: {
                        Authorization: 'OAuth ' + token
                    }
                }, response => {
                    // Чтение тела ответа
                    response.setEncoding('utf-8');
                    let body = '';
                    response.on('data', function (chunk) {
                        body += chunk;
                    });

                    response.on('end', function () {
                        let json = JSON.parse(body);
                        if (response.statusCode == 200) {
                            Write.file.info('Ссылка для отправки получена');
                            callback(false, json.href);
                        }
                        else {
                            Write.file.error('Ошибка получения ссылки для отправки. ' + json.message, response.statusCode);
                            callback(true);
                        }
                    });
                });

                request.on('error', function (error) {
                    Write.file.error(error.message);
                    callback(true);
                });

                request.end();
            }
            else {
                Write.file.error('Ошибка создания папки проекта на сервере');
                callback(true);
            }
        });
    }

    /**
     * Отправить файл на сервер
     * @param {string} href ССфлка для отправки файла
     * @param {string} localFilePath Путь к отправляемому файлу
     * @param {(error: boolean) => void} callback 
     */
    var SendFile = (href, localFilePath, callback) => {
        Write.file.info('Отправка файла...');

        if (typeof callback !== 'function') {
            return;
        }

        let urlObject = url.parse(href);
        let request = https.request({
            method: 'PUT',
            hostname: urlObject.hostname,
            port: urlObject.port,
            path: urlObject.path
        }, response => {
            // Файл отправлен
            if ((response.statusCode == 201) || (response.statusCode == 202)) {
                Write.file.correct('Файл  отправлен', response.statusCode);
                callback(false);
            }
            else {
                Write.file.error('Ошибка отправки файла', response.statusCode);
                callback(true);
            }
        });

        request.on('error', function (error) {
            Write.file.error(error.message);
            callback(true);
        });

        // Добавление архива в запрос
        fs.createReadStream(localFilePath).pipe(request).on('finish', () => {
            request.end();
        });
    }

    /**
     * Получить ссылку для получения данных
     * @param {string} filePath Путь к получаемому файлу
     * @param {(error: boolean, href: string) => void} callback Функция обратного вызова
     */
    var GetReceiveFileURL = (filePath, callback) => {
        Write.file.info('Получение ссылки для получения файла ' + filePath + '...');

        if (typeof callback !== 'function') {
            return;
        }
        
        // Получить токет для авторизации
        Token.getToken((error, token) => {
            if (!error) {
                let params = [
                    'path=' + filePath
                ];
                let url = '/v1/disk/resources/download?' + params.join('&');

                let request = https.request({
                    method: 'GET',
                    host: 'cloud-api.yandex.net',
                    path: url,
                    headers: {
                        Authorization: 'OAuth ' + token
                    }
                }, response => {
                    // Чтение тела ответа
                    response.setEncoding('utf-8');
                    let body = '';
                    response.on('data', function (chunk) {
                        body += chunk;
                    });

                    response.on('end', function () {
                        let json = JSON.parse(body);
                        if (response.statusCode == 200) {
                            Write.file.info('Ссылка для скачивания получена');
                            callback(false, json.href);
                        }
                        else {
                            Write.file.error('Ошибка получения ссылки для скачивания. ' + json.message, response.statusCode);
                            callback(true);
                        }
                    });
                });

                request.on('error', function (error) {
                    Write.file.error(error.message);
                    callback(true);
                });

                request.end();
            }
            else {
                Write.file.error('Ошибка получения токена');
                callback(true);
            }
        });
    }

    /**
     * 
     * @param {string} href Ссылка для получения файла
     * @param {string} resultPath Путь для скаченного файла
     * @param {(error: boolean)} callback 
     */
    var ReceiveFile = (href, resultPath, callback) => {
        Write.file.info('Получение файла...');

        let sendRequest = (checkCode302, href) => {
            let urlObject = url.parse(href);
            let request = https.request({
                method: 'GET',
                hostname: urlObject.hostname,
                port: urlObject.port,
                path: urlObject.path
            }, response => {
                if (response.statusCode == 200) {
                    // Извлечение файла
                    response.pipe(fs.createWriteStream(resultPath)).on('finish', () => {
                        Write.file.correct('Файл получен', response.statusCode);
                        callback(false);
                    });
                }
                else if (checkCode302 && (response.statusCode == 302)) {
                    Write.file.info('Файл доступен по другому пути');
                    sendRequest(false, response.headers.location);
                }
                else {
                    Write.file.error('Ошибка загрузки файла', response.statusCode);
                    callback(true);
                }
            });

            request.on('error', function (error) {
                Write.file.error(error.message);
                callback(true);
            });

            request.end();
        };
        sendRequest(true, href);
    }

    /* УПРАВЛЕНИЕ ДИСКОМ */

    /**
     * Создать на сервере папку с проектом
     * @param {(error: boolean, token: string)} callback 
     */
    var CreateProjectServerDirectory = callback => {
        if (typeof callback === 'function') {
            // Получить токет для авторизации
            Token.getToken((error, token) => {
                if (!error) {
                    let params = [
                        'path=' + Consts.pathReposServer + '/' + Consts.nameLocalProject
                    ];
                    let url = '/v1/disk/resources?' + params.join('&');

                    let request = https.request({
                        method: 'PUT',
                        host: 'cloud-api.yandex.net',
                        path: url,
                        headers: {
                            Authorization: 'OAuth ' + token
                        }
                    }, response => {
                        switch (response.statusCode) {
                            case 201:
                                Write.file.info('Папка проекта на сервере создана');
                                callback(false, token);
                                break;
                            case 409:
                                callback(false, token);
                                break;
                            default:
                                Write.file.error('Ошибка создания папки проекта', response.statusCode);
                                callback(true);
                                break;
                        }
                    });

                    request.on('error', function (error) {
                        Write.file.error(error.message);
                        callback(true);
                    });
    
                    request.end();
                }
                else {
                    Write.file.error('Ошибка получения токена');
                    callback(true);
                }
            });
        }
    }

    this.receiveServerRepoVersion = ReceiveServerRepoVersion;
    this.sendLocalRepoVersion = SendLocalRepoVersion;

    this.sendLocalRepoArchive = SendLocalRepoArchive;
    this.receiveServerRepoArchive = ReceiveServerRepoArchive;
    this.getFullReposList = GetFullReposList;
}
module.exports = YandexDisk;