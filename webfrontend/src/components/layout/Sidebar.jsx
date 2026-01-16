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
  FiUserPlus,
} from 'react-icons/fi';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

// roles: which roles can see this menu item
// empty array = all roles can see
const menuItems = [
  {
    title: 'Principal',
    items: [
      { path: ROUTES.DASHBOARD, icon: FiHome, label: 'Dashboard', roles: [] },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { path: ROUTES.CLIENTS, icon: FiUsers, label: 'Clientes', roles: ['owner', 'admin', 'user'] },
      { path: ROUTES.ANIMALS, icon: FiBox, label: 'Animais', roles: ['owner', 'admin', 'user'] },
      { path: ROUTES.BATCHES, icon: FiBox, label: 'Lotes', roles: ['owner', 'admin', 'user'] },
    ],
  },
  {
    title: 'Atendimentos',
    items: [
      { path: ROUTES.APPOINTMENTS, icon: FiCalendar, label: 'Agendamentos', roles: ['owner', 'admin', 'user'] },
      { path: ROUTES.SERVICES, icon: FiFileText, label: 'Serviços', roles: ['owner', 'admin'] },
    ],
  },
  {
    title: 'Manejo',
    items: [
      { path: ROUTES.REPRODUCTIVE, icon: FiHeart, label: 'Reprodutivo', roles: ['owner', 'admin', 'user'] },
      { path: ROUTES.SANITARY, icon: FiShield, label: 'Sanitário', roles: ['owner', 'admin', 'user'] },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { path: ROUTES.FINANCIAL, icon: FiDollarSign, label: 'Financeiro', roles: ['owner', 'admin'] },
      { path: ROUTES.INVOICES, icon: FiFileText, label: 'Faturas', roles: ['owner', 'admin'] },
    ],
  },
  {
    title: 'Outros',
    items: [
      { path: ROUTES.REPORTS, icon: FiFileText, label: 'Relatórios', roles: ['owner', 'admin'] },
      { path: ROUTES.NOTIFICATIONS, icon: FiBell, label: 'Notificações', roles: [] },
      { path: ROUTES.SUBSCRIPTION, icon: FiCreditCard, label: 'Assinatura', roles: ['owner'] },
      { path: ROUTES.PROFILE, icon: FiSettings, label: 'Configurações', roles: [] },
    ],
  },
  {
    title: 'Administração',
    roles: ['owner', 'admin'], // section only visible to these roles
    items: [
      { path: ROUTES.USERS, icon: FiUserPlus, label: 'Usuários', roles: ['owner', 'admin'] },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { account, user } = useAuth();
  const userRole = user?.role || 'viewer';

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Check if user can see a menu item
  const canSeeItem = (item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(userRole);
  };

  // Check if user can see a section
  const canSeeSection = (section) => {
    if (section.roles && !section.roles.includes(userRole)) return false;
    return section.items.some(canSeeItem);
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
            {menuItems.filter(canSeeSection).map((section) => (
              <div key={section.title} className="sidebar-section">
                <h6 className="sidebar-section-title">{section.title}</h6>
                <ul className="nav flex-column">
                  {section.items.filter(canSeeItem).map((item) => (
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
