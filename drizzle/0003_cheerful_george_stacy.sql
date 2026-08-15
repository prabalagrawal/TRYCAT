CREATE TABLE `bot_challenges` (
	`challengeId` varchar(64) NOT NULL,
	`nonceHash` varchar(128) NOT NULL,
	`difficulty` int NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	CONSTRAINT `bot_challenges_challengeId` PRIMARY KEY(`challengeId`)
);
