import Loading from './Loading';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  onPageChange,
  onRowClick,
  rowKey = 'id',
  striped = true,
  hover = true,
  responsive = true,
}) => {
  if (loading) {
    return <Loading />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const tableContent = (
    <table
      className={`table mb-0 ${striped ? 'table-striped' : ''} ${hover ? 'table-hover' : ''}`}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{ width: col.width }}
              className={col.headerClassName || ''}
            >
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            key={row[rowKey]}
            onClick={() => onRowClick && onRowClick(row)}
            style={onRowClick ? { cursor: 'pointer' } : {}}
          >
            {columns.map((col) => (
              <td key={col.key} className={col.className || ''}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      {responsive ? (
        <div className="table-responsive">{tableContent}</div>
      ) : (
        tableContent
      )}

      {pagination && (
        <div className="p-3 border-top">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
