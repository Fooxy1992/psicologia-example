'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, DollarSign, Download, Plus, FileText, CheckCircle, 
  Clock, AlertTriangle, ArrowUpRight, TrendingUp, Filter, Search, X, Check, Eye, Trash2 
} from 'lucide-react';
import { Patient, PaymentInvoice } from '../lib/mock-data';

interface PagamentosViewProps {
  invoices: PaymentInvoice[];
  patients: Patient[];
  onAddInvoice: (invoice: PaymentInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onEditInvoice: (id: string, updatedInfo: Partial<PaymentInvoice>) => void;
}

export default function PagamentosView({ invoices, patients, onAddInvoice, onDeleteInvoice, onEditInvoice }: PagamentosViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);

  // Edit Invoice states
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editInvoiceForm, setEditInvoiceForm] = useState<Partial<PaymentInvoice>>({});

  const startEditingInvoice = (inv: PaymentInvoice) => {
    setEditInvoiceForm({
      category: inv.category,
      amount: inv.amount,
      date: inv.date,
      status: inv.status
    });
    setIsEditingInvoice(true);
  };

  // New Invoice Form state
  const [invoiceForm, setInvoiceForm] = useState({
    patientId: patients[0]?.id || '',
    category: 'Consulta EMDR' as any,
    amount: 85,
    date: new Date().toISOString().split('T')[0]
  });

  const handleInvoiceCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === invoiceForm.patientId) || patients[0];
    if (!pat) return;

    const newInv: PaymentInvoice = {
      id: `FT_2026_${invoices.length + 10}`,
      patientName: pat.name,
      amount: invoiceForm.amount,
      date: invoiceForm.date,
      status: 'Pendente',
      category: invoiceForm.category
    };

    onAddInvoice(newInv);
    setIsNewInvoiceOpen(false);
  };

  // Filter Invoice ledger
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Financial calculated indicators
  const totalPaid = invoices.filter(i => i.status === 'Pago').reduce((sum, current) => sum + current.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pendente').reduce((sum, current) => sum + current.amount, 0);
  const totalInvoiced = invoices.reduce((sum, current) => sum + current.amount, 0);

  const getStatusClass = (status: PaymentInvoice['status']) => {
    switch (status) {
      case 'Pago': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Pendente': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Vencido': return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left h-full">
      
      {/* SECTION HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-xs">
        <div>
          <span className="text-[#4f6054] text-xs font-semibold uppercase tracking-widest block mb-1">Processamento de Honorários</span>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-[#191c1d]">Faturação e Financeiro</h1>
        </div>

        <button
          onClick={() => setIsNewInvoiceOpen(true)}
          className="flex items-center gap-2 bg-[#4f6054] hover:bg-[#232d26] text-white text-xs md:text-sm font-semibold tracking-wide px-5 py-3 rounded-full transition-all shadow-md"
        >
          <Plus size={16} />
          <span>Criar Fatura Recibo</span>
        </button>
      </div>

      {/* STRIPE STYLE FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Liquidado */}
        <div className="bg-[#faf9f6]/90 p-5 rounded-3xl border border-[#e6e2d7] shadow-3xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold text-[#4a504b] tracking-wider">Total Liquidado</span>
            <span className="p-2.5 bg-emerald-100/60 rounded-xl text-emerald-800"><CheckCircle size={16} /></span>
          </div>
          <h3 className="text-3xl font-serif font-light text-[#191c1d]">€{totalPaid}</h3>
          <p className="text-[10px] text-[#4a504b] mt-2 font-medium">100% creditado na conta clínica integrada</p>
        </div>

        {/* Metric 2: Cobranças Pendentes */}
        <div className="bg-[#faf9f6]/90 p-5 rounded-3xl border border-[#e6e2d7] shadow-3xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold text-[#4a504b] tracking-wider">Cobrança Pendente</span>
            <span className="p-2.5 bg-amber-100/60 rounded-xl text-amber-800"><Clock size={16} /></span>
          </div>
          <h3 className="text-3xl font-serif font-light text-[#191c1d]">€{totalPending}</h3>
          <p className="text-[10px] text-[#4a504b] mt-2 font-medium">Faturas enviadas a aguardar confirmação</p>
        </div>

        {/* Metric 3: Total Emitido */}
        <div className="bg-[#4f6054]/5 p-5 rounded-3xl border border-[#4f6054]/20 shadow-3xs">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold text-[#4a504b] tracking-wider">Total Registado</span>
            <span className="p-2.5 bg-[#4f6054]/10 rounded-xl text-[#4f6054]"><FileText size={16} /></span>
          </div>
          <h3 className="text-3xl font-serif font-light text-[#191c1d]">€{totalInvoiced}</h3>
          <p className="text-[10px] text-[#4a504b] mt-2 font-medium">Faturação global do corrente ano fiscal</p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-3xl border border-[#e6e2d7]/40 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a504b]/60" />
          <input
            type="text"
            placeholder="Pesquisar fatura por paciente ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-full pl-11 pr-5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={15} className="text-[#4a504b]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#faf9f6] border border-[#e6e2d7] rounded-full px-5 py-2 text-xs font-semibold text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
          >
            <option value="all">Filtrar Estado</option>
            <option value="Pago">Ver Liquidado (Pago)</option>
            <option value="Pendente">Aguardando Pagamento</option>
            <option value="Vencido">Faturas Vencidas</option>
          </select>
        </div>
      </div>

      {/* INVOICE LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-[#e6e2d7]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#faf9f6]/80 text-[#4a504b] text-[10px] font-bold uppercase tracking-wider border-b border-[#e6e2d7]/40 text-left">
                <th className="py-4.5 px-6">ID Fatura</th>
                <th className="py-4.5 px-6">Utente Clinico</th>
                <th className="py-4.5 px-6">Serviço Facturado</th>
                <th className="py-4.5 px-6">Data de Emissão</th>
                <th className="py-4.5 px-6">Estado Cobro</th>
                <th className="py-4.5 px-6">Honorários</th>
                <th className="py-4.5 px-6 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e2d7]/20">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#4a504b]/60 italic">
                    Sem registos financeiros que atendam aos parâmetros listados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-[#faf9f6]/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4.5 px-6 font-mono text-xs font-bold text-[#4a504b]">{inv.id}</td>
                    <td className="py-4.5 px-6 text-xs font-semibold text-[#191c1d]">{inv.patientName}</td>
                    <td className="py-4.5 px-6 text-xs font-medium text-[#191c1d]">{inv.category}</td>
                    <td className="py-4.5 px-6 text-xs text-[#4a504b]">{inv.date}</td>
                    <td className="py-4.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-mono text-xs font-bold text-[#191c1d]">€{inv.amount},00</td>
                    <td className="py-4.5 px-6 text-right">
                      <button className="p-2 hover:bg-[#faf9f6] text-[#4f6054] rounded-full transition-colors">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL POPUP */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" onClick={() => setIsNewInvoiceOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border border-[#e6e2d7] p-6 sm:p-8 w-full max-w-[460px] z-10"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#e6e2d7]/55">
              <h3 className="font-serif text-lg text-[#191c1d]">Gerar Fatura Recibo</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="p-1 text-[#4a504b] hover:bg-[#faf9f6] rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvoiceCreate} className="space-y-4">
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Utente Clinico</label>
                <select
                  value={invoiceForm.patientId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Service Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Serviço Prestado</label>
                <select
                  value={invoiceForm.category}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                >
                  <option value="Consulta EMDR">Sessão e Reprocessamento EMDR (60 min)</option>
                  <option value="Psicoterapia Geral">Consulta de Psicoterapia Sistémica (50 min)</option>
                  <option value="Relatório Clínico">Emissão de Relatório Clínico Oficial</option>
                </select>
              </div>

              {/* Date & Amount Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Honorário (€ EUR)</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 85 }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Data Emissão</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                  />
                </div>
              </div>

              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="flex-1 py-3 text-xs font-semibold hover:bg-[#faf9f6] border border-[#e6e2d7] rounded-full text-[#4a504b] transition-all"
                >
                  Sair
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold bg-[#4f6054] hover:bg-[#232d26] rounded-full text-white transition-all shadow-md"
                >
                  Emitir Cobro
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* DETAILED LEDGER PDF VISUAL MODE POPUP */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/35 backdrop-blur-xs" onClick={() => { setSelectedInvoice(null); setIsEditingInvoice(false); }} />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-[2.5rem] border border-[#e6e2d7] shadow-2xl p-8 w-full max-w-[560px] z-10 text-left font-sans flex flex-col justify-between min-h-[460px] relative overflow-hidden"
            >
              
              {isEditingInvoice ? (
                /* Edit Invoice Form Mode */
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[#e6e2d7] pb-3">
                    <h3 className="font-serif text-lg text-[#191c1d]">Editar Fatura</h3>
                    <button 
                      onClick={() => setIsEditingInvoice(false)} 
                      className="p-1 hover:bg-[#faf9f6] text-[#4a504b] rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4a504b] tracking-wider block mb-1">ID da Fatura</span>
                      <span className="text-xs font-mono font-bold bg-[#faf9f6]/95 border border-[#e6e2d7] px-3.5 py-1.5 rounded-full text-[#4a504b]">
                        {selectedInvoice.id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#4a504b] tracking-wider block mb-1">Utente Clínico</span>
                      <span className="text-xs font-semibold text-[#191c1d] block bg-[#faf9f6]/95 border border-[#e6e2d7] px-4 py-2 rounded-xl">
                        {selectedInvoice.patientName}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Serviço Prestado</label>
                      <select
                        value={editInvoiceForm.category || 'Consulta EMDR'}
                        onChange={(e) => setEditInvoiceForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                      >
                        <option value="Consulta EMDR">Sessão e Reprocessamento EMDR (60 min)</option>
                        <option value="Psicoterapia Geral">Consulta de Psicoterapia Sistémica (50 min)</option>
                        <option value="Relatório Clínico">Emissão de Relatório Clínico Oficial</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Valor (€ EUR)</label>
                        <input
                          type="number"
                          value={editInvoiceForm.amount || 85}
                          onChange={(e) => setEditInvoiceForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 85 }))}
                          className="w-full bg-[#faf9f6]/90 border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Data de Emissão</label>
                        <input
                          type="date"
                          required
                          value={editInvoiceForm.date || ''}
                          onChange={(e) => setEditInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-[#faf9f6]/90 border border-[#e6e2d7] rounded-xl px-4 py-1.5 text-xs text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Estado de Cobro</label>
                      <select
                        value={editInvoiceForm.status || 'Pendente'}
                        onChange={(e) => setEditInvoiceForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#4f6054]"
                      >
                        <option value="Pago">Liquidado (Pago)</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Vencido">Vencido</option>
                      </select>
                    </div>
                  </div>

                  {/* Edit Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#e6e2d7] mt-6 justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Pretende mesmo eliminar permanentemente a fatura ${selectedInvoice.id}?`)) {
                          onDeleteInvoice(selectedInvoice.id);
                          setSelectedInvoice(null);
                          setIsEditingInvoice(false);
                        }
                      }}
                      className="flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-2.5 rounded-full text-xs font-bold transition-all w-full sm:w-auto text-center justify-center border border-rose-200"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar Fatura</span>
                    </button>

                    <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingInvoice(false)}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-full border border-[#e6e2d7] hover:bg-[#faf9f6] text-xs font-semibold text-[#4a504b]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onEditInvoice(selectedInvoice.id, editInvoiceForm);
                          setSelectedInvoice({ ...selectedInvoice, ...editInvoiceForm } as PaymentInvoice);
                          setIsEditingInvoice(false);
                        }}
                        className="flex-1 sm:flex-none bg-[#4f6054] hover:bg-[#232d26] text-white px-8 py-2.5 rounded-full text-xs font-bold transition-all"
                      >
                        Gravar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* PDF Visual Mode View */
                <>
                  {/* Receipt Header structure */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-[#e6e2d7] pb-4">
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg tracking-tight font-light text-[#4f6054]">Dra. Carolina Amores</h4>
                        <p className="text-[10px] text-[#4a504b]/90 uppercase tracking-widest font-bold">Psicóloga Clínica • Terapeuta EMDR</p>
                        <p className="text-[9px] text-[#4a504b]/70 font-semibold leading-relaxed">Cédula Profissional OPP Nº 24523<br />NIF Clínico: 243 000 000</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-[#faf9f6] border border-[#e6e2d7] px-3.5 py-1.5 rounded-full font-mono font-bold text-[#4a504b]">
                          Recibo {selectedInvoice.id}
                        </span>
                        <span className="block text-[10px] text-[#4a504b]/70 mt-3 font-semibold">Emitido: {selectedInvoice.date}</span>
                      </div>
                    </div>

                    {/* Patient / Doctor billing detail info */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#4a504b]">Adquirente (Utente)</span>
                        <h5 className="font-bold text-[#191c1d] mt-1">{selectedInvoice.patientName}</h5>
                        <p className="text-[10px] text-[#4a504b]/80 leading-relaxed mt-0.5">Consumidor Final de Serviços de Saúde</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#4a504b]">Local de Serviços</span>
                        <h5 className="font-bold text-[#191c1d] mt-1">Gabinete de Atendimento</h5>
                        <p className="text-[10px] text-[#4a504b]/85 leading-relaxed mt-0.5">Av. Casal Ribeiro, nº 12, Lisboa, PT</p>
                      </div>
                    </div>

                    {/* Ledger fee item details */}
                    <div className="bg-[#faf9f6] rounded-2xl border border-[#e6e2d7]/50 p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs border-b border-[#e6e2d7]/40 pb-2 font-bold text-[#4a504b]">
                        <span>Descrição Descritiva de Cuidados</span>
                        <span>Montante</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#191c1d]">
                        <div className="font-semibold">{selectedInvoice.category} <p className="text-[10px] text-[#4a504b]/75 font-medium mt-0.5">Sessão Individual Clinicamente Supervisionada</p></div>
                        <span className="font-bold font-mono">€{selectedInvoice.amount},00</span>
                      </div>
                      <div className="border-t border-[#e6e2d7] pt-2 flex justify-between items-center text-xs font-bold text-[#191c1d]">
                        <span>Total Taxas Honorários</span>
                        <span className="font-mono text-[#4f6054]">€{selectedInvoice.amount},00</span>
                      </div>
                    </div>

                    {/* Tax details compliant check */}
                    <p className="text-[10px] text-[#4a504b]/75 leading-normal italic bg-[#faf9f6]/40 p-3 rounded-lg border border-[#e6e2d7]/30 text-center">
                      *Isento de IVA nos termos do artigo 9.º do CIVA. Os serviços prestados decorrem estritamente sob fins preventivos, de diagnóstico e reabilitação terapêutica.
                    </p>
                  </div>

                  {/* Action bar and status indicator */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#e6e2d7] justify-between items-center mt-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${selectedInvoice.status === 'Pago' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <span className="text-xs font-semibold text-[#191c1d]">Cobro: Factura {selectedInvoice.status}</span>
                    </div>
                    
                    <div className="flex gap-2.5 w-full sm:w-auto">
                      <button 
                        onClick={() => startEditingInvoice(selectedInvoice)}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => { setSelectedInvoice(null); setIsEditingInvoice(false); }}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-full border border-[#e6e2d7] hover:bg-[#faf9f6] text-xs font-semibold text-[#4a504b] transition-colors"
                      >
                        Fechar
                      </button>
                      <button 
                        onClick={() => alert("Simulando download de recibo oficial assinado eletronicamente...")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-[#4f6054] hover:bg-[#232d26] text-white px-5 py-2 rounded-full text-xs font-bold transition-all"
                      >
                        <Download size={13} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
