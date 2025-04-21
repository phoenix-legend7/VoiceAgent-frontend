import { FaPlus } from "react-icons/fa"
import Content from "../Layout/Content"
import Table, { TableCell } from "../library/Table"

const Campaigns = () => {
  // const [isOverlayShow, setIsOverlayShow] = useState(false)
  return (
    <Content>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Campaigns</h2>
            <span className="text-sm text-gray-400">
              Manage your outbound campaigns
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-700"
            >
              <FaPlus />
              Create Campaign
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>Campaign Name</TableCell>
                <TableCell>Caller</TableCell>
                <TableCell>Num of Records</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell />
              </tr>
            </thead>
            <tbody>

            </tbody>
          </Table>
          <div className="text-center m-4 p-6">
            <div className="text-gray-400">No Active Campaigns Found</div>
            <div className="my-3">
              <button
                className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
              >
                <FaPlus />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default Campaigns

