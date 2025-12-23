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

  const userId = (session.user as any).id;

  switch (req.method) {
    case 'GET':
      try {
        const transactions = await (Transaction as any)
          .find({ userId: userId })
          .populate('fornecedor', 'name nome')
          .populate('paymentMethod', 'name')
          .populate('category', 'name type icon')
          .sort({ date: -1 })
          .lean()
          .catch((err: any) => {
            // Se populate falhar, buscar sem populate
            console.warn('⚠️ Populate falhou, buscando sem populate:', err.message);
            return (Transaction as any)
              .find({ userId: userId })
              .sort({ date: -1 })
              .lean();
          });
        
        console.log('📦 Transações encontradas:', transactions.length);
        
        return res.status(200).json(transactions || []);
      } catch (error: any) {
        console.error('❌ Erro ao buscar transações:', error);
        return res.status(500).json({ 
          message: error.message,
          error: 'Erro ao carregar transações'
        });
      }

    case 'POST':
      try {
        const { 
          fornecedor, 
          paymentMethod, 
          type, 
          category, 
          amount, 
          date, 
          description,
          tags
        } = req.body;

        console.log('📝 Criando transação:', {
          fornecedor,
          paymentMethod,
          type,
          category,
          amount,
          date,
          tags,
          userId
        });

        // Validações
        if (!fornecedor) {
          return res.status(400).json({ message: 'Fornecedor é obrigatório' });
        }

        if (!paymentMethod) {
          return res.status(400).json({ message: 'Forma de pagamento é obrigatória' });
        }

        if (!category) {
          return res.status(400).json({ message: 'Categoria é obrigatória' });
        }

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Valor inválido' });
        }

        if (!date) {
          return res.status(400).json({ message: 'Data é obrigatória' });
        }

        if (!type || (type !== 'receita' && type !== 'despesa')) {
          return res.status(400).json({ message: 'Tipo inválido' });
        }

        // Processar tags - garantir que seja array
        let processedTags = [];
        if (tags && Array.isArray(tags)) {
          processedTags = tags;
        }

        console.log('🏷️ Tags recebidas:', tags);
        console.log('🏷️ Tags processadas:', processedTags);

        const transactionData = {
          userId: userId,
          fornecedor,
          paymentMethod,
          type,
          category,
          amount: parseFloat(amount),
          date: new Date(date),
          description: description || '',
        };

        // Adicionar tags apenas se existir e não estiver vazio
        if (processedTags.length > 0) {
          (transactionData as any).tags = processedTags;
        }

        console.log('📝 Dados da transação:', transactionData);

        const transaction = await (Transaction as any).create(transactionData);

        console.log('✅ Transação criada:', transaction);

        return res.status(201).json(transaction);
      } catch (error: any) {
        console.error('❌ Erro ao criar transação:', error);
        return res.status(400).json({ 
          message: error.message,
          error: error.toString()
        });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const transaction = await (Transaction as any).findOneAndDelete({
          _id: id as string,
          userId: userId,
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transação não encontrada' });
        }

        return res.status(200).json({ message: 'Transação deletada com sucesso' });
      } catch (error: any) {
        console.error('❌ Erro ao deletar transação:', error);
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}