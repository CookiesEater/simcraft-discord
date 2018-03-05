Discord bot for [simulationcraft](https://simulationcraft.org)
===========
1. Create docker-compose.yml, by example use docker-compose.example.yml and fill necessary fields
2. Clone https://github.com/CookiesEater/simcraft-docker and build it by run "build.sh"
3. Create 2 data volumes by commands:
```
docker volume create --name=simcraft-data
docker volume create --name=simcraft-reports
```
4. Start by command "docker-compose up -d"
