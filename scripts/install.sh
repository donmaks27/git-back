#!/bin/bash

cd `dirname $0` && cd ../src
dir=`pwd`

dirApp=~/.local
if [[ $EUID -eq 0 ]]
then
    dirApp=/usr
else
    dirLocalApp=

    if [ ! -d "$dirApp/local/bin/" ]
    then
        echo "Добавление в PATH..."

        mkdir -p $dirApp/local/bin/
        echo 'export PATH="'$dirApp'/local/bin/:$PATH"' >> ~/.bashrc

        echo "  Пути добавленны в PATH, изменения вступят в силу после выхода из системы или перезагрузки"
    fi
fi

fileIcon=$dirApp/local/bin/git-back
fileDesktop=$dirApp/share/applications/git-back-url.desktop

echo "  Создание ярлыков..."

touch $fileIcon
echo '#!/bin/bash' > $fileIcon
echo 'node '$dir'/app $1 $2 $3 $4 $5' >> $fileIcon
chmod 755 $fileIcon

touch $fileDesktop
echo '[Desktop Entry]' > $fileDesktop
echo 'Name=GIT-BASK Protocol Handler' >> $fileDesktop
echo 'Exec=node '$dir'/app url %u' >> $fileDesktop
echo 'Terminal=false' >> $fileDesktop
echo 'Type=Application' >> $fileDesktop
echo 'MimeType=x-scheme-handler/git-back' >> $fileDesktop
echo 'Categories=Network;Application;' >> $fileDesktop
chmod 755 $fileDesktop

echo "  Добавление обработчика схемы..."

xdg-mime default git-back-url.desktop x-scheme-handler/git-back

echo "  Установка модулей..."

cd ..
scripts/install-modules.sh