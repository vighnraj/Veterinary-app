import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiBox,
  FiCalendar,
  FiHeart,
  FiShield,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiBell,
  FiCreditCard,
  FiX,
} from 'react-icons/fi';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { path: ROUTES.DASHBOARD, icon: FiHome, label: 'Dashboard' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { path: ROUTES.CLIENTS, icon: FiUsers, label: 'Clientes' },
      { path: ROUTES.ANIMALS, icon: FiBox, label: 'Animais' },
      { path: ROUTES.BATCHES, icon: FiBox, label: 'Lotes' },
    ],
  },
  {
    title: 'Atendimentos',
    items: [
      { path: ROUTES.APPOINTMENTS, icon: FiCalendar, label: 'Agendamentos' },
      { path: ROUTES.SERVICES, icon: FiFileText, label: 'Servi\u00e7os' },
    ],
  },
  {
    title: 'Manejo',
    items: [
      { path: ROUTES.REPRODUCTIVE, icon: FiHeart, label: 'Reprodutivo' },
      { path: ROUTES.SANITARY, icon: FiShield, label: 'Sanit\u00e1rio' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { path: ROUTES.FINANCIAL, icon: FiDollarSign, label: 'Financeiro' },
      { path: ROUTES.INVOICES, icon: FiFileText, label: 'Faturas' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { path: ROUTES.REPORTS, icon: FiFileText, label: 'Relat\u00f3rios' },
      { path: ROUTES.NOTIFICATIONS, icon: FiBell, label: 'Notifica\u00e7\u00f5es' },
      { path: ROUTES.SUBSCRIPTION, icon: FiCreditCard, label: 'Assinatura' },
      { path: ROUTES.PROFILE, icon: FiSettings, label: 'Configura\u00e7\u00f5es' },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { account } = useAuth();

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <div className="d-flex align-items-center">
            <span className="fs-4 fw-bold text-primary">VetSaaS</span>
          </div>
          <button className="btn btn-link d-lg-none p-0" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="sidebar-body">
          <nav className="sidebar-nav">
            {menuItems.map((section) => (
              <div key={section.title} className="sidebar-section">
                <h6 className="sidebar-section-title">{section.title}</h6>
                <ul className="nav flex-column">
                  {section.items.map((item) => (
                    <li key={item.path} className="nav-item">
                      <NavLink
                        to={item.path}
                        className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <item.icon className="nav-icon" size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {account && (
          <div className="sidebar-footer p-3 border-top">
            <small className="text-muted d-block">{account.name}</small>
            <small className="text-muted">
              Plano: <span className="text-primary">{account.plan?.name || 'Free'}</span>
            </small>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
