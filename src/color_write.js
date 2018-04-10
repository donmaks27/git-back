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



// Вывод

/**
 * Вывод сообщения об ошибке на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteError (msg, code) {
    console.log( Bold(White(Red(GetErrorMsg()), true)) + Reset(ConcatMsg(msg, code), true) );
}
/**
 * Вывод сообщения об ошибке
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteError (msg, code) {
    
}

/**
 * Вывод предупреждения на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteWarning (msg, code) {
    console.log( Bold(White(Yellow(GetWarningMsg()), true)) + Reset(ConcatMsg(msg, code), true) );
}
/**
 * Вывод предупреждения
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteWarning (msg, code) {
    
}

/**
 * Вывод утвердительного сообщения на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteCorrect (msg, code) {
    console.log( Bold(White(Green(GetCorrectMsg()), true)) + Reset(ConcatMsg(msg, code), true) );
}
/**
 * Вывод утвердительного сообщения
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteCorrect (msg, code) {
    
}

/**
 * Вывод информации на консоль
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function ConsoleWriteInfo (msg, code) {
    console.log( Bold(White(GetInfoMsg())) + Reset(ConcatMsg(msg, code), true) );
}
/**
 * Вывод информации
 * @param {string} msg Сообщение
 * @param {number} [code] Код
 */
function WriteInfo (msg, code) {
    
}



// Префиксы для строк

/**
 * Получить префикс для строки с ошибкой
 * @returns {string} Префикс для строки с ошибкой
 */
function GetErrorMsg () {
    return '  [ERR] ';
}
/**
 * Получить префикс для строки с предупреждением
 * @returns {string} Префикс для строки с предупреждением
 */
function GetWarningMsg () {
    return '  [WRN] ';
}
/**
 * Получить префикс для строки с утвердительным сообщением
 * @returns {string} Префикс для строки с утвердительным сообщением
 */
function GetCorrectMsg () {
    return '  [OK]  ';
}
/**
 * Получить префикс для строки с информацией
 * @returns {string} Префикс для строки с информацией
 */
function GetInfoMsg () {
    return '  [INF] ';
}



// Преобразование перед выводом

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