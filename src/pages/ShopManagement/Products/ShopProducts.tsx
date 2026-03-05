import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Clock, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pagination, ConfirmDialog } from '@/components/common'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteShopProduct, toggleShopProductStatus } from '@/redux/slices/shopProductSlice'
import type { ShopProduct } from '@/types'
import { toast } from '@/utils/toast'
import { formatCurrency } from '@/utils/formatters'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { AddEditShopProductModal } from './AddEditShopProductModal'

function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggle,
}: {
  product: ShopProduct
  onEdit: (p: ShopProduct) => void
  onDelete: (p: ShopProduct) => void
  onToggle: (p: ShopProduct) => void
}) {
  const milkLabels = product.milkTypes?.map((m) => m.name).join(', ') || '—'
  const syrupLabels = product.syrupTypes?.map((s) => s.name).join(', ') || '—'

  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-muted">
        {product.itemsPicture ? (
          <img
            src={product.itemsPicture}
            alt={product.itemsName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Item
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Switch
            checked={product.isActive}
            onCheckedChange={() => onToggle(product)}
          />
        </div>
      </div>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base font-semibold text-slate-800 truncate">
          {product.itemsName}
        </CardTitle>
        <p className="text-sm font-medium text-primary">{formatCurrency(product.price)}</p>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-sm text-muted-foreground">
          {product.categoryName || '—'}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>Pickup: {product.pickupTime}</span>
        </div>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded bg-secondary-foreground px-2 py-0.5 text-xs text-accent"
              >
                <Tag className="h-3 w-3" />
                {t}
              </span>
            ))}
          </div>
        )}
        {(product.milkTypes?.length || product.syrupTypes?.length) ? (
          <div className="text-xs text-muted-foreground space-y-1 pt-1">
            {product.milkTypes?.length ? (
              <p><span className="font-medium">Milk:</span> {milkLabels}</p>
            ) : null}
            {product.syrupTypes?.length ? (
              <p><span className="font-medium">Syrup:</span> {syrupLabels}</p>
            ) : null}
          </div>
        ) : null}
        <div className="flex gap-2 pt-3 border-t mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:text-red-700 hover:border-red-200"
            onClick={() => onDelete(product)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ShopProducts() {
  const dispatch = useAppDispatch()
  const products = useAppSelector((s) => s.shopProducts.filteredList)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ShopProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const selected = products.find((p) => p.id === editingId) ?? null

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit
    return products.slice(start, start + limit)
  }, [products, page, limit])

  const totalPages = Math.ceil(products.length / limit)

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handleAdd = () => {
    setEditingId(null)
    setModalOpen(true)
  }
  const handleEdit = (p: ShopProduct) => {
    setEditingId(p.id)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      dispatch(deleteShopProduct(deleteTarget.id))
      toast({ title: 'Deleted', description: 'Product removed.' })
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">
              Shop Products
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage products with name, price, category, tags, pickup time, and picture
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No products yet. Add one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onToggle={(p) => dispatch(toggleShopProductStatus(p.id))}
                />
              ))}
            </div>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={products.length}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </CardContent>
      </Card>

      <AddEditShopProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
        }}
        editingId={editingId}
        product={selected}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.itemsName}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
