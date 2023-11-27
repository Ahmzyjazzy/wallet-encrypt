import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  providers: [CustomerService, EncryptionService],
  controllers: [CustomerController]
})
export class CustomerModule { }
