CREATE TABLE blogs (
id SERIAL PRIMARY KEY,
author TEXT,
url TEXT NOT NULL,
title TEXT NOT NULL,
likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES
('koira', 'www.koira.fi', 'koiran elämää'),
('kissa', 'www.kissa.fi', 'kissan elämää');