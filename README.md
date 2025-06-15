# Meta Agency React Application

This project is a React application for the Meta Agency, featuring a public-facing website and a protected admin dashboard. It includes features like light/dark mode, routing, and user authentication.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: It is recommended to use the latest LTS version. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm** (Node Package Manager): npm is distributed with Node.js.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/haziqdafren/metaAgency.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd metaAgency
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

This project uses Supabase for its backend. You need to create a `.env` file in the root of the project to store your Supabase credentials.

1.  Create a file named `.env` in the root directory of your project.
2.  Add the following lines to the `.env` file, replacing the placeholder values with your actual Supabase URL and API Key:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

    *   You can find your Supabase URL and `anon` key in your Supabase project settings under `API`.

### Running the Application

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Admin Access

For testing purposes, a dummy admin user is available:

*   **Email:** `admin@metaagency.id`
*   **Password:** `admin123`

You can log in via the Login page and will be redirected to the admin dashboard.

## Features

*   **Public Pages:** About Us, Services, Login, Join, Contact, Articles.
*   **Admin Dashboard:** Protected route with a dedicated sidebar layout.
*   **Light/Dark Mode:** Toggle theme for a modern user experience, persistent via local storage.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
