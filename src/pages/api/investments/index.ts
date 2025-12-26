import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import Investment from '@/lib/models/Investment';
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
        const investments = await (Investment as any).find({ userId })
          .sort({ data: -1 })
          .lean();
        return res.status(200).json(investments);
      } catch (error: any) {
        return res.status(500).json({ message: error.message });
      }

    case 'POST':
      try {
        const { tipo, categoria, instituicao, valor, rentabilidade, data, observacao } = req.body;

        // Verificar saldo disponível para aplicações
        if (tipo === 'aplicacao') {
          const transactions = await (Transaction as any).find({ userId });
          const receitas = transactions
            .filter((t: any) => t.type === 'receita')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          const despesas = transactions
            .filter((t: any) => t.type === 'despesa')
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
          const saldoAtual = receitas - despesas;

          if (parseFloat(valor) > saldoAtual) {
            return res.status(400).json({
              message: `Saldo insuficiente! Saldo disponível: R$ ${saldoAtual.toFixed(2)}`,
            });
          }
        }

        // Criar investimento
        const investment = await (Investment as any).create({
          userId,
          tipo,
          categoria,
          instituicao,
          valor: parseFloat(valor),
          rentabilidade: parseFloat(rentabilidade || 0),
          data,
          observacao,
        });

        // ========== BUSCAR OU CRIAR IDS CORRETOS ==========
        
        // 1. Buscar ou criar fornecedor (instituição)
        let fornecedorDoc = await (Fornecedor as any).findOne({
          userId,
          $or: [
            { name: instituicao },
            { nome: instituicao }
          ]
        });

        if (!fornecedorDoc) {
          console.log('🏦 Criando fornecedor:', instituicao);
          fornecedorDoc = await (Fornecedor as any).create({
            userId,
            name: instituicao,
            nome: instituicao
          });
        }

        // 2. Buscar ou criar categoria "Movimentação de Investimento"
        const tipoTransacao = tipo === 'aplicacao' ? 'despesa' : 'receita';
        let categoryDoc = await (Category as any).findOne({
          userId,
          type: tipoTransacao,
          $or: [
            { name: 'Movimentação de Investimento' },
            { nome: 'Movimentação de Investimento' }
          ]
        });

        if (!categoryDoc) {
          console.log('📂 Criando categoria: Movimentação de Investimento');
          categoryDoc = await (Category as any).create({
            userId,
            name: 'Movimentação de Investimento',
            nome: 'Movimentação de Investimento',
            type: tipoTransacao,
            icon: '💼'
          });
        }

        // 3. Buscar ou criar forma de pagamento "Transferência Investimento"
        let paymentMethodDoc = await (PaymentMethod as any).findOne({
          userId,
          $or: [
            { name: 'Transferência Investimento' },
            { nome: 'Transferência Investimento' }
          ]
        });

        if (!paymentMethodDoc) {
          console.log('💳 Criando forma de pagamento: Transferência Investimento');
          paymentMethodDoc = await (PaymentMethod as any).create({
            userId,
            name: 'Transferência Investimento',
            nome: 'Transferência Investimento'
          });
        }

        // ========== CRIAR TRANSAÇÃO COM IDS CORRETOS ==========
        
        const valorTransacao = Math.abs(parseFloat(valor)); // Sempre positivo
        
        await (Transaction as any).create({
          userId,
          description: `${tipo === 'aplicacao' ? 'Aplicação' : 'Resgate'} em ${categoria} - ${instituicao}`,
          amount: valorTransacao,
          category: categoryDoc._id, // ✅ ID
          date: data,
          type: tipoTransacao,
          fornecedor: fornecedorDoc._id, // ✅ ID
          paymentMethod: paymentMethodDoc._id, // ✅ ID
          observacao: `[AUTO] Ref. Investimento ID: ${investment._id}`,
          isInvestmentTransfer: true,
        });

        console.log('✅ Investimento e transação criados com sucesso!');

        return res.status(201).json(investment);
      } catch (error: any) {
        console.error('❌ Erro ao criar investimento:', error);
        return res.status(400).json({ message: error.message });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const investment = await (Investment as any).findOneAndUpdate(
          { _id: id, userId },
          {
            ...updateData,
            valor: parseFloat(updateData.valor),
            rentabilidade: parseFloat(updateData.rentabilidade || 0),
          },
          { new: true, runValidators: true }
        );

        if (!investment) {
          return res.status(404).json({ message: 'Investimento não encontrado' });
        }

        // Atualizar transação automática associada
        await (Transaction as any).findOneAndUpdate(
          {
            userId,
            observacao: { $regex: `Ref\\. Investimento ID: ${id}` },
          },
          {
            description: `${investment.tipo === 'aplicacao' ? 'Aplicação' : 'Resgate'} em ${investment.categoria} - ${investment.instituicao}`,
            amount: Math.abs(investment.valor),
            type: investment.tipo === 'aplicacao' ? 'despesa' : 'receita',
            date: investment.data,
          }
        );

        return res.status(200).json(investment);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        // Deletar transações automáticas associadas
        await (Transaction as any).deleteMany({
          userId,
          observacao: { $regex: `Ref\\. Investimento ID: ${id}` },
        });

        // Deletar investimento
        const investment = await (Investment as any).findOneAndDelete({
          _id: id,
          userId,
        });

        if (!investment) {
          return res.status(404).json({ message: 'Investimento não encontrado' });
        }

        return res.status(200).json({ message: 'Investimento excluído com sucesso' });
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}