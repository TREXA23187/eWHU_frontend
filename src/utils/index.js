const crypto = require('crypto')

/**
 * 加密方法
 * @param key 加密key
 * @param iv       向量
 * @param data     需要加密的数据
 * @returns string
 */

const key = '751f621ea5c8f930'
const iv = '2624750004598718'

export const encrypt = function(data) {
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
    const crypted = cipher.update(data, 'utf8', 'binary')
    crypted += cipher.final('binary')
    crypted = Buffer.from(crypted, 'binary').toString('base64')
    return crypted
}

/**
 * 解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 * @returns string
 */
export const decrypt = function(crypted) {
    crypted = Buffer.from(crypted, 'base64').toString('binary')
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const decoded = decipher.update(crypted, 'binary', 'utf8')
    decoded += decipher.final('utf8')
    return decoded
}

const key = '751f621ea5c8f930'
console.log('加密的key:', key.toString('hex'))
const iv = '2624750004598718'
console.log('加密的iv:', iv)
// const data = "Hello, nodejs. 演示aes-128-cbc加密和解密";
const data = JSON.stringify({ user: 'www', pass: 'wwwww/' })
console.log('需要加密的数据:', data)
const crypted = encrypt(key, iv, data)
console.log('数据加密后:', crypted)
const dec = decrypt(key, iv, crypted)
console.log('数据解密后:', JSON.parse(dec))
