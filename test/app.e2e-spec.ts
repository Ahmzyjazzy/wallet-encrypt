import {
  INestApplication, ValidationPipe
} from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'
import { Customer } from '@prisma/client'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  let validCustomerId: string

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


  describe('Customer', () => {

    it('should throw if no body param supplied', () => {
      return pactum
        .spec()
        .post(`/customer`)
        .expectStatus(400)
    })

    it('should create customer', async () => {
      const response = await pactum
        .spec()
        .post('/customer')
        .withBody({
          name: "Ahmed Olanrewaju",
          username: "Ahmzyjazzy"
        })
        .expectStatus(201)
        .expectBodyContains('customerId')
        .expectBodyContains('customerName')
        .expectBodyContains('wallets')

      validCustomerId = response.json.customerId;
      return response
    })

    it('should throw if customer already exists', async () => {
      return await pactum
        .spec()
        .post('/customer')
        .withBody({
          name: "Ahmed Olanrewaju",
          username: "Ahmzyjazzy"
        })
        .expectStatus(403)
    })

  })

  describe('Balance', () => {

    describe('Multiple Wallet Balance', () => {

      it('should throw if customer balances does not exist', () => {
        const fakeCustomerId = '92929292'
        return pactum
          .spec()
          .get(`/balance/${fakeCustomerId}`)
          .expectStatus(403)
      })

      it('should retrieve customer wallet balances', () => {
        return pactum
          .spec()
          .get(`/balance/${validCustomerId}`)
          .expectStatus(200)
        .inspect()
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