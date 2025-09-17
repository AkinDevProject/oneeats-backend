@echo off
echo "Starting Quarkus without tests..."

set JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.2\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

rem Remove test directory temporarily to avoid compilation issues
ren src\test src\test_disabled

rem Start Quarkus in dev mode
call mvnw.cmd quarkus:dev

rem Restore test directory
ren src\test_disabled src\test

pause