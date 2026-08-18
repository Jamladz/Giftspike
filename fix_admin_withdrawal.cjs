const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const oldDetails = `{/* Amount & Wallet Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#101012] p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-medium">Requested Amount:</span>
                        <div className="flex items-center gap-1.5 text-sm font-black text-amber-400 mt-0.5">
                          <span>{req.amount} GRAM / TON</span>
                          <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4 h-4 rounded-full object-cover shrink-0" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                          <span>Recipient Wallet Address:</span>
                          <button
                            onClick={() => handleCopy(req.walletAddress)}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedAddress === req.walletAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAddress === req.walletAddress ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-200 mt-0.5 truncate bg-[#18181C] p-1.5 rounded border border-white/5">
                          {req.walletAddress}
                        </p>
                      </div>
                    </div>`;

const newDetails = `{/* Amount & Wallet Details - Professional Layout */}
                    <div className="bg-[#121215] p-3.5 rounded-xl border border-white/10 space-y-4 relative overflow-hidden">
                      {/* Decorative Background Glow */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between relative z-10">
                         <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                           <Sparkles className="w-3 h-3 text-amber-500" />
                           Requested Amount
                         </span>
                         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-inner">
                           <span className="text-base font-black text-amber-400 tracking-tight">{req.amount.toFixed(2)} TON</span>
                           <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4.5 h-4.5 rounded-full object-cover shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                         </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Key className="w-3 h-3 text-blue-500" />
                            Destination Wallet
                          </span>
                          <button
                            onClick={() => handleCopy(req.walletAddress)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center gap-1.5 cursor-pointer bg-[#18181C] px-2.5 py-1 rounded-md transition-all border border-white/5"
                          >
                            {copiedAddress === req.walletAddress ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span className="text-[9px] font-black tracking-wider uppercase">{copiedAddress === req.walletAddress ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-[#0A0A0C] p-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-inner group">
                           <div className="w-8 h-8 rounded-lg bg-[#161619] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                             <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                           </div>
                           <p className="text-xs font-mono text-neutral-300 truncate selection:bg-blue-500/30">
                             {req.walletAddress}
                           </p>
                        </div>
                      </div>
                    </div>`;

code = code.replace(oldDetails, newDetails);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
