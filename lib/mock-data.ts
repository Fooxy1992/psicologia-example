// Premium mock database structure for Dra. Carolina Amores Portal

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  age: number;
  treatment: 'Terapia EMDR' | 'Psicoterapia Integrativa' | 'Gestão de Crise' | 'Apoio em Luto';
  status: 'Estável' | 'Em Processamento' | 'Fase Crítica' | 'Alta Recente';
  lastSession: string;
  nextSession: string;
  clinicalHistory: string;
  traumaScoreHistory: number[]; // Scores out of 10 representing clinical evolution
  sessionsCompleted: number;
  unpaidFees: number;
  totalPaid: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'Trauma EMDR' | 'Consulta Psicoterapia' | 'Avaliação Inicial' | 'Consulta Urgente';
  status: 'Confirmada' | 'Pendente' | 'Cancelada' | 'Concluída';
  modality: 'online' | 'presencial';
  duration: string;
  price: number;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  date: string;
  symptoms: string[];
  emotions: string[];
  cognitiveInterweave: string;
  sudScore: number; // Subjective Units of Distress (1-10)
  vocScore: number; // Validity of Cognition (1-7)
  content: string;
}

export interface PaymentInvoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  category: 'Consulta EMDR' | 'Psicoterapia Geral' | 'Relatório Clínico';
}

export interface Message {
  id: string;
  patientId: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  read: boolean;
}

// Initial clinical dataset
export const initialPatients: Patient[] = [
  {
    id: "pat_1",
    name: "Clara Neves de Sousa",
    email: "clara.sousa@email.pt",
    phone: "+351 912 345 678",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    age: 34,
    treatment: "Terapia EMDR",
    status: "Em Processamento",
    lastSession: "2026-05-20",
    nextSession: "2026-05-27",
    clinicalHistory: "Paciente apresenta sintomas clássicos de Perturbação de Stresse Pós-Traumático (PSPT) decorrente de acidente de viação ocorrido há 14 meses. Relata insónias frequentes, pesadelos recorrentes e hipervigilância persistente ao conduzir.",
    traumaScoreHistory: [8, 8, 7, 5, 4, 3], // SUD values across sessions
    sessionsCompleted: 6,
    unpaidFees: 0,
    totalPaid: 510,
  },
  {
    id: "pat_2",
    name: "Afonso Mateus Ferreira",
    email: "afonso.mateus@gmail.com",
    phone: "+351 934 567 890",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    age: 29,
    treatment: "Psicoterapia Integrativa",
    status: "Estável",
    lastSession: "2026-05-18",
    nextSession: "2026-05-25",
    clinicalHistory: "Queixas de burnout severo associado a ambiente corporativo desgastante. Ansiedade generalizada, autocrítica exacerbada e dificuldades profundas em estabelecer limites saudáveis.",
    traumaScoreHistory: [6, 5, 5, 4, 3, 3],
    sessionsCompleted: 8,
    unpaidFees: 85,
    totalPaid: 680,
  },
  {
    id: "pat_3",
    name: "Beatriz Rodrigues Guedes",
    email: "beatriz.guedes@icloud.com",
    phone: "+351 925 890 123",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
    age: 41,
    treatment: "Terapia EMDR",
    status: "Fase Crítica",
    lastSession: "2026-05-22",
    nextSession: "2026-05-26",
    clinicalHistory: "Bloqueio emocional e luto patológico não processado decorrente da perda súbita do progenitor. Apresenta elevados níveis de negação, ataques de agorafobia ligeira e somatização gástrica.",
    traumaScoreHistory: [9, 9, 8],
    sessionsCompleted: 3,
    unpaidFees: 0,
    totalPaid: 255,
  },
  {
    id: "pat_4",
    name: "Tiago Manuel Antunes",
    email: "tiago.antunes@outlook.pt",
    phone: "+351 961 123 456",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    age: 45,
    treatment: "Apoio em Luto",
    status: "Alta Recente",
    lastSession: "2026-05-12",
    nextSession: "Nenhuma agendada",
    clinicalHistory: "Processo terapêutico focado no divórcio recente e reestruturação de plano familiar autónomo. Mostrou excelente evolução e resposta no desenvolvimento de autoeficácia e regulação nervosa.",
    traumaScoreHistory: [7, 6, 4, 2, 1],
    sessionsCompleted: 10,
    unpaidFees: 0,
    totalPaid: 850,
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: "app_1",
    patientId: "pat_3",
    patientName: "Beatriz Rodrigues Guedes",
    date: "2026-05-26",
    time: "14:00",
    type: "Trauma EMDR",
    status: "Confirmada",
    modality: "presencial",
    duration: "60 min",
    price: 85,
  },
  {
    id: "app_2",
    patientId: "pat_2",
    patientName: "Afonso Mateus Ferreira",
    date: "2026-05-26",
    time: "16:30",
    type: "Consulta Psicoterapia",
    status: "Confirmada",
    modality: "online",
    duration: "50 min",
    price: 85,
  },
  {
    id: "app_3",
    patientId: "pat_1",
    patientName: "Clara Neves de Sousa",
    date: "2026-05-27",
    time: "10:00",
    type: "Trauma EMDR",
    status: "Confirmada",
    modality: "online",
    duration: "60 min",
    price: 85,
  },
  {
    id: "app_4",
    patientId: "pat_4",
    patientName: "Tiago Manuel Antunes",
    date: "2026-05-28",
    time: "11:30",
    type: "Consulta Psicoterapia",
    status: "Pendente",
    modality: "presencial",
    duration: "50 min",
    price: 85,
  }
];

