import {
  INestApplication, ValidationPipe
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }))

    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()

    pactum.request.setBaseUrl('http://localhost:3333')
  })

  afterAll(() => {
    app.close()
  })

  describe('Balance', () => {

    describe('Multiple Wallet Balance', () => {

      it('should throw if no customer balances does not exist', () => {
        const fakeCustomerId = '92929292'
        return pactum
          .spec()
          .get(`/balance/${fakeCustomerId}`)
          .expectStatus(403)
      })

      it('should retrieve customer wallet balances', () => {
        const validCustomerId = '92929292'
        return pactum
          .spec()
          .get(`/balance/${validCustomerId}`)
          .expectStatus(200)
      })

    })

    describe('Single Wallet Balance', () => {

      it('should throw if customer balance does not exist', () => {
        const fakeCustomerId = '92929292'
        const fakeWalletId = '92929292'
        return pactum
          .spec()
          .get(`/balance/${fakeCustomerId}/wallet/${fakeWalletId}`)
          .expectStatus(403)
      })

      it('should retrieve customer wallet balance', () => {
        const customerId = '92929292'
        const walletId = '92929292'
        return pactum
          .spec()
          .get(`/balance/${customerId}/wallet/${walletId}`)
          .expectStatus(200)
      })
    })

  })

})