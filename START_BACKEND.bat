@echo off
title BACKEND SERVER DAPOER BERKAH UMKM (Port 5000)
color 0A
cls
echo ======================================================================
echo      SERVER BACKEND DAPOER BERKAH UMKM (EXPRESS + MYSQL AIVEN)
echo ======================================================================
echo.

:: Menghubungkan port 5000 langsung ke LDPlayer dan Android Emulator
if exist "C:\LDPlayer\LDPlayer14\adb.exe" (
    "C:\LDPlayer\LDPlayer14\adb.exe" reverse tcp:5000 tcp:5000 >nul 2>&1
    echo [OK] Jalur port 5000 ke LDPlayer berhasil dihubungkan (adb reverse)!
)
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000 >nul 2>&1
    echo [OK] Jalur port 5000 ke Android SDK Emulator berhasil dihubungkan!
)

echo [OK] Memulai server Express.js di http://localhost:5000...
echo.
echo **********************************************************************
echo  PENTING:
echo  JANGAN TUTUP JENDELA INI selagi Anda menjalankan aplikasi mobile!
echo  Jika jendela ini ditutup, aplikasi mobile tidak bisa terhubung.
echo **********************************************************************
echo.
cd /d "%~dp0backend"
npm run dev
pause
