import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function hashPassword( password: string){
    return await bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string){
    return await bcrypt.compare(password, hash)
}

export async function generateToken(id: number){
    return jwt.sign({id}, process.env.JWT_SECRET!, {expiresIn: '7d'})
}

export async function verifyToken(token: string){
    return jwt.verify(token, process.env.JWT_SECRET!)
}