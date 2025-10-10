import React from 'react'
import { Target, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const UseCases: React.FC = () => {
  const { isUseCasesExpanded, setUseCasesExpanded, useCases } = useAppStore()

  return (
    <div className="card">
      <button
        onClick={() => setUseCasesExpanded(!isUseCasesExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">Use Cases</h3>
            <p className="text-xs text-gray-400">Pre-built automation workflows</p>
          </div>
        </div>
        {isUseCasesExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isUseCasesExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {useCases.map((useCase) => (
            <div
              key={useCase.id}
              className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{useCase.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-white">{useCase.title}</h4>
                  <p className="text-xs text-gray-400">{useCase.description}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // TODO: Implement use case activation
                  console.log('Activate use case:', useCase.id)
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UseCases