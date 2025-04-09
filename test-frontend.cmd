@echo off
REM Batch script to test the frontend project
REM Usage: test-frontend.cmd [NODE_PATH]

echo ======================================
echo Testing Frontend Project
echo ======================================

set NODE_DIR=%~1
echo Node.js directory: %NODE_DIR%
echo Current directory: %CD%

cd frontend
echo Changed to directory: %CD%

echo.
echo Applying test fix patch...
if exist "..\test-fix.patch" (
    type "..\test-fix.patch" | git apply -
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Failed to apply test patch, continuing anyway...
    ) else (
        echo Successfully applied test patch
    )
) else (
    echo WARNING: Test patch file not found, continuing anyway...
)

echo.
echo Running npm test...
call "%NODE_DIR%\npm.cmd" test
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm test failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo Frontend tests completed successfully
echo ====================================== 