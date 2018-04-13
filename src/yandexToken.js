// Модуль для работы с токенами

var fs = require('fs');
var path = require('path');
var https = require('https');
var opn = require('opn');
var url = require('url');

const Write = require('./color_write');
var consts = require('./consts');

/**
 * Конструктор
 * @param {consts} consts Константы
 */
function YandexToken (consts) {
    /**
     * Проверка наличия токена
     * @returns {boolean} Токен существует
     */
    this.checkToken = () => {
        createCredentialFolder();
        return fs.existsSync( path.join(consts.pathCredentials, 'token') );
    }

    /**
     * Получить токен приложения
     * @param {(error: boolean, token: Token) => void} callback Функция обратного вызова
     */
    this.getToken = callback => {
        if ((typeof callback === 'function') && this.checkToken())
            fs.readFile( path.join(consts.pathCredentials, 'token'), (error, data) => {
                if (error) {
                    Write.error(error.message, error.code);
                    callback(true);
                }
                else {
                    data = JSON.parse(data);
                    if (data.token && data.refresh_token && data.expire && data.create_time) {
                        let time = new Date().getTime() - data.expire;
                        if (time >= data.create_time - 60*30) {
                            Write.console.error('Токен просрочен, получение нового...');
                            this.sendCodeRequest();
                        }
                        else if (time >= data.create_time + 60*60*24*14) {
                            Write.console.warning('Срок жизни токена скоро истечет, получение нового...');
                            sendRefreshTokenRequest(data, callback);
                        }
                        else
                            callback(false, data);
                    }
                    else {
                        Write.error('Неверный формат токена');
                        callback(true);
                    }
                }
            });
    }

    /**
     * Проверка данных приложения
     */
    this.checkAppID = () => {
        createCredentialFolder();
        return fs.existsSync( path.join(consts.pathCredentials, 'appID') );
    }

    /**
     * Получить идентификатор приложения
     * @param {(error: string, appID: AppID) => void} callback Функция обратного вызова
     */
    this.getAppID = callback => {
        if ((typeof callback === 'function') && this.checkAppID())
            fs.readFile( path.join(consts.pathCredentials, 'appID'), (error, data) => {
                if (error) {
                    Write.error(error.message, error.code);
                    callback(true);
                }
                else {
                    data = JSON.parse(data);
                    if (data.id && data.secret)
                        callback(false, data);
                    else {
                        Write.error('Неверный формат appID');
                        callback(true);
                    }
                }
            });
    }

    /**
     * Отправить запрос на получение кода для отправки запроса на получение токена
     */
    this.sendCodeRequest = () => {
        this.getAppID((error, appID) => {
            if (!error) {
                let params = [
                    'response_type=code',
                    'client_id=' + appID.id,
                    'force_confirm=yes'
                ];
                opn('https://oauth.yandex.ru/authorize?' + params.join('&'), {
                    wait: false
                });
            }
            else
                Write.console.error('Ошибка чтения AppID');
        });
    }

    /**
     * Вытащить токен из URL
     * @param {string} urlResponse Поученный URL
     */
    this.getCodeFromUrl = (urlResponse) => {
        let urlObject = url.parse(urlResponse);
        if ((urlObject.protocol == 'git-back:') && (urlObject.hostname == 'token') && urlObject.query) {
            urlObject = urlObject.query.split('&');
            
            let params = {};
            for (let i = 0; i < urlObject.length; i++) {
                let temp = urlObject[i].split('=');
                params[temp[0]] = temp[1];
            }

            if (params.error)
                Write.console.error(params.error_description, params.error);
            else 
                sendTokenRequest(params.code);
        }
        else
            Write.console.error('Неверный формат URL');
    }

    /* ЛОКАЛЬНЫЕ ФУНКЦИИ */

    /**
     * Создать папку с данными авторизации
     */
    var createCredentialFolder = () => {
        if (fs.existsSync(consts.pathCredentials))
            fs.mkdirSync(consts.pathCredentials);
    }

    /**
     * Отправить запрос на получение токена
     * @param {string} code Полученный код
     */
    var sendTokenRequest = function (code) {
        this.getAppID((error, appID) => {
            if (!error) {
                let params = [
                    'grant_type=authorization_code',
                    'code=' + code
                ];
                params.join('&');

                let request = https.request({
                    method: 'POST',
                    host: 'oauth.yandex.ru',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(params),
                        'Authorization': 'Basic ' + Buffer.from(appID.id + ':' + appID.secret).toString('base64')
                    }
                }, response => {
                    // Чтение тела ответа
                    response.setEncoding('utf-8');
                    var body = '';
                    response.on('data', function (chunk) {
                        body += chunk;
                    });

                    response.on('end', () => {
                        let json = JSON.parse(body);
                        if (response.statusCode == 200) {
                            let obj = {
                                token: json.access_token,
                                refresh_token: json.refresh_token,
                                expire: json.expires_in,
                                create_time: new Date().getTime()
                            }
                            fs.writeFile( path.join(consts.pathCredentials, 'token'), JSON.stringify(obj), error => {
                                if (!error)
                                    Write.console.correct('Токен получен');
                                else
                                    Write.console.error('Не удалось записать токен. ' + error.message, error.code);
                            });
                        }
                        else
                            Write.console.error(json.error_description, json.error);
                    });
                });

                request.on('error', function (error) {
                    Write.console.error(error.message);
                });

                request.write(params);
                request.end();
            }
            else
                Write.console.error('Ошибка чтения appID');
        });
    }

    /**
     * Отправить запрос на обновление токена
     * @param {Token} token Текущий токен
     * @param {(error: boolean, token: Token) => void} callback Функция обратного вызова
     */
    var sendRefreshTokenRequest = (token, callback) => {
        this.getAppID((error, appID) => {
            if (!error) {
                let params = [
                    'grant_type=refresh_token',
                    'refresh_token=' + token.refresh_token
                ];
                params.join('&');

                let request = https.request({
                    method: 'POST',
                    host: 'oauth.yandex.ru',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(params),
                        'Authorization': 'Basic ' + Buffer.from(appID.id + ':' + appID.secret).toString('base64')
                    }
                }, response => {
                    // Чтение тела ответа
                    response.setEncoding('utf-8');
                    var body = '';
                    response.on('data', function (chunk) {
                        body += chunk;
                    });

                    response.on('end', () => {
                        let json = JSON.parse(body);
                        if (response.statusCode == 200) {
                            let obj = {
                                token: json.access_token,
                                refresh_token: json.refresh_token,
                                expire: json.expires_in,
                                create_time: new Date().getTime()
                            }
                            fs.writeFile( path.join(consts.pathCredentials, 'token'), JSON.stringify(obj), error => {
                                if (!error) {
                                    Write.console.correct('Токен получен');
                                    callback(false, obj);
                                }
                                else {
                                    Write.console.error('Не удалось записать токен. ' + error.message, error.code);
                                    callback(true);
                                }
                            });
                        }
                        else {
                            Write.console.error(json.error_description, json.error);
                            callback(true);
                        }
                    });
                });

                request.on('error', function (error) {
                    Write.console.error(error.message);
                    callback(true);
                });

                request.write(params);
                request.end();
            }
            else {
                Write.console.error('Ошибка чтения AppID');
                callback(true);
            }
        });
    }
}
module.exports = YandexToken;