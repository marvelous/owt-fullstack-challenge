# Web-App Fullstack Challenge

This application is OWT's `Boat App`.

## Development

To run the application locally, use 2 terminals:

1. Start the backend: `./gradlew :backend:bootRun`

2. Start the frontend: `cd frontend && npm install && npm run start`

This will also open the app in your browser.

## Building

Run `./gradlew build && docker compose build`

## Running

Run `docker compose up` and open the app http://localhost:8080/

## Curling

* Extract the OpenAPI schema: `curl http://localhost:8080/api/v3/api-docs --user admin:hunter2 >api-docs.json`
* Insert some data: `curl http://localhost:8080/api/boats --user admin:hunter2 --header 'Content-Type: application/json' --data '{"name": "Boaty McBoatface", "description": "TODO"}'`
* Read it back: `curl http://localhost:8080/api/boats --user admin:hunter2`
* Update it: `curl http://localhost:8080/api/boats/1 --request PATCH --user admin:hunter2 --header 'Content-Type: application/json' --data '{"description": "Autonomous underwater vehicle (AUV) used for scientific research carried on the RRS Sir David Attenborough"}'`
* Delete it: `curl http://localhost:8080/api/boats/1 --request DELETE --user admin:hunter2`

## Limitations

* Uncaught frontend exceptions are not reported to the user
* There are no tests
* UI is awful
* Authentication is hard-coded
* There is no continuous integration
