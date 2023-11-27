import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  controllers: [BalanceController],
  providers: [BalanceService, EncryptionService]
})
export class BalanceModule { }
