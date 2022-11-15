# todo-app-api

REST API for my Todo Application

# Getting Started
**Note:** These steps assume you have already configured the database using the SCHEMA.sql file. If not, then please follow the steps listed in section **Setting Up the Database (Docker)**.

1. Start by creating a copy of the **.env.example** file called **.env.development**. Fill in all of the values present in that file.

2. Run the following commands:
<pre>
git clone https://github.com/LoganCrockett/todo-app-api.git
cd ./todo-app-api
npm install
npm run dev
</pre>
3. The API server should now be running locally on the port specfified.

# Setting Up the Database (Docker)
In order to simply development, I am using docker to run postgres DB locally. Please follow the steps for setting up a local copy

1. <pre>docker pull postgres:15</pre>
2. <pre>docker run --name todo-app-db -e POSTGRES_PASSWORD=mysecretpassword -d postgres:15</pre>
3. Open up a connection to the database with your favorite DB tool (I use PgAdmin), and copy the SCHEMA.sql file into the query editor.
4. Fill in a value for the password for user **todoappadmin**, then run the SQL.
5. Congrats!! You have successfully set up an instance of the database locally.

# Testing
I am using the Jest & Supertest library in order to test the API routes and other business logic (DAO's, etc).

**Note:** These steps assume you have already configured the database using the SCHEMA.sql file. If not, then please follow the steps listed in section **Setting Up the Database (Docker)**.

**Note:** I recommend create an additional database called for **testing only** so that the tests do not interfere with your development data.

1. Start by creating a copy of the **.env.example** file called **.env.test**. Fill in all of the values present in that file.
2. 
<pre>
cd ./todo-app-api
npm install
npm run test
</pre>
3. The Jest test suite should begin runnning momentarily. It may take a few seconds for it to finish all of its testing. It will generate a summary once it is finished.

**Note:** Currently, in order to test the SQL, when you the test command, it inserts fake values into the database for testing, and removes them after each test.

Due to this, if you just created the database, you may run into primary_key_constraint errors on some of the tables. This is completely normal. You may need to run the test command multiple times in order for this error to disappear. Alternatively, you could modify the sequence in the DB to have its current value be equal to the highest ID value in the fake data.