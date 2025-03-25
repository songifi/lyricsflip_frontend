interface StatisticsPanelProps {
    timeLeft: string
    potWin: string
    scores: number
  }
  
  export function StatisticsPanel({ timeLeft, potWin, scores }: StatisticsPanelProps) {
    return (
      <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-4">
        <h3 className="text-purple-500 text-lg font-medium mb-3">STATISTICS</h3>
  
        <div className="bg-white rounded-xl p-4">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">Time Left:</span>
              <span className="text-green-500 text-lg font-medium">{timeLeft}</span>
            </div>
  
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">Pot. Win</span>
              <span className="text-black text-lg font-bold">{potWin}</span>
            </div>
  
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-base">Scores</span>
              <span className="text-black text-lg font-bold">{scores}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  