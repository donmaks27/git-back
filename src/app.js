var path = require('path');

const Write = require('./color_write'); 
const Consts = new (require('./consts'))();
const Repo = new (require('./repo'))(Consts);

const YandexDiskToken = new (require('./yandexDiskToken'))(Consts);
const YandexDisk = new (require('./yandexDisk'))(Consts, YandexDiskToken);

const YandexCloudRequestBuilder = new (require('./yandexCloudRequestBuilder'))(Consts);
const YandexCloud = new (require('./yandexCloud'))(Consts, YandexCloudRequestBuilder);

/**
 * @type {YandexDisk}
 */
let Yandex = null;

switch (Consts.command) {
    
    // Использовать Яндекс.Диск
    case 'disk': 
        Yandex = YandexDisk;
        break;
    // Использовать Яндекс.Облако
    case 'cloud':
        Yandex = YandexCloud;
        break;

    case 'migrate':
        /**
         * @type {YandexDisk}
         */
        let YandexFrom = null;
        /**
         * @type {YandexDisk}
         */
        let YandexTo = null;
        switch (Consts.action) {
            case 'disk-to-cloud':
                YandexFrom = YandexDisk;
                YandexTo = YandexCloud;
                break;
            case 'cloud-to-disk':
                YandexFrom = YandexCloud;
                YandexTo = YandexDisk;
                break;
            default:
                Write.console.error('Не указано, откуда и куда переносить');
        }
        if ((YandexFrom != null) && (YandexTo != null)) {
            Consts.setNames(Consts.arg1, Consts.arg2);
            // Получение архива с сервера
            YandexFrom.receiveServerRepoArchive((error) => {
                if (error) {
                    Write.console.error('Ошибка загрузки данных');
                    return;
                }
    
                Write.console.correct('Данные успешно загружены');
                // Отправка архива на сервер
                YandexTo.sendLocalRepoArchive((error) => {
                    if (error) {
                        Write.console.error('Ошибка отправки данных');
                    }
                    else {
                        Write.console.correct('Данные успешно отправлены');
                    }
                    // Удаление архива
                    Repo.deleteLocalRepoArchive();
                });
            });
        }
        break;

    // Инициализация репозитория
    case 'init':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Инициализация пустого git-репозитория
        if (!Repo.checkCurrentRepo()) {
            Repo.initEmptyRepo();
        }
        break;

    // Удалить локальную копию репозитория
    case 'clear':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Удаление архива
        Repo.deleteLocalRepoArchive();
        // Удаление репозитория
        Repo.deleteLocalRepo();
        break;

    // Удалить локальную копию репозитория
    case 'clear-all':
        Repo.deleteAllLocalRepos();
        Write.console.correct('Локальные копии репозиториев удалены');
        break;

    // Обработка схемы
    case 'url':
        YandexDiskToken.getCodeFromUrl(Consts.action);
        break;

    // Вывод справки
    case 'help':
        console.log(  Write.bold(Write.green('  init')) + Write.reset(Write.white(' - Инициализировать пустой git-репозиторий.')) );
        console.log( Write.bold(Write.yellow('  (disk|cloud)') + Write.green(' push [repo] [nocrypt] [force]')) + Write.reset(Write.white(' - Отправка данных на сервер.\n' + 
                                             '              ' +              '                              ' +                           '   Если указан параметр \'repo\', то без взятия сделанных изменений из текущего репозитория.\n' +
                                             '              ' +              '                              ' +                           '   Если указан параметр \'nocrypt\', то на сервер отправятся незашифрованные данные.\n' +
                                             '              ' +              '                              ' +                           '   Если указан параметр \'force\', то отправить на сервер без проверки на версии репозитория.')) );
        console.log( Write.bold(Write.yellow('  (disk|cloud)') + Write.green(' pull [repo] [nocrypt]')) + Write.reset(Write.white(' - Получение данных с сервера.\n' + 
                                             '              ' +              '                      ' +                           '   Если указан параметр \'repo\', то без внесения изменений в текущий репозиторий.\n' +
                                             '              ' +              '                      ' +                           '   Если указан параметр \'nocrypt\', то после получения данные не расшифруются.')) );
        console.log( Write.bold(Write.yellow('  (disk|cloud)') + Write.green(' list')) + Write.reset(Write.white(' - Вывести список репозиториев на сервере.')) );
        console.log( Write.bold(Write.yellow('  (disk|cloud)') + Write.green(' clone')) + Write.yellow(' <project> <repo>') + Write.green(' [nocrypt]') + Write.reset(Write.white(' - Загрузить и клонировать репозиторий \'repo\' из проекта \'project\' с сервера.\n' +
                                             '              ' +              '      ' +                '                 ' +              '          ' +                          '   Если указан параметр \'nocrypt\', то после получения данные не расшифруются.')) );
        console.log(  Write.bold(Write.green('  migrate')) + Write.yellow(' (disk-to-cloud|cloud-to-disk) <project> <repo>') + Write.reset(Write.white(' - Скопировать репозиторий из одного хранилища в другое.')) );
        console.log(  Write.bold(Write.green('  clear')) + Write.reset(Write.white(' - Удалить локальную копию репозитория.')) );
        console.log(  Write.bold(Write.green('  clear-all')) + Write.reset(Write.white(' - Удалить локальные копии всех репозиториев.')) );
        console.log(  Write.bold(Write.green('  url')) + Write.yellow(' <url>') + Write.reset(Write.white(' - Обработка URL схемы \'git-back://\'.')) );
        break;

    default:
        Write.console.error('Не указана команда');
}
if (Yandex == null) {
    return;
}

