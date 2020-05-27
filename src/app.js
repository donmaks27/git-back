var path = require('path');

const Write = require('./color_write'); 
const Consts = new (require('./consts'))();
const Repo = new (require('./repo'))(Consts);
const YandexDiskToken = new (require('./yandexDiskToken'))(Consts);
const YandexDisk = new (require('./yandexDisk'))(Consts, Repo, YandexDiskToken);

switch (Consts.command) {
    // Инициализация репозитория
    case 'init':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Инициализация пустого git-репозитория
        if (!Repo.checkCurrentRepo()) {
            Repo.initEmptyRepo();
        }
        break;

    // Отправка репозитория на сервер
    case 'push':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Проверка на корректность текущей директории
        if (Repo.checkCurrentRepo()) {
            // Создание локальной копии репозитория
            Repo.cloneCurrentToLocal();
            // Если указано - отправить копию репозитория на сервер сразу, без внесения сделанных изменений
            if ((Consts.arg1 != 'repo') && (Consts.arg2 != 'repo'))
                Repo.pushCurrentToLocal();
            // Упаковка локальной копии репозитория в архив
            Repo.packLocalRepo(() => {
                // Отправка архива на сервер
                YandexDisk.sendLocalRepoArchive( (Consts.arg1 != 'nocrypt') && (Consts.arg2 != 'nocrypt'), error => {
                    if (error) Write.console.error('Ошибка отправки данных');
                    else       Write.console.correct('Данные успешно отправлены');
                    // Удаление архива
                    Repo.deleteLocalRepoArchive();
                });
            });
        }
        else 
            Write.console.error('Данная директория не содержит git репозитория');
        break;
        
    // Получение репозитория с сервера
    case 'pull':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Проверка на корректность текущей директории
        if (Repo.checkCurrentRepo()) {
            // Удаление архива, если есть
            Repo.deleteLocalRepoArchive();
            // Получение с архива сервера
            YandexDisk.receiveServerRepoArchive(error => {
                if (error) {
                    Write.console.error('Ошибка загрузки данных');
                    Repo.deleteLocalRepoArchive();
                    return;
                }

                Write.console.correct('Данные успешно загружены');
                var decryptCallback = (error) => {
                    if (error) {
                        Write.console.error('Ошибка расшифровки архива');
                        Repo.deleteLocalRepoArchive();
                        return;
                    }

                    // Если не было локальной копии репозитория, то установить источник на скаченный
                    let change = Repo.checkLocalRepo();
                    // Распаковка архива с локальной копией репозитория
                    Repo.unpackLocalRepo(() => {
                        // Установка источника
                        if (change)
                            Repo.changeCurrentRepoServer();
                        if ((Consts.arg1 != 'repo') && (Consts.arg2 != 'repo'))
                            Repo.pullLocalToCurrent();
                    });
                };
                if ((Consts.arg1 != 'nocrypt') || (Consts.arg2 != 'nocrypt')) {
                    // Расшифровка архива
                    Repo.decryptLocalRepoArchive(decryptCallback);
                }
                else {
                    decryptCallback(false);
                }
            });
        }
        else 
            Write.console.error('Данная директория не содержит git репозитория');
        break;

    // Список репозиториев на сервере
    case 'list':
        // Получение списка проектов с их репозиториями
        YandexDisk.getFullReposList((error, list) => {
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
        // Получение с архива сервера
        YandexDisk.receiveServerRepoArchive(error => {
            if (error) {
                Write.console.error('Ошибка загрузки данных');
                return;
            }

            Write.console.correct('Данные успешно загружены');
            var decryptCallback = (error) => {
                if (error) {
                    Write.console.error('Ошибка расшифровки архива');
                    return;
                }

                // Распаковка архива с локальной копией репозитория
                Repo.unpackLocalRepo(() => {
                    if (!Repo.checkLocalRepo())
                        Write.console.error('Ошибка распаковки данных');
                    else {
                        Write.console.correct('Данные успешно загружены');
                        Repo.cloneLocalToCurrent();
                    }
                });
            };
            if (Consts.arg3 != 'nocrypt') {
                // Расшифровка архива
                Repo.decryptLocalRepoArchive(decryptCallback);
            }
            else {
                decryptCallback(false);
            }
        });
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
        YandexDiskToken.getCodeFromUrl(Consts.arg1);
        break;

    // Вывод справки
    case 'help':
        console.log( Write.bold(Write.green('  init')) + Write.reset(Write.white(' - Инициализировать пустой git-репозиторий.')) );
        console.log( Write.bold(Write.green('  push [repo] [nocrypt]')) + Write.reset(Write.white(' - Отправка данных на сервер.\n' + 
                                            '                       ' +                           '   Если указан параметр \'repo\', то без взятия сделанных изменений из текущего репозитория.\n' +
                                            '                       ' +                           '   Если указан параметр \'nocrypt\', то на сервер отправятся незашифрованные данные.')) );
        console.log( Write.bold(Write.green('  pull [repo] [nocrypt]')) + Write.reset(Write.white(' - Получение данных с сервера.\n' + 
                                            '                       ' +                           '   Если указан параметр \'repo\', то без внесения изменений в текущий репозиторий.\n' +
                                            '                       ' +                           '   Если указан параметр \'nocrypt\', то после получения данные не расшифруются.')) );
        console.log( Write.bold(Write.green('  list')) + Write.reset(Write.white(' - Вывести список репозиториев на сервере.')) );
        console.log( Write.bold(Write.green('  clone')) + Write.yellow(' <project> <repo>') + Write.green(' [nocrypt]') + Write.reset(Write.white(' - Загрузить и клонировать репозиторий \'repo\' из проекта \'project\' с сервера.\n' +
                                            '       ' +                '                 ' +              '          ' +                          '   Если указан параметр \'nocrypt\', то после получения данные не расшифруются.')) );
        console.log( Write.bold(Write.green('  clear')) + Write.reset(Write.white(' - Удалить локальную копию репозитория.')) );
        console.log( Write.bold(Write.green('  clear-all')) + Write.reset(Write.white(' - Удалить локальные копии всех репозиториев.')) );
        console.log( Write.bold(Write.green('  url')) + Write.yellow(' <url>') + Write.reset(Write.white(' - Обработка URL схемы \'git-back://\'.')) );
        break;

    default:
        Write.console.error('Не указана команда');
}