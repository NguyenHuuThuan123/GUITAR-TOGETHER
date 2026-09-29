'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  Wifi,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceConnectModal: React.FC<DeviceConnectModalProps> = ({ isOpen, onClose }) => {
  const [networkInfo, setNetworkInfo] = useState<{ ip: string; port: number | string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'lan' | 'online' | 'pwa'>('lan');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/network-info')
        .then((res) => res.json())
        .then((data) => setNetworkInfo(data))
        .catch((err) => console.error('Lỗi lấy IP mạng:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xác định link LAN
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const lanUrl = networkInfo?.ip 
    ? `http://${networkInfo.ip}:${networkInfo.port || 3000}`
    : currentOrigin;

  // URL tối ưu để chia sẻ cho thiết bị khác
  const shareUrl = isLocalhost ? lanUrl : currentOrigin;

  // Tạo URL QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(shareUrl)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Kết Nối Thiết Bị Trong Band
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  Phòng tập & Sân khấu
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Mở hợp âm trên Điện thoại, iPad, Tablet và Laptop của tất cả thành viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('lan')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'lan'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wifi size={14} />
            <span>Cùng Wi-Fi (Quét mã QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'online'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe size={14} />
            <span>Từ xa qua Internet</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pwa'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone size={14} />
            <span>Cài làm App trên ĐT</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-neutral-300">
          {activeTab === 'lan' && (
            <div className="space-y-4">
              {/* QR Code & Link Card */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                  {/* QR Image */}
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR kết nối"
                    className="w-40 h-40 object-contain"
                  />
                  <span className="text-[10px] text-neutral-600 font-bold mt-1 text-center">
                    Quét bằng Camera ĐT / iPad
                  </span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <span className="text-xs text-neutral-400 font-medium block mb-1">
                      Đường dẫn truy cập trực tiếp:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-amber-400 font-mono text-xs sm:text-sm font-semibold truncate">
                        {shareUrl}
                      </div>
                      <button
                        onClick={() => handleCopy(shareUrl)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 space-y-1.5 border-t border-neutral-800/80 pt-2.5">
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Thiết bị của các bạn trong band chỉ cần <strong>bắt chung mạng Wi-Fi</strong> với máy tính này.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Bật <strong>Camera</strong> trên điện thoại/iPad quét mã QR, hoặc mở trình duyệt (Safari/Chrome) gõ link trên.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Nếu đi diễn không có Wi-Fi: 1 bạn chỉ cần bật <strong>Điểm phát sóng di động (Hotspot)</strong> là cả band kết nối được ngay!
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'online' && (
            <div className="space-y-3.5">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Sparkles size={16} />
                  <span>Cách 1: Mở link online nhanh trong 30 giây (Miễn phí)</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Nếu các bạn trong band đang ở nhà khác nhau (khác mạng Wi-Fi) hoặc dùng 4G, bạn có thể tạo link online tức thì bằng lệnh tunnel:
                </p>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs text-amber-300">
                  <code>npx localtunnel --port 3000</code>
                  <button
                    onClick={() => handleCopy('npx localtunnel --port 3000')}
                    className="p-1 hover:text-white transition-colors"
                    title="Sao chép lệnh"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  👉 Lệnh này sẽ tạo ra 1 đường link online (ví dụ <code className="text-neutral-300">https://xxxx.loca.lt</code>) để bạn gửi qua Zalo/Messenger cho cả band vào xem ngay.
                </p>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Globe size={16} />
                  <span>Cách 2: Đưa lên Cloud (Vercel) dùng vĩnh viễn 24/7 (Khuyên dùng)</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Để các bạn trong ban nhạc có thể mở ứng dụng bất kỳ lúc nào (kể cả khi bạn đã tắt máy tính):
                </p>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                  <li>Đẩy mã nguồn lên <strong>GitHub</strong> cá nhân của bạn.</li>
                  <li>Đăng nhập <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">Vercel.com <ExternalLink size={10} /></a> và bấm <strong>Import repository</strong>.</li>
                  <li>Bạn sẽ có link vĩnh viễn hoàn toàn miễn phí dạng: <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded">https://band-guitar-together.vercel.app</code>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-3">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Smartphone size={16} className="text-amber-400" />
                  Cài đặt như App độc lập trên điện thoại/máy tính bảng
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ứng dụng <strong>BAND GUITAR TOGETHER</strong> đã hỗ trợ chuẩn PWA. Bạn và các thành viên có thể đưa ra màn hình chính để dùng toàn màn hình không có thanh địa chỉ duyệt web:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* iOS */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-1.5">
                    <span className="font-bold text-xs text-amber-300 block">📱 Trên iPhone / iPad (Safari)</span>
                    <ol className="text-[11px] text-neutral-400 space-y-1 list-decimal list-inside">
                      <li>Mở link trên trình duyệt <strong>Safari</strong>.</li>
                      <li>Bấm biểu tượng <strong>Chia sẻ</strong> (icon ô vuông có mũi tên lên).</li>
                      <li>Chọn <strong>&quot;Thêm vào MH chính&quot; (Add to Home Screen)</strong>.</li>
                    </ol>
                  </div>

                  {/* Android */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-1.5">
                    <span className="font-bold text-xs text-amber-300 block">🤖 Trên Android (Chrome)</span>
                    <ol className="text-[11px] text-neutral-400 space-y-1 list-decimal list-inside">
                      <li>Mở link trên trình duyệt <strong>Chrome</strong>.</li>
                      <li>Bấm vào dấu <strong>3 chấm</strong> ở góc trên bên phải.</li>
                      <li>Chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào màn hình chính&quot;</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Máy chủ đang hoạt động tại cổng 3000</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
