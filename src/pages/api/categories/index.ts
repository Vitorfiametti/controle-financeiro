import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  await connectDB();

  const userId = (session.user as any).id;

  switch (req.method) {
    case 'GET':
      try {
        const categories = await (Category as any).find({ userId: userId })
          .sort({ name: 1 })
          .lean();
        
        console.log('📦 Categorias encontradas:', categories.length);
        
        return res.status(200).json(categories);
      } catch (error: any) {
        console.error('❌ Erro ao buscar categorias:', error);
        return res.status(500).json({ message: error.message });
      }

    case 'POST':
      try {
        const { name, type, icon } = req.body;

        console.log('📝 Criando categoria:', { name, type, icon, userId });

        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Nome é obrigatório' });
        }

        const category = await (Category as any).create({
          userId: userId,
          name: name.trim(),
          type: type || 'despesa',
          icon: icon || '💰'
        });

        console.log('✅ Categoria criada:', category);

        return res.status(201).json(category);
      } catch (error: any) {
        console.error('❌ Erro ao criar categoria:', error);
        return res.status(400).json({ message: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const category = await (Category as any).findOneAndDelete({
          _id: id as string,
          userId: userId,
        });

        if (!category) {
          return res.status(404).json({ message: 'Categoria não encontrada' });
        }

        return res.status(200).json({ message: 'Categoria deletada com sucesso' });
      } catch (error: any) {
        console.error('❌ Erro ao deletar categoria:', error);
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}