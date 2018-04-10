// Модуль для работы с репозиториями

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var tar = require('tar');

const Write = require('./color_write');
var consts = require('./consts');

/**
 * Конструктор
 * @param {consts} consts Константы
 */
function Repo (consts) {

    /* ПРОВЕРКИ */

    /**
     * Проверка на существования репозитория в текущей папке
     * @returns {boolean} Является ли текущая директория git репозиторием
     */
    this.checkCurrentRepo = () => {
        if ( !fs.existsSync(path.join(consts.pathCurrent, '.git')) ) {
            Write.console.error('Данная директория не содержит git репозитория');
            return false;
        }
        else
            return true;
    }
    /**
     * Проверка на существование локальной копии репозитория
     * @returns {boolean} Создана ли локальная копия репозитория
     */
    this.checkLocalRepo = () => {
        return fs.existsSync(consts.pathLocalRepo);
    }
    /**
     * Проверка на существование архива локальной копии репозитория
     * @returns {boolean} Создан ли архив локальной копии репозитория
     */
    this.checkLocalRepoArchive = () => {
        return fs.existsSync(consts.pathLocalRepoArchive);
    }

    /* GIT комманды */

    /**
     * Клонирование текущего репозитория в локальную копию
     */
    this.cloneCurrentToLocal = () => {
        // Если локальной копии репозитория нет
        if (!this.checkLocalRepo()) {
            // Если не создана папка с локальным проектом
            if (!fs.existsSync(consts.pathLocalProject)) {
                fs.mkdirSync(consts.pathLocalProject);
                Write.console.info('Создана папка для проекта');
            }
            // Клонирование голого репозитория
            child_process.spawnSync('git', ['clone', '--bare', consts.pathCurrent], {
                cwd: consts.pathLocalProject,
                stdio: 'inherit' // Вывод в консоль
            });
            // Изменение источника
            this.changeCurrentRepoServer();
        }
    }
    /**
     * Смена источника репозитория
     */
    this.changeCurrentRepoServer = () => {
        // Если локальная копия репозитория есть
        if (this.checkLocalRepo())
            // Смена источника
            child_process.spawnSync('git', ['remote', 'set-url', 'origin', consts.pathLocalRepo], {
                cwd: consts.pathCurrent,
                stdio: 'inherit' // Вывод в консоль
            });
    }
    /**
     * Отправка изменений в локальный репозиторий
     */
    this.pushCurrentToLocal = () => {
        // Если локальная копия репозитория есть
        if (this.checkLocalRepo())
            // Отправка изменений
            child_process.spawnSync('git', ['push'], {
                cwd: consts.pathCurrent,
                stdio: 'inherit' // Вывод в консоль
            });
    }
    /**
     * Получение изменений из локального репозитория
     */
    this.pullLocalToCurrent = () => {
        // Если локальная копия репозитория есть
        if (this.checkLocalRepo())
            // Получение изменений
            child_process.spawnSync('git', ['pull'], {
                cwd: consts.pathCurrent,
                stdio: 'inherit' // Вывод в консоль
            });
    }
    /**
     * Клонировать с локальной копии репозитория
     */
    this.cloneLocalToCurrent = () => {
        // Если локальная копия репозитория есть
        if (this.checkLocalRepo()) {
            let pathCurrentProject = path.join(consts.pathCurrent, consts.nameLocalProject);
            // Создание папки с проектом, если ее еще нет
            if (!fs.existsSync(pathCurrentProject))
                fs.mkdirSync(pathCurrentProject);
            // Клонирование репозитория
            child_process.spawnSync('git', ['clone', consts.pathLocalRepo], {
                cwd: consts.pathCurrentProject,
                stdio: 'inherit' // Вывод в консоль
            });
        }
        else
            Write.console.error('Не найдена локальная копия репозитория');
    }

    /* РАБОТА С ЛОКАЛЬНОЙ КОПИЕЙ РЕПОЗИТОРИЯ */

    /**
     * Архивирование репозитория
     * @param {() => void} callback Функция обратного вызова
     */
    this.packLocalRepo = callback => {
        // Если локальная копия репозитория есть и указан колбэк
        if (this.checkLocalRepo() && (typeof callback === 'function')) {
            // Удаление архива если есть
            this.deleteLocalRepoArchive();
            // Создание архива
            tar.create({
                cwd: consts.pathLocalProject,
                gzip: true
            }, [consts.nameLocalRepo]).pipe(fs.createWriteStream(consts.pathLocalRepoArchive)).on('finish', () => {
                Write.console.info('Локальный репозиторий заархивирован');
                callback();
            });
        }
    }
    /**
     * Распаковка репозитория
     * @param {() => void} callback Функция обратного вызова
     */
    this.packLocalRepo = callback => {
        // Если архив существует и указан колбэк
        if (this.checkLocalRepoArchive() && (typeof callback === 'function')) {
            // Удалить папку с локальной копией репозитория
            DeleteDir(consts.pathLocalRepo);
            // Распаковка архива
            fs.createReadStream(consts.pathLocalRepoArchive).pipe(tar.extract({
                cwd: consts.pathLocalProject
            })).on('finish', () => {
                Write.console.info('Репозиторий разархивирован');
                // Удаление архива
                this.deleteLocalRepoArchive();
                callback();
            });
        }
    }
    /**
     * Удалить локальную копию репозитория
     */
    this.deleteLocalRepo = () => {
        if (this.checkLocalRepo()) {
            DeleteDir(consts.pathLocalRepo);
            Write.console.info('Локальный репозиторий удален');
        }
    }
    /**
     * Удалить архив
     */
    this.deleteLocalRepoArchive = () => {
        if (this.checkLocalRepoArchive()) {
            fs.unlinkSync(consts.pathLocalRepoArchive);
            Write.console.info('Архив удален');
        }
    }
}
module.exports = Repo;

/**
 * Удалить директорию
 * @param {string} dir Директория
 */
function DeleteDir (dir) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        let f = fs.readdirSync(dir);
        for (let i in f) {
            let name = path.join(dir, f[i]);
            if (fs.statSync(name).isDirectory()) 
                DeleteDir(name);
            else
                fs.unlinkSync(name);
        }
        fs.rmdirSync(dir);
    }
}