@ECHO OFF
chcp 1251

SET dirFirst=%CD%
cd %~dp0
cd ..

npm i || ECHO ������, � ��� �� ���������� Node.js. ���������� ��� � ��������� ������ ��� ��� (���� 'install-modules.sh', ���� ��������� ������ ��� ������)

cd %dirFirst%