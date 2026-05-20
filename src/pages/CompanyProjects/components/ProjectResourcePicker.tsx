import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import type { ProjectLineItem } from '@/types'
import type { EstimateCatalogOption } from '@/pages/Estimate/estimateData'
import {
  getEstimateEquipmentCatalog,
  getEstimateMaterialCatalog,
  getEstimateVehicleCatalog,
} from '@/pages/Estimate/estimateData'

type CatalogRow = {
  id: string
  catalogId: string
  name: string
  quantity: string
  unitPrice: string
}

type VehicleRow = {
  id: string
  catalogId: string
  name: string
  unitPrice: string
}

function makeId(prefix: string) {
  const cryptoAny = crypto as unknown as { randomUUID?: () => string }
  return cryptoAny?.randomUUID
    ? `${prefix}-${cryptoAny.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toNum(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function emptyCatalogRow(prefix: string): CatalogRow {
  return { id: makeId(prefix), catalogId: '', name: '', quantity: '', unitPrice: '' }
}

function emptyVehicleRow(): VehicleRow {
  return { id: makeId('veh'), catalogId: '', name: '', unitPrice: '' }
}

function pickCatalog(catalogId: string, catalog: EstimateCatalogOption[]) {
  const item = catalog.find((c) => c.id === catalogId)
  if (!item) return { catalogId: '', name: '', unitPrice: '' }
  return { catalogId, name: item.name, unitPrice: String(item.unitPrice || '') }
}

function rowsFromLineItems(
  items: ProjectLineItem[],
  type: ProjectLineItem['lineType'],
  empty: () => CatalogRow | VehicleRow
): CatalogRow[] | VehicleRow[] {
  const filtered = items.filter((i) => i.lineType === type)
  if (filtered.length === 0) return [empty() as CatalogRow]
  if (type === 'vehicle') {
    return filtered.map((i) => ({
      id: i.id,
      catalogId: i.catalogId ?? '',
      name: i.name,
      unitPrice: String(i.unitPrice),
    })) as VehicleRow[]
  }
  return filtered.map((i) => ({
    id: i.id,
    catalogId: i.catalogId ?? '',
    name: i.name,
    quantity: String(i.quantity),
    unitPrice: String(i.unitPrice),
  })) as CatalogRow[]
}

function buildLineItems(
  materials: CatalogRow[],
  equipment: CatalogRow[],
  vehicles: VehicleRow[]
): ProjectLineItem[] {
  const items: ProjectLineItem[] = []

  for (const row of materials) {
    if (!row.name.trim()) continue
    const quantity = toNum(row.quantity)
    const unitPrice = toNum(row.unitPrice)
    if (quantity <= 0 || unitPrice < 0) continue
    items.push({
      id: row.id,
      name: row.name.trim(),
      lineType: 'material',
      catalogId: row.catalogId || undefined,
      quantity,
      unitPrice,
    })
  }

  for (const row of equipment) {
    if (!row.name.trim()) continue
    const quantity = toNum(row.quantity)
    const unitPrice = toNum(row.unitPrice)
    if (quantity <= 0 || unitPrice < 0) continue
    items.push({
      id: row.id,
      name: row.name.trim(),
      lineType: 'equipment',
      catalogId: row.catalogId || undefined,
      quantity,
      unitPrice,
    })
  }

  for (const row of vehicles) {
    if (!row.name.trim()) continue
    const unitPrice = toNum(row.unitPrice)
    if (unitPrice <= 0) continue
    items.push({
      id: row.id,
      name: row.name.trim(),
      lineType: 'vehicle',
      catalogId: row.catalogId || undefined,
      quantity: 1,
      unitPrice,
    })
  }

  return items
}

type SectionAddButton = (onClick: () => void, ariaLabel: string) => React.ReactNode

function sectionAddButton(onClick: () => void, ariaLabel: string) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
        'bg-[#00AB41] text-white shadow-sm hover:bg-[#009638] transition-opacity'
      )}
    >
      <Plus className="h-5 w-5" />
    </button>
  )
}

function CatalogSection({
  title,
  addLabel,
  onAdd,
  headerCols,
  rowCols,
  headers,
  rows,
  catalog,
  showQuantity,
  unitPriceLabel,
  onRemove,
  onCatalogChange,
  onQuantityChange,
  onUnitPriceChange,
  t,
}: {
  title: string
  addLabel: string
  onAdd: () => void
  headerCols: string
  rowCols: string
  headers: React.ReactNode
  rows: CatalogRow[]
  catalog: EstimateCatalogOption[]
  showQuantity: boolean
  unitPriceLabel: string
  onRemove: (id: string) => void
  onCatalogChange: (id: string, catalogId: string) => void
  onQuantityChange: (id: string, quantity: string) => void
  onUnitPriceChange: (id: string, unitPrice: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {sectionAddButton(onAdd, addLabel)}
      </div>
      <div className={cn('hidden md:grid gap-2 text-xs font-medium text-muted-foreground px-1', headerCols)}>
        {headers}
        {rows.length > 1 && <span className="sr-only">{t('estimate.removeRow')}</span>}
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const lineTotal = toNum(row.quantity) * toNum(row.unitPrice)
          return (
            <div key={row.id} className={cn('grid gap-3 md:items-end', rowCols)}>
              <div className="space-y-1.5 md:space-y-0">
                <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                <Select value={row.catalogId || undefined} onValueChange={(v) => onCatalogChange(row.id, v)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={t('estimate.selectName')} />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showQuantity && (
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.quantity')}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    value={row.quantity}
                    onChange={(e) => onQuantityChange(row.id, e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="md:hidden text-xs">{unitPriceLabel}</Label>
                <Input
                  inputMode="decimal"
                  placeholder="0"
                  value={row.unitPrice}
                  onChange={(e) => onUnitPriceChange(row.id, e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="md:hidden text-xs">{t('estimate.totalPrice')}</Label>
                <Input
                  readOnly
                  value={lineTotal > 0 ? lineTotal.toFixed(2) : ''}
                  className="rounded-lg bg-muted/40 tabular-nums"
                />
              </div>
              {rows.length > 1 && (
                <div className="flex justify-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(row.id)}
                    aria-label={t('estimate.removeRow')}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VehicleSection({
  title,
  addLabel,
  onAdd,
  rows,
  catalog,
  onRemove,
  onCatalogChange,
  onUnitPriceChange,
  t,
}: {
  title: string
  addLabel: string
  onAdd: () => void
  rows: VehicleRow[]
  catalog: EstimateCatalogOption[]
  onRemove: (id: string) => void
  onCatalogChange: (id: string, catalogId: string) => void
  onUnitPriceChange: (id: string, unitPrice: string) => void
  t: (key: string) => string
}) {
  const headerCols =
    rows.length > 1 ? 'md:grid-cols-[1.2fr_1fr_1fr_44px]' : 'md:grid-cols-[1.2fr_1fr_1fr]'
  const rowCols =
    rows.length > 1 ? 'md:grid-cols-[1.2fr_1fr_1fr_44px]' : 'md:grid-cols-[1.2fr_1fr_1fr]'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {sectionAddButton(onAdd, addLabel)}
      </div>
      <div className={cn('hidden md:grid gap-2 text-xs font-medium text-muted-foreground px-1', headerCols)}>
        <span>{t('estimate.name')}</span>
        <span>{t('estimate.unitPriceDay')}</span>
        <span>{t('estimate.totalPrice')}</span>
        {rows.length > 1 && <span className="sr-only">{t('estimate.removeRow')}</span>}
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const lineTotal = toNum(row.unitPrice)
          return (
            <div key={row.id} className={cn('grid gap-3 md:items-end', rowCols)}>
              <div className="space-y-1.5 md:space-y-0">
                <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                <Select value={row.catalogId || undefined} onValueChange={(v) => onCatalogChange(row.id, v)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={t('estimate.selectName')} />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="md:hidden text-xs">{t('estimate.unitPriceDay')}</Label>
                <Input
                  inputMode="decimal"
                  placeholder="0"
                  value={row.unitPrice}
                  onChange={(e) => onUnitPriceChange(row.id, e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="md:hidden text-xs">{t('estimate.totalPrice')}</Label>
                <Input
                  readOnly
                  value={lineTotal > 0 ? lineTotal.toFixed(2) : ''}
                  className="rounded-lg bg-muted/40 tabular-nums"
                />
              </div>
              {rows.length > 1 && (
                <div className="flex justify-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(row.id)}
                    aria-label={t('estimate.removeRow')}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type ProjectResourcePickerHandle = {
  getLineItems: () => ProjectLineItem[]
}

interface ProjectResourcePickerProps {
  open: boolean
  resetKey?: string
  initialLineItems?: ProjectLineItem[]
}

export const ProjectResourcePicker = forwardRef<ProjectResourcePickerHandle, ProjectResourcePickerProps>(
  function ProjectResourcePicker({ open, resetKey, initialLineItems = [] }, ref) {
  const { t } = useTranslation()
  const materialCatalog = useMemo(() => getEstimateMaterialCatalog(), [])
  const equipmentCatalog = useMemo(() => getEstimateEquipmentCatalog(), [])
  const vehicleCatalog = useMemo(() => getEstimateVehicleCatalog(), [])

  const [materials, setMaterials] = useState<CatalogRow[]>(() => [emptyCatalogRow('mat')])
  const [equipment, setEquipment] = useState<CatalogRow[]>(() => [emptyCatalogRow('eq')])
  const [vehicles, setVehicles] = useState<VehicleRow[]>(() => [emptyVehicleRow()])

  useImperativeHandle(ref, () => ({
    getLineItems: () => buildLineItems(materials, equipment, vehicles),
  }))

  useEffect(() => {
    if (!open) return
    const items = initialLineItems ?? []
    setMaterials(rowsFromLineItems(items, 'material', () => emptyCatalogRow('mat')) as CatalogRow[])
    setEquipment(rowsFromLineItems(items, 'equipment', () => emptyCatalogRow('eq')) as CatalogRow[])
    setVehicles(rowsFromLineItems(items, 'vehicle', () => emptyVehicleRow()) as VehicleRow[])
  }, [open, resetKey, initialLineItems])

  const matCols =
    materials.length > 1
      ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
      : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
  const eqCols =
    equipment.length > 1
      ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
      : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'

  return (
    <div className="space-y-8">
      <h3 className="text-sm font-semibold text-foreground">{t('companyProjects.resourcesSection')}</h3>

      <CatalogSection
        title={t('estimate.material')}
        addLabel={t('estimate.addMaterialRow')}
        onAdd={() => setMaterials((r) => [...r, emptyCatalogRow('mat')])}
        headerCols={matCols}
        rowCols={matCols}
        headers={
          <>
            <span>{t('estimate.name')}</span>
            <span>{t('estimate.quantity')}</span>
            <span>{t('estimate.unitPriceSqft')}</span>
            <span>{t('estimate.totalPrice')}</span>
          </>
        }
        rows={materials}
        catalog={materialCatalog}
        showQuantity
        unitPriceLabel={t('estimate.unitPriceSqft')}
        onRemove={(id) => setMaterials((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)))}
        onCatalogChange={(id, catalogId) =>
          setMaterials((rows) =>
            rows.map((r) => (r.id === id ? { ...r, ...pickCatalog(catalogId, materialCatalog) } : r))
          )
        }
        onQuantityChange={(id, quantity) =>
          setMaterials((rows) => rows.map((r) => (r.id === id ? { ...r, quantity } : r)))
        }
        onUnitPriceChange={(id, unitPrice) =>
          setMaterials((rows) => rows.map((r) => (r.id === id ? { ...r, unitPrice } : r)))
        }
        t={t}
      />

      <CatalogSection
        title={t('estimate.equipment')}
        addLabel={t('estimate.addEquipmentRow')}
        onAdd={() => setEquipment((r) => [...r, emptyCatalogRow('eq')])}
        headerCols={eqCols}
        rowCols={eqCols}
        headers={
          <>
            <span>{t('estimate.name')}</span>
            <span>{t('estimate.quantity')}</span>
            <span>{t('estimate.unitPriceDay')}</span>
            <span>{t('estimate.totalPrice')}</span>
          </>
        }
        rows={equipment}
        catalog={equipmentCatalog}
        showQuantity
        unitPriceLabel={t('estimate.unitPriceDay')}
        onRemove={(id) => setEquipment((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)))}
        onCatalogChange={(id, catalogId) =>
          setEquipment((rows) =>
            rows.map((r) => (r.id === id ? { ...r, ...pickCatalog(catalogId, equipmentCatalog) } : r))
          )
        }
        onQuantityChange={(id, quantity) =>
          setEquipment((rows) => rows.map((r) => (r.id === id ? { ...r, quantity } : r)))
        }
        onUnitPriceChange={(id, unitPrice) =>
          setEquipment((rows) => rows.map((r) => (r.id === id ? { ...r, unitPrice } : r)))
        }
        t={t}
      />

      <VehicleSection
        title={t('estimate.vehicle')}
        addLabel={t('estimate.addVehicleRow')}
        onAdd={() => setVehicles((r) => [...r, emptyVehicleRow()])}
        rows={vehicles}
        catalog={vehicleCatalog}
        onRemove={(id) => setVehicles((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)))}
        onCatalogChange={(id, catalogId) =>
          setVehicles((rows) =>
            rows.map((r) => (r.id === id ? { ...r, ...pickCatalog(catalogId, vehicleCatalog) } : r))
          )
        }
        onUnitPriceChange={(id, unitPrice) =>
          setVehicles((rows) => rows.map((r) => (r.id === id ? { ...r, unitPrice } : r)))
        }
        t={t}
      />
    </div>
  )
  }
)
