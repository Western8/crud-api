# crud-api
### Simple CRUD-API application

### How to start this project locally

1. Clone this repository to your local machine: git clone https://github.com/Western8/crud-api.git
2. Run terminal in your code editor
3. Go to the project's root folder in the terminal
4. Run 'npm install' to install all dependencies
5. Congrats!

### List of project scripts

-   start:dev : starts development server which will track code changes
-   start:multi : starts multiple instances of the application with load balancer
-   start:prod : compile all the project files into compressed bundle to publisher
-   test : run jest tests written for application source code

All of the scripts can be started with the command 'npm run name_of_script' in the command line

### How to use it
-   Write in the .env-file number of port (default - 4000)
-   After starting server go to the url http://localhost:[port]/
-   Initially, there are 3 records of persons in the database
-   Use GET request to 'api/users' to get all persons
-   Use GET request to 'api/users/{userId}' to get record with id === userId
-   Use POST request to 'api/users' (body contains new user object) to create record about new user and store it in database
-   Use PUT request to 'api/users/{userId}' (body contains user data for update) to update record with id === userId
-   Use DELETE request to 'api/users/{userId}' to delete record with id === userId
