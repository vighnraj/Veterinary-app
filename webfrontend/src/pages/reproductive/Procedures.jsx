import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Card } from '../../components/common';

const Procedures = () => {
  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.REPRODUCTIVE}>Reprodutivo</Link>
            </li>
            <li className="breadcrumb-item active">Procedimentos</li>
          </ol>
        </nav>
        <h1 className="page-title">Procedimentos Reprodutivos</h1>
      </div>

      <Card>
        <p className="text-center text-muted py-4 mb-0">
          Selecione um tipo de procedimento para registrar
        </p>
      </Card>
    </div>
  );
};

export default Procedures;
