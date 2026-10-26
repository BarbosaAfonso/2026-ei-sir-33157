const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta definir MONGODB_URI no ficheiro .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('Ligado ao MongoDB Atlas');
  } catch (err) {
    console.error('Erro ao ligar ao MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
