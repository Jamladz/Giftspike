import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTonConnectUI, useTonWallet, TonConnectButton } from '@tonconnect/ui-react';
import { DynamicNumber } from './DynamicNumber';
import { X, ArrowDownLeft, ArrowUpRight, Wallet, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Loader2, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGram: number;
  onUpdateGram: (newBalance: number) => void;
}

const DESTINATION_WALLET = 'UQCTZAMbXoN5T43K9gJXH8GYWBmIstXrUrdoV9kv3btN1Ad3';

export function WalletModal({ isOpen, onClose, userGram, onUpdateGram }: WalletModalProps) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositAmount, setDepositAmount] = useState<string>('0.5');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Pre-fill withdraw address when wallet connects
  React.useEffect(() => {
    if (wallet?.account.address && !withdrawAddress) {
      setWithdrawAddress(wallet.account.address);
    }
  }, [wallet]);

  const handleCopyDestination = () => {
    navigator.clipboard.writeText(DESTINATION_WALLET);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Real TON Deposit via TON Connect
  const handleRealDeposit = async () => {
    setStatusMessage(null);

    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid deposit amount greater than 0.' });
      return;
    }

    if (!wallet) {
      setStatusMessage({ type: 'error', text: 'Please connect your wallet first via TON Connect.' });
      try {
        await tonConnectUI.openModal();
      } catch (err) {
        console.error('Failed to open wallet modal', err);
      }
      return;
    }

    setIsProcessing(true);

    try {
      // 1 TON = 1,000,000,000 nanoTONs
      const nanoTonAmount = (amountNum * 1000000000).toString();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
        messages: [
          {
            address: DESTINATION_WALLET,
            amount: nanoTonAmount,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result) {
        // 1 TON = 1,000 GRAMs (conversion rate)
        const creditedGram = amountNum * 1000;
        const newBalance = userGram + creditedGram;
        onUpdateGram(newBalance);

        setStatusMessage({
          type: 'success',
          text: `Deposit successful! Sent ${amountNum} TON and credited ${creditedGram} GRAM to your account.`
        });
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setStatusMessage({
        type: 'error',
        text: error?.message || 'Transaction was cancelled or rejected by wallet.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Withdraw logic
  const handleWithdraw = () => {
    setStatusMessage(null);
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (amountNum > userGram) {
      setStatusMessage({ type: 'error', text: 'Insufficient balance to complete withdrawal request.' });
      return;
    }

    if (!withdrawAddress.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient TON wallet address.' });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newBalance = userGram - amountNum;
      onUpdateGram(newBalance);
      setIsProcessing(false);
      setStatusMessage({
        type: 'success',
        text: `Withdrawal request of ${amountNum} GRAM submitted successfully.`
      });
      setWithdrawAmount('');
    }, 1200);
  };

  const shortWallet = wallet?.account.address 
    ? `${wallet.account.address.slice(0, 4)}...${wallet.account.address.slice(-4)}` 
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
          />

          {/* Sheet - Covers ~75% of screen height */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 h-[78vh] max-h-[850px] md:max-w-lg md:mx-auto md:bottom-6 md:rounded-[32px] md:border md:border-[#2C2C2E] bg-[#121214] border-t border-[#2C2C2E] z-50 rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header Grab Bar & Close Button */}
            <div className="relative pt-3 pb-2.5 px-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#18181B]">
              <div className="w-10 h-1 bg-white/20 rounded-full absolute top-2.5 left-1/2 -translate-x-1/2" />

              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-5 h-5 rounded-full object-cover shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Manage GRAM & TON</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400">Direct Deposit & Withdrawal via TON Network</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-2 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Main Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* Balance & Wallet Connection Card */}
              <div className="bg-[#18181B] rounded-2xl p-4 border border-white/10 shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-neutral-400 font-medium">Current GRAM Balance</span>
                    <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-black text-white">
                      <DynamicNumber value={userGram} imageClassName="h-5" />
                      <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    </div>
                  </div>

                  {/* TON Connect Button Container */}
                  <div className="ton-connect-custom-wrapper">
                    <TonConnectButton />
                  </div>
                </div>

                {/* Connection Details Banner */}
                {wallet ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-300 font-bold">Wallet Connected:</span>
                      <span className="font-mono text-neutral-200">{shortWallet}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      TON Connect
                    </span>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-blue-300">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-[11px]">Connect wallet to start instant deposits</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit / Withdraw Tabs Switcher */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#18181B] p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => { setActiveTab('deposit'); setStatusMessage(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'deposit'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>

                <button
                  onClick={() => { setActiveTab('withdraw'); setStatusMessage(null); }}
                  className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'withdraw'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>
              </div>

              {/* Status Banner */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 animate-fadeIn ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              {/* TAB 1: DEPOSIT */}
              {activeTab === 'deposit' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Select Preset Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                      <span>Select Deposit Amount (TON):</span>
                      <span className="text-[10px] text-blue-400 font-normal flex items-center gap-1">
                        <span>1 TON = 1,000</span>
                        <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
                        <span>GRAM</span>
                      </span>
                    </label>

                    <div className="grid grid-cols-4 gap-2">
                      {['0.1', '0.5', '1.0', '5.0'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDepositAmount(val)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            depositAmount === val
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                              : 'bg-[#18181B] border-white/10 text-neutral-300 hover:bg-white/5'
                          }`}
                        >
                          {val} TON
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">Custom Amount (TON):</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter TON amount..."
                        className="w-full bg-[#18181B] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">
                        TON
                      </span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-500/5 border border-blue-500/15 p-3 rounded-xl flex items-center gap-2.5 text-xs text-neutral-300">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      Instant & secure payment processed directly via your connected TON Connect wallet.
                    </p>
                  </div>

                  {/* Real Deposit Action Button */}
                  <button
                    onClick={handleRealDeposit}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming transaction via wallet...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Deposit {depositAmount || '0'} TON via TON Connect</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: WITHDRAW */}
              {activeTab === 'withdraw' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Withdraw Amount */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                      <span>Withdraw Amount (GRAM):</span>
                      <button
                        onClick={() => setWithdrawAmount(userGram.toString())}
                        className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Withdraw All ({userGram} GRAM)
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter GRAM amount..."
                        className="w-full bg-[#18181B] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 flex items-center gap-1">
                        <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                        <span>GRAM</span>
                      </span>
                    </div>
                  </div>

                  {/* Withdraw Destination Wallet Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300">Recipient Wallet Address (TON):</label>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="UQ..."
                      className="w-full bg-[#18181B] border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none transition-all"
                    />
                  </div>

                  {/* Withdraw Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing withdrawal request...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Request Withdrawal</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
