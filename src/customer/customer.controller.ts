import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto';

@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post()
    async createCustomer(
        @Body() request: CreateCustomerDto
    ) {
        const customer = await this.customerService.createCustomer(request);
        return customer
    }

    @Get(':customerId/wallets')
    async getCustomerWallets(@Param('customerId') customerId: string) {
        const wallets = await this.customerService.getWallets(customerId);
        return wallets
    }
}
