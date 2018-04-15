// Модуль для общения с Яндекс.Диском

var fs = require('fs');
var path = require('path');
var https = require('https');
var url = require('url');

const Write = require('./color_write');
var Consts = require('./consts');
var RepoWorker = require('./repoWorker');
var YandexToken = require('./yandexToken');

/**
 * Конструктор
 * @param {Consts} Consts Константы
 * @param {RepoWorker} Repo Модуль для работы с репозиториями
 * @param {YandexToken} Token Модуль для работы с токенами
 */
function Yandex (Consts, Repo, Token) {
    /**
     * Отправить запакованную локальную копию репозитория на сервер
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    this.sendLocalRepoArchive = callback => {
        if (typeof callback === 'function') {
            if (Repo.checkLocalRepoArchive()) {
                // Получить URL для отправки
                getSendURL((error, href) => {
                    if (!error) {
                        let urlObject = url.parse(href);
                        let request = https.request({
                            method: 'PUT',
                            hostname: urlObject.hostname,
                            port: urlObject.port,
                            path: urlObject.path
                        }, response => {
                            // Файл отправлен
                            if ((response.statusCode == 201) || (response.statusCode == 202))
                                callback(false);
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
                        fs.createReadStream(Consts.pathLocalRepoArchive).pipe(request).on('finish', () => {
                            request.end();
                        });
                    }
                    else {
                        Write.file.error('Ошибка получения ссылки для отправки файла');
                        callback(true);
                    }
                });
            }
            else {
                Write.file.error('Не найден архив с локальной копией репозитория');
                callback(true);
            }
        }
    }

    /**
     * Получить ссылку для загрузки данных
     * @param {(error: boolean, href: string) => void} callback Функция обратного вызова
     */
    var getSendURL = callback => {
        if (typeof callback === 'function') {
            // Создать на сервере папку с проектом
            createProjectServerDirectory((error, token) => {
                if (!error) {
                    let params = [
                        'path=' + Consts.pathReposServer + '/' + Consts.nameLocalProject + '/' + Consts.nameLocalRepoArchive,
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
                            if (response.statusCode == 200)
                                callback(false, json.href);
                            else {
                                Write.file.error(json.message, response.statusCode);
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
    }

    /**
     * Создать на сервере папку с проектом
     * @param {(error: boolean, token: string)} callback 
     */
    var createProjectServerDirectory = callback => {
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
}
module.exports = Yandex;