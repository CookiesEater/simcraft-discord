Discord bot for [SimulationCraft](https://simulationcraft.org)
=====

1. Create docker-compose.yml, by example use docker-compose.example.yml and fill necessary fields
2. Build simcraft docker image by run:

```
docker build -t cookieseater/simcraft github.com/CookiesEater/simcraft-docker
```

3. Create 2 data volumes:

```
docker volume create --name=simcraft-data
docker volume create --name=simcraft-reports
```

4. Start by command "docker-compose up -d"
