'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBandStore } from '@/lib/store';
import {
  Music2,
  ListMusic,
  Tv2,
  Users,
  Plus,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  Search,
  QrCode,
} from 'lucide-react';
import { DeviceConnectModal } from '@/components/modals/DeviceConnectModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentBand, currentUser } = useBandStore();
  const [showBandModal, setShowBandModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { label: 'Thư viện bài hát', href: '/songs', icon: Music2 },
    { label: 'Setlist biểu diễn', href: '/setlists', icon: ListMusic },
    { label: 'Sân khấu (Stage Mode)', href: '/stage', icon: Tv2, badge: 'Sân khấu' },
  ];

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `Tham gia band ${currentBand.name} trên BAND GUITAR TOGETHER với mã: ${currentBand.inviteCode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Band Switcher */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-neutral-700/80 shadow-md group-hover:scale-105 transition-transform bg-neutral-900 shrink-0">
                <img
                  src="/logo.png"
                  alt="BAND GUITAR TOGETHER"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-amber-400 transition-colors uppercase">
                  BAND GUITAR TOGETHER
                </span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">Stage & Rehearsal</span>
              </div>
            </Link>

            {/* Band Badge / Switcher */}
            <button
              onClick={() => setShowBandModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-700/60 rounded-xl text-xs transition-colors"
            >
              <Users size={14} className="text-amber-400" />
              <span className="font-semibold text-neutral-200">{currentBand.name}</span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded">
                {currentBand.members.length} tv
              </span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-amber-400' : ''} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="hidden md:inline text-[9px] px-1.5 py-0.2 uppercase font-black bg-amber-500 text-neutral-950 rounded">
                      Live
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 border border-neutral-700/80 hover:border-amber-500/50 rounded-xl text-xs font-semibold transition-all shadow-sm"
              title="Quét mã QR để mở hợp âm trên Điện thoại / iPad của các thành viên"
            >
              <QrCode size={15} />
              <span className="hidden sm:inline">Kết nối Band</span>
            </button>

            <Link
              href="/songs/new"
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all hover:scale-102"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Tạo bài mới</span>
            </Link>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div
                className="w-8 h-8 rounded-full bg-neutral-800 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-300"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal Quản lý Band & Thành viên */}
      {showBandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Header Modal */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="text-amber-400" size={20} />
                  <span>Ban Nhạc: {currentBand.name}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">{currentBand.description}</p>
              </div>
              <button
                onClick={() => setShowBandModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Nội dung mời thành viên */}
            <div className="p-5 space-y-4">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-neutral-400 block font-medium">Mã mời tham gia Band:</span>
                  <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                    {currentBand.inviteCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
                </button>
              </div>

              {/* Danh sách thành viên & phân quyền */}
              <div>
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
                  Thành viên trong Band ({currentBand.members.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {currentBand.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300">
                          {member.user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block leading-tight">
                            {member.user.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">{member.user.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            member.role === 'OWNER'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : member.role === 'EDITOR'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {member.role === 'OWNER'
                            ? 'Chủ Band'
                            : member.role === 'EDITOR'
                            ? 'Chỉnh sửa'
                            : 'Chỉ xem'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowBandModal(false);
                  setShowConnectModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors"
              >
                <QrCode size={14} />
                <span>Mở mã QR cho thiết bị khác</span>
              </button>

              <button
                onClick={() => setShowBandModal(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quét mã QR & Kết nối thiết bị */}
      <DeviceConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </>
  );
};
