import type { Metadata } from "next";
import "@mantine/core/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MH8A 控制台",
  description: "Next.js rewrite of the MH8A QML UI with mocked data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
