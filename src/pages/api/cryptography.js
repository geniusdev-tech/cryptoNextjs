import crypto from 'crypto';
import { IncomingForm } from 'formidable';
import fs from 'fs';

const algorithm = 'camellia-256-cbc';

export const generate_file_hash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('Erro ao gerar hash do arquivo:', error);
    throw new Error('Falha ao gerar hash do arquivo');
  }
};

export const process_file = (filePath, password, encrypt = true) => {
  try {
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
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    throw new Error('Falha ao processar o arquivo');
  }
};

export const process_folder = (folderPath, password, encrypt = true) => {
  try {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      process_file(filePath, password, encrypt);
    }
    return true;
  } catch (error) {
    console.error('Erro ao processar a pasta:', error);
    throw new Error('Falha ao processar a pasta');
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erro ao parsear o formulário:', err);
      return res.status(500).json({ error: 'Erro ao processar o arquivo' });
    }

    try {
      // Tratar os campos como arrays e pegar o primeiro valor
      const action = Array.isArray(fields.action) ? fields.action[0] : fields.action;
      const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;

      // Validação dos campos obrigatórios
      if (!action || !password) {
        return res.status(400).json({ error: 'Ação e senha são obrigatórios' });
      }

      if (action !== 'encrypt' && action !== 'decrypt') {
        return res.status(400).json({ error: 'Ação inválida. Use "encrypt" ou "decrypt"' });
      }

      // Verificar se um arquivo foi enviado
      const file = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;
      const folder = files.folder ? (Array.isArray(files.folder) ? files.folder[0] : files.folder) : null;

      if (!file && !folder) {
        return res.status(400).json({ error: 'Nenhum arquivo ou pasta foi enviado' });
      }

      let success = false;
      let fileHash = null;

      if (file) {
        const filePath = file.filepath;
        success = process_file(filePath, password, action === 'encrypt');
        if (success) {
          fileHash = generate_file_hash(filePath);
        }
      } else if (folder) {
        const folderPath = folder.filepath;
        success = process_folder(folderPath, password, action === 'encrypt');
      }

      if (success) {
        return res.status(200).json({
          message: `Arquivo ${action === 'encrypt' ? 'criptografado' : 'descriptografado'} com sucesso`,
          hash: fileHash,
        });
      } else {
        return res.status(500).json({ error: 'Erro ao processar o arquivo/pasta' });
      }
    } catch (error) {
      console.error('Erro no processamento:', error);
      return res.status(500).json({ error: 'Erro ao processar a solicitação: ' + error.message });
    }
  });
};

export default handler;