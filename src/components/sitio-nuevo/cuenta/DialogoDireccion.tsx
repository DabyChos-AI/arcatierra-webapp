'use client'

// R15 v2 · F6 (cuenta, sesión 64): el diálogo «Agregar Nueva Dirección» / «Editar Dirección» de Mi cuenta (f6/cuenta-F6.md §4). Campos,
// textos, llamadas y cuerpos de hoy (`src/app/usuario/dashboard/page.tsx:704-935`, `:201-295`) con las piezas del sitio nuevo (`ui/Dialogo`:
// foco atrapado, Escape, velo; `ui/Campo`, `ui/GrupoOpciones`, `ui/Casilla`). Cambios del plan aprobado (D-F6-11):
// - P-9: al editar la principal no se pinta la casilla «Establecer como dirección principal» y el PUT sigue mandando `es_principal: true`
//   (desmarcarla dejaba al cliente sin principal: la API guarda `es_principal` como llega, `direcciones_usuario.py:293-305`).
// - Candado contra el doble envío antes del primer `await` (hoy dos clics = dos POST); la lista se relee también después del PUT.
// - Al editar, la zona se busca en la misma lista de zonas (el día preferido se ve sin volver a elegir la zona).
// - `maxLength` de los campos = el modelo `DireccionCreate` (`direcciones_usuario.py:29-34`); sin el placeholder con dígitos «123» (D-F3-31 T-30).
// El formulario se monta al abrir: «Agregar» siempre empieza vacío.

import { useEffect, useRef, useState } from 'react'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Casilla from '@/components/sitio-nuevo/ui/Casilla'
import GrupoOpciones from '@/components/sitio-nuevo/ui/GrupoOpciones'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import { pedirZonas, type ZonaEntrega } from '@/components/sitio-nuevo/tienda/zonas'
import SelectorZonaCuenta from './SelectorZonaCuenta'
import {
  DIAS_SEMANA,
  formConBodega,
  formConZona,
  formDeDireccion,
  formVacio,
  textoErrorDireccion,
  zonaDeDireccion,
  type DireccionCuenta,
  type FormDireccion,
} from './direcciones'
import { TEXTO_ERROR_DIRECCION } from './textos'

const D = 'sn-mi-cuenta-direcciones-dialogo'
const F = 'sn-mi-cuenta-direcciones-formulario'

type Props = {
  abierto: boolean
  /** La dirección que se edita; null = agregar. */
  editando: DireccionCuenta | null
  onCerrar: () => void
  /** Después de un POST o un PUT que salió bien: relee la lista (antes de cerrar, como hoy `:213-214`). */
  onGuardada: () => Promise<void>
}

export default function DialogoDireccion({ abierto, editando, onCerrar, onGuardada }: Props) {
  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      etiquetaCerrar="Cerrar"
      titulo={editando ? 'Editar Dirección' : 'Agregar Nueva Dirección'}
      testId={D}
    >
      <FormularioDireccion editando={editando} onCerrar={onCerrar} onGuardada={onGuardada} />
    </Dialogo>
  )
}

