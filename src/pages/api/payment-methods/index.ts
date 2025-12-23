import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import PaymentMethod from '@/lib/models/PaymentMethod';

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
        const methods = await (PaymentMethod as any).find({ userId: userId })
          .sort({ name: 1 })
          .lean();
        
        console.log('📦 Formas de pagamento encontradas:', methods.length);
        
        return res.status(200).json(methods);
      } catch (error: any) {
        console.error('❌ Erro ao buscar:', error);
        return res.status(500).json({ message: error.message });
      }

    case 'POST':
      try {
        const { name } = req.body;

        console.log('📝 Criando forma de pagamento:', { name, userId });

        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Nome é obrigatório' });
        }

        const method = await (PaymentMethod as any).create({
          userId: userId,
          name: name.trim(),
        });

        console.log('✅ Criado:', method);

        return res.status(201).json(method);
      } catch (error: any) {
        console.error('❌ Erro ao criar:', error);
        return res.status(400).json({ message: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const method = await (PaymentMethod as any).findOneAndDelete({
          _id: id as string,
          userId: userId,
        });

        if (!method) {
          return res.status(404).json({ message: 'Não encontrado' });
        }

        return res.status(200).json({ message: 'Deletado com sucesso' });
      } catch (error: any) {
        console.error('❌ Erro ao deletar:', error);
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}