import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface AdminCredential {
  salt: string;
  hash: string;
}

interface StoredAccessCode {
  id: string;
  code: string;
  clientName: string;
  active: boolean;
  usedCount: number;
  createdAt: string;
}

interface StoredQuote {
  id: string;
  createdAt: string;
  clientName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  city: string;
  palette: string[];
  selectedElements: { name: string; category: string; price: number }[];
  estimatedTotal: number;
  notes?: string;
  discountVoucher?: string;
  status: 'nueva' | 'en_revision' | 'cotizada' | 'aprobada';
}

// Pre-configured salted scrypt credential for admin access (overridable via ADMIN_PASSCODE env var)
let claimedAdminCredential: AdminCredential | null = {
  salt: '2450ed77b6b498ff3ab1ddcbb005b9d1',
  hash: '4784728d87080db06d135d0a419c6ff92a6d5a5becc722bbc202dd65fc7b9402561812f78cfbff19999afc9f468486629caa3d1a4b310d00b044c5e2641feccb',
};

const accessCodes: StoredAccessCode[] = [
  {
    id: 'code-1',
    code: 'ELI-VIP74',
    clientName: 'Clienta VIP Pasto',
    active: true,
    usedCount: 0,
    createdAt: '2026-11-25T10:00:00Z',
  },
];

const quotesStore: StoredQuote[] = [
  {
    id: 'COT-8921',
    createdAt: '2026-11-20T14:30:00Z',
    clientName: 'Luz Marina Córdoba',
    phone: '+57 315 892 4110',
    email: 'luzmarina.c@ejemplo.com',
    eventType: 'Cumpleaños 50 – Rosas & Amarillo Pastel',
    eventDate: '2026-12-05',
    guestCount: 45,
    city: 'Pasto, Nariño',
    palette: ['#F6CFD6', '#C84673', '#F9E396'],
    selectedElements: [
      { name: 'Panel Arco Acanalado', category: 'estructuras', price: 180000 },
      { name: 'Guirnalda Orgánica Clásica', category: 'arcos', price: 260000 },
      { name: 'Cilindro Pedestal Alto', category: 'mobiliario', price: 60000 },
      { name: 'Letrero Neón Caligráfico', category: 'estructuras', price: 95000 },
    ],
    estimatedTotal: 595000,
    status: 'en_revision',
    notes: 'Desea rosas naturales en tono fucsia suave y amarillo pastel.',
  },
  {
    id: 'COT-8919',
    createdAt: '2026-11-18T09:15:00Z',
    clientName: 'Martha Lucía Cabrera',
    phone: '+57 318 702 3344',
    email: 'marthacabrera@ejemplo.com',
    eventType: 'Boda de Plata (Aniversario 25)',
    eventDate: '2026-12-19',
    guestCount: 70,
    city: 'Chachagüí, Nariño',
    palette: ['#FFFDFB', '#EB7B82', '#E6CA85'],
    selectedElements: [
      { name: 'Arco Metálico Circular Dorado', category: 'estructuras', price: 160000 },
      { name: 'Arco Orgánico Asimétrico', category: 'arcos', price: 240000 },
      { name: 'Arreglo Floral Natural & Rosas', category: 'estructuras', price: 130000 },
    ],
    estimatedTotal: 530000,
    status: 'cotizada',
  },
];

