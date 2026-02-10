import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DataTable, DataTableFilters } from './DataTable';

type Row = { id: number; name: string; age: number };

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'age', label: 'Edad' },
];

describe('DataTable', () => {
  it('renders empty state', () => {
    render(
      <DataTable<Row>
        data={[]}
        columns={columns}
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByText('No se encontraron registros')).toBeInTheDocument();
  });

  it('sorts by column on header click', async () => {
    const user = userEvent.setup();
    const data: Row[] = [
      { id: 1, name: 'Bruno', age: 30 },
      { id: 2, name: 'Ana', age: 20 },
    ];

    render(
      <DataTable<Row>
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
      />
    );

    const ageHeader = screen.getByRole('button', { name: /edad/i });
    await act(async () => {
      await user.click(ageHeader);
    });

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstRowCells = within(rows[1]).getAllByRole('cell');
    expect(firstRowCells[1]).toHaveTextContent('20');

    await act(async () => {
      await user.click(ageHeader);
    });
    const rowsDesc = within(table).getAllByRole('row');
    const firstRowDescCells = within(rowsDesc[1]).getAllByRole('cell');
    expect(firstRowDescCells[1]).toHaveTextContent('30');
  });

  it('paginates data', async () => {
    const user = userEvent.setup();
    const data: Row[] = [
      { id: 1, name: 'Ana', age: 20 },
      { id: 2, name: 'Bruno', age: 30 },
    ];

    render(
      <DataTable<Row>
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        defaultPageSize={1}
        pageSizeOptions={[1, 2]}
      />
    );

    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByTitle('Página siguiente'));
    });
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
  });
});

describe('DataTableFilters', () => {
  it('applies and clears filters', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <DataTableFilters
        filters={[
          {
            key: 'status',
            label: 'Estado',
            type: 'select',
            options: [{ value: 'active', label: 'Activo' }],
          },
          { key: 'name', label: 'Nombre', type: 'text' },
        ]}
        onFilterChange={onFilterChange}
      />
    );

    await act(async () => {
      await user.selectOptions(screen.getByLabelText('Estado'), 'active');
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ status: 'active' });

    await act(async () => {
      await user.type(screen.getByLabelText('Nombre'), 'Ana');
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ status: 'active', name: 'Ana' });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });
});
