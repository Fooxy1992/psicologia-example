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

  // Public website booking state
  const [webForm, setWebForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Trauma EMDR' as 'Trauma EMDR' | 'Consulta Psicoterapia' | 'Avaliação Inicial' | 'Consulta Urgente',
    date: '2026-05-27',
    time: '10:30',
    modality: 'online' as 'online' | 'presencial',
    message: ''
  });
  const [webFormSubmitted, setWebFormSubmitted] = useState(false);

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

  const handleConfirmAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Confirmada' as const } : a));
    // Find name and auto-mark notification as read
    const updated = appointments.find(a => a.id === id);
    if (updated) {
      const name = updated.patientName;
      setNotifications(prev => prev.map(n => n.text.includes(name) ? { ...n, read: true } : n));
    }
  };

  const handleWebBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find if the patient exists already
    const existingPatient = patients.find(
      p => p.email.toLowerCase() === webForm.email.toLowerCase() || 
           p.name.toLowerCase() === webForm.name.toLowerCase()
    );
    
    let patientId = '';
    let finalPatientName = webForm.name;
    
    if (!existingPatient) {
      let treatmentMapped: 'Terapia EMDR' | 'Psicoterapia Integrativa' | 'Gestão de Crise' | 'Apoio em Luto' = 'Terapia EMDR';
      if (webForm.type === 'Consulta Psicoterapia') {
        treatmentMapped = 'Psicoterapia Integrativa';
      } else if (webForm.type === 'Consulta Urgente') {
        treatmentMapped = 'Gestão de Crise';
      } else if (webForm.type === 'Avaliação Inicial') {
        treatmentMapped = 'Terapia EMDR';
      }

      patientId = `pat_${patients.length + 1}`;
      const newPat: Patient = {
        id: patientId,
        name: webForm.name,
        email: webForm.email,
        phone: webForm.phone || '+351 912 345 678',
        age: 32,
        treatment: treatmentMapped,
        status: 'Em Processamento', // Pending evaluation
        lastSession: 'Não iniciada',
        nextSession: webForm.date,
        traumaScoreHistory: [8],
        sessionsCompleted: 0,
        unpaidFees: 0,
        totalPaid: 0,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${webForm.name}`,
        clinicalHistory: webForm.message || 'Pedido de consulta via website público.'
      };
      setPatients(prev => [newPat, ...prev]);
    } else {
      patientId = existingPatient.id;
      finalPatientName = existingPatient.name;
      // Update next session on existing patient profile
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, nextSession: webForm.date } : p));
    }

    const newAppt: Appointment = {
      id: `app_${appointments.length + 11}`,
      patientId: patientId,
      patientName: finalPatientName,
      date: webForm.date,
      time: webForm.time,
      type: webForm.type,
      status: 'Pendente',
      modality: webForm.modality,
      duration: '60 min',
      price: workingConfig.sessionCost
    };
    setAppointments(prev => [...prev, newAppt]);

    const newNotif = {
      id: `nt_${Date.now()}`,
      text: `Website: Novo pedido de ${finalPatientName} para ${webForm.date} às ${webForm.time}`,
      time: "Agora",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setWebFormSubmitted(true);
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
        className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-all duration-300 relative select-none ${
          active 
            ? 'bg-brand-50 text-brand-900' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </span>
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
          <aside className={`fixed inset-y-0 left-0 bg-white w-[270px] z-50 flex flex-col justify-between border-r border-slate-200 transform transition-transform duration-500 xl:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="space-y-2 flex flex-col flex-1 h-full">
              {/* Sidebar Logo */}
              <div className="h-[74px] flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white font-serif italic text-lg shadow-sm">
                    Ψ
                  </div>
                  <div className="text-left space-y-0.5">
                    <h2 className="font-bold text-sm text-slate-900">Clinical Management</h2>
                    <span className="text-[9px] uppercase tracking-widest block font-bold text-slate-500">Saúde Mental</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="xl:hidden p-2 hover:bg-slate-50 rounded-full text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sidebar Links */}
              <div className="flex-1 overflow-y-auto space-y-1.5 px-4 pt-4 scrollbar-thin">
                {renderSidebarItem("dashboard", "Painel Geral", <LayoutDashboard size={14} />)}
                {renderSidebarItem("agenda", "Calendário", <Calendar size={14} />)}
                {renderSidebarItem("pacientes", "Pacientes", <Users size={14} />)}
                {renderSidebarItem("pagamentos", "Financeiro", <DollarSign size={14} />)}
                {renderSidebarItem("configs", "Definições", <Settings size={14} />)}
              </div>
            </div>

            {/* Bottom Credit Profile Card */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 m-2 rounded-xl mb-4 text-left flex gap-3 transition-all select-none">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                alt="Psicóloga"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">Dra. Carolina Amores</h4>
                <p className="text-[9px] text-brand-600 truncate font-bold uppercase tracking-wider">Conta SaaS Ativa</p>
              </div>
            </div>
          </aside>

          {/* MAIN COLUMN WORKSPACE */}
          <main className="flex-1 flex flex-col min-w-0 xl:pl-[270px]">
            
            {/* TOP BAR BRAND WIDGETS */}
            <header className="h-[74px] bg-white border-b border-slate-200 px-6 sm:px-8 flex justify-between items-center shrink-0">
              {/* Left Action: Search Input or Mobile Trigger */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="xl:hidden p-2 hover:bg-slate-50 rounded-full text-slate-600"
                >
                  <Menu size={18} />
                </button>
                
                {/* Dynamically filters patients if focused and typing */}
                <div className="hidden sm:flex relative items-center w-[280px]">
                  <Search size={14} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Efetuar busca rápida..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder-slate-400"
                  />
                  
                  {/* Real Search Dropdown Popup Results */}
                  <AnimatePresence>
                    {searchFocused && searchQuery && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 z-50 text-left max-h-[220px] overflow-y-auto"
                      >
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-2 px-1">Resultados da busca:</span>
                        {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentTab('pacientes');
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
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
                  className="hidden md:flex items-center gap-1.5 bg-brand-50 text-brand-900 border border-brand-100 px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-900 hover:text-white transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Nova Consulta</span>
                </button>

                {/* Notifications Panel Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 transition-all relative"
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
                        className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-xl w-[320px] p-4.5 z-55 text-left"
                      >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notificações Clínicas</span>
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              setNotificationsOpen(false);
                            }}
                            className="text-[10px] text-brand-600 font-bold hover:underline"
                          >
                            Lidas
                          </button>
                        </div>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto">
                          {notifications.map(n => (
                            <div key={n.id} className="text-xs border-b border-slate-50 pb-2 space-y-0.5">
                              <p className="text-slate-800 font-semibold tracking-tight">{n.text}</p>
                              <span className="text-[9px] text-slate-500 block">{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Doctor visual Status wrapper */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-4.5">
                  <div className="relative shrink-0 select-none">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                      alt="Dra. Carolina Amores" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <div className="text-left hidden lg:block leading-none">
                    <h5 className="text-xs font-bold text-slate-900">Dra. Carolina</h5>
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
                      onConfirmAppointment={handleConfirmAppointment}
                      onCancelAppointment={handleCancelAppointment}
                    />
                  )}

                  {currentTab === 'agenda' && (
                    <AgendaView 
                      appointments={appointments} 
                      patients={patients} 
                      onAddAppointment={handleAddAppointment}
                      onCancelAppointment={handleCancelAppointment}
                      onConfirmAppointment={handleConfirmAppointment}
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
              
              {webFormSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#faf9f6] border border-[#d4e7d8] rounded-2xl p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#d4e7d8] flex items-center justify-center text-[#4f6054] mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-base text-[#191c1d]">Pedido Recebido com Sucesso!</h4>
                    <p className="text-xs text-[#4a504b] leading-relaxed max-w-md mx-auto">
                      O seu pedido de consulta foi encaminhado diretamente para o portal de gestão clínica da Dra. Carolina Amores. Entraremos em contacto muito em breve para confirmar o seu horário.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#e6e2d7] text-left text-xs space-y-1 max-w-xs mx-auto">
                    <p><strong>Paciente:</strong> {webForm.name}</p>
                    <p><strong>E-mail:</strong> {webForm.email}</p>
                    <p><strong>Data Proposta:</strong> {webForm.date} às {webForm.time}</p>
                    <p><strong>Formato:</strong> {webForm.modality === 'online' ? 'Videoconsulta (Online)' : 'Presencial (Gabinete)'}</p>
                    <p><strong>Especialidade:</strong> {webForm.type}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setWebForm({
                        name: '',
                        email: '',
                        phone: '',
                        type: 'Trauma EMDR',
                        date: '2026-05-27',
                        time: '10:30',
                        modality: 'online',
                        message: ''
                      });
                      setWebFormSubmitted(false);
                    }}
                    className="bg-[#4f6054] hover:bg-[#232d26] text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all"
                  >
                    Solicitar Mais Um Agendamento
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleWebBookingSubmit} className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Nome Completo</label>
                      <input 
                        type="text" 
                        required 
                        value={webForm.name}
                        onChange={(e) => setWebForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Maria Pereira" 
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">E-mail</label>
                      <input 
                        type="email" 
                        required 
                        value={webForm.email}
                        onChange={(e) => setWebForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="maria.pereira@email.com" 
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Telemóvel / Telefone</label>
                      <input 
                        type="tel" 
                        value={webForm.phone}
                        onChange={(e) => setWebForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Ex: +351 912 345 678" 
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Motivo ou Especialidade Pretendida</label>
                      <select 
                        value={webForm.type}
                        onChange={(e) => setWebForm(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-[#faf9f6]/95 border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none"
                      >
                        <option value="Trauma EMDR">Sessão de EMDR (Trauma, Crise, Luto)</option>
                        <option value="Consulta Psicoterapia">Psicoterapia Sistémica Integrada</option>
                        <option value="Avaliação Inicial">Primeira Consulta de Avaliação Clínica</option>
                        <option value="Consulta Urgente">Consulta em Crise Aguda / Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Data Desejada</label>
                      <input 
                        type="date" 
                        required 
                        value={webForm.date}
                        onChange={(e) => setWebForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-[#faf9f6] border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Hora Desejada</label>
                      <select 
                        value={webForm.time}
                        onChange={(e) => setWebForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-[#faf9f6]/95 border border-[#e6e2d7] px-4 py-2.5 rounded-xl focus:outline-none"
                      >
                        {["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"].map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] uppercase font-bold text-[#4a504b]">Formato da Sessão</label>
                      <div className="flex bg-[#faf9f6] border border-[#e6e2d7] rounded-xl p-1">
                        {(['online', 'presencial'] as const).map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setWebForm(prev => ({ ...prev, modality: m }))}
                            className={`flex-1 py-1 px-1.5 text-[9px] uppercase font-bold rounded-lg transition-all ${
                              webForm.modality === m ? 'bg-[#4f6054] text-white shadow-2xs' : 'text-[#4a504b] hover:text-[#191c1d]'
                            }`}
                          >
                            {m === 'online' ? 'Online' : 'Gabinete'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#4a504b]">Mensagem Adicional (Opcional)</label>
                    <textarea 
                      rows={2} 
                      value={webForm.message}
                      onChange={(e) => setWebForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Escreva brevemente o que o motiva a procurar apoio..." 
                      className="w-full bg-[#faf9f6] border border-[#e6e2d7] p-4 rounded-xl focus:outline-none resize-none" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#4f6054] hover:bg-[#232d26] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-md mt-2"
                  >
                    Solicitar Agendamento Clínico
                  </button>
                </form>
              )}
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
