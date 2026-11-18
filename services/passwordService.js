import crypto from 'node:crypto';

// Laver en hash af et kodeord. Resultatet er "salt:hash"
//Salt er et tilfældigt ord, så vi ikke får kollisioner,
// hvis kodeord på forskellige brugere er den samme
export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    return `${salt}:${hash}`;
}

// Tjekker om et kodeord passer til den gemte "salt:hash"
export function tjekPassword(password, gemt) {
    if (!gemt || !gemt.includes(':')) return false;

    const [salt, hash] = gemt.split(':');
    const nyHash = crypto.createHash('sha256').update(salt + password).digest('hex');

    return nyHash === hash;
}