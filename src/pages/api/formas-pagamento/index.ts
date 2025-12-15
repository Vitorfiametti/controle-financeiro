import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import FormaPagamento from '@/lib/models/FormaPagamento';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  await connectDB();

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const formasPagamento = await FormaPagamento.find({ userId })
          .sort({ nome: 1 })
          .lean();
        return res.status(200).json(formasPagamento);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case 'POST':
      try {
        const { nome } = req.body;

        if (!nome || !nome.trim()) {
          return res.status(400).json({ message: 'Nome é obrigatório' });
        }

        const formaPagamento = await FormaPagamento.create({
          userId,
          nome: nome.trim(),
        });

        return res.status(201).json(formaPagamento);
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ message: 'Esta forma de pagamento já existe' });
        }
        return res.status(400).json({ message: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const formaPagamento = await FormaPagamento.findOneAndDelete({
          _id: id,
          userId,
        });

        if (!formaPagamento) {
          return res.status(404).json({ message: 'Forma de pagamento não encontrada' });
        }

        return res.status(200).json({ message: 'Forma de pagamento excluída com sucesso' });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}