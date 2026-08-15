CREATE TABLE `consent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectId` varchar(128) NOT NULL,
	`purpose` enum('analytics','contact_request','rights_request') NOT NULL,
	`choice` enum('granted','denied','withdrawn') NOT NULL,
	`noticeVersion` varchar(64) NOT NULL,
	`source` varchar(64) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`retentionUntil` timestamp NOT NULL,
	CONSTRAINT `consent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(40) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organisation` varchar(240),
	`message` text NOT NULL,
	`marketingOptIn` enum('granted','not_granted') NOT NULL DEFAULT 'not_granted',
	`noticeVersion` varchar(64) NOT NULL,
	`status` enum('received','responded','closed') NOT NULL DEFAULT 'received',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`retentionUntil` timestamp NOT NULL,
	CONSTRAINT `contact_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `contact_requests_request_id_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE TABLE `data_rights_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(40) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`requestType` enum('access','correction','erasure','withdrawal','grievance') NOT NULL,
	`details` text,
	`status` enum('received','verifying','in_progress','completed','rejected') NOT NULL DEFAULT 'received',
	`noticeVersion` varchar(64) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`retentionUntil` timestamp NOT NULL,
	CONSTRAINT `data_rights_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_rights_requests_request_id_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
