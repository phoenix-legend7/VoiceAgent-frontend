import { Dispatch, FC, SetStateAction } from "react"
import appTools from "../../../consts/appTools"
import Modal from "../../../library/ModalProvider"
import Table, { TableCell, TableRow } from "../../../library/Table"

interface AppToolModalProps {
  isOverlayShow: boolean
  showModal: boolean
  setSelectedAppTool: Dispatch<SetStateAction<string | null>>
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const AppToolModal: FC<AppToolModalProps> = ({
  isOverlayShow,
  showModal,
  setSelectedAppTool,
  setShowModal,
}) => {
  const onClose = () => {
    setShowModal(false)
  }
  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      isLoading={isOverlayShow}
      title="Add App Tool"
      modalSize="max-w-xl"
    >
      <p className="text-sm text-gray-4">
        Integrate third-party apps, such as cal.com, and add special function calls to their voice agents
      </p>
      <div className="my-3 overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-4 text-start">Name</th>
              <th className="p-4 text-start">Description</th>
              <th className="p-4">App</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appTools.map((tool, index) => (
              <TableRow key={`tool-${index}`}>
                <TableCell className="break-all">{tool.name}</TableCell>
                <TableCell className="break-all">{tool.description}</TableCell>
                <TableCell>cal.com</TableCell>
                <TableCell>
                  <button
                    className="cursor-pointer text-sky-600 hover:text-sky-400 hover:bg-sky-700/10 px-4 py-1.5 rounded transition-all duration-300"
                    onClick={() => setSelectedAppTool(tool.name)}
                  >
                    Add
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>
    </Modal>
  )
}

export default AppToolModal
