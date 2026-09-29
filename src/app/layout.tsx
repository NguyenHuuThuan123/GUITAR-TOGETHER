import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "BAND GUITAR TOGETHER - Quản lý Hợp Âm & Sân Khấu",
  description: "Web app BAND GUITAR TOGETHER - Quản lý hợp âm, setlist và biểu diễn sân khấu chuyên nghiệp cho ban nhạc",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BAND GUITAR TOGETHER",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Chặn lỗi từ chrome-extension (Phantom, MetaMask, evmAsk)
                window.addEventListener('error', function(e) {
                  var msg = (e.message || '') + ' ' + (e.filename || '');
                  if (
                    msg.indexOf('chrome-extension://') !== -1 ||
                    msg.indexOf('bis_skin_checked') !== -1 ||
                    msg.indexOf('bis_register') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);

                // 2. Tự động gỡ bỏ thuộc tính bis_skin_checked ngay khi Bitdefender chèn vào DOM
                try {
                  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
                    new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes') {
                          var attr = m.attributeName;
                          if (attr && (attr.indexOf('bis_') === 0 || attr.indexOf('__processed_') === 0)) {
                            m.target.removeAttribute(attr);
                          }
                        }
                      }
                    }).observe(document.documentElement, {
                      attributes: true,
                      subtree: true
                    });
                  }
                } catch (e) {}

                // 3. Lọc bỏ cảnh báo Hydration Mismatch của React 19 (hỗ trợ cả Error object, diff, message)
                if (typeof console !== 'undefined') {
                  var filterBis = function(origFn) {
                    return function() {
                      var combined = '';
                      for (var i = 0; i < arguments.length; i++) {
                        var a = arguments[i];
                        try {
                          if (a instanceof Error) {
                            combined += ' ' + a.message + ' ' + (a.stack || '');
                          } else if (a && typeof a === 'object') {
                            combined += ' ' + (a.message || '') + ' ' + (a.diff || '') + ' ' + JSON.stringify(a);
                          } else {
                            combined += ' ' + String(a);
                          }
                        } catch (err) {
                          combined += ' ' + String(a);
                        }
                      }

                      if (
                        combined.indexOf('bis_skin_checked') !== -1 ||
                        combined.indexOf('bis_register') !== -1 ||
                        combined.indexOf('__processed_') !== -1
                      ) {
                        return; // Hoàn toàn loại bỏ cảnh báo giả này
                      }

                      return origFn.apply(console, arguments);
                    };
                  };

                  if (console.error) console.error = filterBis(console.error);
                  if (console.warn) console.warn = filterBis(console.warn);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
