-- RenameTable
RENAME TABLE `event` TO `_event_old`;

-- CreateTable
CREATE TABLE `event`
(
    `event_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `website_id` INTEGER UNSIGNED NOT NULL,
    `session_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `url` VARCHAR(500) NOT NULL,
    `event_name` VARCHAR(50) NOT NULL,

    INDEX `event_created_at_idx`(`created_at`),
    INDEX `event_session_id_idx`(`session_id`),
    INDEX `event_website_id_idx`(`website_id`),
    PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- CreateTable
CREATE TABLE `event_data` (
    `event_data_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER UNSIGNED NOT NULL,
    `event_data` JSON NOT NULL,

    UNIQUE INDEX `event_data_event_id_key`(`event_id`),
    PRIMARY KEY (`event_data_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- CreateProcedureRenameIndex
CREATE PROCEDURE `UmamiRenameIndexIfExists`(
    IN i_table_name VARCHAR(128),
    IN i_current_index_name VARCHAR(128),
    IN i_new_index_name VARCHAR(128)
    )
    BEGIN

    SET @tableName = i_table_name;
    SET @currentIndexName = i_current_index_name;
    SET @newIndexName = i_new_index_name;
    SET @indexExists = 0;

    SELECT
        1
    INTO @indexExists FROM
        INFORMATION_SCHEMA.STATISTICS
    WHERE
        TABLE_NAME = @tableName
            AND INDEX_NAME = @currentIndexName;

    SET @query = CONCAT(
        'ALTER TABLE `', @tableName, '` RENAME INDEX  `', @currentIndexName, '` TO `', @newIndexName, '`;'
    );
    IF @indexExists THEN
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END;

-- RenameIndex
CALL UmamiRenameIndexIfExists('account', 'username', 'account_username_key');
CALL UmamiRenameIndexIfExists('session', 'session_uuid', 'session_session_uuid_key');
CALL UmamiRenameIndexIfExists('website', 'share_id', 'website_share_id_key');
CALL UmamiRenameIndexIfExists('website', 'website_uuid', 'website_website_uuid_key');

-- Drop CreateProcedureRenameIndex
drop procedure `UmamiRenameIndexIfExists`;
