// Export dos modelos do MongoDB
export { default as Transaction } from './Transaction';
export { default as Investment } from './Investment';
export { default as Fornecedor } from './Fornecedor';
export { default as PaymentMethod } from './PaymentMethod';
export { default as Category } from './Category';
export { default as User } from './User';

// Aliases para compatibilidade
export { default as FormaPagamento } from './PaymentMethod';
export { default as TipoDespesa } from './Category';