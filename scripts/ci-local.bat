@echo off
REM =============================================================================
REM OneEats - Script CI Local (Windows Batch)
REM =============================================================================
REM Usage: ci-local.bat [options]
REM Options:
REM   --quick             Mode rapide (lint + unit tests seulement)
REM   --skip-integration  Sans tests d'integration
REM   --skip-mobile       Sans tests mobile
REM =============================================================================

setlocal

REM Configuration Java et Maven
set JAVA_HOME=C:\Users\akin_\.jdks\corretto-21.0.8
set M2_HOME=C:\Users\akin_\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%

REM Parser les arguments
set QUICK=
set SKIP_INTEGRATION=
set SKIP_MOBILE=

:parse_args
if "%~1"=="" goto run
if /i "%~1"=="--quick" set QUICK=-Quick
if /i "%~1"=="--skip-integration" set SKIP_INTEGRATION=-SkipIntegration
if /i "%~1"=="--skip-mobile" set SKIP_MOBILE=-SkipMobile
shift
goto parse_args

:run
echo.
echo ==========================================
echo   OneEats - Pipeline CI Locale
echo ==========================================
echo.

REM Lancer le script PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0ci-local.ps1" %QUICK% %SKIP_INTEGRATION% %SKIP_MOBILE%

exit /b %ERRORLEVEL%
