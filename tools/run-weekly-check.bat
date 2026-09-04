@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"
set "LOG_DIR=%PROJECT_ROOT%\logs"
set "LOG_FILE=%LOG_DIR%\update-check.log"
set "PYTHONUTF8=1"
set "PYTHONUNBUFFERED=1"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>&1
if not exist "%LOG_DIR%" exit /b 1

if not exist "%LOG_FILE%" goto choose_python
for %%I in ("%LOG_FILE%") do set "LOG_SIZE=%%~zI"
if not defined LOG_SIZE goto choose_python
if %LOG_SIZE% LSS 5242880 goto choose_python
if exist "%LOG_FILE%.1" del /q "%LOG_FILE%.1"
move /y "%LOG_FILE%" "%LOG_FILE%.1" >nul

:choose_python
>>"%LOG_FILE%" echo ============================================================
>>"%LOG_FILE%" echo Run start: %DATE% %TIME%

cd /d "%PROJECT_ROOT%"
if errorlevel 1 goto project_error

if exist "%PROJECT_ROOT%\.venv\Scripts\python.exe" goto use_venv
where py >nul 2>&1
if not errorlevel 1 goto try_py
where python >nul 2>&1
if not errorlevel 1 goto try_python
goto python_error

:use_venv
set "PYTHON_LAUNCH="%PROJECT_ROOT%\.venv\Scripts\python.exe""
set "PYTHON_ENTRY=.venv\Scripts\python.exe"
goto run_check

:try_py
py -3 -c "import sys" >nul 2>&1
if errorlevel 1 goto try_python_path
set "PYTHON_LAUNCH=py -3"
set "PYTHON_ENTRY=py -3"
goto run_check

:try_python_path
where python >nul 2>&1
if errorlevel 1 goto python_error

:try_python
python -c "import sys; raise SystemExit(0 if sys.version_info.major == 3 else 1)" >nul 2>&1
if errorlevel 1 goto python_error
set "PYTHON_LAUNCH=python"
set "PYTHON_ENTRY=python"
goto run_check

:run_check
>>"%LOG_FILE%" echo Python entry: %PYTHON_ENTRY%
%PYTHON_LAUNCH% --version >>"%LOG_FILE%" 2>&1
%PYTHON_LAUNCH% tools\check-updates.py %* >>"%LOG_FILE%" 2>&1
set "CHECK_EXIT=%ERRORLEVEL%"
>>"%LOG_FILE%" echo Script exit status: %CHECK_EXIT%
>>"%LOG_FILE%" echo Run end: %DATE% %TIME%
exit /b %CHECK_EXIT%

:project_error
>>"%LOG_FILE%" echo ERROR: Could not switch to project root: %PROJECT_ROOT%
>>"%LOG_FILE%" echo Script exit status: 1
>>"%LOG_FILE%" echo Run end: %DATE% %TIME%
exit /b 1

:python_error
>>"%LOG_FILE%" echo ERROR: Python 3 was not found. Checked .venv, py -3, and python.
>>"%LOG_FILE%" echo Script exit status: 1
>>"%LOG_FILE%" echo Run end: %DATE% %TIME%
exit /b 1
