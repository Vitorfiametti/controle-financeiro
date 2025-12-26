import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import Fornecedor from '@/lib/models/Fornecedor';
import PaymentMethod from '@/lib/models/PaymentMethod';
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
        const transactions = await (Transaction as any)
          .find({ userId: userId })
          .populate('fornecedor', 'name nome')
          .populate('paymentMethod', 'name nome')
          .populate('category', 'name type icon nome')
          .sort({ date: -1 })
          .lean()
          .catch((err: any) => {
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

        console.log('📝 Dados recebidos:', {
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

        // Converter nomes para IDs se necessário
        let fornecedorId = fornecedor;
        let paymentMethodId = paymentMethod;
        let categoryId = category;

        // Se fornecedor não é um ObjectId válido, buscar pelo nome
        if (fornecedor && !fornecedor.match(/^[0-9a-fA-F]{24}$/)) {
          console.log('🔍 Buscando fornecedor por nome:', fornecedor);
          const fornecedorDoc = await (Fornecedor as any).findOne({
            userId,
            $or: [
              { name: fornecedor },
              { nome: fornecedor }
            ]
          });
          
          if (fornecedorDoc) {
            fornecedorId = fornecedorDoc._id;
            console.log('✅ Fornecedor encontrado:', fornecedorId);
          } else {
            console.warn('⚠️ Fornecedor não encontrado, usando valor original');
          }
        }

        // Se paymentMethod não é um ObjectId válido, buscar pelo nome
        if (paymentMethod && !paymentMethod.match(/^[0-9a-fA-F]{24}$/)) {
          console.log('🔍 Buscando forma de pagamento por nome:', paymentMethod);
          const paymentMethodDoc = await (PaymentMethod as any).findOne({
            userId,
            $or: [
              { name: paymentMethod },
              { nome: paymentMethod }
            ]
          });
          
          if (paymentMethodDoc) {
            paymentMethodId = paymentMethodDoc._id;
            console.log('✅ Forma de pagamento encontrada:', paymentMethodId);
          } else {
            console.warn('⚠️ Forma de pagamento não encontrada, usando valor original');
          }
        }

        // Se category não é um ObjectId válido, buscar pelo nome
        if (category && !category.match(/^[0-9a-fA-F]{24}$/)) {
          console.log('🔍 Buscando categoria por nome:', category);
          const categoryDoc = await (Category as any).findOne({
            userId,
            type,
            $or: [
              { name: category },
              { nome: category }
            ]
          });
          
          if (categoryDoc) {
            categoryId = categoryDoc._id;
            console.log('✅ Categoria encontrada:', categoryId);
          } else {
            console.warn('⚠️ Categoria não encontrada, usando valor original');
          }
        }

        // Processar tags
        let processedTags = [];
        if (tags && Array.isArray(tags)) {
          processedTags = tags;
        }

        const transactionData = {
          userId: userId,
          fornecedor: fornecedorId,
          paymentMethod: paymentMethodId,
          type,
          category: categoryId,
          amount: parseFloat(amount),
          date: new Date(date),
          description: description || '',
        };

        if (processedTags.length > 0) {
          (transactionData as any).tags = processedTags;
        }

        console.log('📝 Dados finais da transação:', transactionData);

        const transaction = await (Transaction as any).create(transactionData);

        console.log('✅ Transação criada:', transaction);

        return res.status(201).json(transaction);
      } catch (error: any) {
        console.error('❌ Erro ao criar transação:', error);
        return res.status(500).json({ 
          message: error.message,
          error: 'Erro ao criar transação'
        });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const transaction = await (Transaction as any).findOneAndDelete({
          _id: id,
          userId: userId
        });

        if (!transaction) {
          return res.status(404).json({ message: 'Transação não encontrada' });
        }

        console.log('✅ Transação deletada:', id);

        return res.status(200).json({ message: 'Transação deletada com sucesso' });
      } catch (error: any) {
        console.error('❌ Erro ao deletar transação:', error);
        return res.status(500).json({ 
          message: error.message,
          error: 'Erro ao deletar transação'
        });
      }

    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}