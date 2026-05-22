import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/common/Form'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDateDayMonth } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import { useGetMaterialsQuery } from '@/redux/api/materialsApi'
import { useGetEquipmentQuery, toApiDateIso } from '@/redux/api/equipmentApi'
import { useGetVehiclesQuery } from '@/redux/api/vehiclesApi'
import type { EstimateCatalogOption, EstimateLineItem, EstimateRecord } from '../estimateData'
import { computeEstimateTotals } from '../estimateData'
import { EstimatePreviewModal } from './EstimatePreviewModal'
import { CustomerNameAutocomplete } from './CustomerNameAutocomplete'

interface AddEstimateModalProps {
  open: boolean
  onClose: () => void
  editEstimate?: EstimateRecord | null
  onCreate: (item: EstimateRecord) => Promise<void>
  onUpdate?: (item: EstimateRecord) => Promise<void>
}

type MaterialRow = {
  id: string
  catalogId: string
  name: string
  quantity: string
  unitPrice: string
}

type EquipmentRow = MaterialRow

type VehicleRow = {
  id: string
  catalogId: string
  name: string
  quantity: string
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

function emptyMaterialRow(): MaterialRow {
  return { id: makeId('mat'), catalogId: '', name: '', quantity: '', unitPrice: '' }
}

function emptyEquipmentRow(): EquipmentRow {
  return { id: makeId('eq'), catalogId: '', name: '', quantity: '', unitPrice: '' }
}

function emptyVehicleRow(): VehicleRow {
  return { id: makeId('veh'), catalogId: '', name: '', quantity: '', unitPrice: '' }
}

function pickCatalog(catalogId: string, catalog: EstimateCatalogOption[]) {
  const item = catalog.find((c) => c.id === catalogId)
  if (!item) return { catalogId: '', name: '', unitPrice: '' }
  return { catalogId, name: item.name, unitPrice: String(item.unitPrice || '') }
}

function parseIsoDate(iso?: string): Date | undefined {
  if (!iso?.trim()) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function lineToMaterialRow(line: EstimateLineItem): MaterialRow {
  return {
    id: line.id,
    catalogId: line.materialId ?? line.equipmentId ?? line.vehicleId ?? '',
    name: line.name,
    quantity: String(line.quantity),
    unitPrice: String(line.unitPrice),
  }
}

export function AddEstimateModal({
  open,
  onClose,
  editEstimate = null,
  onCreate,
  onUpdate,
}: AddEstimateModalProps) {
  const isEdit = !!editEstimate
  const { t } = useTranslation()
  const { data: materialsResponse } = useGetMaterialsQuery({ page: 1, limit: 500 })
  const { data: equipmentResponse } = useGetEquipmentQuery({ page: 1, limit: 500 })
  const { data: vehiclesResponse } = useGetVehiclesQuery({ page: 1, limit: 500 })

  const materialCatalog = useMemo(
    () =>
      (materialsResponse?.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        unitPrice: Number(item.unitPrice) || 0,
      })),
    [materialsResponse]
  )

  const equipmentCatalog = useMemo(
    () =>
      (equipmentResponse?.data ?? []).map((item) => ({
        id: item.id,
        name: item.equipmentName,
        unitPrice: Number(item.purchaseCost) || 0,
      })),
    [equipmentResponse]
  )

  const vehicleCatalog = useMemo(
    () =>
      (vehiclesResponse?.data ?? []).map((item) => ({
        id: item.id,
        name: `${item.model} (${item.year})`,
        unitPrice: Number(item.purchaseCost) || 0,
      })),
    [vehiclesResponse]
  )

  const [title, setTitle] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState('')

  const [materials, setMaterials] = useState<MaterialRow[]>(() => [emptyMaterialRow()])
  const [equipment, setEquipment] = useState<EquipmentRow[]>(() => [emptyEquipmentRow()])
  const [vehicles, setVehicles] = useState<VehicleRow[]>(() => [emptyVehicleRow()])

  const [previewDraft, setPreviewDraft] = useState<EstimateRecord | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const reset = () => {
    setTitle('')
    setCustomerName('')
    setCustomerEmail('')
    setCustomerAddress('')
    setStartDate(undefined)
    setEndDate(undefined)
    setDescription('')
    setMaterials([emptyMaterialRow()])
    setEquipment([emptyEquipmentRow()])
    setVehicles([emptyVehicleRow()])
    setPreviewDraft(null)
    setPreviewOpen(false)
  }

  const populateFromEstimate = (estimate: EstimateRecord) => {
    setTitle(estimate.title)
    setCustomerName(estimate.customerName)
    setCustomerEmail(estimate.customerEmail)
    setCustomerAddress(estimate.customerAddress)
    setStartDate(parseIsoDate(estimate.rawEstimateStartDate))
    setEndDate(parseIsoDate(estimate.rawEstimateEndDate))
    setDescription(estimate.description)

    const matRows = estimate.lineItems
      .filter((l) => l.lineType === 'material')
      .map(lineToMaterialRow)
    const eqRows = estimate.lineItems
      .filter((l) => l.lineType === 'equipment')
      .map(lineToMaterialRow)
    const vehRows = estimate.lineItems
      .filter((l) => l.lineType === 'vehicle')
      .map(lineToMaterialRow)

    setMaterials(matRows.length > 0 ? matRows : [emptyMaterialRow()])
    setEquipment(eqRows.length > 0 ? eqRows : [emptyEquipmentRow()])
    setVehicles(vehRows.length > 0 ? vehRows : [emptyVehicleRow()])
    setPreviewDraft(null)
    setPreviewOpen(false)
  }

  useEffect(() => {
    if (!open) return
    if (editEstimate) populateFromEstimate(editEstimate)
    else reset()
  }, [open, editEstimate])

  const lineItemsForCalc = useMemo((): EstimateLineItem[] => {
    const items: EstimateLineItem[] = []

    for (const row of materials) {
      if (!row.name.trim()) continue
      const quantity = toNum(row.quantity)
      const unitPrice = toNum(row.unitPrice)
      if (quantity <= 0 || unitPrice < 0) continue
      items.push({
        id: row.id,
        name: row.name.trim(),
        lineType: 'material',
        materialId: row.catalogId || undefined,
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
        equipmentId: row.catalogId || undefined,
        quantity,
        unitPrice,
      })
    }

    for (const row of vehicles) {
      if (!row.name.trim()) continue
      const quantity = toNum(row.quantity)
      const unitPrice = toNum(row.unitPrice)
      if (quantity <= 0 || unitPrice <= 0) continue
      items.push({
        id: row.id,
        name: row.name.trim(),
        lineType: 'vehicle',
        vehicleId: row.catalogId || undefined,
        quantity,
        unitPrice,
      })
    }

    return items
  }, [materials, equipment, vehicles])

  const totals = useMemo(
    () =>
      computeEstimateTotals({
        lineItems: lineItemsForCalc,
        taxPercent: 0,
        discount: null,
      }),
    [lineItemsForCalc]
  )

  const buildRecord = (): EstimateRecord | null => {
    if (!title.trim() || !customerName.trim() || lineItemsForCalc.length === 0) return null
    return {
      id: editEstimate?.id ?? makeId('est'),
      title: title.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerAddress: customerAddress.trim(),
      deadlineFrom: startDate ? formatDateDayMonth(startDate) : '—',
      deadlineTo: endDate ? formatDateDayMonth(endDate) : '—',
      location: customerAddress.trim() || '—',
      paymentMethod: '—',
      description: description.trim(),
      status: 'pending',
      projectStatus: 'PENDING',
      lineItems: lineItemsForCalc,
      taxPercent: 0,
      discount: null,
      rawEstimateStartDate: startDate ? toApiDateIso(startDate) : undefined,
      rawEstimateEndDate: endDate ? toApiDateIso(endDate) : undefined,
    }
  }

  const validate = (): string | null => {
    if (!title.trim()) return t('estimate.validation.projectName')
    if (!customerName.trim()) return t('estimate.validation.customerName')
    if (lineItemsForCalc.length === 0) return t('estimate.validation.lineItems')
    if (!startDate) return t('estimate.validation.startDate')
    if (!endDate) return t('estimate.validation.endDate')
    if (startDate && endDate && startDate > endDate) return t('estimate.validation.endAfterStart')
    return null
  }

  const sectionAddButton = (onClick: () => void, ariaLabel: string) => (
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

  const openPreview = () => {
    const err = validate()
    if (err) {
      toast({ title: t('common.error'), description: err, variant: 'destructive' })
      return
    }
    const draft = buildRecord()
    if (!draft) return
    setPreviewDraft(draft)
    setPreviewOpen(true)
  }

  const handleSave = async () => {
    const err = validate()
    if (err) {
      toast({ title: t('common.error'), description: err, variant: 'destructive' })
      return
    }
    const record = buildRecord()
    if (!record) return
    try {
      if (isEdit && onUpdate) {
        await onUpdate(record)
        toast({
          title: t('estimate.updatedSuccess', 'Estimate updated'),
          description: t('estimate.grandTotalHint', { amount: formatCurrency(totals.balanceDue) }),
          variant: 'success',
        })
      } else {
        await onCreate(record)
        toast({
          title: t('estimate.createdSuccess'),
          description: t('estimate.grandTotalHint', { amount: formatCurrency(totals.balanceDue) }),
          variant: 'success',
        })
      }
      reset()
      onClose()
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? t('common.somethingWentWrong')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  return (
    <>
      <ModalWrapper
        open={open}
        onClose={() => {
          reset()
          onClose()
        }}
        title={isEdit ? t('estimate.editModalTitle', 'Edit estimate') : t('estimate.addModalTitle')}
        description={
          isEdit ? t('estimate.editModalDescription', 'Update estimate details.') : t('estimate.addModalDescription')
        }
        size="full"
        className="max-w-4xl bg-white"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('estimate.preview.balanceDue')}:{' '}
              <span className="font-semibold text-primary tabular-nums">
                {formatCurrency(totals.balanceDue)}
              </span>
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('estimate.addCancel')}
              </Button>
              <Button type="button" variant="outline" onClick={openPreview}>
                {t('estimate.preview.open')}
              </Button>
              <Button
                type="button"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleSave}
              >
                {isEdit ? t('common.save', 'Save') : t('estimate.addSubmit')}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="est-title">{t('estimate.form.projectName')}</Label>
              <Input
                id="est-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('estimate.form.projectNamePlaceholder')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-customer">{t('estimate.form.customerName')}</Label>
              <CustomerNameAutocomplete
                id="est-customer"
                value={customerName}
                onChange={setCustomerName}
                onSelect={(customer) => {
                  setCustomerName(customer.name)
                  setCustomerEmail(customer.email)
                  setCustomerAddress(customer.address)
                }}
                placeholder={t('estimate.form.customerNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-email">{t('estimate.form.customerEmail')}</Label>
              <Input
                id="est-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t('estimate.form.customerEmailPlaceholder')}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="est-address">{t('estimate.form.customerAddress')}</Label>
              <Input
                id="est-address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder={t('estimate.form.customerAddressPlaceholder')}
                className="rounded-lg"
              />
            </div>
            <DatePicker
              id="est-start"
              label={t('estimate.form.startDate')}
              value={startDate}
              onChange={setStartDate}
              placeholder={t('estimate.form.startDatePlaceholder')}
              className="w-full"
            />
            <DatePicker
              id="est-end"
              label={t('estimate.form.endDate')}
              value={endDate}
              onChange={setEndDate}
              placeholder={t('estimate.form.endDatePlaceholder')}
              className="w-full"
            />
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="est-desc">{t('estimate.form.description')}</Label>
              <Textarea
                id="est-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('estimate.form.descriptionPlaceholder')}
                rows={2}
                className="rounded-lg resize-none"
              />
            </div>
          </div>

          {/* Material */}
          <CatalogSection
            title={t('estimate.material')}
            addLabel={t('estimate.addMaterialRow')}
            onAdd={() => setMaterials((r) => [...r, emptyMaterialRow()])}
            headerCols={
              materials.length > 1
                ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
                : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
            }
            rowCols={
              materials.length > 1
                ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
                : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
            }
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
            sectionAddButton={sectionAddButton}
            t={t}
          />

          {/* Equipment */}
          <CatalogSection
            title={t('estimate.equipment')}
            addLabel={t('estimate.addEquipmentRow')}
            onAdd={() => setEquipment((r) => [...r, emptyEquipmentRow()])}
            headerCols={
              equipment.length > 1
                ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
                : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
            }
            rowCols={
              equipment.length > 1
                ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
                : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
            }
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
            sectionAddButton={sectionAddButton}
            t={t}
          />

          {/* Vehicle */}
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
            onQuantityChange={(id, quantity) =>
              setVehicles((rows) => rows.map((r) => (r.id === id ? { ...r, quantity } : r)))
            }
            onUnitPriceChange={(id, unitPrice) =>
              setVehicles((rows) => rows.map((r) => (r.id === id ? { ...r, unitPrice } : r)))
            }
            sectionAddButton={sectionAddButton}
            t={t}
          />

          <div className="flex items-center justify-end gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <Label className="text-sm font-semibold text-gray-700">
              {t('estimate.preview.subtotal')}
            </Label>
            <span className="text-base font-bold tabular-nums text-primary">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
        </div>
      </ModalWrapper>

      <EstimatePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        estimate={previewDraft}
        readOnly
      />
    </>
  )
}

/* --- Section subcomponents (inline to keep one file) --- */

type SectionAddButton = (onClick: () => void, ariaLabel: string) => React.ReactNode

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
  sectionAddButton,
  t,
}: {
  title: string
  addLabel: string
  onAdd: () => void
  headerCols: string
  rowCols: string
  headers: React.ReactNode
  rows: MaterialRow[]
  catalog: EstimateCatalogOption[]
  showQuantity: boolean
  unitPriceLabel: string
  onRemove: (id: string) => void
  onCatalogChange: (id: string, catalogId: string) => void
  onQuantityChange: (id: string, quantity: string) => void
  onUnitPriceChange: (id: string, unitPrice: string) => void
  sectionAddButton: SectionAddButton
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
                <Select
                  value={row.catalogId || undefined}
                  onValueChange={(v) => onCatalogChange(row.id, v)}
                >
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
  onQuantityChange,
  onUnitPriceChange,
  sectionAddButton,
  t,
}: {
  title: string
  addLabel: string
  onAdd: () => void
  rows: VehicleRow[]
  catalog: EstimateCatalogOption[]
  onRemove: (id: string) => void
  onCatalogChange: (id: string, catalogId: string) => void
  onQuantityChange: (id: string, quantity: string) => void
  onUnitPriceChange: (id: string, unitPrice: string) => void
  sectionAddButton: SectionAddButton
  t: (key: string) => string
}) {
  const headerCols =
    rows.length > 1
      ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
      : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'
  const rowCols =
    rows.length > 1
      ? 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr_44px]'
      : 'md:grid-cols-[1.2fr_0.9fr_1fr_1fr]'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {sectionAddButton(onAdd, addLabel)}
      </div>
      <div className={cn('hidden md:grid gap-2 text-xs font-medium text-muted-foreground px-1', headerCols)}>
        <span>{t('estimate.name')}</span>
        <span>{t('estimate.quantity')}</span>
        <span>{t('estimate.unitPriceDay')}</span>
        <span>{t('estimate.totalPrice')}</span>
        {rows.length > 1 && <span className="sr-only">{t('estimate.removeRow')}</span>}
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const lineTotal = toNum(row.quantity) * toNum(row.unitPrice)
          return (
            <div key={row.id} className={cn('grid gap-3 md:items-end', rowCols)}>
              <div className="space-y-1.5 md:space-y-0">
                <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                <Select
                  value={row.catalogId || undefined}
                  onValueChange={(v) => onCatalogChange(row.id, v)}
                >
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
                <Label className="md:hidden text-xs">{t('estimate.quantity')}</Label>
                <Input
                  inputMode="decimal"
                  placeholder="0"
                  value={row.quantity}
                  onChange={(e) => onQuantityChange(row.id, e.target.value)}
                  className="rounded-lg"
                />
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
