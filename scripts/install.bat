@ECHO OFF
chcp 1251

SET dirFirst=%CD%
cd %~dp0
cd ..
SET dirApp=%CD%
cd %dirFirst%

ECHO ���������� � PATH...

IF "%GIT_BACK%"=="" (
    SETX GIT_BACK "%dirApp%"
    SETX Path "%Path%;%%GIT_BACK%%\bin"
) else (
    SETX GIT_BACK "%dirApp%"
)
ECHO ���� ���������� � PATH, ��������� ������� � ���� ����� ������������

ECHO �������� �������...

IF NOT EXIST "%dirApp%\bin" MKDIR "%dirApp%\bin"
ECHO @ECHO OFF > "%dirApp%\bin\git-back.bat"
ECHO node %dirApp%\src\app %%1 %%2 %%3 %%4 >> "%dirApp%\bin\git-back.bat"

ECHO ����������� �����...

REG ADD "HKCU\SOFTWARE\Classes\git-back" /ve /t REG_SZ /d "URL:git-back" /f
REG ADD "HKCU\SOFTWARE\Classes\git-back" /v "URL Protocol" /t REG_SZ /d "" /f
REG ADD "HKCU\SOFTWARE\Classes\git-back\shell\open\command" /ve /t REG_EXPAND_SZ /d "%dirApp%\scripts\git-back-url \"%%1\"" /f

ECHO ��������� �������...

%dirApp%\scripts\install-modules