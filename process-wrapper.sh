#!/bin/sh
nginx
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start nginx: $status"
  exit $status
fi

# Start the first process
gunicorn -w 3 -b 127.0.0.1:4000 app:app --daemon --timeout 300 --error-logfile pitkalkulator-error.log
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start api: $status"
  exit $status
fi

# Start the second process
cd ./client
pm2-runtime npm -- start
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start nextjs: $status"
  exit $status
fi

cd ..
# Naive check runs checks once a minute to see if either of the processes exited.
# This illustrates part of the heavy lifting you need to do if you want to run
# more than one service in a container. The container exits with an error
# if it detects that either of the processes has exited.
# Otherwise it loops forever, waking up every 60 seconds

while sleep 60; do
  ps aux |grep gunicorn |grep -q -v grep
  PROCESS_1_STATUS=$?
  ps aux |grep pm2-runtime |grep -q -v grep
  PROCESS_2_STATUS=$?
  ps aux |grep nginx |grep -q -v grep
  PROCESS_3_STATUS=$?
  # If the greps above find anything, they exit with 0 status
  # If they are not both 0, then something is wrong
  if [ $PROCESS_1_STATUS -ne 0 -o $PROCESS_2_STATUS -ne 0 -o $PROCESS_3_STATUS -ne 0 ]; then
    echo "One of the processes has already exited."
    exit 1
  fi
done