
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileText, File, FileType, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ExportOptionsProps {
  exportData: any[];
  filename: string;
}

export function ExportOptions({ exportData, filename }: ExportOptionsProps) {
  // Function to export data as CSV (for Excel)
  const exportToExcel = () => {
    try {
      // Convert data to CSV format
      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Exportado com sucesso para Excel");
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast.error("Falha ao exportar para Excel");
    }
  };
  
  // Function to export data as PDF
  const exportToPDF = () => {
    // In a real app, you'd use a library like jsPDF or pdfmake
    // This is a placeholder to demonstrate the functionality
    toast.info("Exportação para PDF será implementada em breve");
  };
  
  // Function to share data
  const shareData = () => {
    if (navigator.share) {
      navigator.share({
        title: `Relatório - ${filename}`,
        text: `Dados do relatório ${filename}`,
      })
      .then(() => toast.success("Compartilhado com sucesso"))
      .catch((error) => {
        console.error("Erro ao compartilhar:", error);
        toast.error("Falha ao compartilhar");
      });
    } else {
      toast.info("Compartilhamento não é suportado neste navegador");
    }
  };
  
  // Function to export as text
  const exportAsText = () => {
    try {
      const text = JSON.stringify(exportData, null, 2);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.txt`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Exportado com sucesso como texto");
    } catch (error) {
      console.error("Erro ao exportar como texto:", error);
      toast.error("Falha ao exportar como texto");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToExcel}>
          <File className="mr-2 h-4 w-4" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileType className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="mr-2 h-4 w-4" /> Texto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareData}>
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
