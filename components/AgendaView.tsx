'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus, Users, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Appointment, Patient } from '../lib/mock-data';

interface AgendaViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onCancelAppointment: (id: string) => void;
  onConfirmAppointment: (id: string) => void;
}

const HOURS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"];
const DAYS = [
  { label: "Segunda", date: "25 Mai", full: "2026-05-25" },
  { label: "Terça", date: "26 Mai", full: "2026-05-26" },
  { label: "Quarta", date: "27 Mai", full: "2026-05-27" },
  { label: "Quinta", date: "28 Mai", full: "2026-05-28" },
  { label: "Sexta", date: "29 Mai", full: "2026-05-29" }
];

export default function AgendaView({ appointments, patients, onAddAppointment, onCancelAppointment, onConfirmAppointment }: AgendaViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState("2026-05-26"); // Terça by default
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  
  // New Booking state
  const [bookingForm, setBookingForm] = useState({
    patientId: patients[0]?.id || '',
    date: '2026-05-26',
    time: '14:00',
    type: 'Trauma EMDR' as any,
    modality: 'online' as 'online' | 'presencial',
    price: 85
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === bookingForm.patientId) || patients[0];
    if (!pat) return;

    onAddAppointment({
      patientId: pat.id,
      patientName: pat.name,
      date: bookingForm.date,
      time: bookingForm.time,
      type: bookingForm.type,
      status: 'Confirmada',
      modality: bookingForm.modality,
      duration: '60 min',
      price: bookingForm.price
    });
    setIsNewBookingOpen(false);
  };

  const getEventClass = (type: Appointment['type'], status: Appointment['status']) => {
    if (status === 'Pendente') {
      return 'bg-amber-50/90 border-l-[3.5px] border-amber-400 text-amber-950 border-dashed border-r border-t border-b border-amber-200';
    }
    switch (type) {
      case 'Trauma EMDR': return 'bg-[#4f6054]/10 border-l-[3.5px] border-[#4f6054] text-[#191c1d]';
      case 'Consulta Psicoterapia': return 'bg-[#605e56]/10 border-l-[3.5px] border-[#605e56] text-[#191c1d]';
      case 'Avaliação Inicial': return 'bg-[#e6e2d7]/50 border-l-[3.5px] border-amber-600 text-[#191c1d]';
      case 'Consulta Urgente': return 'bg-rose-50 border-l-[3.5px] border-rose-500 text-rose-800';
    }
  };

  // Find appointment by day and hour
  const findAppointment = (dateString: string, hourString: string) => {
    return appointments.find(app => app.date === dateString && app.time === hourString);
  };

  return (
    <div className="flex flex-col gap-6 text-left h-full">
      {/* HEADER SECTION PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d7]/50 shadow-xs">
        <div>
          <span className="text-[#4f6054] text-xs font-semibold uppercase tracking-widest block mb-1">Planeamento Clínico</span>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-[#191c1d]">Agenda de Consultas</h1>
        </div>

        {/* CONTROLLER ROW */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-[#faf9f6] p-1 border border-[#e6e2d7] rounded-full">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  viewMode === mode 
                    ? 'bg-[#4f6054] text-white shadow-2xs' 
                    : 'text-[#4a504b] hover:text-[#191c1d]'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewBookingOpen(true)}
            className="flex items-center gap-1.5 bg-[#4f6054] hover:bg-[#232d26] text-white text-xs md:text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full shadow-md transition-all"
          >
            <Plus size={15} />
            <span>Reservar Horário</span>
          </button>
        </div>
      </div>

      {/* RE-CALIBRATED NAVIGATION HEADER */}
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-3xl border border-[#e6e2d7]/40 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-[#faf9f6] border border-[#e6e2d7]/80 rounded-full p-1">
            <button className="p-1.5 hover:bg-[#e6e2d7]/30 text-[#4a504b] rounded-full transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 hover:bg-[#e6e2d7]/30 text-[#4a504b] rounded-full transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="font-serif text-lg text-[#191c1d]">25 - 29 de Maio, 2026</span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#4a504b]/90">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#4f6054]" /> Trauma EMDR</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#605e56]" /> Psicoterapia</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Consulta Urgente</span>
        </div>
      </div>

      {/* WEEK CALENDAR GRID FOR WEEK MODE */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-[#e6e2d7]/50 shadow-xs overflow-hidden flex flex-col flex-1">
          {/* Header row: Days of the week */}
          <div className="grid grid-cols-12 border-b border-[#e6e2d7]/40 py-4 bg-[#faf9f6]/60 text-center font-sans">
            <div className="col-span-2 border-r border-[#e6e2d7]/20 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a504b]/70">Horários</span>
            </div>
            {DAYS.map((day, i) => (
              <div 
                key={i} 
                className={`col-span-2 flex flex-col items-center gap-0.5 ${
                  selectedDate === day.full ? 'text-[#4f6054]' : 'text-[#191c1d]'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a504b]/60">{day.label}</span>
                <span className="text-sm font-semibold">{day.date}</span>
                {selectedDate === day.full && (
                  <span className="w-1.5 h-1.5 bg-[#4f6054] rounded-full mt-1 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Grid schedule hours body */}
          <div className="flex-1 divide-y divide-[#e6e2d7]/20">
            {HOURS.map((hour, idx) => (
              <div key={idx} className="grid grid-cols-12 min-h-[96px] group hover:bg-[#faf9f6]/10 transition-colors">
                
                {/* Time Indicator column */}
                <div className="col-span-2 border-r border-[#e6e2d7]/20 py-4.5 flex flex-col items-center justify-center bg-[#faf9f6]/20 font-mono text-xs text-[#4a504b] font-medium leading-none">
                  <span>{hour}</span>
                  <span className="text-[8px] opacity-40 mt-1 uppercase font-semibold">60 MIN</span>
                </div>

                {/* Day Blocks */}
                {DAYS.map((day, dayIdx) => {
                  const event = findAppointment(day.full, hour);
                  return (
                    <div 
                      key={dayIdx} 
                      className="col-span-2 p-1.5 border-r border-[#e6e2d7]/10 flex items-stretch h-full overflow-hidden select-none"
                    >
                      {event ? (
                        <div className={`w-full p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${getEventClass(event.type, event.status)}`}>
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-[11px] font-bold leading-tight line-clamp-1">{event.patientName}</h4>
                              <span className="text-[8px] uppercase tracking-wider font-mono opacity-80 shrink-0">
                                {event.modality === 'online' ? "ON" : "PRES"}
                              </span>
                            </div>
                            <p className="text-[9px] opacity-75 font-medium line-clamp-1">
                              {event.status === 'Pendente' ? "⚠️ Pendente Website" : event.type}
                            </p>
                          </div>

                          {event.status === 'Pendente' ? (
                            <div className="flex gap-1.5 pt-1 mt-1 border-t border-amber-200">
                              <button 
                                onClick={() => onConfirmAppointment(event.id)}
                                className="text-[8px] bg-[#4f6054] text-white font-bold px-1.5 py-0.5 rounded transition-colors"
                              >
                                Aprovar
                              </button>
                              <button 
                                onClick={() => onCancelAppointment(event.id)}
                                className="text-[8px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded transition-colors border border-rose-200"
                              >
                                Recusar
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center shrink-0 pt-1 border-t border-[#191c1d]/5 mt-1.5">
                              <span className="text-[10px] font-bold">€{event.price}</span>
                              <button 
                                onClick={() => onCancelAppointment(event.id)}
                                className="text-[9px] text-red-700 font-semibold hover:underline bg-white/20 px-1.5 py-0.5 rounded"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setBookingForm(prev => ({ ...prev, date: day.full, time: hour }));
                            setIsNewBookingOpen(true);
                          }}
                          className="w-full h-full rounded-2xl border border-dashed border-[#e6e2d7] hover:border-[#4f6054]/40 hover:bg-[#d4e7d8]/10 transition-all flex items-center justify-center group/btn cursor-pointer py-4"
                        >
                          <Plus size={13} className="text-[#a4ada6] group-hover/btn:text-[#4f6054] transition-colors" />
                        </button>
                      )}
                    </div>
                  );
                })}

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SINGLE DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-3xl border border-[#e6e2d7]/50 shadow-xs p-6">
          <div className="text-center mb-6">
            <span className="text-xs text-[#4a504b] font-medium block">Visualização Individual do Consultório</span>
            <h2 className="font-serif text-xl font-light text-[#191c1d] mt-1">Quarta-feira, 27 de Maio de 2026</h2>
          </div>

          <div className="space-y-4">
            {HOURS.map((hour, idx) => {
              const event = findAppointment("2026-05-27", hour);
              return (
                <div key={idx} className="flex gap-4 items-center">
                  <span className="font-mono text-xs text-[#4a504b] w-14 shrink-0">{hour}</span>
                  {event ? (
                    <div className={`flex-1 p-4 rounded-2xl border flex items-center justify-between text-left ${getEventClass(event.type, event.status)}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#4f6054]/20 flex items-center justify-center text-[#4f6054]">
                          <Users size={16} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs py-0.5 text-[#191c1d]">{event.patientName}</h4>
                          <span className="text-[10px] text-[#4a504b]/90">
                            {event.status === 'Pendente' ? "⚠️ Pendente do Website" : event.type} • {event.duration} • €{event.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {event.status === 'Pendente' ? (
                          <>
                            <button 
                              onClick={() => onConfirmAppointment(event.id)}
                              className="text-[10px] bg-[#4f6054] hover:bg-[#232d26] text-white font-bold px-3 py-1.5 rounded-full transition-colors"
                            >
                              Confirmar Pedido
                            </button>
                            <button 
                              onClick={() => onCancelAppointment(event.id)}
                              className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-3 py-1.5 rounded-full transition-colors"
                            >
                              Recusar
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full uppercase font-mono tracking-wider font-semibold">
                              Confirmada
                            </span>
                            <button 
                              onClick={() => onCancelAppointment(event.id)}
                              className="text-[10px] text-red-700 font-semibold hover:underline"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setBookingForm(prev => ({ ...prev, date: "2026-05-27", time: hour }));
                        setIsNewBookingOpen(true);
                      }}
                      className="flex-1 py-4 px-4 rounded-2xl border border-dashed border-[#e6e2d7] hover:border-[#4f6054]/30 text-xs text-[#4a504b]/70 hover:text-[#4f6054] text-left transition-all"
                    >
                      + Reservar horário em consultório das {hour}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTH VIEW STATIC COMPLIANT GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-[#e6e2d7]/50 shadow-xs p-6 text-center">
          <div className="grid grid-cols-7 gap-2.5">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((m, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-[#4a504b]/60 mb-2">{m}</span>
            ))}
            {/* Mock Month layout days */}
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const hasAppts = dayNum === 26 || dayNum === 27 || dayNum === 28;
              return (
                <div 
                  key={i} 
                  className={`aspect-square border border-[#e6e2d7]/30 rounded-xl p-2 text-left flex flex-col justify-between hover:bg-[#faf9f6] transition-colors ${
                    hasAppts ? 'bg-[#4f6054]/5 border-[#4f6054]/20' : ''
                  }`}
                >
                  <span className="text-xs font-semibold font-mono text-[#4a504b]">{dayNum}</span>
                  {hasAppts && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f6054] self-end animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW APPOINTMENT BOOKING MODAL */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={() => setIsNewBookingOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border border-[#e6e2d7] shadow-2xl p-6 sm:p-8 w-full max-w-[480px] z-10 text-left"
          >
            <h3 className="font-serif text-xl text-[#191c1d] mb-4">Agendar Nova Consulta</h3>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Paciente</label>
                <select
                  value={bookingForm.patientId}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date & Hour row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Data</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Horário</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    {HOURS.map((h, idx) => (
                      <option key={idx} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specialty and Modality */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Especialidade</label>
                  <select
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="Trauma EMDR">Trauma EMDR</option>
                    <option value="Consulta Psicoterapia">Consulta Psicoterapia</option>
                    <option value="Avaliação Inicial">Avaliação Inicial</option>
                    <option value="Consulta Urgente">Consulta Urgente</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Formato</label>
                  <div className="flex bg-[#faf9f6] border border-[#e6e2d7] rounded-xl p-1">
                    {(['online', 'presencial'] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setBookingForm(prev => ({ ...prev, modality: m }))}
                        className={`flex-1 py-1 text-[10px] uppercase font-semibold tracking-wider rounded-lg transition-all ${
                          bookingForm.modality === m ? 'bg-white shadow-2xs text-[#191c1d]' : 'text-[#4a504b]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4a504b] uppercase tracking-wider block">Valor Honorário (€ EUR)</label>
                <input
                  type="number"
                  value={bookingForm.price}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, price: parseInt(e.target.value) || 85 }))}
                  className="w-full bg-[#faf9f6] border border-[#e6e2d7] rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="flex-1 py-3 text-xs font-semibold hover:bg-[#faf9f6] border border-[#e6e2d7] rounded-full text-[#4a504b] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold bg-[#4f6054] hover:bg-[#232d26] rounded-full text-white transition-all shadow-md"
                >
                  Agendar Sessão
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
