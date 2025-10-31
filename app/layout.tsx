import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp Audio Transcription - n8n Workflow',
  description: 'Export n8n workflow for transcribing WhatsApp audio messages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
