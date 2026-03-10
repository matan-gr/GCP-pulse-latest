import { Toaster as Sonner } from 'sonner';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const Toaster = () => {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "group flex items-center w-full bg-white dark:bg-[#303134] text-[#202124] dark:text-[#e8eaed] border border-[#dadce0] dark:border-[#3c4043] shadow-lg rounded-xl p-4 font-sans",
          title: "text-sm font-medium",
          description: "text-sm text-[#5f6368] dark:text-[#9aa0a6]",
          actionButton: "bg-[#1a73e8] text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[#1557b0] transition-colors",
          cancelButton: "bg-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          success: "group-[.toaster]:bg-[#e6f4ea] dark:group-[.toaster]:bg-[#1e8e3e]/20 group-[.toaster]:text-[#137333] dark:group-[.toaster]:text-[#81c995] group-[.toaster]:border-[#ceead6] dark:group-[.toaster]:border-[#1e8e3e]/30",
          error: "group-[.toaster]:bg-[#fce8e6] dark:group-[.toaster]:bg-[#d93025]/20 group-[.toaster]:text-[#c5221f] dark:group-[.toaster]:text-[#f28b82] group-[.toaster]:border-[#fad2cf] dark:group-[.toaster]:border-[#d93025]/30",
          info: "group-[.toaster]:bg-[#e8f0fe] dark:group-[.toaster]:bg-[#1a73e8]/20 group-[.toaster]:text-[#1967d2] dark:group-[.toaster]:text-[#8ab4f8] group-[.toaster]:border-[#d2e3fc] dark:group-[.toaster]:border-[#1a73e8]/30",
          warning: "group-[.toaster]:bg-[#fef7e0] dark:group-[.toaster]:bg-[#f9ab00]/20 group-[.toaster]:text-[#ea8600] dark:group-[.toaster]:text-[#fde293] group-[.toaster]:border-[#feefc3] dark:group-[.toaster]:border-[#f9ab00]/30",
        }
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-[#137333] dark:text-[#81c995]" />,
        info: <Info className="w-5 h-5 text-[#1967d2] dark:text-[#8ab4f8]" />,
        warning: <AlertTriangle className="w-5 h-5 text-[#ea8600] dark:text-[#fde293]" />,
        error: <AlertCircle className="w-5 h-5 text-[#c5221f] dark:text-[#f28b82]" />,
      }}
    />
  );
};
