import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { checkPassword } from '@/lib/auth';
import { getUserByEmail } from '@/queries';

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.APP_SECRET;

const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email, {
          includePassword: true,
        } as any);
        if (!user) return null;
        const ok = checkPassword(credentials.password, user.password as string);
        if (!ok) return null;
        return { id: user.id, name: user.username, image: undefined, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      (session as any).user.id = (token as any).id as string;
      (session as any).user.role = (token as any).role as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
  },
};

export default authOptions;
