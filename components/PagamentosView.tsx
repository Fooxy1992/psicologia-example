'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, ArrowUpRight, Check, X, Trash2, 
  Euro, Clock, CheckCircle, TrendingUp, Filter, Search, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Patient, PaymentInvoice } from '../lib/mock-data';

interface PagamentosViewProps {
  invoices: PaymentInvoice[];
  patients: Patient[];
  onAddInvoice: (invoice: PaymentInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onEditInvoice: (id: string, updatedInfo: Partial<PaymentInvoice>) => void;
}

const dataLineChart = [
  { name: 'Jan', faturado: 4000, pago: 2400, pendente: 1600 },
  { name: 'Fev', faturado: 3000, pago: 1398, pendente: 1602 },
  { name: 'Mar', faturado: 2000, pago: 9800, pendente: 2200 },
  { name: 'Abr', faturado: 2780, pago: 3908, pendente: 1872 },
  { name: 'Mai', faturado: 1890, pago: 4800, pendente: 2090 },
  { name: 'Jun', faturado: 2390, pago: 3800, pendente: 2590 },
  { name: 'Jul', faturado: 3490, pago: 4300, pendente: 2190 },
  { name: 'Ago', faturado: 4490, pago: 4300, pendente: 1190 },
  { name: 'Set', faturado: 5490, pago: 4600, pendente: 890 },
  { name: 'Out', faturado: 4800, pago: 3900, pendente: 900 },
  { name: 'Nov', faturado: 6425, pago: 5145, pendente: 1280 },
];

const dataPieChart = [
  { name: 'Consulta', value: 2850, color: '#8b5cf6' },
  { name: 'EMDR', value: 1950, color: '#10b981' },
  { name: 'Avaliação', value: 975, color: '#f97316' },
  { name: 'Outros', value: 650, color: '#60a5fa' },
];

export default function PagamentosView({ invoices, patients, onAddInvoice, onDeleteInvoice, onEditInvoice }: PagamentosViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editInvoiceForm, setEditInvoiceForm] = useState<Partial<PaymentInvoice>>({});
  
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: patients[0]?.id || '',
    category: 'Consulta EMDR' as any,
    amount: 85,
    date: new Date().toISOString().split('T')[0],
    patientNif: '',
    patientEmail: patients[0]?.email || '',
    syncWithInvoiceExpress: true
  });

  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<{ isConfigured: boolean; accountName: string | null } | null>(null);

  React.useEffect(() => {
    fetch('/api/invoicexpress')
      .then(res => res.json())
      .then(data => setIntegrationStatus({ isConfigured: data.isConfigured, accountName: data.accountName }))
      .catch(() => setIntegrationStatus({ isConfigured: false, accountName: null }));
  }, []);

  const totalPaid = invoices.filter(i => i.status === 'Pago').reduce((sum, current) => sum + current.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pendente').reduce((sum, current) => sum + current.amount, 0);
  const totalInvoiced = invoices.reduce((sum, current) => sum + current.amount, 0);

  const getStatusClass = (status: PaymentInvoice['status']) => {
    switch (status) {
      case 'Pago': return 'bg-success-100 text-success-700';
      case 'Pendente': return 'bg-warning-100 text-warning-700';
      case 'Vencido': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleInvoiceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === invoiceForm.patientId) || patients[0];
    if (!pat) return;

    setIsSyncing('NEW');
    setSyncError(null);

    let finalInvoiceExpressUrl: string | undefined = undefined;
    let finalInvoiceExpressId: string | undefined = undefined;
    let finalStatus: PaymentInvoice['status'] = 'Pendente';

    if (invoiceForm.syncWithInvoiceExpress) {
      try {
        const resp = await fetch('/api/invoicexpress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName: pat.name,
            patientEmail: invoiceForm.patientEmail || pat.email,
            amount: invoiceForm.amount,
            category: invoiceForm.category,
            date: invoiceForm.date,
            patientNif: invoiceForm.patientNif,
            documentType: 'invoice_receipts'
          })
        });

        const data = await resp.json();
        if (data.success) {
          finalInvoiceExpressUrl = data.pdfUrl || data.permalink;
          finalInvoiceExpressId = String(data.documentId);
          finalStatus = 'Pago';
        } else {
          setSyncError(data.error || "Erro InvoiceExpress");
          alert(`Aviso InvoiceExpress: ${data.error || 'Erro desconhecido'}`);
        }
      } catch (err: any) {
        setSyncError(err.message || 'Erro de rede');
      }
    }

    const newInv: PaymentInvoice = {
      id: `FT_2026_${invoices.length + 10}`,
      patientName: pat.name,
      amount: invoiceForm.amount,
      date: invoiceForm.date,
      status: finalStatus,
      category: invoiceForm.category,
      invoiceExpressUrl: finalInvoiceExpressUrl,
      invoiceExpressId: finalInvoiceExpressId,
      patientNif: invoiceForm.patientNif || undefined,
      patientEmail: invoiceForm.patientEmail || pat.email || undefined
    };

    onAddInvoice(newInv);
    setIsSyncing(null);
    setIsNewInvoiceOpen(false);
  };

  const startEditingInvoice = (inv: PaymentInvoice) => {
    setEditInvoiceForm({
      category: inv.category,
      amount: inv.amount,
      date: inv.date,
      status: inv.status
    });
    setIsEditingInvoice(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 text-slate-800 font-sans">
      <div className="flex justify-end mb-6">
        <button onClick={() => setIsNewInvoiceOpen(true)} className="bg-brand-900 hover:bg-brand-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
          <FileText size={16} />
          Emitir Nova Fatura
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Euro size={16} />
              </div>
              <span className="text-sm font-medium text-slate-600">Receita Total</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">€{totalInvoiced}<span className="text-lg text-slate-500 font-medium">,00</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span className="text-sm font-medium text-slate-600">Cobranças Pendentes</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">€{totalPending}<span className="text-lg text-slate-500 font-medium">,00</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm font-medium text-slate-600">Faturas Pagas</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">€{totalPaid}<span className="text-lg text-slate-500 font-medium">,00</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <span className="text-sm font-medium text-slate-600">Ticket Médio</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">€85<span className="text-lg text-slate-500 font-medium">,00</span></h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-900">Receita ao Longo do Tempo</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-brand-600"></span> Faturado</div>
              <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Pago</div>
              <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Pendente</div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%" className="-ml-4">
              <AreaChart data={dataLineChart} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`} width={55} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(value: any) => [`€${value}`, '']}
                />
                <Area type="monotone" dataKey="faturado" stroke="#7c3aed" fillOpacity={1} fill="url(#colorFaturado)" strokeWidth={2} />
                <Area type="monotone" dataKey="pago" stroke="#10b981" fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="pendente" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Receita por Serviço</h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="relative w-full h-[180px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPieChart}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dataPieChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `€${value}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-lg font-bold text-slate-900">€6.425</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              {dataPieChart.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <div className="font-medium text-slate-900">€{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 className="text-base font-semibold text-slate-900">Faturas Recentes</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 w-32 md:w-48"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="all">Filtros</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 font-medium">ID Fatura</th>
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Serviço</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.slice(0, 8).map(inv => (
                  <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3 font-medium text-slate-900">{inv.id}</td>
                    <td className="px-5 py-3 text-slate-700">{inv.patientName}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{inv.category}</td>
                    <td className="px-5 py-3 text-slate-500">{inv.date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${getStatusClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">€{inv.amount},00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-900">Atividade Recente</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-700">Fatura <strong>FT-2024-004</strong> emitida para <strong>Ricardo Mendes</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Há 12 min</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-700">Pagamento recebido de <strong>Maria Silva</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Há 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setIsNewInvoiceOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 w-full max-w-md z-10 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Gerar Fatura Recibo</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-full">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvoiceCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Utente Clinico</label>
                <select
                  value={invoiceForm.patientId}
                  onChange={(e) => {
                    const patId = e.target.value;
                    const pat = patients.find(p => p.id === patId);
                    setInvoiceForm(prev => ({ ...prev, patientId: patId, patientEmail: pat ? (pat.email || '') : '' }));
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Serviço Prestado</label>
                <select
                  value={invoiceForm.category}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Consulta EMDR">Sessão e Reprocessamento EMDR</option>
                  <option value="Psicoterapia Geral">Consulta de Psicoterapia Sistémica</option>
                  <option value="Relatório Clínico">Emissão de Relatório Clínico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Valor (€ EUR)</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 85 }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Data Emissão</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">NIF (Opcional)</label>
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="Ex: 999999990"
                    value={invoiceForm.patientNif}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, patientNif: e.target.value.replace(/\D/g, '') }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">E-mail utente</label>
                  <input
                    type="email"
                    value={invoiceForm.patientEmail}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

               <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-800 block">Sincronizar com InvoiceXpress</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInvoiceForm(prev => ({ ...prev, syncWithInvoiceExpress: !prev.syncWithInvoiceExpress }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      invoiceForm.syncWithInvoiceExpress ? "bg-brand-600" : "bg-slate-200"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${invoiceForm.syncWithInvoiceExpress ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </div>
               </div>

               <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsNewInvoiceOpen(false)} className="flex-1 py-2.5 text-sm font-medium hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  Cancelar
                </button>
                <button type="submit" disabled={isSyncing !== null} className="flex-1 py-2.5 text-sm font-medium bg-brand-900 hover:bg-brand-800 rounded-lg text-white transition-colors disabled:opacity-50">
                  Emitir
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setSelectedInvoice(null); setIsEditingInvoice(false); }} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 w-full max-w-md z-10"
          >
            {isEditingInvoice ? (
                 <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <h3 className="font-semibold text-lg text-slate-900">Editar Fatura</h3>
                     <button onClick={() => setIsEditingInvoice(false)} className="p-1 hover:bg-slate-50 text-slate-400 rounded-full">
                       <X size={16} />
                     </button>
                   </div>
                   
                   <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-600 block">Estado de Cobro</label>
                     <select
                       value={editInvoiceForm.status || 'Pendente'}
                       onChange={(e) => setEditInvoiceForm(prev => ({ ...prev, status: e.target.value as any }))}
                       className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                     >
                       <option value="Pago">Pago</option>
                       <option value="Pendente">Pendente</option>
                       <option value="Vencido">Vencido</option>
                     </select>
                   </div>

                   <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setIsEditingInvoice(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg font-medium">Cancelar</button>
                      <button onClick={() => {
                          onEditInvoice(selectedInvoice.id, editInvoiceForm);
                          setSelectedInvoice({ ...selectedInvoice, ...editInvoiceForm } as PaymentInvoice);
                          setIsEditingInvoice(false);
                      }} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg font-medium">Gravar</button>
                   </div>
                 </div>
            ) : (
                <div className="space-y-5">
                   <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                       <div>
                         <h4 className="font-bold text-lg text-slate-900">Fatura {selectedInvoice.id}</h4>
                         <p className="text-xs text-slate-500 mt-1">Paciente: {selectedInvoice.patientName}</p>
                       </div>
                       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${getStatusClass(selectedInvoice.status)}`}>
                         {selectedInvoice.status}
                       </span>
                   </div>

                   <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-600">{selectedInvoice.category}</span>
                         <span className="font-medium">€{selectedInvoice.amount},00</span>
                       </div>
                       <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                         <span>Total</span>
                         <span>€{selectedInvoice.amount},00</span>
                       </div>
                   </div>

                   {selectedInvoice.invoiceExpressId && (
                       <div className="bg-brand-50 border border-brand-100 p-3 rounded-lg text-xs text-brand-800 flex justify-between items-center">
                          <span>Sincronizado InvoiceXpress ({selectedInvoice.invoiceExpressId})</span>
                          <a href={selectedInvoice.invoiceExpressUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold hover:underline">
                            <ArrowUpRight size={12} /> Ver Fatura
                          </a>
                       </div>
                   )}

                   <div className="flex gap-3 pt-2">
                      <button 
                        onClick={async () => {
                          if (confirm(`Deseja anular a fatura no InvoiceXpress e eliminá-la localmente?`)) {
                             if (selectedInvoice.invoiceExpressId) {
                                try {
                                  setIsSyncing(selectedInvoice.id);
                                  await fetch(`/api/invoicexpress?id=${selectedInvoice.invoiceExpressId}`, { method: 'DELETE' });
                                } catch (e) {}
                             }
                             setIsSyncing(null);
                             onDeleteInvoice(selectedInvoice.id);
                             setSelectedInvoice(null);
                          }
                        }}
                        disabled={isSyncing !== null}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                         <Trash2 size={16} /> Apagar
                      </button>
                      
                      <button 
                         onClick={() => startEditingInvoice(selectedInvoice)}
                         className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Editar
                      </button>

                      <button 
                         onClick={() => setSelectedInvoice(null)}
                         className="flex-1 py-2 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Fechar
                      </button>
                   </div>
                </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
