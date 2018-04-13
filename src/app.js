var path = require('path');

const Write = require('./color_write'); 
const Consts = new (require('./consts'))();
const Repo = new (require('./repoWorker'))(Consts);
const Yandex = new (require('./yandexWorker'))(Consts);



switch (Consts.command) {
    // Отправка репозитория на сервер
    case 'push':
        Consts.setNames( path.basename(path.dirname(Consts.pathCurrent)), path.basename(Consts.pathCurrent) );
        // Проверка на корректность текущей директории
        if (Repo.checkCurrentRepo()) {
            // Создание локальной копии репозитория
            Repo.cloneCurrentToLocal();
            // Если указано - отправить копию репозитория на сервер сразу, без внесения сделанных изменений
            if (Consts.arg1 != 'repo')
                Repo.pushCurrentToLocal();
            // Упаковка локальной копии репозитория в архив
            Repo.packLocalRepo(() => {
                // Отправка архива на сервер
                /*Yandex.sendLocalRepoArchive(function (error) {
                    if (error) Write.console.error('Ошибка отправки данных');
                    else       Write.console.correct('Данные успешно отправлены');
                    // Удаление архива
                    Repo.deleteLocalRepoArchive();
                });*/
            });
        }
        break;
        
    // Получение репозитория с сервера
    case 'pull':
        Write.console.warning('В разработке');
        break;

    // Список репозиториев на сервере
    case 'list':
        Write.console.warning('В разработке');
        break;

    // Клонировать репозиторий с сервера
    case 'clone':
        Write.console.warning('В разработке');
        break;

    // Удалить локальную копию репозитория
    case 'clear':
        Write.console.warning('В разработке');
        break;

    
    // Удалить локальную копию репозитория
    case 'clear-all':
        Write.console.warning('В разработке');
        break;

    // Обработка схемы
    case 'url':
        
        break;

    // Вывод справки
    case 'help':
        console.log( Write.bold(Write.green('  push [repo]')) + Write.reset(Write.white(' - Отправка данных на сервер.\n' + 
                                            '             ' +                           '   Если указан параметр \'repo\', то без взятия сделанных изменений из текущего репозитория.')) );
        console.log( Write.bold(Write.green('  pull [repo]')) + Write.reset(Write.white(' - Получение данных с сервера.\n' + 
                                            '             ' +                           '   Если указан параметр \'repo\', то без внесения изменений в текущий репозиторий.')) );
        console.log( Write.bold(Write.green('  list')) + Write.reset(Write.white(' - Вывести список репозиториев на сервере.')) );
        console.log( Write.bold(Write.green('  clone')) + Write.yellow(' <project> <repo>') + Write.reset(Write.white(' - Загрузить и клонировать репозиторий \'repo\' из проекта \'project\' с сервера.')) );
        console.log( Write.bold(Write.green('  clear')) + Write.reset(Write.white(' - Удалить локальную копию репозитория.')) );
        console.log( Write.bold(Write.green('  clear-all')) + Write.reset(Write.white(' - Удалить локальные копии всех репозиториев.')) );
        break;

    default:
        Write.console.error('Не указана команда');
}