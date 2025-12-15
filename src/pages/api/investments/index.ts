import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import connectDB from '@/lib/mongodb';
import Investment from '@/lib/models/Investment';
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
        const investments = await Investment.find({ userId })
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
          const transactions = await Transaction.find({ userId });
          const receitas = transactions
            .filter(t => t.type === 'receita')
            .reduce((sum, t) => sum + t.amount, 0);
          const despesas = transactions
            .filter(t => t.type === 'despesa')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const saldoAtual = receitas - despesas;

          if (parseFloat(valor) > saldoAtual) {
            return res.status(400).json({
              message: `Saldo insuficiente! Saldo disponível: R$ ${saldoAtual.toFixed(2)}`,
            });
          }
        }

        // Criar investimento
        const investment = await Investment.create({
          userId,
          tipo,
          categoria,
          instituicao,
          valor: parseFloat(valor),
          rentabilidade: parseFloat(rentabilidade || 0),
          data,
          observacao,
        });

        // Criar transação automática
        const valorTransacao = tipo === 'aplicacao' ? -Math.abs(parseFloat(valor)) : Math.abs(parseFloat(valor));
        const tipoTransacao = tipo === 'aplicacao' ? 'despesa' : 'receita';

        await Transaction.create({
          userId,
          description: `${tipo === 'aplicacao' ? 'Aplicação' : 'Resgate'} em ${categoria} - ${instituicao}`,
          amount: valorTransacao,
          category: 'Movimentação de Investimento',
          date: data,
          type: tipoTransacao,
          fornecedor: instituicao,
          formaPagamento: 'Transferência Investimento',
          observacao: `[AUTO] Ref. Investimento ID: ${investment._id}`,
          isInvestmentTransfer: true,
        });

        return res.status(201).json(investment);
      } catch (error: any) {
        return res.status(400).json({ message: error.message });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório' });
        }

        const investment = await Investment.findOneAndUpdate(
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
        await Transaction.findOneAndUpdate(
          {
            userId,
            observacao: { $regex: `Ref\\. Investimento ID: ${id}` },
          },
          {
            description: `${investment.tipo === 'aplicacao' ? 'Aplicação' : 'Resgate'} em ${investment.categoria} - ${investment.instituicao}`,
            amount: investment.tipo === 'aplicacao' ? -investment.valor : investment.valor,
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
        await Transaction.deleteMany({
          userId,
          observacao: { $regex: `Ref\\. Investimento ID: ${id}` },
        });

        // Deletar investimento
        const investment = await Investment.findOneAndDelete({
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