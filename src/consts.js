// Модуль для хранения данных

var path = require('path');

function Consts () {

    /* КОНСТАНТЫ */

    /**
     * Путь к папке с репозиториями на сервере
     * @type {string}
     */
    this.pathReposServer = '/git';
    /**
     * Путь к локальной папке с репозиториями
     * @type {string}
     */
    this.pathReposLocal = path.join(path.dirname(__dirname), 'data');
    /**
     * Путь к папке с данными авторизации
     * @type {string}
     */
    this.pathCredentials = path.join(path.dirname(__dirname), 'credentials');
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
     * Первый аргумент команды
     * @type {string}
     */
    this.arg1 = process.argv[3];
    /**
     * Второй аргумент команды
     * @type {string}
     */
    this.arg2 = process.argv[4];

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
        
        this.pathLocalProject = path.join(this.pathReposLocal, this.nameLocalProject);
        this.pathLocalRepo = path.join(this.pathLocalProject, this.nameLocalRepo);
        this.pathLocalRepoArchive = path.join(this.pathLocalProject, this.nameLocalRepoArchive);
    }
}
module.exports = Consts;