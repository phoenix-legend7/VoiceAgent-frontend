import { useEffect, useState } from "react"
import SettingsLayout from "./SettingsLayout"
import Card from "../../library/Card"
import { useAuth } from "../../core/authProvider"
import { CreditCard, Trash2 } from "lucide-react"
import { InputBox } from "../../library/FormField"
import { Button } from "../../components/ui/button"
import { adminAPI } from "../../core/adminAPI"
import { toast } from "react-toastify"

const Credentials = () => {
  const { currentUser, setCurrentUser } = useAuth()
  const [elevenlabsKey, setElevenlabsKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setElevenlabsKey("")
  }, [currentUser])

  const getMaskedKey = () => {
    if (!currentUser?.api_keys?.elevenlabs) return null
    const existingKey = currentUser.api_keys.elevenlabs
    if (existingKey.length > 8) {
      return `${existingKey.substring(0, 4)}${'*'.repeat(existingKey.length - 8)}${existingKey.substring(existingKey.length - 4)}`
    }
    return '****'
  }

  const handleSave = async () => {
    if (!currentUser) return

    if (!elevenlabsKey.trim()) {
      toast.warning("Please enter an API key")
      return
    }

    setIsLoading(true)
    try {
      const response = await adminAPI.updateApiKeys({
        elevenlabs: elevenlabsKey.trim()
      })

      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          api_keys: response.api_keys
        })
      }

      toast.success(response.message || "API key updated successfully")
      setElevenlabsKey("")
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUser) return

    if (!currentUser.api_keys?.elevenlabs) {
      toast.warning("No API key to delete")
      return
    }

    if (!window.confirm("Are you sure you want to delete the ElevenLabs API key?")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await adminAPI.deleteApiKey("elevenlabs")

      if (currentUser && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          api_keys: response.api_keys
        })
      }

      toast.success(response.message || "API key deleted successfully")
      setElevenlabsKey("")
    } catch (error) {
    } finally {
      setIsDeleting(false)
    }
  }

  const hasExistingKey = currentUser?.api_keys?.elevenlabs
  const maskedKey = getMaskedKey()

  return (
    <SettingsLayout isOverlayShown={isLoading || isDeleting}>
      {!currentUser ? (
        <div>Not Authorized</div>
      ) : (
        <Card title="Credentials" icon={<CreditCard size={22} />}>
          <div className="flex flex-col gap-6 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">ElevenLabs API Key</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter your ElevenLabs API key to enable voice generation features.
                </p>
                <div className="space-y-4">
                  {hasExistingKey && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Current Key</label>
                      <div className="rounded-md border border-gray-400 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800">
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {maskedKey}
                        </code>
                      </div>
                    </div>
                  )}
                  <InputBox
                    label={hasExistingKey ? "New API Key" : "API Key"}
                    value={elevenlabsKey}
                    onChange={setElevenlabsKey}
                    placeholder={hasExistingKey ? "Enter new key to update" : "Enter your ElevenLabs API key"}
                    disabled={isLoading || isDeleting}
                    inputClassName="font-mono"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || isDeleting || !elevenlabsKey.trim()}
                    >
                      {hasExistingKey ? "Update Key" : "Save Key"}
                    </Button>
                    {hasExistingKey && (
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading || isDeleting}
                      >
                        <Trash2 size={16} />
                        Delete Key
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </SettingsLayout>
  )
}

export default Credentials
