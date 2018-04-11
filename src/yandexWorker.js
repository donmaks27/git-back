// Модуль для общения с Яндекс.Диском

var fs = require('fs');
var path = require('path');

var consts = require('./consts');

/**
 * Конструктор
 * @param {consts} consts Константы
 */
function Yandex (consts) {
    /* ОТПРАВКА И ПОЛУЧЕНИЕ ДАННЫХ */

    /* РАБОТА С ТОКЕНАМИ */

    /**
     * Создать папку с данными авторизации
     */
    this.createCredentialFolder = () => {
        if (fs.existsSync(consts.pathCredentials))
            fs.mkdirSync(consts.pathCredentials);
    }

    /**
     * Проверка наличия токена
     * @returns {boolean} Токен существует
     */
    this.checkToken = () => {
        this.createCredentialFolder();
        return fs.existsSync( path.join(consts.pathCredentials, 'token') );
    }

    
}
module.exports = Yandex;

