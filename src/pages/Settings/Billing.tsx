import { useEffect, useState } from "react";
import { FaCreditCard, FaRegCopyright } from "react-icons/fa";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Card from "../../library/Card";
import { InputBoxWithUnit } from "../../library/FormField";
import SettingsLayout from "./SettingsLayout";
import clsx from "clsx";
import StatusBadge from "../../components/StatusBadge";

const CardAction = () => {
  return (
    <div>
      <button className="bg-transparent cursor-pointer hover:bg-gray-300/50 dark:hover:bg-gray-700/50 px-4 py-2 rounded-md transition-all duration-300">
        Edit
      </button>
    </div>
  );
};

type UserDataType = {
  user_id: string;
  credit: number;
  used_credit: number;
  auto_refill: {
    enabled: boolean;
    threshold?: number;
    refill_amount?: number;
  };
};

const initialUserData: UserDataType = {
  user_id: "<string>",
  credit: 5,
  used_credit: 0,
  auto_refill: {
    enabled: true,
    threshold: 0,
    refill_amount: 0,
  },
};

const Billing = () => {
  const [userData, setUserData] = useState<UserDataType>(initialUserData);
  const [threshold, setThreshold] = useState<number>(0);
  const [refillAmount, setRefillAmount] = useState<number>(5000);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/user/info");
        const data = response.data;
        setUserData(data);
        setThreshold(data.auto_refill.threshold || 0);
        setRefillAmount(data.auto_refill.refill_amount || 5000);
      } catch (error) {
        handleAxiosError('Failed to fetch user data', error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <SettingsLayout isOverlayShown={false}>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start justify-center gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-md px-8 py-4">
          <div className="mb-4">
            <FaRegCopyright size={32} />
          </div>
          <div className="text-2xl font-bold">Credit Usage</div>
          <p className="my-5">
            Ensure you have enough credits to maintain uninterrupted service.
          </p>
          <div className="flex items-center gap-3">
            <div className="text-nowrap">
              ${(userData.used_credit / 100).toFixed(4)} / $
              {(userData.credit / 100).toFixed(4)}
            </div>
            <div className="bg-sky-600/30 w-full h-2 rounded overflow-hidden">
              <div
                className="bg-sky-500 h-full"
                style={{
                  width: `${(userData.used_credit / userData.credit) * 100}%`,
                }}
              />
            </div>
          </div>
          <hr className="my-6 text-gray-300 dark:text-gray-300" />
          <div className="text-lg font-semibold">Auto Refill Your Credits</div>
          <p className="text-gray-600 dark:text-gray-400">
            Keep your services running without interruption. Automatically top
            up your balance when it falls below your chosen threshold.
          </p>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Threshold</div>
            <div className="w-1/2">
              <InputBoxWithUnit
                value={threshold}
                unit="$"
                onChange={(e) => setThreshold(Number(e) || 0)}
                showRightUnit={false}
              />
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Refill Amount</div>
            <div className="w-1/2 flex items-center rounded overflow-hidden border border-gray-700 select-none">
              <div
                className={clsx(
                  "p-3 cursor-pointer transition-all duration-300 text-center flex-1 border-r",
                  refillAmount === 500
                    ? "bg-sky-600/20 text-sky-600 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-300/80 dark:hover:bg-sky-700/50 border-sky-900"
                    : "bg-gray-600/20 border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setRefillAmount(500)}
              >
                $5
              </div>
              <div
                className={clsx(
                  "p-3 cursor-pointer transition-all duration-300 text-center flex-1 border-r",
                  refillAmount === 1000
                    ? "bg-sky-600/20 text-sky-600 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-300/80 dark:hover:bg-sky-700/50 border-sky-900"
                    : "bg-gray-600/20 border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setRefillAmount(1000)}
              >
                $10
              </div>
              <div
                className={clsx(
                  "p-3 cursor-pointer transition-all duration-300 text-center flex-1 border-r",
                  refillAmount === 5000
                    ? "bg-sky-600/20 text-sky-600 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-300/80 dark:hover:bg-sky-700/50 border-sky-900"
                    : "bg-gray-600/20 border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setRefillAmount(5000)}
              >
                $50
              </div>
              <div
                className={clsx(
                  "p-3 cursor-pointer transition-all duration-300 text-center flex-1",
                  refillAmount === 10000
                    ? "bg-sky-600/20 text-sky-600 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-300/80 dark:hover:bg-sky-700/50"
                    : "bg-gray-600/20 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setRefillAmount(10000)}
              >
                $100
              </div>
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center">
            <div className="w-1/2">Status</div>
            <div>
              {userData.auto_refill.enabled ? (
                <StatusBadge
                  colors="border-emerald-500 bg-emerald-200/20 text-emerald-500"
                  status="Active"
                />
              ) : (
                <StatusBadge
                  colors="border-red-400 bg-red-200/20 dark:bg-red-800/20 text-red-400"
                  status="Inactive"
                />
              )}
            </div>
          </div>
          <div className="my-3 flex gap-3 w-full items-center justify-end">
            <div className="flex items-center gap-3">
              <button className="bg-sky-600 px-4 py-2 rounded-md cursor-pointer text-white hover:bg-sky-600/80 transition-all duration-300">
                Activate Auto Refill
              </button>
              {userData.auto_refill.enabled && (
                <button className="bg-red-800 px-4 py-2 rounded-md cursor-pointer text-white hover:bg-red-600/80 transition-all duration-300">
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <Card
          className="my-0"
          title="Payment Details"
          icon={<FaCreditCard size={24} />}
          toolbar={<CardAction />}
        >
          {/* <div className="p-6">
            <p className="mt-6 text-sm text-gray-400 text-center">
              There is no payment method yet.
            </p>
            <button className="flex gap-2 items-center justify-center px-4 py-2 mt-3 mx-auto rounded-md cursor-pointer bg-transparent border border-sky-600 text-sky-600 hover:bg-sky-600/10 transition-all duration-300">
              <FaPlus />
              Add
            </button>
          </div> */}
          <div className="space-y-4 p-6">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Payment Type</span>
              <span className="text-sm text-black dark:text-white">link</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                hello@elysiapartners.com
              </span>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                Powered by stripe
              </div>
            </div>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default Billing;
