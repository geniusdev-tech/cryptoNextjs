import formidable from 'formidable';
import fs from 'fs';
import { process_file, process_folder, generate_file_hash } from '../api/auth/crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao processar o arquivo' });
        return;
      }

      const { action, password } = fields;
      const filePath = files.file ? files.file.filepath : null;
      const folderPath = files.folder ? files.folder.filepath : null;
      let success = false;

      if (filePath) {
        success = process_file(filePath, password, action === 'encrypt');
      } else if (folderPath) {
        process_folder(folderPath, password, action === 'encrypt');
        success = true;
      }

      if (success) {
        const fileHash = filePath ? generate_file_hash(filePath) : null;
        res.status(200).json({ message: `${action}ed successfully`, hash: fileHash });
      } else {
        res.status(500).json({ error: 'Erro ao processar.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};

export default handler;
