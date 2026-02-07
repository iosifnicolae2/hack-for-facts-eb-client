import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import type { InsSeriesConfiguration } from '@/schemas/charts';

import { InsSeriesFilter } from './InsSeriesFilter';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function createSeries(overrides: Partial<InsSeriesConfiguration> = {}): InsSeriesConfiguration {
  return {
    id: 'ins-series-1',
    type: 'ins-series',
    enabled: true,
    label: 'INS',
    unit: '',
    config: {
      showDataLabels: false,
      color: '#0000ff',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aggregation: 'sum',
    hasValue: true,
    ...overrides,
  };
}

describe('InsSeriesFilter', () => {
  it('renders empty state when no filters are configured', () => {
    render(<InsSeriesFilter series={createSeries()} />);

    expect(screen.getByText('No INS filters configured.')).toBeInTheDocument();
  });

  it('renders period pills from period object', () => {
    render(
      <InsSeriesFilter
        series={createSeries({
          datasetCode: 'POP107D',
          period: {
            type: 'YEAR',
            selection: {
              interval: {
                start: '2020',
                end: '2024',
              },
            },
          },
        })}
      />
    );

    expect(screen.getByText('POP107D')).toBeInTheDocument();
    expect(screen.getByText('2020 - 2024')).toBeInTheDocument();
  });
});
