@echo off
echo Starting rebuild process...

echo 1. Creating backup of package.json and webpack.config.js
copy package.json package.json.bak
copy webpack.config.js webpack.config.js.bak

echo 2. Renaming webpack.config.new.js to webpack.config.js
copy webpack.config.new.js webpack.config.js

echo 3. Creating a temporary build directory
md ..\frontend-rebuild
xcopy package.json ..\frontend-rebuild\
xcopy webpack.config.js ..\frontend-rebuild\
xcopy src\*.* ..\frontend-rebuild\src\ /E /H /C /I

echo 4. Moving to rebuild directory and installing dependencies
cd ..\frontend-rebuild
npm install

echo 5. Running test build
npm run build

echo 6. If successful, you can now run: cd ..\frontend-rebuild && npm start
echo Rebuild process completed. 