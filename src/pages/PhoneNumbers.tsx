import { FaDownload, FaPlus } from "react-icons/fa"
import Content from "../Layout/Content"
import Table, { TableCell } from "../library/Table"

const PhoneNumbers = () => {
  // const [isOverlayShow, setIsOverlayShow] = useState(false)
  return (
    <Content>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">Phone Numbers</h2>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
            >
              <FaDownload />
              Import Number
            </button>
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-700"
            >
              <FaPlus />
              Buy Number
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>Phone</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Next Cycle</TableCell>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </Table>
          <div className="text-center m-4 p-6">
            <div className="text-gray-400">No Active Phone Numbers Found</div>
            <div className="my-3">
              <button
                className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
              >
                <FaPlus />
                Buy Number
              </button>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default PhoneNumbers

