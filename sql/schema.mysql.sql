drop table if exists event;
drop table if exists pageview;
drop table if exists session;
drop table if exists website;
drop table if exists account;

create table account (
    user_id int unsigned not null auto_increment primary key,
    username varchar(255) unique not null,
    password varchar(60) not null,
    is_admin bool not null default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
) ENGINE=InnoDB COLLATE=utf8_general_ci;

create table website (
    website_id int unsigned not null auto_increment primary key,
    website_uuid varchar(36) unique not null,
    user_id int unsigned not null,
    name varchar(100) not null,
    domain varchar(500),
    share_id varchar(64) unique,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references account(user_id) on delete cascade
) ENGINE=InnoDB COLLATE=utf8_general_ci;

create table session (
    session_id int unsigned not null auto_increment primary key,
    session_uuid varchar(36) unique not null,
    website_id int unsigned not null references website(website_id) on delete cascade,
    created_at timestamp default current_timestamp,
    hostname varchar(100),
    browser varchar(20),
    os varchar(20),
    device varchar(20),
    screen varchar(11),
    language varchar(35),
    country char(2),
    foreign key (website_id) references website(website_id) on delete cascade
) ENGINE=InnoDB COLLATE=utf8_general_ci;

create table pageview (
    view_id int unsigned not null auto_increment primary key,
    website_id int unsigned not null,
    session_id int unsigned not null,
    created_at timestamp default current_timestamp,
    url varchar(500) not null,
    referrer varchar(500),
    foreign key (website_id) references website(website_id) on delete cascade,
    foreign key (session_id) references session(session_id) on delete cascade
) ENGINE=InnoDB COLLATE=utf8_general_ci;

create table event (
    event_id int unsigned not null auto_increment primary key,
    website_id int unsigned not null,
    session_id int unsigned not null,
    created_at timestamp default current_timestamp,
    url varchar(500) not null,
    event_type varchar(50) not null,
    event_value varchar(50) not null,
    foreign key (website_id) references website(website_id) on delete cascade,
    foreign key (session_id) references session(session_id) on delete cascade
) ENGINE=InnoDB COLLATE=utf8_general_ci;

create index website_user_id_idx on website(user_id);

create index session_created_at_idx on session(created_at);
create index session_website_id_idx on session(website_id);

create index pageview_created_at_idx on pageview(created_at);
create index pageview_website_id_idx on pageview(website_id);
create index pageview_session_id_idx on pageview(session_id);
create index pageview_website_id_created_at_idx on pageview(website_id, created_at);
create index pageview_website_id_session_id_created_at_idx on pageview(website_id, session_id, created_at);

create index event_created_at_idx on event(created_at);
create index event_website_id_idx on event(website_id);
create index event_session_id_idx on event(session_id);

insert into account (username, password, is_admin) values ('admin', '$2b$10$BUli0c.muyCW1ErNJc3jL.vFRFtFJWrT8/GcR4A.sUdCznaXiqFXa', true);
