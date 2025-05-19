
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { supabase } from "@/integrations/supabase/client";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface PdfGeneratorOptions {
  title: string;
  content: any[];
  fileName?: string;
  logo?: string;
}

export const generatePDF = async (options: PdfGeneratorOptions) => {
  const { title, content, fileName = 'relatório.pdf' } = options;
  
  // Buscar dados da empresa e configurações
  const { data: companyData } = await supabase
    .from('company_settings')
    .select('*')
    .maybeSingle();
  
  // Logo padrão caso não tenha no banco
  let logoUrl = companyData?.logo_url || '';
  
  // Definir conteúdo do documento
  const documentDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: {
      columns: [
        logoUrl ? {
          image: logoUrl,
          width: 80,
          alignment: 'left',
          margin: [40, 20, 0, 0]
        } : {},
        {
          stack: [
            { text: companyData?.name || 'Nome da Empresa', style: 'companyName' },
            { text: companyData?.address || 'Endereço', style: 'companyInfo' },
            { text: companyData?.phone || 'Telefone', style: 'companyInfo' },
            { text: companyData?.email || 'Email', style: 'companyInfo' },
          ],
          alignment: 'right',
          margin: [0, 20, 40, 0]
        }
      ]
    },
    content: [
      { text: title, style: 'header' },
      { text: `Data: ${new Date().toLocaleDateString('pt-BR')}`, style: 'date' },
      ...content
    ],
    footer: {
      columns: [
        { 
          text: companyData?.footer_message || 'Obrigado pela preferência!',
          alignment: 'center',
          style: 'footer'
        }
      ],
      margin: [40, 0]
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 20]
      },
      companyName: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 5]
      },
      companyInfo: {
        fontSize: 10,
        margin: [0, 0, 0, 2]
      },
      date: {
        alignment: 'right',
        fontSize: 11,
        italics: true,
        margin: [0, 0, 0, 20]
      },
      footer: {
        fontSize: 10,
        margin: [0, 10]
      }
    }
  };

  // Criar e baixar o PDF
  const pdfDoc = pdfMake.createPdf(documentDefinition);
  pdfDoc.download(fileName);
  
  return pdfDoc;
};

// Exemplo de uso para relatório de produtos
export const generateProductsReport = async (products: any[]) => {
  const tableBody = [
    ['ID', 'Nome', 'Categoria', 'Preço', 'Descrição'], 
    ...products.map(p => [
      p.id, 
      p.name, 
      p.category?.name || '-', 
      `R$ ${Number(p.price).toFixed(2)}`, 
      p.description || '-'
    ])
  ];
  
  return generatePDF({
    title: 'Relatório de Produtos',
    content: [
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', '*'],
          body: tableBody
        }
      }
    ],
    fileName: 'relatorio-produtos.pdf'
  });
};

// Relatório de vendas
export const generateSalesReport = async (sales: any[], dateRange?: { start: Date, end: Date }) => {
  let dateText = 'Todos os períodos';
  
  if (dateRange) {
    dateText = `${dateRange.start.toLocaleDateString('pt-BR')} até ${dateRange.end.toLocaleDateString('pt-BR')}`;
  }
  
  const tableBody = [
    ['ID', 'Data', 'Cliente', 'Valor Total', 'Método'],
    ...sales.map(s => [
      s.id,
      new Date(s.created_at).toLocaleDateString('pt-BR'),
      s.customer_name || '-',
      `R$ ${Number(s.total_amount).toFixed(2)}`,
      s.payment_method === 'cash' ? 'Dinheiro' : 
      s.payment_method === 'credit' ? 'Crédito' : 
      s.payment_method === 'debit' ? 'Débito' : 
      s.payment_method === 'pix' ? 'PIX' : s.payment_method
    ])
  ];
  
  const totalValue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  
  return generatePDF({
    title: 'Relatório de Vendas',
    content: [
      { text: `Período: ${dateText}`, style: 'subtitle', margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto'],
          body: tableBody
        }
      },
      { text: `Total de vendas: R$ ${totalValue.toFixed(2)}`, style: 'total', margin: [0, 10, 0, 0], alignment: 'right' }
    ],
    fileName: 'relatorio-vendas.pdf'
  });
};
