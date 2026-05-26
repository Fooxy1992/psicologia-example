'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  Plus, Users, Calendar, TrendingUp, DollarSign, Brain, MessageSquare, 
  Settings, LayoutDashboard, FileText, Bell, Search, Layers, ExternalLink, 
  MapPin, Phone, Mail, ChevronRight, Check, X, Shield, ArrowUpRight, Award, Eye, Menu
} from 'lucide-react';

// Relative Imports of our modular high-fidelity dashboards
import { 
  initialPatients, initialAppointments, initialInvoices, Patient, Appointment, PaymentInvoice 
} from '../lib/mock-data';
import DashboardHome from '../components/DashboardHome';
import AgendaView from '../components/AgendaView';
import PacientesView from '../components/PacientesView';
import PagamentosView from '../components/PagamentosView';

export default function Page() {
  // Mode Controller: 'portal' for clinical admin panel, 'website' for public landing page
  const [viewMode, setViewMode] = useState<'portal' | 'website'>('portal');
  
  // Dashboard navigation sub-tabs
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Shared React State Database
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>(initialInvoices);

  // Layout UI states
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active notification alerts lists
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>([
    { id: "nt_1", text: "Clara Neves relatou excelente regulação após exercício", time: "Há 12 min", read: false },
    { id: "nt_2", text: "Pagamento de €85 efetuado por Beatriz Guedes", time: "Há 1 hora", read: false },
    { id: "nt_3", text: "Marisa Antunes solicitou nova consulta de trauma", time: "Há 4 horas", read: true }
  ]);

  // Appointment scheduling quick modal (shares the state-creating routine with AgendaView)
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    patientId: patients[0]?.id || '',
    date: '2026-05-26',
    time: '14:00',
    type: 'Trauma EMDR' as any,
    modality: 'online' as 'online' | 'presencial'
  });

  // Clinical configuration form state
  const [workingConfig, setWorkingConfig] = useState({
    workingHoursStart: "09:00",
    workingHoursEnd: "19:00",
    sessionCost: 85,
    autoInvoice: true,
    telehealthIntegration: "Google Meet",
    profileBio: " Carolina Amores é psicóloga clínica dedicada a apoiar utentes na superação de traumas através de processos humanizados e focados no reprocessamento bio-neural (EMDR).",
  });

  // Website preview layout config
  const [websiteResponsiveMode, setWebsiteResponsiveMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Tracking page scrolls (essential for the website view)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shared state handlers
  const handleAddPatient = (info: Omit<Patient, 'id' | 'avatar' | 'lastSession' | 'nextSession' | 'traumaScoreHistory' | 'sessionsCompleted' | 'unpaidFees' | 'totalPaid'>) => {
    const newPat: Patient = {
      ...info,
      id: `pat_${patients.length + 1}`,
      lastSession: 'Não iniciada',
      nextSession: 'Por agendar',
      traumaScoreHistory: [8],
      sessionsCompleted: 0,
      unpaidFees: 0,
      totalPaid: 0,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${info.name}`
    };
    setPatients(prev => [newPat, ...prev]);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setAppointments(prev => prev.filter(app => app.patientId !== id));
  };

  const handleAddAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `app_${appointments.length + 10}`
    };
    setAppointments(prev => [...prev, newAppt]);
    
    // Update next session on patient profile
    setPatients(prev => prev.map(p => {
      if (p.id === appt.patientId) {
        return {
          ...p,
          nextSession: appt.date
        };
      }
      return p;
    }));
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleAddInvoice = (invoice: PaymentInvoice) => {
    setInvoices(prev => [invoice, ...prev]);

    // Update patient totals
    setPatients(prev => prev.map(p => {
      if (p.name === invoice.patientName) {
        return {
          ...p,
          totalPaid: invoice.status === 'Pago' ? p.totalPaid + invoice.amount : p.totalPaid,
          unpaidFees: invoice.status === 'Pendente' ? p.unpaidFees + invoice.amount : p.unpaidFees
        };
      }
      return p;
    }));
  };

  const handleEditPatient = (id: string, updatedInfo: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updatedInfo } : p));
  };

  const handleDeleteInvoice = (id: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
      setPatients(prev => prev.map(p => {
        if (p.name === invoice.patientName) {
          return {
            ...p,
            totalPaid: invoice.status === 'Pago' ? Math.max(0, p.totalPaid - invoice.amount) : p.totalPaid,
            unpaidFees: invoice.status === 'Pendente' ? Math.max(0, p.unpaidFees - invoice.amount) : p.unpaidFees
          };
        }
        return p;
      }));
    }
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const handleEditInvoice = (id: string, updatedInvoice: Partial<PaymentInvoice>) => {
    const oldInv = invoices.find(i => i.id === id);
    if (!oldInv) return;

    const newInv = { ...oldInv, ...updatedInvoice };
    setInvoices(prev => prev.map(inv => inv.id === id ? newInv : inv));

    setPatients(prev => prev.map(p => {
      let totalPaid = p.totalPaid;
      let unpaidFees = p.unpaidFees;

      if (p.name === oldInv.patientName) {
        if (oldInv.status === 'Pago') totalPaid = Math.max(0, totalPaid - oldInv.amount);
        if (oldInv.status === 'Pendente') unpaidFees = Math.max(0, unpaidFees - oldInv.amount);
      }

      if (p.name === newInv.patientName) {
        if (newInv.status === 'Pago') totalPaid = totalPaid + (newInv.amount || 0);
        if (newInv.status === 'Pendente') unpaidFees = unpaidFees + (newInv.amount || 0);
      }

      return {
        ...p,
        totalPaid,
        unpaidFees
      };
    }));
  };

  const handleAddSessionNote = (patientId: string, noteContent: string, sud: number, voc: number, symptoms: string[]) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          traumaScoreHistory: [...p.traumaScoreHistory, sud],
          sessionsCompleted: p.sessionsCompleted + 1,
          lastSession: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  const triggerQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === quickForm.patientId) || patients[0];
    if (!pat) return;

    handleAddAppointment({
      patientId: pat.id,
      patientName: pat.name,
      date: quickForm.date,
      time: quickForm.time,
      type: quickForm.type,
      status: 'Confirmada',
      modality: quickForm.modality,
      duration: '60 min',
      price: workingConfig.sessionCost
    });

    setQuickBookingOpen(false);
  };

  const renderSidebarItem = (tab: string, label: string, icon: React.ReactNode) => {
    const active = currentTab === tab;
    return (
      <button
        key={tab}
        onClick={() => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center justify-between px-5.5 py-3 rounded-2xl text-left text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative select-none ${
          active 
            ? 'bg-[#d4e7d8]/20 text-[#d4e7d8] border border-[#d4e7d8]/10' 
            : 'text-[#8a9a8f] hover:text-[#faf9f6] hover:bg-[#d4e7d8]/5'
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </span>
        {active && (
          <motion.span 
            layoutId="sidebarActivePill" 
            className="w-1.5 h-1.5 rounded-full bg-[#d4e7d8]" 
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-[#4f6054] selection:text-white bg-[#fcfbf9] text-[#191c1d] md:overflow-x-visible overflow-x-hidden flex flex-col">
      
      {/* FLOATING SAAS MODE TOGGLE PILL */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#191c1d]/90 backdrop-blur-md rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] p-1.5 z-55 flex items-center border border-white/10 select-none">
        <button
          onClick={() => setViewMode('portal')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            viewMode === 'portal'
              ? 'bg-[#4f6054] text-[#faf9f6] shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Gestão Clínica SaaS</span>
        </button>

        <button
          onClick={() => setViewMode('website')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            viewMode === 'website'
              ? 'bg-[#4f6054] text-[#faf9f6] shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ExternalLink size={14} />
          <span>Website Público</span>
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. COMPREHENSIVE PORTAL SUITE VIEW   === */}
      {/* ======================================= */}
      {viewMode === 'portal' && (
        <div className="flex flex-1 relative items-stretch">
          
          {/* SIDEBAR NAVIGATION - LUXURY OLIVE THEME */}
          <aside className={`fixed inset-y-0 left-0 bg-[#232d26] w-[270px] z-50 p-6 flex flex-col justify-between border-r border-[#4f6054]/10 transform transition-transform duration-500 xl:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="space-y-6 flex flex-col flex-1 h-full">
              {/* Sidebar Logo */}
              <div className="flex justify-between items-center pb-5 border-b border-[#8a9a8f]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4f6054]/30 border border-[#8a9a8f]/10 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                    Ψ
                  </div>
                  <div className="text-left space-y-0.5">
                    <h2 className="font-serif text-sm md:text-base tracking-tight font-light text-[#faf9f6]">Carolina Amores</h2>
                    <span className="text-[9px] uppercase tracking-widest block font-bold text-[#8a9a8f]">Portal de Saúde Mental</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="xl:hidden p-2 hover:bg-white/5 rounded-full text-[#8a9a8f]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sidebar Links */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                {renderSidebarItem("dashboard", "Painel Geral", <LayoutDashboard size={14} />)}
                {renderSidebarItem("agenda", "Calendário", <Calendar size={14} />)}
                {renderSidebarItem("pacientes", "Pacientes", <Users size={14} />)}
                {renderSidebarItem("pagamentos", "Financeiro", <DollarSign size={14} />)}
                {renderSidebarItem("configs", "Definições", <Settings size={14} />)}
              </div>
            </div>

            {/* Bottom Credit Profile Card */}
            <div className="pt-4 border-t border-[#8a9a8f]/10 flex gap-3 text-left hover:bg-white/5 p-2 rounded-2xl transition-all select-none">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                alt="Psicóloga"
                className="w-10 h-10 rounded-xl object-cover border border-[#8a9a8f]/20"
              />
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#faf9f6] truncate">Dra. Carolina Amores</h4>
                <p className="text-[9px] text-[#8a9a8f]/80 truncate font-semibold">Cédula OPP 24523 • Ativa</p>
              </div>
            </div>
          </aside>

          {/* MAIN COLUMN WORKSPACE */}
          <main className="flex-1 flex flex-col min-w-0 xl:pl-[270px]">
            
            {/* TOP BAR BRAND WIDGETS */}
            <header className="h-[74px] bg-white border-b border-[#e6e2d7]/50 px-6 sm:px-8 flex justify-between items-center shrink-0">
              {/* Left Action: Search Input or Mobile Trigger */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="xl:hidden p-2 hover:bg-[#faf9f6] rounded-full text-[#191c1d]"
                >
                  <Menu size={18} />
                </button>
                
                {/* Dynamically filters patients if focused and typing */}
                <div className="hidden sm:flex relative items-center w-[280px]">
                  <Search size={14} className="absolute left-3.5 text-[#4a504b]/60" />
                  <input
                    type="text"
                    placeholder="Efetuar busca rápida..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7]/80 rounded-full pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#4f6054] focus:outline-none"
                  />
                  
                  {/* Real Search Dropdown Popup Results */}
                  <AnimatePresence>
                    {searchFocused && searchQuery && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 top-11 bg-white border border-[#e6e2d7] rounded-2xl shadow-xl p-3 z-50 text-left max-h-[220px] overflow-y-auto"
                      >
                        <span className="text-[9px] font-bold text-[#4a504b] uppercase tracking-wide block mb-2 px-1">Resultados da busca:</span>
                        {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentTab('pacientes');
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-[#faf9f6] rounded-lg text-xs font-semibold text-[#191c1d]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4f6054]" />
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right actions: Alerts, Mini-Calendar, Action Booking & Profile */}
              <div className="flex items-center gap-4.5">
                
                {/* Trigger Nova Consulta */}
                <button
                  onClick={() => setQuickBookingOpen(true)}
                  className="hidden md:flex items-center gap-1.5 bg-[#4f6054]/10 text-[#4f6054] px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-[#4f6054]/15 hover:bg-[#4f6054] hover:text-white transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Nova Consulta</span>
                </button>

                {/* Notifications Panel Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2.5 bg-[#faf9f6]/80 hover:bg-[#faf9f6] border border-[#e6e2d7] rounded-full text-[#4a504b] transition-all relative"
                  >
                    <Bell size={15} />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-11 bg-white border border-[#e6e2d7] rounded-2xl shadow-xl w-[320px] p-4.5 z-55 text-left"
                      >
                        <div className="flex justify-between items-center border-b border-[#e6e2d7]/50 pb-2.5 mb-2.5">
                          <span className="text-xs font-bold text-[#191c1d] uppercase tracking-wide">Notificações Clínicas</span>
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              setNotificationsOpen(false);
                            }}
                            className="text-[10px] text-[#4f6054] font-bold hover:underline"
                          >
                            Lidas
                          </button>
                        </div>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className="text-xs border-b border-[#e6e2d7]/20 pb-2 space-y-0.5">
                              <p className="text-[#191c1d] font-semibold tracking-tight">{n.text}</p>
                              <span className="text-[9px] text-[#4a504b]/60 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Doctor visual Status wrapper */}
                <div className="flex items-center gap-3 border-l border-[#e6e2d7]/80 pl-4.5">
                  <div className="relative shrink-0 select-none">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                      alt="Dra. Carolina Amores" 
                      className="w-9 h-9 rounded-full object-cover border border-[#e6e2d7]"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <div className="text-left hidden lg:block leading-none">
                    <h5 className="text-xs font-bold text-[#191c1d]">Dra. Carolina</h5>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mt-1">Disponível</span>
                  </div>
                </div>

              </div>
            </header>

            {/* TAB CONTAINER WORKSPACE (Saves token by only loading active layouts) */}
            <div className="flex-1 p-6 md:p-8 space-y-8 select-none max-w-7xl w-full mx-auto pb-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full"
                >
                  {currentTab === 'dashboard' && (
                    <DashboardHome 
                      patients={patients} 
                      appointments={appointments} 
                      onNavigate={(tab) => setCurrentTab(tab)} 
                      onQuickBooking={() => setQuickBookingOpen(true)}
                    />
                  )}

                  {currentTab === 'agenda' && (
                    <AgendaView 
                      appointments={appointments} 
                      patients={patients} 
                      onAddAppointment={handleAddAppointment}
                      onCancelAppointment={handleCancelAppointment}
                    />
                  )}

                  {currentTab === 'pacientes' && (
                    <PacientesView 
                      patients={patients} 
                      onAddPatient={handleAddPatient} 
                      onDeletePatient={handleDeletePatient}
                      onEditPatient={handleEditPatient}
                    />
                  )}

                  {currentTab === 'pagamentos' && (
                    <PagamentosView 
                      invoices={invoices} 
                      patients={patients} 
                      onAddInvoice={handleAddInvoice}
                      onDeleteInvoice={handleDeleteInvoice}
                      onEditInvoice={handleEditInvoice}
                    />
                  )}

                  {currentTab === 'configs' && (
                    <div className="flex flex-col gap-6 text-left max-w-3xl">
                      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-xs space-y-6">
                        <div>
                          <h2 className="font-serif text-xl text-[#191c1d] mb-1">Definições da Operação Clínica</h2>
                          <p className="text-xs text-[#4a504b]">Personalize o expediente de trabalho, o valor faturado por consulta, integrações de videoconferência de prontuários.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#e6e2d7]/30">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-[#4a504b] block">Início da Agenda</label>
                            <input 
                              type="time" 
                              value={workingConfig.workingHoursStart} 
                              onChange={(e) => setWorkingConfig(p => ({ ...p, workingHoursStart: e.target.value }))}
                              className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-[#4a504b] block">Fim da Agenda</label>
                            <input 
                              type="time" 
                              value={workingConfig.workingHoursEnd} 
                              onChange={(e) => setWorkingConfig(p => ({ ...p, workingHoursEnd: e.target.value }))}
                              className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#e6e2d7]/30">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-[#4a504b] block">Preço da Consulta Base (€)</label>
                            <input 
                              type="number" 
                              value={workingConfig.sessionCost} 
                              onChange={(e) => setWorkingConfig(p => ({ ...p, sessionCost: parseInt(e.target.value) || 85 }))}
                              className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-[#4a504b] block">Integração Vídeo Online</label>
                            <select 
                              value={workingConfig.telehealthIntegration} 
                              onChange={(e) => setWorkingConfig(p => ({ ...p, telehealthIntegration: e.target.value }))}
                              className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                            >
                              <option value="Google Meet">Google Meet (Auto-convites)</option>
                              <option value="Zoom">Zoom Telehealth API</option>
                              <option value="Clínica Directa">Gabinete Consultório Interno</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-[#4a504b] block">Perfil Profissional Abreviado</label>
                          <textarea 
                            rows={3}
                            value={workingConfig.profileBio}
                            onChange={(e) => setWorkingConfig(p => ({ ...p, profileBio: e.target.value }))}
                            className="w-full bg-[#faf9f6] border border-[#e6e2d7] p-3 text-xs rounded-xl focus:outline-none resize-none"
                          />
                        </div>

                        <div className="flex justify-between items-center bg-[#faf9f6] p-4 border border-[#e6e2d7] rounded-2xl">
                          <div>
                            <h4 className="text-xs font-bold text-[#191c1d]">Faturação Automatizada</h4>
                            <p className="text-[10px] text-[#4a504b]">Gera guias de pagamento em PDF para o utente na consolidação de notas de consulta.</p>
                          </div>
                          <button 
                            onClick={() => setWorkingConfig(prev => ({ ...prev, autoInvoice: !prev.autoInvoice }))}
                            className={`px-4 py-1 text-xs rounded-full font-bold transition-all ${
                              workingConfig.autoInvoice 
                                ? 'bg-[#d4e7d8] text-[#4f6054] border border-[#4f6054]/20' 
                                : 'bg-gray-100 text-gray-500 border border-gray-300'
                            }`}
                          >
                            {workingConfig.autoInvoice ? "Ativo" : "Mudo"}
                          </button>
                        </div>

                        <button 
                          onClick={() => alert("Definições guardadas na infraestrutura clínica.")}
                          className="w-full bg-[#4f6054] hover:bg-[#232d26] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-full transition-colors"
                        >
                          Salvar Configurações
                        </button>
                      </div>
                    </div>
                  )}


                </motion.div>
              </AnimatePresence>
            </div>

          </main>

          {/* SAAS CONSOLIDATOR BOOKING POPUP */}
          <AnimatePresence>
            {quickBookingOpen && (
              <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" onClick={() => setQuickBookingOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2.5rem] border border-[#e6e2d7] p-8 w-full max-w-[460px] z-10 text-left"
                >
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#e6e2d7]">
                    <h3 className="font-serif text-lg text-[#191c1d]">Agendamento Expresso</h3>
                    <button onClick={() => setQuickBookingOpen(false)} className="p-1.5 text-[#4a504b] hover:bg-gray-100 rounded-full">
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={triggerQuickBookingSubmit} className="space-y-4">
                    {/* Patient */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#4a504b]">Paciente</label>
                      <select
                        value={quickForm.patientId}
                        onChange={(e) => setQuickForm(p => ({ ...p, patientId: e.target.value }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-all px-4 py-2.5 text-xs focus:outline-none"
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* DateTime Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-[#4a504b]">Data</label>
                        <input
                          type="date"
                          required
                          value={quickForm.date}
                          onChange={(e) => setQuickForm(p => ({ ...p, date: e.target.value }))}
                          className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-all px-4 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-[#4a504b]">Horário</label>
                        <select
                          value={quickForm.time}
                          onChange={(e) => setQuickForm(p => ({ ...p, time: e.target.value }))}
                          className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-all px-4 py-2.5 text-xs focus:outline-none"
                        >
                          <option value="09:00">09:00</option>
                          <option value="10:30">10:30</option>
                          <option value="12:00">12:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:30">15:30</option>
                          <option value="17:00">17:00</option>
                          <option value="18:30">18:30</option>
                        </select>
                      </div>
                    </div>

                    {/* Specialty category */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#4a504b]">Terapêutica Indicada</label>
                      <select
                        value={quickForm.type}
                        onChange={(e) => setQuickForm(p => ({ ...p, type: e.target.value as any }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-all px-4 py-2.5 text-xs focus:outline-none"
                      >
                        <option value="Trauma EMDR">Trauma EMDR</option>
                        <option value="Consulta Psicoterapia">Consulta Psicoterapia</option>
                        <option value="Avaliação Inicial">Avaliação Inicial</option>
                        <option value="Consulta Urgente">Consulta Urgente</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-[#4a504b]">Modo</label>
                      <div className="flex bg-[#faf9f6] border border-[#e6e2d7] rounded-xl p-1">
                        {(['online', 'presencial'] as const).map(mod => (
                          <button
                            type="button"
                            key={mod}
                            onClick={() => setQuickForm(p => ({ ...p, modality: mod }))}
                            className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all ${
                              quickForm.modality === mod ? 'bg-white shadow-2xs text-[#191c1d]' : 'text-[#4a504b]'
                            }`}
                          >
                            {mod}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#4f6054] hover:bg-[#232d26] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-full mt-4 transition-all shadow-md"
                    >
                      Processar Reserva Externa
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ======================================= */}
      {/* 2. RE-MODERNISED LANDING WEBPAGE VIEW === */}
      {/* ======================================= */}
      {viewMode === 'website' && (
        <div className="flex flex-col min-h-screen relative text-left select-text bg-[#fcfbf9]">
          
          {/* BACKGROUND SPARKLES */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4e7d8]/20 rounded-full blur-[140px] -z-10 pointer-events-none" />
          <div className="absolute top-[35%] left-0 w-[400px] h-[400px] bg-[#faf9f6] rounded-full blur-[100px] -z-10 pointer-events-none" />

          {/* LANDING FLOATING HEADERBAR */}
          <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl rounded-full z-50 transition-all duration-500 py-3 px-8 ${
            scrolled ? 'bg-white/80 backdrop-blur-md border border-white/40 shadow-md' : 'bg-white/40'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg md:text-xl tracking-tight font-light text-[#4f6054]">
                Dra. Carolina Amores
              </span>
              
              <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-wider text-[#4a504b]">
                <a href="#emdr" className="hover:text-[#4f6054]">EMDR</a>
                <a href="#metodo" className="hover:text-[#4f6054]">O Método</a>
                <a href="#percurso" className="hover:text-[#4f6054]">Percurso</a>
                <a href="#contacto" className="hover:text-[#4f6054]">Contacto</a>
              </div>

              <a 
                href="#contacto" 
                className="bg-[#4f6054] hover:bg-[#232d26] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm"
              >
                Marcar Consulta
              </a>
            </div>
          </nav>

          {/* HERO SECTION CONTAINER */}
          <section className="pt-36 pb-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4f6054] bg-[#d4e7d8]/40 border border-[#4f6054]/10 px-4 py-1.5 rounded-full inline-block">
                Psicologia Clínica & Reprocessamento de Traumas
              </span>
              
              <h1 className="font-serif font-light text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight text-[#191c1d]">
                O caminho para reprocessar o seu passado e libertar o seu presente.
              </h1>
              
              <p className="text-sm md:text-base leading-relaxed text-[#4a504b]/95 max-w-xl">
                Ajudo utentes no tratamento especializado de perturbação de stresse pós-traumático, burnout emocional profunda e lutos persistentes, aliando o rigor científico do método EMDR a uma presença acolhedora e exclusiva.
              </p>

              <div className="flex gap-4 pt-2">
                <a 
                  href="#contacto"
                  className="bg-[#4f6054] hover:bg-[#232d26] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-md"
                >
                  Iniciar Terapia Ativa
                </a>
                <a 
                  href="#emdr"
                  className="px-7 py-3.5 rounded-full border border-[#e6e2d7] hover:bg-gray-100/40 text-xs font-semibold text-[#4a504b] transition-all"
                >
                  Conhecer o EMDR
                </a>
              </div>
            </div>

            {/* Visual banner */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-[#d4e7d8]/30 rounded-[2.5rem] rotate-2 -z-10 blur-xs" />
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
                alt="Zen Wellness"
                className="w-full h-[460px] object-cover rounded-[2.5rem] shadow-xl border border-white/40"
              />
            </div>
          </section>

          {/* EMDR METHODOLOGICAL EXPLANATIONS */}
          <section id="emdr" className="py-20 bg-[#faf9f6] border-y border-[#e6e2d7]/50 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <span className="font-serif italic text-base block text-[#4f6054]">Sensação de Segurança & Rigor Clínico</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#191c1d] tracking-tight font-light">Como funciona o Reprocessamento Bi-Lateral (EMDR)?</h2>
              <p className="text-xs md:text-sm text-[#4a504b]/95 leading-relaxed">
                O EMDR (Eye Movement Desensitization and Reprocessing) é uma psicoterapia cientificamente comprovada, recomendada pela Organização Mundial de Saúde (OMS). Através da estimulação sensorial bilateral alternada (visual, táctil ou auditiva), ativamos o sistema neural intrínseco de cura do cérebro, permitindo a dessensibilização e o reprocessamento adaptativo de memórias difíceis ou traumáticas bloqueadas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
                <div className="bg-white p-6 rounded-2xl border border-[#e6e2d7]">
                  <h4 className="font-serif text-lg text-[#191c1d] mb-2 font-semibold">1. Preparação & Estabilidade</h4>
                  <p className="text-xs text-[#4a504b] leading-relaxed">Criamos uma âncora interna de lugar seguro para sustentar as sensações corporais com total segurança.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#e6e2d7]">
                  <h4 className="font-serif text-lg text-[#191c1d] mb-2 font-semibold">2. Estimulação Ativa</h4>
                  <p className="text-xs text-[#4a504b] leading-relaxed">Roteiros bilaterais estimulam os caminhos hemisféricos cerebrais para dissolver o sofrimento original.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#e6e2d7]">
                  <h4 className="font-serif text-lg text-[#191c1d] mb-2 font-semibold">3. Integração Adaptativa</h4>
                  <p className="text-xs text-[#4a504b] leading-relaxed">Promovemos crenças cognitivas saudáveis e de autocompaixão em relação à história vivida.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT FORM AND LOCATION SECTION */}
          <section id="contacto" className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl text-[#191c1d] tracking-tight font-light">Agende o seu Espaço</h2>
              <p className="text-xs md:text-sm text-[#4a504b]/95 leading-relaxed">
                As sessões decorrem no meu gabinete privado em Lisboa ou através de uma plataforma segura de videoconsulta (online), salvaguardando total sigilo profissional e ética clínica.
              </p>

              <div className="space-y-4 text-xs font-semibold text-[#4a504b]">
                <p className="flex items-center gap-3"><MapPin size={16} className="text-[#4f6054]" /> Av. Casal Ribeiro, nº 12, Lisboa, Portugal</p>
                <p className="flex items-center gap-3"><Phone size={16} className="text-[#4f6054]" /> +351 912 345 678</p>
                <p className="flex items-center gap-3"><Mail size={16} className="text-[#4f6054]" /> carolina.amores@psicologia.pt</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#e6e2d7] rounded-3xl shadow-sm">
              <h3 className="font-serif text-lg text-[#191c1d] mb-4">Pedido de Consulta</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada com sucesso! Dra. Carolina entrará em contacto dentro de 24 horas."); }} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#4a504b]">Nome Completo</label>
                    <input type="text" required placeholder="Ex: Maria Pereira" className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#4a504b]">E-mail</label>
                    <input type="email" required placeholder="maria.pereira@email.com" className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#4a504b]">Motivo ou Especialidade Pretendida</label>
                  <select className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none">
                    <option>Sessão de EMDR (Trauma, Crise, Luto)</option>
                    <option>Psicoterapia Sistémica Integrada</option>
                    <option>Primeira Consulta de Avaliação Clínica</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#4a504b]">Mensagem Adicional</label>
                  <textarea rows={3} placeholder="Escreva brevemente o que o motiva a procurar apoio..." className="w-full bg-[#faf9f6] border border-[#e6e2d7] p-4 rounded-xl focus:outline-none resize-none" />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#4f6054] hover:bg-[#232d26] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-md mt-2"
                >
                  Solicitar Agendamento
                </button>
              </form>
            </div>
          </section>

          {/* SITE FOOTER */}
          <footer className="bg-[#232d26] py-12 px-6 border-t border-white/5 text-[#8a9a8f] text-[10px] uppercase tracking-widest text-center mt-auto pb-28">
            <p className="mb-2">© {new Date().getFullYear()} Dra. Carolina Amores. Todos os direitos reservados.</p>
            <p>Cédula OPP 24523 • Ordem dos Psicólogos Portugueses</p>
          </footer>

        </div>
      )}

    </div>
  );
}
