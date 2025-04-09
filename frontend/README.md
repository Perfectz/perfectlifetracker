# Perfect LifeTracker Pro Frontend

This project was bootstrapped with [Vite](https://vitejs.dev/).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner using Vitest.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm run preview`

Locally preview the production build.

## Docker Support

The project includes a Dockerfile and can be run using Docker:

```bash
# Build the Docker image
docker build -t perfectltp-frontend .

# Run the container
docker run -p 3000:3000 perfectltp-frontend
```

You can also use docker-compose:

```bash
docker-compose up
```

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).
