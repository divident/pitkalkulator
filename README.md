#  PITKALKULATOR

![Pitkalkulator](./client/public/favicon.png "Pitkalkulator")


Pitkalkulator jest aplikacją, której zadaniem jest ułatwienie rozliczania podatku od zysków giełdowych, uzyskanych na platformie Revolut.

Aplikacja została wykonana z wykorzystaniem REST API, napisanego z wykorzystaniem biblioteki [flask](https://flask.palletsprojects.com/en/1.1.x/). Do prezentowania danych w przeglądarce klienta została użyta biblioteka [nextjs](https://nextjs.org/)

### Uruchomienie aplikacji

#### Środowisko developerskie

W celu uruchomienia aplikacji w środowisku developerskim, należy najpierw zainstalować zależności z użyciem następujących poleceń
```
# REST API
pip install -r requirements.txt

# nextjs
npm install
```

Następnie należy uruchomić obie aplikacje
```
# REST API
python app.py

# Migracja bazy danych, tylko przy pierwszym uruchomieniu
flask db upgrade

# nextjs
npm run dev
```

#### Środowisko produkcyjne
Do uruchomienia w środowiska produkcyjnego konieczne jest zainstowanie [Docker](https://www.docker.com/) oraz [Docker Compose](https://docs.docker.com/compose/install/), uruchomienie odbywa się za pomocą komendy.
```
docker-compose up -d

# Migracja bazy danych, tylko przy pierwszym uruchomieniu
docker exec -i <nazwa_kontenera_aplikacji> flask db upgrade 

```

Środowisko produkcyjne jest wymagane dla poprawnego działania liczb `Decimal`, ponieważ testowa baza danych sqlite nie posiada wsparcia dla nich.

### Testowanie
Warstwa kliencka nie posiada obecnie testów (nextjs)

Dla REST API testy znajdują się w pliku `test.py`, uruchomić je można komendą 
```
python test.py
```

Niestety testowe zestawienia operacji, znajdujące się w folderze `test_data`, zostały usunięte, ponieważ zawierają one dane personalne. Dla pełnego uruchamia testów, należy wrzucić do `test_data` posiadane raporty.