switch (Consts.action) {

    // Отправка репозитория на сервер
    case 'push':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        CommandSync();
        break;
        
    // Получение репозитория с сервера
    case 'pull':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        CommandPull();
        break;

    // Список репозиториев на сервере
    case 'list':
        // Получение списка проектов с их репозиториями
        Yandex.getFullReposList((error, list) => {
            if (!error) {
                // Проекты
                for (let project in list) {
                    console.log('  ' + project);
                    // Репозитории проекта
                    for (let repo = 0; repo < list[project].length; repo++)
                        console.log('   - ' + list[project][repo]);
                }
            }
            else
                Write.console.error('Ошибка загрузки списка репозиториев');
        });
        break;

    // Клонировать репозиторий с сервера
    case 'clone':
        Consts.setNames(Consts.arg1, Consts.arg2);
        // Удаление архива, если есть
        Repo.deleteLocalRepoArchive();
        // Получение архива с сервера
        Yandex.receiveServerRepoArchive(error => {
            if (error) {
                Write.console.error('Ошибка загрузки данных');
                return;
            }

            Write.console.correct('Данные успешно загружены');
            var callback = () => {
                // Распаковка архива с локальной копией репозитория
                Repo.unpackLocalRepo(() => {
                    if (!Repo.checkLocalRepo())
                        Write.console.error('Ошибка распаковки данных');
                    else {
                        Write.console.correct('Архив распакован');
                        Repo.cloneLocalToCurrent();
                        Yandex.receiveServerRepoVersion(true, error => {});
                    }
                });
            };
            if (Consts.arg3 != 'nocrypt') {
                // Расшифровка архива
                Repo.decryptLocalRepoArchive((error) => {
                    if (error) {
                        Write.console.error('Ошибка расшифровки архива');
                        Repo.deleteLocalRepoArchive();
                        return;
                    }
    
                    Write.console.correct('Архив расшифрован');
                    callback();
                });
            }
            else {
                callback();
            }
        });
        break;

    default:
        Write.console.error('Не указано действие');
}

function CommandSync() {
    let forcePush = !((Consts.arg1 != 'force') && (Consts.arg2 != 'force') && (Consts.arg3 != 'force'));
    if (forcePush) {
        CommandPush();
    }
    else {
        GetServerRepoVersion((serverVersion) => {
            let localVesion = Repo.getRepoVersion();
            if (serverVersion > localVesion) {
                Write.console.warning('Версия репозитория на сервере новее локальной, необходимо сначала выполнить команду pull')
            }
            else {
                CommandPush();
            }
        });
    }
}

