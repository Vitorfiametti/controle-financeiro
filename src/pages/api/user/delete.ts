import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';
import {connectDB} from '@/utils/mongodb';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import Fornecedor from '@/lib/models/Fornecedor';
import PaymentMethod from '@/lib/models/PaymentMethod';
import Category from '@/lib/models/Category';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    await connectDB();

    const userId = (session.user as any).id;

    // Deletar todas as transações do usuário
    await Transaction.deleteMany({ userId });

    // Deletar todos os fornecedores do usuário
    await Fornecedor.deleteMany({ userId });

    // Deletar todas as formas de pagamento do usuário
    await PaymentMethod.deleteMany({ userId });

    // Deletar todas as categorias do usuário
    await Category.deleteMany({ userId });

    // Por último, deletar o usuário
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ 
      message: 'Conta deletada com sucesso',
      deleted: true 
    });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    return res.status(500).json({ message: 'Erro ao deletar conta' });
  }
}