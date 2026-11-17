import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/styles/globals.scss";
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      data-theme="light"
      className={openSans.variable}
    >
      <body>{children}</body>
    </html>
  );
}
