'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, X, Brain, Heart, ChevronRight, FileText, ArrowLeft,
  DollarSign, Activity, Settings, Eye, Phone, Mail, Folder, Upload, Trash2, CheckCircle2 
} from 'lucide-react';
import { Patient } from '../lib/mock-data';

interface PacientesViewProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'avatar' | 'lastSession' | 'nextSession' | 'traumaScoreHistory' | 'sessionsCompleted' | 'unpaidFees' | 'totalPaid'>) => void;
  onDeletePatient: (id: string) => void;
  onEditPatient: (id: string, updatedInfo: Partial<Patient>) => void;
}

export default function PacientesView({ patients, onAddPatient, onDeletePatient, onEditPatient }: PacientesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTreatment, setFilterTreatment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Drawer states
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Edit Patient state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});

  const startEditing = (patient: Patient) => {
    setEditFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      treatment: patient.treatment,
      status: patient.status,
      clinicalHistory: patient.clinicalHistory
    });
    setIsEditing(true);
  };

  // New Patient Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: 30,
    treatment: 'Terapia EMDR' as any,
    status: 'Em Processamento' as any,
    clinicalHistory: '',
  });

  // Mock Upload states
  const [selectedFileList, setSelectedFileList] = useState<Array<{ name: string; date: string; size: string }>>([
    { name: "Contrato_Consentimento_Informado.pdf", date: "2026-05-10", size: "1.2 MB" },
    { name: "Grelha_Anamnese_Inicial.pdf", date: "2026-05-10", size: "450 KB" }
  ]);
  const [uploading, setUploading] = useState(false);

  const selectedPatient = patients.find(p => p.id === activePatientId);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onAddPatient(formData);
    setIsRegisterOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: 30,
      treatment: 'Terapia EMDR',
      status: 'Em Processamento',
      clinicalHistory: '',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setTimeout(() => {
        setSelectedFileList(prev => [
          ...prev,
          { name: file.name, date: new Date().toISOString().split('T')[0], size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }
        ]);
        setUploading(false);
      }, 1200);
    }
  };

  const handleFileDelete = (index: number) => {
    setSelectedFileList(prev => prev.filter((_, idx) => idx !== index));
  };

  // Filter logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTreatment = filterTreatment === 'all' || patient.treatment === filterTreatment;
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesTreatment && matchesStatus;
  });

  const getStatusStyle = (status: Patient['status']) => {
    switch (status) {
      case 'Estável': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Em Processamento': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Fase Crítica': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Alta Recente': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full text-left">
      
      {/* SECTION HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-xs">
        <div>
          <span className="text-[#4f6054] text-xs font-semibold uppercase tracking-widest block mb-1">Operações Integradas</span>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-[#191c1d]">Registo e Listagem de Pacientes</h1>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center gap-2 bg-[#4f6054] hover:bg-[#232d26] text-white text-xs md:text-sm font-semibold tracking-wide px-5 py-3 rounded-full transition-all duration-400 shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          <span>Novo Paciente</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-[#e6e2d7]/40 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a504b]/60" />
          <input
            type="text"
            placeholder="Pesquisar paciente por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-full pl-11 pr-5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#4f6054] text-[#191c1d]"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Treatment Select */}
          <select
            value={filterTreatment}
            onChange={(e) => setFilterTreatment(e.target.value)}
            className="bg-[#faf9f6] border border-[#e6e2d7] rounded-full px-4 py-2 text-xs font-medium text-[#191c1d] focus:outline-none"
          >
            <option value="all">Todos os Tratamentos</option>
            <option value="Terapia EMDR">Terapia EMDR</option>
            <option value="Psicoterapia Integrativa">Psicoterapia Integrativa</option>
            <option value="Gestão de Crise">Gestão de Crise</option>
            <option value="Apoio em Luto">Apoio em Luto</option>
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#faf9f6] border border-[#e6e2d7] rounded-full px-4 py-2 text-xs font-medium text-[#191c1d] focus:outline-none"
          >
            <option value="all">Todos os Estados</option>
            <option value="Estável">Estável</option>
            <option value="Em Processamento">Em Processamento</option>
            <option value="Fase Crítica">Fase Crítica</option>
            <option value="Alta Recente">Alta Recente</option>
          </select>
        </div>
      </div>

      {/* PATIENTS DATA TABLE */}
      <div className="bg-white rounded-3xl border border-[#e6e2d7]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faf9f6]/80 text-[#4a504b] text-[10px] font-bold uppercase tracking-wider border-b border-[#e6e2d7]/40">
                <th className="py-4.5 px-6">Identificação Paciente</th>
                <th className="py-4.5 px-6">Idade</th>
                <th className="py-4.5 px-6">Tipo Tratamento</th>
                <th className="py-4.5 px-6">Estado Clínico</th>
                <th className="py-4.5 px-6">Sessões</th>
                <th className="py-4.5 px-6 text-right">Acesso Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e2d7]/20">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#4a504b]/60 italic">
                    Nenhum paciente registado atende aos critérios descritos.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    onClick={() => setActivePatientId(patient.id)}
                    className="hover:bg-[#faf9f6]/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img 
                        src={patient.avatar} 
                        alt={patient.name} 
                        className="w-10 h-10 rounded-full object-cover border border-[#e6e2d7] select-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-[#191c1d] group-hover:text-[#4f6054] transition-colors">{patient.name}</h3>
                        <p className="text-[11px] text-[#4a504b]/75">{patient.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#191c1d] font-medium">{patient.age} anos</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-[#191c1d]">{patient.treatment}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono font-medium text-[#4a504b]">{patient.sessionsCompleted} consultas</td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 bg-[#faf9f6] text-[#4f6054] rounded-full hover:bg-[#d4e7d8] transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PATIENT DETAIL DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            
            {/* Blurry Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setActivePatientId(null); setIsEditing(false); }}
              className="absolute inset-0 bg-black/25 backdrop-blur-xs"
            />

            {/* Sliding Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              className="relative w-full max-w-[640px] bg-white h-full shadow-[0_0_60px_rgba(0,0,0,0.1)] flex flex-col justify-between overflow-y-auto"
            >
              
              {/* Drawer Topbar */}
              <div className="p-6 border-b border-[#e6e2d7]/50 flex justify-between items-center bg-[#faf9f6]">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setActivePatientId(null); setIsEditing(false); }}
                    className="p-2 hover:bg-[#e6e2d7]/35 rounded-full text-[#4a504b] transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="font-serif text-lg font-light text-[#191c1d]">Ficha Médica</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        startEditing(selectedPatient);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${
                      isEditing 
                        ? 'bg-[#e6e2d7] text-[#4a504b] border-[#cbd5e1] hover:bg-slate-150' 
                        : 'bg-[#faf9f6] text-[#4f6054] border-[#e6e2d7] hover:bg-[#d4e7d8]'
                    }`}
                  >
                    {isEditing ? 'Cancelar' : 'Editar Ficha'}
                  </button>

                  {!isEditing && (
                    <button
                      onClick={() => {
                        if (confirm(`Remover ficha de ${selectedPatient.name}?`)) {
                          onDeletePatient(selectedPatient.id);
                          setActivePatientId(null);
                        }
                      }}
                      className="flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-full text-xs font-semibold transition-colors"
                      title="Eliminar registo"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Content */}
              {isEditing ? (
                <div className="flex-1 p-6 sm:p-8 space-y-5 overflow-y-auto">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Correio Eletrónico</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Contacto Telefónico</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Idade (Anos)</label>
                      <input
                        type="number"
                        value={editFormData.age || 30}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Método Clínico</label>
                      <select
                        value={editFormData.treatment || 'Terapia EMDR'}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, treatment: e.target.value as any }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                      >
                        <option value="Terapia EMDR">Terapia EMDR</option>
                        <option value="Psicoterapia Integrativa">Psicoterapia Integrativa</option>
                        <option value="Gestão de Crise">Gestão de Crise</option>
                        <option value="Apoio em Luto">Apoio em Luto</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Estado Clínico</label>
                    <select
                      value={editFormData.status || 'Em Processamento'}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    >
                      <option value="Estável">Estável</option>
                      <option value="Em Processamento">Em Processamento</option>
                      <option value="Fase Crítica">Fase Crítica</option>
                      <option value="Alta Recente">Alta Recente</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Anamnese / Histórico Clínico</label>
                    <textarea
                      rows={6}
                      value={editFormData.clinicalHistory || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, clinicalHistory: e.target.value }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl p-4 text-xs text-[#191c1d] focus:ring-1 focus:ring-[#4f6054] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 sm:p-8 space-y-8">
                  
                  {/* Header Summary */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 border-b border-[#e6e2d7]/30">
                    <img
                      src={selectedPatient.avatar}
                      alt={selectedPatient.name}
                      className="w-18 h-18 rounded-3xl object-cover border-2 border-white shadow-md select-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient.name}`;
                      }}
                    />
                    <div className="space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </span>
                      <h3 className="font-serif text-2xl text-[#191c1d] tracking-tight">{selectedPatient.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4a504b]">
                        <span className="flex items-center gap-1"><Phone size={12} /> {selectedPatient.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={12} /> {selectedPatient.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#faf9f6]/50 p-4 rounded-2xl border border-[#e6e2d7]/30">
                      <span className="text-[9px] font-bold text-[#4a504b] uppercase block mb-1">Método Clínico</span>
                      <span className="text-xs font-semibold text-[#191c1d]">{selectedPatient.treatment}</span>
                    </div>
                    <div className="bg-[#faf9f6]/50 p-4 rounded-2xl border border-[#e6e2d7]/30">
                      <span className="text-[9px] font-bold text-[#4a504b] uppercase block mb-1">Total Liquidado</span>
                      <span className="text-xs font-bold text-[#4f6054]">€{selectedPatient.totalPaid}</span>
                    </div>
                    <div className="bg-[#faf9f6]/50 p-4 rounded-2xl border border-[#e6e2d7]/30">
                      <span className="text-[9px] font-bold text-[#4a504b] uppercase block mb-1">Taxas Pendentes</span>
                      <span className="text-xs font-bold text-[#cf665c]">€{selectedPatient.unpaidFees}</span>
                    </div>
                  </div>

                  {/* History Anamnese */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a504b]">Anamnese e Queixas Iniciais</h4>
                    <p className="text-xs leading-relaxed text-[#191c1d]/90 bg-[#faf9f6] p-4.5 rounded-2xl border border-[#e6e2d7]/40">
                      {selectedPatient.clinicalHistory}
                    </p>
                  </div>

                  {/* Visual trauma evolution sparkline chart */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a504b]">Evolução do Stresse / Perturbação (SUD)</h4>
                      <span className="text-[10px] text-[#4f6054] font-medium">Meta: Reduzir para abaixo de 2</span>
                    </div>

                    {/* SVG line indicator */}
                    <div className="bg-[#faf9f6]/30 border border-[#e6e2d7]/40 p-5 rounded-2xl">
                      <div className="h-28 flex items-end gap-3.5 pt-4 px-2 relative border-b border-[#e6e2d7]">
                        {selectedPatient.traumaScoreHistory.map((score, idx) => {
                          const pct = (score / 10) * 100;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative group z-10">
                              {/* Score Tag */}
                              <span className="text-[10px] font-mono font-bold text-[#4f6054]">{score}</span>
                              
                              {/* Visual Bar Column */}
                              <div 
                                className="w-full rounded-t-lg bg-[#4f6054]/50 group-hover:bg-[#4f6054] transition-all relative overflow-hidden" 
                                style={{ height: `${pct}%`, minHeight: '12px' }}
                              >
                                <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                              </div>

                              {/* Session Label */}
                              <span className="text-[8px] uppercase font-mono text-[#4a504b]/95">S{idx + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Documents Management Mock Upload */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a504b]">Portefólio de Documentos Clínicos</h4>
                      <label className="flex items-center gap-1 text-[10px] text-[#4f6054] hover:text-[#232d26] cursor-pointer font-semibold bg-[#d4e7d8] px-3.5 py-1.5 rounded-full border border-[#4f6054]/10 transition-colors">
                        <Upload size={12} />
                        <span>{uploading ? "A carregar..." : "Carregar Ficheiro"}</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>

                    {/* List files */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedFileList.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#e6e2d7] hover:border-[#4f6054]/30 rounded-xl transition-all">
                          <div className="p-2 bg-[#faf9f6] text-[#4f6054] rounded-lg">
                            <FileText size={16} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className="text-xs font-semibold text-[#191c1d] truncate mb-0.5">{file.name}</h5>
                            <span className="text-[9px] text-[#4a504b]/70 block">{file.date} • {file.size}</span>
                          </div>
                          <button 
                            onClick={() => handleFileDelete(idx)}
                            className="p-1.5 text-[#4a504b]/50 hover:text-rose-600 transition-colors"
                            title="Remover ficheiro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Close Bottom Actions */}
              <div className="p-6 border-t border-[#e6e2d7]/40 bg-[#faf9f6]/40 flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-[#e6e2d7] hover:bg-[#faf9f6] text-[#4a504b] font-semibold text-xs tracking-wider px-6 py-3 rounded-full transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editFormData.name) {
                          onEditPatient(selectedPatient.id, editFormData);
                          setIsEditing(false);
                        }
                      }}
                      className="flex-1 bg-[#4f6054] hover:bg-[#232d26] text-white font-semibold text-xs tracking-wider px-6 py-3 rounded-full shadow-xs transition-all"
                    >
                      Guardar Alterações
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setActivePatientId(null); setIsEditing(false); }}
                    className="bg-[#4f6054] hover:bg-[#232d26] text-white font-medium text-xs tracking-wider px-8 py-3 rounded-full shadow-xs transition-all w-full"
                  >
                    Fechar Ficha do Paciente
                  </button>
                )}
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* NEW PATIENT FORM SHEET IN-MODAL */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterOpen(false)}
              className="absolute inset-0 bg-black/25 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              className="relative w-full max-w-[500px] bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              <div className="p-6 border-b border-[#e6e2d7]/50 flex justify-between items-center bg-[#faf9f6]">
                <h3 className="font-serif text-lg text-[#191c1d]">Registo de Novo Paciente</h3>
                <button 
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-1.5 hover:bg-[#e6e2d7]/30 rounded-full text-[#4a504b]/80"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreatePatient} className="flex-1 p-6 space-y-5 overflow-y-auto">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Alice Antunes de Sousa"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                  />
                </div>

                {/* Email Phone row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Correio Eletrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="maria@email.pt"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Contacto Telefónico</label>
                    <input
                      type="tel"
                      required
                      placeholder="+351 912 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Age & Methods */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Idade (Anos)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Método Indicado</label>
                    <select
                      value={formData.treatment}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value as any }))}
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                    >
                      <option value="Terapia EMDR">Terapia EMDR</option>
                      <option value="Psicoterapia Integrativa">Psicoterapia Integrativa</option>
                      <option value="Gestão de Crise">Gestão de Crise</option>
                      <option value="Apoio em Luto">Apoio em Luto</option>
                    </select>
                  </div>
                </div>

                {/* Anamnese */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Anamnese Preliminar / Histórico</label>
                  <textarea
                    rows={4}
                    placeholder="Sintomas predominantes, medicação activa, gatilhos conhecidos no trauma..."
                    value={formData.clinicalHistory}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicalHistory: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl p-4 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none resize-none"
                  />
                </div>

                {/* Prompt button */}
                <button
                  type="submit"
                  className="w-full mt-4 bg-[#4f6054] hover:bg-[#232d26] text-white font-medium text-xs tracking-wider py-3.5 rounded-full transition-all shadow-md"
                >
                  Registar Introdutoriamente Paciente
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
