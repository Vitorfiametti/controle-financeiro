# 💰 Controle Financeiro

Sistema completo de controle financeiro pessoal desenvolvido com Next.js, TypeScript e MongoDB.

## 🚀 Funcionalidades

- ✅ Autenticação com NextAuth (Email/Senha e Google)
- ✅ Gestão de Transações (Receitas e Despesas)
- ✅ Gestão de Investimentos (Aplicações e Resgates)
- ✅ Dashboard com Cards de Resumo
- ✅ Histórico com Filtros Avançados
- ✅ Sistema de Tags Coloridas
- ✅ Modo Escuro
- ✅ Cálculo Automático de Patrimônio
- ✅ Gestão de Fornecedores, Formas de Pagamento e Categorias

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB com Mongoose
- **Autenticação**: NextAuth.js
- **Gráficos**: Chart.js (preparado para implementação futura)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no MongoDB Atlas (gratuito)

### Passo a Passo

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/controle-financeiro.git
cd controle-financeiro
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:
```env
# Database
MONGODB_URI=sua-connection-string-do-mongodb

# NextAuth
NEXTAUTH_SECRET=gere-com: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

## 🗄️ Configurar MongoDB

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crie um cluster gratuito
3. Crie um usuário de banco de dados
4. Libere acesso de qualquer IP (0.0.0.0/0)
5. Obtenha a connection string e adicione no `.env.local`

## 📱 Estrutura do Projeto
```
controle-financeiro/
├── src/
│   ├── components/        # Componentes React
│   ├── context/          # Context API (Tema)
│   ├── hooks/            # Custom Hooks
│   ├── lib/              # Configurações e Models
│   ├── pages/            # Páginas Next.js
│   ├── styles/           # Estilos globais
│   └── types/            # TypeScript types
├── public/               # Arquivos públicos
└── ...
```

## 🎯 Como Usar

1. **Cadastre-se** ou faça **login**
2. Acesse o **Dashboard** para ver o resumo
3. Vá em **Lançamento** para adicionar receitas/despesas
4. Consulte o **Histórico** com filtros avançados
5. Gerencie seus **Investimentos**

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome](https://github.com/seu-usuario)