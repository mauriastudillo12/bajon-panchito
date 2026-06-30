const SUPABASE_URL = 'https://yiyuylkpntmnskajtloj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpeXV5bGtwbnRtbnNrYWp0bG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzkzOTUsImV4cCI6MjA5NzExNTM5NX0.X4ofAcHUB119Flei21h1jFd2Q5EUNwIZYZOFuMp34g4';

/* Dev-only logger — silenced in production */
function log(...args) {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '') {
    console.log('[Panchito]', ...args);
  }
}

let db;
try {
  const { createClient } = supabase;
  db = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  log('Error inicializando Supabase: ' + e);
}

const _VALID_ORIGENES = ['web', 'presencial', 'whatsapp'];

async function insertPedido(data) {
  /* ── 1. cliente_nombre ── */
  const nombre = String(data.cliente_nombre || '').replace(/[<>]/g, '').trim();
  if (!nombre)          return { ok: false, error: 'Nombre requerido' };
  if (nombre.length > 60) return { ok: false, error: 'Nombre demasiado largo' };

  /* ── 2. cliente_telefono ── */
  const telefono = data.cliente_telefono
    ? String(data.cliente_telefono).trim()
    : null;
  if (telefono && !/^[0-9\s\-\+]{1,20}$/.test(telefono))
    return { ok: false, error: 'Teléfono inválido' };

  /* ── 3. items ── */
  if (!Array.isArray(data.items) || data.items.length === 0)
    return { ok: false, error: 'Se requiere al menos un producto' };
  for (const it of data.items) {
    if (typeof it.nombre !== 'string' || !it.nombre.trim())
      return { ok: false, error: 'Item sin nombre' };
    if (!Number.isInteger(it.cantidad) || it.cantidad < 1 || it.cantidad > 99)
      return { ok: false, error: 'Cantidad inválida en item' };
    if (typeof it.precio !== 'number' || it.precio <= 0)
      return { ok: false, error: 'Precio inválido en item' };
  }

  /* ── 4. total — debe coincidir con la suma de items ── */
  if (typeof data.total !== 'number' || data.total <= 0)
    return { ok: false, error: 'Total inválido' };
  const computed = data.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  if (Math.round(computed) !== Math.round(data.total))
    return { ok: false, error: 'Total no coincide con los productos' };

  /* ── 5. comentario ── */
  const comentario = data.comentario
    ? String(data.comentario).replace(/[<>]/g, '').trim().slice(0, 300)
    : null;

  /* ── 6. origen ── */
  if (!_VALID_ORIGENES.includes(data.origen))
    return { ok: false, error: 'Origen inválido' };

  /* ── INSERT (estado omitido — Supabase lo inicializa como 'pendiente') ── */
  try {
    const payload = {
      cliente_nombre:   nombre,
      cliente_telefono: telefono,
      items:            data.items,
      total:            data.total,
      origen:           data.origen,
      comentario,
    };
    console.error('OBJETO A INSERTAR:', JSON.stringify(payload, null, 2));
    const { data: resData, error } = await db.from('pedidos').insert(payload);
    console.error('RESULTADO:', JSON.stringify({ data: resData, error }, null, 2));
    if (error) {
      console.error('insertPedido error:', error.message, error.code, error.details, error.hint);
      return { ok: false, error: 'Error al guardar el pedido' };
    }
    return { ok: true };
  } catch (e) {
    console.error('insertPedido exception:', e);
    return { ok: false, error: 'Error de conexión' };
  }
}
