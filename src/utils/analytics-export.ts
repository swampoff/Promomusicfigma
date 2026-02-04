/**
 * ANALYTICS EXPORT UTILITIES
 * Утилиты для экспорта аналитики в различных форматах
 * 
 * Поддерживаемые форматы:
 * - PDF (детальный отчет с графиками)
 * - Excel (таблицы с данными)
 * - CSV (простые данные)
 * - JSON (для программного использования)
 */

// =====================================================
// CSV EXPORT
// =====================================================

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Получить заголовки из первого объекта
  const headers = Object.keys(data[0]);
  
  // Создать строки CSV
  const csvContent = [
    headers.join(','), // Заголовки
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Экранировать запятые и кавычки
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Создать Blob с BOM для корректного отображения кириллицы
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Скачать файл
  downloadFile(blob, `${filename}.csv`);
}

// =====================================================
// EXCEL EXPORT (используя встроенный XML формат)
// =====================================================

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Аналитика') {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Создать XML для Excel
  let xmlContent = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="${sheetName}">
        <Table>
          <Row>
            ${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}
          </Row>
          ${data.map(row => `
            <Row>
              ${headers.map(h => {
                const value = row[h];
                const type = typeof value === 'number' ? 'Number' : 'String';
                return `<Cell><Data ss:Type="${type}">${value}</Data></Cell>`;
              }).join('')}
            </Row>
          `).join('')}
        </Table>
      </Worksheet>
    </Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  downloadFile(blob, `${filename}.xls`);
}

// =====================================================
// JSON EXPORT
// =====================================================

export function exportToJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, `${filename}.json`);
}

// =====================================================
// PDF EXPORT (текстовый отчет)
// =====================================================

export function exportToPDF(data: {
  title: string;
  period: string;
  stats: any;
  charts?: any[];
  tables?: Array<{ title: string; data: any[] }>;
}, filename: string) {
  // Создаем HTML для PDF
  const htmlContent = generatePDFHTML(data);
  
  // Открываем в новом окне для печати в PDF
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна для экспорта PDF');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Автоматически открыть диалог печати
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function generatePDFHTML(data: any): string {
  const { title, period, stats, tables } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - ${period}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1e293b;
          background: white;
        }
        .header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #6366f1;
        }
        .header h1 {
          font-size: 28px;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .header .period {
          font-size: 14px;
          color: #64748b;
        }
        .header .generated {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          padding: 20px;
          background: #f8fafc;
          border-left: 4px solid #6366f1;
          border-radius: 8px;
        }
        .stat-card .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .stat-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .stat-card .change {
          font-size: 12px;
          font-weight: 600;
        }
        .stat-card .change.positive { color: #10b981; }
        .stat-card .change.negative { color: #ef4444; }
        .table-section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .table-section h2 {
          font-size: 18px;
          margin-bottom: 16px;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        thead {
          background: #f1f5f9;
        }
        th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #cbd5e1;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tbody tr:hover {
          background: #f8fafc;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 20px; }
          .stat-card { break-inside: avoid; }
          .table-section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="period">Период: ${period}</div>
        <div class="generated">Сгенерирован: ${new Date().toLocaleString('ru-RU')}</div>
      </div>

      ${stats ? `
        <div class="stats-grid">
          ${Object.entries(stats).map(([key, value]: [string, any]) => `
            <div class="stat-card">
              <div class="label">${value.label || key}</div>
              <div class="value">${value.value}</div>
              ${value.growth ? `
                <div class="change ${value.growth > 0 ? 'positive' : 'negative'}">
                  ${value.growth > 0 ? '+' : ''}${value.growth}%
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${tables ? tables.map(table => `
        <div class="table-section">
          <h2>${table.title}</h2>
          <table>
            <thead>
              <tr>
                ${Object.keys(table.data[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${table.data.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('') : ''}

      <div class="footer">
        <p>PROMO.MUSIC © 2026 • Аналитический отчет</p>
      </div>
    </body>
    </html>
  `;
}

// =====================================================
// HELPER: Download File
// =====================================================

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =====================================================
// RADIO ANALYTICS EXPORT
// =====================================================

export function exportRadioAnalytics(
  format: 'pdf' | 'excel' | 'csv' | 'json',
  data: {
    period: string;
    stats: any;
    campaigns?: any[];
    financial?: any[];
  }
) {
  const filename = `radio-analytics-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'pdf':
      exportToPDF({
        title: 'Аналитика радиостанции',
        period: data.period,
        stats: {
          revenue: {
            label: 'Доход',
            value: `₽${data.stats.revenue.total.toLocaleString()}`,
            growth: data.stats.revenue.growth
          },
          requests: {
            label: 'Заявки',
            value: data.stats.requests.total,
            growth: 12.3
          },
          listeners: {
            label: 'Слушатели',
            value: `${(data.stats.listeners.total / 1000).toFixed(0)}K`,
            growth: data.stats.listeners.growth
          }
        },
        tables: data.campaigns ? [{
          title: 'Активные кампании',
          data: data.campaigns
        }] : undefined
      }, filename);
      break;

    case 'excel':
      if (data.campaigns) {
        exportToExcel(data.campaigns, filename, 'Кампании');
      }
      break;

    case 'csv':
      if (data.campaigns) {
        exportToCSV(data.campaigns, filename);
      }
      break;

    case 'json':
      exportToJSON(data, filename);
      break;
  }
}

// =====================================================
// VENUE ANALYTICS EXPORT
// =====================================================

export function exportVenueAnalytics(
  format: 'pdf' | 'excel' | 'csv' | 'json',
  data: {
    period: string;
    stats: any;
    campaigns?: any[];
    radioStations?: any[];
  }
) {
  const filename = `venue-analytics-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'pdf':
      exportToPDF({
        title: 'Аналитика заведения',
        period: data.period,
        stats: {
          spending: {
            label: 'Затраты',
            value: `₽${data.stats.spending.total.toLocaleString()}`,
            growth: data.stats.spending.growth
          },
          campaigns: {
            label: 'Активные кампании',
            value: data.stats.campaigns.active,
          },
          reach: {
            label: 'Охват',
            value: `${(data.stats.reach.totalImpressions / 1000).toFixed(0)}K`,
            growth: data.stats.reach.growth
          },
          roi: {
            label: 'ROI',
            value: `${data.stats.performance.avgROI}%`,
            growth: 18.5
          }
        },
        tables: [
          data.campaigns ? {
            title: 'Рекламные кампании',
            data: data.campaigns
          } : null,
          data.radioStations ? {
            title: 'Радиостанции',
            data: data.radioStations
          } : null
        ].filter(Boolean) as any
      }, filename);
      break;

    case 'excel':
      if (data.campaigns) {
        exportToExcel(data.campaigns, filename, 'Кампании');
      }
      break;

    case 'csv':
      if (data.campaigns) {
        exportToCSV(data.campaigns, filename);
      }
      break;

    case 'json':
      exportToJSON(data, filename);
      break;
  }
}
