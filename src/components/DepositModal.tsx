import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ExternalLink, Wallet, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { DynamicNumber } from './DynamicNumber';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  requiredAmount: number;
  currentBalance: number | null;
}

export function DepositModal({ isOpen, onClose, walletAddress, requiredAmount, currentBalance }: DepositModalProps) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ton://transfer/${walletAddress}&bgcolor=1C1C1E&color=F5F5F7&margin=0`;

  const deficit = currentBalance !== null ? Math.max(0, requiredAmount - currentBalance) : requiredAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-5 border-b border-[#2C2C2E] flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Insufficient Balance</h2>
                  <p className="text-[10px] text-[#8E8E93] font-medium">Deposit required to purchase</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2A2A2D] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Balance Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#222225] p-3 rounded-2xl border border-[#3A3A3C]">
                  <span className="block text-[10px] text-[#8E8E93] font-bold uppercase mb-1">Your Balance</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full" />
                    <span className="text-sm font-black">{currentBalance !== null ? currentBalance.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                <div className="bg-[#222225] p-3 rounded-2xl border border-red-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/5" />
                  <span className="block text-[10px] text-red-400 font-bold uppercase mb-1 relative z-10">Required</span>
                  <div className="flex items-center gap-1.5 text-white relative z-10">
                    <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full" />
                    <span className="text-sm font-black">{requiredAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Deposit QR & Address */}
              <div className="bg-[#222225] border border-[#3A3A3C] rounded-2xl p-4 flex flex-col items-center">
                <p className="text-xs text-[#F5F5F7] font-bold mb-4 text-center">
                  Deposit at least <span className="text-amber-400">{deficit.toFixed(2)} GRAM/TON</span> to your connected wallet
                </p>
                
                <div className="bg-white p-2 rounded-2xl shadow-inner mb-4">
                  <img src={qrUrl} alt="Deposit QR" className="w-40 h-40 object-contain rounded-xl" />
                </div>

                <div className="w-full bg-[#1C1C1E] rounded-xl p-1 flex items-center justify-between border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 pl-3">
                    <Wallet className="w-4 h-4 text-[#8E8E93]" />
                    <span className="text-xs font-mono text-[#F5F5F7] font-bold tracking-wider">{shortAddress}</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-[#2A2A2D] hover:bg-[#3A3A3C] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <span className="text-green-400">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fiat On-Ramp Link */}
              <a 
                href="https://wallet.tg/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#0088CC] to-[#0099EE] text-white p-3 rounded-2xl hover:shadow-[0_4px_20px_rgba(0,136,204,0.4)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">Buy TON with Card</h3>
                    <p className="text-[9px] text-white/80 font-medium">Via Telegram Wallet</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#0088CC] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
