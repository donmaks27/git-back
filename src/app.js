const Write = require('./color_write'); 
const Names = require('./consts');
const Yandex = require('./yandex')(Names);



switch (Names.command) {
    // Отправка репозитория на сервер
    case 'push':
        Write.console.warning('В разработке');
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