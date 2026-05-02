import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type {
  DriverOption,
  Material,
  MaterialOrderLineInput,
  MaterialOrderSubmitPayload,
} from '../manageMaterialsData'
import { getAvailableStock } from '../manageMaterialsData'
import { toast } from '@/utils/toast'

export interface MaterialOrderModalProps {
  open: boolean
  onClose: () => void
  materials: Material[]
  drivers: DriverOption[]
  onSubmit: (payload: MaterialOrderSubmitPayload) => void
}

type LineRow = {
  key: string
  materialId: string
  quantity: string
}

function createEmptyRow(): LineRow {
  return {
    key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    materialId: '',
    quantity: '',
  }
}

export function MaterialOrderModal({
  open,
  onClose,
  materials,
  drivers,
  onSubmit,
}: MaterialOrderModalProps) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<LineRow[]>([createEmptyRow()])
  const [driverId, setDriverId] = useState('')

  useEffect(() => {
    if (!open) return
    setRows([createEmptyRow()])
    setDriverId('')
  }, [open])

  const materialById = useMemo(() => {
    const m = new Map<string, Material>()
    for (const mat of materials) m.set(mat.id, mat)
    return m
  }, [materials])

  const updateRow = (key: string, patch: Partial<LineRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()])

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materials.length) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.noMaterialsForOrder'),
        variant: 'destructive',
      })
      return
    }
    if (!drivers.length) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.noDrivers'),
        variant: 'destructive',
      })
      return
    }
    if (!driverId) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.driverRequired'),
        variant: 'destructive',
      })
      return
    }

    const lines: MaterialOrderLineInput[] = []
    for (const row of rows) {
      const qty = parseInt(row.quantity, 10)
      if (!row.materialId || !Number.isFinite(qty) || qty < 1) {
        toast({
          title: t('common.error'),
          description: t('manageMaterials.orderLineInvalid'),
          variant: 'destructive',
        })
        return
      }
      const mat = materialById.get(row.materialId)
      if (mat && qty > getAvailableStock(mat)) {
        toast({
          title: t('common.error'),
          description: t('manageMaterials.quantityExceedsStock', {
            name: mat.materialName,
          }),
          variant: 'destructive',
        })
        return
      }
      lines.push({
        materialId: row.materialId,
        quantity: qty,
      })
    }

    onSubmit({ driverId, lines })
    toast({
      variant: 'success',
      title: t('common.success'),
      description: t('manageMaterials.orderCreated'),
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('manageMaterials.materialsOrderTitle')}
      // description={t('manageMaterials.materialsOrderDescription')}
      size="xl"
      className="max-w-3xl bg-white"
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          
          <Button
            type="submit"
            form="material-order-form"
            className="min-w-[120px] bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
          >
            {t('manageMaterials.placeOrder')}
          </Button>
        </div>
      }
    >
      <form id="material-order-form" onSubmit={handleSubmit} className="space-y-4">
       

        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_minmax(88px,100px)_44px] gap-2 items-end bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
            <span>{t('manageMaterials.selectMaterial')}</span>
            <span>{t('manageMaterials.quantity')}</span>
            <span className="sr-only">{t('manageMaterials.removeLine')}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {rows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(88px,100px)_44px] gap-3 p-3 items-end"
              >
                <div className="space-y-1.5">
                  <Label className="sm:hidden text-xs">{t('manageMaterials.selectMaterial')}</Label>
                  <Select
                    value={row.materialId || undefined}
                    onValueChange={(v) => updateRow(row.key, { materialId: v })}
                    disabled={!materials.length}
                  >
                    <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                      <SelectValue placeholder={t('manageMaterials.selectMaterial')} />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {`${m.materialName} (${getAvailableStock(m)} ${m.unit})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="sm:hidden text-xs">{t('manageMaterials.quantity')}</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    className="h-11 rounded-md border-gray-200"
                  />
                </div>
                <div className="flex justify-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeRow(row.key)}
                    aria-label={t('manageMaterials.removeLine')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('manageMaterials.assignDriver')}</Label>
          <Select
            value={driverId || undefined}
            onValueChange={setDriverId}
            disabled={!drivers.length}
          >
            <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background w-full max-w-md">
              <SelectValue placeholder={t('manageMaterials.selectDriver')} />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-dashed border-[#00AB41]/50 text-[#00AB41]"
          onClick={addRow}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('manageMaterials.addOrderLine')}
        </Button>
      </form>
    </ModalWrapper>
  )
}
