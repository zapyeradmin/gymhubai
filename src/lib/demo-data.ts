import { addDays, subDays, format, startOfMonth } from "date-fns";

const NOMES = [
  "Ana Silva","Bruno Costa","Carla Mendes","Diego Souza","Eduarda Lima","Felipe Rocha",
  "Gabriela Alves","Henrique Dias","Isabela Martins","João Pedro","Karen Ribeiro","Lucas Oliveira",
  "Mariana Castro","Nicolas Fernandes","Olivia Barbosa","Paulo Henrique","Queila Nunes","Rafael Pinto",
  "Sabrina Moreira","Thiago Carvalho","Ursula Gomes","Vinicius Araujo","Wanessa Lopes","Xavier Pereira",
  "Yasmin Cardoso","Zeca Andrade","Amanda Reis","Bernardo Melo","Cintia Vieira","Daniel Teixeira",
  "Elaine Souza","Fabio Nogueira","Giovana Ramos","Hugo Almeida","Iara Pacheco","Julio Tavares",
  "Kelly Maciel","Leonardo Sa","Monica Brito","Natalia Freitas","Otavio Lacerda","Patricia Coelho",
  "Quintino Brandao","Renata Sales","Sergio Bittencourt","Tatiane Goncalves","Ulisses Marinho","Viviane Cordeiro",
  "Wagner Esteves","Xenia Borges","Yuri Mascarenhas","Zilda Peixoto",
];

const MODALIDADES = ["Musculacao","Funcional","Pilates","Yoga","Crossfit","Spinning","Body Pump","Zumba"] as const;
const GOALS = ["Perder peso","Hipertrofia","Saude","Condicionamento","Reabilitacao"] as const;
const MEDICAL = [null, "Asma controlada", "Hipertensao", "Lesao joelho - cuidado agachamento", "Diabetes tipo 2", "Bursite ombro direito"];
const GENDERS = ["masculino","feminino","outro"] as const;

export const demoAcademy = {
  id: "demo-academy",
  name: "FitZone Performance",
  slug: "fitzone",
  cnpj: "12.345.678/0001-90",
  email: "contato@fitzoneperformance.com.br",
  telefone: "(11) 3030-4040",
  endereco: { rua: "Av. Paulista, 1000", bairro: "Bela Vista", cidade: "Sao Paulo", uf: "SP", cep: "01310-100" },
  cor_primaria: "#F97316",
  plano: "pro",
  status: "ativa",
  capacity_per_class: 30,
  business_hours: { mon_fri: "06:00-23:00", sat: "08:00-18:00", sun: "08:00-14:00" },
  valor_mensal: 397,
};

export const demoAcademyUsers = [
  { id: "u1", email: "owner@excellence.com",  nome: "Roberto Excellence", role: "owner",     ativo: true },
  { id: "u2", email: "admin@excellence.com",  nome: "Lucas Admin",         role: "admin",     ativo: true },
  { id: "u3", email: "carlos@excellence.com", nome: "Carlos Educador",     role: "professor", ativo: true },
  { id: "u4", email: "patricia@excellence.com", nome: "Patricia Personal", role: "professor", ativo: true },
  { id: "u5", email: "joao@excellence.com",   nome: "Joao Recepcao",       role: "recepcao",  ativo: true },
  { id: "u6", email: "marcia@excellence.com", nome: "Marcia Financeiro",   role: "admin",     ativo: true },
];

export const demoTeam = [
  { id: "t1", name: "Carlos Educador Fisico", email: "carlos@excellence.com", role: "professor", specialty: "Musculacao", students_count: 42, classes_load: 18, commission_pct: 15, active: true },
  { id: "t2", name: "Patricia Personal",      email: "patricia@excellence.com", role: "professor", specialty: "Funcional/Crossfit", students_count: 28, classes_load: 22, commission_pct: 20, active: true },
  { id: "t3", name: "Joao Recepcao",          email: "joao@excellence.com",     role: "recepcao",  specialty: "Atendimento", students_count: 0, classes_load: 0, commission_pct: 0, active: true },
  { id: "t4", name: "Marcia Financeiro",      email: "marcia@excellence.com",   role: "admin",     specialty: "Gestao",     students_count: 0, classes_load: 0, commission_pct: 0, active: true },
  { id: "t5", name: "Lucas Admin",            email: "lucas@excellence.com",    role: "admin",     specialty: "Operacao",   students_count: 0, classes_load: 0, commission_pct: 0, active: true },
];

export const demoPlans = [
  { id: "p1", name: "Mensal",              price: 129,  duration_months: 1,  economia_pct: 0,  total_checkins: null, included_classes: ["Musculacao"], featured: false, active: true, description: "Acesso musculacao livre, horario comercial." },
  { id: "p2", name: "Trimestral",          price: 349,  duration_months: 3,  economia_pct: 10, total_checkins: null, included_classes: ["Musculacao","Funcional"], featured: false, active: true, description: "10% economia. Inclui aulas funcional." },
  { id: "p3", name: "Semestral",           price: 650,  duration_months: 6,  economia_pct: 15, total_checkins: null, included_classes: ["Musculacao","Funcional","Pilates"], featured: false, active: true, description: "15% economia. Inclui Pilates." },
  { id: "p4", name: "Anual",               price: 1199, duration_months: 12, economia_pct: 25, total_checkins: null, included_classes: ["Musculacao","Funcional","Pilates","Yoga"], featured: true, active: true, description: "25% economia. Acesso completo." },
  { id: "p5", name: "Premium Ilimitado",   price: 199,  duration_months: 1,  economia_pct: 0,  total_checkins: null, included_classes: ["Todas"], featured: true, active: true, description: "Todas modalidades, ilimitado." },
  { id: "p6", name: "Funcional 12x",       price: 249,  duration_months: 1,  economia_pct: 0,  total_checkins: 12,   included_classes: ["Funcional"], featured: false, active: true, description: "12 aulas funcional/mes." },
];

