import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { ROUTES } from '../constants/routes';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-3">Página não encontrada</h2>
        <p className="text-muted mb-4">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
          <FiHome className="me-2" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
