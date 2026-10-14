import { getDebts } from './debtsService'
import { getProducts } from './productsService'
import { getTransactions } from './transactionsService'

export async function getAppState() {
  const [products, transactions, debts] = await Promise.all([
    getProducts(),
    getTransactions(),
    getDebts(),
  ])

  return {
    products,
    transactions,
    debts,
  }
}
