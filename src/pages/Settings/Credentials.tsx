import { FaRegCreditCard } from "react-icons/fa"
import SettingsLayout from "./SettingsLayout"
import Card from "../../library/Card"
import { InputBox } from "../../library/FormField"

const Credentials = () => {
  return (
    <SettingsLayout isOverlayShown={false}>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Eleven Labs" icon={<FaRegCreditCard size={22} />} className="">
          <div className="px-6 py-5">
            <InputBox
              onChange={() => { }}
              value={""}
              label="API Key"
              inputClassName="bg-transparent w-full"
            />
            <p className="text-sm mt-3">
              Make sure your account has a paid subscription.
            </p>
          </div>
        </Card>
        <Card title="Cartesia" icon={<FaRegCreditCard size={22} />} className="">
          <div className="px-6 py-5">
            <InputBox
              onChange={() => { }}
              value={""}
              label="API Key"
              inputClassName="bg-transparent w-full"
            />
            <p className="text-sm mt-3">
              Make sure your account has a paid subscription.
            </p>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  )
}

export default Credentials
