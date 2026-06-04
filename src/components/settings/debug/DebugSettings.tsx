import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listen } from "@tauri-apps/api/event";
import { WordCorrectionThreshold } from "./WordCorrectionThreshold";
import { LogLevelSelector } from "./LogLevelSelector";
import { PasteDelay } from "./PasteDelay";
import { RecordingBuffer } from "./RecordingBuffer";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { AlwaysOnMicrophone } from "../AlwaysOnMicrophone";
import { SoundPicker } from "../SoundPicker";
import { ClamshellMicrophoneSelector } from "../ClamshellMicrophoneSelector";
import { UpdateChecksToggle } from "../UpdateChecksToggle";
import { Button } from "../../ui/Button";

interface ShortcutDiagnostic {
  binding_id: string;
  hotkey_string: string;
  is_pressed: boolean;
  active_modifiers: string[];
  processing_time_ms: number;
  timestamp: string;
}

export const DebugSettings: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ShortcutDiagnostic[]>([]);

  useEffect(() => {
    let active = true;
    const unlistenPromise = listen<ShortcutDiagnostic>(
      "shortcut-diagnostic",
      (event) => {
        if (!active) return;
        setLogs((prev) =>
          [
            {
              ...event.payload,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ].slice(0, 50),
        );
      },
    );

    return () => {
      active = false;
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <SettingsGroup title={t("settings.debug.title")}>
        <LogLevelSelector grouped={true} />
        <UpdateChecksToggle descriptionMode="tooltip" grouped={true} />
        <SoundPicker
          label={t("settings.debug.soundTheme.label")}
          description={t("settings.debug.soundTheme.description")}
        />
        <WordCorrectionThreshold descriptionMode="tooltip" grouped={true} />
        <PasteDelay descriptionMode="tooltip" grouped={true} />
        <RecordingBuffer descriptionMode="tooltip" grouped={true} />
        <AlwaysOnMicrophone descriptionMode="tooltip" grouped={true} />
        <ClamshellMicrophoneSelector descriptionMode="tooltip" grouped={true} />
      </SettingsGroup>

      <SettingsGroup title="Shortcut Diagnostics">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-text/60">
              Shows real-time global keyboard shortcut events, keydown/keyup
              transitions, active modifiers, and execution latency.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setLogs([])}>
              Clear Logs
            </Button>
          </div>

          <div className="border border-mid-gray/20 rounded-lg overflow-hidden bg-background/50 backdrop-blur-md">
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-mid-gray/20 bg-mid-gray/10 text-text/80 font-semibold">
                    <th className="p-3">Time</th>
                    <th className="p-3">Hotkey</th>
                    <th className="p-3">State</th>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mid-gray/10">
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-text/40 font-sans"
                      >
                        No hotkey events recorded yet. Press a registered hotkey
                        (e.g. Ctrl+Space) to test.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => {
                      const latencyColor =
                        log.processing_time_ms < 10
                          ? "text-emerald-500 font-semibold"
                          : log.processing_time_ms < 50
                            ? "text-amber-500 font-semibold"
                            : "text-rose-500 font-semibold";

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-mid-gray/5 transition-colors font-mono"
                        >
                          <td className="p-3 text-text/50">{log.timestamp}</td>
                          <td className="p-3 font-semibold text-logo-primary">
                            <span className="bg-logo-primary/10 px-1.5 py-0.5 rounded border border-logo-primary/20">
                              {log.hotkey_string}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                log.is_pressed
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-mid-gray/20 text-text/60 border border-mid-gray/30"
                              }`}
                            >
                              {log.is_pressed ? "Down" : "Up"}
                            </span>
                          </td>
                          <td className="p-3 text-text/80">{log.binding_id}</td>
                          <td className={`p-3 ${latencyColor}`}>
                            {log.processing_time_ms}ms
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SettingsGroup>
    </div>
  );
};
