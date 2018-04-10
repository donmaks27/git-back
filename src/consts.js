// Модуль для хранения данных

var path = require('path');



/* КОНСТАНТЫ */

/**
 * Путь к папке с репозиториями на сервере
 * @type {string}
 */
const pathReposServer = '/git';
/**
 * Путь к локальной папке с репозиториями
 * @type {string}
 */
const pathReposLocal = path.join(path.dirname(__dirname), 'data');
/**
 * Путь к текущей директории, из которой вызывается git-back
 * @type {string}
 */
const pathCurrent = process.cwd();
/**
 * Команда
 * @type {string}
 */
const command = process.argv[2];
/**
 * Первый аргумент команды
 * @type {string}
 */
const arg1 = process.argv[3];
/**
 * Второй аргумент команды
 * @type {string}
 */
const arg2 = process.argv[4];



/* ПОЛЯ */

/**
 * Название проекта, в котором находится текущий репозиторий
 * @type {string}
 */
var nameLocalProject = '';
/**
 * Имя папки с локальной копией репозитория
 * @type {string}
 */
var nameLocalRepo = '';
/**
 * Имя архива с локальной копией репозитория
 * @type {string}
 */
var nameLocalRepoArchive = '';
/**
 * Папка, где хранятся локальные копии репозиториев текущего проекта
 * @type {string}
 */
var pathLocalProject = '';
/**
 * Папка с локальной копией репозитория
 * @type {string}
 */
var pathLocalRepo = '';
/**
 * Полный путь к архиву с локальной копией репозитория
 * @type {string}
 */
var pathLocalRepoArchive = '';



/**
 * Задать значения полей
 * @param {string} project Название проекта
 * @param {string} repo Название репозитория
 */
function SetNames (project, repo) {
    if (!repo || !repo.length || !project || !project.length)
        return;

    nameLocalProject = project;
    nameLocalRepo = repo + '.git';
    nameLocalRepoArchive = nameLocalRepo + '.tar.gz';
    
    pathLocalProject = path.join(pathReposLocal, nameLocalProject);
    pathLocalRepo = path.join(pathLocalProject, nameLocalRepo);
    pathLocalRepoArchive = path.join(pathLocalProject, nameLocalRepoArchive);
}



module.exports.pathReposServer = pathReposServer;
module.exports.pathReposLocal = pathReposLocal;
module.exports.pathCurrent = pathCurrent;
module.exports.command = command;
module.exports.arg1 = arg1;
module.exports.arg2 = arg2;

module.exports.nameLocalProject = nameLocalProject;
module.exports.nameLocalRepo = nameLocalRepo;
module.exports.nameLocalRepoArchive = nameLocalRepoArchive;
module.exports.pathCurrent = pathCurrent;
module.exports.pathLocalProject = pathLocalProject;
module.exports.pathLocalRepo = pathLocalRepo;
module.exports.pathLocalRepoArchive = pathLocalRepoArchive;

module.exports.setNames = SetNames;