-- CreateTable
CREATE TABLE `team_invites` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `invitedById` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'assistant',
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `acceptedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `team_invites_token_key`(`token`),
    INDEX `team_invites_accountId_idx`(`accountId`),
    INDEX `team_invites_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_deletion_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `scheduledDeletionAt` DATETIME(3) NOT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `account_deletion_requests_userId_idx`(`userId`),
    INDEX `account_deletion_requests_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nfe_configs` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `environment` VARCHAR(191) NOT NULL DEFAULT 'homologacao',
    `cnpj` VARCHAR(191) NULL,
    `inscricaoEstadual` VARCHAR(191) NULL,
    `inscricaoMunicipal` VARCHAR(191) NULL,
    `razaoSocial` VARCHAR(191) NULL,
    `nomeFantasia` VARCHAR(191) NULL,
    `logradouro` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `codigoMunicipio` VARCHAR(191) NULL,
    `municipio` VARCHAR(191) NULL,
    `uf` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `serieNFe` INTEGER NOT NULL DEFAULT 1,
    `ultimoNumeroNFe` INTEGER NOT NULL DEFAULT 0,
    `serieNFSe` INTEGER NOT NULL DEFAULT 1,
    `ultimoNumeroNFSe` INTEGER NOT NULL DEFAULT 0,
    `certificateData` LONGBLOB NULL,
    `certificatePassword` VARCHAR(191) NULL,
    `certificateExpiry` DATETIME(3) NULL,
    `regimeTributario` VARCHAR(191) NULL,
    `codigoCnae` VARCHAR(191) NULL,
    `itemListaServico` VARCHAR(191) NULL,
    `aliquotaIss` DECIMAL(5, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nfe_configs_accountId_key`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nfe_records` (
    `id` VARCHAR(191) NOT NULL,
    `nfeConfigId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'NFe',
    `numero` INTEGER NOT NULL,
    `serie` INTEGER NOT NULL,
    `chaveAcesso` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `codigoStatus` VARCHAR(191) NULL,
    `motivoStatus` TEXT NULL,
    `protocolo` VARCHAR(191) NULL,
    `dataAutorizacao` DATETIME(3) NULL,
    `xmlEnvio` LONGTEXT NULL,
    `xmlRetorno` LONGTEXT NULL,
    `xmlCancelamento` LONGTEXT NULL,
    `pdfUrl` VARCHAR(191) NULL,
    `cancelada` BOOLEAN NOT NULL DEFAULT false,
    `dataCancelamento` DATETIME(3) NULL,
    `motivoCancelamento` TEXT NULL,
    `protocoloCancelamento` VARCHAR(191) NULL,
    `tentativas` INTEGER NOT NULL DEFAULT 0,
    `ultimaTentativa` DATETIME(3) NULL,
    `proximaTentativa` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nfe_records_chaveAcesso_key`(`chaveAcesso`),
    INDEX `nfe_records_nfeConfigId_idx`(`nfeConfigId`),
    INDEX `nfe_records_invoiceId_idx`(`invoiceId`),
    INDEX `nfe_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nfe_configs` ADD CONSTRAINT `nfe_configs_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nfe_records` ADD CONSTRAINT `nfe_records_nfeConfigId_fkey` FOREIGN KEY (`nfeConfigId`) REFERENCES `nfe_configs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nfe_records` ADD CONSTRAINT `nfe_records_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
