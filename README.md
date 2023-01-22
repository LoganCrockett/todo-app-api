# todo-app-api

REST API for my Todo Application

# Getting Started (Local Development)
**Note:** These steps assume you have already configured the database using the SCHEMA.sql file. If not, then please follow the steps listed in section **Setting Up the Database (Docker)**.

1. Start by creating a copy of the **.env.example** file called **.env.development**. Fill in all of the values present in that file.

2. Using a website like [this](https://cryptotools.net/rsagen) (or any tool you prefer), generate an asymetric encryption key pair.
    - Name the files **public.pem** and **private.pem**

Add the public & private files to the **envFiles** folder.

3. Run the following commands:
<pre>
git clone https://github.com/LoganCrockett/todo-app-api.git
cd ./todo-app-api
npm install
npm run dev
</pre>
4. The API server should now be running locally on the port specified.

# Setting Up the Database (Docker)
In order to simply development, I am using docker to run postgres DB locally. Please follow the steps for setting up a local copy

**Note:** Please fill in a password value for postgres

1. <pre>docker pull postgres:15</pre>
2. <pre>docker run --name todo-app-db -e POSTGRES_PASSWORD=*fill in value here* -d postgres:15</pre>
3. Open up a connection to the database with your favorite DB tool (I use PgAdmin), and copy the SCHEMA.sql file into the query editor.
4. Fill in a value for the password for user **todoappadmin**, then run the SQL.
5. Congrats!! You have successfully set up an instance of the database locally.

# Testing
I am using the Jest & Supertest library in order to test the API routes and other business logic (DAO's, etc).

**Note:** These steps assume you have already configured the database using the SCHEMA.sql file. If not, then please follow the steps listed in section **Setting Up the Database (Docker)**.

**Note:** I recommend create an additional database for **testing only** so that the tests do not interfere with your development data.

1. Start by creating a copy of the **.env.example** file called **.env.test**. Fill in all of the values present in that file.

2. If you have not done so, then using a website like [this](https://cryptotools.net/rsagen) (or any tool you prefer), generate an asymetric encryption key pair.
    - Name the files **public.pem** and **private.pem**

Add the public & private files to the **envFiles** folder.

3. 
<pre>
cd ./todo-app-api
npm install
npm run test
</pre>
4. The Jest test suite should begin runnning momentarily. It may take a few seconds for it to finish all of its testing. It will generate a summary once it is finished.

**Note:** Currently, in order to test the SQL, when you run the test command, it inserts fake values into the database for testing, and removes them after each test.

Due to this, if you just created the database, you may run into primary_key_constraint errors on some of the tables. This is completely normal. You may need to run the test command multiple times in order for this error to disappear. Alternatively, you could modify the sequence in the DB to have its current value be equal to the highest ID value in the fake data.

# Production (Local)
For running a copy of the API locally in production mode, we will use a docker container.

1. If you have not done so, then using a website like [this](https://cryptotools.net/rsagen) (or any tool you prefer), generate an asymetric encryption key pair.
    - Name the files **public.pem** and **private.pem**

Add the public & private files to the **envFiles** folder.

2. Run the following command to build the image locally:
<pre>
docker build -t todo-app-api:latest --no-cache -f Dockerfile.local.prod .
</pre>

3. Create a copy of the **.env.example** file (prefrrably called **.env.local.prod**, but feel free to call it what you want). Fill in all of the values present in that file.

4. In order to use the encryption key files inside the container, we are going to use a bind mount. Make a note of the full file path to where the **envFiles** folder is located on your machine (Ex: C:\Documents\todo-app-api\envFiles)

5. Run the following command (filing in the source path of the bind mount with the value from the previous step)
<pre>
docker run --name todo-app-api --mount type=bind,source="fill in value here",target=/todo-app-api/envFiles -d --env-file=./.env.local.prod -p 4000:4000 todo-app-api:latest
</pre>