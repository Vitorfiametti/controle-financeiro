import NextAuth from 'next-auth';
import { authOptions } from '@/lib/nextauth-config';

export default NextAuth(authOptions);
