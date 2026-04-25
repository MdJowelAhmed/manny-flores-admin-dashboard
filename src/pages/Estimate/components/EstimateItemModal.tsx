import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common/ModalWrapper'
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
import { toast } from '@/utils/toast'
import type { EstimateListItem } from '../estimateData'
import {
  ESTIMATE_EQUIPMENT_OPTIONS,
  ESTIMATE_MATERIAL_OPTIONS,
  ESTIMATE_VEHICLE_OPTIONS,
} from '../estimateData'

interface EstimateItemModalProps {
  open: boolean
  onClose: () => void
  item: EstimateListItem | null
}

type MaterialRow = {
  id: string
  name: string
  quantity: string
  unitPrice: string
  total: string
}

type EquipmentRow = MaterialRow

type VehicleRow = {
  id: string
  name: string
  unitPrice: string
  total: string
}

type PriceExtraRow = { id: string; label: string; amount: string }

function newId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function parseNum(v: string) {
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export function EstimateItemModal({ open, onClose, item }: EstimateItemModalProps) {
  const { t } = useTranslation()

  const [people, setPeople] = useState('')
  const [laborPrice, setLaborPrice] = useState('')

  const [materials, setMaterials] = useState<MaterialRow[]>(() =>
    [0, 1, 2].map(() => ({
      id: newId(),
      name: '',
      quantity: '',
      unitPrice: '',
      total: '',
    }))
  )

  const [equipment, setEquipment] = useState<EquipmentRow[]>(() =>
    [0, 1, 2].map(() => ({
      id: newId(),
      name: '',
      quantity: '',
      unitPrice: '',
      total: '',
    }))
  )

  const [vehicles, setVehicles] = useState<VehicleRow[]>(() =>
    [0, 1, 2].map(() => ({
      id: newId(),
      name: '',
      unitPrice: '',
      total: '',
    }))
  )

  const [taxPercent, setTaxPercent] = useState('10')
  const [priceExtras, setPriceExtras] = useState<PriceExtraRow[]>([])

  const laborSubtotal = useMemo(() => {
    const p = parseNum(people)
    const r = parseNum(laborPrice)
    return p * r
  }, [people, laborPrice])

  const materialSum = useMemo(
    () => materials.reduce((s, row) => s + parseNum(row.total), 0),
    [materials]
  )

  const equipmentSum = useMemo(
    () => equipment.reduce((s, row) => s + parseNum(row.total), 0),
    [equipment]
  )

  const vehicleSum = useMemo(
    () => vehicles.reduce((s, row) => s + parseNum(row.total), 0),
    [vehicles]
  )

  const extrasSum = useMemo(
    () => priceExtras.reduce((s, row) => s + parseNum(row.amount), 0),
    [priceExtras]
  )

  const subtotalBeforeTax = useMemo(
    () => laborSubtotal + materialSum + equipmentSum + vehicleSum + extrasSum,
    [laborSubtotal, materialSum, equipmentSum, vehicleSum, extrasSum]
  )

  const taxAmount = useMemo(() => {
    const pct = parseNum(taxPercent)
    return subtotalBeforeTax * (pct / 100)
  }, [subtotalBeforeTax, taxPercent])

  const grandTotal = subtotalBeforeTax + taxAmount

  const updateMaterial = (id: string, patch: Partial<MaterialRow>) => {
    setMaterials((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if ('quantity' in patch || 'unitPrice' in patch) {
          const q = parseNum(next.quantity)
          const u = parseNum(next.unitPrice)
          next.total = (q * u).toFixed(2)
        }
        return next
      })
    )
  }

  const updateEquipment = (id: string, patch: Partial<EquipmentRow>) => {
    setEquipment((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if ('quantity' in patch || 'unitPrice' in patch) {
          const q = parseNum(next.quantity)
          const u = parseNum(next.unitPrice)
          next.total = (q * u).toFixed(2)
        }
        return next
      })
    )
  }

  const updateVehicle = (id: string, patch: Partial<VehicleRow>) => {
    setVehicles((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row
        const next = { ...row, ...patch }
        if ('unitPrice' in patch) {
          const u = parseNum(next.unitPrice)
          next.total = u.toFixed(2)
        }
        return next
      })
    )
  }

  const addMaterialRow = () => {
    setMaterials((r) => [
      ...r,
      { id: newId(), name: '', quantity: '', unitPrice: '', total: '' },
    ])
  }

  const addEquipmentRow = () => {
    setEquipment((r) => [
      ...r,
      { id: newId(), name: '', quantity: '', unitPrice: '', total: '' },
    ])
  }

  const addVehicleRow = () => {
    setVehicles((r) => [...r, { id: newId(), name: '', unitPrice: '', total: '' }])
  }

  const addPriceExtra = () => {
    setPriceExtras((r) => [...r, { id: newId(), label: '', amount: '' }])
  }

  const handleSubmit = () => {
    toast({
      title: t('estimate.toastSaved', { total: formatMoney(grandTotal) }),
      variant: 'success',
    })
    onClose()
  }

  const sectionAddButton = (onClick: () => void, ariaLabel: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md',
        'bg-primary text-white shadow-sm',
        'hover:opacity-90 transition-opacity'
      )}
    >
      <Plus className="h-5 w-5" />
    </button>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('estimate.modalTitle')}
      size="full"
      className="max-w-5xl bg-white"
      footer={
        <Button
          type="button"
          className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90"
          onClick={handleSubmit}
        >
          {t('estimate.submitEstimate')}
        </Button>
      }
    >
      <div className="space-y-8">
        {item && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t('estimate.projectLabel')}</span>{' '}
            {item.title} — {item.customerName}
          </p>
        )}

        {/* Labor */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="est-people">{t('estimate.people')}</Label>
              <Input
                id="est-people"
                inputMode="decimal"
                placeholder={t('estimate.peoplePlaceholder')}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-labor-price">{t('estimate.laborPrice')}</Label>
              <Input
                id="est-labor-price"
                inputMode="decimal"
                placeholder={t('estimate.enterPrice')}
                value={laborPrice}
                onChange={(e) => setLaborPrice(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Material */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{t('estimate.material')}</h4>
            {sectionAddButton(addMaterialRow, t('estimate.addMaterialRow'))}
          </div>
          <div className="hidden md:grid md:grid-cols-[1.2fr_0.9fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>{t('estimate.name')}</span>
            <span>{t('estimate.quantity')}</span>
            <span>{t('estimate.unitPriceSqft')}</span>
            <span>{t('estimate.totalPrice')}</span>
          </div>
          <div className="space-y-3">
            {materials.map((row) => (
              <div
                key={row.id}
                className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_1fr_1fr] md:items-end"
              >
                <div className="space-y-1.5 md:space-y-0">
                  <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                  <Select
                    value={row.name || undefined}
                    onValueChange={(v) => updateMaterial(row.id, { name: v })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder={t('estimate.selectName')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTIMATE_MATERIAL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.labelKey)}
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
                    onChange={(e) => updateMaterial(row.id, { quantity: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.unitPriceSqft')}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    value={row.unitPrice}
                    onChange={(e) => updateMaterial(row.id, { unitPrice: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.totalPrice')}</Label>
                  <Input
                    readOnly
                    value={row.total}
                    className="rounded-lg bg-muted/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{t('estimate.equipment')}</h4>
            {sectionAddButton(addEquipmentRow, t('estimate.addEquipmentRow'))}
          </div>
          <div className="hidden md:grid md:grid-cols-[1.2fr_0.9fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>{t('estimate.name')}</span>
            <span>{t('estimate.quantity')}</span>
            <span>{t('estimate.unitPriceDay')}</span>
            <span>{t('estimate.totalPrice')}</span>
          </div>
          <div className="space-y-3">
            {equipment.map((row) => (
              <div
                key={row.id}
                className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_1fr_1fr] md:items-end"
              >
                <div className="space-y-1.5 md:space-y-0">
                  <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                  <Select
                    value={row.name || undefined}
                    onValueChange={(v) => updateEquipment(row.id, { name: v })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder={t('estimate.selectName')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTIMATE_EQUIPMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.labelKey)}
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
                    onChange={(e) => updateEquipment(row.id, { quantity: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.unitPriceDay')}</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    value={row.unitPrice}
                    onChange={(e) => updateEquipment(row.id, { unitPrice: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.totalPrice')}</Label>
                  <Input
                    readOnly
                    value={row.total}
                    className="rounded-lg bg-muted/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{t('estimate.vehicle')}</h4>
            {sectionAddButton(addVehicleRow, t('estimate.addVehicleRow'))}
          </div>
          <div className="hidden md:grid md:grid-cols-[1.2fr_1fr_1fr] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>{t('estimate.name')}</span>
            <span>{t('estimate.unitPriceDay')}</span>
            <span>{t('estimate.totalPrice')}</span>
          </div>
          <div className="space-y-3">
            {vehicles.map((row) => (
              <div key={row.id} className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr] md:items-end">
                <div className="space-y-1.5 md:space-y-0">
                  <Label className="md:hidden text-xs">{t('estimate.name')}</Label>
                  <Select
                    value={row.name || undefined}
                    onValueChange={(v) => updateVehicle(row.id, { name: v })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder={t('estimate.selectName')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTIMATE_VEHICLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.labelKey)}
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
                    onChange={(e) => updateVehicle(row.id, { unitPrice: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="md:hidden text-xs">{t('estimate.totalPrice')}</Label>
                  <Input
                    readOnly
                    value={row.total}
                    className="rounded-lg bg-muted/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{t('estimate.price')}</h4>
            {sectionAddButton(addPriceExtra, t('estimate.addPriceLine'))}
          </div>
          {priceExtras.length > 0 && (
            <div className="space-y-2">
              {priceExtras.map((ex) => (
                <div key={ex.id} className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={t('estimate.extraLabelPlaceholder')}
                    value={ex.label}
                    onChange={(e) =>
                      setPriceExtras((rows) =>
                        rows.map((x) => (x.id === ex.id ? { ...x, label: e.target.value } : x))
                      )
                    }
                    className="rounded-lg"
                  />
                  <Input
                    inputMode="decimal"
                    placeholder={t('estimate.extraAmountPlaceholder')}
                    value={ex.amount}
                    onChange={(e) =>
                      setPriceExtras((rows) =>
                        rows.map((x) => (x.id === ex.id ? { ...x, amount: e.target.value } : x))
                      )
                    }
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('estimate.totalPriceSummary')}</Label>
              <Input
                readOnly
                value={formatMoney(subtotalBeforeTax)}
                className="rounded-lg bg-muted/40 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('estimate.taxOptional')}</Label>
              <Input
                inputMode="decimal"
                placeholder="10%"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('estimate.grandTotalHint', { amount: formatMoney(grandTotal) })}
            {parseNum(taxPercent) > 0 &&
              ` ${t('estimate.taxHint', { amount: formatMoney(taxAmount), pct: taxPercent })}`}
          </p>
        </div>
      </div>
    </ModalWrapper>
  )
}