function CommandPush() {
    // Проверка на корректность текущей директории
    if (Repo.checkCurrentRepo()) {
        // Создание локальной копии репозитория
        Repo.cloneCurrentToLocal();
        // Если указано - отправить копию репозитория на сервер сразу, без внесения сделанных изменений
        if ((Consts.arg1 != 'repo') && (Consts.arg2 != 'repo') && (Consts.arg3 != 'repo'))
            Repo.pushCurrentToLocal();
        // Упаковка локальной копии репозитория в архив
        Repo.packLocalRepo(() => {
            if (!Repo.checkLocalRepoArchive()) {
                Write.console.error('Ошибка архивации репозитория');
                return;
            }

            Write.console.correct('Архив запакован');
            var callback = () => {
                // Отправка архива на сервер
                Yandex.sendLocalRepoArchive((error) => {
                    if (error) {
                        Write.console.error('Ошибка отправки данных');
                    }
                    else {
                        Write.console.correct('Данные успешно отправлены');

                        Repo.incrementLocalRepoVersion();
                        Yandex.sendLocalRepoVersion((error) => {});
                    }
                    // Удаление архива
                    Repo.deleteLocalRepoArchive();
                });
            };

            if ((Consts.arg1 != 'nocrypt') && (Consts.arg2 != 'nocrypt') && (Consts.arg2 != 'nocrypt')) {
                // Шифрование архива
                Repo.encryptLocalRepoArchive((error) => {
                    if (error) {
                        Write.console.error('Ошибка шифрования архива');
                        Repo.deleteLocalRepoArchive();
                        return;
                    }

                    Write.console.correct('Архив зашифрован');
                    callback();
                });
            }
            else {
                callback();
            }
        });
    }
    else 
        Write.console.error('Данная директория не содержит git репозитория');
}

function CommandPull(successCallback) {
    // Проверка на корректность текущей директории
    if (Repo.checkCurrentRepo()) {
        // Удаление архива, если есть
        Repo.deleteLocalRepoArchive();
        // Получение архива с сервера
        Yandex.receiveServerRepoArchive(error => {
            if (error) {
                Write.console.error('Ошибка загрузки данных');
                return;
            }

            Write.console.correct('Данные успешно загружены');
            var decryptCallback = () => {
                // Если не было локальной копии репозитория, то установить источник на скаченный
                let change = Repo.checkLocalRepo();
                // Распаковка архива с локальной копией репозитория
                Repo.unpackLocalRepo(() => {
                    Write.console.correct('Архив распакован');
                    // Установка источника
                    if (change)
                        Repo.changeCurrentRepoServer();
                    if ((Consts.arg1 != 'repo') && (Consts.arg2 != 'repo'))
                        Repo.pullLocalToCurrent();
                    Yandex.receiveServerRepoVersion(true, (error) => {
                        if (typeof successCallback === 'function') {
                            successCallback();
                        }
                    });
                });
            };
            if ((Consts.arg1 != 'nocrypt') && (Consts.arg2 != 'nocrypt')) {
                // Расшифровка архива
                Repo.decryptLocalRepoArchive((error) => {
                    if (error) {
                        Write.console.error('Ошибка расшифровки архива');
                        Repo.deleteLocalRepoArchive();
                        return;
                    }

                    Write.console.correct('Архив расшифрован');
                    decryptCallback();
                });
            }
            else {
                decryptCallback();
            }
        });
    }
    else  {
        Write.console.error('Данная директория не содержит git репозитория');
    }
}

/**
 * @param {(version: number) => void} callback
 */
function GetServerRepoVersion(callback) {
    Yandex.receiveServerRepoVersion(false, (error) => {
        if (error) {
            callback(-1);
        }
        else {
            let version = Repo.getRepoTempVersion();
            Repo.deleteRepoTempVersion();
            callback(version);
        }
    });
}