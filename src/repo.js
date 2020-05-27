// Модуль для работы с репозиториями

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var tar = require('tar');

const Write = require('./color_write');
const Crypt = require('./crypt');

var consts = require('./consts');

/**
 * Конструктор
 * @param {consts} Consts Константы
 */
function Repo (Consts) {

    /* ПРОВЕРКИ */

    /**
     * Проверка на существования репозитория в текущей папке
     * @returns {boolean} Является ли текущая директория git репозиторием
     */
    var CheckCurrentRepo = () => {
        return fs.existsSync(path.join(Consts.pathCurrent, '.git'));
    }

    /**
     * Проверка на существование локальной копии репозитория
     * @returns {boolean} Создана ли локальная копия репозитория
     */
    var CheckLocalRepo = () => {
        return fs.existsSync(Consts.pathLocalRepo);
    }

    /**
     * Проверка на существование архива локальной копии репозитория
     * @returns {boolean} Создан ли архив локальной копии репозитория
     */
    var CheckLocalRepoArchive = () => {
        return fs.existsSync(Consts.pathLocalRepoArchive);
    }

    /* GIT комманды */

    /**
     * Инициализация пустого git-репозитория
     */
    var InitEmptyRepo = () => {
        child_process.spawnSync('git', ['init'], {
            cwd: Consts.pathCurrent,
            stdio: 'inherit'
        });
        child_process.spawnSync('git', ['remote', 'add', 'origin', Consts.pathLocalRepo], {
            cwd: Consts.pathCurrent,
            stdio: 'inherit'
        });
    }

    /**
     * Клонирование текущего репозитория в локальную копию
     */
    var CloneCurrentToLocal = () => {
        // Если локальной копии репозитория нет
        if (!CheckLocalRepo()) {
            // Если не создана папка с локальным проектом
            if (!fs.existsSync(Consts.pathLocalProject)) {
                fs.mkdirSync(Consts.pathLocalProject);
                Write.file.info('Создана папка для проекта');
            }
            // Клонирование голого репозитория
            child_process.spawnSync('git', ['clone', '--bare', Consts.pathCurrent], {
                cwd: Consts.pathLocalProject,
                stdio: 'inherit' // Вывод в консоль
            });
            // Изменение источника
            ChangeCurrentRepoServer();
        }
    }

    /**
     * Смена источника репозитория
     */
    var ChangeCurrentRepoServer = () => {
        // Если локальная копия репозитория есть
        if (CheckLocalRepo())
            // Смена источника
            child_process.spawnSync('git', ['remote', 'set-url', 'origin', Consts.pathLocalRepo], {
                cwd: Consts.pathCurrent,
                stdio: 'inherit' // Вывод в консоль
            });
    }

    /**
     * Отправка изменений в локальный репозиторий
     */
    var PushCurrentToLocal = () => {
        // Если локальная копия репозитория есть
        if (CheckLocalRepo()) {
            var branchInfo = IsBranchHaveUpstream();
            if (branchInfo.hasUpstream) {
                // Отправка изменений
                child_process.spawnSync('git', ['push'], {
                    cwd: Consts.pathCurrent,
                    stdio: 'inherit' // Вывод в консоль
                });
            }
            else {
                child_process.spawnSync('git', ['push', '--set-upstream', 'origin', branchInfo.branch], {
                    cwd: Consts.pathCurrent,
                    stdio: 'inherit' // Вывод в консоль
                });
            }
        }
    }

    var IsBranchHaveUpstream = () => {
        var output = child_process.spawnSync('git', ['branch', '-vv'], {
            cwd: Consts.pathCurrent,
            stdio: 'pipe' // Вывод в консоль
        });

        var branches = String(output.output);
        branches = branches.substr(1, branches.length - 3).split('\n');

        var branchName = '';
        var hasUpstream = false;
        for (var i = 0; i < branches.length; i++) {
            var branch = branches[i];
            var index = branch.search(/(?<=^\s*\*\s*)\S/i);
            if (index != -1) {
                branch = branch.substr(index);
                index = branch.search(/\s/i);
                branchName = branch.substr(0, index);

                index = branch.search(/\[.+\]/i);
                if (index != -1) {
                    hasUpstream = true;
                }
                break;
            }
        }
        return {
            branch: branchName,
            hasUpstream: hasUpstream
        }
    }

    /**
     * Получение изменений из локального репозитория
     */
    var PullLocalToCurrent = () => {
        // Если локальная копия репозитория есть
        if (CheckLocalRepo())
            // Получение изменений
            child_process.spawnSync('git', ['pull'], {
                cwd: Consts.pathCurrent,
                stdio: 'inherit' // Вывод в консоль
            });
    }

    /**
     * Клонировать с локальной копии репозитория
     */
    var CloneLocalToCurrent = () => {
        // Если локальная копия репозитория есть
        if (CheckLocalRepo()) {
            let pathCurrentProject = path.join(Consts.pathCurrent, Consts.nameLocalProject);
            // Создание папки с проектом, если ее еще нет
            if (!fs.existsSync(pathCurrentProject))
                fs.mkdirSync(pathCurrentProject);
            // Клонирование репозитория
            child_process.spawnSync('git', ['clone', Consts.pathLocalRepo], {
                cwd: pathCurrentProject,
                stdio: 'inherit' // Вывод в консоль
            });
        }
        else
            Write.file.error('Не найдена локальная копия репозитория');
    }

    /* РАБОТА С ЛОКАЛЬНОЙ КОПИЕЙ РЕПОЗИТОРИЯ */

    /**
     * Архивирование репозитория
     * @param {() => void} callback Функция обратного вызова
     */
    var PackLocalRepo = callback => {
        // Если локальная копия репозитория есть и указан колбэк
        if (CheckLocalRepo() && (typeof callback === 'function')) {
            // Удаление архива если есть
            DeleteLocalRepoArchive();
            // Создание архива
            tar.create({
                cwd: Consts.pathLocalProject,
                gzip: true
            }, [Consts.nameLocalRepo]).pipe(fs.createWriteStream(Consts.pathLocalRepoArchive)).on('finish', () => {
                Write.file.info('Локальный репозиторий заархивирован');
                callback();
            });
        }
    }

    /**
     * Распаковка репозитория
     * @param {() => void} callback Функция обратного вызова
     */
    var UnpackLocalRepo = callback => {
        // Если архив существует и указан колбэк
        if (CheckLocalRepoArchive() && (typeof callback === 'function')) {
            // Удалить папку с локальной копией репозитория
            DeleteDir(Consts.pathLocalRepo);
            // Распаковка архива
            fs.createReadStream(Consts.pathLocalRepoArchive).pipe(tar.extract({
                cwd: Consts.pathLocalProject
            })).on('finish', () => {
                Write.file.info('Репозиторий разархивирован');
                // Удаление архива
                DeleteLocalRepoArchive();
                callback();
            });
        }
    }

    /**
     * Удалить локальную копию репозитория
     */
    var DeleteLocalRepo = () => {
        if (CheckLocalRepo()) {
            DeleteDir(Consts.pathLocalRepo);
            Write.file.info('Локальный репозиторий удален');
        }
    }

    /**
     * Удалить архив
     */
    var DeleteLocalRepoArchive = () => {
        if (CheckLocalRepoArchive()) {
            fs.unlinkSync(Consts.pathLocalRepoArchive);
            Write.file.info('Архив удален');
        }
    }

    var DeleteAllLocalRepos = () => {
        DeleteDir(Consts.pathReposLocal);
        fs.mkdirSync(Consts.pathReposLocal);
    }

    /**
     * Удалить директорию
     * @param {string} dir Директория
     */
    var DeleteDir = dir => {
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

    /**
     * Зашифровать архив перед отправкой
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var EncryptLocalRepoArchive = (callback) => {
        if (callback && (typeof callback === 'function')) {
            GetCryptKey((error, key) => {
                if (error) {
                    Write.file.error('Ошибка получения ключа шифрования');
                    callback(true);
                }
                else {
                    fs.readFile(Consts.pathLocalRepoArchive, (error, data) => {
                        if (error) {
                            Write.file.error('Ошибка чтения локальной копии архива: ' + error.message);
                            callback(true);
                        }
                        else {
                            data = Buffer.from(Crypt.aes.encrypt(data.toString('binary'), key), 'binary');
                            fs.writeFile(Consts.pathLocalRepoArchive, data, error => {
                                if (error) {
                                    Write.file.error('Ошибка записи в локальную копию архива: ' + error.message);
                                    callback(true);
                                }
                                else
                                    callback(false);
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * Расшифровать архив после получения
     * @param {(error: boolean) => void} callback Функция обратного вызова
     */
    var DecryptLocalRepoArchive = (callback) => {
        if (callback && (typeof callback === 'function')) {
            GetCryptKey((error, key) => {
                if (error) {
                    Write.file.error('Ошибка получения ключа шифрования');
                    callback(true);
                }
                else {
                    fs.readFile(Consts.pathLocalRepoArchive, (error, data) => {
                        if (error) {
                            Write.file.error('Ошибка чтения локальной копии архива: ' + error.message);
                            callback(true);
                        }
                        else {
                            data = Crypt.aes.decrypt(data.toString('binary'), key);
                            if (data == null) {
                                Write.file.error('Ошибка расшифровки архива');
                                callback(true);
                            }
                            else {
                                data = Buffer.from(data, 'binary');
                                fs.writeFile(Consts.pathLocalRepoArchive, data, error => {
                                    if (error) {
                                        Write.file.error('Ошибка записи в локальную копию архива: ' + error.message);
                                        callback(true);
                                    }
                                    else
                                        callback(false);
                                });
                            }
                        }
                    });
                }
            });
        }
    }

    /**
     * Получить ключ шифрования, или сгенерировать, если его нет
     * @param {(error: boolean, key: {key: string, iv: string})} callback Функция обратного вызова
     */
    var GetCryptKey = (callback) => {
        if ((callback !== null) && (typeof callback === 'function')) {
            GetRepoCrypt((error, repoCrypt) => {
                if (!repoCrypt.crypt) {
                    let key = Crypt.aes.generateKey_changeEncode('base64');
                    repoCrypt.crypt = key.key + ':' + key.iv;
                    fs.writeFile(Consts.pathRepoCrypt, JSON.stringify(repoCrypt), error => {
                        if (error)
                            callback(true);
                        else
                            GetCryptKey(callback);
                    });
                }
                else {
                    let temp = repoCrypt.crypt.split(':');
                    let key = {
                        key: Crypt.changeEncode(temp[0], 'binary', 'base64'),
                        iv: Crypt.changeEncode(temp[1], 'binary', 'base64')
                    };
                    callback(false, key);
                }
            });
        }
    }
    /**
     * Получить идентификатор приложения
     * @param {(error: boolean, key: string) => void} callback Функция обратного вызова
     */
    var GetRepoCrypt = callback => {
        if ((typeof callback === 'function') && CheckRepoCrypt()) {
            fs.readFile(Consts.pathRepoCrypt, (error, data) => {
                if (!error) {
                    data = JSON.parse(data);
                    if (data.crypt)
                        callback(false, data.crypt);
                    else {
                        Write.file.error('Неверный формат repoCrypt');
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
            Write.file.error('Отсутствует repoCrypt');
            callback(true);
        }
    }
    /**
     * Проверка идентификатора приложения
     * @returns {boolean} Идентификатор существует
     */
    var CheckRepoCrypt = () => {
        return fs.existsSync(Consts.pathRepoCrypt);
    }

    this.checkCurrentRepo = CheckCurrentRepo;
    this.checkLocalRepo = CheckLocalRepo;
    this.checkLocalRepoArchive = CheckLocalRepoArchive;

    this.initEmptyRepo = InitEmptyRepo;

    this.changeCurrentRepoServer = ChangeCurrentRepoServer;
    this.cloneCurrentToLocal = CloneCurrentToLocal;
    this.cloneLocalToCurrent = CloneLocalToCurrent;
    this.pushCurrentToLocal = PushCurrentToLocal;
    this.pullLocalToCurrent = PullLocalToCurrent;

    this.packLocalRepo = PackLocalRepo;
    this.unpackLocalRepo = UnpackLocalRepo;

    this.deleteLocalRepo = DeleteLocalRepo;
    this.deleteLocalRepoArchive = DeleteLocalRepoArchive;
    this.deleteAllLocalRepos = DeleteAllLocalRepos;

    this.encryptLocalRepoArchive = EncryptLocalRepoArchive;
    this.decryptLocalRepoArchive = DecryptLocalRepoArchive;
}
module.exports = Repo;