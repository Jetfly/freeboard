import { Transaction } from '@/lib/transaction-service';

interface ReportData {
  period: string;
  reportType: string;
  kpis: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalVatCollected: number;
  };
  transactions: Transaction[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export class PDFExportService {
  static async generateReport(data: ReportData): Promise<void> {
    // Simulation d'export PDF - dans un vrai projet, on utiliserait jsPDF ou une API
    const reportContent = this.generateReportContent(data);
    
    // Créer un blob avec le contenu du rapport
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Télécharger le fichier
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${data.reportType}-${data.period}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  private static generateReportContent(data: ReportData): string {
    const { period, reportType, kpis, transactions, categoryBreakdown } = data;
    
    let content = `RAPPORT ${reportType.toUpperCase()}\n`;
    content += `Période: ${period}\n`;
    content += `Généré le: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    
    // KPIs
    content += `=== INDICATEURS CLÉS ===\n`;
    content += `Revenus totaux: ${this.formatCurrency(kpis.totalRevenue)}\n`;
    content += `Dépenses totales: ${this.formatCurrency(kpis.totalExpenses)}\n`;
    content += `Bénéfice net: ${this.formatCurrency(kpis.netProfit)}\n`;
    content += `TVA collectée: ${this.formatCurrency(kpis.totalVatCollected)}\n\n`;
    
    // Répartition par catégorie
    if (categoryBreakdown.length > 0) {
      content += `=== RÉPARTITION PAR CATÉGORIE ===\n`;
      categoryBreakdown.forEach(item => {
        content += `${item.category}: ${this.formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)\n`;
      });
      content += '\n';
    }
    
    // Transactions
    content += `=== TRANSACTIONS (${transactions.length}) ===\n`;
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleDateString('fr-FR');
      const type = transaction.type === 'income' ? 'Revenu' : 'Dépense';
      content += `${date} - ${type} - ${transaction.client_name || 'N/A'} - ${this.formatCurrency(transaction.amount)} - ${transaction.category}\n`;
    });
    
    return content;
  }
  
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
  
  static async generateExcelReport(data: ReportData): Promise<void> {
    // Simulation d'export Excel - dans un vrai projet, on utiliserait SheetJS
    const csvContent = this.generateCSVContent(data);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${data.reportType}-${data.period}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  private static generateCSVContent(data: ReportData): string {
    let csv = 'Date,Type,Client,Montant,Catégorie,Description\n';
    
    data.transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleDateString('fr-FR');
      const type = transaction.type === 'income' ? 'Revenu' : 'Dépense';
      const client = transaction.client_name || 'N/A';
      const amount = transaction.amount.toString().replace('.', ',');
      const category = transaction.category;
      const description = transaction.description || '';
      
      csv += `"${date}","${type}","${client}","${amount}","${category}","${description}"\n`;
    });
    
    return csv;
  }
}