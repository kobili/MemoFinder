# MemoFinder

[Wiki](https://github.students.cs.ubc.ca/CPSC410-2022W-T1/Project2Group2/wiki)

[Milestones](https://github.students.cs.ubc.ca/CPSC410-2022W-T1/Project2Group2/wiki/Milestones)

## Installing all dependencies

you must have at least Python Version 3.9

run the following command in the root directory of the repository:

```bash
yarn install:all
```

you can also run `yarn install` in each of the individual directories

## Linting the project

run the following command in the root directory of the repository:

```bash
yarn lint
```

you can also run `yarn lint` in each of the individual directories

## Running the backend

in the `./backend` directory run the command:

```bash
yarn start
```

## Running the frontend

in the `./frontend` directory run the command;

```bash
yarn start
```

NOTE: If you run into issues with eslint asking you to delete `CR` then simply run `yarn lint` in the `./frontend`
directory and try starting the frontend once again

## Testing the backend

in the `./backend` directory run the command:

```bash
yarn test
```

to run all tests

## Integration Testing

For integration testing, we use Cypress. Before running the tests, make sure the backend is running.

```bash
cd ./backend
yarn start
cd ../frontend
yarn cy:run # runs tests in headless mode (terminal)
yarn cy:open # runs tests in interactive mode (GUI)
```

See a run of the tests [here](./frontend/cypress/videos/app.cy.tsx.mp4). You may need to download the video to view it.
