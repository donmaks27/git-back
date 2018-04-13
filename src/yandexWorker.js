// Модуль для общения с Яндекс.Диском

/**
 * Идентификатор приложения
 * @typedef {{ID: string, secret: string}} AppID 
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
var YandexToken = require('./yandexToken');

/**
 * Конструктор
 * @param {consts} consts Константы
 */
function Yandex (consts) {
    var Token = new YandexToken(consts);
}
module.exports = Yandex;

