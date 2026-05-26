'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Users, Calendar, TrendingUp, DollarSign, ArrowUpRight, 
  Clock, CheckCircle, Zap, Activity, MessageSquare, ArrowRight, Brain 
} from 'lucide-react';
import { Patient, Appointment, systemLogs } from '../lib/mock-data';

interface DashboardHomeProps {
  patients: Patient[];
  appointments: Appointment[];
  onNavigate: (tab: string) => void;
  onQuickBooking: () => void;
}

export default function DashboardHome({ patients, appointments, onNavigate, onQuickBooking }: DashboardHomeProps) {
  
  // Calculate stats
  const activeCount = patients.filter(p => p.status !== 'Alta Recente').length;
  const todayApps = appointments.filter(app => app.date === "2026-05-26");
  const totalRevenue = patients.reduce((acc, curr) => acc + curr.totalPaid, 0);

  return (
    <div className="flex flex-col gap-8 text-left h-full">
      {/* WELCOME BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-xs">
        <div>
          <span className="text-[#4f6054] text-xs font-semibold uppercase tracking-widest block mb-1">Bem-vinda de volta</span>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-[#191c1d]">Portal Dra. Carolina Amores</h1>
        </div>

        <button
          onClick={onQuickBooking}
          className="flex items-center gap-2 bg-[#4f6054] hover:bg-[#232d26] text-white text-xs md:text-sm font-semibold tracking-wide px-5 py-3 rounded-full transition-all duration-400 shadow-md"
        >
          <Plus size={16} />
          <span>Agendar Sessão</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 - Consultas Hoje */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-2xs relative overflow-hidden group hover:border-[#4f6054]/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[#4a504b] text-[10px] font-bold uppercase tracking-wider block">Sessões Hoje</span>
              <h2 className="text-3xl font-serif font-light text-[#191c1d]">{todayApps.length} Consultas</h2>
            </div>
            <div className="p-3 bg-[#4f6054]/10 text-[#4f6054] rounded-2xl group-hover:bg-[#4f6054] group-hover:text-white transition-all duration-300">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#4a504b]">
            <span className="font-semibold text-emerald-700">100%</span>
            <span>Taxa de ocupação clínica</span>
          </div>
        </div>

        {/* KPI 2 - Pacientes Ativos */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-2xs relative overflow-hidden group hover:border-[#4f6054]/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[#4a504b] text-[10px] font-bold uppercase tracking-wider block">Pacientes Ativos</span>
              <h2 className="text-3xl font-serif font-light text-[#191c1d]">{activeCount} Casos</h2>
            </div>
            <div className="p-3 bg-[#4f6054]/10 text-[#4f6054] rounded-2xl group-hover:bg-[#4f6054] group-hover:text-white transition-all duration-300">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#4a504b]">
            <span className="font-semibold text-emerald-700">+1 este mês</span>
            <span>Acompanhamento clínico regular</span>
          </div>
        </div>

        {/* KPI 3 - Comparecimento */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-2xs relative overflow-hidden group hover:border-[#4f6054]/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[#4a504b] text-[10px] font-bold uppercase tracking-wider block">Assiduidade</span>
              <h2 className="text-3xl font-serif font-light text-[#191c1d]">98.2%</h2>
            </div>
            <div className="p-3 bg-[#4f6054]/10 text-[#4f6054] rounded-2xl group-hover:bg-[#4f6054] group-hover:text-white transition-all duration-300">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#4a504b]">
            <span className="font-semibold text-[#4f6054]">&#8594; Acima do esperado</span>
            <span>Mínimo de desmarcações</span>
          </div>
        </div>

        {/* KPI 4 - Faturação */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-2xs relative overflow-hidden group hover:border-[#4f6054]/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[#4a504b] text-[10px] font-bold uppercase tracking-wider block">Faturação Acumulada</span>
              <h2 className="text-3xl font-serif font-light text-[#191c1d]">€{totalRevenue}</h2>
            </div>
            <div className="p-3 bg-[#4f6054]/10 text-[#4f6054] rounded-2xl group-hover:bg-[#4f6054] group-hover:text-white transition-all duration-300">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#4a504b]">
            <span className="font-semibold text-emerald-700">100% cobrado</span>
            <span>Isento de taxas vencidas</span>
          </div>
        </div>

      </div>

      {/* DETAILED DOUBLE GRID FOR INTERACTIVE SCHEDULE & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TODAY SCHEDULE TIMELINE (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e6e2d7]/50 p-6 shadow-xs flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#e6e2d7]/30 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#4f6054]" />
              <h3 className="font-serif text-lg font-medium text-[#191c1d]">Fila de Consultas de Hoje</h3>
            </div>
            <span className="text-[10px] font-bold text-[#4f6054] bg-[#d4e7d8] px-3 py-1 rounded-full uppercase tracking-wider">
              {todayApps.length} Atendimentos
            </span>
          </div>

          <div className="space-y-4">
            {todayApps.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#4a504b]/60 italic font-medium">
                Sem consultas programadas para a data de hoje.
              </div>
            ) : (
              todayApps.map((appt, i) => (
                <div 
                  key={appt.id}
                  className="p-4 rounded-2xl border border-[#e6e2d7]/60 hover:border-[#4f6054]/30 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Visual status index dot */}
                    <span className="relative flex h-3.5 w-3.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>

                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#4f6054]">{appt.time}</span>
                        <h4 className="text-xs font-bold text-[#191c1d] leading-none">{appt.patientName}</h4>
                      </div>
                      <p className="text-[10px] text-[#4a504b]/80 font-medium">Método: {appt.type} • {appt.duration} • {appt.modality === 'online' ? 'Online Link' : 'Presencial'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end sm:justify-start">
                    <span className="text-xs font-bold text-[#191c1d] bg-[#faf9f6] border border-[#e6e2d7] px-3.5 py-1.5 rounded-full shrink-0">
                      €85 cobrado
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => onNavigate('agenda')}
            className="text-xs font-bold text-[#4f6054] hover:text-[#232d26] inline-flex items-center gap-1.5 self-start group cursor-pointer mt-1"
          >
            <span>Ver calendário clínico completo</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* RECENT FEED & ACTIVITY COMPONENT (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e6e2d7]/50 p-6 shadow-xs flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#e6e2d7]/30 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#4f6054]" />
              <h3 className="font-serif text-lg font-medium text-[#191c1d]">Registo de Logs Clínicos</h3>
            </div>
          </div>

          {/* Activity items */}
          <div className="space-y-4">
            {systemLogs.map((log, i) => (
              <div key={i} className="flex gap-4 items-start text-xs border-b border-[#e6e2d7]/10 pb-3 hover:bg-[#faf9f6]/30 px-1 rounded-lg transition-colors">
                <span className="font-mono text-[9px] text-[#4a504b] font-bold tracking-tight bg-[#faf9f6] px-2.5 py-1 rounded-sm shrink-0 border border-[#e6e2d7]/50">
                  {log.time}
                </span>
                <p className="text-[#191c1d]/90 font-medium leading-relaxed">{log.activity}</p>
              </div>
            ))}
          </div>

          {/* Quick Support Guidance Tip cards */}
          <div className="bg-[#4f6054]/10 border border-[#4f6054]/10 p-5 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-xl text-[#4f6054] shrink-0 shadow-3xs">
              <Zap size={16} />
            </div>
            <div className="text-left space-y-1">
              <h4 className="text-xs font-bold text-[#191c1d]">Gestão de Prontuários</h4>
              <p className="text-[11px] text-[#4a504b]/95 leading-relaxed">
                Mantenha as notas de progresso clínico e o histórico das sessões dos utentes sempre atualizados na vista de <strong>Pacientes</strong> para um acompanhamento contínuo e eficaz.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
