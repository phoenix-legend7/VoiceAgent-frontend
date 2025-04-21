import { FaFilter } from "react-icons/fa"
import Content from "../Layout/Content"
import Table, { TableCell } from "../library/Table"

const CallLogs = () => {
  // const [isOverlayShow, setIsOverlayShow] = useState(false)
  return (
    <Content>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1 justify-center">
            <h2 className="text-2xl font-bold">Call Logs</h2>
          </div>
          <div className="flex gap-5 items-center">
            <div className="flex gap-1 items-center">
              <FaFilter />
              <div>Filter</div>
            </div>
            <div>
              <select
                className="bg-gray-900/80 text-white border border-sky-600 min-w-40 px-4 py-2 rounded-md"
              >
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>ID</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Phone #</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Timestamp</TableCell>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </Table>
          <div className="w-full mt-6 text-center m-4 p-6">
            <div className="text-gray-400">No call logs found</div>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default CallLogs

