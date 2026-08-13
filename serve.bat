@echo off
rem One-click launcher for the astro-cal static server.
start "" http://127.0.0.1:8124/
node "%~dp0serve.cjs"
