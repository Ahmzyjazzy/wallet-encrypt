import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletDepositDto, WalletWithdrawalDto } from './dto';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Post(':walletId/deposit')
    async deposit(
        @Param('walletId') walletId: string,
        @Body() requestBody: WalletDepositDto
    ) {
        await this.walletService.handleWalletDeposit(walletId, requestBody);
        return { success: true };
    }

    @Post(':walletId/withdrawal')
    async withdrawal(
        @Param('walletId') walletId: string,
        @Body() requestBody: WalletWithdrawalDto
    ) {
        await this.walletService.handleWalletWithdrawal(walletId, requestBody);
        return { success: true };
    }

    @Get('balance/:customerId')
    async getAllWalletBalances(@Param('customerId') customerId: string) {
        return this.walletService.getAllWalletBalances(customerId);
    }

    @Get('balance/:customerId/wallet/:walletId')
    async getSingleWalletBalance(
        @Param('customerId') customerId: string,
        @Param('walletId') walletId: string,
    ) {
        return this.walletService.getSingleWalletBalance(customerId, walletId);
    }
}
