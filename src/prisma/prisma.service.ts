import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {

    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL')
                }
            }
        })
    }

    cleanDb() {
        // !only executed for test database cleanup
        return this.$transaction([
            this.customer.deleteMany(),
            this.ledgerEntry.deleteMany(),
            this.transaction.deleteMany(),
            this.balance.deleteMany(),
            this.wallet.deleteMany()
        ])
    }
}
