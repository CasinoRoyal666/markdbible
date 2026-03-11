# MarkDBible - your knowledge base in Markdown format

## Backend Server
To start a backend server you need to deploy a docker container with PostgreSQL database.
You can see that there is a `docker-compose.yml` file in the root directory.
From root directory type bash command
```bash
docker-compose up -d
```
or
```bash
docker compose up -d
```
Next, create an `.env` file in `backend/` and copy text `.env.example`. You can change properties if you want so
## How to run backend tests
From the `backend/` folder you can run following commands:
1) To run all tests
```bash
pytest
```
2) To run all tests with coverage report
```bash
pytest --cov=notes
```
3) To run all tests with coverage HTML report
```bash
pytest --cov=notes --cov-report=html
```