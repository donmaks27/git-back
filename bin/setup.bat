@ECHO OFF
chcp 1251

ECHO Регистрация схемы...

REG ADD "HKCU\SOFTWARE\Classes\git-back" /ve /t REG_SZ /d "URL:git-back" /f
REG ADD "HKCU\SOFTWARE\Classes\git-back" /v "URL Protocol" /t REG_SZ /d "" /f
REG ADD "HKCU\SOFTWARE\Classes\git-back\shell\open\command" /ve /t REG_EXPAND_SZ /d "D:\Projects\donmaks\git-back\bin\url.bat %%1" /f

ECHO Добавление в PATH...

IF "%GIT_BACK%"=="" (
    SETX GIT_BACK %~dp0
    SETX Path "%Path%;%%GIT_BACK%%"
) else (
    SETX GIT_BACK %~dp0
)