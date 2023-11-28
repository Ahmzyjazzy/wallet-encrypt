import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class WalletDepositDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number
}