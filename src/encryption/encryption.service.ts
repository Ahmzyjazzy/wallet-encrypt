import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class EncryptionService {
    // process.env.ENCRYPTION_KEY = process.env.crypto.randomBytes(32).toString('hex')
    // process.env.IV_KEY = crypto.randomBytes(16).toString('hex')
    
    private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    private algorithm = 'aes-256-cbc'
    private iv = Buffer.from(process.env.IV_KEY, 'hex')

    encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)
        let encrypted = cipher.update(text, 'utf-8', 'hex')
        encrypted += cipher.final('hex')
        return encrypted
    }

    decrypt(text: string): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv)
        let decrypted = decipher.update(text, 'hex', 'utf-8')
        decrypted += decipher.final('utf-8')
        return decrypted;
    }
}
