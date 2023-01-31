create user todoappadmin with password '';

alter database todoapp owner to todoappadmin;

create schema if not exists todo authorization todoappadmin;

create table if not exists todo.users (
	id serial primary key,
	email varchar(100) unique not null,
	"firstName" varchar(100),
	"lastName" varchar(100),
	"createdOnDate" timestamp with time zone
);

create table if not exists todo."userCredentials" (
	"userId" int not null,
	"password" varchar(181) not null,
	"lastLoginDate" timestamp with time zone,
	constraint "userIdFK" foreign key ("userId")
	references todo.users (id)
	on update cascade on delete cascade
);

create table if not exists todo.list (
	id serial primary key,
	name varchar(50) not null,
	"createdOnDate" timestamp with time zone,
	"lastUpdatedDate" timestamp with time zone,
	"createdBy" int not null,
	constraint "createdByFK" foreign key ("createdBy")
    references todo.users (id)
	on update cascade on delete cascade
);

create table if not exists todo."listItems" (
	id serial primary key,
	"listId" int not null, 
	description varchar(200),
	"createdOnDate" timestamp with time zone,
	constraint "listIdFK" foreign key ("listId")
	references todo.list (id)
	on update cascade on delete cascade
);

grant all privileges on all tables in schema todo to todoappadmin;
grant all privileges on all sequences in schema todo to todoappadmin;