function hashPasscode(passcode: string, salt?: string): AdminCredential {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, useSalt, 64).toString('hex');
  return { salt: useSalt, hash: derived };
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function safeEqualText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function getEnvPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqualText(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso no autorizado.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Sesión expirada o inválida.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Admin auth status
  app.get('/api/admin/status', (_req, res) => {
    const envPasscode = getEnvPasscode();
    const needsSetup = !envPasscode && !claimedAdminCredential;
    res.json({
      needsSetup,
      envManaged: Boolean(envPasscode),
    });
  });

  // First-run admin password claim (only active when ADMIN_PASSCODE is unset and not yet claimed)
  app.post('/api/admin/setup', (req, res) => {
    const envPasscode = getEnvPasscode();
    if (envPasscode || claimedAdminCredential) {
      res.status(409).json({ error: 'La contraseña de administradora ya fue configurada.' });
      return;
    }
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 4) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
      return;
    }
    claimedAdminCredential = hashPasscode(passcode);
    const token = signAdminToken();
    res.status(201).json({ token });
  });

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      res.status(400).json({ error: 'Ingresa tu contraseña de administradora.' });
      return;
    }

    const envPasscode = getEnvPasscode();
    const matchesEnv = Boolean(envPasscode) && safeEqualText(passcode, envPasscode);
    const matchesClaimed = Boolean(
      claimedAdminCredential &&
        safeEqualHex(
          hashPasscode(passcode, claimedAdminCredential.salt).hash,
          claimedAdminCredential.hash
        )
    );

    if (!envPasscode && !claimedAdminCredential) {
      res.status(409).json({ error: 'Configura primero tu contraseña de administradora.' });
      return;
    }

    if (!matchesEnv && !matchesClaimed) {
      res.status(401).json({ error: 'Contraseña incorrecta.' });
      return;
    }

    res.json({ token: signAdminToken() });
  });

  // Public: verify client WhatsApp access code before unlocking simulator preview
  app.post('/api/access-codes/verify', (req, res) => {
    const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const clientName = typeof req.body?.clientName === 'string' ? req.body.clientName.trim() : '';

    if (!clientName || clientName.length < 2) {
      res.status(400).json({ valid: false, error: 'Por favor ingresa tu nombre completo.' });
      return;
    }
    if (!rawCode) {
      res.status(400).json({ valid: false, error: 'Ingresa el código recibido por WhatsApp.' });
      return;
    }

    const found = accessCodes.find(
      (c) => c.active && c.code.toUpperCase() === rawCode
    );

    if (!found) {
      res.status(403).json({
        valid: false,
        error: 'Código inválido o inactivo. Solicita un código vigente por nuestro WhatsApp.',
      });
      return;
    }

    found.usedCount += 1;
    res.json({
      valid: true,
      code: found.code,
      clientName,
    });
  });

  // Public: submit client quote from Step 5
  app.post('/api/quotes', (req, res) => {
    const body = req.body || {};
    const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!clientName || !phone || !email) {
      res.status(400).json({ error: 'Nombre, correo y WhatsApp son obligatorios.' });
      return;
    }

    const discountVoucher = `ELI10-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const newQuote: StoredQuote = {
      id: `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      clientName,
      phone,
      email,
      eventType: typeof body.eventType === 'string' ? body.eventType : 'Evento Especial',
      eventDate: typeof body.eventDate === 'string' && body.eventDate ? body.eventDate : 'A coordinar',
      guestCount: Number(body.guestCount) || 40,
      city: typeof body.city === 'string' ? body.city : 'Pasto, Nariño',
      palette: Array.isArray(body.palette) ? body.palette.slice(0, 6).map(String) : [],
      selectedElements: Array.isArray(body.selectedElements)
        ? body.selectedElements.slice(0, 50).map((el: any) => ({
            name: String(el?.name || 'Elemento'),
            category: String(el?.category || 'decoracion'),
            price: Number(el?.price) || 0,
          }))
        : [],
      estimatedTotal: Number(body.estimatedTotal) || 0,
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 400) : undefined,
      discountVoucher,
      status: 'nueva',
    };

    quotesStore.unshift(newQuote);
    res.status(201).json({ ok: true, id: newQuote.id, discountVoucher });
  });

  // Admin-only: read quotes
  app.get('/api/admin/quotes', requireAdmin, (_req, res) => {
    res.json({ quotes: quotesStore });
  });

  // Admin-only: update quote status
  app.patch('/api/admin/quotes/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const status = req.body?.status;
    const allowed = ['nueva', 'en_revision', 'cotizada', 'aprobada'];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Estado inválido.' });
      return;
    }
    const target = quotesStore.find((q) => q.id === id);
    if (!target) {
      res.status(404).json({ error: 'Cotización no encontrada.' });
      return;
    }
    target.status = status;
    res.json({ quote: target });
  });

  // Admin-only: manage WhatsApp client access codes
  app.get('/api/admin/access-codes', requireAdmin, (_req, res) => {
    res.json({ codes: accessCodes });
  });

  app.post('/api/admin/access-codes', requireAdmin, (req, res) => {
    const clientName = typeof req.body?.clientName === 'string' ? req.body.clientName.trim() : '';
    const requestedCode =
      typeof req.body?.code === 'string' && req.body.code.trim()
        ? req.body.code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
        : `ELI-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!clientName) {
      res.status(400).json({ error: 'Indica el nombre de la clienta para el código.' });
      return;
    }
    if (accessCodes.some((c) => c.code.toUpperCase() === requestedCode)) {
      res.status(409).json({ error: 'Ese código ya existe. Elige otro.' });
      return;
    }

    const item: StoredAccessCode = {
      id: `code-${Date.now()}`,
      code: requestedCode,
      clientName,
      active: true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    accessCodes.unshift(item);
    res.status(201).json({ item });
  });

  app.patch('/api/admin/access-codes/:id', requireAdmin, (req, res) => {
    const target = accessCodes.find((c) => c.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Código no encontrado.' });
      return;
    }
    target.active = typeof req.body?.active === 'boolean' ? req.body.active : !target.active;
    res.json({ item: target });
  });

  app.delete('/api/admin/access-codes/:id', requireAdmin, (req, res) => {
    const idx = accessCodes.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Código no encontrado.' });
      return;
    }
    accessCodes.splice(idx, 1);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`El Rinconcito de Eli server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
