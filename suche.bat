@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Aktuelles Verzeichnis merken
set "BASE_DIR=%CD%"

REM Durchsuche rekursiv alle .html, .js, .css Dateien
for /R %%F in (*.html *.js *.css  *.java *.xml *.properties) do (
    REM Hole Pfad der Datei
    set "FILE_DIR=%%~dpF"

    REM Prüfe, ob Datei im node_modules-Ordner liegt
    echo "%%~fF" | findstr /I /C:"\\node_modules\\" >nul
    if errorlevel 1 (
        REM Prüfe, ob Datei im aktuellen Verzeichnis liegt
        if /I not "!FILE_DIR!"=="%BASE_DIR%\\" (
            echo.
            echo --------------------------------------------------------------------------------
            echo Datei: %%~fF
            echo --------------------------------------------------------------------------------
            type "%%F"
            echo.
        )
    )
)

ENDLOCAL
pause
