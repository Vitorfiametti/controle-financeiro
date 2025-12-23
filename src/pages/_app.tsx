import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/context/ThemeContext'
import { Toaster } from 'react-hot-toast'

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Component {...pageProps} />
        
        {/* 🎨 Toasts no canto superior direito */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            // Duração padrão: 4 segundos
            duration: 4000,
            
            // Estilo padrão
            style: {
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              padding: '16px 24px',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            },
            
            // Toast de SUCESSO (verde) ✅
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#10b981',
              },
            },
            
            // Toast de ERRO (vermelho) ❌
            error: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#ef4444',
              },
            },
            
            // Toast de LOADING (azul) ⏳
            loading: {
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
              },
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  )
}