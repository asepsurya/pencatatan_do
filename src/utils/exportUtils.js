import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel,
    BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';

// --- EXCEL EXPORT ---
export const exportToExcel = (dos) => {
    const worksheetData = dos.flatMap(doItem =>
        doItem.items.map(item => ({
            'Tanggal': doItem.date,
            'Waktu Masuk': doItem.arrivalTime || '-',
            'No. Delivery Order': doItem.doNumber,
            'Pengirim': doItem.sender,
            'Penerima': doItem.receiver,
            'Nama Barang': item.name,
            'Kuantitas': item.quantity,
            'Satuan': item.unit,
            'Catatan': doItem.notes
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Orders");

    // Set professional column widths
    const wscols = [
        { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 30 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Rekap_DO_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// --- PDF EXPORT ---
export const exportToPDF = (dos) => {
    if (!dos || dos.length === 0) {
        throw new Error("Tidak ada data untuk diekspor");
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Logo Overlay (using public path) - Minimalist size
    try {
        doc.addImage('/logo.png', 'PNG', 14, 8, 18, 18);
    } catch (e) {
        console.warn('Logo could not be loaded for PDF', e);
    }

    // Branding - Black & White
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('KOPERASI KARYA SURYA ASRI', 35, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Rekap Delivery Order SPPG MBG NURUL CENDIKIA ke Koperasi', 35, 25);

    // Metadata Right-aligned
    doc.setFontSize(8);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 18, { align: 'right' });
    doc.text(`Total Data: ${dos.length} Transaksi`, pageWidth - 14, 23, { align: 'right' });

    // Header divider line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);

    const tableData = [];
    dos.forEach(doItem => {
        const items = doItem.items && Array.isArray(doItem.items) ? doItem.items : [{ name: 'N/A', quantity: 0, unit: '-' }];
        items.forEach((item, idx) => {
            tableData.push([
                idx === 0 ? (doItem.date || '-') : '',
                idx === 0 ? (doItem.arrivalTime || '-') : '',
                idx === 0 ? (doItem.doNumber || '-') : '',
                idx === 0 ? (doItem.sender || '-') : '',
                idx === 0 ? (doItem.receiver || '-') : '',
                item.name || '-',
                `${item.quantity || 0} ${item.unit || '-'}`,
                idx === 0 ? (doItem.notes || '-') : ''
            ]);
        });
    });

    autoTable(doc, {
        startY: 35,
        head: [['Tanggal', 'Jam', 'No. DO', 'Pengirim', 'Penerima', 'Nama Barang', 'Qty', 'Catatan']],
        body: tableData,
        theme: 'grid', // 'grid' for simple border-based look
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 3,
            valign: 'middle',
            overflow: 'linebreak',
            textColor: 0,
            lineColor: [0, 0, 0]
        },
        columnStyles: {
            0: { cellWidth: 18, halign: 'center' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 30 },
            3: { cellWidth: 35 },
            4: { cellWidth: 35 },
            5: { cellWidth: 40 },
            6: { cellWidth: 15, halign: 'center' },
            7: { cellWidth: 'auto' }
        },
        didDrawPage: (data) => {
            // Footer
            const str = "Halaman " + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(str, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }
    });

    const fileName = dos.length === 1 ? `DO_${dos[0].doNumber.split('/').pop()}` : `Rekap_DO_${new Date().toISOString().split('T')[0]}`;
    doc.save(`${fileName}.pdf`);
};

// --- WORD EXPORT ---
export const exportToWord = (dos) => {
    const sections = dos.map(doItem => {
        return {
            properties: {},
            children: [
                new Paragraph({
                    text: "LAPORAN DELIVERY ORDER",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "DETAIL PENGIRIMAN", bold: true, size: 24, color: "1e3a8a" }),
                    ],
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Nomor DO: `, bold: true }),
                        new TextRun({ text: doItem.doNumber }),
                        new TextRun({ text: `\tTanggal: `, bold: true, break: 1 }),
                        new TextRun({ text: `${doItem.date} (${doItem.arrivalTime || '--:--'})` }),
                        new TextRun({ text: `\tPengirim: `, bold: true, break: 1 }),
                        new TextRun({ text: doItem.sender }),
                        new TextRun({ text: `\tPenerima: `, bold: true, break: 1 }),
                        new TextRun({ text: doItem.receiver }),
                    ],
                    spacing: { after: 300 },
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ text: "Nama Barang", bold: true, alignment: AlignmentType.CENTER })],
                                    shading: { fill: "eff6ff" }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: "Qty", bold: true, alignment: AlignmentType.CENTER })],
                                    shading: { fill: "eff6ff" }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ text: "Satuan", bold: true, alignment: AlignmentType.CENTER })],
                                    shading: { fill: "eff6ff" }
                                }),
                            ],
                        }),
                        ...doItem.items.map(item => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: item.name, alignment: AlignmentType.LEFT })] }),
                                new TableCell({ children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: item.unit, alignment: AlignmentType.CENTER })] }),
                            ],
                        })),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Catatan: `, bold: true }),
                        new TextRun({ text: doItem.notes || '-', italics: true }),
                    ],
                    spacing: { before: 200, after: 600 },
                }),
                // Horizontal Divider Paragraph (Visual Only)
                new Paragraph({
                    border: { bottom: { color: "e2e8f0", size: 12, space: 1, style: BorderStyle.SINGLE } },
                    spacing: { after: 400 }
                }),
            ],
        };
    });

    const doc = new Document({ sections });

    Packer.toBlob(doc).then(blob => {
        const timestamp = new Date().toISOString().split('T')[0];
        saveAs(blob, `Laporan_DO_${timestamp}.docx`);
    });
};
