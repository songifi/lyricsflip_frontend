'use client';

import { useState } from 'react';
import { GameOptions } from '../organisms/game-mode-selection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../atoms/dialog'
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { Card, CardContent } from '../atoms/card';

export default function ChallengeModal() {
  const [code, setCode] = useState('');
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  const handleSelectGame = (gameId: string) => {
    if (gameId === 'challenge') {
      setIsChallengeModalOpen(true);
    }
  };

  return (
    <div className="p-4">
      {/* GameOptions component */}
      <GameOptions onSelectGame={handleSelectGame} />

      {/* Challenge Modal */}
      <Dialog open={isChallengeModalOpen} onOpenChange={setIsChallengeModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Join a Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Enter Challenge Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Card>
              <CardContent className="space-y-2">
                <p>
                  <strong>Wager Amount:</strong> 10,000 STRK (100 USD)
                </p>
                <p>
                  <strong>Number of Participants:</strong> Six (6)
                </p>
                <p>
                  <strong>Payout If Won:</strong>{' '}
                  <span className="text-purple-600">80,000 STRK (800 USD)</span>
                </p>
                <p>
                  <strong>Creator:</strong> thetimleyn
                </p>
                <p>
                  <strong>Wallet Balance:</strong> 200,780 STRK
                </p>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsChallengeModalOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!code}>Join Challenge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}