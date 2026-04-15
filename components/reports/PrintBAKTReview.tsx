import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Download, ClipboardList, User, Calendar, FileText, Printer } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import { useAuth } from "../../service/AuthContext";
import { API } from '../../config';
import { useReactToPrint } from "react-to-print";

interface BaktResult {
    BA_No: string;
    CreateDateBA: string;
    WO_No: string;
    IsConfirmed: number;
    StUser: string;
    StApproved: number;
    NRPMechanic: string;
    Nama: string;
    Jabatan: string;
    NRPSuperior: string;
    NamaSuperior: string;
    ToolsId: string;
    ToolsName: string;
    TotalPrice: number;
    Perusahaan: number;
    Karyawan: number;
    CauseBrokenBA: string;
    ToolsCondition: string;
    StApprovedBAKT: string;
    StReportBAKT: string;
    CreatedDate: string;
}

interface PrintBAKTReviewProps {
    ba_no: string;
}

export default function PrintBAKTReview({ ba_no }: PrintBAKTReviewProps) {
    const { currentUser } = useAuth();
    const [baktDetails, setBaktDetails] = useState<BaktResult | null>(null);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: () => "BAKT Document" });

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    useEffect(() => {
        const fetchBaktDetails = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    act: "REPORT",
                    jobsite: currentUser?.Jobsite || '',
                    nrp: currentUser?.Nrp || ''
                });

                const response = await fetch(`${API.BAKT()}?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch BAKT details');

                const data: BaktResult[] = await response.json();
                const detail = data.find(item => item.BA_No === ba_no);

                if (detail) {
                    setBaktDetails(detail);
                } else {
                    toast.error('BAKT not found');
                }
            } catch (error) {
                console.error('Error fetching BAKT details:', error);
                toast.error('Failed to load BAKT details');
            } finally {
                setLoading(false);
            }
        };

        fetchBaktDetails();
    }, [ba_no, currentUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009999]"></div>
            </div>
        );
    }

    if (!baktDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-xl font-bold text-gray-700">BAKT Details Not Found</h2>
                <p className="text-gray-500">The requested BAKT number {ba_no} could not be located.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-[#009999]" />
                    BAKT Review
                </h1>
                <Button
                    onClick={() => reactToPrintFn()}
                    className="bg-[#009999] hover:bg-[#008080] text-white"
                >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Document
                </Button>
            </div><br />

            <div ref={contentRef} className="bg-white p-8 mt-48 rounded-lg border border-gray-200 print:shadow-none print:border-none" style={{ fontFamily: 'Arial, Roboto' }}>
                {/* Document Header */}
                <br />
                <div className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-center items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 text-center uppercase tracking-tighter">BERITA ACARA</h2>
                        <p className="text-md font-bold text-gray-700">KEBUTUHAN ALAT / TENAGA (BAKT)</p>
                    </div>
                </div>

                <div className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-center items-start">
                    <div className="text-center">
                        <div className="text-sm font-mono font-bold">BA No : {baktDetails.BA_No}</div>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="text-sm font-mono font-bold">BERIKUT INI DISERAHKAN TOOLS / FACILITIES KEPADA :</div>
                </div>
                <div className="grid grid-cols-2 gap-12 mb-20 p-4">

                    {/* Employee & Transaction Information */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Employee Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Name</span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span>{baktDetails.Nama} ({baktDetails.NRPMechanic})</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Role</span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span className="text font-bold text-gray-900">{baktDetails.Jabatan}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">BAKT Create Date</span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span>{formatDate(baktDetails.CreateDateBA)}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Jobsite</span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span className="text font-bold text-gray-900">{currentUser?.Jobsite || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tool Information */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-1">Tool Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Tools ID </span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span className="text font-bold text-gray-900">{baktDetails.ToolsId}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Tools Description </span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span className="text font-bold text-gray-900">{baktDetails.ToolsName}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">MO Number</span>
                                <div className="flex items-center gap-2 font-bold text-gray-900 mt-1">
                                    <span className="text font-bold text-gray-900">{baktDetails.WO_No || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase">Condition / Reason</span>
                                <div className="p-2 italic text-sm mt-1">
                                    "{baktDetails.ToolsCondition + ": " + baktDetails.CauseBrokenBA || 'No description provided'}"
                                </div>
                            </div>
                        </div>
                    </section>
                </div><br /><br />

                {/* Signature Area */}
                <div className="grid grid-cols-3 gap-8 mt-48 text-center">
                    <div className="space-y-12">
                        <span className="block text-xs font-bold text-gray-400 uppercase border-b pb-1">Yang menyerahkan</span>
                        <div>
                            <br />
                            <br />
                            <br />
                            <br />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 inline-block px-4">{baktDetails.Nama}</div>
                        </div>
                    </div>
                    <div className="space-y-12">
                        <span className="block text-xs font-bold text-gray-400 uppercase border-b pb-1">Yang menerima</span>
                        <div>
                            <br />
                            <br />
                            <br />
                            <br />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 inline-block px-4">{baktDetails.NamaSuperior}</div>
                        </div>
                    </div>
                    <div className="space-y-12">
                        <span className="block text-xs font-bold text-gray-400 uppercase border-b pb-1">Yang mengetahui</span>
                        <div>
                            <br />
                            <br />
                            <br />
                            <br />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900 inline-block px-4">Plant Section Head</div>
                        </div>
                    </div>
                </div><br /><br /><br />

                <div className="mt-20 text-sm text-gray-400 pt-2 flex justify-between">
                    <span>Printed via SmartTomas Application - {new Date().toLocaleString()}</span>
                    <span>Document ID: {baktDetails.BA_No}</span>
                </div>
            </div>
        </div>
    );
}