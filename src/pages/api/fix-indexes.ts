import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectDB();

    // Pegar a collection de fornecedores
    const db = mongoose.connection.db;
    const collection = db.collection('fornecedors');

    console.log('🔍 Verificando índices...');

    // Listar todos os índices
    const indexes = await collection.indexes();
    console.log('📋 Índices atuais:', indexes);

    // Remover TODOS os índices exceto _id
    console.log('🗑️ Removendo índices problemáticos...');
    
    for (const index of indexes) {
      // Não deletar o índice _id (padrão do MongoDB)
      if (index.name !== '_id_') {
        console.log(`Deletando índice: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    console.log('✅ Índices removidos!');

    // Listar novamente para confirmar
    const newIndexes = await collection.indexes();
    console.log('📋 Índices restantes:', newIndexes);

    return res.status(200).json({
      message: '✅ Índices únicos removidos com sucesso!',
      antes: indexes.length,
      depois: newIndexes.length,
      removidos: indexes.filter(i => i.name !== '_id_').map(i => i.name)
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return res.status(500).json({ 
      message: error.message,
      error: error.toString()
    });
  }
}