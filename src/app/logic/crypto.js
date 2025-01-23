import crypto from 'crypto';
import fs from 'fs';

const algorithm = 'camellia-256-cbc';

export const generate_file_hash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

export const process_file = (filePath, password, encrypt = true) => {
  const data = fs.readFileSync(filePath);
  const key = crypto.scryptSync(password, 'salt', 32);
  
  if (encrypt) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    fs.writeFileSync(filePath, Buffer.concat([iv, encrypted]));
    return true;
  } else {
    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    fs.writeFileSync(filePath, decrypted);
    return true;
  }
};

export const process_folder = (folderPath, password, encrypt = true) => {
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = `${folderPath}/${file}`;
    process_file(filePath, password, encrypt);
  }
};
