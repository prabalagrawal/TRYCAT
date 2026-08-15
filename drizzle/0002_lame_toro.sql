CREATE TABLE `rate_limit_windows` (
	`keyHash` varchar(128) NOT NULL,
	`windowStartedAt` timestamp NOT NULL DEFAULT (now()),
	`attemptCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limit_windows_keyHash` PRIMARY KEY(`keyHash`)
);
