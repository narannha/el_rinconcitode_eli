import React, { useState, useEffect, useCallback } from 'react';
import { EventQuoteRequest, ShopProduct, WhatsappAccessCode } from '../../types';
import {
  X,
  Phone,
  Lock,
  KeyRound,
  Copy,
  Check,
  Plus,
  Trash2,
  Power,
  LogOut,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { BUSINESS_NAME, BUSINESS_LOGO } from '../../data/mockData';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string | null;
  onAdminLoginSuccess: (token: string) => void;
  onAdminLogout: () => void;
  onOpenSimulatorAsAdmin: () => void;
  shopProducts: ShopProduct[];
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  adminToken,
  onAdminLoginSuccess,
  onAdminLogout,
  onOpenSimulatorAsAdmin,
  shopProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'cotizaciones' | 'codigos' | 'disenos' | 'catalogo'>(
    'cotizaciones'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Auth gate state
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Server-backed admin data
  const [quotes, setQuotes] = useState<EventQuoteRequest[]>([]);
  const [codes, setCodes] = useState<WhatsappAccessCode[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dataError, setDataError] = useState('');

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/status');
      if (res.ok) {
        const data = await res.json();
        setNeedsSetup(Boolean(data.needsSetup));
      }
    } catch {
      // ignore transient check failure
    }
  }, []);

  const fetchAdminData = useCallback(async (token: string) => {
    setDataError('');
    try {
      const [qRes, cRes] = await Promise.all([
        fetch('/api/admin/quotes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/access-codes', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (qRes.status === 401 || cRes.status === 401) {
        onAdminLogout();
        return;
      }
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuotes(qData.quotes || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCodes(cData.codes || []);
      }
    } catch {
      setDataError('No se pudo conectar con el servidor.');
    }
  }, [onAdminLogout]);

  useEffect(() => {
    if (!isOpen) return;
    if (!adminToken) {
      checkStatus();
    } else {
      fetchAdminData(adminToken);
    }
  }, [isOpen, adminToken, checkStatus, fetchAdminData]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!passcodeInput.trim()) {
      setAuthError('Ingresa tu contraseña.');
      return;
    }
    if (needsSetup && passcodeInput !== confirmPasscode) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = needsSetup ? '/api/admin/setup' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'No se pudo iniciar sesión.');
        return;
      }
      setPasscodeInput('');
      setConfirmPasscode('');
      setNeedsSetup(false);
      onAdminLoginSuccess(data.token);
    } catch {
      setAuthError('Error de conexión al verificar acceso.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: EventQuoteRequest['status']) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/quotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    }
  };

  const handleCreateAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newClientName.trim()) return;
    const res = await fetch('/api/admin/access-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        clientName: newClientName.trim(),
        code: newCustomCode.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok && data.item) {
      setCodes((prev) => [data.item, ...prev]);
      setNewClientName('');
      setNewCustomCode('');
    } else if (data.error) {
      setDataError(data.error);
    }
  };

  const handleToggleCode = async (id: string, active: boolean) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/access-codes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active: !active } : c)));
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!adminToken) return;
    const res = await fetch(`/api/admin/access-codes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.ok) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCopyWhatsappInvite = (c: WhatsappAccessCode) => {
    const text = `Hola ${c.clientName} ✨ Desde ${BUSINESS_NAME} te compartimos tu código personal para desbloquear nuestro Diseñador en Realidad Aumentada:\n\n🔑 Código: *${c.code}*\n👤 Ingresa con tu nombre: *${c.clientName}*\n\n¡Nos encantará ayudarte a hacer realidad tu celebración en Pasto!`;
    navigator.clipboard?.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredQuotes = quotes.filter((q) => (statusFilter === 'all' ? true : q.status === statusFilter));

  // Unauthenticated View: Strict Admin Password Gate
  if (!adminToken) {
    return (
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#FFFDFB] rounded-3xl max-w-md w-full border border-[#F6CFD6] shadow-2xl overflow-hidden p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FCE9EC] text-[#3A2529] flex items-center justify-center hover:bg-[#F6CFD6]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#141619] border-2 border-[#F6CFD6] flex items-center justify-center overflow-hidden mb-3">
              <img src={BUSINESS_LOGO} alt={BUSINESS_NAME} className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#C84673] font-bold">
              <Lock className="w-3.5 h-3.5" />
              Acceso Exclusivo Administradora
            </div>
            <h3 className="font-serif-display text-2xl text-[#3A2529] mt-1">
              {needsSetup ? 'Configura tu Clave de Administradora' : `Panel de ${BUSINESS_NAME}`}
            </h3>
            <p className="text-xs text-[#75565C] mt-1">
              {needsSetup
                ? 'Crea tu contraseña personal para proteger tus cotizaciones y generar códigos de WhatsApp para tus clientas.'
                : 'Ingresa tu contraseña privada para ver solicitudes y administrar los códigos de acceso.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                {needsSetup ? 'Nueva Contraseña de Administradora' : 'Contraseña'}
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] focus:outline-none focus:border-[#C84673]"
                autoFocus
              />
            </div>

            {needsSetup && (
              <div>
                <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] focus:outline-none focus:border-[#C84673]"
                />
              </div>
            )}

            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {authLoading
                ? 'Verificando...'
                : needsSetup
                ? 'Guardar Contraseña y Entrar'
                : 'Ingresar al Panel Privado'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#FFFDFB] rounded-3xl max-w-4xl w-full border border-[#F6CFD6] shadow-2xl overflow-hidden flex flex-col h-[86vh]">
        <div className="p-5 md:p-6 border-b border-[#EFE2E4] flex flex-wrap items-center justify-between gap-3 bg-[#FDF5F7]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#C84673] font-semibold">
              Panel Privado · {BUSINESS_NAME}
            </div>
            <h3 className="font-serif-display text-2xl text-[#3A2529]">
              Gestión de Cotizaciones, Diseños & Códigos
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenSimulatorAsAdmin();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F9E396]" />
              Probar Simulador
            </button>
            <button
              onClick={onAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-[#FCE9EC] hover:bg-[#F6CFD6] text-[#3A2529] text-xs font-semibold flex items-center gap-1"
              title="Cerrar sesión de administradora"
            >
              <LogOut className="w-3.5 h-3.5 text-[#C84673]" />
              Salir
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FCE9EC] text-[#3A2529] flex items-center justify-center hover:bg-[#F6CFD6] text-xs font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#EFE2E4] px-6 bg-white gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'cotizaciones'
                ? 'border-[#C84673] text-[#3A2529]'
                : 'border-transparent text-[#75565C] hover:text-[#3A2529]'
            }`}
          >
            Solicitudes ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('codigos')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'codigos'
                ? 'border-[#C84673] text-[#3A2529]'
                : 'border-transparent text-[#75565C] hover:text-[#3A2529]'
            }`}
          >
            Códigos WhatsApp ({codes.length})
          </button>
          <button
            onClick={() => setActiveTab('disenos')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'disenos'
                ? 'border-[#C84673] text-[#3A2529]'
                : 'border-transparent text-[#75565C] hover:text-[#3A2529]'
            }`}
          >
            Diseños Recibidos
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'catalogo'
                ? 'border-[#C84673] text-[#3A2529]'
                : 'border-transparent text-[#75565C] hover:text-[#3A2529]'
            }`}
          >
            Catálogo ({shopProducts.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {dataError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {dataError}
            </div>
          )}

          {activeTab === 'cotizaciones' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-[#75565C]">Filtrar estado:</span>
                {(['all', 'nueva', 'en_revision', 'cotizada', 'aprobada'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-[#C84673] text-white'
                        : 'bg-[#FCE9EC] text-[#75565C] hover:bg-[#F6CFD6]'
                    }`}
                  >
                    {st === 'all' ? 'Todas' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {filteredQuotes.length === 0 ? (
                <div className="text-center py-12 text-[#75565C]">
                  <p className="text-xs">No hay cotizaciones registradas en este estado.</p>
                </div>
              ) : (
                filteredQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-[#EFE2E4] bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#C84673]">{q.id}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs font-semibold text-[#3A2529]">{q.clientName}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-[#75565C]">{q.city}</span>
                      </div>

                      <div className="text-xs text-[#3A2529] font-medium">
                        {q.eventType} ({q.eventDate})
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#75565C] pt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#C84673]" />
                          {q.phone}
                        </span>
                        <span>·</span>
                        <span>{q.selectedElements.length} elementos</span>
                        {q.discountVoucher && (
                          <>
                            <span>·</span>
                            <span className="font-mono font-bold text-[#C84673]">
                              Bono: {q.discountVoucher}
                            </span>
                          </>
                        )}
                        {q.notes && (
                          <>
                            <span>·</span>
                            <span className="italic">"{q.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#EFE2E4] pt-3 md:pt-0 md:pl-5 shrink-0">
                      <div>
                        <div className="text-[10px] text-[#75565C] uppercase">Presupuesto</div>
                        <div className="text-base font-bold font-serif-display text-[#C84673]">
                          ${q.estimatedTotal.toLocaleString('es-CO')}
                        </div>
                      </div>

                      <select
                        value={q.status}
                        onChange={(e) =>
                          handleUpdateQuoteStatus(q.id, e.target.value as EventQuoteRequest['status'])
                        }
                        className="text-xs p-2 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] font-medium"
                      >
                        <option value="nueva">Nueva</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="cotizada">Cotizada</option>
                        <option value="aprobada">Aprobada</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: WhatsApp Client Access Codes Generator */}
          {activeTab === 'codigos' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateAccessCode}
                className="p-4 rounded-2xl bg-[#FDF5F7] border border-[#F6CFD6] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                <div>
                  <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                    Nombre de la Clienta *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ej: Sra. María Fernanda"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#EFE2E4] bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                    Código (opcional, si lo dejas vacío se genera)
                  </label>
                  <input
                    type="text"
                    value={newCustomCode}
                    onChange={(e) => setNewCustomCode(e.target.value.toUpperCase())}
                    placeholder="Ej: ELI-MARIA26"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#EFE2E4] bg-white uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Crear Código WhatsApp
                </button>
              </form>

              <div className="space-y-2.5">
                {codes.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-[#EFE2E4] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FCE9EC] text-[#C84673] font-mono text-xs font-bold">
                          {c.code}
                        </span>
                        <span className="text-xs font-semibold text-[#3A2529]">{c.clientName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {c.active ? 'Activo' : 'Pausado'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#75565C] mt-1">
                        Usos registrados: {c.usedCount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyWhatsappInvite(c)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5"
                      >
                        {copiedId === c.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copiado
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-3.5 h-3.5" />
                            <Copy className="w-3 h-3" /> Copiar para WhatsApp
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleCode(c.id, c.active)}
                        className="p-2 rounded-xl bg-[#FDF5F7] hover:bg-[#FCE9EC] text-[#3A2529]"
                        title={c.active ? 'Desactivar código' : 'Activar código'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCode(c.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700"
                        title="Eliminar código"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disenos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl border border-[#EFE2E4] bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3A2529]">{q.clientName}</span>
                    <span className="text-[#C84673] font-medium">{q.eventType}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#75565C]">Paleta:</span>
                    {q.palette.map((hex, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-[#FDF5F7] text-xs space-y-1">
                    <div className="font-semibold text-[#3A2529] mb-1">Elementos:</div>
                    {q.selectedElements.map((el, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-[#75565C]">
                        <span>• {el.name}</span>
                        <span>${el.price.toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/${q.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(
                      q.clientName
                    )}!%20Te%20saludamos%20desde%20${encodeURIComponent(
                      BUSINESS_NAME
                    )}%20en%20Pasto%20con%20la%20cotizaci%C3%B3n%20de%20tu%20evento.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#25D366] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Contactar por WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'catalogo' && (
            <div className="space-y-3">
              {shopProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-[#EFE2E4] bg-white flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-[#FCE9EC]" />
                    <div>
                      <div className="text-xs font-semibold text-[#3A2529]">{p.name}</div>
                      <div className="text-[11px] text-[#75565C]">
                        {p.category} · {p.leadTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif-display font-bold text-sm text-[#C84673]">
                      ${p.price.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      Activo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
