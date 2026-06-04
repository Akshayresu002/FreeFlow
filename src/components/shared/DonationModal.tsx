import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface DonationConfig {
  wallet_address: string;
  donation_text: string;
  qr_image_path: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<DonationConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/donation-config.json")
        .then((res) => {
          if (!res.ok) {
            throw new Error("HTTP error " + res.status);
          }
          return res.json();
        })
        .then((data) => {
          setConfig(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load donation config:", err);
          // Safe fallback
          setConfig({
            wallet_address: "UQBiafHUy3djWMFFyFCkAeYoBtoIdAy4xfjntd3J6fduKNpb",
            donation_text:
              "If FreeFlow helps you, consider supporting future development.",
            qr_image_path: "/qr_code.jpeg",
          });
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!config) return;
    try {
      await navigator.clipboard.writeText(config.wallet_address);
      toast.success("Wallet address copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
      toast.error("Failed to copy wallet address");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-[#121820] border border-mid-gray/20 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-5 flex flex-col items-center">
        <div className="w-full flex justify-between items-center pb-2 border-b border-mid-gray/20">
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <h2 className="text-lg font-semibold text-text">Support FreeFlow</h2>
          <button
            onClick={onClose}
            className="text-text/60 hover:text-text hover:bg-mid-gray/20 rounded-md p-1 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-logo-primary"></div>
            <p className="text-xs text-text/60">Loading donation details...</p>
          </div>
        ) : config ? (
          <>
            <p className="text-sm text-text/80 text-center px-2">
              {config.donation_text}
            </p>
            <div className="bg-[#1e2530] p-4 rounded-lg border border-mid-gray/20 flex items-center justify-center">
              <img
                src={config.qr_image_path}
                alt="Donation QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="w-full space-y-2">
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <label className="text-xs text-text/50 font-medium">
                Telegram Wallet Address
              </label>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={config.wallet_address}
                  className="bg-mid-gray/10 text-text border border-mid-gray/20 text-xs rounded-lg px-3 py-2 flex-1 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-logo-primary text-white hover:bg-logo-primary/80 transition-colors cursor-pointer shrink-0"
                >
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  Copy
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
