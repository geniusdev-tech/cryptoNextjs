import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Configuração da conexão com o MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor, defina a variável de ambiente MONGODB_URI no arquivo .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Definição do modelo de Usuário
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, insira um nome'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor, insira uma senha'],
  },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const register = async (name, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, password: hashedPassword });
};

const login = async (name, password) => {
  const user = await User.findOne({ name });
  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
};

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'POST':
      const { action, name, password } = req.body;

      if (action === 'register') {
        try {
          const user = await register(name, password);
          res.status(201).json({ success: true, data: user });
        } catch {
          res.status(400).json({ success: false, error: 'Erro ao registrar usuário' });
        }
      } else if (action === 'login') {
        try {
          const user = await login(name, password);
          if (user) {
            res.status(200).json({ success: true, data: user });
          } else {
            res.status(401).json({ success: false, error: 'Nome ou senha incorretos' });
          }
        } catch {
          res.status(400).json({ success: false, error: 'Erro ao fazer login' });
        }
      } else {
        res.status(400).json({ success: false, error: 'Ação inválida' });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Método não permitido' });
      break;
  }
}
