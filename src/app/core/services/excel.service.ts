import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  constructor() {}

  private toExportFileName(excelFileName: string, format = 'excel'): string {
    const fileName = excelFileName.replace(/ /g, '_');
    if (format === 'excel') {
      return `${fileName}_export_${new Date().getTime()}.xlsx`;
    } else if (format === 'csv') {
      return `${fileName}_export_${new Date().getTime()}.csv`;
    }
  }

  public exportAsExcelFile(json: any[], excelFileName: string, dataDict: any[]): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, { skipHeader: true });
    const worksheet2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataDict, { skipHeader: true });
    const workbook: XLSX.WorkBook = {
      Sheets: { Data: worksheet, Data_Dictionary: worksheet2 },
      SheetNames: ['Data', 'Data_Dictionary'],
    };
    XLSX.writeFile(workbook, this.toExportFileName(excelFileName));
  }
}
