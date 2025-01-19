# E-commerce Database Design

## Step 1: Identify Key Entities
For an e-commerce site, you might need the following entities:
1. **Users**: Information about customers and admin users.
2. **Products**: Details about items available for sale.
3. **Orders**: Tracks purchases made by users.
4. **Order Items**: Tracks individual items in an order (for handling multiple products in one order).
5. **Categories**: For organizing products.
6. **Reviews**: Feedback left by customers on products.
7. **Payments**: Information about transactions.

---

## Step 2: Define Attributes for Each Entity (structure changet litlebit, not edited, content before edited)

### 1. **Users Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| user_id            | INT (Primary Key)| Unique identifier for each user.     |
| name               | VARCHAR          | User's name.                         |
| email              | VARCHAR (Unique) | User's email address.                |
| password           | VARCHAR          | Hashed password for authentication.  |
| role               | ENUM ('customer', 'admin') | User role.                 |

### 2. **Products Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| product_id         | INT (Primary Key)| Unique identifier for each product.  |
| name               | VARCHAR          | Name of the product.                 |
| description        | TEXT             | Product description.                 |
| price              | DECIMAL          | Product price.                       |
| stock_quantity     | INT              | Number of items in stock.            |
| category_id        | INT (Foreign Key)| Links to the Categories table.       |

### 3. **Categories Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| category_id        | INT (Primary Key) | Unique identifier for each category.|
| name               | VARCHAR          | Name of the category.                |

### 4. **Orders Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| order_id           | INT (Primary Key)| Unique identifier for each order.    |
| user_id            | INT (Foreign Key)| Links to the Users table.            |
| order_date         | DATETIME         | Date and time of the order.          |
| total_amount       | DECIMAL          | Total cost of the order.             |

### 5. **Order Items Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| order_item_id      | INT (Primary Key)| Unique identifier for each item.     |
| order_id           | INT (Foreign Key)| Links to the Orders table.           |
| product_id         | INT (Foreign Key)| Links to the Products table.         |
| quantity           | INT              | Quantity of the product ordered.     |
| item_price         | DECIMAL          | Price of the product at the time.    |

### 6. **Reviews Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| review_id          | INT (Primary Key)| Unique identifier for each review.   |
| product_id         | INT (Foreign Key)| Links to the Products table.         |
| user_id            | INT (Foreign Key)| Links to the Users table.            |
| rating             | INT              | Rating out of 5.                     |
| comment            | TEXT             | User’s comment about the product.    |

### 7. **Payments Table**
| **Column Name**    | **Data Type**    | **Description**                      |
|--------------------|------------------|--------------------------------------|
| payment_id         | INT (Primary Key)| Unique identifier for each payment.  |
| order_id           | INT (Foreign Key)| Links to the Orders table.           |
| payment_date       | DATETIME         | Date and time of the payment.        |
| amount             | DECIMAL          | Total amount paid.                   |
| payment_method     | ENUM ('card', 'paypal', 'bank_transfer') | Payment method.|

---

## Step 3: Define Relationships
- **Users to Orders**: One-to-Many (One user can place multiple orders).
- **Orders to Order Items**: One-to-Many (One order can have multiple items).
- **Products to Categories**: Many-to-One (A product belongs to one category, but a category can have multiple products).
- **Products to Reviews**: One-to-Many (One product can have multiple reviews).
- **Orders to Payments**: One-to-One (Each order has one associated payment).

---

