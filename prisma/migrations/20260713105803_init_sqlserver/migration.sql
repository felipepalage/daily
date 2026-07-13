BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'daily') EXEC sp_executesql N'CREATE SCHEMA [daily];';

-- CreateTable
CREATE TABLE [daily].[AppSetting] (
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AppSetting_pkey] PRIMARY KEY CLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [daily].[ScrumMaster] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ScrumMaster_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [questionDoingLabel] NVARCHAR(1000) NOT NULL CONSTRAINT [ScrumMaster_questionDoingLabel_df] DEFAULT 'O que está fazendo?',
    [questionBlockedLabel] NVARCHAR(1000) NOT NULL CONSTRAINT [ScrumMaster_questionBlockedLabel_df] DEFAULT 'O que está travado?',
    [questionImproveLabel] NVARCHAR(1000) NOT NULL CONSTRAINT [ScrumMaster_questionImproveLabel_df] DEFAULT 'O que pode melhorar?',
    [redmineUrl] NVARCHAR(1000),
    [redmineApiKey] NVARCHAR(1000),
    CONSTRAINT [ScrumMaster_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ScrumMaster_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [daily].[Team] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Team_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [scrumMasterId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Team_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [daily].[Developer] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000),
    [email] NVARCHAR(1000),
    [publicToken] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Developer_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [teamId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Developer_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Developer_publicToken_key] UNIQUE NONCLUSTERED ([publicToken])
);

-- CreateTable
CREATE TABLE [daily].[DailyEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [doing] NVARCHAR(max) NOT NULL,
    [blocked] NVARCHAR(max) NOT NULL,
    [improve] NVARCHAR(max) NOT NULL,
    [mood] NVARCHAR(1000),
    [scrumNote] NVARCHAR(max),
    [featureNumber] NVARCHAR(1000),
    [blockerNumber] NVARCHAR(1000),
    [epicNumber] NVARCHAR(1000),
    [taskNumber] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DailyEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [developerId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DailyEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DailyEntry_developerId_date_key] UNIQUE NONCLUSTERED ([developerId],[date])
);

-- CreateTable
CREATE TABLE [daily].[PasswordResetToken] (
    [id] NVARCHAR(1000) NOT NULL,
    [tokenHash] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PasswordResetToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [scrumMasterId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PasswordResetToken_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasswordResetToken_tokenHash_key] UNIQUE NONCLUSTERED ([tokenHash])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DailyEntry_date_idx] ON [daily].[DailyEntry]([date]);

-- AddForeignKey
ALTER TABLE [daily].[Team] ADD CONSTRAINT [Team_scrumMasterId_fkey] FOREIGN KEY ([scrumMasterId]) REFERENCES [daily].[ScrumMaster]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [daily].[Developer] ADD CONSTRAINT [Developer_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [daily].[Team]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [daily].[DailyEntry] ADD CONSTRAINT [DailyEntry_developerId_fkey] FOREIGN KEY ([developerId]) REFERENCES [daily].[Developer]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [daily].[PasswordResetToken] ADD CONSTRAINT [PasswordResetToken_scrumMasterId_fkey] FOREIGN KEY ([scrumMasterId]) REFERENCES [daily].[ScrumMaster]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

