# git-back
Программа для использования Яндекс.Диск как хранилище репозиториев.

# Установка
Для установки запустить скрипт из папки `scripts`:
- `install.bat` для ОС Windows (для корректной работы после этого требуется перезагрузить компьютер)
- `install.sh` для ОС Linux (необязательно под root'ом. Создаст локальную папку `~/.local/local/bin`, если ее нет)

Если перед установкой не был установлен Node.js (либо же его нет в PATH), то модули для программы установлены не будут. После установки Node.js неободимо повторить установку, либо же можно установить отдельно модули, выполнив команду `npm i` из папки с программой, или запустив скрипт из папки `scripts`:
- `install-modules.bat` для ОС Windows
- `install-modules.sh` для ОС Linux

# Запуск
Перед запуском необходимо убедиться, что в системе установлен Node.js и в папке с программой установлены необходимые модули (см. Установка). Запуск:
```
git-back <command> [<arg1> [<arg2> [<arg3>]]]
```
Для связи с Яндекс.Диск необходим идентификатор приложения и токен. 
1. Идентификатор приложения. Состоит из ID приложения и пароля. Он должен располагаться в файле `credentials/appID.json`. Пример в файле `credentials/appID.sample`. Для получения необходимо его зарегестрировать на [странице Яндекс.OAuth](https://oauth.yandex.ru/). В разделе __Платформы__ выбрать __Веб-сервисы__ и в поле *Callback URI* вставить __`git-back://token`__. Также необходимо предоставить доступ к `Яндекс.Диск REST API` установкой всех галочек в соответствующем разделе.
2. Токен. Состоит из токена для авторизации, токена для обновления, время жизни и дата получения. Должен располагаться в файле `credentials/token.json`. Пример в файле `credentials/token.sample`. Если его нет, программа попытается его получить, направив пользователя на страницу Яндекса, где он должен предоставить приложению доступ к его аккаунту. За неделю до окончания времени жизни токена приложение попытается его обновить с помощью токена для обновления. Если время жизни истекло, то программа запросит новый токен.

# Команды
- `push [repo] [crypt]` - Отправка данных на сервер. Если указан параметр `repo`, то без взятия сделанных изменений из текущего репозитория. Если указан параметр `crypt`, то на сервер отправятся зашифрованные данные.
- `pull [repo] [crypt]` - Получение данных с сервера. Если указан параметр `repo`, то без внесения изменений в текущий репозиторий. Если указан параметр `crypt`, то после получения данные расшифруются.
- `list` - Вывести список репозиториев на сервере
- `clone <project> <repo> [crypt]` - Загрузить и клонировать репозиторий `<repo>` из проекта `<project>` с сервера. Если указан параметр `crypt`, то после получения данные расшифруются.
- `clear` - Удалить локальную копию репозитория
- `clear-all` - Удалить локальные копии всех репозиториев
- `url <url>` - Обработка URL схемы `git-back://`