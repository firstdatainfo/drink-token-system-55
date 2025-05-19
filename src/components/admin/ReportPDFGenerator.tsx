
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Printer, Table } from "lucide-react";
import { generateProductsReport, generateSalesReport } from "@/utils/pdfGenerator";
import { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportPDFGeneratorProps {
  productsData?: any[];
  salesData?: any[];
}

export const ReportPDFGenerator: React.FC<ReportPDFGeneratorProps> = ({ 
  productsData = [], 
  salesData = [] 
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)),
    to: new Date()
  });
  const [reportType, setReportType] = useState<'products' | 'sales'>('sales');

  const handleGeneratePDF = async () => {
    try {
      if (reportType === 'products') {
        if (productsData.length === 0) {
          toast.error("Nenhum produto encontrado para gerar o relatório");
          return;
        }
        await generateProductsReport(productsData);
        toast.success("Relatório de produtos gerado com sucesso!");
      } else {
        if (salesData.length === 0) {
          toast.error("Nenhuma venda encontrada para gerar o relatório");
          return;
        }
        
        let filteredSales = salesData;
        
        // Filtra as vendas pelo intervalo de data, se houver
        if (dateRange?.from && dateRange?.to) {
          filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.created_at);
            const from = new Date(dateRange.from!);
            const to = new Date(dateRange.to!);
            to.setHours(23, 59, 59, 999); // Define o fim do dia
            
            return saleDate >= from && saleDate <= to;
          });
        }
        
        await generateSalesReport(filteredSales, dateRange);
        toast.success("Relatório de vendas gerado com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar o relatório");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Gerador de Relatórios PDF
        </CardTitle>
        <CardDescription>
          Gere relatórios personalizados com logo e dados da empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select 
                value={reportType} 
                onValueChange={(value: 'products' | 'sales') => setReportType(value)}
              >
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Relatório de Vendas</SelectItem>
                  <SelectItem value="products">Relatório de Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'sales' && (
              <div className="space-y-2">
                <Label>Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="rounded-md border p-4 bg-gray-50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {reportType === 'products' ? 'Dados do Relatório de Produtos:' : 'Dados do Relatório de Vendas:'}
                </span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                {reportType === 'products' ? (
                  <>
                    <li>Total de produtos: {productsData.length}</li>
                    <li>Campos incluídos: ID, Nome, Categoria, Preço, Descrição</li>
                  </>
                ) : (
                  <>
                    <li>
                      {dateRange?.from && dateRange?.to 
                        ? `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
                        : 'Todas as vendas'
                      }
                    </li>
                    <li>Campos incluídos: ID, Data, Cliente, Valor Total, Método de Pagamento</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleGeneratePDF}>
          <FileDown className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </CardFooter>
    </Card>
  );
};
