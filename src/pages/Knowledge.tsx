import { FaPlus } from "react-icons/fa"
import Content from "../Layout/Content"

const AgentKnowledge = () => {
  // const [isOverlayShow, setIsOverlayShow] = useState(false)
  return (
    <Content>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1 justify-center">
            <h2 className="text-2xl font-bold">Documents</h2>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-700"
            >
              <FaPlus />
              Add
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-x-auto">
          <div className="w-full mt-6 text-center m-4 p-6">
            <div className="text-gray-400">No documents found</div>
            <div className="my-3">
              <button
                className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
              >
                <FaPlus />
                Add Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}

export default AgentKnowledge

