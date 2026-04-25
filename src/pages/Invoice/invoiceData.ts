export type InvoiceUnitSuffix = 'sqft' | 'hr' | 'day' | 'unit'

export interface InvoiceLineItem {
  id: string
  category: string
  quantity: number
  unitPrice: number
  unitSuffix: InvoiceUnitSuffix
}

export interface InvoiceRecord {
  id: string
  customerName: string
  customerAddress: string
  invoiceRef: string
  issuedDate: string
  dueDate: string
  taxPercent: number
  lineItems: InvoiceLineItem[]
}

export function computeInvoiceTotals(invoice: InvoiceRecord) {
  const subtotal = invoice.lineItems.reduce(
    (sum, row) => sum + row.quantity * row.unitPrice,
    0
  )
  const taxAmount = subtotal * (invoice.taxPercent / 100)
  const totalDue = subtotal + taxAmount
  return { subtotal, taxAmount, totalDue }
}

export const MOCK_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    customerName: "Manny's Residence",
    customerAddress: '1248 Oak Ridge Lane, Beverly Hills, CA 90210',
    invoiceRef: '#INV-2026-991',
    issuedDate: '2026-04-12',
    dueDate: '2026-04-26',
    taxPercent: 8.25,
    lineItems: [
      {
        id: 'l1',
        category: 'Landscape design — front yard',
        quantity: 1200,
        unitPrice: 2.62,
        unitSuffix: 'sqft',
      },
      {
        id: 'l2',
        category: 'Sod installation',
        quantity: 800,
        unitPrice: 3.4,
        unitSuffix: 'sqft',
      },
      {
        id: 'l3',
        category: 'Irrigation labor',
        quantity: 24,
        unitPrice: 65,
        unitSuffix: 'hr',
      },
      {
        id: 'l4',
        category: 'Equipment rental (mini excavator)',
        quantity: 3,
        unitPrice: 280,
        unitSuffix: 'day',
      },
      {
        id: 'l5',
        category: 'Debris haul-off',
        quantity: 1,
        unitPrice: 450,
        unitSuffix: 'unit',
      },
    ],
  },
  {
    id: 'inv-2',
    customerName: 'Green Valley HOA',
    customerAddress: '88 Park Commons, Santa Monica, CA 90401',
    invoiceRef: '#INV-2026-872',
    issuedDate: '2026-03-28',
    dueDate: '2026-04-15',
    taxPercent: 8.25,
    lineItems: [
      { id: 'a1', category: 'Monthly maintenance — Zone A', quantity: 1, unitPrice: 3200, unitSuffix: 'unit' },
      { id: 'a2', category: 'Mulch refresh', quantity: 45, unitPrice: 42, unitSuffix: 'unit' },
      { id: 'a3', category: 'Trimming crew', quantity: 16, unitPrice: 58, unitSuffix: 'hr' },
      { id: 'a4', category: 'Fertilizer application', quantity: 2.5, unitPrice: 180, unitSuffix: 'unit' },
    ],
  },
  {
    id: 'inv-3',
    customerName: 'Startech BD Campus',
    customerAddress: '500 Innovation Way, Irvine, CA 92618',
    invoiceRef: '#INV-2026-654',
    issuedDate: '2026-04-01',
    dueDate: '2026-04-20',
    taxPercent: 8.25,
    lineItems: [
      { id: 'b1', category: 'Tree planting (15 units)', quantity: 15, unitPrice: 195, unitSuffix: 'unit' },
      { id: 'b2', category: 'Soil amendment', quantity: 600, unitPrice: 1.85, unitSuffix: 'sqft' },
      { id: 'b3', category: 'Water truck rental', quantity: 2, unitPrice: 340, unitSuffix: 'day' },
    ],
  },
  {
    id: 'inv-4',
    customerName: 'Riverside Plaza LLC',
    customerAddress: '200 Garden Walk, Riverside, CA 92501',
    invoiceRef: '#INV-2026-445',
    issuedDate: '2026-03-15',
    dueDate: '2026-03-29',
    taxPercent: 8.25,
    lineItems: [
      { id: 'c1', category: 'Lawn restoration', quantity: 2400, unitPrice: 1.25, unitSuffix: 'sqft' },
      { id: 'c2', category: 'Aeration service', quantity: 2400, unitPrice: 0.35, unitSuffix: 'sqft' },
      { id: 'c3', category: 'Supervisor hours', quantity: 8, unitPrice: 72, unitSuffix: 'hr' },
    ],
  },
  {
    id: 'inv-5',
    customerName: 'Oak Street Residences',
    customerAddress: '12 Oak Street, Pasadena, CA 91105',
    invoiceRef: '#INV-2026-301',
    issuedDate: '2026-02-20',
    dueDate: '2026-03-10',
    taxPercent: 8.25,
    lineItems: [
      { id: 'd1', category: 'Seasonal color beds', quantity: 120, unitPrice: 28, unitSuffix: 'sqft' },
      { id: 'd2', category: 'Drip line repair', quantity: 6, unitPrice: 95, unitSuffix: 'hr' },
      { id: 'd3', category: 'Compost delivery', quantity: 8, unitPrice: 55, unitSuffix: 'unit' },
    ],
  },
]
