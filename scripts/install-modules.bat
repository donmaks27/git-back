@ECHO OFF
chcp 1251

SET dirFirst=%CD%
cd %~dp0
cd ..

npm i

cd %dirFirst%