import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { AgentRun } from '../../../shared/types';

export const AgentActivitySheet: React.FC<{ runs: AgentRun[] }> = ({ runs }) => {
  const { t } = useTranslation();
  const isOpen = useAppStore((s) => s.isAgentRunsOpen);
  const setIsOpen = useAppStore((s) => s.setAgentRunsOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Agent Pipeline Activity Log"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
    >
      <div className="bg-white dark:bg-[#172220] w-full max-w-[420px] max-h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#dce5e1] dark:border-[#2b3c38] flex items-center justify-between bg-[#f4f7f3] dark:bg-[#141f1c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0e5a52] text-white flex items-center justify-center dark:bg-[#5cc4b6] dark:text-[#0f1614]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#15231f] dark:text-[#e8f0ed]">
                {t('plan.agent_activity')}
              </h2>
              <span className="text-xs text-[#5b6c66] dark:text-[#9cb0aa]">
                {t('plan.agent_activity_sub')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Agent Activity"
            className="p-2 rounded-xl text-[#5b6c66] hover:bg-black/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* List of Agent Runs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {runs.map((run, idx) => (
            <div
              key={run.id || idx}
              className="p-3.5 rounded-2xl bg-[#f4f7f3] dark:bg-[#141f1c] border border-[#dce5e1] dark:border-[#2b3c38]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#0e5a52] dark:text-[#5cc4b6]" />
                  <span className="font-bold text-sm text-[#15231f] dark:text-[#e8f0ed]">
                    {run.agent}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#5b6c66] dark:text-[#9cb0aa]">
                  <Clock size={12} />
                  <span>{run.duration_ms}ms</span>
                </div>
              </div>
              <p className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] mb-1">
                <strong className="text-[#15231f] dark:text-white">Input:</strong> {run.input_summary}
              </p>
              <p className="text-xs text-[#0e5a52] dark:text-[#5cc4b6] font-medium">
                <strong>Result:</strong> {run.output_summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
