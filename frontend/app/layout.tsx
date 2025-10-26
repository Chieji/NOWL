import './globals.css'

export const metadata = {
  title: 'Nexus Agent - Multi-Tool Financial Analyst',
  description: 'AI-powered financial analysis with real-time ReAct processing',
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
