import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gida AI - Your Community Digital Voice',
  description: 'AI assistant for Hausa, Yoruba, Igbo and Nigerian Pidgin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
