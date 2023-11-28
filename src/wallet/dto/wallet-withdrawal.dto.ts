import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class WalletWithdrawalDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number
}