export const initialInvoices: PaymentInvoice[] = [
  {
    id: "ft_2026_01",
    patientName: "Clara Neves de Sousa",
    amount: 170,
    date: "2026-05-18",
    status: "Pago",
    category: "Consulta EMDR"
  },
  {
    id: "ft_2026_02",
    patientName: "Afonso Mateus Ferreira",
    amount: 85,
    date: "2026-05-18",
    status: "Pendente",
    category: "Psicoterapia Geral"
  },
  {
    id: "ft_2026_03",
    patientName: "Beatriz Rodrigues Guedes",
    amount: 85,
    date: "2026-05-22",
    status: "Pago",
    category: "Consulta EMDR"
  },
  {
    id: "ft_2026_04",
    patientName: "Tiago Manuel Antunes",
    amount: 170,
    date: "2026-05-12",
    status: "Pago",
    category: "Psicoterapia Geral"
  }
];

export const initialMessages: Message[] = [
  {
    id: "msg_1",
    patientId: "pat_1",
    sender: "patient",
    text: "Olá Dra. Carolina, o exercício do Recurso Seguro que instalámos na última sessão ajudou-me bastante durante uma crise que tive no trânsito ontem.",
    timestamp: "10:15",
    read: false,
  },
  {
    id: "msg_2",
    patientId: "pat_1",
    sender: "doctor",
    text: "Excelente notícia, Clara! Esse é precisamente o objetivo. Sempre que sentir essa ativação psicofisiológica, ative a âncora tátil lenta e estabilize.",
    timestamp: "10:30",
    read: true,
  },
  {
    id: "msg_3",
    patientId: "pat_2",
    sender: "patient",
    text: "Bom dia Dra., podíamos passar a nossa sessão de hoje para o formato online? Tive um contratempo de transporte e ficava-me mais fácil.",
    timestamp: "09:05",
    read: false,
  },
  {
    id: "msg_4",
    patientId: "pat_3",
    sender: "patient",
    text: "Estou a sentir-me bastante ansiosa hoje por conta do aniversário do meu pai. A sessão de amanhã mantém-se no mesmo horário?",
    timestamp: "Yesterday",
    read: true,
  }
];

export const clinicalTemplates = [
  {
    title: "Sessão EMDR - Protocolo Standard",
    text: "• Identificação do Alvo original: [Alvo]\n• Imagem representativa: [Imagem]\n• Crença Negativa (CN): [CN]\n• Crença Positiva (CP): [CP] (VOC: /7)\n• Emoção associada: [Emoção] (SUD: /10)\n• Sensações corporais: [Corpo]\n• Estimulação Bilateral: [Ciclos/Focos]\n• Reavaliação pós-estimulação: [Evolução]"
  },
  {
    title: "Sessão de Psicoterapia - Resumo Clínico",
    text: "• Estado de apresentação do paciente: [Estado]\n• Temas principais debatidos: [Temas]\n• Estratégias/Regulação explorada: [Estratégias]\n• TPC sugerido: [Plano]\n• Próximo foco clínico: [Foco]"
  },
  {
    title: "Protocolo de Instalação de Recurso Seguro",
    text: "• Lugar Seguro identificado: [Lugar]\n• Imagem e sensações agradáveis: [Descrição]\n• Palavra-chave (Âncora de activação): [Palavra]\n• Estimulação bilateral ultralenta (Instalação): [Instalado com sucesso/Pendências]"
  }
];

export const systemLogs = [
  { time: "Há 10 min", activity: "Dra. Carolina adicionou notas clínicas para Clara Neves" },
  { time: "Há 1 hora", activity: "Pagamento de faturador ref FT_2026_03 liquidado por Beatriz Guedes (€85)" },
  { time: "Há 2 horas", activity: "Beatriz Guedes confirmou a sessão das 14:00 por WhatsApp Link" },
  { time: "Há 1 dia", activity: "Modo de integração Google Meet foi atualizado" }
];
