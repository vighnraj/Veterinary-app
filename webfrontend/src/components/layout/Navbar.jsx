import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { getInitials } from '../../utils/formatters';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid">
        <button
          className="btn btn-link d-lg-none p-0 me-3"
          onClick={onMenuClick}
        >
          <FiMenu size={24} />
        </button>

        <div className="d-none d-md-block">
          <span className="text-muted">Sistema de Gestão Veterinária</span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notifications */}
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="btn btn-link p-0 position-relative text-muted"
          >
            <FiBell size={20} />
          </Link>

          {/* User dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36 }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="rounded-circle w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <span className="small fw-medium">
                    {getInitials(`${user?.firstName} ${user?.lastName}`)}
                  </span>
                )}
              </div>
              <span className="d-none d-md-block text-dark">
                {user?.firstName}
              </span>
            </button>

            {showDropdown && (
              <>
                <div
                  className="position-fixed top-0 start-0 w-100 h-100"
                  style={{ zIndex: 1000 }}
                  onClick={() => setShowDropdown(false)}
                />
                <div
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8 }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <strong>{user?.firstName} {user?.lastName}</strong>
                    <br />
                    <small className="text-muted">{user?.email}</small>
                  </div>
                  <Link
                    to={ROUTES.PROFILE}
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUser size={16} />
                    Meu Perfil
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiSettings size={16} />
                    Configurações
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
