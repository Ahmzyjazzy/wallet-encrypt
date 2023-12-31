import { ForbiddenException, Injectable } from '@nestjs/common'
import { WalletDepositDto, WalletWithdrawalDto } from './dto'
import { PrismaService } from '../prisma/prisma.service'
import { EncryptionService } from '../encryption/encryption.service'

@Injectable()
export class WalletService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService
    ) { }

    async handleWalletDeposit(walletId: string, walletDeposit: WalletDepositDto) {
        /**
         * TODO: handle withdrawal criteria logic here:
         * e.g checking the following
         * - check if deposit source is card, intra-bank or inter-bank transfer
         * - use the deposit source to hanlde deposit verification
         * -- e.g using a payment processor to initialize and verify card transaction
         * -- e.g using the NIBSS Easypay to re-query transfer-in status
         *
         * This use-case focus only on updating the wallet balance if all above actions are successful
         * i.e if the deposit is valid
         * !Note: always implement rate-limiting, idempotency, transaction row-level locking for ACID
         */

        return await this
            .updateWalletBalance(walletId, walletDeposit.amount, 'deposit', 'deposit description')
    }

    async handleWalletWithdrawal(walletId: string, walletWithdrawal: WalletWithdrawalDto) {
        /** 
         * TODO: handle withdrawal criteria logic here:
         * e.g checking the following
         * - check if user balance can perform the requested withdrawal
         * - customer account tier to determine transaction limits
         * - - single transaction limit
         * - - daily transaction limit
         * - - cummulative transaction limit
         * - call service to perfrom transfer, most time its always asynchronous and you need
         * webhook, message broker or queue system implace to get status before updating 
         * transaction status abd wallet balance
         * 
         * This use-case focus only on updating the wallet balance if all above actions are successful
         * !Note: always implement rate-limiting, idempotency, transaction row-level locking for ACID
         */

        return await this
            .updateWalletBalance(walletId, walletWithdrawal.amount, 'withdrawal', 'withdrawal description')
    }

    async updateWalletBalance(walletId: string, amount: number, type: 'deposit' | 'withdrawal', description: string) {
        const encryptedAmount = this.encryptionService.encrypt(amount.toString())

        // Use Prisma transaction with 'serializable' isolation level
        return this.prisma.$transaction(async (prismaTransaction) => {

            const wallet = await prismaTransaction.wallet.findFirst({
                where: { id: walletId, },
                include: { customer: true }
            })
            if (!wallet) throw new ForbiddenException()

            const customerId = wallet.customer.id

            // Create a transaction
            const transaction = await prismaTransaction.transaction.create({
                data: {
                    walletId,
                    customerId,
                    type,
                    description, //! You can use a custom txn description generation service
                    amount: encryptedAmount
                },
            })

            // Get the current balance
            const currentBalance = wallet.balance
            const balanceBefore = currentBalance ? this.encryptionService.decrypt(currentBalance) : '0'

            const balanceAfter = type === 'deposit'
                ? this.encryptionService.encrypt((+balanceBefore + amount).toString())
                : this.encryptionService.encrypt((+balanceBefore - amount).toString())

            // Update the balance
            await prismaTransaction.wallet.update({
                where: {
                    id: walletId,
                    customerId,
                },
                data: {
                    customerId,
                    balance: encryptedAmount
                }
            })

            // Create a ledger entry
            const encryptedBalanceBefore = this.encryptionService.encrypt(balanceBefore.toString())
            await prismaTransaction.ledgerEntry.create({
                data: {
                    customerId,
                    walletId,
                    transactionId: transaction.id,
                    balanceBefore: encryptedBalanceBefore,
                    balanceAfter,
                },
            })
        })
    }

    async getAllWalletBalances(customerId: string) {
        const wallets = await this.prisma.wallet.findMany({
            where: { customerId }
        })

        if (wallets.length === 0) throw new ForbiddenException()

        return wallets.map(wallet => ({
            walletId: wallet.id,
            amount: this.encryptionService.decrypt(wallet.balance),
        }))
    }

    async getSingleWalletBalance(customerId: string, walletId: string) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: walletId, customerId }
        })

        if (!wallet) throw new ForbiddenException()

        return {
            walletId: wallet.id,
            amount: parseInt(this.encryptionService.decrypt(wallet.balance)),
        }
    }
}
