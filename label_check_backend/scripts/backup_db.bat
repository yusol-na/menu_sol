@echo off
set STAMP=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%%TIME:~3,2%
set OUT=backups\inquiry2_%STAMP%.sql

if not exist backups mkdir backups
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% > %OUT%
echo Backup done: %OUT%