CREATE TABLE users(
	id serial primary key,
	name varchar(50) not null,
	email varchar(100) not null,
	password varchar(100) not null,
	image varchar(100) not null
);

CREATE TABLE products (
    id serial primary key,
    name varchar(50) not null,
    description varchar(500) not null,
    price decimal not null default 0 check(price >= 0),  
    stock int not null default 0 check(stock >= 0),
    image VARCHAR(500)
);