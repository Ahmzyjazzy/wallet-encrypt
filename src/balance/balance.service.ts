import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class BalanceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService
    ) { }

    async getWalletBalances(customerId: string) {
        const walletBalances = await this.prisma.balance.findMany({
            where: { customerId }
        });

        if (walletBalances.length === 0) throw new ForbiddenException()

        return walletBalances.map(balance => ({
            id: balance.id,
            walletId: balance.walletId,
            amount: this.encryptionService.decrypt(balance.amount),
        }));
    }

    async getWalletBalance(customerId: string, walletId: string) {
        const balance = await this.prisma.balance.findFirst({
            where: { customerId, walletId }
        });

        if (!balance) throw new ForbiddenException()

        return balance ?
            {
                walletId: balance.walletId,
                amount: parseInt(this.encryptionService.decrypt(balance.amount)),
            } : balance
    }

}
