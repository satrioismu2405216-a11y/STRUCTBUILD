@echo off
title Membuka StructBuild di Google Chrome...
echo ========================================================
echo   Membuka Website Pembelajaran Statika Bangunan SMK TKP
echo   Platform: StructBuild
echo ========================================================
echo.

set "HTML_PATH=%~dp0index.html"

:: 1. Cek Google Chrome di Program Files
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo Menjalankan via Google Chrome...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "file:///%HTML_PATH%"
    exit /b
)

:: 2. Cek Google Chrome di Program Files (x86)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo Menjalankan via Google Chrome (x86)...
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "file:///%HTML_PATH%"
    exit /b
)

:: 3. Cek Google Chrome di Local AppData
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    echo Menjalankan via Google Chrome User Data...
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "file:///%HTML_PATH%"
    exit /b
)

:: 4. Fallback ke browser default sistem
echo Membuka di browser default...
start "" "%HTML_PATH%"
exit /b
