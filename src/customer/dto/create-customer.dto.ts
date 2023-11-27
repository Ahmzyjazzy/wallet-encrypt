import {
    IsNotEmpty, IsString
} from "class-validator"

export class CreateCustomerDto {
    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    name: string
}