# Centos搭建WebServer

本文记录下我的博客服务器环境配置的过程，
我是用vuepress写的博客，完成后把构建后的代码放到阿里云服务器上，再加上域名解析和nginx的设置，就可以正常访问了， 

作为这一切的基础，我们先要有一台服务器，我这里选择的是Centos。


## 安装Docker
因为考虑到后续可能会安装更多的Server比如nodejs，为了保持扩展性和应用的隔离，所以我首先安装了Docker

```
yum install -y yum-utils
yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
yum install docker-ce docker-ce-cli containerd.io docker-compose -y
```

### 添加自启动
```
systemctl start docker
systemctl enable docker
```

### 添加环境变量
这一步是为了把docker容器相关的文件都组织在一个文件夹下，并且后续可能多次用到，所以我们先定义一个环境变量，这里你可以改成自己的目录，甚至不需要

```
export DOCKER_FILES="/var/docker_container_files"
```

## 安装Nginx
```
cd DOCKER_FILES
mkdir nginx
docker container run \
  -d \
  --rm \
  --name nginx \
  nginx

docker container cp nginx:/etc/nginx/ "$DOCKER_FILES/nginx/conf/"

mv $DOCKER_FILES/nginx/conf/nginx/* $DOCKER_FILES/nginx/conf/

docker container stop nginx

docker container run \
  -d \
  -p 80:80 \
  -p 443:443 \
  --name nginx \
  --restart always \
  --volume "$DOCKER_FILES/nginx/www":/usr/share/nginx/html \
  --volume "$DOCKER_FILES/nginx/conf":/etc/nginx \
  nginx
```
## 设置防火墙
网站服务器在运行的过程中需要监听80(http)和443(https)端口，所以我们的防火墙需要对这两个端口放行，需要注意的是阿里云或者腾讯云的后台管理界面中也有一个防火墙，所以也要把需要放行的端口号加进去
```
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --reload
```
正常情况下这个时候你已经可以用ip访问Nginx服务器了,到这里一个博客的静态服务器已经搭建完成了，

为了让同步代码更加方面，我还安装Rsync 作为同步的工具
## 安装 Rsync
```
yum install rsync -y
vi /etc/rsyncd.conf
```
```
[www]
    uid = nginx
    gui = nginx
    path = /var/docker_container_files/nginx/www
    comment = website
    auth users = rsyncwww
    secrets file = /etc/rsync/rsync.pas
    read only = false
```

```
vi /etc/rsync/rsync.pas

```
在文件中填写 rsyncwww:PASSWORD

PASSOWRD替换为你的密码

```
chmod 600 rsync.pas
systemctl start rsyncd
systemctl enable rsyncd

```
由于rsync 同步用到了873端口，所以我们需要设置防火墙对873端口放行
```
firewall-cmd --zone=public --add-port=873/tcp --permanent
firewall-cmd --reload
```

