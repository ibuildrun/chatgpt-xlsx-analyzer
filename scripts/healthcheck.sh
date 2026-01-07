#!/bin/bash
# Healthcheck script for ai.ibuildrun.ru
# Add to crontab: */5 * * * * /var/www/u3370847/data/www/ai.ibuildrun.ru/scripts/healthcheck.sh >> /var/www/u3370847/data/logs/healthcheck.log 2>&1

export NVM_DIR=/var/www/u3370847/data/.nvm
source $NVM_DIR/nvm.sh
nvm use 20 > /dev/null 2>&1

APP_NAME="ai-chat"
APP_DIR="/var/www/u3370847/data/www/ai.ibuildrun.ru"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# Check if PM2 process is running
if ! pm2 show $APP_NAME > /dev/null 2>&1; then
    echo "$LOG_PREFIX PM2 process $APP_NAME not found, starting..."
    cd $APP_DIR
    PORT=3000 pm2 start npm --name $APP_NAME -- start
    pm2 save
    echo "$LOG_PREFIX Started $APP_NAME"
    exit 0
fi

# Check if process is online
STATUS=$(pm2 show $APP_NAME | grep "status" | awk '{print $4}')
if [ "$STATUS" != "online" ]; then
    echo "$LOG_PREFIX Process $APP_NAME is $STATUS, restarting..."
    pm2 restart $APP_NAME
    pm2 save
    echo "$LOG_PREFIX Restarted $APP_NAME"
    exit 0
fi

# Check if app responds on localhost
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://127.0.0.1:3000/api/threads)
if [ "$HTTP_CODE" != "200" ]; then
    echo "$LOG_PREFIX App not responding (HTTP $HTTP_CODE), restarting..."
    pm2 restart $APP_NAME
    pm2 save
    echo "$LOG_PREFIX Restarted $APP_NAME"
    exit 0
fi

# All good
echo "$LOG_PREFIX OK - $APP_NAME is running and responding"
