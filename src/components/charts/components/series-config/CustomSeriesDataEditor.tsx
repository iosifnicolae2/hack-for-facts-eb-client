import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomSeriesConfigurationSchema } from '@/schemas/charts';
import { useChartStore } from '../../hooks/useChartStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { z } from 'zod';

type CustomSeriesDataEditorProps = {
  series: z.infer<typeof CustomSeriesConfigurationSchema>;
};

export function CustomSeriesDataEditor({ series }: CustomSeriesDataEditorProps) {
  const { updateSeries } = useChartStore();
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');

  const handleValueChange = (year: number, value: string) => {
    const newData = series.data.map(d =>
      d.year === year ? { ...d, value: Number(value) } : d
    );
    updateSeries(series.id, { ...series, data: newData });
  };

  const handleBulkUpdate = () => {
    const lines = bulkData.trim().split('\n');
    const newData = [...series.data];
    let updatedCount = 0;

    lines.forEach(line => {
      const [yearStr, valueStr] = line.split(/\s+/);
      const year = parseInt(yearStr, 10);
      const value = parseFloat(valueStr);

      if (!isNaN(year) && !isNaN(value)) {
        const index = newData.findIndex(d => d.year === year);
        if (index !== -1) {
          newData[index] = { ...newData[index], value };
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      updateSeries(series.id, { ...series, data: newData });
      toast.success(`${updatedCount} rows updated successfully.`);
    } else {
      toast.warning('No matching years found to update.');
    }
    setIsBulkEditOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Data</CardTitle>
        <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Bulk Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Edit Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste data from a spreadsheet. Each line should contain a year and a value, separated by a space or tab.
              </p>
              <Textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                rows={10}
                placeholder="2020 1500&#10;2021 2300&#10;2022 1800"
              />
              <Button onClick={handleBulkUpdate}>Update Data</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.data.map(({ year, value }) => (
                <TableRow key={year}>
                  <TableCell>{year}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleValueChange(year, e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
