// Backend simples para servir questões do MongoDB
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configurações
const MONGODB_URI = '';
const DATABASE_NAME = 'genem';

let db;

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// GET /api/questions/random - Buscar questões aleatórias
app.get('/api/questions/random', async (req, res) => {
  try {
    const { count = 5, discipline, year } = req.query;
    
    const pipeline = [];
    
    // Filtros
    const matchConditions = {};
    if (discipline) matchConditions.discipline = discipline;
    if (year) matchConditions.year = parseInt(year);
    
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }
    
    // Amostragem aleatória
    pipeline.push({ $sample: { size: parseInt(count) } });
    
    const questions = await db.collection('questions').aggregate(pipeline).toArray();
    
    // Converter ObjectId para string e log dos IDs para debug
    const questionsWithStringIds = questions.map(q => ({
      ...q,
      _id: q._id.toString() // Garantir que _id seja sempre string
    }));
    
    questionsWithStringIds.forEach(q => {
      console.log(`📋 Questão: ${q.title} - ID: ${q._id}`);
    });
    
    console.log(`🔍 Found ${questionsWithStringIds.length} questions for discipline: ${discipline || 'any'}`);
    res.json(questionsWithStringIds);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /api/questions/disciplines - Buscar disciplinas disponíveis
app.get('/api/questions/disciplines', async (req, res) => {
  try {
    const disciplines = await db.collection('questions').distinct('discipline');
    console.log('📚 Available disciplines:', disciplines);
    res.json(disciplines);
  } catch (error) {
    console.error('Error fetching disciplines:', error);
    res.status(500).json({ error: 'Failed to fetch disciplines' });
  }
});

// GET /api/questions/years - Buscar anos disponíveis
app.get('/api/questions/years', async (req, res) => {
  try {
    const years = await db.collection('questions').distinct('year');
    const sortedYears = years.sort((a, b) => b - a);
    console.log('📅 Available years:', sortedYears);
    res.json(sortedYears);
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

// GET /api/questions/:id - Buscar questão por ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await db.collection('questions').findOne({ _id: id });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Questions API is running' });
});

// Iniciar servidor
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Questions API running on http://localhost:${PORT}`);
    console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
