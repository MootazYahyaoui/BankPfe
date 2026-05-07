# BankPfe

Simple banking project with:
- Spring Boot microservices (backend)
- Angular dashboard (frontend)
- MySQL (XAMPP) local database

## Run Backend (local profile)

Open one terminal per service:

```bash
cd authentication-service
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

```bash
cd customer-service
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

```bash
cd account-service
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

```bash
cd notification-service
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

## Run Frontend

```bash
cd front
npm install
npm start
```

Open: `http://localhost:4200`

## Default Admin

- Username: `admin`
- Password: `fedi123`

## Local URLs

- Auth: `http://localhost:8885/bank`
- Customer: `http://localhost:8886/bank`
- Account: `http://localhost:8887/bank`
- Notification: `http://localhost:8889/bank`