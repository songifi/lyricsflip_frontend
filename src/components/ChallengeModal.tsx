import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Challenge {
     code?: string;
     wagerAmount?: string | number;
     participants?: string | number;
     payout?: string | number;
     creator?: string;
     walletBalance?: string | number;
}

interface ChallengeModalProps {
     isOpen: boolean;
     onClose: () => void;
     challenge?: Challenge;
     onSubmit?: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, challenge, onSubmit }) => {
     return (
          <Dialog open={isOpen} onOpenChange={onClose}>
               <DialogContent className="w-full max-w-lg md:max-w-xl h-[90vh] text-black lg:max-w-md bg-white dark:bg-gray-900 rounded-[30px] p-6 min-h-[500px] md:min-h-[600px]">
                    <DialogHeader>
                         <DialogTitle className="text-xl font-bold">
                              {challenge?.code ? `Join a challenge - ${challenge.code}` : "Join a challenge"}
                         </DialogTitle>
                         <DialogDescription className="text-gray-500">
                              Qorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum.
                         </DialogDescription>
                    </DialogHeader>

                    {!challenge?.code ? (
                         <div className="mt-0">
                              <label className="block text-gray-700 text-md font-medium mb-2"></label>
                              <Input placeholder="Enter Code" className="w-full h-12 border-gray-300 rounded-lg px-4 mt-0" />
                         </div>
                    ) : (
                         <div className="mt-2 space-y-4 text-md">
                              <div className="flex justify-between">
                                   <span className="text-gray-500">Wager Amount</span>
                                   <span className="font-medium">{challenge.wagerAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                   <span className="text-gray-500">Number of Participants</span>
                                   <span className="font-medium">{challenge.participants}</span>
                              </div>
                              <div className="flex justify-between">
                                   <span className="text-gray-500">Payout if won</span>
                                   <span className="font-medium text-blue-600">{challenge.payout}</span>
                              </div>
                              <div className="flex justify-between">
                                   <span className="text-gray-500">Creator</span>
                                   <span className="font-medium">{challenge.creator}</span>
                              </div>
                              <div className="flex justify-between">
                                   <span className="text-gray-500">Wallet Balance</span>
                                   <span className="font-medium text-blue-600">{challenge.walletBalance}</span>
                              </div>
                         </div>
                    )}

                    <div className="flex justify-between items-center mt-8">
                         <Button variant="outline" className="w-1/3 h-12 text-purple-600 border-purple-600 rounded-[50px]" onClick={onClose}>
                              Cancel
                         </Button>
                         <Button
                              className="w-1/2 h-12 bg-purple-600 text-white rounded-[50px] hover:bg-purple-700"
                              onClick={onSubmit || onClose} // Submit for first modal, close for second
                         >
                              Join Challenge
                         </Button>
                    </div>
               </DialogContent>
          </Dialog>
     );
};

export default ChallengeModal;
