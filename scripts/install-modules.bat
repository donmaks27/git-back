@ECHO OFF
chcp 1251

SET dirFirst=%CD%
cd %~dp0
cd ..

npm i || ECHO ѕохоже, у вас не установлен Node.js. ”становить его и запустите скрипт еще раз (либо 'install-modules.sh', если остальное прошло без ошибок)

cd %dirFirst%