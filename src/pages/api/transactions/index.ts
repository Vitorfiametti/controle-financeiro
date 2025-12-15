import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';

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
        const transactions = await Transaction.find({ userId })
          .sort({ date: -1 })
          .lean();
        return res.status(200).json(transactions);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case 'POST':
      try {
        const transactionData = {
          ...req.body,
          userId,
          amount: parseFloat(req.body.amount),
        };

        const transaction = await Transaction.create(transactionData);
        return res.status(201).json(transaction);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const transaction = await Transaction.findOneAndUpdate(
          { _id: id, userId },
          { ...updateData, amount: parseFloat(updateData.amount) },
          { new: true, runValidators: true }
        );

        if (!transaction) {
          return res.status(404).json({ message: 'Transação não encontrada' });
        }

        return res.status(200).json(transaction);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const transaction = await Transaction.findOneAndDelete({
          _id: id,
          userId,
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transação não encontrada' });
        }

        return res.status(200).json({ message: 'Transação excluída com sucesso' });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}