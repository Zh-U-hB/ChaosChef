@echo off
chcp 65001 > nul
title Chaos Chef
echo.
echo  =====================================
echo   Chaos Chef - 启动中...
echo  =====================================
echo.

cd /d "%~dp0"

:: 检查 node_modules
if not exist "node_modules" (
  echo [1/2] 安装依赖...
  npm install
  echo.
)

:: 检查数据库
if not exist "dev.db" (
  echo [初始化] 生成数据库...
  npx prisma migrate deploy
  npx prisma db seed
  echo.
)

:: 清理旧缓存
if exist ".next" (
  echo [清理] 清除旧缓存...
  rmdir /s /q ".next"
)

:: 延迟后打开浏览器
start "" /b cmd /c "timeout /t 3 /nobreak > nul && start http://localhost:3000"

echo [启动] 服务器运行在 http://localhost:3000
echo [提示] 按 Ctrl+C 可以停止服务器
echo.

npm run dev
