// Type guards e helpers para trabalhar com tipos flexíveis

import type { ITransaction } from '@/types';

// Type guard para verificar se é um objeto com name
export function hasName(obj: any): obj is { name: string } {
  return obj && typeof obj === 'object' && 'name' in obj && typeof obj.name === 'string';
}

// Type guard para verificar se é um objeto com icon
export function hasIcon(obj: any): obj is { icon: string } {
  return obj && typeof obj === 'object' && 'icon' in obj && typeof obj.icon === 'string';
}

// Helper para extrair nome de fornecedor
export function getFornecedorName(fornecedor: ITransaction['fornecedor']): string {
  if (typeof fornecedor === 'string') return fornecedor;
  if (!fornecedor) return 'Sem fornecedor';
  return fornecedor.name || fornecedor.nome || 'Sem fornecedor';
}

// Helper para extrair nome de categoria
export function getCategoryName(category: ITransaction['category']): string {
  if (typeof category === 'string') return category;
  if (!category) return 'Sem categoria';
  if (hasName(category)) return category.name;
  return 'Sem categoria';
}

// Helper para extrair ícone de categoria
export function getCategoryIcon(category: ITransaction['category']): string {
  if (typeof category === 'string') return '📊';
  if (!category) return '📊';
  if (hasIcon(category)) return category.icon;
  return '📊';
}

// Helper para extrair nome de forma de pagamento
export function getPaymentMethodName(transaction: ITransaction): string {
  const paymentMethod = transaction.paymentMethod || (transaction as any).formaPagamento;
  
  if (typeof paymentMethod === 'string') return paymentMethod;
  if (!paymentMethod) return 'Sem pagamento';
  if (hasName(paymentMethod)) return paymentMethod.name;
  return 'Sem pagamento';
}

// Helper para extrair texto de tag
export function getTagText(tag: any): string {
  if (typeof tag === 'string') return tag;
  return tag.text || tag.name || '';
}

// Helper para extrair cor de tag
export function getTagColor(tag: any): string {
  if (typeof tag === 'string') return '#3b82f6';
  return tag.color || '#3b82f6';
}