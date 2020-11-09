// Модуль для хранения данных

var path = require('path');
var fs = require('fs');

function Consts () {

    /* КОНСТАНТЫ */

    /**
     * Путь к папке с репозиториями на сервере
     * @type {string}
     */
    this.pathReposServer = '/git';
    /**
     * Путь к папке с приложением
     * @type {string}
     */
    this.pathApp = path.dirname(__dirname);
    /**
     * Путь к локальной папке с репозиториями
     * @type {string}
     */
    this.pathReposLocal = path.join(this.pathApp, 'data');
    /**
     * Путь к папке с данными авторизации
     * @type {string}
     */
    this.pathCredentials = path.join(this.pathApp, 'credentials');
    /**
     * Путь к файлу с ключом шифрования репозиториев
     * @type {string}
     */
    this.pathRepoCrypt = path.join(this.pathCredentials, 'repoCrypt.json');
    /**
     * Путь к файлу с appID
     * @type {string}
     */
    this.pathYandexDiskAppID = path.join(this.pathCredentials, 'yandexDiskAppID.json');
    /**
     * Путь к файлу с токеном для Яндекс.Диска
     * @type {string}
     */
    this.pathYandexDiskToken = path.join(this.pathCredentials, 'yandexDiskToken.json');
    /**
     * Путь к файлу с аккаунтом для Яндекс.Облака
     * @type {string}
     */
    this.pathYandexCloudAccount = path.join(this.pathCredentials, 'yandexCloudAccount.json');
    /**
     * Путь к текущей директории, из которой вызывается git-back
     * @type {string}
     */
    this.pathCurrent = process.cwd();
    /**
     * Команда
     * @type {string}
     */
    this.command = process.argv[2];
    /**
     * Команда
     * @type {string}
     */
    this.action = process.argv[3];
    /**
     * Первый аргумент команды
     * @type {string}
     */
    this.arg1 = process.argv[4];
    /**
     * Второй аргумент команды
     * @type {string}
     */
    this.arg2 = process.argv[5];
    /**
     * Третий аргумент команды
     * @type {string}
     */
    this.arg3 = process.argv[6];

    /* ПОЛЯ */

    /**
     * Название проекта, в котором находится текущий репозиторий
     * @type {string}
     */
    this.nameLocalProject = '';
    /**
     * Имя папки с локальной копией репозитория
     * @type {string}
     */
    this.nameLocalRepo = '';
    /**
     * Имя архива с локальной копией репозитория
     * @type {string}
     */
    this.nameLocalRepoArchive = '';
    /**
     * Имя файла с версией репозитория
     * @type {string}
     */
    this.nameRepoVersionFile = '';
    /**
     * Имя временного файла с версией репозитория
     * @type {string}
     */
    this.nameRepoVersionTempFile = '';
    /**
     * Папка, где хранятся локальные копии репозиториев текущего проекта
     * @type {string}
     */
    this.pathLocalProject = '';
    /**
     * Папка с локальной копией репозитория
     * @type {string}
     */
    this.pathLocalRepo = '';
    /**
     * Полный путь к архиву с локальной копией репозитория
     * @type {string}
     */
    this.pathLocalRepoArchive = '';
    /**
     * Полный путь к файлу с версией репозитория
     * @type {string}
     */
    this.pathLocalRepoVersionFile = '';
    /**
     * Полный путь к временному файлу с версией репозитория
     * @type {string}
     */
    this.pathLocalRepoVersionTempFile = '';

    /* МЕТОДЫ */

    /**
     * Задать значения полей
     * @param {string} project Название проекта
     * @param {string} repo Название репозитория
     */
    this.setNames = (project, repo) => {
        if (!repo || !repo.length || !project || !project.length)
            return;
        
        this.nameLocalProject = project;
        this.nameLocalRepo = repo + '.git';
        this.nameLocalRepoArchive = this.nameLocalRepo + '.tar.gz';

        this.nameRepoVersionFile = repo + '.version';
        this.nameRepoVersionTempFile = this.nameRepoVersionFile + '.temp';
        
        this.pathLocalProject = path.join(this.pathReposLocal, this.nameLocalProject);
        this.pathLocalRepo = path.join(this.pathLocalProject, this.nameLocalRepo);
        this.pathLocalRepoArchive = path.join(this.pathLocalProject, this.nameLocalRepoArchive);
        
        this.pathLocalRepoVersionFile = path.join(this.pathLocalProject, this.nameRepoVersionFile);
        this.pathLocalRepoVersionTempFile = path.join(this.pathLocalProject, this.nameRepoVersionTempFile);

        if (!fs.existsSync(this.pathReposLocal))
            fs.mkdirSync(this.pathReposLocal);
        if (!fs.existsSync(this.pathLocalProject))
            fs.mkdirSync(this.pathLocalProject);
    }
}
module.exports = Consts;