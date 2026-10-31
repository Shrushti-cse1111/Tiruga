import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { postAi } from '../../lib/aiClient';
import { ArrowLeft, Play, Bug, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export const DevAiTestScreen: React.FC = () => {
  const navigate = useNavigate();

  // Hidden in production
  if (import.meta.env.PROD) {
    return <Navigate to="/home" replace />;
  }

  const [forceInvalid, setForceInvalid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [responseLog, setResponseLog] = useState<{
    endpoint: string;
    status: 'success' | 'error';
    latencyMs: number;
    attempts?: number;
    validationErrors?: string[];
    raw: any;
  } | null>(null);

  const runTest = async (endpoint: string, body: any) => {
    setLoading(true);
    setActiveEndpoint(endpoint);
    const start = performance.now();

    try {
      const res = await postAi(endpoint, {
        ...body,
        forceInvalid
      });

      const latencyMs = Math.round(performance.now() - start);

      setResponseLog({
        endpoint,
        status: res.ok ? 'success' : 'error',
        latencyMs,
        attempts: res.ok ? res.meta?.attempts : 2,
        validationErrors: !res.ok ? res.error?.errors || [res.error?.message] : [],
        raw: res
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      setResponseLog({
        endpoint,
        status: 'error',
        latencyMs,
        attempts: 1,
        validationErrors: [err?.message || 'Network fetch error'],
        raw: { error: err?.message || 'Client error' }
      });
    } finally {
      setLoading(false);
      setActiveEndpoint(null);
    }
  };

  return (
    <div className="min-h-screen bg-sand text-text-main p-4 max-w-2xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl bg-white/80 hover:bg-white text-deep-teal shadow-xs border border-deep-teal/10"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-deep-teal">Tiruga AI Foundation Test Bench</h1>
            <span className="text-[10px] bg-gold/20 text-deep-teal px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              DEV ONLY
            </span>
          </div>
          <p className="text-xs text-muted-text mt-0.5">
            Test Gemini API JSON validation, retry loops, error boundaries, and latency.
          </p>
        </div>
      </div>

      {/* Force Invalid Output Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-stone/20 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${forceInvalid ? 'bg-terracotta/20 text-terracotta' : 'bg-stone/20 text-muted-text'}`}>
            <Bug size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-deep-teal">Force Invalid Output (Failure Path)</div>
            <div className="text-xs text-muted-text">
              Corrupts LLM JSON output to test retry logic and AI_INVALID_OUTPUT error handling.
            </div>
          </div>
        </div>
        <button
          onClick={() => setForceInvalid(!forceInvalid)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            forceInvalid ? 'bg-terracotta' : 'bg-stone/40'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              forceInvalid ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          disabled={loading}
          onClick={() =>
            runTest('/api/ai/plan', {
              destinationId: 'hampi',
              totalDays: 2,
              travelStyle: 'Heritage & Architecture',
              interests: ['Temples', 'History']
            })
          }
          className="p-4 bg-white hover:bg-cream rounded-2xl border border-stone/20 text-left transition-all shadow-xs flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-sm text-deep-teal">1. Test Itinerary Plan</span>
            {activeEndpoint === '/api/ai/plan' ? (
              <RefreshCw size={16} className="animate-spin text-terracotta" />
            ) : (
              <Play size={16} className="text-deep-teal/60" />
            )}
          </div>
          <div className="text-xs text-muted-text">
            POST /api/ai/plan with 2-day Hampi context, schema validation & seed overwrite.
          </div>
        </button>

        <button
          disabled={loading}
          onClick={() =>
            runTest('/api/ai/phrase', {
              situation: 'Asking for the bus stop to Hampi bazaar in Hospet'
            })
          }
          className="p-4 bg-white hover:bg-cream rounded-2xl border border-stone/20 text-left transition-all shadow-xs flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-sm text-deep-teal">2. Test Kannada Phrase</span>
            {activeEndpoint === '/api/ai/phrase' ? (
              <RefreshCw size={16} className="animate-spin text-terracotta" />
            ) : (
              <Play size={16} className="text-deep-teal/60" />
            )}
          </div>
          <div className="text-xs text-muted-text">
            POST /api/ai/phrase for situational phrase generation with Kannada script.
          </div>
        </button>

        <button
          disabled={loading}
          onClick={() =>
            runTest('/api/ai/plan-b', {
              condition: 'heavy monsoon rain',
              destinationId: 'hampi'
            })
          }
          className="p-4 bg-white hover:bg-cream rounded-2xl border border-stone/20 text-left transition-all shadow-xs flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-sm text-deep-teal">3. Test Plan B Adaptation</span>
            {activeEndpoint === '/api/ai/plan-b' ? (
              <RefreshCw size={16} className="animate-spin text-terracotta" />
            ) : (
              <Play size={16} className="text-deep-teal/60" />
            )}
          </div>
          <div className="text-xs text-muted-text">
            POST /api/ai/plan-b with indoor fallback recommendations.
          </div>
        </button>

        <button
          disabled={loading}
          onClick={() =>
            runTest('/api/ai/dev-test', {
              feature: 'quick_probe'
            })
          }
          className="p-4 bg-white hover:bg-cream rounded-2xl border border-stone/20 text-left transition-all shadow-xs flex flex-col justify-between disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-sm text-deep-teal">4. Quick Validation Probe</span>
            {activeEndpoint === '/api/ai/dev-test' ? (
              <RefreshCw size={16} className="animate-spin text-terracotta" />
            ) : (
              <Play size={16} className="text-deep-teal/60" />
            )}
          </div>
          <div className="text-xs text-muted-text">
            POST /api/ai/dev-test to verify raw response & retry pipeline.
          </div>
        </button>
      </div>

      {/* Response Panel */}
      {responseLog && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone/20 animate-fade-in">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone/10">
            <div className="flex items-center space-x-2">
              {responseLog.status === 'success' ? (
                <div className="flex items-center space-x-1.5 text-mint font-bold text-sm">
                  <CheckCircle size={16} />
                  <span>Success (200 OK)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-terracotta font-bold text-sm">
                  <AlertTriangle size={16} />
                  <span>Error ({responseLog.raw?.error?.code || 'FAILED'})</span>
                </div>
              )}
              <span className="text-xs text-muted-text font-mono">[{responseLog.endpoint}]</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-muted-text">
              <div className="flex items-center space-x-1">
                <Clock size={13} />
                <span>{responseLog.latencyMs} ms</span>
              </div>
              <div>Attempts: <span className="font-bold text-deep-teal">{responseLog.attempts || 1}</span></div>
            </div>
          </div>

          {/* Validation Errors If Any */}
          {responseLog.validationErrors && responseLog.validationErrors.length > 0 && (
            <div className="bg-terracotta/10 border border-terracotta/20 rounded-xl p-3 mb-4">
              <div className="text-xs font-bold text-terracotta mb-1 flex items-center space-x-1">
                <AlertTriangle size={12} />
                <span>Validation Errors / Reasons:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-text-main/80 space-y-0.5">
                {responseLog.validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw Response JSON */}
          <div>
            <div className="text-xs font-bold text-deep-teal mb-1">Raw Output Payload:</div>
            <pre className="bg-deep-teal/5 text-deep-teal p-3 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-deep-teal/10 select-text">
              {JSON.stringify(responseLog.raw, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
