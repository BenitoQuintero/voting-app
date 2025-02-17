'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import { io } from 'socket.io-client';

const VotingApp = () => {
  const [votes, setVotes] = useState({
    optionA: 0,
    optionB: 0
  });
  const [userVote, setUserVote] = useState(null);
  const [connections, setConnections] = useState(1);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:4000', {
      path: "/socket.io",
      transports: ['websocket'],
      autoConnect: true
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('connection_count', (count) => {
      setConnections(count);
    });

    socketRef.current.on('current_votes', (currentVotes) => {
      setVotes(currentVotes);
    });

    socketRef.current.on('vote_update', (newVotes) => {
      setVotes(newVotes);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleVote = (option) => {
    if (userVote === option) return;
    
    if (socketRef.current) {
      socketRef.current.emit('vote', option);
      setUserVote(option);
    }
  };

  const VoteCircles = ({ count, color }) => (
    <div className="flex flex-wrap justify-center gap-2 min-h-40 overflow-y-auto p-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full animate-pop-in"
          style={{
            backgroundColor: color,
            animation: `pop-in 0.5s ease-out ${i * 0.05}s forwards`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <style>
        {`
          @keyframes pop-in {
            0% {
              transform: scale(0);
            }
            70% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }

          .animate-pop-in {
            animation-fill-mode: forwards;
          }

          .gradient-bg {
            background: linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%);
          }
        `}
      </style>

      <div className="flex items-center justify-end mb-4 text-blue-600">
        <Users className="mr-2" />
        <span className="font-medium">{connections} connected</span>
      </div>

      <Tabs defaultValue="vote" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-blue-50">
          <TabsTrigger value="vote" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Vote
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vote">
          <Card className="p-6 gradient-bg border-blue-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Cast Your Vote</h2>
              <p className="text-gray-600 mb-4">
                {userVote 
                  ? `Your current vote: Option ${userVote.slice(-1)}` 
                  : "You haven't voted yet"}
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => handleVote('optionA')}
                  className={`px-8 py-4 text-lg transition-transform duration-200 hover:scale-105 active:scale-95 
                    ${userVote === 'optionA' 
                      ? 'bg-blue-800 hover:bg-blue-900' 
                      : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Option A
                  {userVote === 'optionA' && ' ✓'}
                </Button>
                <Button 
                  onClick={() => handleVote('optionB')}
                  className={`px-8 py-4 text-lg transition-transform duration-200 hover:scale-105 active:scale-95
                    ${userVote === 'optionB' 
                      ? 'bg-green-800 hover:bg-green-900' 
                      : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Option B
                  {userVote === 'optionB' && ' ✓'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card className="p-6 gradient-bg border-blue-100">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Results</h2>
            <div className="flex justify-between gap-4">
              <div className="w-1/2 border-r border-blue-100 bg-white/50 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2 text-center text-blue-700">Option A</h3>
                <p className="text-center mb-4 text-blue-600">{votes.optionA} votes</p>
                <VoteCircles count={votes.optionA} color="#3B82F6" />
              </div>
              <div className="w-1/2 bg-white/50 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2 text-center text-green-700">Option B</h3>
                <p className="text-center mb-4 text-green-600">{votes.optionB} votes</p>
                <VoteCircles count={votes.optionB} color="#22C55E" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VotingApp;