function FormularioDireccion({ editando, onCerrar, onGuardada }: Omit<Props, 'abierto'>) {
  const [form, setForm] = useState<FormDireccion>(() => (editando ? formDeDireccion(editando) : formVacio()))
  const [zona, setZona] = useState<ZonaEntrega | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const enviando = useRef(false)
  const zonaTocada = useRef(false)
  const idZona = `${F}-zona-etiqueta`

  // Al editar: la zona de la dirección en la lista de zonas (la misma petición que usa el selector, una por carga).
  useEffect(() => {
    if (!editando) return
    let vigente = true
    pedirZonas().then((zonas) => {
      if (vigente && zonas && !zonaTocada.current) setZona(zonaDeDireccion(zonas, formDeDireccion(editando)))
    })
    return () => {
      vigente = false
    }
  }, [editando])

  const cambiar = <K extends keyof FormDireccion>(llave: K, valor: FormDireccion[K]) => setForm((f) => ({ ...f, [llave]: valor }))

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviando.current) return
    enviando.current = true
    setGuardando(true)
    setError(null)
    try {
      const respuesta = editando
        ? await fetch(`/api/direcciones/${editando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
        : await fetch('/api/direcciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
      if (respuesta.ok) {
        await onGuardada()
        onCerrar()
        return
      }
      setError(await textoErrorDireccion(respuesta))
    } catch {
      setError(TEXTO_ERROR_DIRECCION)
    } finally {
      enviando.current = false
      setGuardando(false)
    }
  }

  const esLaPrincipal = editando?.es_principal === true

  return (
    <form data-testid={F} onSubmit={guardar} className="flex flex-col gap-4">
      <Campo
        etiqueta="Nombre de la dirección *"
        requerido
        maxLength={100}
        value={form.nombre_direccion}
        onChange={(e) => cambiar('nombre_direccion', e.target.value)}
        placeholder="Ej: Casa, Oficina, Casa de mis padres"
        testId={`${F}-nombre`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Calle *"
          requerido
          maxLength={255}
          value={form.calle}
          onChange={(e) => cambiar('calle', e.target.value)}
          placeholder="Nombre de la calle"
          testId={`${F}-calle`}
        />
        <div className="grid grid-cols-2 gap-2">
          <Campo
            etiqueta="Número ext. *"
            requerido
            maxLength={20}
            value={form.numero_exterior}
            onChange={(e) => cambiar('numero_exterior', e.target.value)}
            testId={`${F}-exterior`}
          />
          <Campo
            etiqueta="Número int."
            maxLength={20}
            value={form.numero_interior}
            onChange={(e) => cambiar('numero_interior', e.target.value)}
            placeholder="A"
            testId={`${F}-interior`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p id={idZona} className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
          Zona de entrega *
        </p>
        <SelectorZonaCuenta
          zona={zona}
          idEtiqueta={idZona}
          onZona={(cp, z) => {
            zonaTocada.current = true
            setZona(z)
            setForm((f) => formConZona(f, cp, z))
          }}
          onRecogerEnMatriz={() => setForm((f) => formConBodega(f))}
        />
        {zona && (
          <AvisoEnLinea tono="exito" testId={`${F}-zona`} className="mt-1">
            ✓ {zona.colonia}, {zona.municipio}
          </AvisoEnLinea>
        )}
      </div>

      <Campo
        etiqueta="Referencias de entrega"
        tipo="textarea"
        filas={3}
        value={form.referencias}
        onChange={(e) => cambiar('referencias', e.target.value)}
        placeholder="Ej: Casa azul, portón negro, entre calles..."
        testId={`${F}-referencias`}
      />

      <div className="border-0 border-t border-solid border-sn-border pt-4">
        <Titulo nivel={3} tamano="h6">
          Preferencias
        </Titulo>
      </div>

      {zona && (
        <div className="flex flex-col gap-2">
          <GrupoOpciones
            leyenda="Día preferido de entrega"
            nombre={`${F}-dia`}
            columnas={3}
            valor={form.dia_preferido_entrega}
            onCambio={(dia) => cambiar('dia_preferido_entrega', dia)}
            opciones={DIAS_SEMANA.map((d) => ({ valor: d.llave, etiqueta: d.nombre, deshabilitada: !zona[d.llave] }))}
            testId={`${F}-dia`}
          />
          <Texto tamano="mini" peso="normal">
            Solo se muestran los días disponibles para tu zona
          </Texto>
        </div>
      )}

      <Campo
        etiqueta="Alergias o restricciones alimentarias"
        tipo="textarea"
        filas={3}
        value={form.alergias_restricciones}
        onChange={(e) => cambiar('alergias_restricciones', e.target.value)}
        placeholder="Ej: alérgico a frutos secos, vegetariano, etc."
        testId={`${F}-alergias`}
      />

      {!esLaPrincipal && (
        <Casilla checked={form.es_principal} onChange={(e) => cambiar('es_principal', e.target.checked)} testId={`${F}-principal`}>
          Establecer como dirección principal
        </Casilla>
      )}

      {error && (
        <AvisoEnLinea tono="error" testId={`${F}-error`}>
          {error}
        </AvisoEnLinea>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Boton variante="contorno" onClick={onCerrar} testId={`${F}-cancelar`}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={guardando} testId={`${F}-guardar`}>
          {editando ? 'Actualizar Dirección' : 'Guardar Dirección'}
        </Boton>
      </div>
    </form>
  )
}
