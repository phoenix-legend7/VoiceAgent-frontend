import { FC, Dispatch, SetStateAction, useState, useMemo } from "react"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import { AgentTypeRead } from "../../models/agent"
import Card from "../../library/Card"
import { InputBox, InputBoxWithUnit, Slider, SwtichWithLabel } from "../../library/FormField"

interface ToolBarProps {
  handleSave: () => Promise<void>
}
interface AdvancedSettingsProps {
  agent: AgentTypeRead
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const ToolBar: FC<ToolBarProps> = ({ handleSave }) => {
  return (
    <div>
      <button
        className="cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  )
}

const AdvancedSettings: FC<AdvancedSettingsProps> = ({ agent, setAgent, setIsOverlayShow }) => {
  const [editData, setEditData] = useState(agent)

  const isEditted = useMemo(() => {
    return JSON.stringify(agent) !== JSON.stringify(editData)
  }, [agent, editData])

  const handleSave = async () => {
    try {
      const data = {
        config: {
          timezone: editData.config.timezone,
          vad_threshold: editData.config.vad_threshold,
          call_settings: editData.config.call_settings,
          session_timeout: editData.config.session_timeout
        }
      }
      setIsOverlayShow(true)
      await axiosInstance.put(
        `/agent/${agent.id}`,
        { config: data, name: agent.name }
      )
      toast.success('Prompt updated successfully')
      setAgent({ ...agent, config: { ...agent.config, ...data.config } })
    } catch (error) {
      console.error(error)
      toast.error('Failed to update prompt')
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Card title="Advanced Settings" toolbar={isEditted && <ToolBar handleSave={handleSave} />}>
      <div>
        <div className="flex items-center justify-between gap-3 px-6 pt-6">
          <div className="font-semibold">Agent Timezone</div>
          <div>
            <select
              className="rounded-md text-gray-400 bg-neutral-800/50 border border-gray-700 w-full py-2 px-3 focus:border-sky-600 focus:outline-none transition-all duration-300"
              value={editData.config.timezone || ''}
              onChange={(e) => {
                setEditData({
                  ...editData,
                  config: { ...editData.config, timezone: e.target.value || null }
                })
              }}
            >
              <option className="bg-neutral-800"></option>
              <option className="bg-neutral-800" value="America/New_York">America/New_York</option>
              <option className="bg-neutral-800" value="America/Los_Angeles">America/Los_Angeles</option>
              <option className="bg-neutral-800" value="America/Chicago">America/Chicago</option>
              <option className="bg-neutral-800" value="America/Denver">America/Denver</option>
              <option className="bg-neutral-800" value="America/Phoenix">America/Phoenix</option>
            </select>
          </div>
        </div>
        <div className="px-6">
          <div className="flex items-start justify-between gap-3 py-4">
            <div>
              <div className="font-semibold">
                Voice Detection Confidence Threshold
              </div>
              <p className="text-sm text-gray-400">
                Set the confidence level for detecting voice. 1 is the highest confidence, meaning the agent is less likely to detect voice and pause.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SwtichWithLabel
                value={editData.config.vad_threshold !== null}
                onChange={(value) => {
                  setEditData({
                    ...editData,
                    config: {
                      ...editData.config,
                      vad_threshold: value ? agent.config.vad_threshold ?? 0.65 : null
                    }
                  })
                }}
              />
              <div>Override</div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Slider
              value={editData.config.vad_threshold ?? 0.65}
              onChange={(value) => {
                setEditData({
                  ...editData,
                  config: { ...editData.config, vad_threshold: value }
                })
              }}
              disabled={editData.config.vad_threshold === null}
              defaultValue={0.65}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-b border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">
                Call Recording
              </div>
              <p className="text-sm text-gray-400">
                Enable or disable recording of calls. Recording is disabled by default.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SwtichWithLabel
                value={editData.config.call_settings !== null}
                onChange={(value) => {
                  setEditData({
                    ...editData,
                    config: {
                      ...editData.config,
                      call_settings: value ? agent.config.call_settings || { enable_recording: true } : null
                    }
                  })
                }}
              />
              <div>Enable</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="font-semibold">Session Timeout</div>
          <p className="text-sm text-gray-400">
            Set the session to automatically end after a fixed duration or following a period of no voice activity.
          </p>
          <div className="pt-6">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-4">Fixed Duration: Set session to always end after. Maximum duration is 24 hours</td>
                  <td className="p-4">
                    <InputBoxWithUnit
                      value={editData.config.session_timeout?.max_duration ?? 0}
                      onChange={(value) => {
                        setEditData({
                          ...editData,
                          config: {
                            ...editData.config,
                            session_timeout: {
                              max_idle: editData.config.session_timeout?.max_idle ?? null,
                              message: editData.config.session_timeout?.message ?? null,
                              max_duration: value
                            }
                          }
                        })
                      }}
                      unit="seconds"
                    />
                  </td>
                </tr>
                <tr className="border-t border-b border-gray-700">
                  <td className="p-4">No Voice Activity: End session after [X] seconds of inactivity</td>
                  <td className="p-4">
                    <InputBoxWithUnit
                      value={editData.config.session_timeout?.max_idle ?? 0}
                      onChange={(value) => {
                        setEditData({
                          ...editData,
                          config: {
                            ...editData.config,
                            session_timeout: {
                              max_duration: editData.config.session_timeout?.max_duration ?? null,
                              message: editData.config.session_timeout?.message ?? null,
                              max_idle: value
                            }
                          }
                        })
                      }}
                      unit="seconds"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Message the agent says when the session ends</td>
                  <td className="p-4">
                    <InputBox
                      inputClassName="bg-transparent"
                      value={editData.config.session_timeout?.message ?? ''}
                      onChange={(value) => {
                        setEditData({
                          ...editData,
                          config: {
                            ...editData.config,
                            session_timeout: {
                              max_duration: editData.config.session_timeout?.max_duration ?? null,
                              max_idle: editData.config.session_timeout?.max_idle ?? null,
                              message: value
                            }
                          }
                        })
                      }}
                      placeholder="I.e. &quot;Your session has ended.&quot;"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AdvancedSettings
