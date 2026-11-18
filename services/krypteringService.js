import fs from 'node:fs';
import crypto from 'crypto'

const OFFENTLIG = 'keys/offentlig_noegle.pem';
const PRIVAT = 'keys/privat_noegle.pem';

export function genererNoegler() {
    if (fs.existsSync(OFFENTLIG) && fs.existsSync(PRIVAT)) return;

    fs.mkdirSync('keys', { recursive: true });

    crypto.generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    }, (err, publicKey, privateKey) => {
        if (err) return console.error('Error with keygeneration occured:', err);

        fs.writeFileSync('offentlig_noegle.pem', publicKey);
        fs.writeFileSync('privat_noegle.pem', privateKey);
    });
}

export function krypterBesked(besked) {
    const publicKey = fs.readFileSync('offentlig_noegle.pem', 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(besked));
    console.log('KRYPTERET:', besked, '->', encrypted.toString('base64').slice(0, 30));
    return encrypted.toString('base64');
}

export function dekrypterBesked(encryptedBase64) {
    const privateKey = fs.readFileSync('privat_noegle.pem', 'utf8');
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedBase64, 'base64'));
    return decrypted.toString();
}