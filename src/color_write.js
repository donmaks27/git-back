// Модуль для вывода сообщений

module.exports.red = Red;
module.exports.yellow = Yellow;
module.exports.green = Green;
module.exports.white = White;
module.exports.bold = Bold;
module.exports.reset = Reset;
module.exports.mod = Mod;

/**
 * Вывод на консоль
 * @type {{error: WriteFunction, warning: WriteFunction, correct: WriteFunction, info: WriteFunction}}
 */
module.exports.console = {
    /**
     * Вывод ошибки
     * @type {WriteFunction}
     */
    error: ConsoleWriteError,
    /**
     * Вывод предупреждения
     * @type {WriteFunction}
     */
    warning: ConsoleWriteWarning,
    /**
     * Вывод утвердительного сообщения
     * @type {WriteFunction}
     */
    correct: ConsoleWriteCorrect,
    /**
     * Вывод информации
     * @type {WriteFunction}
     */
    info: ConsoleWriteInfo
};
/**
 * Вывод в файл
 * @type {{error: WriteFunction, warning: WriteFunction, correct: WriteFunction, info: WriteFunction}}
 */
module.exports.file = {
    /**
     * Вывод ошибки
     * @type {WriteFunction}
     */
    error: WriteError,
    /**
     * Вывод предупреждения
     * @type {WriteFunction}
     */
    warning: WriteWarning,
    /**
     * Вывод утвердительного сообщения
     * @type {WriteFunction}
     */
    correct: WriteCorrect,
    /**
     * Вывод информации
     * @type {WriteFunction}
     */
    info: WriteInfo
};



var fs = require('fs');
var path = require('path');



// Вывод

/**
 * Вывод сообщения об ошибке на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteError (msg, code) {
    ConsoleWrite( GetErrorPrefix(), msg, code );
}
/**
 * Вывод сообщения об ошибке
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteError (msg, code) {
    Write(GetErrorPrefix(), msg, code);
}

/**
 * Вывод предупреждения на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteWarning (msg, code) {
    ConsoleWrite( GetWarningPrefix(), msg, code );
}
/**
 * Вывод предупреждения
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteWarning (msg, code) {
    Write(GetWarningPrefix(), msg, code);
}

/**
 * Вывод утвердительного сообщения на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteCorrect (msg, code) {
    ConsoleWrite( GetCorrectPrefix(), msg, code );
}
/**
 * Вывод утвердительного сообщения
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteCorrect (msg, code) {
    Write(GetCorrectPrefix(), msg, code);
}

/**
 * Вывод информации на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteInfo (msg, code) {
    ConsoleWrite( GetInfoPrefix(), msg, code );
}
/**
 * Вывод информации
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteInfo (msg, code) {
    Write(GetInfoPrefix(), msg, code);
}

/**
 * Вывод сообщения на консоль
 * @param {string} prefix Префикс строки
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWrite (prefix, msg, code) {
    console.log( prefix + ConcatMsg(msg, code) );
}
/**
 * Вывод сообщения в файл
 * @param {string} prefix Префикс строки
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function Write (prefix, msg, code) {
    let date = new Date();
    fs.appendFileSync( GetLogFilePath(date), prefix + GetTime(date) + ' ' + ConcatMsg(msg, code) + '\n', {
        encoding: 'utf-8'
    });
}



// Префиксы для строк

/**
 * Получить префикс для строки с ошибкой
 * @returns {string} Префикс для строки с ошибкой
 */
function GetErrorPrefix () {
    return '  [ERR] ';
}
/**
 * Получить префикс для строки с предупреждением
 * @returns {string} Префикс для строки с предупреждением
 */
function GetWarningPrefix () {
    return '  [WRN] ';
}
/**
 * Получить префикс для строки с утвердительным сообщением
 * @returns {string} Префикс для строки с утвердительным сообщением
 */
function GetCorrectPrefix () {
    return '  [OK]  ';
}
/**
 * Получить префикс для строки с информацией
 * @returns {string} Префикс для строки с информацией
 */
function GetInfoPrefix () {
    return '  [INF] ';
}



// Вспомогательные функции

/**
 * Объеденить код и собщение
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 * @returns {string} Выводимая строка
 */
function ConcatMsg (msg, code) {
    return GetCodeStr(code) + msg;
}
/**
 * Преобразовать код в строковое представление
 * @param {number} [code] Код
 * @returns {string} Выводимая строка
 */
function GetCodeStr (code) {
    return (code != null) ? 'Код: ' + code + '. ' : '';
}
/**
 * Получить имя лог файла
 * @param {Date} [date] Текущая дата 
 * @returns {string} Полный путь к файлу
 */
function GetLogFilePath (date) {
    if (!date)
        date = new Date();
    let month = date.getMonth()+1;
    let day = date.getDate();

    let nameLog = 'log-' + date.getFullYear() + 
                  '-' + (month < 10 ? '0' : '') + month + 
                  '-' + (day < 10 ? '0' : '') + day + '.txt';
    let pathLog = path.join(path.dirname(__dirname), 'log');
    if (!fs.existsSync(pathLog))
        fs.mkdirSync(pathLog);
    
    return path.join(pathLog, nameLog);
}
/**
 * Получить строку со временем
 * @param {Date} [date] Текущая дата 
 * @returns {string} Строка с текущим временем
 */
function GetTime (date) {
    if (!date)
        date = new Date();
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    let second = date.getSeconds().toString();
    let millisecond = date.getMilliseconds().toString();

    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;
    while (millisecond.length < 3) millisecond = '0' + millisecond;

    return hour + ':' + minute + ':' + second + '.' + millisecond;
}



// Функции для модификации строк для вывода на консоль

/**
 * Красный текст
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Red (str, end) {
    return Mod('\x1b[31m', str, end);
}
/**
 * Желтый текст
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Yellow (str, end) {
    return Mod('\x1b[33m', str, end);
}
/**
 * Зеленый текст
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Green (str, end) {
    return Mod('\x1b[32m', str, end);
}
/**
 * Белый текст
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function White (str, end) {
    return Mod('\x1b[37m', str, end);
}
/**
 * Жирный текст
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Bold (str, end) {
    return Mod('\x1b[1m', str, end);
}
/**
 * Сброс
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Reset (str, end) {
    return Mod('\x1b[0m', str, end);
}
/**
 * Модифицировать строку
 * @param {string} mode Модификатор строки
 * @param {string} str Строка
 * @param {boolean} [end] Добавить модификатор в конец
 * @returns {string} Модифицированная строка
 */
function Mod (mod, str, end) {
    return end ? str+mod : mod+str;
}



// Определения типов для JSDoc

/**
 * @typedef {(msg: string, code?: number) => void} WriteFunction Функция вывода
 */