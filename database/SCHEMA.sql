create user todoappadmin with password '';

create database todoapp owner todoappadmin;

create schema if not exists todo authorization todoappadmin;

create table if not exists todo.users (
	id serial primary key,
	email varchar(100) not null,
	"password" varchar(100) not null,
	first_name varchar(100),
	last_name varchar(100),
	created_on_date timestamp with time zone,
	last_login_date timestamp with time zone
);

create table if not exists todo.list (
	id serial primary key,
	name varchar(50) not null,
	created_on_date timestamp with time zone,
	last_updated_date timestamp with time zone,
	created_by int not null,
	constraint created_by_fk foreign key (created_by)
    references todo.users (id)
	on update cascade on delete cascade
);

create table if not exists todo.list_items (
	id serial primary key,
	list_id int not null, 
	description varchar(200),
	created_on_date timestamp with time zone,
	constraint list_id_fk foreign key (list_id)
	references todo.list (id)
	on update cascade on delete cascade
);