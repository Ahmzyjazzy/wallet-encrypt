import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
    constructor(private readonly balanceService: BalanceService) { }

    @Get(':customerId')
    async getWalletBalances(@Param('customerId') customerId: string) {
        return this.balanceService.getWalletBalances(customerId);
    }

    @Get(':customerId/wallet/:walletId')
    async getWalletBalance(
        @Param('customerId') customerId: string,
        @Param('walletId') walletId: string,
    ) {
        return this.balanceService.getWalletBalance(customerId, walletId);
    }
}
