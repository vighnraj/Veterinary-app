import { useState } from 'react';
import { FiFileText, FiDownload, FiCalendar } from 'react-icons/fi';
import { reportsApi } from '../../api';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Button, Input, Alert } from '../../components/common';

const Reports = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const handleDownload = async (type) => {
    setLoading(type);
    setError('');

    try {
      let response;
      let filename;

      switch (type) {
        case 'financial':
          response = await reportsApi.generateFinancialReport(dateRange);
          filename = `relatorio-financeiro-${dateRange.startDate}-${dateRange.endDate}.pdf`;
          break;
        default:
          return;
      }

      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading('');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Gere relatórios do seu negócio</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="row g-4">
        {/* Date Filter */}
        <div className="col-12">
          <Card title="Período">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <Input
                  label="Data Início"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <Input
                  label="Data Fim"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Report Types */}
        <div className="col-md-6 col-lg-4">
          <Card>
            <div className="text-center py-3">
              <FiFileText size={48} className="text-primary mb-3" />
              <h5>Relatório Financeiro</h5>
              <p className="text-muted small">
                Resumo de faturamento, receitas e inadimplência
              </p>
              <Button
                onClick={() => handleDownload('financial')}
                loading={loading === 'financial'}
                disabled={!dateRange.startDate || !dateRange.endDate}
              >
                <FiDownload className="me-2" />
                Gerar PDF
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-md-6 col-lg-4">
          <Card>
            <div className="text-center py-3">
              <FiCalendar size={48} className="text-success mb-3" />
              <h5>Relatório de Atendimentos</h5>
              <p className="text-muted small">
                Lista de atendimentos realizados no período
              </p>
              <Button variant="secondary" disabled>
                Em breve
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-md-6 col-lg-4">
          <Card>
            <div className="text-center py-3">
              <FiFileText size={48} className="text-info mb-3" />
              <h5>Relatório Reprodutivo</h5>
              <p className="text-muted small">
                Indicadores reprodutivos do rebanho
              </p>
              <Button variant="secondary" disabled>
                Em breve
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
