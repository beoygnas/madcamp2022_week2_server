-- db 생성
create database developwith_db efault character set utf8 collate utf8_general_ci;

-- table column은 모두 소문자
create table user (
    -- id      int AUTO_INCREMENT primary key,
    email   varchar(50),
    name    varchar(20) not null, 
    age     int,
    gender  varchar(5), 
    phonenum    varchar(15),
    field   varchar(50),
    level   int,
    msg     varchar(50),
    primary key(email)
)

insert into user values("관리자", "관리자", null, null, null, null, null, null)


create table user_chat(

    chat_id      varchar(50),
    email_1 varchar(50) not null,
    email_2 varchar(50) not null,
    primary key(chat_id),
    foreign key(email_1) references user,
    foreign key(email_2) references user

)

create table document(

    doc_id  int auto_increment,
    writer   varchar(50) not null,
    writer_email varchar(50) not null,
    type    varchar(10) not null,
    title   varchar(50) not null,
    content varchar(500) not null, 
    regdata varchar(20) not null,
    picture varchar(50), 
    primary key(doc_id)
)

create table comment(
    comment_id  int auto_increment,
    doc_id      varchar(50) not null,
    regdata     varchar(20) not null,
    writer      varchar(20) not null,
    content     varchar(1000) not null,
    primary key(comment_id),
    foreign key(doc_id) references document(doc_id) on delete cascade
)

create table project(
    proj_id     int AUTO_INCREMENT primary key,
    writer      varchar(20) not null,
    writer_email    varchar(50) not null,
    title       varchar(20) not null,
    content     varchar(100) not null,
    field       varchar(20) not null,
    level       int         not null,
    headcount   int         not null,
    language    varchar(20) not null,
    time        varchar(20) not null,
    regdata     varchar(20) not null
)

insert into project values(null, "김상엽", "rlatkdduq99@naver.com","개발같이해요, 개같이", "초보 개발자를 위한 어플을 만듭니다.", "app", 1, 2, "java, kotlin", "7/6(수)~7/13(수)", "20220708110024");

insert into project values(null, "조예진", "yejin0427@naver.com", "유니티를 이용한 게임 만들기", "유니티, C#을 이용해서 게임을 만들겁니다", "game", 1, 3, "C#, android studio", "7/12(수)~7/18(수)", "20220708110026");

insert into tmp values("java, kotlin", "7/6(수)~7/13(수)");

    create table tmp2(
        id1         int AUTO_INCREMENT primary key,
        id2         varchar(20) not null
    );

insert into tmp2 values("김상엽");



create table chatroom_list(
    chat_id	    int AUTO_INCREMENT primary key,
    chat_name   varchar(100),
    lastchat    varchar(100),
    regdata     varchar(100),
    foreign key(chat_id) references project(proj_id) on delete cascade
);


insert into project values(null, "김상엽", "rlatkdduq99@naver.com","개발같이해요, 개같이", "초보 개발자를 위한 어플을 만듭니다.", "app", 1, 2, "java, kotlin", "7/6(수)~7/13(수)", "20220708110024");

insert into chatroom_list values(3, "개발같이해요, 개같이", "안녕하세요. [개발같이해요, 개같이] 프로젝트 단톡방입니다.", 20220708110024);

create table chatroom_member(
    chat_id     int,
    name        varchar(100),
    email       varchar(100),
    primary key(chat_id, email),
    foreign key(chat_id) references project(proj_id) on delete cascade
);

insert into chatroom_member values(3, "김상엽", "rlatkdduq99@naver.com");

create table chatmsg3(
    chat_id int, msg_id  int AUTO_INCREMENT primary key,
    msg varchar(50),
    regdata varchar(50),
    sender_name varchar(50),
    foreign key(chat_id) references project(proj_id) on delete cascade
); 

insert into chatmsg3 values(3, null, msg, 20220708110024, "김상엽");

insert into chatroom_list values(null, "rlatkdduq99@naver.com", "김상엽", "1q2w3e4r@naver.com", "김재민", "안녕", "202207100356");
insert into chatroom_list values(null, "rlatkdduq99@naver.com", "김상엽", "1q2w3e4r@naver.com", "조예진", "잘가", "202207100357");

insert into chatroom_list values(1, "asdf", “김상엽”, “1q2w3e4r@naver.com”, “김재민”, “안녕”);