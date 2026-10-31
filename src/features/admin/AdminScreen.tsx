import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { TopBar, Card, Button, Notice } from '../../design/components';
import { useAppStore } from '../../lib/store';
import {
  BUNDLED_REGIONS,
  BUNDLED_INTERESTS,
  BUNDLED_PLACES,
  BUNDLED_STAYS,
  BUNDLED_FOOD_SPOTS,
  BUNDLED_TRANSPORT_LEGS,
  BUNDLED_EVENTS_CLOSURES,
  BUNDLED_RULES_CONFIG
} from '../../../shared/seed';

export const AdminScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const showToast = useAppStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<'seed' | 'verify' | 'reports'>('seed');
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<string | null>(null);

  // Verification items state
  const [verifyType, setVerifyType] = useState<'places' | 'stays' | 'transport'>('places');
  const [places, setPlaces] = useState<any[]>([]);
  const [stays, setStays] = useState<any[]>([]);
  const [transport, setTransport] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Data Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Load items for verification
  useEffect(() => {
    if (!isAdmin) return;

    async function loadData() {
      setLoadingItems(true);
      try {
        const placesSnap = await getDocs(query(collection(db, 'places'), limit(100)));
        if (!placesSnap.empty) {
          setPlaces(placesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setPlaces(BUNDLED_PLACES);
        }

        const staysSnap = await getDocs(query(collection(db, 'stays'), limit(50)));
        if (!staysSnap.empty) {
          setStays(staysSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setStays(BUNDLED_STAYS);
        }

        const transportSnap = await getDocs(query(collection(db, 'transportLegs'), limit(50)));
        if (!transportSnap.empty) {
          setTransport(transportSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setTransport(BUNDLED_TRANSPORT_LEGS);
        }
      } catch (err) {
        console.warn('Admin load data note:', err);
        setPlaces(BUNDLED_PLACES);
        setStays(BUNDLED_STAYS);
        setTransport(BUNDLED_TRANSPORT_LEGS);
      } finally {
        setLoadingItems(false);
      }
    }

    loadData();
  }, [isAdmin]);

  // Load Data Reports
  useEffect(() => {
    if (!isAdmin || activeTab !== 'reports') return;

    async function loadReports() {
      setLoadingReports(true);
      try {
        const snap = await getDocs(collection(db, 'dataReports'));
        if (!snap.empty) {
          setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setReports([
            {
              id: 'rep_sample_1',
              entity: 'place',
              entityId: 'plc_virupaksha',
              note: 'Morning temple elephant Lakshmi blessing timing changed to 8:30 AM.',
              status: 'investigating',
              createdAt: '2026-10-25T08:00:00Z'
            },
            {
              id: 'rep_sample_2',
              entity: 'transport',
              entityId: 'leg_bengaluru_hampi_express',
              note: 'KSRTC non-AC bus conductor confirmed Shakti pass honored with Aadhaar copy.',
              status: 'verified',
              createdAt: '2026-10-25T11:30:00Z'
            }
          ]);
        }
      } catch (err) {
        console.warn('Reports load warning:', err);
      } finally {
        setLoadingReports(false);
      }
    }

    loadReports();
  }, [isAdmin, activeTab]);

  // Batch Seeding Routine (<= 400 operations per batch)
  const handleSeedDatabase = async () => {
    if (!isAdmin) return;
    setSeeding(true);
    setSeedProgress('Starting idempotent database seed...');

    try {
      // Helper function to commit batches safely
      const commitBatches = async (items: any[], collectionName: string) => {
        const CHUNK_SIZE = 350; // Safely below 400
        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
          const chunk = items.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          chunk.forEach((item) => {
            const ref = doc(db, collectionName, item.id);
            batch.set(ref, item, { merge: true });
          });
          await batch.commit();
        }
      };

      setSeedProgress('Seeding 5 Karnataka Regions...');
      await commitBatches(BUNDLED_REGIONS, 'regions');

      setSeedProgress('Seeding 6 Travel Interests...');
      await commitBatches(BUNDLED_INTERESTS, 'interests');

      setSeedProgress('Seeding 50+ Heritage & Nature Places...');
      await commitBatches(BUNDLED_PLACES, 'places');

      setSeedProgress('Seeding 30 Stays & Homestays...');
      await commitBatches(BUNDLED_STAYS, 'stays');

      setSeedProgress('Seeding 40 Regional Food Spots...');
      await commitBatches(BUNDLED_FOOD_SPOTS, 'foodSpots');

      setSeedProgress('Seeding 20 State Transport Legs...');
      await commitBatches(BUNDLED_TRANSPORT_LEGS, 'transportLegs');

      setSeedProgress('Seeding Seasonal Events & Closures...');
      await commitBatches(BUNDLED_EVENTS_CLOSURES, 'eventsClosures');

      setSeedProgress('Seeding Travel Rules Config documents...');
      const batchRules = writeBatch(db);
      Object.entries(BUNDLED_RULES_CONFIG).forEach(([key, val]) => {
        const ref = doc(db, 'rulesConfig', key);
        batchRules.set(ref, val as any, { merge: true });
      });
      await batchRules.commit();

      setSeedProgress('All 8 reference datasets seeded into Cloud Firestore successfully!');
      showToast('Database seeded successfully in batches <= 400 operations!');
    } catch (err: any) {
      console.error('Seed error:', err);
      setSeedProgress(`Seeding error: ${err.message || String(err)}`);
    } finally {
      setSeeding(false);
    }
  };

  // Toggle Verification Flag
  const handleToggleVerify = async (collectionName: string, id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await updateDoc(doc(db, collectionName, id), { verified: newStatus });
      if (collectionName === 'places') {
        setPlaces(prev => prev.map(p => p.id === id ? { ...p, verified: newStatus } : p));
      } else if (collectionName === 'stays') {
        setStays(prev => prev.map(s => s.id === id ? { ...s, verified: newStatus } : s));
      } else if (collectionName === 'transportLegs') {
        setTransport(prev => prev.map(t => t.id === id ? { ...t, verified: newStatus } : t));
      }
      showToast(`Item ${id} set to ${newStatus ? 'Verified' : 'Unverified'}`);
    } catch (err: any) {
      console.warn('Toggle verify error (offline preview toggle):', err);
      // Local state update fallback
      if (collectionName === 'places') {
        setPlaces(prev => prev.map(p => p.id === id ? { ...p, verified: newStatus } : p));
      }
      showToast(`Updated verified status to ${newStatus}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f4f7f3] dark:bg-[#0f1614] text-[#15231f] dark:text-[#e8f0ed] p-4">
        <TopBar title="Admin Console" onBack={() => navigate('/profile')} />
        <div className="max-w-md mx-auto pt-8 space-y-4">
          <div className="p-6 rounded-3xl bg-[#fff1c9] border border-[#f2b300]/50 text-[#543b00] dark:bg-[#383015] dark:text-[#f5c038] space-y-3">
            <div className="flex items-center gap-3">
              <ShieldAlert size={28} className="text-[#f2b300] shrink-0" />
              <div>
                <h3 className="font-bold text-base">Admin Access Restricted</h3>
                <p className="text-xs opacity-90 mt-0.5">
                  This console is restricted to authenticated administrators.
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed border-t border-[#f2b300]/30 pt-3">
              To grant admin access, the project owner adds their own Firebase UID manually in the Firebase console:
            </p>
            <div className="bg-black/10 dark:bg-black/30 p-2.5 rounded-xl font-mono text-[11px] break-all select-all">
              Path: admins/{user?.uid || '&lt;your-uid&gt;'}
            </div>
            <p className="text-[11px] opacity-80">
              Your Current UID: <span className="font-mono font-bold">{user?.uid || 'Not signed in'}</span>
            </p>
          </div>

          {/* Dev bypass toggle for local sandbox preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#172220] border border-[#dce5e1] dark:border-[#2b3c38] text-xs space-y-2">
            <span className="font-bold uppercase tracking-wider text-[#5b6c66] dark:text-[#9cb0aa] block">
              Developer Sandbox
            </span>
            <p className="text-[#5b6c66] dark:text-[#9cb0aa]">
              Enable local admin role simulation to preview seed and verification features:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('tiruga_dev_admin', 'true');
                window.location.reload();
              }}
              className="w-full"
            >
              Enable Admin Simulation (Sandbox)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredPlaces = places.filter(p =>
    (p.name?.en || p.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.regionId || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7f3] dark:bg-[#0f1614] text-[#15231f] dark:text-[#e8f0ed] p-4 pb-24">
      <TopBar title="Admin Console" onBack={() => navigate('/profile')} />

      <div className="space-y-4 pt-2">
        {/* Admin Header */}
        <div className="flex items-center justify-between bg-white dark:bg-[#172220] p-4 rounded-3xl border border-[#dce5e1] dark:border-[#2b3c38]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0e5a52]/10 dark:bg-[#5cc4b6]/10 text-[#0e5a52] dark:text-[#5cc4b6] flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Karnataka Gazette Admin</h2>
              <span className="text-[11px] text-[#5b6c66] dark:text-[#9cb0aa] block">
                UID: {user?.uid?.slice(0, 10)}... (Verified Admin)
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#ddefea] text-[#0e5a52] dark:bg-[#1a3833] dark:text-[#5cc4b6]">
            Active
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#dce5e1] dark:bg-[#202e2a] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('seed')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'seed'
                ? 'bg-white dark:bg-[#141f1c] text-[#0e5a52] dark:text-[#5cc4b6] shadow-xs'
                : 'text-[#5b6c66] dark:text-[#9cb0aa]'
            }`}
          >
            Seed Database
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'verify'
                ? 'bg-white dark:bg-[#141f1c] text-[#0e5a52] dark:text-[#5cc4b6] shadow-xs'
                : 'text-[#5b6c66] dark:text-[#9cb0aa]'
            }`}
          >
            Mark Verified
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-[#141f1c] text-[#0e5a52] dark:text-[#5cc4b6] shadow-xs'
                : 'text-[#5b6c66] dark:text-[#9cb0aa]'
            }`}
          >
            Data Reports
          </button>
        </div>

        {/* TAB 1: SEED DATABASE */}
        {activeTab === 'seed' && (
          <div className="space-y-4 animate-in fade-in">
            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-[#0e5a52] dark:text-[#5cc4b6]" />
                <h3 className="font-bold text-sm">Idempotent Batch Seeding</h3>
              </div>
              <p className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] leading-relaxed">
                Populates reference collections (<span className="font-mono">regions</span>, <span className="font-mono">interests</span>, <span className="font-mono">places</span>, <span className="font-mono">stays</span>, <span className="font-mono">foodSpots</span>, <span className="font-mono">transportLegs</span>, <span className="font-mono">eventsClosures</span>, <span className="font-mono">rulesConfig</span>) in batches of ≤ 400 operations.
              </p>

              <div className="p-3 rounded-2xl bg-[#f4f7f3] dark:bg-[#141f1c] text-xs space-y-1.5 border border-[#dce5e1] dark:border-[#2b3c38]">
                <div className="flex justify-between text-[#5b6c66] dark:text-[#9cb0aa]">
                  <span>Regions</span>
                  <span className="font-bold">{BUNDLED_REGIONS.length} records</span>
                </div>
                <div className="flex justify-between text-[#5b6c66] dark:text-[#9cb0aa]">
                  <span>Heritage & Nature Places</span>
                  <span className="font-bold">{BUNDLED_PLACES.length} records</span>
                </div>
                <div className="flex justify-between text-[#5b6c66] dark:text-[#9cb0aa]">
                  <span>Stays & Homestays</span>
                  <span className="font-bold">{BUNDLED_STAYS.length} records</span>
                </div>
                <div className="flex justify-between text-[#5b6c66] dark:text-[#9cb0aa]">
                  <span>Food Spots & Khanavalis</span>
                  <span className="font-bold">{BUNDLED_FOOD_SPOTS.length} records</span>
                </div>
                <div className="flex justify-between text-[#5b6c66] dark:text-[#9cb0aa]">
                  <span>Transport Legs & Shakti routes</span>
                  <span className="font-bold">{BUNDLED_TRANSPORT_LEGS.length} records</span>
                </div>
              </div>

              {seedProgress && (
                <div className="p-3 rounded-2xl bg-[#ddefea] dark:bg-[#1a3833] text-[#0e5a52] dark:text-[#5cc4b6] text-xs font-medium animate-pulse">
                  {seedProgress}
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="w-full font-bold"
              >
                {seeding ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Seeding Batches...
                  </span>
                ) : (
                  'Seed Database Now'
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* TAB 2: MARK VERIFIED */}
        {activeTab === 'verify' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Type selector */}
            <div className="flex gap-2">
              {(['places', 'stays', 'transport'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVerifyType(t)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                    verifyType === t
                      ? 'bg-[#0e5a52] text-white dark:bg-[#5cc4b6] dark:text-[#0f1614]'
                      : 'bg-white dark:bg-[#172220] border border-[#dce5e1] dark:border-[#2b3c38]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-[#5b6c66] dark:text-[#9cb0aa]" />
              <input
                type="text"
                placeholder="Search items to verify..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dce5e1] dark:border-[#2b3c38] bg-white dark:bg-[#172220] text-xs focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar">
              {verifyType === 'places' && filteredPlaces.map(p => (
                <div
                  key={p.id}
                  className="p-3 bg-white dark:bg-[#172220] rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#0e5a52] dark:text-[#5cc4b6]">
                      {p.category} · {p.regionId}
                    </span>
                    <h4 className="font-bold truncate text-sm">
                      {p.name?.en || p.name}
                    </h4>
                    <p className="text-[11px] text-[#5b6c66] dark:text-[#9cb0aa] truncate">
                      {p.source}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleVerify('places', p.id, !!p.verified)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      p.verified
                        ? 'bg-[#e6f4ea] text-[#137333] dark:bg-[#14321d] dark:text-[#81c995]'
                        : 'bg-black/5 dark:bg-white/5 text-[#5b6c66] dark:text-[#9cb0aa]'
                    }`}
                  >
                    {p.verified ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>{p.verified ? 'Verified' : 'Unverified'}</span>
                  </button>
                </div>
              ))}

              {verifyType === 'stays' && stays.map(s => (
                <div
                  key={s.id}
                  className="p-3 bg-white dark:bg-[#172220] rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#0e5a52] dark:text-[#5cc4b6]">
                      ₹{s.pricePerNightInr}/night · {s.regionId}
                    </span>
                    <h4 className="font-bold truncate text-sm">
                      {s.name?.en || s.name}
                    </h4>
                    <p className="text-[11px] text-[#5b6c66] dark:text-[#9cb0aa] truncate">
                      Registration: {s.registrationStatus}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleVerify('stays', s.id, !!s.verified)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      s.verified
                        ? 'bg-[#e6f4ea] text-[#137333] dark:bg-[#14321d] dark:text-[#81c995]'
                        : 'bg-black/5 dark:bg-white/5 text-[#5b6c66] dark:text-[#9cb0aa]'
                    }`}
                  >
                    {s.verified ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>{s.verified ? 'Verified' : 'Unverified'}</span>
                  </button>
                </div>
              ))}

              {verifyType === 'transport' && transport.map(t => (
                <div
                  key={t.id}
                  className="p-3 bg-white dark:bg-[#172220] rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#0e5a52] dark:text-[#5cc4b6]">
                      {t.fromName} → {t.toName} ({t.operator})
                    </span>
                    <h4 className="font-bold truncate text-sm">
                      ₹{t.fareInr} · {t.serviceClass} {t.shaktiEligible ? '(Shakti)' : ''}
                    </h4>
                    <p className="text-[11px] text-[#5b6c66] dark:text-[#9cb0aa] truncate">
                      {t.source}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleVerify('transportLegs', t.id, !!t.verified)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      t.verified
                        ? 'bg-[#e6f4ea] text-[#137333] dark:bg-[#14321d] dark:text-[#81c995]'
                        : 'bg-black/5 dark:bg-white/5 text-[#5b6c66] dark:text-[#9cb0aa]'
                    }`}
                  >
                    {t.verified ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>{t.verified ? 'Verified' : 'Unverified'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DATA REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5b6c66] dark:text-[#9cb0aa]">
                User Correction Feedback ({reports.length})
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#172220] rounded-3xl border border-[#dce5e1] dark:border-[#2b3c38] text-xs text-[#5b6c66] dark:text-[#9cb0aa]">
                No pending user correction reports.
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <Card key={r.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#0e5a52] dark:text-[#5cc4b6]">
                        {r.entity} · {r.entityId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.status === 'verified'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : r.status === 'investigating'
                            ? 'bg-[#fff1c9] text-[#b06000]'
                            : 'bg-black/5 text-[#5b6c66]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">"{r.note}"</p>
                    <div className="flex items-center justify-between text-[11px] text-[#5b6c66] dark:text-[#9cb0aa] pt-1 border-t border-[#dce5e1] dark:border-[#2b3c38]">
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            updateDoc(doc(db, 'dataReports', r.id), { status: 'verified' }).catch(() => {});
                            setReports(prev => prev.map(item => item.id === r.id ? { ...item, status: 'verified' } : item));
                            showToast('Report marked as verified');
                          }}
                          className="px-2 py-1 rounded-md bg-[#e6f4ea] text-[#137333] font-bold"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
