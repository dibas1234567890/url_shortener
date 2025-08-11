---

### Introduction 

A simple url shortener app using Python, FastAPI, & Next with Mongo! Handles multiple urls at once, simple lookup logic aired with keygen. 

### Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

* [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.
* Python 3.11
* Node

#### Installation

1. **Clone the repository:**
   **Bash**

   ```
   git clone https://github.com/dibas1234567890/url_shortener
   cd url_shortener
   ```
2. **Create `.env` files:**
   Create a `.env` file in both the `backend` and `frontend` directories.

   * **Backend `.env`**
     **Ini, TOML**

     ```
     MONGO_URI=
     DB_NAME=
     SECRET_KEY=
     ACCESS_TOKEN_EXPIRE_MINUTES=
     ```
   * **Frontend `.env`**
     **Ini, TOML**

     ```
     NEXT_PUBLIC_FASTAPI_URL=http://localhost:8500
     API_BASE_URL=http://localhost:8500
     NEXT_PUBLIC_API_BASE_URL=http://localhost:8500
     NEXT_PUBLIC_API_URL=http://localhost:8500
     ```

     The Docker Compose file will override this with the internal Docker network URL.
3. **Run the application with Docker Compose:**
   **Bash**

   ```
   docker-compose up --build
   ```

   This command will build the Docker images for your backend and frontend and start all services.

#### Usage

Once the services are running, you can access the application:

* **Frontend** : Navigate to `http://localhost:3100` in your web browser.
* **Backend API Docs** : You can view the FastAPI documentation at `http://localhost:8500/docs`.

### Folder Structure

```
├── backend
│   └── src
│       ├── url_shortener_app
│       │   ├── api
│       │   │   └── v1
│       │   │       └── __pycache__
│       │   ├── core
│       │   │   └── __pycache__
│       │   ├── logging_
│       │   │   └── __pycache__
│       │   ├── models
│       │   │   └── __pycache__
│       │   ├── __pycache__
│       │   ├── schema
│       │   │   └── __pycache__
│       │   ├── url_shortener_utils
│       │   └── utils
│       │       └── __pycache__
│       └── url_shortener.egg-info
├── frontend
│   ├── app
│   │   ├── api
│   │   │   └── v1
│   │   │       └── shortener
│   │   │           └── [secret_key]
│   │   ├── dashboard
│   │   ├── login
│   │   └── register
│   ├── components
│   │   └── ui
│   ├── hooks
│   ├── lib
│   ├── public
│   ├── styles
│   └── url-shortener-frontend
└── image
    └── README
```
