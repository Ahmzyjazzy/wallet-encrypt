import { ForbiddenException, Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service'
import { PrismaService } from '../prisma/prisma.service'
import { Customer, Wallet } from '@prisma/client';
import { CreateCustomerDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CustomerService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async createCustomer(
        dto: CreateCustomerDto
    ): Promise<{
        customerId: string, customerName: string, wallets: { walletId: string }[]
    }> {
        try {

            const customer = await this.prisma.customer.create({
                data: {
                    name: dto.name,
                    username: dto.username
                },
            })

            const wallet = await this.mapCustomerToWallet(customer.id)

            // Initialize balance for the wallet, assuming starting balance is zero
            this.mapWalletToBalance(customer.id, wallet.id, 0)

            const customerData = await this.prisma.customer.findFirstOrThrow({
                where: {
                    id: customer.id,
                },
                include: {
                    wallets: true
                }
            })

            return {
                customerId: customerData.id,
                customerName: customerData.name,
                wallets: customerData.wallets.map(({ id: walletId }) => ({ walletId }))
            }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Username already taken')
                }
            }
            throw new ForbiddenException(error.message)
        }

    }

    async mapCustomerToWallet(customerId: string): Promise<Wallet> {
        return await this.prisma.wallet.create({
            data: {
                customerId,
            },
        });
    }

    async mapWalletToBalance(customerId: string, walletId: string, initialBalance: number): Promise<void> {
        const encryptedBalance = this.encryptionService.encrypt(initialBalance.toString());

        await this.prisma.balance.create({
            data: {
                customerId,
                walletId,
                amount: encryptedBalance,
            },
        });
    }

}
