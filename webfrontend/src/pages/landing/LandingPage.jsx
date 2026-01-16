import { Link } from 'react-router-dom';
import { FiCheck, FiCalendar, FiUsers, FiFileText, FiPieChart, FiShield, FiSmartphone } from 'react-icons/fi';
import { ROUTES } from '../../constants/routes';
import './landing.css';

const features = [
  {
    icon: <FiUsers size={24} />,
    title: 'Gestão de Clientes',
    description: 'Cadastre produtores, propriedades e mantenha histórico completo de atendimentos.',
  },
  {
    icon: <FiCalendar size={24} />,
    title: 'Agendamentos',
    description: 'Agende consultas, procedimentos e receba alertas automáticos de compromissos.',
  },
  {
    icon: <FiFileText size={24} />,
    title: 'Manejo Reprodutivo',
    description: 'Controle de IA, IATF, diagnósticos de gestação, partos e árvore genealógica.',
  },
  {
    icon: <FiShield size={24} />,
    title: 'Controle Sanitário',
    description: 'Vacinas, vermifugações, campanhas sanitárias e alertas de aplicação.',
  },
  {
    icon: <FiPieChart size={24} />,
    title: 'Financeiro Completo',
    description: 'Faturamento, contas a receber, relatórios e emissão de nota fiscal eletrônica.',
  },
  {
    icon: <FiSmartphone size={24} />,
    title: 'Multiplataforma',
    description: 'Acesse pelo computador, tablet ou smartphone. Seus dados sempre disponíveis.',
  },
];

const plans = [
  {
    name: 'Básico',
    price: 'R$ 99',
    period: '/mês',
    description: 'Ideal para clínicas iniciantes',
    features: ['Até 2 usuários', 'Até 500 animais', 'Até 100 clientes', '5GB de armazenamento', 'Suporte por email'],
    popular: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para clínicas em crescimento',
    features: ['Até 5 usuários', 'Até 2.000 animais', 'Até 500 clientes', '25GB de armazenamento', 'Nota Fiscal Eletrônica', 'Suporte prioritário'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 399',
    period: '/mês',
    description: 'Para grandes operações',
    features: ['Até 20 usuários', 'Até 10.000 animais', 'Até 2.000 clientes', '100GB de armazenamento', 'API personalizada', 'Suporte dedicado'],
    popular: false,
  },
];

const faqs = [
  {
    question: 'Como funciona o período de teste?',
    answer: 'Você tem 14 dias para testar todas as funcionalidades do plano Profissional gratuitamente. Não é necessário cartão de crédito para iniciar.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Utilizamos criptografia de ponta a ponta e backups automáticos diários. Seus dados são armazenados em servidores seguros na nuvem.',
  },
  {
    question: 'O sistema funciona offline?',
    answer: 'O aplicativo móvel possui funcionalidades offline limitadas. Os dados são sincronizados automaticamente quando a conexão é restabelecida.',
  },
  {
    question: 'Como funciona a nota fiscal eletrônica?',
    answer: 'A emissão de NF-e está disponível nos planos Profissional e Enterprise. Você precisa ter um certificado digital A1 para utilizar esta funcionalidade.',
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">🐄</span>
              <span className="logo-text">DUOVET</span>
            </div>
            <div className="nav-links">
              <a href="#features">Recursos</a>
              <a href="#pricing">Planos</a>
              <a href="#faq">FAQ</a>
              <Link to={ROUTES.LOGIN} className="btn-outline">Entrar</Link>
              <Link to={ROUTES.REGISTER} className="btn-primary">Começar Grátis</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Sistema Completo de Gestão Veterinária para Grandes Animais</h1>
            <p>
              Gerencie clientes, animais, atendimentos, manejo reprodutivo, controle sanitário
              e financeiro em uma única plataforma. Disponível para web e mobile.
            </p>
            <div className="hero-buttons">
              <Link to={ROUTES.REGISTER} className="btn-primary btn-lg">
                Teste Grátis por 14 Dias
              </Link>
              <a href="#features" className="btn-outline btn-lg">
                Conhecer Recursos
              </a>
            </div>
            <p className="hero-note">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
          <div className="hero-image">
            <div className="hero-mockup">
              <div className="mockup-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="mockup-content">
                <div className="mockup-stat">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <span className="stat-value">247</span>
                    <span className="stat-label">Animais Ativos</span>
                  </div>
                </div>
                <div className="mockup-stat">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Consultas Hoje</span>
                  </div>
                </div>
                <div className="mockup-stat">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">R$ 45.200</span>
                    <span className="stat-label">Faturamento Mensal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Tudo que você precisa para gerenciar sua clínica</h2>
            <p>Funcionalidades completas desenvolvidas por veterinários para veterinários</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Planos para todos os tamanhos de clínica</h2>
            <p>Escolha o plano ideal para sua necessidade</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Mais Popular</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <FiCheck className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.REGISTER}
                  className={plan.popular ? 'btn-primary btn-block' : 'btn-outline btn-block'}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Perguntas Frequentes</h2>
            <p>Tire suas dúvidas sobre o DUOVET</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Pronto para modernizar sua clínica?</h2>
          <p>Junte-se a centenas de veterinários que já transformaram sua gestão</p>
          <Link to={ROUTES.REGISTER} className="btn-primary btn-lg">
            Começar Teste Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🐄</span>
                <span className="logo-text">DUOVET</span>
              </div>
              <p>Sistema de gestão veterinária para grandes animais</p>
            </div>
            <div className="footer-links">
              <h5>Produto</h5>
              <a href="#features">Recursos</a>
              <a href="#pricing">Planos</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-links">
              <h5>Empresa</h5>
              <a href="#">Sobre nós</a>
              <a href="#">Contato</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-links">
              <h5>Legal</h5>
              <a href="#">Termos de Uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Cookies</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} DUOVET. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
