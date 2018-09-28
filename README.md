# Тестовое задание Innervate#

### Setup 
```sh
$ git submodule init
$ git submodule update
$ npm i
```
```sh
$ docker run --name postgres --rm -itd \
  --env 'DB_USER=test' --env 'DB_PASS=12345' \
  --env 'DB_NAME=postgres' \
  -v $(pwd)/db/dump.sql:/var/lib/postgresql/dump.sql \
  -p 5432:5432 \
  sameersbn/postgresql:10
  
  docker exec postgres runuser -l  postgres -c 'psql postgres < dump.sql'
```

```sh
$ npm run server
```

### API

Получение списка пользователей с возможной фильтрацией
```
query A {
  test {
    users(<search:(string)> || <manager:(bool)> || <blocked:(bool)>) {
      user_id
      login
      name
      email
      manager
      blocked
      birthday
    }
  }
}
```

Авторизация
```
mutation {
  test {
    auth(login:"user", password_hash:"b7a8e73e6a45795a6437266d0c48ea73") {
      success
    }
  }
}
```