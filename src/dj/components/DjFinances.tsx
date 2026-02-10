/**
 * DJ FINANCES - Финансовый дашборд диджея
 * Баланс, заработок, вывод средств, история транзакций, комиссии
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  CreditCard, Building2, Clock, CheckCircle2, AlertCircle,
  Calendar, Download, Filter, Search, ChevronRight, Zap,
  PiggyBank, BarChart3, ArrowRight
} from 'lucide-react';

export function DjFinances() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'yoomoney' | 'card'>('bank');

  const balance = {
    available: 142500,
    pending: 35000,
    total: 177500,
    monthEarnings: 85000,
    monthBookings: 6,
    commissionRate: 0.15,
    totalEarned: 1250000,
  };

  const transactions = [
    { id: '1', type: 'income', label: 'Букинг: Club Night @ Pravda', amount: 29750, date: '5 фев 2026', status: 'completed' },
    { id: '2', type: 'income', label: 'Букинг: Корпоратив Digital Agency', amount: 39950, date: '1 фев 2026', status: 'completed' },
    { id: '3', type: 'withdrawal', label: 'Вывод на карту *4532', amount: -50000, date: '28 янв 2026', status: 'completed' },
    { id: '4', type: 'income', label: 'Продажа микса: Techno Underground', amount: 2541, date: '25 янв 2026', status: 'completed' },
    { id: '5', type: 'income', label: 'Реферальный бонус', amount: 5000, date: '22 янв 2026', status: 'completed' },
    { id: '6', type: 'income', label: 'Букинг: Свадьба', amount: 79900, date: '20 янв 2026', status: 'completed' },
    { id: '7', type: 'withdrawal', label: 'Вывод на ЮMoney', amount: -30000, date: '15 янв 2026', status: 'completed' },
    { id: '8', type: 'pending', label: 'Букинг: Winter Festival (депозит)', amount: 22500, date: 'Ожидает', status: 'pending' },
  ];

  const withdrawals = [
    { id: '1', amount: 50000, method: 'Карта *4532', date: '28 янв 2026', status: 'completed' },
    { id: '2', amount: 30000, method: 'ЮMoney', date: '15 янв 2026', status: 'completed' },
    { id: '3', amount: 25000, method: 'Банковский перевод', date: '5 янв 2026', status: 'completed' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
          Финансы
        </h1>
        <p className="text-xs lg:text-sm text-gray-400 mt-1">Баланс, заработок и вывод средств</p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {[
          { icon: Wallet, label: 'Доступно к выводу', value: `${balance.available.toLocaleString()} ₽`, color: 'from-green-500 to-emerald-500', textColor: 'text-green-400' },
          { icon: Clock, label: 'В обработке', value: `${balance.pending.toLocaleString()} ₽`, color: 'from-yellow-500 to-orange-500', textColor: 'text-yellow-400' },
          { icon: TrendingUp, label: 'За этот месяц', value: `+${balance.monthEarnings.toLocaleString()} ₽`, color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-400' },
          { icon: PiggyBank, label: 'Всего заработано', value: `${balance.totalEarned.toLocaleString()} ₽`, color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-white/10"
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-2 lg:mb-3`}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className={`text-lg lg:text-xl xl:text-2xl font-black ${card.textColor}`}>{card.value}</div>
              <div className="text-[10px] lg:text-xs text-gray-500">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid xl:grid-cols-5 gap-4 lg:gap-6">
        {/* Transactions — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-3"
        >
          <h2 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">История транзакций</h2>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 overflow-hidden">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-3 lg:p-4 hover:bg-white/5 transition-colors ${
                  index < transactions.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-green-500/20' :
                    tx.type === 'withdrawal' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4 text-green-400" /> :
                     tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                     <Clock className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-white font-medium truncate">{tx.label}</p>
                    <p className="text-[10px] text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`text-xs lg:text-sm font-bold ${
                    tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ₽
                  </p>
                  {tx.status === 'pending' && (
                    <span className="text-[10px] text-yellow-400">Ожидает</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Withdrawal Form — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <h2 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">Вывод средств</h2>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-white/10 space-y-4">
            {/* Available */}
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-[10px] lg:text-xs text-gray-400 mb-1">Доступно к выводу</p>
              <p className="text-2xl lg:text-3xl font-black text-green-400">{balance.available.toLocaleString()} ₽</p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">Сумма вывода</label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Мин. 500 ₽"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setWithdrawAmount(String(balance.available))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                >
                  ВСЕ
                </button>
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">Способ вывода</label>
              <div className="space-y-1.5">
                {[
                  { id: 'bank' as const, label: 'Банковский перевод', icon: Building2 },
                  { id: 'yoomoney' as const, label: 'ЮMoney', icon: Wallet },
                  { id: 'card' as const, label: 'На карту', icon: CreditCard },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setWithdrawMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                        withdrawMethod === method.id
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                          : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-sm font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all"
            >
              Запросить вывод
            </motion.button>

            {/* Commission note */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500">
                  Комиссия платформы: 15% от каждого букинга. Вывод средств обрабатывается в течение 1-3 рабочих дней.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Withdrawals */}
          <h3 className="text-sm font-bold text-white mt-4 lg:mt-6 mb-2 lg:mb-3">Последние выводы</h3>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/5">
                <div>
                  <p className="text-xs text-white font-medium">{w.method}</p>
                  <p className="text-[10px] text-gray-500">{w.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{w.amount.toLocaleString()} ₽</p>
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Выплачено
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