export const demoStudents = NOMES.map((nome, i) => {
  const plan = demoPlans[i % demoPlans.length];
  const planStart = subDays(new Date(), 30 + (i % 200));
  const planEnd = addDays(planStart, plan.duration_months * 30);
  const today = new Date();
  const overdue = planEnd < today;
  return {
    id: `a${i+1}`,
    name: nome,
    email: nome.toLowerCase().replace(/ /g, ".").replace(/[^a-z.]/g,"") + "@email.com",
    cpf: `${String(100+i).padStart(3,"0")}.${String(200+i).padStart(3,"0")}.${String(300+i).padStart(3,"0")}-${String((i*7)%100).padStart(2,"0")}`,
    phone: `(11) 9${String(40000000 + i * 137).slice(0,8)}`,
    birth_date: format(subDays(new Date(), 365 * (18 + (i % 45)) + (i * 13)), "yyyy-MM-dd"),
    gender: GENDERS[i % 3],
    photo_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    plan_id: plan.id,
    plan_name: plan.name,
    plan_start: format(planStart, "yyyy-MM-dd"),
    plan_end: format(planEnd, "yyyy-MM-dd"),
    payment_status: overdue ? "atrasado" : (i % 9 === 0 ? "atrasado" : "em_dia"),
    status: i % 13 === 0 ? "blocked" : (i % 11 === 0 ? "trial" : "active"),
    emergency_contact: `(11) 9${String(30000000 + i * 211).slice(0,8)} - Familiar`,
    medical_notes: MEDICAL[i % MEDICAL.length],
    goals: GOALS[i % GOALS.length],
    created_at: format(subDays(new Date(), i * 5), "yyyy-MM-dd"),
  };
});

