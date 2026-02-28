'use client';

import { useState } from 'react';
import {
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Send,
} from 'lucide-react';

const mockTickets = [
  {
    id: 1,
    title: 'Unsafe Route Deviation',
    user: 'Sarah Johnson',
    role: 'Passenger',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 2,
    title: 'Wrong Fare Charged',
    user: 'Michael Chen',
    role: 'Passenger',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 3,
    title: 'App Navigation Issue',
    user: 'Robert Martinez',
    role: 'Driver',
    priority: 'Low',
    status: 'Open',
  },
];

export default function CaseManagement() {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [notes, setNotes] = useState('');
  const [chat, setChat] = useState([
    { sender: 'Passenger', message: 'I feel unsafe with this route.' },
    { sender: 'Agent', message: 'We are checking your route now.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const filteredTickets =
    activeFilter === 'All'
      ? tickets
      : tickets.filter(t => t.priority === activeFilter);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setChat([...chat, { sender: 'Agent', message: newMessage }]);
    setNewMessage('');
  };

  const closeCase = () => {
    setTickets(prev =>
      prev.filter(ticket => ticket.id !== selectedTicket.id)
    );
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Case Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage open support tickets and resolve cases efficiently.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT PANEL - Ticket List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              {['All', 'High', 'Medium', 'Low'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    activeFilter === filter
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Ticket List */}
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedTicket?.id === ticket.id
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {ticket.title}
                    </h3>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {ticket.user} ({ticket.role})
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL - Case Detail */}
          {selectedTicket && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">

              {/* Case Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTicket.title}
                </h2>
                <p className="text-gray-600">
                  {selectedTicket.user} ({selectedTicket.role})
                </p>
              </div>

              {/* Chat Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-yellow-500" />
                  Direct Chat
                </h3>

                <div className="h-56 overflow-y-auto bg-gray-50 border rounded-lg p-4 space-y-3">
                  {chat.map((msg, index) => (
                    <div
                      key={index}
                      className={`text-sm ${
                        msg.sender === 'Agent'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      <span
                        className={`inline-block px-3 py-2 rounded-lg ${
                          msg.sender === 'Agent'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex mt-3 gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-yellow-500 text-white px-4 rounded-lg hover:bg-yellow-600 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Resolution Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add resolution details..."
                  className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows="4"
                />
              </div>

              {/* Close Case */}
              <button
                onClick={closeCase}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Close Case
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* Priority Badge */
function PriorityBadge({ priority }) {
  const styles = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-blue-100 text-blue-600',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}