// Модуль для работы с токенами

/**
 * Идентификатор приложения
 * @typedef {{id: string, secret: string}} AppID 
 */
/**
 * Данные токена
 * @typedef {{token: string, refresh_token: string, expire: number, create_time: Date}} Token 
 */

var fs = require('fs');
var path = require('path');
var https = require('https');
var opn = require('opn');
var url = require('url');

const Write = require('./color_write');
var consts = require('./consts');

/**
 * Конструктор
 * @param {consts} Consts Константы
 */
function YandexToken (Consts) {

    /* ПРОВЕРКИ */

    /**
     * Проверка наличия токена
     * @returns {boolean} Токен существует
     */
    var CheckToken = () => {
        return fs.existsSync(Consts.pathToken);
    }

    /**
     * Проверка идентификатора приложения
     * @returns {boolean} Идентификатор существует
     */
    var CheckAppID = () => {
        return fs.existsSync(Consts.pathAppID);
    }

    /* ПОЛУЧЕНИЕ ДАННЫХ ИЗ ФАЙЛОВ */

    /**
     * Получить токен приложения
     * @param {(error: boolean, token: string) => void} callback Функция обратного вызова
     */
    var GetToken = callback => {
        if (!CheckToken()) {
            Write.file.error('Отсутствует токен приложения, получение токена...');
            SendCodeRequest();
            if (typeof callback === 'function')
                callback(true);
        }
        else {
            fs.readFile(Consts.pathToken, (error, data) => {
                if (!error) {
                    data = JSON.parse(data);
                    if (data.token && data.refresh_token && data.expire && data.create_time) {
                        let time = new Date().getTime() - data.expire;
                        if (time >= data.create_time - 60*30) {
                            Write.file.error('Токен просрочен, получение нового...');
                            SendCodeRequest();
                            if (typeof callback === 'function')
                                callback(true);
                        }
                        else if (time >= data.create_time + 60*60*24*7) {
                            Write.file.warning('Срок жизни токена скоро истечет, получение нового...');
                            SendRefreshTokenRequest(data, callback);
                        }
                        else if (typeof callback === 'function')
                            callback(false, data.token);
                    }
                }
                else {
                    Write.file.error(error.message, error.code);
                    if (typeof callback === 'function')
                        callback(true);
                }
            });
        }
    }

    /**
     * Получить идентификатор приложения
     * @param {(error: boolean, appID: AppID) => void} callback Функция обратного вызова
     */
    var GetAppID = callback => {
        if ((typeof callback === 'function') && CheckAppID()) {
            fs.readFile(Consts.pathAppID, (error, data) => {
                if (!error) {
                    data = JSON.parse(data);
                    if (data.id && data.secret)
                        callback(false, data);
                    else {
                        Write.file.error('Неверный формат appID');
                        callback(true);
                    }
                }
                else {
                    Write.file.error(error.message, error.code);
                    callback(true);
                }
            });
        }
        else {
            Write.file.error('Отсутствует appID');
            callback(true);
        }
    }

    /* ЗАПРОСЫ */

    /**
     * Отправить запрос на получение кода для отправки запроса на получение токена
     */
    var SendCodeRequest = () => {
        GetAppID((error, appID) => {
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
                Write.file.error('Ошибка чтения appID');
        });
    }

    /**
     * Вытащить код из URL
     * @param {string} urlResponse Полученный URL
     */
    var GetCodeFromUrl = (urlResponse) => {
        let urlObject = url.parse(urlResponse);
        if ((urlObject.protocol == 'git-back:') && (urlObject.hostname == 'token') && urlObject.query) {
            urlObject = urlObject.query.split('&');

            let params = {};
            for (let i = 0; i < urlObject.length; i++) {
                let temp = urlObject[i].split('=');
                params[temp[0]] = temp[1];
            }

            if (params.error)
                Write.file.error(params.error_description, params.error);
            else 
                SendTokenRequest(params.code);
        }
        else
            Write.file.error('Неверный формат URL');
    }

    /**
     * Отправить запрос на получение токена
     * @param {string} code Полученный код
     */
    var SendTokenRequest = function (code) {
        GetAppID((error, appID) => {
            if (!error) {
                let params = [
                    'grant_type=authorization_code',
                    'code=' + code
                ];
                params = params.join('&');
                
                let request = https.request({
                    method: 'POST',
                    host: 'oauth.yandex.ru',
                    path: '/token',
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
                        Write.file.correct(body);
                        let json = JSON.parse(body);
                        if (response.statusCode == 200) {
                            let obj = {
                                token: json.access_token,
                                refresh_token: json.refresh_token,
                                expire: json.expires_in,
                                create_time: new Date().getTime()
                            }
                            fs.writeFile(Consts.pathToken, JSON.stringify(obj), error => {
                                if (!error)
                                    Write.file.correct('Токен получен');
                                else
                                    Write.file.error(error.message, error.code);
                            });
                        }
                        else
                            Write.file.error(json.error_description, json.error);
                    });
                });
                
                request.on('error', function (error) {
                    Write.file.error("Request error. " + error.message);
                });
                
                request.end(params);
            }
            else 
                Write.file.error('Ошибка чтения appID');
        });
    }

    /**
     * Отправить запрос на обновление токена
     * @param {Token} token Текущий токен
     * @param {(error: boolean, token: Token) => void} callback Функция обратного вызова
     */
    var SendRefreshTokenRequest = (token, callback) => {
        GetAppID((error, appID) => {
            if (!error) {
                let params = [
                    'grant_type=refresh_token',
                    'refresh_token=' + token.refresh_token
                ];
                params = params.join('&');

                let request = https.request({
                    method: 'POST',
                    host: 'oauth.yandex.ru',
                    path: '/token',
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
                            fs.writeFile(Consts.pathToken, JSON.stringify(obj), error => {
                                if (!error) {
                                    Write.file.correct('Токен получен');
                                    if (typeof callback === 'function')
                                        callback(false, obj);
                                }
                                else {
                                    Write.file.error(error.message, error.code);
                                    if (typeof callback === 'function')
                                        callback(true);
                                }
                            });
                        }
                        else {
                            Write.file.error(json.error_description, json.error);
                            if (typeof callback === 'function')
                                callback(true);
                        }
                    });
                });

                request.on('error', function (error) {
                    Write.file.error(error.message);
                    if (typeof callback === 'function')
                        callback(true);
                });

                request.end(params);
            }
            else {
                Write.file.error('Ошибка чтения AppID');
                if (typeof callback === 'function')
                    callback(true);
            }
        });
    }

    this.getToken = GetToken;
    this.getCodeFromUrl = GetCodeFromUrl;
}
module.exports = YandexToken;