// 25+ aulas semana
export const demoSchedule = [
  // Segunda (1)
  { id:"s1",  name:"Musculacao Livre",  modality:"Musculacao", day_of_week:1, start_time:"06:00", end_time:"22:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:60 },
  { id:"s2",  name:"Funcional Manha",   modality:"Funcional",  day_of_week:1, start_time:"07:00", end_time:"08:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
  { id:"s3",  name:"Pilates",           modality:"Pilates",    day_of_week:1, start_time:"09:00", end_time:"10:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:12 },
  { id:"s4",  name:"Crossfit",          modality:"Crossfit",   day_of_week:1, start_time:"18:30", end_time:"19:30", instructor_id:"t2", instructor_name:"Patricia", max_capacity:18 },
  { id:"s5",  name:"Spinning",          modality:"Spinning",   day_of_week:1, start_time:"19:00", end_time:"20:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:25 },
  // Terca (2)
  { id:"s6",  name:"Musculacao Livre",  modality:"Musculacao", day_of_week:2, start_time:"06:00", end_time:"22:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:60 },
  { id:"s7",  name:"Yoga Manha",        modality:"Yoga",       day_of_week:2, start_time:"08:00", end_time:"09:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:15 },
  { id:"s8",  name:"Funcional",         modality:"Funcional",  day_of_week:2, start_time:"12:00", end_time:"13:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
  { id:"s9",  name:"Body Pump",         modality:"Body Pump",  day_of_week:2, start_time:"18:00", end_time:"19:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:25 },
  { id:"s10", name:"Crossfit",          modality:"Crossfit",   day_of_week:2, start_time:"19:30", end_time:"20:30", instructor_id:"t2", instructor_name:"Patricia", max_capacity:18 },
  // Quarta (3)
  { id:"s11", name:"Musculacao Livre",  modality:"Musculacao", day_of_week:3, start_time:"06:00", end_time:"22:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:60 },
  { id:"s12", name:"Crossfit Manha",    modality:"Crossfit",   day_of_week:3, start_time:"06:30", end_time:"07:30", instructor_id:"t2", instructor_name:"Patricia", max_capacity:18 },
  { id:"s13", name:"Pilates",           modality:"Pilates",    day_of_week:3, start_time:"15:00", end_time:"16:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:12 },
  { id:"s14", name:"Funcional",         modality:"Funcional",  day_of_week:3, start_time:"18:00", end_time:"19:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
  { id:"s15", name:"Zumba",             modality:"Zumba",      day_of_week:3, start_time:"20:00", end_time:"21:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:30 },
  // Quinta (4)
  { id:"s16", name:"Musculacao Livre",  modality:"Musculacao", day_of_week:4, start_time:"06:00", end_time:"22:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:60 },
  { id:"s17", name:"Yoga",              modality:"Yoga",       day_of_week:4, start_time:"19:00", end_time:"20:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:15 },
  { id:"s18", name:"Spinning",          modality:"Spinning",   day_of_week:4, start_time:"17:00", end_time:"18:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:25 },
  { id:"s19", name:"Funcional",         modality:"Funcional",  day_of_week:4, start_time:"19:00", end_time:"20:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
  // Sexta (5)
  { id:"s20", name:"Musculacao Livre",  modality:"Musculacao", day_of_week:5, start_time:"06:00", end_time:"22:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:60 },
  { id:"s21", name:"Funcional",         modality:"Funcional",  day_of_week:5, start_time:"07:00", end_time:"08:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
  { id:"s22", name:"Crossfit",          modality:"Crossfit",   day_of_week:5, start_time:"12:30", end_time:"13:30", instructor_id:"t2", instructor_name:"Patricia", max_capacity:18 },
  { id:"s23", name:"Pilates",           modality:"Pilates",    day_of_week:5, start_time:"18:00", end_time:"19:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:12 },
  // Sabado (6)
  { id:"s24", name:"Musculacao Livre",  modality:"Musculacao", day_of_week:6, start_time:"08:00", end_time:"18:00", instructor_id:"t1", instructor_name:"Carlos", max_capacity:40 },
  { id:"s25", name:"Crossfit",          modality:"Crossfit",   day_of_week:6, start_time:"09:00", end_time:"10:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:18 },
  { id:"s26", name:"Funcional",         modality:"Funcional",  day_of_week:6, start_time:"10:00", end_time:"11:00", instructor_id:"t2", instructor_name:"Patricia", max_capacity:20 },
];

const SOURCES = ["catraca","manual","app"] as const;
export const demoCheckins = Array.from({ length: 130 }, (_, i) => {
  const aluno = demoStudents[i % demoStudents.length];
  const d = subDays(new Date(), Math.floor(i / 5));
  const hour = 6 + (i % 16);
  return {
    id: `c${i+1}`,
    student_id: aluno.id,
    student_name: aluno.name,
    date: format(d, "yyyy-MM-dd"),
    time: `${String(hour).padStart(2,"0")}:${String((i*11)%60).padStart(2,"0")}`,
    modality: MODALIDADES[i % MODALIDADES.length],
    source: SOURCES[i % 3],
  };
});

const RECEITA_CATS = ["Mensalidade","Matricula","Avaliacao fisica","Produtos"];
const DESPESA_CATS = ["Aluguel","Energia","Agua","Salarios","Marketing","Manutencao","Limpeza"];
export const demoFinancial = [
  // Despesas fixas do mes
  { id:"f-d1", type:"despesa", category:"Aluguel",  description:"Aluguel imovel",      amount:8000, date: format(startOfMonth(new Date()), "yyyy-MM-dd"), status:"pago",      student_name: null },
  { id:"f-d2", type:"despesa", category:"Energia",  description:"Enel mes",            amount:1500, date: format(addDays(startOfMonth(new Date()), 5), "yyyy-MM-dd"), status:"pago", student_name: null },
  { id:"f-d3", type:"despesa", category:"Salarios", description:"Folha professores",   amount:9000, date: format(addDays(startOfMonth(new Date()), 4), "yyyy-MM-dd"), status:"pago", student_name: null },
  { id:"f-d4", type:"despesa", category:"Marketing",description:"Google Ads",          amount:800,  date: format(addDays(startOfMonth(new Date()), 10), "yyyy-MM-dd"), status:"pago", student_name: null },
  { id:"f-d5", type:"despesa", category:"Limpeza",  description:"Servico limpeza",     amount:1200, date: format(addDays(startOfMonth(new Date()), 12), "yyyy-MM-dd"), status:"pendente", student_name: null },
  // Receitas (mensalidades) - 60 entradas
  ...Array.from({ length: 60 }, (_, i) => {
    const aluno = demoStudents[i % demoStudents.length];
    const plan = demoPlans.find(p => p.id === aluno.plan_id)!;
    return {
      id: `f-r${i+1}`,
      type: "receita",
      category: RECEITA_CATS[i % RECEITA_CATS.length],
      description: `Mensalidade ${aluno.name}`,
      amount: plan.price,
      date: format(subDays(new Date(), i), "yyyy-MM-dd"),
      status: aluno.payment_status === "atrasado" ? "pendente" : "pago",
      student_name: aluno.name,
      student_id: aluno.id,
    };
  }),
];

export const demoDashboardStats = {
  alunos_ativos: demoStudents.filter(s => s.status === "active").length,
  alunos_trial: demoStudents.filter(s => s.status === "trial").length,
  alunos_atraso: demoStudents.filter(s => s.payment_status === "atrasado").length,
  checkins_hoje: demoCheckins.filter(c => c.date === format(new Date(), "yyyy-MM-dd")).length,
  checkins_semana: demoCheckins.filter(c => new Date(c.date) >= subDays(new Date(), 7)).length,
  checkins_mes: demoCheckins.filter(c => new Date(c.date) >= startOfMonth(new Date())).length,
  novos_cadastros_mes: demoStudents.filter(s => new Date(s.created_at) >= startOfMonth(new Date())).length,
  faturamento_mes: demoFinancial.filter(f => f.type === "receita" && f.status === "pago" && new Date(f.date) >= startOfMonth(new Date())).reduce((s,f) => s + f.amount, 0),
  faturamento_previsto: demoFinancial.filter(f => f.type === "receita" && new Date(f.date) >= startOfMonth(new Date())).reduce((s,f) => s + f.amount, 0),
  despesas_mes: demoFinancial.filter(f => f.type === "despesa" && new Date(f.date) >= startOfMonth(new Date())).reduce((s,f) => s + f.amount, 0),
  ticket_medio: 165,
  taxa_retencao: 87,
  taxa_ocupacao_aulas: 72,
};

export const demoAIOpportunities = [
  {
    id:"ai1", severity:"high", icon:"users",
    kind:"aluno_inativo",
    title:"5 alunos sem aparecer há +14 dias",
    description:"Risco de cancelamento alto. Disparar campanha de reativação por WhatsApp.",
    action:"Enviar WhatsApp",
    impact:"R$ 985/mês em risco",
    targets:[
      { name:"Beatriz Lima",   phone:"(11) 9 8000-1212", lastCheckin:"há 22 dias" },
      { name:"Wagner Esteves", phone:"(11) 9 8000-7733", lastCheckin:"há 18 dias" },
      { name:"Yasmin Cardoso", phone:"(11) 9 8000-4421", lastCheckin:"há 16 dias" },
    ],
    whatsappTemplate:
      "Oi {nome}! Sentimos sua falta na academia 💪 Faz {dias} que você não dá as caras. Bora marcar um treino essa semana? Posso te garantir um horário tranquilo, é só responder aqui!",
  },
  {
    id:"ai2", severity:"high", icon:"wallet",
    kind:"aluno_inadimplente",
    title:"8 alunos com mensalidade vencida +5 dias",
    description:"Total R$ 1.232 pendente. Cobrança automatizada por PIX recupera ~70%.",
    action:"Cobrar via WhatsApp",
    impact:"R$ 1.232 a recuperar",
    targets:[
      { name:"Lucas Oliveira", phone:"(11) 9 8000-3344", overdueDays:32, amount:149 },
      { name:"Henrique Dias",  phone:"(11) 9 8000-5566", overdueDays:14, amount:129 },
      { name:"Paulo Henrique", phone:"(11) 9 8000-7788", overdueDays:9,  amount:89  },
    ],
    whatsappTemplate:
      "Olá {nome}, tudo bem? Aqui é da {academia} 🧡 Sua mensalidade de R$ {valor} venceu há {dias} dias. Posso te enviar o PIX agora? Qualquer ajuste a gente combina!",
  },
  {
    id:"ai3", severity:"high", icon:"users",
    kind:"trial_perto_fim",
    title:"3 trials expiram em até 2 dias",
    description:"Momento ideal pra converter em mensalista. Oferta de matrícula grátis.",
    action:"Oferecer conversão",
    impact:"+R$ 387/mês recorrente",
    targets:[
      { name:"Maria Santos",  phone:"(11) 9 8000-1100", trialEnd:"amanhã" },
      { name:"Diego Souza",   phone:"(11) 9 8000-2200", trialEnd:"em 2 dias" },
      { name:"Olivia Barbosa",phone:"(11) 9 8000-3300", trialEnd:"hoje" },
    ],
    whatsappTemplate:
      "Oi {nome}! Seu período experimental termina {prazo}. Curtiu treinar com a gente? Vou liberar a matrícula GRATUITA se fechar até amanhã — qual plano combina mais com você?",
  },
  {
    id:"ai4", severity:"medium", icon:"calendar",
    kind:"aluno_baixa_frequencia",
    title:"12 alunos treinando menos de 4x/mês",
    description:"Frequência baixa = risco de cancelamento no próximo ciclo. Hora de engajar.",
    action:"Reengajar",
    impact:"Retenção +15%",
    targets:[
      { name:"Bruno Costa",    phone:"(11) 9 8000-4400", frequency:"3x este mês" },
      { name:"Karen Ribeiro",  phone:"(11) 9 8000-5500", frequency:"2x este mês" },
      { name:"Felipe Rocha",   phone:"(11) 9 8000-6600", frequency:"3x este mês" },
    ],
    whatsappTemplate:
      "{nome}, percebi que você treinou só {freq}. Vamos marcar um treino guiado essa semana? Posso te montar um plano de 30 min pra encaixar na rotina 🔥",
  },
  {
    id:"ai5", severity:"low", icon:"sparkles",
    kind:"aniversariante",
    title:"4 aniversariantes este mês",
    description:"Aniversário é gatilho emocional. Mensagem personalizada aumenta NPS.",
    action:"Parabenizar",
    impact:"NPS +12 pts",
    targets:[
      { name:"Ana Silva",      phone:"(11) 9 8000-1010", birthDate:"dia 12" },
      { name:"Carlos Mendes",  phone:"(11) 9 8000-2020", birthDate:"dia 18" },
      { name:"Renata Sales",   phone:"(11) 9 8000-3030", birthDate:"dia 24" },
    ],
    whatsappTemplate:
      "Parabéns, {nome}! 🎉 Toda equipe da {academia} te deseja um ano cheio de PRs, saúde e treinos firmes 💪 Passa aqui pra retirar seu mimo!",
  },
];

export const demoMasterAcademies = [
  { id:"ma1", name:"Gym Hub Excellence",   cidade:"Sao Paulo/SP",   plano:"profissional", status:"ativa", alunos:50, mrr:197,  ultimo_acesso:"hoje" },
  { id:"ma2", name:"Studio Fit Alphaville",cidade:"Barueri/SP",     plano:"profissional", status:"ativa", alunos:128,mrr:197,  ultimo_acesso:"ontem" },
  { id:"ma3", name:"Power House Gym",      cidade:"Rio de Janeiro/RJ", plano:"starter",   status:"ativa", alunos:42, mrr:49,   ultimo_acesso:"2d" },
  { id:"ma4", name:"Bem Estar Pilates",    cidade:"Curitiba/PR",    plano:"pro",          status:"trial", alunos:18, mrr:0,    ultimo_acesso:"hoje" },
  { id:"ma5", name:"Cross Arena BH",       cidade:"Belo Horizonte/MG", plano:"pro",       status:"ativa", alunos:87, mrr:97,   ultimo_acesso:"hoje" },
  { id:"ma6", name:"Yoga Zen Studio",      cidade:"Florianopolis/SC", plano:"starter",    status:"suspensa", alunos:0, mrr:0,  ultimo_acesso:"30d" },
  { id:"ma7", name:"Iron Box Crossfit",    cidade:"Porto Alegre/RS", plano:"profissional", status:"ativa", alunos:156, mrr:197, ultimo_acesso:"hoje" },
  { id:"ma8", name:"Movimento Funcional",  cidade:"Recife/PE",       plano:"pro",          status:"ativa", alunos:73,  mrr:97,  ultimo_acesso:"ontem" },
];

export function demoCheckinsByDay(days = 14) {
  return Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    const count = demoCheckins.filter((c) => c.date === key).length;
    return { date: format(d, "dd/MM"), count };
  });
}

export function demoCheckinsByHour() {
  const hours: Record<number, number> = {};
  for (let h = 6; h <= 22; h++) hours[h] = 0;
  demoCheckins.forEach(c => {
    const h = parseInt(c.time.slice(0,2));
    if (hours[h] !== undefined) hours[h]++;
  });
  return Object.entries(hours).map(([h, count]) => ({ hour: `${h}h`, count }));
}

export function demoAlunosByPlan() {
  return demoPlans.map(p => ({ plan: p.name, count: demoStudents.filter(s => s.plan_id === p.id).length }));
}

export function demoAlunosEvolution12m() {
  return Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i;
    const d = new Date(); d.setMonth(d.getMonth() - monthsAgo);
    return {
      month: format(d, "MMM"),
      alunos: Math.round(20 + i * 3 + Math.sin(i) * 4),
    };
  });
}

export function demoFaturamento12m() {
  return Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i;
    const d = new Date(); d.setMonth(d.getMonth() - monthsAgo);
    return {
      month: format(d, "MMM"),
      receita: Math.round(8000 + i * 600 + Math.sin(i) * 1500),
      despesa: Math.round(6500 + i * 200 + Math.cos(i) * 800),
    };
  });
}

export function demoTopModalidades() {
  return MODALIDADES.map(m => ({
    modalidade: m,
    checkins: demoCheckins.filter(c => c.modality === m).length,
  })).sort((a,b) => b.checkins - a.checkins);
}

export function demoAulasHoje() {
  const dow = new Date().getDay();
  return demoSchedule.filter(s => s.day_of_week === dow).map(s => ({
    ...s,
    inscritos: 8 + (parseInt(s.start_time) % 18),
  }));
}

// Back-compat aliases used by some pages
export const demoPlanos = demoPlans;
export const demoAlunos = demoStudents;

// =================================================================
// PREMIUM REBUILD — FitZone Performance demo (rich KPIs & data)
// =================================================================

export const demoFitZoneKpis = {
  alunosAtivos: 287,
  alunosInativos: 38,
  novosMes: 24,
  planosVencendo: 18,
  checkinsHoje: 142,
  checkinsSemana: 892,
  frequenciaMedia: 12.4,
  mrr: 42800,
  receitaMes: 48200,
  aReceber: 6400,
  inadimplencia: 2800,
  inadimplenciaRate: 0.08,
  churnRate: 0.04,
  taxaRetencao: 0.94,
  alertasAi: 6,
  ticketMedio: 149,
  lucroMes: 28400,
  despesasMes: 19800,
};

// 30+ alunos brasileiros premium
const PREMIUM_NOMES = [
  "Rafael Souza", "Camila Santos", "Bruno Alves", "Patricia Lima", "Marcelo Silva",
  "Juliana Costa", "Carlos Mendes", "Fernanda Rocha", "Thiago Oliveira", "Luana Ferreira",
  "André Martins", "Beatriz Carvalho", "Roberto Almeida", "Daniela Pinto", "Eduardo Barbosa",
  "Gabriela Nunes", "Vinicius Ribeiro", "Larissa Moreira", "Felipe Dias", "Renata Cardoso",
  "Pedro Henrique", "Aline Fernandes", "Marcos Antunes", "Sabrina Reis", "Diego Andrade",
  "Tatiana Brito", "Lucas Vieira", "Mariana Tavares", "Gustavo Macedo", "Isabela Freitas",
];

const PREMIUM_PLANOS = [
  { name: "Mensal Musculacao",   price: 149.90, mensal: 149.90 },
  { name: "Trimestral Funcional", price: 379.90, mensal: 126.63 },
  { name: "Mensal Pilates",       price: 199.90, mensal: 199.90 },
  { name: "Anual Completo",       price: 1499.90, mensal: 124.99 },
  { name: "Semestral Studio",     price: 799.90, mensal: 133.32 },
];

function mkPhone(i: number) { return `(11) 9${String(50000000 + i * 173).slice(0,8)}`; }
function mkEmail(n: string) { return n.toLowerCase().replace(/ /g,".").replace(/[^a-z.]/g,"") + "@email.com"; }

export const demoFitZoneStudents = PREMIUM_NOMES.map((nome, i) => {
  // distribution: 18 ativos recorrentes, 6 novos, 4 planos vencendo, 4 inativos, 2 queda
  let status: "ativo" | "novo" | "plano_vencendo" | "inativo" = "ativo";
  let tags: string[] = ["recorrente"];
  let last_checkin_days = 1 + (i % 5);
  let checkin_count_month = 12 + (i % 8);
  let plan_end_days = 25 + (i % 15);

  if (i >= 18 && i < 24) { status = "novo"; tags = ["novato"]; last_checkin_days = i % 3; checkin_count_month = 4 + (i % 4); }
  else if (i >= 24 && i < 28) { status = "plano_vencendo"; tags = ["renovar"]; plan_end_days = (i - 23); last_checkin_days = 2 + (i % 4); }
  else if (i >= 28 && i < 30) { status = "inativo"; tags = ["sumido","reativar"]; last_checkin_days = 30 + i * 7; checkin_count_month = 0; }
  // queda frequencia overlay on a few ativos
  if (i === 6 || i === 11) { tags = ["queda_frequencia","atencao"]; checkin_count_month = 3; last_checkin_days = 9; }
  if (i === 0) { tags = ["sumido","alta_prioridade"]; status = "inativo"; last_checkin_days = 49; checkin_count_month = 0; }
  if (i === 4) { tags.push("vip"); }

  const plano = PREMIUM_PLANOS[i % PREMIUM_PLANOS.length];

  return {
    id: `fz${i+1}`,
    name: nome,
    phone: mkPhone(i),
    email: mkEmail(nome),
    birth_date: format(subDays(new Date(), 365 * (20 + (i % 40)) + i * 11), "yyyy-MM-dd"),
    plan_name: plano.name,
    valor_pago: plano.mensal,
    status,
    tags,
    last_checkin_days,
    last_checkin: format(subDays(new Date(), last_checkin_days), "yyyy-MM-dd"),
    checkin_count_month,
    plan_end_days,
    plan_end: format(addDays(new Date(), plan_end_days), "yyyy-MM-dd"),
    photo_url: `https://i.pravatar.cc/150?img=${(i * 3 + 5) % 70}`,
    professor: ["Ricardo Gomes","Bruna Farias","Ana Paula"][i % 3],
  };
});

export const demoFitZonePlans = [
  { id: "fp1", name: "Mensal Musculacao",  price: 149.90, duration: "Mensal",    alunos: 137, features: ["Musculacao livre", "Horario comercial"], featured: false },
  { id: "fp2", name: "Trimestral Funcional", price: 379.90, duration: "Trimestral", alunos: 52,  features: ["Musculacao", "Aulas Funcional", "10% economia"], featured: false },
  { id: "fp3", name: "Mensal Pilates",      price: 199.90, duration: "Mensal",    alunos: 38,  features: ["Studio Pilates", "Avaliacao postural"], featured: false },
  { id: "fp4", name: "Anual Completo",      price: 1499.90, duration: "Anual",    alunos: 44,  features: ["TUDO incluso", "25% economia", "Bonus pers."], featured: true },
  { id: "fp5", name: "Semestral Studio",    price: 799.90, duration: "Semestral", alunos: 16,  features: ["Pilates + Funcional", "15% economia"], featured: false },
];

export const demoFitZoneTeam = [
  { id: "ft1", name: "Ana Paula Mendes",  role: "Admin",                email: "ana@fitzone.com",  phone: mkPhone(101), comissao: 0,    alunos_resp: 0,   specialty: "Gestao" },
  { id: "ft2", name: "Ricardo Gomes",     role: "Professor Musculacao", email: "ricardo@fitzone.com", phone: mkPhone(102), comissao: 18, alunos_resp: 96,  specialty: "Musculacao/Hipertrofia" },
  { id: "ft3", name: "Bruna Farias",      role: "Pilates/Yoga",         email: "bruna@fitzone.com",   phone: mkPhone(103), comissao: 22, alunos_resp: 54,  specialty: "Pilates" },
  { id: "ft4", name: "Marcos Lima",       role: "Recepcao",             email: "marcos@fitzone.com",  phone: mkPhone(104), comissao: 0,  alunos_resp: 0,   specialty: "Atendimento" },
  { id: "ft5", name: "Tatiane Souza",     role: "Financeiro",           email: "tatiane@fitzone.com", phone: mkPhone(105), comissao: 0,  alunos_resp: 0,   specialty: "Cobranca" },
];

// 142 check-ins hoje distribuidos por hora
export const demoFitZoneCheckinsByHour = [
  { hour: "06h", count: 14 }, { hour: "07h", count: 14 },
  { hour: "08h", count: 10 }, { hour: "09h", count: 8 },
  { hour: "10h", count: 7 },  { hour: "11h", count: 5 },
  { hour: "12h", count: 12 }, { hour: "13h", count: 10 },
  { hour: "14h", count: 6 },  { hour: "15h", count: 4 },
  { hour: "16h", count: 4 },  { hour: "17h", count: 12 },
  { hour: "18h", count: 14 }, { hour: "19h", count: 12 },
  { hour: "20h", count: 5 },  { hour: "21h", count: 5 },
];

// últimos 14 dias - escalando ao redor de média 127
export const demoFitZoneCheckinsByDay = Array.from({ length: 14 }, (_, i) => {
  const d = subDays(new Date(), 13 - i);
  const base = [118, 132, 125, 140, 142, 78, 52, 128, 135, 122, 145, 142, 88, 142][i];
  return { date: format(d, "dd/MM"), count: base };
});

export const demoFitZoneReceitaSemana = [
  { dia: "Seg", receita: 8200 },
  { dia: "Ter", receita: 7400 },
  { dia: "Qua", receita: 8800 },
  { dia: "Qui", receita: 8500 },
  { dia: "Sex", receita: 9100 },
  { dia: "Sab", receita: 4200 },
  { dia: "Dom", receita: 2000 },
];

export const demoFitZoneReceitaVsDespesa6m = [
  { mes: "Out", receita: 38400, despesa: 18200 },
  { mes: "Nov", receita: 41200, despesa: 18800 },
  { mes: "Dez", receita: 39800, despesa: 19400 },
  { mes: "Jan", receita: 44600, despesa: 19200 },
  { mes: "Fev", receita: 46800, despesa: 19600 },
  { mes: "Mar", receita: 48200, despesa: 19800 },
];

export const demoFitZoneMrrEvolution = Array.from({ length: 12 }, (_, i) => ({
  mes: format(subDays(startOfMonth(new Date()), (11 - i) * 30), "MMM"),
  mrr: Math.round(28000 + i * 1400 + Math.sin(i) * 800),
}));

export const demoFitZoneCheckinsHoje = Array.from({ length: 12 }, (_, i) => {
  const aluno = demoFitZoneStudents[i];
  const horas = ["06:12","06:48","07:14","07:42","08:05","12:18","12:44","17:22","17:55","18:28","18:51","19:14"];
  const modalidades = ["Musculacao","Funcional","Musculacao","Pilates","Musculacao","Funcional","Musculacao","Spinning","Crossfit","Musculacao","Pilates","Funcional"];
  return {
    id: `fzc${i+1}`,
    student_name: aluno.name,
    photo_url: aluno.photo_url,
    plan_name: aluno.plan_name,
    professor: aluno.professor,
    hora: horas[i],
    modalidade: modalidades[i],
  };
});

export const demoFitZoneAniversariantes = [
  { id: "an1", name: "Camila Santos", date: "amanha", idade: 29, plan_name: "Mensal Pilates" },
  { id: "an2", name: "Bruno Alves",   date: "5/4",     idade: 34, plan_name: "Trimestral Funcional" },
  { id: "an3", name: "Larissa Moreira", date: "8/4",   idade: 27, plan_name: "Mensal Musculacao" },
  { id: "an4", name: "Felipe Dias",   date: "12/4",    idade: 41, plan_name: "Anual Completo" },
];

export const demoFitZoneVencendo = demoFitZoneStudents
  .filter(s => s.status === "plano_vencendo")
  .map(s => ({ id: s.id, name: s.name, plan_name: s.plan_name, dias: s.plan_end_days, valor: s.valor_pago }));

// Mensagens WhatsApp prontas por categoria
export const demoWhatsappTemplates = {
  INATIVO: "E ai, {nome}! 💪 Sentimos sua falta na FitZone Performance! Vamos retomar? Tenho horarios livres essa semana e ate uma surpresa pra te receber de volta. Bora?",
  PLANO_VENCENDO: "Oi {nome}! 📅 Seu plano vence em {dias} dias. Quer renovar agora e ja garantir o desconto? Posso ajustar a melhor opcao pra voce.",
  QUEDA_FREQUENCIA: "Ei {nome}! Percebi que voce esta menos frequente. Esta tudo bem? Posso ajudar a remontar sua rotina? 🏋️",
  ANIVERSARIANTE: "Parabens {nome}! 🎉 Hoje voce ganha uma diaria extra pra trazer um amigo. Comemora treinando!",
  OPORTUNIDADE: "Oi {nome}! Abrimos uma turma especial de Funcional em horario com desconto. Posso te garantir uma vaga?",
};

// 5 oportunidades AI Growth premium
export const demoFitZoneAiOps = [
  {
    id: "fzai1",
    title: "4 alunos inativos +30 dias",
    severity: "ALTA",
    color: "red",
    descricao: "Alunos sumiram da academia. Reativar agora antes do cancelamento definitivo.",
    impacto: "+R$ 2.400 recuperaveis",
    template: demoWhatsappTemplates.INATIVO,
    targets: [
      { name: "Rafael Souza",   phone: "(11) 9 8201-0011", info: "49 dias sem aparecer", valor: 149.90 },
      { name: "Bruno Alves",    phone: "(11) 9 8201-0022", info: "38 dias sem aparecer", valor: 379.90 },
      { name: "Camila Santos",  phone: "(11) 9 8201-0033", info: "32 dias sem aparecer", valor: 199.90 },
      { name: "Gustavo Macedo", phone: "(11) 9 8201-0044", info: "31 dias sem aparecer", valor: 124.99 },
    ],
  },
  {
    id: "fzai2",
    title: "12 planos vencendo essa semana",
    severity: "URGENTE",
    color: "amber",
    descricao: "Renovacoes essenciais pra manter o MRR. Dispare lembrete personalizado.",
    impacto: "+R$ 4.600 mantem MRR",
    template: demoWhatsappTemplates.PLANO_VENCENDO,
    targets: demoFitZoneVencendo.slice(0,4).map(v => ({
      name: v.name, phone: "(11) 9 8201-1100", info: `Vence em ${v.dias}d`, valor: v.valor,
    })),
  },
  {
    id: "fzai3",
    title: "Carlos Mendes -60% frequencia",
    severity: "ATENCAO",
    color: "orange",
    descricao: "Aluno historico com queda forte de treinos. Conversa preventiva evita churn.",
    impacto: "+R$ 150 evita churn",
    template: demoWhatsappTemplates.QUEDA_FREQUENCIA,
    targets: [
      { name: "Carlos Mendes",   phone: "(11) 9 8201-2200", info: "3 treinos no mes (era 12)", valor: 149.90 },
      { name: "Juliana Costa",   phone: "(11) 9 8201-2201", info: "Caiu 45% nos ultimos 30d", valor: 379.90 },
    ],
  },
  {
    id: "fzai4",
    title: "8 aniversariantes do mes",
    severity: "OPORTUNIDADE",
    color: "purple",
    descricao: "Aniversario gera engajamento e cross-sell (personal, upgrade plano).",
    impacto: "+R$ 1.200 em cross-sell",
    template: demoWhatsappTemplates.ANIVERSARIANTE,
    targets: demoFitZoneAniversariantes.map(a => ({
      name: a.name, phone: "(11) 9 8201-3300", info: `Faz ${a.idade} anos em ${a.date}`, valor: 0,
    })),
  },
  {
    id: "fzai5",
    title: "Tercas 14h-16h baixa ocupacao",
    severity: "MEDIA",
    color: "blue",
    descricao: "Apenas 18% dos slots ocupados. Promo de funcional em grupo nesse horario.",
    impacto: "+R$ 2.800 com nova turma",
    template: demoWhatsappTemplates.OPORTUNIDADE,
    targets: [
      { name: "Aline Fernandes", phone: "(11) 9 8201-4400", info: "Disponivel terca tarde", valor: 0 },
      { name: "Sabrina Reis",    phone: "(11) 9 8201-4401", info: "Mostrou interesse funcional", valor: 0 },
      { name: "Diego Andrade",   phone: "(11) 9 8201-4402", info: "Trabalha home office", valor: 0 },
    ],
  },
];

export const demoFitZoneFinanceiro = {
  receitas: [
    { id:"r1", desc:"Mensalidade - Rafael Souza", aluno:"Rafael Souza", cat:"Mensalidade",      valor:149.90, data:"03/04", status:"pago" },
    { id:"r2", desc:"Mensalidade - Patricia Lima", aluno:"Patricia Lima", cat:"Mensalidade",    valor:199.90, data:"03/04", status:"pago" },
    { id:"r3", desc:"Matricula - Tatiana Brito",   aluno:"Tatiana Brito", cat:"Matricula",      valor: 99.00, data:"03/04", status:"pago" },
    { id:"r4", desc:"Anuidade - Larissa Moreira",  aluno:"Larissa Moreira", cat:"Plano Anual",  valor:1499.90, data:"02/04", status:"pago" },
    { id:"r5", desc:"Avaliacao fisica - Diego",    aluno:"Diego Andrade", cat:"Avaliacao",      valor: 80.00, data:"02/04", status:"pago" },
    { id:"r6", desc:"Mensalidade - Bruno Alves",   aluno:"Bruno Alves", cat:"Mensalidade",      valor:379.90, data:"01/04", status:"pendente" },
    { id:"r7", desc:"Mensalidade - Carlos Mendes", aluno:"Carlos Mendes", cat:"Mensalidade",    valor:149.90, data:"01/04", status:"atrasado" },
    { id:"r8", desc:"Personal - Felipe Dias",      aluno:"Felipe Dias", cat:"Personal Trainer", valor:240.00, data:"31/03", status:"pago" },
  ],
  despesas: [
    { id:"d1", desc:"Aluguel imovel Paulista",  cat:"Aluguel",     valor:8000.00, data:"01/04", status:"pago" },
    { id:"d2", desc:"Folha professores",        cat:"Folha",       valor:6800.00, data:"05/04", status:"pago" },
    { id:"d3", desc:"Energia/Agua",             cat:"Utilities",   valor:1850.00, data:"08/04", status:"pago" },
    { id:"d4", desc:"Google Ads + Meta Ads",    cat:"Marketing",   valor:1200.00, data:"04/04", status:"pago" },
    { id:"d5", desc:"Manutencao equipamentos",  cat:"Manutencao",  valor:950.00,  data:"10/04", status:"pendente" },
    { id:"d6", desc:"Material limpeza/produtos",cat:"Suprimentos", valor:680.00,  data:"12/04", status:"pago" },
    { id:"d7", desc:"Internet/Software",        cat:"Tech",        valor:320.00,  data:"05/04", status:"pago" },
  ],
};

export const demoFitZoneTopProfessores = [
  { name: "Ricardo Gomes",  alunos: 96, checkins_mes: 412, comissao: 4150.80 },
  { name: "Bruna Farias",   alunos: 54, checkins_mes: 268, comissao: 2890.40 },
  { name: "Ana Paula Mendes", alunos: 0, checkins_mes: 0,  comissao: 0 },
];

export const demoFitZoneTopModalidades = [
  { modalidade: "Musculacao", checkins: 384, pct: 43 },
  { modalidade: "Funcional",  checkins: 178, pct: 20 },
  { modalidade: "Pilates",    checkins: 124, pct: 14 },
  { modalidade: "Crossfit",   checkins: 96,  pct: 11 },
  { modalidade: "Spinning",   checkins: 64,  pct: 7  },
  { modalidade: "Yoga",       checkins: 46,  pct: 5  },
];
