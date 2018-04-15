#!/bin/bash

cd `dirname $0` && cd ..
if `npm > /dev/null`
then
    echo "  Похоже, у вас не установлен Node.js. Установить его и запустите скрипт еще раз (либо 'install-modules.sh', если остальное прошло без ошибок)"
else
    npm i
fi