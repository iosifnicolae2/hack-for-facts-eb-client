interface ChartTitleProps {
    title: string;
    subtitle?: string;
}

export const ChartTitle = ({ title, subtitle }: ChartTitleProps) => (
    <>
        <h2 className="text-center text-lg font-bold text-muted-foreground">{title}</h2>
        {subtitle && (
            <p className="text-center text-sm text-muted-foreground">{subtitle}</p>
        )}
    </>
);