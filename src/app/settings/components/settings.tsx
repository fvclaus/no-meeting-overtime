"use client";

import { Title } from "@/components/ui/title";
import { Link, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteAccount } from "../deleteAccount";
import { LOGOUT_URL } from "@/shared/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Settings() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);

  const handleDeleteData = () => {
    setDeleting(true);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    deleteAccount()
      .catch((error: unknown) => {
        setDeleting(false);
        setDeleteError(`${error}`);
        // TODO Error handling
      })
      .then(() => {
        window.location.href = LOGOUT_URL;
      });
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <Title subtitle="My Meetings" />
      <div className="w-full bg-blue-50 py-16 text-gray-600 flex flex-col items-center">
        <div className="px-4 max-w-4xl w-full flex flex-col">
          <section className="w-full ">
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Data Management
              </h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-700 mb-1">
                    Permanently Delete All Data
                  </p>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. All your data will be
                    permanently deleted.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmDialog(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Data
                </button>
              </div>
              {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Confirm Deletion
                    </h3>
                    {deleteError && (
                      <Alert>
                        <AlertTitle>Problem while creating meeting</AlertTitle>
                        <AlertDescription>{deleteError}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete all your data? This action
                      cannot be undone.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        disabled={isDeleting}
                        onClick={() => {
                          setShowConfirmDialog(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={handleDeleteData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : null}
                        Delete Everything
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
