# Online shop Application

This is a Node.js application for managing products. It allows administrators to add, edit products, manage user authentication, handle checkout operations with Stripe, and send emails for signup confirmation and password reset. It also includes error handling for common HTTP status codes, pagination for product listing, generates a PDF file for the checkout, provides cart operations, manages orders, handles user registration and password reset, manages products, validates user and product information, uses Express.js as the web framework, EJS as the view engine, and sessions for storing user data.

## Installation

First, clone the repository to your local machine:

`git clone git@github.com:ibrahimahmed237/Online-shop.git`

Then, navigate to the project directory and install the dependencies:

```bash
npm install
```

## Usage

To start the application, run:

```bash
npm start
```
## Configuration

The application requires several environment variables to be set in order to run properly. These can be set in a `.env` file in the root directory of the project. Here are the required variables, add them to your `.env` file:

- **PORT:** The port number the API will listen on.
- **MONGODB_URL:** The connection URL for the MongoDB database.
- **STRIPE_SECRET_KEY:** (Your Stripe secret key here)

## Features

- **User Registration and Authentication:**
  - Users can securely register with their name, email, and password.
  - Robust authentication with password hashing ensures user security.

- **Password Management:**
  - Password reset functionality for users who forget their passwords.
  - Email confirmation upon successful signup.

- **Product Management:**
  - Administrators can effortlessly add and edit products, ensuring a dynamic product catalog.
  - Product information is thoroughly validated to maintain data integrity.

- **Image Handling:**
  - Support for product image uploads in popular formats (.jpg, .jpeg, .png, .bmp).
  - Utilizes Sharp for converting and optimizing images.

- **Cart Operations and Checkout:**
  - Seamless cart management for users, including adding products and reviewing cart items.
  - Secure checkout operations facilitated by integration with Stripe.

- **Order Management:**
  - Users can place orders, each containing detailed information about products and user data.

- **PDF Generation:**
  - Generates PDF files for checkout, enhancing user documentation.

- **Error Handling and Notifications:**
  - Custom error pages for 404 (Page Not Found) and 500 (Internal Server Error) status codes.
  - Flash messages for effective user notifications.

- **Security Measures:**
  - Implements CSRF protection for enhanced security.
  - Utilizes bcrypt for password hashing.

- **Technological Stack:**
  - Developed using Express.js as the web framework.
  - EJS employed as the view engine.
  - MongoDB for session storage.
  - Incorporates various dependencies for tasks such as email handling, image processing, and more.

## Dependencies

- Express.js: For handling server and routes.
- bcrypt: For hashing passwords and ensuring user security.
- nodemailer: For sending emails.
- Multer: For handling multipart/form-data, which is primarily used for uploading files.
- Sharp: For converting large images in common formats to smaller, web-friendly JPEG, PNG and WebP images of varying dimensions.
- Stripe: For handling secure checkout operations.
- Mongoose: For modeling and managing application data.
- Joi: For validating user and product information.
- connect-mongodb-session: For MongoDB session storage.
- csurf: For CSRF protection.
- connect-flash: For flash messages.
- EJS: For the view engine.
- express-session: For handling sessions.
- Other dependencies...

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

