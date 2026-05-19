import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, FileType2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
} from "docx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ReportAppointment {
  id: string;
  patient_name: string;
  appointment_date: string;
  appointment_time: string | null;
  appointment_type: string;
  specialty_or_professional: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: ReportAppointment[];
  professionalOptions: string[];
  userName: string;
  clinicName?: string;
}

function timeOf(a: ReportAppointment): string {
  if (a.appointment_time) return a.appointment_time.slice(0, 5);
  try {
    return format(new Date(a.appointment_date), "HH:mm");
  } catch {
    return "";
  }
}

export function DailyAppointmentsReport({
  open,
  onOpenChange,
  appointments,
  professionalOptions,
  userName,
  clinicName = "CuidarBem Pediatria",
}: Props) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState<string>(todayStr);
  const [professional, setProfessional] = useState<string>("Todas");

  const filtered = useMemo(() => {
    const list = appointments.filter((a) => {
      const day = format(new Date(a.appointment_date), "yyyy-MM-dd");
      if (day !== date) return false;
      if (professional !== "Todas") {
        return (a.specialty_or_professional ?? "") === professional;
      }
      return true;
    });
    return list.sort((x, y) => timeOf(x).localeCompare(timeOf(y)));
  }, [appointments, date, professional]);

  const totals = useMemo(() => {
    const consultas = filtered.filter((a) => a.appointment_type === "Consulta").length;
    const procedimentos = filtered.filter((a) => a.appointment_type === "Procedimento").length;
    return { total: filtered.length, consultas, procedimentos };
  }, [filtered]);

  const dateLabel = useMemo(() => {
    try {
      return format(new Date(`${date}T00:00:00`), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  }, [date]);

  const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  const hasData = filtered.length > 0;

  function professionalLabel(a: ReportAppointment): string {
    return a.specialty_or_professional || a.appointment_type;
  }

  function exportPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(clinicName, pageWidth / 2, 50, { align: "center" });

    doc.setFontSize(13);
    doc.text("Relatório Diário de Agendamentos", pageWidth / 2, 72, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(dateLabel, pageWidth / 2, 92, { align: "center" });

    if (professional !== "Todas") {
      doc.setFontSize(10);
      doc.text(`Filtro: ${professional}`, pageWidth / 2, 108, { align: "center" });
    }

    const summaryY = professional !== "Todas" ? 128 : 116;
    doc.setFontSize(11);
    doc.text(
      `Total: ${totals.total}   |   Consultas: ${totals.consultas}   |   Procedimentos: ${totals.procedimentos}`,
      pageWidth / 2,
      summaryY,
      { align: "center" },
    );

    autoTable(doc, {
      startY: summaryY + 16,
      head: [["Hora", "Paciente", "Médica / Procedimento"]],
      body: filtered.map((a) => [timeOf(a), a.patient_name, professionalLabel(a)]),
      styles: { fontSize: 10, cellPadding: 6, textColor: 20 },
      headStyles: { fillColor: [220, 220, 235], textColor: 20, fontStyle: "bold" },
      theme: "grid",
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? summaryY + 32;
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(`Gerado em: ${generatedAt}`, 40, finalY + 30);
    doc.text(`Por: ${userName}`, 40, finalY + 44);

    doc.save(`relatorio-agendamentos-${date}.pdf`);
  }

  async function exportDocx() {
    const headerBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
    };

    const headerRow = new DocxTableRow({
      tableHeader: true,
      children: ["Hora", "Paciente", "Médica / Procedimento"].map(
        (text) =>
          new DocxTableCell({
            borders: headerBorder,
            shading: { fill: "DCDCEB" },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
          }),
      ),
    });

    const bodyRows = filtered.map(
      (a) =>
        new DocxTableRow({
          children: [timeOf(a), a.patient_name, professionalLabel(a)].map(
            (text) =>
              new DocxTableCell({
                borders: headerBorder,
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text })] })],
              }),
          ),
        }),
    );

    const docx = new DocxDocument({
      sections: [
        {
          properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: clinicName, bold: true, size: 32 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Relatório Diário de Agendamentos", bold: true, size: 26 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: dateLabel, size: 22 })],
            }),
            ...(professional !== "Todas"
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `Filtro: ${professional}`, italics: true })],
                  }),
                ]
              : []),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Total: ${totals.total}   |   Consultas: ${totals.consultas}   |   Procedimentos: ${totals.procedimentos}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new DocxTable({
              width: { size: 9360, type: WidthType.DXA },
              columnWidths: [1400, 4480, 3480],
              rows: [headerRow, ...bodyRows],
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new Paragraph({ children: [new TextRun({ text: `Gerado em: ${generatedAt}`, size: 18, color: "555555" })] }),
            new Paragraph({ children: [new TextRun({ text: `Por: ${userName}`, size: 18, color: "555555" })] }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(docx);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-agendamentos-${date}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Relatório Diário de Agendamentos</DialogTitle>
          <DialogDescription>Visualize e exporte a agenda do dia.</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Médica / Especialidade</Label>
              <Input
                list="report-professional-options"
                value={professional}
                onChange={(e) => setProfessional(e.target.value)}
                placeholder="Todas"
              />
              <datalist id="report-professional-options">
                <option value="Todas" />
                {professionalOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg bg-white p-6 text-gray-900 shadow-sm">
            <div className="text-center space-y-1">
              <div className="text-xl font-bold">{clinicName}</div>
              <div className="text-base font-semibold">Relatório Diário de Agendamentos</div>
              <div className="text-sm capitalize">{dateLabel}</div>
              {professional !== "Todas" && (
                <div className="text-xs italic text-gray-700">Filtro: {professional}</div>
              )}
            </div>

            <div className="mt-4 text-center text-sm font-medium">
              Total: {totals.total} &nbsp;|&nbsp; Consultas: {totals.consultas} &nbsp;|&nbsp; Procedimentos: {totals.procedimentos}
            </div>

            <div className="mt-4 overflow-x-auto">
              {hasData ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left w-24">Hora</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Paciente</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Médica / Procedimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id}>
                        <td className="border border-gray-300 px-3 py-2 font-mono">{timeOf(a)}</td>
                        <td className="border border-gray-300 px-3 py-2">{a.patient_name}</td>
                        <td className="border border-gray-300 px-3 py-2">{professionalLabel(a)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-700">Nenhum agendamento neste dia</div>
              )}
            </div>

            <div className="mt-6 text-xs text-gray-700 border-t pt-3">
              <div>Gerado em: {generatedAt}</div>
              <div>Por: {userName}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 px-6 py-4 border-t bg-background sticky bottom-0">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Button variant="outline" onClick={exportDocx} disabled={!hasData} className="flex-1 sm:flex-none">
            <FileType2 className="w-4 h-4 mr-2" />
            Baixar Word
          </Button>
          <Button onClick={exportPdf} disabled={!hasData} className="flex-1 sm:flex-none">
            <FileText className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
