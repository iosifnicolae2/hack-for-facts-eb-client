import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { yValueFormatter } from '@/components/charts/components/chart-renderer/utils'
import { TreemapInput } from './budget-transform'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Fragment } from 'react'

type Props = {
  data: TreemapInput[]
  onNodeClick?: (code: string | null) => void
  path?: { code: string; label: string }[]
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d',
  '#A4DE6C', '#D0ED57', '#FF7300', '#FFB300', '#E53935', '#D81B60',
  '#8E24AA', '#5E35B1', '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
  '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300',
  '#FB8C00', '#F4511E',
];

const getColor = (code: string) => {
  let hash = 0;
  if (code.length === 0) return COLORS[0];
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};


const CustomizedContent: React.FC<any> = (props) => {
    const { depth, x, y, width, height, name, value } = props;

    if (isNaN(value)) {
        return null;
    }

    const displayValue = yValueFormatter(value, 'RON', 'compact');
    const textColor = '#FFFFFF';

    const nameFontSize = 12;
    const valueFontSize = 10;

    const canShowName = width > 50 && height > 20;
    const canShowValue = canShowName && height > 35;

    const maxChars = Math.floor(width / (nameFontSize * 0.55));
    const truncatedName = name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;


    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: props.fill,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 0.5,
                }}
            />
            {canShowName && (
                <text
                    x={x + width / 2}
                    y={canShowValue ? y + height / 2 - valueFontSize / 2 : y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize={nameFontSize}
                    fontWeight={500}
                    style={{ pointerEvents: 'none' }}
                >
                    {truncatedName}
                </text>
            )}
            {canShowValue && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + nameFontSize / 2 + 3}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize={valueFontSize}
                    fillOpacity={0.9}
                >
                    {displayValue}
                </text>
            )}
        </g>
    );
};

export function BudgetTreemap({ data, onNodeClick, path }: Props) {
  const payloadData = data.map((n) => ({
    name: n.name,
    value: n.value,
    code: n.code,
    fill: getColor(n.code),
  }))

  return (
    <div className="w-full h-[420px] space-y-4">
      {path && path.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNodeClick?.(null)} className="cursor-pointer">
                Root
              </BreadcrumbLink>
            </BreadcrumbItem>
            {path.map((item) => (
              <Fragment key={item.code}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => onNodeClick?.(item.code)}
                    className="cursor-pointer"
                  >
                    {item.label ?? item.code}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={payloadData}
          dataKey="value"
          nameKey="name"
          animationDuration={300}
          onClick={(e) => onNodeClick?.((e as any)?.code)}
          content={(props) => <CustomizedContent {...props} />}
        >
          <Tooltip
            formatter={(value: number) => yValueFormatter(value, 'RON', 'compact')}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}