## Step 4: Create an ERD
Use tools like [ERDPlus](https://erdplus.com/), [Lucidchart](https://www.lucidchart.com/), or [dbdiagram.io](https://dbdiagram.io/) to visualize the tables and relationships.

---

## Step 5: Implement the Database
Use an RDBMS like **MySQL**, **PostgreSQL**, or **SQLite** to create the tables using SQL commands or a database migration tool in your backend framework.


## Step 5: Implement the Database
Use the following SQL script to create the database and tables:

```sql
CREATE DATABASE ecommerce_db;

-- Create Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN ('customer', 'admin')) NOT NULL
);

-- Create Categories table
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

-- Create Products table
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    stock_quantity INT NOT NULL,
    category_id INT REFERENCES Categories(category_id) ON DELETE SET NULL
);

-- Create Orders table
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL NOT NULL
);

-- Create Order_Items table (details of products in orders)
CREATE TABLE Order_Items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES Products(product_id),
    quantity INT NOT NULL,
    item_price DECIMAL NOT NULL
);

-- Create Reviews table
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Products(product_id),
    user_id INT REFERENCES Users(user_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT
);

-- Create Payments table
CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id),
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL NOT NULL
);

--Add ***********************************************
-- Create Carts table
CREATE TABLE Carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    total_amount DECIMAL NOT NULL DEFAULT 0.00
);

-- Create Cart_Items table
CREATE TABLE Cart_Items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES Carts(cart_id) ON DELETE CASCADE,
    product_id INT REFERENCES Products(product_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    item_price DECIMAL NOT NULL
);

ALTER TABLE Cart_Items
ADD CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id);

CREATE TABLE Product_Reservations (
    reservation_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(product_id),
    user_id INT NOT NULL REFERENCES Users(user_id),
    reserved_until TIMESTAMP NOT NULL,
    reserved_quantity INT NOT NULL,
    UNIQUE (product_id, user_id) -- Ensure no duplicate reservations for the same user and product
);




```

```swagger

openapi: 3.0.0
info:
  title: E-commerce API
  description: API documentation for managing products, orders, order items, reviews, and payments in an e-commerce platform.
  version: 1.0.0
servers:
  - url: http://localhost:3000/api
    description: Local server
tags:
  - name: Users
    description: Endpoints related to users
  - name: Categories
    description: Endpoints related to categories
  - name: Products
    description: Endpoints related to products
  - name: Orders
    description: Endpoints related to orders
  - name: Order Items
    description: Endpoints related to order items
  - name: Reviews
    description: Endpoints related to reviews
  - name: Payments
    description: Endpoints related to payments

paths:
  # Users
  /users:
    get:
      tags:
        - Users
      summary: Get all users
      description: Retrieve a list of all users.
      responses:
        '200':
          description: A list of users.
    post:
      tags:
        - Users
      summary: Create a new user
      description: Create a new user in the system.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                password:
                  type: string
                role:
                  type: string
                  enum: ['customer', 'admin']
      responses:
        '201':
          description: User created successfully
  
  /users/{user_id}:
    parameters:
      - name: user_id
        in: path
        required: true
        description: The ID of the user to interact with.
        schema:
          type: integer
    get:
      tags:
        - Users
      summary: Get a user by ID
      description: Retrieve details of a specific user.
      responses:
        '200':
          description: User details retrieved successfully
    put:
      tags:
        - Users
      summary: Update a user
      description: Update the details of a specific user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                password:
                  type: string
                role:
                  type: string
                  enum: ['customer', 'admin']
      responses:
        '200':
          description: User updated successfully
    delete:
      tags:
        - Users
      summary: Delete a user
      description: Delete a user from the system.
      responses:
        '204':
          description: User deleted successfully
  
  # Categories
  /categories:
    get:
      tags:
        - Categories
      summary: Get all categories
      description: Retrieve a list of all categories.
      responses:
        '200':
          description: A list of categories.
    post:
      tags:
        - Categories
      summary: Create a new category
      description: Add a new category for products.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        '201':
          description: Category created successfully
  
  /categories/{category_id}:
    parameters:
      - name: category_id
        in: path
        required: true
        description: The ID of the category to interact with.
        schema:
          type: integer
    get:
      tags:
        - Categories
      summary: Get a category by ID
      description: Retrieve details of a specific category.
      responses:
        '200':
          description: Category details retrieved successfully
    put:
      tags:
        - Categories
      summary: Update a category
      description: Update details of a specific category.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        '200':
          description: Category updated successfully
    delete:
      tags:
        - Categories
      summary: Delete a category
      description: Delete a specific category from the system.
      responses:
        '204':
          description: Category deleted successfully

  # Products
  /products:
    get:
      tags:
        - Products
      summary: Get all products
      description: Retrieve a list of all products, including their details such as price, stock, and category.
      responses:
        '200':
          description: A list of products retrieved successfully.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    product_id:
                      type: integer
                      description: The ID of the product
                    name:
                      type: string
                      description: The name of the product
                    description:
                      type: string
                      description: Detailed description of the product
                    price:
                      type: number
                      format: float
                      description: The price of the product
                    stock_quantity:
                      type: integer
                      description: The available stock of the product
                    category_id:
                      type: integer
                      description: The ID of the category the product belongs to
        '500':
          description: Internal server error while fetching the products.

    post:
      tags:
        - Products
      summary: Create a new product
      description: Add a new product to the inventory. The request should include product details like name, description, price, stock, and category.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: The name of the product
                description:
                  type: string
                  description: Detailed description of the product
                price:
                  type: number
                  format: float
                  description: The price of the product
                stock_quantity:
                  type: integer
                  description: The available stock of the product
                category_id:
                  type: integer
                  description: The ID of the category the product belongs to
      responses:
        '201':
          description: Product created successfully.
        '400':
          description: Invalid input, e.g., missing required fields or invalid data format.
        '500':
          description: Internal server error while creating the product.

  /products/{product_id}:
    get:
      tags:
        - Products
      summary: Get a product by ID
      description: Retrieve the details of a specific product by its ID.
      parameters:
        - name: product_id
          in: path
          required: true
          description: The ID of the product to retrieve
          schema:
            type: integer
      responses:
        '200':
          description: Product retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  product_id:
                    type: integer
                  name:
                    type: string
                  description:
                    type: string
                  price:
                    type: number
                  stock_quantity:
                    type: integer
                  category_id:
                    type: integer
        '404':
          description: Product not found with the given ID.
        '500':
          description: Internal server error.

    put:
      tags:
        - Products
      summary: Update a product
      description: Update the details of a specific product by its ID.
      parameters:
        - name: product_id
          in: path
          required: true
          description: The ID of the product to update
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                description:
                  type: string
                price:
                  type: number
                stock_quantity:
                  type: integer
                category_id:
                  type: integer
      responses:
        '200':
          description: Product updated successfully.
        '400':
          description: Invalid input data.
        '404':
          description: Product not found with the given ID.
        '500':
          description: Internal server error.

    delete:
      tags:
        - Products
      summary: Delete a product
      description: Delete a product from the inventory by its ID.
      parameters:
        - name: product_id
          in: path
          required: true
          description: The ID of the product to delete
          schema:
            type: integer
      responses:
        '204':
          description: Product deleted successfully.
        '404':
          description: Product not found with the given ID.
        '500':
          description: Internal server error while deleting the product.

  # Orders
  /orders:
    get:
      tags:
        - Orders
      summary: Get all orders
      description: Retrieve a list of all orders, including their details such as user, total amount, and order date.
      responses:
        '200':
          description: A list of orders retrieved successfully.
        '500':
          description: Internal server error while fetching the orders.

    post:
      tags:
        - Orders
      summary: Create a new order
      description: Place a new order in the system.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: integer
                  description: The ID of the user placing the order
                total_amount:
                  type: number
                  format: float
                  description: The total amount for the order
                order_date:
                  type: string
                  format: date-time
                  description: The date and time of the order (optional; default is current time)
      responses:
        '201':
          description: Order created successfully.
        '400':
          description: Invalid input data.
        '500':
          description: Internal server error while creating the order.

  /orders/{order_id}:
    get:
      tags:
        - Orders
      summary: Get an order by ID
      description: Retrieve the details of a specific order by its ID.
      parameters:
        - name: order_id
          in: path
          required: true
          description: The ID of the order to retrieve
          schema:
            type: integer
      responses:
        '200':
          description: Order retrieved successfully.
        '404':
          description: Order not found with the given ID.
        '500':
          description: Internal server error.

    delete:
      tags:
        - Orders
      summary: Delete an order
      description: Cancel a specific order by its ID.
      parameters:
        - name: order_id
          in: path
          required: true
          description: The ID of the order to delete
          schema:
            type: integer
      responses:
        '204':
          description: Order deleted successfully.
        '404':
          description: Order not found with the given ID.
        '500':
          description: Internal server error while deleting the order.

  # Order Items
  /order-items:
    get:
      tags:
        - Order Items
      summary: Get all order items
      description: Retrieve a list of all items in orders, including product details, quantities, and prices.
      responses:
        '200':
          description: A list of order items retrieved successfully.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    order_item_id:
                      type: integer
                      description: The ID of the order item
                    order_id:
                      type: integer
                      description: The ID of the order
                    product_id:
                      type: integer
                      description: The ID of the product
                    quantity:
                      type: integer
                      description: The quantity of the product in the order
                    item_price:
                      type: number
                      format: float
                      description: The price of the product in the order
        '500':
          description: Internal server error while fetching the order items.

    post:
      tags:
        - Order Items
      summary: Add an item to an order
      description: Add a product to an existing order.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                order_id:
                  type: integer
                  description: The ID of the order
                product_id:
                  type: integer
                  description: The ID of the product
                quantity:
                  type: integer
                  description: The quantity of the product
                item_price:
                  type: number
                  format: float
                  description: The price of the product at the time of the order
      responses:
        '201':
          description: Order item added successfully.
        '400':
          description: Invalid input data.
        '500':
          description: Internal server error.

  /order-items/{order_item_id}:
    get:
      tags:
        - Order Items
      summary: Get an order item by ID
      description: Retrieve details of a specific order item by its ID.
      parameters:
        - name: order_item_id
          in: path
          required: true
          description: The ID of the order item to retrieve
          schema:
            type: integer
      responses:
        '200':
          description: Order item retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  order_item_id:
                    type: integer
                  order_id:
                    type: integer
                  product_id:
                    type: integer
                  quantity:
                    type: integer
                  item_price:
                    type: number
        '404':
          description: Order item not found with the given ID.
        '500':
          description: Internal server error.

    put:
      tags:
        - Order Items
      summary: Update an order item
      description: Update the details of a specific order item, such as quantity or price.
      parameters:
        - name: order_item_id
          in: path
          required: true
          description: The ID of the order item to update
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                order_id:
                  type: integer
                  description: The ID of the order
                product_id:
                  type: integer
                  description: The ID of the product
                quantity:
                  type: integer
                  description: The new quantity of the product
                item_price:
                  type: number
                  format: float
                  description: The new price of the product
      responses:
        '200':
          description: Order item updated successfully.
        '400':
          description: Invalid input data.
        '404':
          description: Order item not found with the given ID.
        '500':
          description: Internal server error.

    delete:
      tags:
        - Order Items
      summary: Delete an order item
      description: Remove an item from an order by its ID.
      parameters:
        - name: order_item_id
          in: path
          required: true
          description: The ID of the order item to delete
          schema:
            type: integer
      responses:
        '204':
          description: Order item deleted successfully.
        '404':
          description: Order item not found with the given ID.
        '500':
          description: Internal server error.

  # Reviews
  /reviews:
    get:
      tags:
        - Reviews
      summary: Get all reviews
      description: Retrieve a list of all reviews, including ratings, comments, and associated products.
      responses:
        '200':
          description: A list of reviews retrieved successfully.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    review_id:
                      type: integer
                      description: The ID of the review
                    product_id:
                      type: integer
                      description: The ID of the product being reviewed
                    user_id:
                      type: integer
                      description: The ID of the user who wrote the review
                    rating:
                      type: integer
                      description: The rating given to the product (1-5)
                    comment:
                      type: string
                      description: A textual comment about the product
        '500':
          description: Internal server error.

    post:
      tags:
        - Reviews
      summary: Add a review for a product
      description: Submit a review for a specific product.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                product_id:
                  type: integer
                  description: The ID of the product being reviewed
                user_id:
                  type: integer
                  description: The ID of the user submitting the review
                rating:
                  type: integer
                  description: The rating for the product (1-5)
                comment:
                  type: string
                  description: A textual comment about the product
      responses:
        '201':
          description: Review added successfully.
        '400':
          description: Invalid input data.
        '500':
          description: Internal server error.

  /reviews/{review_id}:
    get:
      tags:
        - Reviews
      summary: Get a review by ID
      description: Retrieve a specific review by its ID.
      parameters:
        - name: review_id
          in: path
          required: true
          description: The ID of the review to retrieve.
          schema:
            type: integer
      responses:
        '200':
          description: Review retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  review_id:
                    type: integer
                    description: The ID of the review
                  product_id:
                    type: integer
                    description: The ID of the product being reviewed
                  user_id:
                    type: integer
                    description: The ID of the user who wrote the review
                  rating:
                    type: integer
                    description: The rating given to the product (1-5)
                  comment:
                    type: string
                    description: A textual comment about the product
        '404':
          description: Review not found with the given ID.
        '500':
          description: Internal server error.

    put:
      tags:
        - Reviews
      summary: Update a review
      description: Update the details of a specific review, such as its rating or comment.
      parameters:
        - name: review_id
          in: path
          required: true
          description: The ID of the review to update.
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                rating:
                  type: integer
                  description: The updated rating for the product (1-5)
                comment:
                  type: string
                  description: The updated comment about the product
      responses:
        '200':
          description: Review updated successfully.
        '400':
          description: Invalid input data.
        '404':
          description: Review not found with the given ID.
        '500':
          description: Internal server error.

    delete:
      tags:
        - Reviews
      summary: Delete a review
      description: Remove a review by its ID.
      parameters:
        - name: review_id
          in: path
          required: true
          description: The ID of the review to delete.
          schema:
            type: integer
      responses:
        '204':
          description: Review deleted successfully.
        '404':
          description: Review not found with the given ID.
        '500':
          description: Internal server error.

  # Payments
  /payments:
    post:
      tags:
        - Payments
      summary: Make a payment
      description: Process a payment for a specific order.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                order_id:
                  type: integer
                  description: The ID of the order for which payment is being made.
                amount:
                  type: number
                  format: float
                  description: The amount to be paid.
                payment_method:
                  type: string
                  enum: ['card', 'paypal', 'bank_transfer']
                  description: The method of payment.
      responses:
        '201':
          description: Payment processed successfully.
        '400':
          description: Invalid payment details.
        '500':
          description: Internal server error while processing the payment.

    get:
      tags:
        - Payments
      summary: Get all payments
      description: Retrieve a list of all processed payments.
      responses:
        '200':
          description: A list of payments retrieved successfully.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    payment_id:
                      type: integer
                      description: The ID of the payment.
                    order_id:
                      type: integer
                      description: The ID of the related order.
                    payment_date:
                      type: string
                      format: date-time
                      description: The date and time of the payment.
                    amount:
                      type: number
                      format: float
                      description: The amount paid.
                    payment_method:
                      type: string
                      description: The payment method used.
        '500':
          description: Internal server error.

  /payments/{payment_id}:
    get:
      tags:
        - Payments
      summary: Get payment by ID
      description: Retrieve a specific payment by its ID.
      parameters:
        - name: payment_id
          in: path
          required: true
          description: The ID of the payment to retrieve.
          schema:
            type: integer
      responses:
        '200':
          description: Payment retrieved successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  payment_id:
                    type: integer
                    description: The ID of the payment.
                  order_id:
                    type: integer
                    description: The ID of the related order.
                  payment_date:
                    type: string
                    format: date-time
                    description: The date and time of the payment.
                  amount:
                    type: number
                    format: float
                    description: The amount paid.
                  payment_method:
                    type: string
                    description: The payment method used.
        '404':
          description: Payment not found with the given ID.
        '500':
          description: Internal server error.

    put:
      tags:
        - Payments
      summary: Update payment details
      description: Update the details of an existing payment.
      parameters:
        - name: payment_id
          in: path
          required: true
          description: The ID of the payment to update.
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                order_id:
                  type: integer
                  description: The ID of the related order.
                amount:
                  type: number
                  format: float
                  description: The updated payment amount.
                payment_method:
                  type: string
                  enum: ['card', 'paypal', 'bank_transfer']
                  description: The updated payment method.
      responses:
        '200':
          description: Payment updated successfully.
        '400':
          description: Invalid input data.
        '404':
          description: Payment not found with the given ID.
        '500':
          description: Internal server error.

    delete:
      tags:
        - Payments
      summary: Delete a payment
      description: Remove a payment by its ID.
      parameters:
        - name: payment_id
          in: path
          required: true
          description: The ID of the payment to delete.
          schema:
            type: integer
      responses:
        '204':
          description: Payment deleted successfully.
        '404':
          description: Payment not found with the given ID.
        '500':
          description: Internal server error.
   ```
