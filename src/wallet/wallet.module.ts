import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { EncryptionService } from '../encryption/encryption.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService, WalletService, EncryptionService],
  controllers: [WalletController]
})
export class WalletModule { }
