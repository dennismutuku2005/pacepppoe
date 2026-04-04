"use client"

import React, { useState, useEffect } from 'react'
import { 
    Printer, FileText, Calendar, Download, 
    Search, LayoutList, History, Loader2,
    TrendingUp, TrendingDown, Activity, 
    ArrowRight, MapPin, Globe, ShieldCheck, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/Skeleton'
import { reportService } from '@/services/report'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'

export default function PdfReportsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Filters
    const now = new Date();
    const [filters, setFilters] = useState({
        type: 'daily',
        date: now.toISOString().split('T')[0],
        startDate: now.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleGenerateReport = async () => {
        try {
            setIsGenerating(true);
            const res = await reportService.getReportData(filters);
            
            if (res && res.status === 'success') {
                const img = new window.Image();
                img.src = '/logoc.png';
                img.onload = () => {
                    generatePdf(res.data, img);
                    toast.success("Report preview ready!");
                };
                img.onerror = () => {
                    generatePdf(res.data, null);
                    toast.success("Report preview ready!");
                };
            } else {
                toast.error("Failed to fetch report data");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error generating report");
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePdf = (data, logoImg) => {
        const doc = new jsPDF({ compress: true });
        const { connections, expenses, summary, meta } = data;
        
        // --- 1. Identify Account ---
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'pace';
        const accountName = hostname.split('.')[0] || 'Pace';
        const displayName = accountName.charAt(0).toUpperCase() + accountName.slice(1);
        
        // --- 2. Styles & Colors ---
        const primaryColor = [124, 58, 237]; // Pace Purple
        const textColor = [31, 41, 55];
        const secondaryTextColor = [107, 114, 128];

        // --- 3. Header ---
        if (logoImg) {
            const imgHeight = 14;
            const imgWidth = imgHeight * (logoImg.width / logoImg.height);
            doc.addImage(logoImg, 'PNG', 20, 15, imgWidth, imgHeight);
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
            doc.text("DIGITAL SERVICES PROVIDER", 20 + imgWidth + 4, 25);
        } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text("PACE WISP", 20, 25);
            
            doc.setFontSize(10);
            doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
            doc.text("DIGITAL SERVICES PROVIDER", 20, 32);
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        let reportTitle = `${displayName} ENTRIES REPORT`;
        if (meta.type === 'daily') reportTitle = `${displayName} DAILY ENTRIES REPORT`;
        else if (meta.type === 'monthly') reportTitle = `${displayName} MONTHLY ENTRIES REPORT`;
        else if (meta.type === 'custom') reportTitle = `${displayName} CUSTOM RANGE REPORT`;
        else if (meta.type === 'all_time') reportTitle = `${displayName} ALL-TIME ENTRIES REPORT`;
        
        doc.text(reportTitle.toUpperCase(), 20, 45);
        
        doc.setFontSize(10);
        let periodText = "";
        if (meta.type === 'daily') periodText = `DATE: ${meta.date}`;
        else if (meta.type === 'monthly') periodText = `PERIOD: ${getMonthName(meta.month)} ${meta.year}`;
        else if (meta.type === 'custom') periodText = `RANGE: ${meta.startDate} to ${meta.endDate}`;
        else if (meta.type === 'all_time') periodText = `PERIOD: SINCE START`;
        
        doc.text(periodText, 20, 52);

        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 58);
        doc.text(`Account Profile: ${displayName}`, 20, 64);

        if (meta.truncated) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(220, 38, 38);
            doc.setFontSize(8);
            doc.text(`* DATA TRUNCATED: ONLY FIRST ${meta.limit} ENTRIES SHOWN PER SECTION TO PREVENT LAGGING. TOTALS ARE ACCURATE.`, 20, 70);
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        }

        // --- 4. Summary box ---
        doc.setDrawColor(229, 231, 235);
        doc.setFillColor(249, 250, 251);
        doc.rect(20, 75, 170, 25, 'FD');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
        doc.text("TOTAL INCOME", 30, 85);
        doc.text("TOTAL EXPENSES", 85, 85);
        doc.text("NET PROFIT", 145, 85);
        
        doc.setFontSize(12);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(`KSH ${summary.income.toLocaleString()}`, 30, 93);
        doc.text(`KSH ${summary.expenses.toLocaleString()}`, 85, 93);
        doc.setTextColor(summary.net >= 0 ? 34 : 220, summary.net >= 0 ? 197 : 38, summary.net >= 0 ? 94 : 38);
        doc.text(`KSH ${summary.net.toLocaleString()}`, 145, 93);

        // --- 5. Entries Table ---
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("INCOME ENTRIES (CONNECTIONS)", 20, 115);

        const incomeHeaders = [["Date/Time", "Account", "Phone", "Plan", "Mpesa Code", "Amount"]];
        const incomeRows = connections.map(c => [
            meta.type === 'daily' 
                ? new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(c.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            c.account_name,
            c.phone,
            c.plan.split(' - ')[0],
            c.mpesa_code || '-',
            `KSH ${c.amount.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 120,
            head: incomeHeaders,
            body: incomeRows,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9 },
            margin: { left: 20, right: 20 },
        });

        // --- 6. Expenses Table ---
        const finalY = doc.lastAutoTable.finalY + 15;
        if (expenses.length > 0) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("EXPENSES LOG", 20, finalY);

            const expenseHeaders = [["Date", "Description", "Category", "Amount"]];
            const expenseRows = expenses.map(e => [
                e.date,
                e.description,
                e.category,
                `KSH ${e.amount.toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: expenseHeaders,
                body: expenseRows,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68], fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 9 },
                margin: { left: 20, right: 20 }
            });
        }

        // --- 7. Digital Stamp & Footer Layering ---
        const pageCount = doc.internal.getNumberOfPages();
        const stampY = 240; 
        const stampDate = new Date().toISOString().split('T')[0];

        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(0.5);
            doc.circle(170, stampY + 15, 20, 'S');
            doc.circle(170, stampY + 15, 19, 'S');
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text("APPROVED & VERIFIED", 158, stampY + 11);
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("PACE WISP", 158.5, stampY + 17);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(5);
            const uid = Math.random().toString(36).substring(7).toUpperCase();
            doc.text(`UID: ${uid}-${stampDate}`, 157.5, stampY + 23);

            doc.setFontSize(8);
            doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Electronic Report Generated for ${displayName} Account - Verification Code: ${uid}`, 105, 290, { align: 'center' });
        }

        let fileName = `Report_${displayName}.pdf`;
        if (meta.type === 'daily') fileName = `Daily_Report_${meta.date}_${displayName}.pdf`;
        else if (meta.type === 'monthly') fileName = `Monthly_Report_${meta.month}_${meta.year}_${displayName}.pdf`;
        else if (meta.type === 'custom') fileName = `Custom_Report_${meta.startDate}_to_${meta.endDate}_${displayName}.pdf`;
        else if (meta.type === 'all_time') fileName = `AllTime_Report_${displayName}.pdf`;
            
        doc.setProperties({
            title: fileName,
            subject: 'Financial Report',
            author: displayName
        });

        const pdfDataUri = doc.output('datauristring');
        setPreviewUrl(pdfDataUri);
        setPdfFileName(fileName);
    };

    const getMonthName = (m) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1];

    if (!isMounted) return null;

    return (
        <div className="space-y-8 font-figtree animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-pace-border pb-6">
                <div>
                    <h1 className="text-xl font-medium text-pace-purple uppercase tracking-tight">Financial PDF Reports</h1>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 tracking-widest uppercase">Generate clean, professional business documents</p>
                </div>
            </div>

            <div className="max-w-xl mx-auto">
                {/* Generation Card */}
                <div className="bg-card-bg border border-pace-border rounded-2xl p-8 space-y-8 h-fit">
                    <div className="flex items-center gap-4 border-b border-pace-border pb-6">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-pace-purple uppercase tracking-tight">Report Config</h2>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Select dates to filter</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Type Toggle */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Report Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-pace-bg-subtle p-1 rounded-xl border border-pace-border">
                                <button 
                                    onClick={() => setFilters({...filters, type: 'daily'})}
                                    className={cn(
                                        "py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1",
                                        filters.type === 'daily' ? "bg-white shadow-sm text-pace-purple" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Daily
                                </button>
                                <button 
                                    onClick={() => setFilters({...filters, type: 'monthly'})}
                                    className={cn(
                                        "py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1",
                                        filters.type === 'monthly' ? "bg-white shadow-sm text-pace-purple" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Monthly
                                </button>
                                <button 
                                    onClick={() => setFilters({...filters, type: 'custom'})}
                                    className={cn(
                                        "py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1",
                                        filters.type === 'custom' ? "bg-white shadow-sm text-pace-purple" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Custom
                                </button>
                                <button 
                                    onClick={() => setFilters({...filters, type: 'all_time'})}
                                    className={cn(
                                        "py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1",
                                        filters.type === 'all_time' ? "bg-white shadow-sm text-pace-purple" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Since Start
                                </button>
                            </div>
                        </div>

                        {filters.type === 'daily' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Day</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                                        className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-12 py-3 text-sm font-bold text-pace-purple outline-none focus:ring-2 focus:ring-pace-purple/10 cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {filters.type === 'monthly' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Month</label>
                                    <select 
                                        value={filters.month}
                                        onChange={(e) => setFilters({...filters, month: e.target.value})}
                                        className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-3 text-sm font-bold text-pace-purple outline-none appearance-none cursor-pointer"
                                    >
                                        {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Year</label>
                                    <select 
                                        value={filters.year}
                                        onChange={(e) => setFilters({...filters, year: e.target.value})}
                                        className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-3 text-sm font-bold text-pace-purple outline-none cursor-pointer"
                                    >
                                        {[now.getFullYear(), now.getFullYear()-1].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {filters.type === 'custom' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <input 
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                        className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-3 text-sm font-bold text-pace-purple outline-none focus:ring-2 focus:ring-pace-purple/10 cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                                    <input 
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                        className="w-full bg-pace-bg-subtle border border-pace-border rounded-xl px-4 py-3 text-sm font-bold text-pace-purple outline-none focus:ring-2 focus:ring-pace-purple/10 cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {filters.type === 'all_time' && (
                            <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 flex items-start gap-3">
                                <Activity size={18} className="text-violet-600 mt-0.5" />
                                <p className="text-[10px] font-medium text-violet-800 leading-relaxed uppercase tracking-tight">
                                    This will analyze all records since the system started. For very large datasets, only the first 1,000 entries will be listed in the PDF to prevent lagging, but totals will be calculated correctly.
                                </p>
                            </div>
                        )}

                        <div className="pt-4">
                            <button 
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className="w-full bg-pace-purple text-white rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#3d1a75] transition-all shadow-lg shadow-pace-purple/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                {isGenerating ? "Analyzing data..." : `Process & Preview`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live PDF Preview Modal */}
                {previewUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gray-50/80">
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-pace-purple tracking-tight">Report Review</h3>
                                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">Previewing: {pdfFileName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a 
                                        href={previewUrl}
                                        download={pdfFileName}
                                        onClick={() => setPreviewUrl(null)}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all text-xs sm:text-sm font-bold shadow-lg shadow-green-500/30"
                                    >
                                        <Download size={16} /> <span className="hidden sm:inline">Download</span>
                                    </a>
                                    <button 
                                        onClick={() => setPreviewUrl(null)}
                                        className="p-2 sm:p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-800 transition-colors shadow-sm"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 w-full bg-gray-100/50 flex items-center justify-center relative">
                                <embed 
                                    src={previewUrl} 
                                    type="application/pdf"
                                    className="w-full h-full border-none animate-in fade-in duration-700"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function CheckCircle(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    )
  }
