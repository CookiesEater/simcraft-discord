FROM nodesource/xenial:latest

MAINTAINER Alexey Shishkov <cookies.eater.03@gmail.com>

RUN apt-get update && apt-get -y install docker.io gettext-base
RUN npm install pm2 -g && pm2 install pm2-logrotate && pm2 set pm2-logrotate:retain 10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install

EXPOSE 80 443

CMD [ "pm2-docker", "start", "--auto-exit", "--env", "production", "ecosystem.json" ]
