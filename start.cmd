@echo off
REM Convenience wrapper so start.ps1 can be double-clicked or run from cmd.exe.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
