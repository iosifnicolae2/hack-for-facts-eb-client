import React from 'react';
import { EntityDetailsData } from '@/lib/api/entities';
import { Card, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Download, FileText, Landmark, Calendar } from 'lucide-react';
import { EntityReportsSkeleton } from './EntityReportsSkeleton';
import { Trans } from '@lingui/react/macro';

type Report = NonNullable<EntityDetailsData['reports']>['nodes'][0];

interface EntityReportsProps {
  reports: EntityDetailsData['reports'] | null;
  isLoading?: boolean;
}

const ReportItem: React.FC<{ report: Report }> = ({ report }) => {
  const formatDate = (dateString: string) => {
    return new Date(parseInt(dateString)).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileExtension = (url: string) => {
    const extension = url.split('.').pop()?.toUpperCase();
    return extension === 'XLSX' ? 'Excel' : extension;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3">
      <div className="md:col-span-1 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{report.reporting_year}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatDate(report.report_date)}
          </p>
        </div>
      </div>
      <div className="md:col-span-1">
        <p className="text-sm text-slate-600 dark:text-slate-300">{report.report_type}</p>
      </div>
      <div className="md:col-span-1 flex items-center gap-2">
        <Landmark className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Link
          to="/entities/$cui"
          params={{ cui: report.main_creditor.cui }}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
        >
          {report.main_creditor.name}
        </Link>
      </div>
      <div className="md:col-span-1 flex justify-start md:justify-end gap-2">
        {report.download_links.map((link: string, index: number) => (
          <Button key={index} variant="outline" size="sm" asChild>
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              {getFileExtension(link)}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
};

export const EntityReports: React.FC<EntityReportsProps> = ({ reports, isLoading }) => {
  if (isLoading) {
    return <EntityReportsSkeleton />;
  }

  if (!reports || reports.nodes.length === 0) {
    return null;
  }

  const sortedReports = [...reports.nodes].sort((a, b) =>
    b.reporting_year - a.reporting_year || parseInt(b.report_date) - parseInt(a.report_date)
  );

  return (
    <Card>
      <Accordion type="single" defaultValue='reports' collapsible className="w-full">
        <AccordionItem value="reports" className="border-b-0">
          <AccordionTrigger className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <CardTitle><Trans>Financial Reports</Trans> ({sortedReports.length})</CardTitle>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
            <div className="border-t border-slate-200 dark:border-slate-700">
              {sortedReports.map((report) => (
                <div key={report.report_id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                  <ReportItem report={report} />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}; 