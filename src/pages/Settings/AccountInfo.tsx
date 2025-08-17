import SettingsLayout from "./SettingsLayout"
import Card from "../../library/Card"
import { useAuth } from "../../core/authProvider"
import { User } from "lucide-react"

const AccountInfo = () => {
  const { currentUser } = useAuth()

  return (
    <SettingsLayout isOverlayShown={false}>
      {!currentUser ? (
        <div>Not Authorized</div>
      ) : (
        <Card title="Account Information" icon={<User size={22} />}>
          <div className="flex flex-col items-center gap-4 p-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border shadow">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <User size={36} />
                </div>
              )}
            </div>

            {/* Name + Email */}
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {currentUser.first_name} {currentUser.last_name}
              </h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </Card>
      )}
    </SettingsLayout>
  )
}

export default AccountInfo
