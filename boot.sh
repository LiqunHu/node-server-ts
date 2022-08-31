#!/bin/bash
docker kill testdb testredis
docker rm testdb testredis 
docker run --rm -p 0.0.0.0:3306:3306 --name testdb -v $PWD/mysql/logs:/logs -v $PWD/mysql/data:/var/lib/mysql -e TZ=Asia/Shanghai -e MYSQL_ROOT_PASSWORD=123456 -d mysql:8.0
docker run --rm -p 127.0.0.1:16379:6379 --name testredis -v $PWD/redis-data:/data -d redis:7.0 redis-server --appendonly yes
