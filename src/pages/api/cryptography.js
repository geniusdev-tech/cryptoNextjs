import crypto from 'crypto';
import { IncomingForm } from 'formidable';
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

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        res.status(500).json({ error: 'Erro ao processar o arquivo' });
        return;
      }

      const { action, password } = fields;
      const filePath = files.file ? files.file.filepath : null;
      const folderPath = files.folder ? files.folder.filepath : null;
      let success = false;

      console.log('File path:', filePath);
      console.log('Folder path:', folderPath);

      if (filePath) {
        success = process_file(filePath, password, action === 'encrypt');
      } else if (folderPath) {
        success = process_folder(folderPath, password, action === 'encrypt');
      }

      if (success) {
        const fileHash = filePath ? generate_file_hash(filePath) : null;
        res.status(200).json({ message: `${action}ed successfully`, hash: fileHash });
      } else {
        console.error('Error processing file/folder');
        res.status(500).json({ error: 'Erro ao processar.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};

export default handler;
