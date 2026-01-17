/**
 * CommitmentInfoPanel Component
 *
 * Educational panel explaining what budget commitments are
 * and why they are important
 */

import { FileText, Scale } from 'lucide-react'
import { Trans } from '@lingui/react/macro'

export function CommitmentInfoPanel() {
  return (
    <div className="bg-indigo-900 text-white rounded-xl shadow-lg p-8 flex flex-col justify-center relative overflow-hidden h-[500px]">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4">
          <Trans>What are Commitments?</Trans>
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="bg-indigo-800 p-3 rounded-lg h-fit">
              <FileText size={24} className="text-indigo-300" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-indigo-100">
                <Trans>The Step Between Budget and Payment</Trans>
              </h4>
              <p className="text-indigo-200 text-sm mt-1 leading-relaxed">
                <Trans>
                  A budget commitment is a{' '}
                  <strong className="text-white">legal promise</strong> to pay
                  (contract, order). Although the budget exists, the money is not
                  "spent" until the commitment is made.
                </Trans>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-indigo-800 p-3 rounded-lg h-fit">
              <Scale size={24} className="text-indigo-300" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-indigo-100">
                <Trans>Why Is It Important?</Trans>
              </h4>
              <p className="text-indigo-200 text-sm mt-1 leading-relaxed">
                <Trans>
                  The difference between <strong>Commitments</strong> and{' '}
                  <strong>Payments</strong> shows current debts or work in
                  progress that has not yet been paid.
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
