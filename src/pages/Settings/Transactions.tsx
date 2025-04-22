import Table, { TableCell } from "../../library/Table"
import SettingsLayout from "./SettingsLayout"

const Transactions = () => {
  return (
    <SettingsLayout isOverlayShown={false}>
      <div className="flex flex-wrap justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-auto">
        <Table>
          <thead>
            <tr className="border-b border-gray-700">
              <TableCell>ID</TableCell>
              <TableCell>Transaction</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Timestamp</TableCell>
            </tr>
          </thead>
          <tbody>

          </tbody>
        </Table>
        <div className="w-full mt-6 text-center m-4 p-6">
          <div className="text-gray-400">No transactions found</div>
        </div>
      </div>
    </SettingsLayout>
  )
}


export default Transactions
