import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import {connectDB} from '@/utils/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials Provider (seu login atual)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Senha incorreta');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Se for login com Google
      if (account?.provider === 'google') {
        await connectDB();
        
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Criar novo usuário se não existir
          await User.create({
            name: user.name,
            email: user.email,
            googleId: account.providerAccountId,
            password: '', // Senha vazia para usuários do Google
          });
        } else if (!existingUser.googleId) {
          // Vincular Google ID ao usuário existente
          existingUser.googleId = account.providerAccountId;
          await existingUser.save();
        }
      }
      
      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        
        if (user) {
          (session.user as any).id = user._id.toString();
        }
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
};