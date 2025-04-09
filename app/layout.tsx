import type React from "react"
import { Geist } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast-container"

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={geist.className}>
      <head>
        <title>Генератор 3D Моделей</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-black text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
