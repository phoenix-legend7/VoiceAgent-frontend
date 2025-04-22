import { FaCreditCard, FaPlus, FaRegCopyright } from "react-icons/fa"
import SettingsLayout from "./SettingsLayout"
import { InputBoxWithUnit } from "../../library/FormField"
import Card from "../../library/Card"

const CardAction = () => {
  return (
    <div>
      <button className="bg-transparent cursor-pointer hover:bg-gray-700/50 px-4 py-2 rounded-md transition-all duration-300">
        Edit
      </button>
    </div>
  )
}

const Billing = () => {
  return (
    <SettingsLayout isOverlayShown={false}>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start justify-center gap-6">
        <div className="bg-gray-900 rounded-md px-8 py-4">
          <div className="mb-4"><FaRegCopyright size={32} /></div>
          <div className="text-2xl font-bold">Credit Usage</div>
          <p className="my-5">Ensure you have enough credits to maintain uninterrupted service.</p>
          <div className="flex items-center gap-3">
            <div className="text-nowrap">$0.1926 / $5.0000</div>
            <div className="bg-sky-600/30 w-full h-2 rounded overflow-hidden">
              <div className="bg-sky-500 h-full" style={{ width: `${(0.1926 / 5) * 100}%` }} />
            </div>
          </div>
          <hr className="my-6 text-gray-700" />
          <div className="text-lg font-semibold">Auto Refill Your Credits</div>
          <p className="text-gray-400">
            Keep your services running without interruption. Automatically top up your balance when it falls below your chosen threshold.
          </p>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Threshold</div>
            <div className="w-1/2">
              <InputBoxWithUnit
                value={0}
                unit="$"
                onChange={() => { }}
                showRightUnit={false}
              />
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Refill Amount</div>
            <div className="w-1/2 flex items-center rounded overflow-hidden border border-gray-700 select-none">
              <div className="p-3 cursor-pointer hover:bg-green-600/20 hover:text-green-600 transition-all duration-300 text-center flex-1 border-r border-gray-700">
                $5
              </div>
              <div className="p-3 cursor-pointer hover:bg-green-600/20 hover:text-green-600 transition-all duration-300 text-center flex-1 border-r border-gray-700">
                $10
              </div>
              <div className="p-3 cursor-pointer hover:bg-green-600/20 hover:text-green-600 transition-all duration-300 text-center flex-1 border-r border-gray-700">
                $50
              </div>
              <div className="p-3 cursor-pointer hover:bg-green-600/20 hover:text-green-600 transition-all duration-300 text-center flex-1">
                $100
              </div>
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Status</div>
            <div className="w-1/2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div>Inactive</div>
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center justify-end">
            <div className="w-1/2 flex items-center gap-2">
              <button className="bg-sky-600 px-4 py-2 rounded-md cursor-pointer hover:bg-sky-600/80 transition-all duration-300">
                Activate Auto Refill
              </button>
            </div>
          </div>
        </div>
        <Card className="my-0" title="Payment Details" icon={<FaCreditCard size={24} />} toolbar={<CardAction />}>
          <div className="p-6">
            <p className="mt-6 text-sm text-gray-400 text-center">
              There is no payment method yet.
            </p>
            <button className="flex gap-2 items-center justify-center px-4 py-2 mt-3 mx-auto rounded-md cursor-pointer bg-transparent border border-sky-600 text-sky-600 hover:bg-sky-600/10 transition-all duration-300">
              <FaPlus />
              Add
            </button>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  )
}

export default Billing
