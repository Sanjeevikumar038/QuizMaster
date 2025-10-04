@echo off
echo Running email_logs table migration...

REM Replace these with your actual database connection details
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=quiz_system
set DB_USER=root
set DB_PASSWORD=your_password

REM Run the SQL migration
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < email_logs_table.sql

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
) else (
    echo Migration failed. Please check your database connection and credentials.
)

pause